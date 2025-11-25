/**
 * Application Configuration
 * Environment-specific settings for the frontend
 */

/**
 * Get the API base URL based on the environment
 * @returns {string} - API base URL
 */
function getApiBaseUrl() {
  // Check if we're in production (deployed on Render)
  if (window.location.hostname.includes('onrender.com')) {
    // Production: Use the backend API URL
    return 'https://todolist-backend-bjh6.onrender.com';
  }
  
  // Development: Use local backend
  return 'http://localhost:3000';
}

/**
 * Application configuration object
 */
export const config = {
  // API base URL
  apiBaseUrl: getApiBaseUrl(),
  
  // API retry configuration
  apiMaxRetries: 3,
  apiRetryDelay: 1000,
  
  // Toast notification duration (ms)
  toastDuration: 3000,
  
  // JWT token storage key
  tokenStorageKey: 'auth_token',
  
  // User data storage key
  userStorageKey: 'user_data',
};

