"""Offline development evaluation: python -m backend.evaluate --dry-run."""
import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from backend.services.evaluation_data import (
    EVALUATION_DIR, PROJECT_ROOT, build_gold_report, load_evaluation_dataset,
)
from backend.services.evaluation_metrics import calculate_metrics


def write_json(path: Path, payload: dict) -> None:
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def save_results(directory: Path, result: dict) -> None:
    result['metrics'] = calculate_metrics(result['cases'])
    write_json(directory / 'results.json', result)
    metrics = result['metrics']
    lines = [
        '# Iteration 2 evaluation', '',
        f"Run: {result['run_id']}; status: {result['status']}", '',
        f"Gold review status: **{result['gold_review_status']}**", '',
        f"Selected {len(result['cases'])} of {result['dataset_size']} cases.", '',
        'Development evaluation; these cases are not a held-out benchmark.', '',
        'Classification and clause scores compare predictions against authored gold labels. '
        'Draft gold labels require human review. Judge scores are automated proxies, '
        'not independent confirmation of correctness or final PRD compliance.', '',
        '| Metric | Value |', '| --- | ---: |',
    ]
    for key, value in metrics.items():
        if key != 'per_class':
            rendered = 'N/A' if value is None else f'{value:.4f}' if isinstance(value, float) else str(value)
            lines.append(f'| {key} | {rendered} |')
    lines += ['', 'Macro F1 averages all four classes (zero when undefined). '
              'Missing outputs count as false negatives. Classification accuracy and '
              'exact clause + requirement ID accuracy use all selected cases as denominator. '
              'Judge rates use only judged findings; major rate uses only judged major findings.', '',
              'Blocked drafts remain in evaluation and results.json for diagnostics. '
              'The public pipeline response still hides blocked reports. '
              'A pipeline exception has no scored prediction, even if an intermediate draft existed.', '',
              '| Class | Support | TP | FP | FN | F1 |', '| --- | ---: | ---: | ---: | ---: | ---: |']
    for label, item in metrics['per_class'].items():
        lines.append(f"| {label} | {item['support']} | {item['tp']} | {item['fp']} | {item['fn']} | {item['f1']:.4f} |")
    lines += ['', '| Case | Expected | Predicted | Status |', '| --- | --- | --- | --- |']
    for row in result['cases']:
        expected = row['expected']
        prediction = row.get('prediction') or {}
        lines.append(f"| {row['case_id']} | {expected['classification']} / {expected['clause_ref']} | "
                     f"{prediction.get('classification', 'N/A')} / {prediction.get('clause_ref', 'N/A')} | {row['status']} |")
    lines += ['', 'Source provenance, annotation notes, hashes, timings and error types are in results.json. '
              'Reference report summaries are templates; narrative quality and corrective actions are not scored.', '']
    (directory / 'eval_report.md').write_text('\n'.join(lines), encoding='utf-8')


def evaluate_cases(cases, execute, directory: Path, result: dict) -> int:
    """Gold is used only for scoring; execute receives the input request alone."""
    save_results(directory, result)
    rows_by_id = {row['case_id']: row for row in result['cases']}
    for case in cases:
        row = rows_by_id[case.case_id]
        print(f"Evaluating {case.case_id}...", flush=True)
        started = datetime.now(timezone.utc)
        try:
            execution = execute(case.request)
            report = execution.draft_report
            judgments = execution.response.judgment.judgments
            if len(report.findings) != 1 or len(judgments) != 1:
                raise ValueError('Expected one finding and judgment per case')
            if report.findings[0].finding_id != judgments[0].finding_id:
                raise ValueError('Finding and judgment IDs do not match')
            row.update(
                status=execution.response.status,
                prediction=report.findings[0].model_dump(mode='json'),
                finding_judgment=judgments[0].model_dump(mode='json'),
                diagnostic_draft=report.model_dump(mode='json'),
                api_response=execution.response.model_dump(mode='json'),
            )
        except KeyboardInterrupt:
            row['status'] = 'interrupted'
            result['status'] = 'interrupted'
            save_results(directory, result)
            return 130
        except Exception as error:
            error_type = type(error).__name__

            if error_type == "RateLimitError":
                row.update(
                    status="pending",
                    last_error_type=error_type,
                )
                result["status"] = "rate_limited"
                save_results(directory, result)
                print("Quota reached. Evaluation stopped.", flush=True)
                return 75

            # Store only the error type, not sensitive provider details.
            row.update(status="error", error_type=error_type)
            print(f"  Failed: {type(error).__name__}", flush=True)
        row['duration_seconds'] = (datetime.now(timezone.utc) - started).total_seconds()
        save_results(directory, result)
    result['status'] = 'completed_with_errors' if any(r['status'] == 'error' for r in result['cases']) else 'completed'
    save_results(directory, result)
    return 1 if result['status'] == 'completed_with_errors' else 0


