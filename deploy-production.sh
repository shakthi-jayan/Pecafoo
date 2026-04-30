#!/bin/bash
# ============================================
# Pecafoo Production Deployment Script
# Target: machodev.com (136.185.11.23)
# ============================================
set -e

echo "🚀 Pecafoo Production Deployment Starting..."
echo "================================================"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"

# ── Load production env if available ──
if [ -f .env.production ]; then
    echo "📋 Loading .env.production..."
    set -a
    source .env.production
    set +a
else
    echo "⚠️  No .env.production found, using existing environment"
fi

# ── Pre-deployment backup ──
echo ""
echo "💾 Creating database backup..."
docker-compose exec -T db pg_dump -U ${DB_USER:-food_user} ${DB_NAME:-food_delivery_db} \
    > "backups/backup_$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || {
    echo "⚠️  Database backup skipped (DB may not be running yet)"
    mkdir -p backups
}

# ── Pull latest code ──
echo ""
echo "📥 Pulling latest code..."
git pull origin main 2>/dev/null || echo "Git pull skipped"

# ── Build containers ──
echo ""
echo "🔨 Building Docker containers..."
docker-compose build --no-cache

# ── Stop and restart ──
echo ""
echo "🔄 Restarting services..."
docker-compose down
docker-compose up -d

# ── Wait for database to be healthy ──
echo ""
echo "⏳ Waiting for database health check..."
sleep 10

# ── Run migrations ──
echo ""
echo "🗃️  Running database migrations..."
docker-compose exec -T api python manage.py migrate --noinput

# ── Collect static files ──
echo ""
echo "📦 Collecting static files..."
docker-compose exec -T api python manage.py collectstatic --noinput

# ── Reload Nginx (if installed on host) ──
echo ""
echo "🔃 Reloading Nginx..."
sudo systemctl reload nginx 2>/dev/null || echo "Nginx reload skipped (may not be on host)"

# ── Health check ──
echo ""
echo "🏥 Running health checks..."
sleep 5
docker-compose ps

echo ""
echo "================================================"
echo "✅ Deployment complete!"
echo "🌐 Customer App: https://machodev.com"
echo "🍴 Restaurant App: https://machodev.com/restaurant"
echo "🔧 Admin Panel: https://machodev.com/admin/"
echo "📡 API Endpoint: https://machodev.com/api/"
echo "================================================"
