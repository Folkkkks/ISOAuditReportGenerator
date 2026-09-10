import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace

from backend.evaluate import evaluate_cases


class EvaluationRunnerTests(unittest.TestCase):
    def run_cases(self, execute):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        path = Path(directory.name)
        request = object()
        cases = [SimpleNamespace(case_id='CASE-1', request=request)]
        result = {
            'run_id': 'unit-test', 'status': 'running', 'gold_review_status': 'draft',
            'dataset_size': 1,
            'cases': [{'case_id': 'CASE-1', 'status': 'pending', 'expected': {
                'classification': 'minor_nc', 'clause_ref': '4.3',
                'requirement_text_id': 'ISO27001-4.3',
            }}],
        }
        code = evaluate_cases(cases, execute, path, result)
        stored = json.loads((path / 'results.json').read_text(encoding='utf-8'))
        self.assertTrue((path / 'eval_report.md').is_file())
        return code, stored, request

    def test_failed_pipeline_is_saved_without_exception_text(self):
        def execute(request):
            raise RuntimeError('sensitive-provider-text')
        code, stored, _ = self.run_cases(execute)
        self.assertEqual(code, 1)
        self.assertEqual(stored['metrics']['error_cases'], 1)
        self.assertEqual(stored['metrics']['per_class']['minor_nc']['fn'], 1)
        self.assertNotIn('sensitive-provider-text', json.dumps(stored))

    def test_interruption_is_saved(self):
        def execute(request):
            raise KeyboardInterrupt
        code, stored, _ = self.run_cases(execute)
        self.assertEqual(code, 130)
        self.assertEqual(stored['status'], 'interrupted')

    def test_success_receives_input_only_and_saves_prediction(self):
        class Serialized:
            def __init__(self, payload):
                self.payload = payload
                self.__dict__.update(payload)
            def model_dump(self, **kwargs):
                return self.payload
        finding = Serialized(dict(finding_id='F-001', classification='minor_nc',
                                  clause_ref='4.3', requirement_text_id='ISO27001-4.3'))
        judgment = Serialized(dict(finding_id='F-001', verdict='supported',
                                   evidence_supported=True, reference_valid=True, unsupported_claims=[]))
        report = Serialized({'findings': [finding.payload]})
        report.findings = [finding]
        response = Serialized({'status': 'awaiting_auditor_review'})
        response.judgment = SimpleNamespace(judgments=[judgment])
        received = []
        def execute(request):
            received.append(request)
            return SimpleNamespace(draft_report=report, response=response)
        code, stored, request = self.run_cases(execute)
        self.assertEqual(received, [request])
        self.assertEqual(code, 0)
        self.assertEqual(stored['metrics']['classification_accuracy'], 1)


if __name__ == '__main__':
    unittest.main()
