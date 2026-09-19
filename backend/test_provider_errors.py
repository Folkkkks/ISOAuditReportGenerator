import unittest

from fastapi import HTTPException

from backend.services.provider_errors import call_ai_safely


class InternalServerError(Exception):
    pass


class RateLimitError(Exception):
    pass


class ProviderErrorTests(unittest.TestCase):
    def test_successful_operation_is_returned(self):
        self.assertEqual(call_ai_safely(lambda: "ok"), "ok")

    def test_high_demand_error_becomes_safe_503(self):
        with self.assertRaises(HTTPException) as raised:
            call_ai_safely(lambda: self._raise(InternalServerError("secret")))

        self.assertEqual(raised.exception.status_code, 503)
        self.assertNotIn("secret", raised.exception.detail)

    def test_rate_limit_error_becomes_429(self):
        with self.assertRaises(HTTPException) as raised:
            call_ai_safely(lambda: self._raise(RateLimitError("provider detail")))

        self.assertEqual(raised.exception.status_code, 429)

    @staticmethod
    def _raise(error):
        raise error


if __name__ == "__main__":
    unittest.main()
