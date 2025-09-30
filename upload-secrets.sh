#!/bin/bash

# Make sure you have your .env.local file with the actual values
source .env.local

echo "Uploading secrets to Cloudflare Workers (production environment)..."

echo "$TELEGRAM_BOT_TOKEN" | npx wrangler secret put TELEGRAM_BOT_TOKEN --env production
echo "$TELEGRAM_ADMIN_CHAT_ID" | npx wrangler secret put TELEGRAM_ADMIN_CHAT_ID --env production
echo "$RESEND_API_KEY" | npx wrangler secret put RESEND_API_KEY --env production
echo "$PAYNOW_UEN" | npx wrangler secret put PAYNOW_UEN --env production
echo "$OPENAI_API_KEY" | npx wrangler secret put OPENAI_API_KEY --env production
echo "$ADMIN_API_KEY" | npx wrangler secret put ADMIN_API_KEY --env production
echo "$INTERNAL_API_KEY" | npx wrangler secret put INTERNAL_API_KEY --env production

echo "All secrets uploaded to production environment!"