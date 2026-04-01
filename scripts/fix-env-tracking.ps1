# PowerShell script to completely remove .env files from Git tracking
# Run this on both local and server environments

Write-Host "🔧 Fixing .env file Git tracking..." -ForegroundColor Cyan

# Remove .env files from Git index (stop tracking them)
Write-Host "📝 Removing .env files from Git tracking..." -ForegroundColor Yellow

$envFiles = @(
    "backend/.env",
    "frontend/.env", 
    "frontend/.env.production",
    ".env"
)

foreach ($file in $envFiles) {
    try {
        git rm --cached $file 2>$null
        Write-Host "✅ Removed $file from Git tracking" -ForegroundColor Green
    }
    catch {
        Write-Host "ℹ️ $file not tracked" -ForegroundColor Gray
    }
}

# Find and remove any other .env files
Write-Host "🔍 Searching for other .env files..." -ForegroundColor Yellow

Get-ChildItem -Path . -Name ".env*" -Recurse | Where-Object { 
    $_ -notlike "*node_modules*" -and 
    $_ -notlike "*.git*" -and 
    $_ -notlike "*.env.example*"
} | ForEach-Object {
    try {
        git rm --cached $_ 2>$null
        Write-Host "✅ Removed $_ from Git tracking" -ForegroundColor Green
    }
    catch {
        Write-Host "ℹ️ $_ not tracked" -ForegroundColor Gray
    }
}

# Ensure .gitignore files exist and have proper content
Write-Host "📋 Updating .gitignore files..." -ForegroundColor Yellow

$gitignoreContent = @"

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
"@

# Update .gitignore files
$gitignoreFiles = @(".gitignore", "backend/.gitignore", "frontend/.gitignore")

foreach ($gitignoreFile in $gitignoreFiles) {
    if (Test-Path $gitignoreFile) {
        $currentContent = Get-Content $gitignoreFile -Raw -ErrorAction SilentlyContinue
        if ($currentContent -notlike "*# Environment variables (DO NOT COMMIT)*") {
            Add-Content -Path $gitignoreFile -Value $gitignoreContent
            Write-Host "✅ Updated $gitignoreFile" -ForegroundColor Green
        }
    }
}

Write-Host "✅ Adding .gitignore updates to Git..." -ForegroundColor Yellow
git add .gitignore backend/.gitignore frontend/.gitignore 2>$null

# Check if there are any changes to commit
$hasChanges = git diff --staged --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "💾 Committing removal of .env files from Git tracking..." -ForegroundColor Green
    git commit -m "🔒 Remove all .env files from Git tracking

- Remove .env files from Git index completely  
- Update .gitignore files to prevent future tracking
- Ensure environment files remain local only
- Fix cPanel server Git tracking issues"
} else {
    Write-Host "ℹ️ No .env files were being tracked" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 .env files are now properly ignored by Git!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create your .env files from .env.example templates"
Write-Host "2. Never commit .env files to Git"  
Write-Host "3. Use environment variables or server configuration for production"
Write-Host ""
Write-Host "🔍 Verification:" -ForegroundColor Cyan
Write-Host "Run 'git status' - you should not see any .env files listed"
Write-Host ""