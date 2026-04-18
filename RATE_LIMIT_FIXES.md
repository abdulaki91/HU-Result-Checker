# Rate Limit Fixes and Max Views UI Access

## Problem Identified

The Device Management page was getting **429 (Too Many Requests)** errors, preventing access to the Max Views adjustment UI.

## Root Cause

1. **Rate limiting too restrictive**: 100 requests per 15 minutes
2. **Production environment overrides**: `start-production.js` was setting low limits
3. **Development hot-reload**: Causing multiple rapid API calls

## Fixes Applied

### 1. ✅ Backend Rate Limit Increases

**File**: `backend/index.js`

- **Before**: 100 requests per 15 minutes
- **After**: 2000 requests per 15 minutes (20x increase)
- **Added**: Environment variable support
- **Added**: Admin route bypass (temporary)

**File**: `backend/start-production.js`

- **Before**: `RATE_LIMIT_MAX_REQUESTS = "100"`
- **After**: `RATE_LIMIT_MAX_REQUESTS = "2000"`

### 2. ✅ Admin Route Bypass

**Added to rate limiter**:

```javascript
skip: (req) => {
  return req.path.startsWith("/api/admin/");
};
```

This temporarily bypasses rate limiting for all admin routes.

### 3. ✅ Enhanced Debug UI

**File**: `frontend/src/pages/admin/DeviceManagementPage.jsx`

- **Added**: Offline mode max views adjustment
- **Added**: Quick set input field
- **Added**: Direct API call button
- **Added**: Error handling and feedback

## How to Access Max Views UI Now

### Method 1: Yellow Debug Section (Recommended)

1. Go to `/admin/devices`
2. Look for **yellow debug box** at the top
3. Use the **"Quick Set"** input field:
   - Enter desired max views (1-50)
   - Click **"Update All"** button
4. Check console for success/error messages

### Method 2: Purple Button (If Rate Limits Fixed)

1. Go to `/admin/devices`
2. Look for purple **"Max Views (6)"** button
3. Click to open modal

### Method 3: Modal Dialog

1. Click any Max Views button
2. Modal opens with:
   - Current setting display
   - Number input (1-50)
   - Update All button

## Server Restart Required

**Important**: The backend changes require a server restart to take effect:

```bash
# Stop current server
pm2 stop all  # or kill the process

# Start with new configuration
node backend/start-production.js
# or
pm2 start backend/start-production.js
```

## Expected Behavior After Restart

### ✅ Should Work:

- Device Management page loads without 429 errors
- Yellow debug section is always visible
- Quick Set input allows immediate max views adjustment
- Console shows success messages
- All devices get updated simultaneously

### 🔍 Debugging:

- Check browser console for API call results
- Look for rate limiting bypass message in server logs
- Verify environment variables are loaded correctly

## Rate Limiting Configuration

### New Limits:

- **Requests**: 2000 per 15 minutes (vs 100 before)
- **Admin Routes**: Bypassed completely
- **Window**: 15 minutes (unchanged)
- **Environment**: Configurable via `RATE_LIMIT_MAX_REQUESTS`

### Logging:

Server will show:

```
🔒 Rate limiting configured: 2000 requests per 15 minutes
🔓 Admin routes bypass rate limiting
```

## Fallback Options

If rate limiting still causes issues:

### Option 1: Disable Rate Limiting Temporarily

In `backend/index.js`, comment out:

```javascript
// app.use("/api/", limiter);
```

### Option 2: Use Direct Database Access

Run the test script:

```bash
node backend/scripts/testMaxViewsSystem.js
```

### Option 3: Manual Database Update

```sql
UPDATE device_views SET maxViews = 10 WHERE 1=1;
```

## Testing the Fix

1. **Restart the server** with new configuration
2. **Clear browser cache** (Ctrl+F5)
3. **Go to** `/admin/devices`
4. **Look for** yellow debug section
5. **Try** Quick Set input with value like 10
6. **Check** console for success message
7. **Verify** devices show new max views

The Max Views adjustment UI should now be fully accessible! 🎉
