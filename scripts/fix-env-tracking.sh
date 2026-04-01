#!/bin/bash

# Script to completely remove .env files from Git tracking
# Run this on both local and server environments

echo "🔧 Fixing .env file Git tracking..."

# Remove .env files from Git index (stop tracking them)
echo "📝 Removing .env files from Git tracking..."
git rm --cached backend/.env 2>/dev/null || echo "backend/.env not tracked"
git rm --cached frontend/.env 2>/dev/null || echo "frontend/.env not tracked"  
git rm --cached frontend/.env.production 2>/dev/null || echo "frontend/.env.production not tracked"
git rm --cached .env 2>/dev/null || echo "root .env not tracked"

# Remove any .env files from all directories
find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" | while read envfile; do
    echo "🗑️ Removing $envfile from Git tracking..."
    git rm --cached "$envfile" 2>/dev/null || echo "$envfile not tracked"
done

# Remove .env.production files
find . -name ".env.production" -not -path "./node_modules/*" -not -path "./.git/*" | while read envfile; do
    echo "🗑️ Removing $envfile from Git tracking..."
    git rm --cached "$envfile" 2>/dev/null || echo "$envfile not tracked"
done

# Remove .env.local files
find . -name ".env.local" -not -path "./node_modules/*" -not -path "./.git/*" | while read envfile; do
    echo "🗑️ Removing $envfile from Git tracking..."
    git rm --cached "$envfile" 2>/dev/null || echo "$envfile not tracked"
done

# Ensure .gitignore is properly configured
echo "📋 Updating .gitignore files..."

# Update root .gitignore
cat >> .gitignore << 'EOF'

# Environment variables (DO NOT COMMIT)
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
*.env
EOF

# Update backend .gitignore
cat >> backend/.gitignore << 'EOF'

# Environment variables (DO NOT COMMIT)
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
*.env
EOF

# Update frontend .gitignore
cat >> frontend/.gitignore << 'EOF'

# Environment variables (DO NOT COMMIT)
.env
.env.*
!.env.example
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.production
*.env
EOF

echo "✅ Committing .gitignore updates..."
git add .gitignore backend/.gitignore frontend/.gitignore 2>/dev/null

# Check if there are any changes to commit
if git diff --staged --quiet; then
    echo "ℹ️ No .env files were being tracked"
else
    echo "💾 Committing removal of .env files from Git tracking..."
    git commit -m "🔒 Remove all .env files from Git tracking

- Remove .env files from Git index completely
- Update .gitignore files to prevent future tracking
- Ensure environment files remain local only
- Fix cPanel server Git tracking issues"
fi

echo ""
echo "🎉 .env files are now properly ignored by Git!"
echo ""
echo "📋 Next steps:"
echo "1. Create your .env files from .env.example templates"
echo "2. Never commit .env files to Git"
echo "3. Use environment variables or server configuration for production"
echo ""
echo "🔍 Verification:"
echo "Run 'git status' - you should not see any .env files listed"
echo ""