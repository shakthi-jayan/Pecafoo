"""
Pecafoo Food Delivery — Celery Application
============================================
Configures Celery with Redis broker for background task processing.
"""

import os
from celery import Celery


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

app = Celery("pecafoo")


app.config_from_object("django.conf:settings", namespace="CELERY")


app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Simple debug task to verify Celery is running."""
    print(f"Debug task — Request: {self.request!r}")
