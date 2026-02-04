import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to check authentication status
 * Call this from browser console or add to your component
 */
export const debugAuth = async () => {
    console.log('=== AUTH DEBUG ===');

    try {
        const token = await AsyncStorage.getItem('token');
        const user = await AsyncStorage.getItem('user');

        console.log('Token exists:', !!token);
        if (token) {
            console.log('Token (first 30 chars):', token.substring(0, 30) + '...');

            // Try to decode JWT (basic decode, not verification)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Token payload:', payload);
                console.log('Token expires:', new Date(payload.exp * 1000).toLocaleString());
                console.log('Token expired:', Date.now() > payload.exp * 1000);
            } catch (e) {
                console.error('Failed to decode token:', e.message);
            }
        } else {
            console.error('❌ NO TOKEN FOUND - User is not logged in!');
        }

        if (user) {
            console.log('User data:', JSON.parse(user));
        } else {
            console.warn('No user data found');
        }

        console.log('=== END DEBUG ===');
        return { token: !!token, user: !!user };
    } catch (error) {
        console.error('Error checking auth:', error);
        return { error: error.message };
    }
};

/**
 * Manually set a token (for testing)
 */
export const setTestToken = async (token) => {
    await AsyncStorage.setItem('token', token);
    console.log('✓ Token set successfully');
};

/**
 * Clear all auth data
 */
export const clearAuth = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    console.log('✓ Auth data cleared');
};

// Make it available globally in browser console
if (typeof window !== 'undefined') {
    window.debugAuth = debugAuth;
    window.setTestToken = setTestToken;
    window.clearAuth = clearAuth;
    console.log('Auth debug utilities loaded. Use: window.debugAuth(), window.setTestToken(token), window.clearAuth()');
}
