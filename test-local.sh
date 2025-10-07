#!/bin/bash

# Local testing script for Windows License Emailer Lambda
echo "🧪 Windows License Emailer - Local Testing"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env file from example..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your SMTP credentials."
    echo "   Edit .env file and run this script again."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "📧 SMTP Configuration:"
echo "   Host: $SMTP_HOST"
echo "   Port: $SMTP_PORT"
echo "   Secure: $SMTP_SECURE"
echo "   User: $SMTP_USER"
echo "   Pass: ${SMTP_PASS:+***}"

if [ -z "$SMTP_PASS" ] || [ "$SMTP_PASS" = "your-app-password" ]; then
    echo ""
    echo "❌ SMTP_PASS not configured properly!"
    echo "   Please set your actual SMTP password in .env file"
    exit 1
fi

echo ""
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "🚀 Running local test..."
npm run test:local

echo ""
echo "✅ Local testing completed!"
echo ""
echo "💡 Tips:"
echo "   - Edit src/local-test.ts to modify test data"
echo "   - Use 'npm run test:local:watch' for auto-reload testing"
echo "   - Check your email inbox for the test email"
