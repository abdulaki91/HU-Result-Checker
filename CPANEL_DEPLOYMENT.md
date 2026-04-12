# cPanel Deployment Guide

This guide helps you deploy your React + Node.js application to cPanel successfully.

## Problem: Build Fails on cPanel

If `npm run build` works locally but fails on cPanel, it's usually due to:

1. **Node version mismatch** - cPanel has older Node.js
2. **Memory limits** - Build runs out of memory
3. **Dependency conflicts** - Different npm versions

## Solution: Multiple Deployment Options

### Option 1: Build Locally (Recommended - Fastest)

This is the most reliable method:

```bash
# 1. Build locally
cd frontend
npm run build

# 2. Upload only the 'dist' folder to cPanel
# Upload to: public_html/frontend/dist/
```

**Pros:**

- Always works
- Faster deployment
- No server resource usage

**Cons:**

- Need to rebuild and upload after each change

---

### Option 2: Build on cPanel with Script

Use the provided build script that handles common issues:

```bash
# 1. SSH into cPanel or use Terminal in cPanel
cd ~/your-repo-path/frontend

# 2. Make script executable
chmod +x build-cpanel.sh

# 3. Run the build script
./build-cpanel.sh
```

The script will:

- Check Node/NPM versions
- Clean previous builds
- Install dependencies with legacy peer deps
- Build with increased memory limit
- Verify build success

---

### Option 3: Manual Build on cPanel

If the script doesn't work, try these steps:

```bash
# 1. SSH into cPanel
cd ~/your-repo-path/frontend

# 2. Clean everything
rm -rf dist
rm -rf node_modules/.vite
rm -rf node_modules

# 3. Check Node version (should be 16+ for Vite)
node -v

# 4. If Node is too old, use nvm to switch
nvm install 18
nvm use 18

# 5. Install dependencies
npm install --legacy-peer-deps

# 6. Build with memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# 7. Verify build
ls -lh dist/
```

---

## Common Issues & Solutions

### Issue 1: "JavaScript heap out of memory"

**Solution:** Increase Node memory limit

```bash
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

Or use the build:cpanel script:

```bash
npm run build:cpanel
```

---

### Issue 2: Node version too old

**Error:** `Vite requires Node.js version 14.18+`

**Solution:** Use Node Version Manager (nvm)

```bash
# Install nvm (if not installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc

# Install Node 18
nvm install 18
nvm use 18
nvm alias default 18

# Verify
node -v  # Should show v18.x.x
```

---

### Issue 3: Dependency conflicts

**Error:** `ERESOLVE unable to resolve dependency tree`

**Solution:** Use legacy peer deps (already configured in .npmrc)

```bash
npm install --legacy-peer-deps
npm run build
```

---

### Issue 4: Permission denied

**Error:** `EACCES: permission denied`

**Solution:** Fix permissions

```bash
# Fix node_modules permissions
chmod -R 755 node_modules

# Fix build script permissions
chmod +x build-cpanel.sh
```

---

## Deployment Workflow

### For Development (Frequent Changes)

**Build locally and upload dist folder:**

```bash
# Local machine
cd frontend
npm run build

# Upload frontend/dist/* to cPanel:
# public_html/frontend/dist/
```

### For Production (Stable Releases)

**Build on server:**

```bash
# cPanel SSH
cd ~/your-repo-path
git pull origin main

cd frontend
./build-cpanel.sh
```

---

## File Structure on cPanel

```
public_html/
├── .htaccess                    # Root htaccess (already configured)
├── frontend/
│   └── dist/                    # Built React app
│       ├── index.html
│       ├── assets/
│       └── .htaccess           # Frontend htaccess (already configured)
└── backend/                     # Node.js backend
    ├── index.js
    ├── .env                     # Environment variables
    └── ...
```

---

## Environment Variables

Make sure these are set correctly:

### Frontend (.env)

```env
VITE_API_URL=https://cs-cheresultbackend.abdulaki.com
```

### Backend (.env on cPanel)

```env
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_USER=abdulaki_abdulaki
DB_PASSWORD="Alhamdulillaah##91"
DB_NAME=abdulaki_student_results
DB_PORT=3306
CLIENT_URL=https://cs-checkresult.com.abdulaki.com
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-1774931245246
```

---

## Quick Reference Commands

```bash
# Check versions
node -v
npm -v

# Clean build
rm -rf dist node_modules/.vite

# Install dependencies
npm install --legacy-peer-deps

# Build with memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or use the script
./build-cpanel.sh

# Verify build
ls -lh dist/
```

---

## Troubleshooting Checklist

- [ ] Node version is 16+ (check with `node -v`)
- [ ] NPM version is 8+ (check with `npm -v`)
- [ ] `.npmrc` file exists in frontend folder
- [ ] Environment variables are set correctly
- [ ] Previous build artifacts are cleaned (`rm -rf dist`)
- [ ] Dependencies are installed (`npm install --legacy-peer-deps`)
- [ ] Memory limit is increased (`export NODE_OPTIONS="--max-old-space-size=4096"`)
- [ ] Build script has execute permissions (`chmod +x build-cpanel.sh`)

---

## Recommended Approach

**For your situation, I recommend Option 1 (Build Locally):**

1. Always build on your local machine
2. Upload only the `dist` folder to cPanel
3. This avoids all server-side build issues
4. Faster and more reliable

**Steps:**

```bash
# Local
cd frontend
npm run build

# Upload frontend/dist/* to:
# cPanel: public_html/frontend/dist/
```

This is what you're already doing successfully, so continue with this approach!

---

## Need Help?

If you still face issues:

1. Check Node version on cPanel: `node -v`
2. Check error logs: `cat ~/.npm/_logs/*.log`
3. Try building with verbose output: `npm run build --verbose`
