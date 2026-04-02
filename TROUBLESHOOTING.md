# Production Troubleshooting Guide

## Issue: 404 Errors on Login

### Problem

Getting 404 errors when trying to login:

- `/api/auth/login:1 Failed to load resource: the server responded with a status of 404`
- Favicon files also showing 404 errors

### Root Cause

The frontend was built with development environment variables instead of production ones.

### Solution ✅

1. **Rebuild Frontend with Production Environment**:

   ```bash
   cd frontend
   npm run build:prod
   ```

2. **Verify Production Environment is Active**:
   Check that `frontend/.env` contains:

   ```env
   VITE_API_URL=https://cs-cheresultbackend.abdulaki.com/api
   VITE_FRONTEND_URL=https://cs-checkresult.com.abdulaki.com
   ```

3. **Deploy Updated Build**:
   Upload the contents of `frontend/dist/` to your web server.

### Backend Status ✅

Backend is confirmed running and accessible:

- URL: https://cs-cheresultbackend.abdulaki.com/api
- Health check: ✅ Passing

## Common Issues & Solutions

### 1. API 404 Errors

**Symptoms**: All API calls return 404
**Cause**: Frontend using wrong API URL
**Fix**: Rebuild with `npm run build:prod`

### 2. CORS Errors

**Symptoms**: "Access-Control-Allow-Origin" errors
**Cause**: Backend not configured for production frontend URL
**Fix**: Update backend `.env` with `CLIENT_URL=https://cs-checkresult.com.abdulaki.com`

### 3. Favicon 404 Errors

**Symptoms**: Browser console shows favicon 404s
**Status**: ✅ Fixed - Updated HTML to use only SVG favicon

### 4. Environment Variables Not Working

**Symptoms**: App behaves like development mode
**Cause**: Wrong environment file used during build
**Fix**: Use `npm run build:prod` instead of `npm run build`

## Verification Steps

### 1. Test Backend Connectivity

```bash
node test-backend.js
```

Should show: ✅ Health check response: 200

### 2. Check Frontend Environment

Look at `frontend/.env` - should contain production URLs

### 3. Verify Build Output

After `npm run build:prod`, check that `frontend/dist/` contains updated files

### 4. Test Production URLs

- Frontend: https://cs-checkresult.com.abdulaki.com/
- Backend: https://cs-cheresultbackend.abdulaki.com/api/health

## Admin Login

- URL: https://cs-checkresult.com.abdulaki.com/admin/login
- Username: `abdulaki`
- Password: `Alhamdulillaah##91`
