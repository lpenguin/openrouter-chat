#!/bin/bash

# Railway Environment Setup Script
# Run this after deploying both services to Railway

echo "🚀 Railway OpenRouterChat Environment Setup"
echo "==========================================="

echo ""
echo "📋 Required Information:"
echo "1. Backend Railway Domain (e.g., backend-xxx.railway.app)"
echo "2. Frontend Railway Domain (e.g., frontend-xxx.railway.app)"
echo "3. JWT Secret Key"
echo ""

read -p "Enter your Backend Railway domain (without https://): " BACKEND_DOMAIN
read -p "Enter your Frontend Railway domain (without https://): " FRONTEND_DOMAIN
read -p "Enter your JWT secret key: " JWT_SECRET

echo ""
echo "🔧 Environment Variables to Set:"
echo "================================="
echo ""

echo "🖥️  BACKEND SERVICE:"
echo "-------------------"
echo "JWT_SECRET=$JWT_SECRET"
echo "ALLOWED_ORIGINS=https://$FRONTEND_DOMAIN"
echo ""

echo "🌐 FRONTEND SERVICE:"
echo "--------------------"
echo "VITE_API_URL=https://$BACKEND_DOMAIN"
echo ""

echo "📝 Railway CLI Commands:"
echo "========================"
echo ""
echo "# For Backend Service:"
echo "railway variables set JWT_SECRET=\"$JWT_SECRET\""
echo "railway variables set ALLOWED_ORIGINS=\"https://$FRONTEND_DOMAIN\""
echo ""
echo "# For Frontend Service:"
echo "railway variables set VITE_API_URL=\"https://$BACKEND_DOMAIN\""
echo ""

echo "✅ After setting these variables, redeploy both services!"
echo "💡 Tip: Copy and paste the CLI commands above"
