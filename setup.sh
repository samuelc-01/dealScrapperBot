#!/bin/bash
set -e

echo "📦 Deal Scraper Bot — Setup"

# 1. Copy env
if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Edit .env with your real credentials before running."
else
  echo ".env already exists, skipping."
fi

# 2. Create data directory
mkdir -p data
echo "✓ data/ directory ready"

# 3. Install deps
if [ -f pnpm-lock.yaml ]; then
  echo "Installing with pnpm..."
  pnpm install
elif [ -f bun.lock ]; then
  echo "Installing with bun..."
  bun install
else
  echo "Installing with npm..."
  npm install
fi

# 4. Typecheck
echo "Running typecheck..."
npm run typecheck

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your BOT_TOKEN, ADMIN_ID, and CHAT_ID"
echo "  2. Run: npm run dev"
