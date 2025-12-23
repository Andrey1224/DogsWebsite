#!/bin/bash
echo "=== Email Configuration Check ==="
echo ""
echo "🔑 RESEND_API_KEY: ${RESEND_API_KEY:+SET (hidden)}"
echo "📧 RESEND_FROM_EMAIL: ${RESEND_FROM_EMAIL:-<empty>}"
echo "👤 OWNER_EMAIL: ${OWNER_EMAIL:-<empty>}"
echo "📞 NEXT_PUBLIC_CONTACT_EMAIL: ${NEXT_PUBLIC_CONTACT_EMAIL:-<empty>}"
echo "📱 NEXT_PUBLIC_CONTACT_PHONE: ${NEXT_PUBLIC_CONTACT_PHONE:-<empty>}"
echo "🚦 RESEND_DELIVERY_MODE: ${RESEND_DELIVERY_MODE:-auto (default)}"
echo ""
if [ -z "$RESEND_API_KEY" ]; then
  echo "❌ ERROR: RESEND_API_KEY not set!"
  exit 1
fi
if [ -z "$OWNER_EMAIL" ]; then
  echo "⚠️  WARNING: OWNER_EMAIL not set!"
fi
echo "✅ Configuration looks good!"
