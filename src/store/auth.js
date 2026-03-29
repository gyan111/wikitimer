import { ref } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const user = ref(null);
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);

// Debug logging function
const debugLog = (message, data = null) => {
  console.log('\n=== CLIENT DEBUG ===');
  console.log(message);
  if (data) {
    console.log('Data:', data);
  }
  console.log('==================\n');
};

// Helper function for API requests
const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  };

  const fullUrl = `${API_URL}${url}`;
  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  debugLog('Making API request', { 
    url: fullUrl, 
    options: requestOptions,
    origin: window.location.origin
  });

  try {
    const response = await fetch(fullUrl, requestOptions);

    debugLog('API response', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    return response;
  } catch (err) {
    debugLog('API request failed', { 
      url: fullUrl,
      error: err.message,
      type: err.name
    });
    throw err;
  }
};

export const useAuth = () => {
  const login = () => {
    debugLog('Initiating login process');
    error.value = null;
    isLoading.value = true;

    // Test server connection first
    apiRequest('/test')
      .then(async response => {
        const data = await response.json();
        debugLog('Server test response', data);
        
        if (response.ok) {
          // Store current URL for redirect after login
          const currentPath = window.location.pathname;
          sessionStorage.setItem('redirectAfterLogin', currentPath);
          debugLog('Stored redirect path', { path: currentPath });

          // Redirect to MediaWiki OAuth2 login
          const loginUrl = `${API_URL}/auth/mediawiki`;
          debugLog('Redirecting to', { url: loginUrl });
          window.location.href = loginUrl;
        } else {
          throw new Error(`Server test failed: ${response.status}`);
        }
      })
      .catch(err => {
        error.value = 'Failed to connect to server';
        debugLog('Server test failed', { 
          error: err.message,
          type: err.name,
          stack: err.stack
        });
        isLoading.value = false;
      });
  };

  const logout = async () => {
    debugLog('Initiating logout');
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await apiRequest('/auth/logout');
      
      if (!response.ok) {
        throw new Error(`Logout failed: ${response.status}`);
      }
      
      user.value = null;
      isAuthenticated.value = false;
      sessionStorage.removeItem('redirectAfterLogin');
      debugLog('Logout successful');
      
    } catch (err) {
      error.value = 'Failed to logout. Please try again.';
      debugLog('Logout error', { 
        error: err.message,
        type: err.name
      });
    } finally {
      isLoading.value = false;
    }
  };

  const checkAuth = async () => {
    if (isLoading.value) {
      debugLog('Auth check skipped - already loading');
      return;
    }
    
    debugLog('Checking authentication status');
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await apiRequest('/api/user');
      
      if (response.ok) {
        const userData = await response.json();
        debugLog('User data received', userData);
        
        user.value = userData;
        isAuthenticated.value = true;
        
        // Handle redirect after login if needed
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          debugLog('Found redirect path', { path: redirectPath });
          sessionStorage.removeItem('redirectAfterLogin');
          window.location.pathname = redirectPath;
        }
      } else if (response.status === 401) {
        debugLog('User not authenticated');
        user.value = null;
        isAuthenticated.value = false;
      } else {
        throw new Error(`Failed to check authentication status: ${response.status}`);
      }
    } catch (err) {
      // Don't show auth check errors to user by default
      debugLog('Auth check error', { 
        error: err.message,
        type: err.name
      });
      user.value = null;
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  // Check auth status immediately
  debugLog('Initializing auth store');
  checkAuth();

  // Set up periodic auth check (every 5 minutes)
  if (typeof window !== 'undefined') {
    const checkInterval = 5 * 60 * 1000; // 5 minutes
    debugLog('Setting up periodic auth check', { interval: checkInterval });
    
    setInterval(checkAuth, checkInterval);
    
    // Check auth on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        debugLog('Page became visible, checking auth');
        checkAuth();
      }
    });
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth
  };
};
