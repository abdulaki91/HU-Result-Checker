#!/bin/bash

# Production Deployment Script
# This script builds the frontend for production

echo "🚀 Starting production deployment..."

# Build frontend for production
echo "📦 Building frontend..."
cd frontend
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo "📁 Built files are in frontend/dist/"
    echo ""
    echo "🌐 Production URLs:"
    echo "   Frontend: https://cs-checkresult.com.abdulaki.com/"
    echo "   Backend:  https://cs-cheresultbackend.abdulaki.com/api"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Upload frontend/dist/ contents to your web server"
    echo "   2. Ensure backend is running with production .env"
    echo "   3. Test the deployment"
else
    echo "❌ Frontend build failed!"
    exit 1
fi