def git_state() -> dict:
    def read(*args):
        try:
            return subprocess.run(['git', *args], cwd=PROJECT_ROOT, capture_output=True,
                                  text=True, check=True, timeout=5).stdout.strip()
        except (OSError, subprocess.SubprocessError):
            return None
    status = read('status', '--porcelain')
    return {'commit': read('rev-parse', 'HEAD'), 'dirty': None if status is None else bool(status)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dry-run', action='store_true', help='Validate data only; no AI calls or output files')
    parser.add_argument('--limit', type=int, help='Run the first N cases (default: all)')
    parser.add_argument('--resume', type=Path, help='Continue pending/error cases in an existing run directory')
    parser.add_argument('--inputs', type=Path, default=EVALUATION_DIR / 'inputs.json')
    parser.add_argument('--gold', type=Path, default=EVALUATION_DIR / 'gold.json')
    parser.add_argument('--output-dir', type=Path, default=PROJECT_ROOT / 'reports' / 'evaluation')
    args = parser.parse_args()
    dataset = load_evaluation_dataset(args.inputs, args.gold)
    if args.limit is not None and not 1 <= args.limit <= len(dataset.cases):
        parser.error('--limit must be between 1 and the dataset size')
    if args.resume is not None and args.limit is not None:
        parser.error('--resume and --limit cannot be used together')
    cases = dataset.cases[:args.limit]
    print(f'Validated {len(dataset.cases)} input/gold pairs; selected {len(cases)}.')
    print(f'Gold review status: {dataset.gold.review_status}')
    if args.dry_run:
        print('Dry run passed. No AI calls made; no files written.')
        return 0
    # Lazy imports keep validation and metric tests independent of the AI SDK.
    from backend.services.pipeline import execute_report_pipeline
    from backend.agents.nc_classifier import DEFAULT_MODEL
    if args.resume is not None:
        directory = args.resume.resolve()
        result = json.loads((directory / 'results.json').read_text(encoding='utf-8'))
        if result['dataset_id'] != dataset.gold.dataset_id or result['hashes'] != dataset.hashes:
            raise ValueError('Cannot resume: dataset or knowledge base changed')
        rows_by_id = {row['case_id']: row for row in result['cases']}
        cases = [case for case in dataset.cases
                 if case.case_id in rows_by_id
                 and rows_by_id[case.case_id]['status'] in {'pending', 'interrupted', 'error'}]
        for case in cases:
            row = rows_by_id[case.case_id]
            expected = row['expected']
            row.clear()
            row.update(case_id=case.case_id, status='pending', expected=expected)
        result['status'] = 'running'
        result['resumed_at'] = datetime.now(timezone.utc).isoformat()
        if not cases:
            print('No pending, interrupted or error cases remain.')
            return 0
    else:
        run_id = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') + '-' + uuid4().hex[:8]
        directory = args.output_dir / run_id
        directory.mkdir(parents=True, exist_ok=False)
        result = {
            'run_id': run_id, 'status': 'running', 'model': DEFAULT_MODEL,
            'git': git_state(), 'dataset_id': dataset.gold.dataset_id,
            'dataset_size': len(dataset.cases), 'gold_review_status': dataset.gold.review_status,
            'annotation_note': dataset.gold.annotation_note, 'hashes': dataset.hashes,
            'input_snapshot': json.loads(args.inputs.read_text(encoding='utf-8-sig')),
            'gold_snapshot': dataset.gold.model_dump(mode='json'),
            'cases': [{'case_id': case.case_id, 'status': 'pending',
                       'expected': case.gold.model_dump(mode='json')} for case in cases],
        }
        write_json(directory / 'gold_reports.json', {
            'review_status': dataset.gold.review_status,
            'note': 'Schema projections of authored annotations; summaries are templates, not reviewed narrative gold.',
            'cases': [{'case_id': case.case_id, 'report': build_gold_report(case).model_dump(mode='json')} for case in cases],
        })
    code = evaluate_cases(cases, execute_report_pipeline, directory, result)
    print(f"Evaluation status: {result['status']}")
    print(f'Report: {directory / "eval_report.md"}')
    return code


if __name__ == '__main__':
    raise SystemExit(main())
