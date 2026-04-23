# ============================================
# Pecafoo Backend — Dockerfile
# ============================================
# Multi-stage build for Django + Daphne (ASGI)
# ============================================

FROM python:3.12-slim AS base

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2, Pillow, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Install Python dependencies ──
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy application code ──
COPY . .

# ── Collect static files ──
RUN python manage.py collectstatic --noinput || true

# ── Create non-root user ──
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# ── Expose port ──
EXPOSE 8000

# ── Health check ──
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health/')" || exit 1

# ── Run with Daphne (ASGI) for WebSocket support ──
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
