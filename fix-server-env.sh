#!/bin/bash

# Script to fix .env file tracking on cPanel server
# Upload this file to your server and run it

echo "🔧 Fixing .env file Git tracking on server..."

# Remove .env files from Git tracking on server
echo "📝 Removing .env files from Git tracking..."

# Remove common .env files from tracking
git rm --cached backend/.env 2>/dev/null && echo "✅ Removed backend/.env" || echo "ℹ️ backend/.env not tracked"
git rm --cached frontend/.env 2>/dev/null && echo "✅ Removed frontend/.env" || echo "ℹ️ frontend/.env not tracked"
git rm --cached frontend/.env.production 2>/dev/null && echo "✅ Removed frontend/.env.production" || echo "ℹ️ frontend/.env.production not tracked"
git rm --cached .env 2>/dev/null && echo "✅ Removed root .env" || echo "ℹ️ root .env not tracked"

# Find and remove any other .env files
echo "🔍 Finding other .env files..."
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*" -not -name "*.example*" | while read envfile; do
    git rm --cached "$envfile" 2>/dev/null && echo "✅ Removed $envfile" || echo "ℹ️ $envfile not tracked"
done

# Ensure .gitignore files have proper content
echo "📋 Ensuring .gitignore files are properly configured..."

# Check if .gitignore exists and add .env rules if missing
for gitignore_file in ".gitignore" "backend/.gitignore" "frontend/.gitignore"; do
    if [ -f "$gitignore_file" ]; then
        if ! grep -q "^\.env$" "$gitignore_file"; then
            echo "" >> "$gitignore_file"
            echo "# Environment variables (DO NOT COMMIT)" >> "$gitignore_file"
            echo ".env" >> "$gitignore_file"
            echo ".env.*" >> "$gitignore_file"
            echo "!.env.example" >> "$gitignore_file"
            echo ".env.local" >> "$gitignore_file"
            echo ".env.production" >> "$gitignore_file"
            echo "*.env" >> "$gitignore_file"
            echo "✅ Updated $gitignore_file"
        else
            echo "ℹ️ $gitignore_file already configured"
        fi
    fi
done

# Add .gitignore changes
git add .gitignore backend/.gitignore frontend/.gitignore 2>/dev/null

# Commit the changes if there are any
if ! git diff --staged --quiet 2>/dev/null; then
    echo "💾 Committing .env removal from Git tracking..."
    git commit -m "🔒 Remove .env files from Git tracking on server

- Stop tracking .env files to prevent sensitive data commits
- Update .gitignore to prevent future .env file tracking
- Fix cPanel server environment file security"
    echo "✅ Changes committed"
else
    echo "ℹ️ No changes to commit"
fi

echo ""
echo "🎉 .env files should now be ignored by Git on server!"
echo ""
echo "📋 Verification:"
echo "Run: git status"
echo "You should NOT see .env files in the output"
echo ""
echo "⚠️ Important:"
echo "- Your .env files are still on the server (not deleted)"
echo "- They just won't be tracked by Git anymore"
echo "- Future changes to .env files won't appear in git status"
echo ""