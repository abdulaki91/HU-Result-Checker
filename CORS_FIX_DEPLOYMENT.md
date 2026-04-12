# CORS Fix - New Frontend URL Deployment Guide

## Issue

CORS error when accessing backend from new frontend URL: `https://check-result.abdulaki.com`

## Changes Made

### 1. Frontend Configuration

- **File**: `frontend/.env.production`
- **Change**: Updated `VITE_FRONTEND_URL` from `https://cs-checkresult.com.abdulaki.com` to `https://check-result.abdulaki.com`

### 2. Backend Configuration

- **File**: `backend/.env`
- **Change**: Added `FRONTEND_URL=https://check-result.abdulaki.com`

### 3. Backend CORS Headers

- **File**: `backend/.htaccess`
- **Change**: Updated CORS to allow specific origins including the new URL

## Deployment Steps

### Step 1: Update Backend on Production Server

SSH into your server:

```bash
ssh -p 1219 abdulaki@abdulaki.com
```

Navigate to backend directory:

```bash
cd ~/repositories/HU-Result-Checker/backend
```

Edit the `.env` file on the server:

```bash
nano .env
```

Add this line (or update if exists):

```
FRONTEND_URL=https://check-result.abdulaki.com
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 2: Update .htaccess on Production

The `.htaccess` file has been updated locally. Upload it to the server:

Option A - Using Git (if you have git on server):

```bash
cd ~/repositories/HU-Result-Checker/backend
git pull origin main
```

Option B - Using SCP from your local machine:

```bash
scp -P 1219 backend/.htaccess abdulaki@abdulaki.com:~/repositories/HU-Result-Checker/backend/
```

Option C - Manual edit on server:

```bash
nano ~/repositories/HU-Result-Checker/backend/.htaccess
```

Then paste the updated content from the local file.

### Step 3: Restart Backend Application

Restart the Node.js application via cPanel:

1. Log into cPanel
2. Go to "Setup Node.js App"
3. Find your backend application
4. Click "Restart"

OR via command line:

```bash
touch ~/repositories/HU-Result-Checker/backend/tmp/restart.txt
```

### Step 4: Build and Deploy Frontend

On your local machine:

```bash
cd frontend
npm run build
```

This creates the `dist` folder with the production build.

### Step 5: Upload Frontend to cPanel

1. Log into cPanel
2. Go to File Manager
3. Navigate to the public_html directory for `check-result.abdulaki.com`
4. Delete old files (keep .htaccess if exists)
5. Upload all files from `frontend/dist/` folder
6. Make sure the files are in the root of the domain directory

### Step 6: Verify CORS Configuration

Test the health endpoint to see allowed origins:

```bash
curl https://cs-cheresultbackend.abdulaki.com/api/health
```

Look for the `cors.allowedOrigins` section in the response. It should include:

- `https://check-result.abdulaki.com`
- `http://localhost:5173`

### Step 7: Test the Application

1. Open `https://check-result.abdulaki.com`
2. Try to login as admin
3. Check browser console for any CORS errors
4. If errors persist, check the Network tab to see the exact error

## Troubleshooting

### If CORS errors persist:

1. **Check .env file on server**:

   ```bash
   cat ~/repositories/HU-Result-Checker/backend/.env | grep FRONTEND_URL
   ```

   Should show: `FRONTEND_URL=https://check-result.abdulaki.com`

2. **Check .htaccess is updated**:

   ```bash
   cat ~/repositories/HU-Result-Checker/backend/.htaccess | grep "check-result"
   ```

   Should show the new URL in the SetEnvIf lines

3. **Verify backend is running**:

   ```bash
   curl https://cs-cheresultbackend.abdulaki.com/api/health
   ```

4. **Check Apache error logs** (via cPanel):
   - Go to cPanel → Metrics → Errors
   - Look for any CORS-related errors

5. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
   - Or open in incognito/private mode

### Alternative: Use Wildcard CORS (Less Secure)

If you need a quick fix, you can temporarily use wildcard CORS in `.htaccess`:

```apache
Header always set Access-Control-Allow-Origin "*"
```

But this is less secure and should only be used for testing.

## Environment Variables Summary

### Backend Production (.env on server)

```env
NODE_ENV=production
PORT=5001
DB_HOST=localhost
DB_USER=abdulaki_abdulaki
DB_NAME=abdulaki_student_results
DB_PORT=3306
DB_PASSWORD="Alhamdulillaah##91"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-1774931245246
JWT_EXPIRES_IN=7d
CLIENT_URL=https://check-result.abdulaki.com
FRONTEND_URL=https://check-result.abdulaki.com
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Frontend Production (.env.production)

```env
VITE_API_URL=https://cs-cheresultbackend.abdulaki.com/api
VITE_APP_NAME=Student Result System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PWA=false
VITE_FRONTEND_URL=https://check-result.abdulaki.com
```

## URLs Summary

- **Old Frontend**: `https://cs-checkresult.com.abdulaki.com` (deprecated)
- **New Frontend**: `https://check-result.abdulaki.com` (active)
- **Backend API**: `https://cs-cheresultbackend.abdulaki.com/api` (unchanged)

## Notes

- The backend code automatically reads `FRONTEND_URL` from environment variables
- The `.htaccess` file now explicitly allows the new frontend URL
- Both old and new URLs are allowed during transition period
- You can remove the old URL from `.htaccess` once fully migrated
