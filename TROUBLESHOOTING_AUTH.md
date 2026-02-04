# Authentication Error: "Access denied. No token provided."

## Problem
You're seeing the error: `{"success":false,"message":"Access denied. No token provided."}`

This error occurs when making API requests to protected endpoints without a valid JWT token.

## Root Cause
The authentication middleware (`server/middleware/auth.js`) is rejecting requests because:
1. No `Authorization` header is present in the request
2. The token is missing from AsyncStorage (user not logged in)
3. The token was cleared or expired

## How to Debug

### Step 1: Check Browser Console
Open your browser's Developer Tools (F12) and look for these messages:

✓ **Good sign:**
```
[API Client] ✓ Token found and attached to request
```

✗ **Problem:**
```
[API Client] ✗ NO TOKEN FOUND IN ASYNCSTORAGE!
[API Client] You may need to log in again.
```

### Step 2: Use Debug Utility
In the browser console, run:
```javascript
await window.debugAuth()
```

This will show you:
- Whether a token exists
- Token expiration date
- User data
- Whether the token is expired

### Step 3: Check Network Tab
1. Open Developer Tools → Network tab
2. Find the failed request (e.g., to `/api/module-builder/fields`)
3. Click on it and check the **Headers** tab
4. Look for `Authorization: Bearer <token>`
   - If missing → Token not in AsyncStorage
   - If present → Token might be invalid/expired

## Solutions

### Solution 1: Log In Again
If you're not logged in or your session expired:
1. Navigate to the login page
2. Enter your credentials
3. After successful login, the token will be stored in AsyncStorage

### Solution 2: Manually Check AsyncStorage (Web)
In browser console:
```javascript
// Check if token exists
import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
  AsyncStorage.getItem('token').then(token => {
    console.log('Token:', token ? 'EXISTS' : 'NOT FOUND');
  });
});
```

### Solution 3: Clear and Re-login
If you have a corrupted token:
```javascript
// In browser console
await window.clearAuth()
// Then log in again
```

### Solution 4: Check if Login is Working
Verify the login flow stores the token correctly:

1. Open `src/screens/LoginScreen.js` (or wherever login happens)
2. Make sure after successful login, it does:
```javascript
await AsyncStorage.setItem('token', response.data.token);
await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
```

## Quick Fix for Testing

If you need to test the module builder immediately and have a valid token:

```javascript
// In browser console
await window.setTestToken('your-jwt-token-here')
```

Then refresh the page.

## Prevention

The enhanced API client now:
1. ✓ Shows clear error messages when token is missing
2. ✓ Automatically clears invalid tokens
3. ✓ Logs all authentication issues to console
4. ✓ Can auto-redirect to login (uncomment in `src/api/client.js`)

## Files Modified
- `src/api/client.js` - Enhanced error handling
- `src/utils/authDebug.js` - Debug utilities
- `App.js` - Imports debug utilities

## Next Steps
1. Open your app in the browser
2. Open Developer Console (F12)
3. Run `await window.debugAuth()`
4. Check the output and follow the appropriate solution above
