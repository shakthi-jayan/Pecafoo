# ============================================
# Pecafoo Backend - Production Dockerfile
# ============================================

FROM python:3.12-slim

# --------------------------------------------
# Environment
# --------------------------------------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

# --------------------------------------------
# System Dependencies
# --------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------------------
# Python Dependencies
# --------------------------------------------
COPY requirements.txt .

RUN python -m pip install --upgrade pip

RUN pip install -r requirements.txt

# --------------------------------------------
# Copy Application
# --------------------------------------------
COPY . .

# --------------------------------------------
# Create Non-root User
# --------------------------------------------
RUN adduser --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app

USER appuser

# --------------------------------------------
# Port
# --------------------------------------------
EXPOSE 8000

# --------------------------------------------
# Health Check
# --------------------------------------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
CMD curl --fail http://127.0.0.1:8000/api/health/ || exit 1

# --------------------------------------------
# Start Server
# --------------------------------------------
CMD sh -c "\
python manage.py migrate --noinput && \
python manage.py collectstatic --noinput && \
daphne -b 0.0.0.0 -p 8000 config.asgi:application"
