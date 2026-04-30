# ============================================
# PECAFOO BACKEND - STABLE PRODUCTION DOCKERFILE
# ============================================

FROM python:3.12-slim

# ---------------- Python Settings ----------------
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# ---------------- Working Directory ----------------
WORKDIR /app

# ---------------- Install System Packages ----------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# ---------------- Install Python Packages ----------------
COPY requirements.txt .

RUN pip install --upgrade pip setuptools wheel && \
    pip install -r requirements.txt

# ---------------- Copy Project Files ----------------
COPY . .

# ---------------- Static Folder Safety ----------------
RUN mkdir -p /app/staticfiles /app/media

# ---------------- Expose Port ----------------
EXPOSE 8000

# ---------------- Health Check ----------------
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl --fail http://localhost:8000/api/health/ || exit 1

# ---------------- Start Server ----------------
CMD ["sh", "-c", "\
  python manage.py migrate --noinput && \
  python manage.py collectstatic --noinput && \
  daphne -b 0.0.0.0 -p 8000 config.asgi:application \
"]
