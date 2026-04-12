#!/bin/bash

# Build script for cPanel deployment
# This script handles common cPanel build issues

echo "🚀 Starting cPanel build process..."

# Check Node version
echo "📦 Node version: $(node -v)"
echo "📦 NPM version: $(npm -v)"

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
rm -rf node_modules/.vite

# Install dependencies with legacy peer deps (helps with cPanel)
echo "📥 Installing dependencies..."
npm install --legacy-peer-deps

# Increase Node memory limit for build (helps prevent out of memory errors)
echo "🔨 Building with increased memory limit..."
export NODE_OPTIONS="--max-old-space-size=4096"

# Build the project
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output is in the 'dist' folder"
    ls -lh dist/
else
    echo "❌ Build failed - dist folder not created"
    exit 1
fi
