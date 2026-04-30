#!/bin/bash
# ============================================
# Pecafoo Firewall Configuration (UFW)
# Target: machodev.com (136.185.11.23)
# ============================================
set -e

echo "🛡️  Configuring firewall..."

# ── Reset and enable ──
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing

# ── Allow SSH ──
sudo ufw allow 22/tcp comment 'SSH'

# ── Allow HTTP/HTTPS ──
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

# ── Allow Docker internal traffic ──
sudo ufw allow from 172.16.0.0/12 comment 'Docker network'
sudo ufw allow from 192.168.0.0/16 comment 'Docker bridge'

# ── Enable logging ──
sudo ufw logging on

# ── Enable firewall ──
sudo ufw --force enable

# ── Status ──
echo ""
sudo ufw status verbose

echo ""
echo "✅ Firewall configured!"
echo "   ✓ SSH (22/tcp)"
echo "   ✓ HTTP (80/tcp)"
echo "   ✓ HTTPS (443/tcp)"
echo "   ✓ Docker internal networks"
echo "   ✓ All other incoming traffic blocked"
