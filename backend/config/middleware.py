import logging
import time


logger = logging.getLogger("pecafoo.request")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = None

        try:
            response = self.get_response(request)
        finally:
            duration_ms = (time.perf_counter() - start) * 1000
            path = request.path

            if not (path.startswith("/static/") or path.startswith("/media/")):
                status_code = getattr(response, "status_code", 500)
                logger.info(
                    "%s %s -> %s (%.2f ms)",
                    request.method,
                    path,
                    status_code,
                    duration_ms,
                )

        return response
