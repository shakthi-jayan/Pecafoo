#!/bin/bash
# ============================================
# Pecafoo Git Push (main + production branches)
# ============================================
set -e

echo "📦 Staging all changes..."
git add .

echo "💬 Committing..."
git commit -m "Production: machodev.com HTTPS/WSS + image URL normalization (all existing functions preserved)" || {
    echo "ℹ️  No changes to commit"
}

echo ""
echo "🚀 Pushing to main..."
git push origin main

echo ""
echo "🔀 Switching to production branch..."
git checkout -b production 2>/dev/null || git checkout production

echo "📥 Merging main into production..."
git merge main --no-edit

echo "🚀 Pushing to production..."
git push origin production

echo ""
echo "🔀 Switching back to main..."
git checkout main

echo ""
echo "✅ Pushed to both main and production branches!"
