#!/bin/bash
# ============================================
# Pecafoo SSL/TLS Setup (Let's Encrypt)
# Target: machodev.com
# ============================================
set -e

echo "🔒 Setting up SSL for machodev.com..."

# ── Install Certbot ──
echo "📦 Installing Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# ── Obtain Certificate ──
echo ""
echo "🔑 Obtaining SSL certificate..."
sudo certbot --nginx \
    -d machodev.com \
    -d www.machodev.com \
    --non-interactive \
    --agree-tos \
    --email admin@machodev.com \
    --redirect

# ── Enable Auto-Renewal ──
echo ""
echo "🔄 Enabling auto-renewal..."
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# ── Verify ──
echo ""
echo "✅ SSL setup complete!"
echo "🔒 Certificate location: /etc/letsencrypt/live/machodev.com/"
echo "🔄 Auto-renewal: enabled (certbot.timer)"
echo ""
echo "Test renewal with: sudo certbot renew --dry-run"
