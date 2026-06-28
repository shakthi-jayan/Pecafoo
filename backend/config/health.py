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
        from django.conf import settings
        from firebase_admin import _apps
        
        db_ok = True
        cache_ok = True
        firebase_ok = bool(_apps)
        
        dependencies = {}

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            dependencies["database"] = "connected"
        except Exception:
            db_ok = False
            dependencies["database"] = "disconnected"

        try:
            cache.set("health", "ok", 30)
            if cache.get("health") == "ok":
                dependencies["redis"] = "connected"
            else:
                dependencies["redis"] = "error"
                cache_ok = False
        except Exception:
            cache_ok = False
            dependencies["redis"] = "disconnected"
            
        dependencies["firebase"] = "initialized" if firebase_ok else "uninitialized"

        overall = db_ok and cache_ok and firebase_ok

        return Response(
            {
                "status": "healthy" if overall else "degraded",
                "version": getattr(settings, "VERSION", "unknown"),
                "timestamp": timezone.now(),
                "dependencies": dependencies,
            },
            status=200 if overall else 503,
        )
