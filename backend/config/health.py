from django.core.cache import cache
from django.db import connection
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        db_ok = True
        cache_ok = True
        checks = {}

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            checks["database"] = "ok"
        except Exception as exc:
            db_ok = False
            checks["database"] = f"error: {exc}"

        try:
            cache_key = "pecafoo_healthcheck"
            cache.set(cache_key, "ok", timeout=30)
            checks["cache"] = "ok" if cache.get(cache_key) == "ok" else "error: cache readback failed"
            if checks["cache"] != "ok":
                cache_ok = False
        except Exception as exc:
            cache_ok = False
            checks["cache"] = f"error: {exc}"

        overall_ok = db_ok and cache_ok
        return Response(
            {
                "status": "ok" if overall_ok else "degraded",
                "service": "pecafoo-backend",
                "timestamp": timezone.now(),
                "checks": checks,
            },
            status=200 if overall_ok else 503,
        )
