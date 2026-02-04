# Authentication Issue - "Access denied. No token provided"

## Problem
You're getting the error: `{"success":false,"message":"Access denied. No token provided."}`

This means the API request is not including an authentication token.

## Solution

### Option 1: Log In (Most Likely)
You need to log in to the application first:

1. **Open your browser** to `http://localhost:19006` (or wherever Expo is running)
2. **You should see the Login screen**
3. **Enter credentials:**
   - Email: `admin@demo.com` (or your admin email)
   - Password: `password123` (or your password)
4. **Click Login**
5. **Try the Module Builder again**

### Option 2: Check if Already Logged In
If you're already logged in but still getting this error:

1. **Open Browser Console** (F12)
2. **Look for these logs:**
   ```
   [AuthStore] Loading authentication from storage...
   [AuthStore] Token and user found in storage
   ```
   OR
   ```
   [AuthStore] No authentication found in storage
   ```

3. **When you try to save a field, look for:**
   ```
   [API Client] Token found and attached to request
   [API Client] POST module-builder/fields
   ```
   OR
   ```
   [API Client] No token found in AsyncStorage!
   ```

### Option 3: Token Expired
If the token exists but is expired:

1. **Log out** (if there's a logout button)
2. **Log in again** to get a fresh token

### Option 4: Clear Storage and Re-login
If the token is corrupted:

1. **Open Browser Console** (F12)
2. **Run these commands:**
   ```javascript
   // For web, AsyncStorage uses localStorage
   localStorage.clear();
   // Then refresh the page
   location.reload();
   ```
3. **Log in again**

## Debugging Steps

### 1. Check Browser Console
Open the browser console and look for:
- `[AuthStore]` logs - Shows if token is loaded
- `[API Client]` logs - Shows if token is sent with requests

### 2. Check AsyncStorage/localStorage
In browser console:
```javascript
// Check if token exists
localStorage.getItem('token');
// Check if user exists
localStorage.getItem('user');
```

### 3. Check Server Logs
In your server terminal, you should see:
```
[ModuleBuilder] createField called with payload: {...}
```

If you see:
```
Access denied. No token provided.
```
Then the token is not reaching the server.

## Default Test Credentials

Based on typical seeding, try these credentials:

**Super Admin:**
- Email: `admin@trakio.com`
- Password: `admin123`

**Company Admin:**
- Email: `admin@demo.com`
- Password: `password123`

## Quick Fix Command

If you want to quickly test without logging in, you can temporarily disable authentication for the module-builder routes (NOT RECOMMENDED FOR PRODUCTION):

**server/routes/moduleBuilder.js:**
```javascript
// Comment out these lines temporarily:
// router.use(authMiddleware);
// router.use(requireRole(['COMPANY_ADMIN', 'SUPER_ADMIN']));
```

But **DO NOT** do this in production! This is only for testing.

## Expected Flow

### Successful Authentication:
1. User logs in → Token saved to AsyncStorage
2. User navigates to Module Builder
3. User fills in field form
4. User clicks "Save Field"
5. API client reads token from AsyncStorage
6. API client adds `Authorization: Bearer <token>` header
7. Server validates token
8. Server saves field to database
9. Success response returned

### Current Issue:
Step 5 is failing - no token found in AsyncStorage

## Solution Summary

**Most likely:** You just need to **log in** to the application first!

1. Go to the login page
2. Enter your credentials
3. Log in
4. Try the Module Builder again

The authentication token will be automatically stored and attached to all subsequent API requests.
