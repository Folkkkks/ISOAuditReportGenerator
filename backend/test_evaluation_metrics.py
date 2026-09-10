import unittest

from backend.services.evaluation_metrics import calculate_metrics


def row(expected, predicted=None, status='awaiting_auditor_review', supported=True):
    result = {'expected': {'classification': expected, 'clause_ref': '4.3',
                           'requirement_text_id': 'ISO27001-4.3'}, 'status': status}
    if predicted:
        result['prediction'] = {'classification': predicted, 'clause_ref': '4.3',
                                'requirement_text_id': 'ISO27001-4.3'}
        result['finding_judgment'] = {
            'verdict': 'supported' if supported else 'unsupported',
            'evidence_supported': supported, 'reference_valid': True,
            'unsupported_claims': [] if supported else ['Not established'],
        }
    return result


class EvaluationMetricsTests(unittest.TestCase):
    def test_perfect_all_four_classes(self):
        labels = ['major_nc', 'minor_nc', 'observation', 'ofi']
        metrics = calculate_metrics([row(label, label) for label in labels])
        self.assertEqual(metrics['classification_macro_f1'], 1)
        self.assertEqual(metrics['clause_pair_accuracy'], 1)

    def test_errors_remain_in_denominator_and_false_negatives(self):
        metrics = calculate_metrics([row('major_nc', 'major_nc'), row('minor_nc', status='error')])
        self.assertEqual(metrics['classification_accuracy'], .5)
        self.assertEqual(metrics['prediction_coverage'], .5)
        self.assertEqual(metrics['per_class']['minor_nc']['fn'], 1)
        self.assertEqual(metrics['classification_macro_f1'], .25)

    def test_confusion_creates_false_positive_and_false_negative(self):
        metrics = calculate_metrics([row('minor_nc', 'major_nc')])
        self.assertEqual(metrics['per_class']['major_nc']['fp'], 1)
        self.assertEqual(metrics['per_class']['minor_nc']['fn'], 1)

    def test_blocked_unsupported_major_is_counted_but_not_released(self):
        metrics = calculate_metrics([row('major_nc', 'major_nc', 'needs_revision', False)])
        self.assertEqual(metrics['automated_unsupported_major_count'], 1)
        self.assertEqual(metrics['released_automated_unsupported_major_count'], 0)
        self.assertEqual(metrics['automated_grounding_score'], 0)

    def test_no_judge_output_is_unknown_not_zero_unsupported(self):
        metrics = calculate_metrics([row('major_nc', status='error')])
        self.assertIsNone(metrics['automated_unsupported_major_count'])
        self.assertIsNone(metrics['automated_grounding_score'])

    def test_reference_id_must_match_too(self):
        case = row('major_nc', 'major_nc')
        case['prediction']['requirement_text_id'] = 'wrong'
        self.assertEqual(calculate_metrics([case])['clause_pair_accuracy'], 0)


if __name__ == '__main__':
    unittest.main()
