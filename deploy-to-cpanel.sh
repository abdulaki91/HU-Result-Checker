#!/bin/bash

# Quick deployment script for cPanel
# This builds locally and prepares files for upload

echo "🚀 Starting deployment preparation..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: frontend directory not found${NC}"
    echo "Please run this script from the project root"
    exit 1
fi

# Build frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
cd frontend

# Clean previous build
rm -rf dist

# Build
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist folder not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📁 Files ready for upload:${NC}"
echo "   frontend/dist/* → Upload to cPanel: public_html/frontend/dist/"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "   1. Upload frontend/dist/* to cPanel"
echo "   2. Make sure .htaccess files are in place"
echo "   3. Test your application"
echo ""
echo -e "${GREEN}✨ Deployment preparation complete!${NC}"

cd ..
