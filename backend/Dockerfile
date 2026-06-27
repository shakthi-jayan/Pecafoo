# ============================================
# Pecafoo Backend — Production Dockerfile
# ============================================

# ------------- Builder Stage -------------
FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a predictable location
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ------------- Runtime Stage -------------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libjpeg62-turbo \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Python dependencies from builder (to system site-packages)
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Create non-root user BEFORE collectstatic so files are owned correctly
RUN adduser --disabled-password --gecos '' appuser && \
    mkdir -p /app/staticfiles /app/media /app/logs && \
    chown -R appuser:appuser /app

# Run collectstatic at build time (no DB needed)
RUN SECRET_KEY=build-placeholder \
    DB_ENGINE=django.db.backends.sqlite3 \
    DB_NAME=:memory: \
    DB_USER=x \
    DB_PASSWORD=x \
    DB_HOST=localhost \
    python manage.py collectstatic --noinput 2>/dev/null || true

# Fix ownership after collectstatic
RUN chown -R appuser:appuser /app/staticfiles

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl --fail http://localhost:8000/api/health/ || exit 1

CMD ["sh", "-c", "python manage.py migrate --noinput && daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
