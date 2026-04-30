from django.core.cache import cache
from django.db import connection
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


class HealthCheckView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = []

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
            checks["database"] = str(exc)

        try:
            cache.set("health", "ok", 30)
            checks["cache"] = "ok" if cache.get("health") == "ok" else "error"
            if checks["cache"] != "ok":
                cache_ok = False
        except Exception as exc:
            cache_ok = False
            checks["cache"] = str(exc)

        overall = db_ok and cache_ok

        return Response(
            {
                "status": "ok" if overall else "degraded",
                "timestamp": timezone.now(),
                "checks": checks,
            },
            status=200 if overall else 503,
        )
