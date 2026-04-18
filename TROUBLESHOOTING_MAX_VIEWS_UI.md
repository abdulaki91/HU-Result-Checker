# Troubleshooting Max Views UI

## Changes Made to Fix Issues:

### 1. ✅ Increased Rate Limits

**File**: `backend/index.js`

- **Before**: 100 requests per 15 minutes
- **After**: 500 requests per 15 minutes (5x increase)

### 2. ✅ Increased Login Attempts

**File**: `backend/models/User.js`

- **Before**: Account locked after 5 failed attempts
- **After**: Account locked after 10 failed attempts (2x increase)

### 3. ✅ Enhanced Max Views Button Visibility

**File**: `frontend/src/pages/admin/DeviceManagementPage.jsx`

- Added console logging for debugging
- Enhanced button styling with border
- Added minimum width to prevent layout issues
- Added debug section with always-visible button

### 4. ✅ Added Debug Controls

- Yellow debug section at top of Device Management page
- Always visible "Debug: Adjust Max Views" button
- Console logging and alert for testing

## How to Access Max Views UI:

### Method 1: Normal Button (Purple)

1. Go to `/admin/devices`
2. Look for purple "Max Views (6)" button in actions bar
3. Should be next to "Unlock All" and "Refresh" buttons

### Method 2: Debug Button (Yellow) - Always Visible

1. Go to `/admin/devices`
2. Look for yellow debug section at top
3. Click "🔧 Debug: Adjust Max Views (6)" button
4. This button is always visible for testing

## Debugging Steps:

### 1. Check Browser Console

Open browser developer tools (F12) and look for:

```
🔧 DeviceManagementPage component loaded
```

### 2. Test Debug Button

- The yellow debug button should always be visible
- Click it to test if modal opens
- Check console for "Debug Max Views button clicked!"

### 3. Check Network Tab

- Look for API calls to `/api/admin/devices`
- Verify no 429 (rate limit) errors
- Check for any failed requests

### 4. Verify Route Access

- Ensure you're logged in as admin
- Navigate to `/admin/devices` directly
- Check if page loads without errors

## Expected UI Layout:

```
Device Management
├── Debug Section (Yellow box)
│   └── 🔧 Debug: Adjust Max Views (6)
├── Student ID Search
├── Device Search & Actions
│   ├── [Search Devices]
│   ├── [Show All/Locked Only]
│   ├── [Unlock All]
│   ├── [Max Views (6)] ← Purple button
│   └── [Refresh]
└── Device Table
```

## Modal Features:

When Max Views button is clicked:

- Modal opens with current setting display
- Number input (1-50 range)
- "Update All" button
- Success/error feedback

## If Still Not Visible:

### Check These:

1. **Browser Cache**: Hard refresh (Ctrl+F5)
2. **JavaScript Errors**: Check console for errors
3. **CSS Issues**: Check if button is hidden by CSS
4. **Route Issues**: Verify `/admin/devices` loads correctly
5. **Component Loading**: Look for console log message

### Alternative Access:

- Use the yellow debug button as backup
- Check browser network tab for API issues
- Verify admin authentication is working

## Rate Limit Improvements:

- **API Rate Limit**: 100 → 500 requests per 15 minutes
- **Login Attempts**: 5 → 10 attempts before account lock
- **Lock Duration**: Still 30 minutes (unchanged)

The Max Views UI should now be more accessible and visible! 🎉
