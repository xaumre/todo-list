/**
 * API Client
 * Handles HTTP requests to the backend API with authentication
 */

/**
 * APIClient class for managing HTTP requests to the backend
 */
export class APIClient {
  /**
   * Create a new APIClient instance
   * @param {string} baseURL - Base URL for the API (default: '')
   * @param {number} maxRetries - Maximum number of retry attempts for network errors (default: 3)
   * @param {number} retryDelay - Delay between retries in milliseconds (default: 1000)
   */
  constructor(baseURL = '', maxRetries = 3, retryDelay = 1000) {
    this.baseURL = baseURL;
    this.authToken = null;
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  /**
   * Set the authentication token for subsequent requests
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken() {
    this.authToken = null;
  }

  /**
   * Build headers for requests
   * @param {Object} customHeaders - Additional headers to include
   * @returns {Object} - Headers object
   */
  _buildHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Build full URL from endpoint
   * @param {string} endpoint - API endpoint
   * @returns {string} - Full URL
   */
  _buildURL(endpoint) {
    // Remove leading slash from endpoint if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Remove trailing slash from baseURL if present
    const cleanBaseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    
    return cleanBaseURL ? `${cleanBaseURL}/${cleanEndpoint}` : `/${cleanEndpoint}`;
  }

  /**
   * Parse response based on content type
   * @param {Response} response - Fetch response object
   * @returns {Promise<any>} - Parsed response data
   */
  async _parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }

  /**
   * Handle error responses
   * @param {Response} response - Fetch response object
   * @param {any} data - Parsed response data
   * @throws {Error} - Throws error with appropriate message
   */
  _handleErrorResponse(response, data) {
    const error = new Error(data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    throw error;
  }

  /**
   * Check if error is retryable (network errors, 5xx errors)
   * @param {Error} error - Error object
   * @returns {boolean} - True if error is retryable
   */
  _isRetryableError(error) {
    // Network errors (no response)
    if (!error.status) {
      return true;
    }
    
    // Server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    
    return false;
  }

  /**
   * Sleep for specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - Response data
   */
  async _request(endpoint, options = {}) {
    const url = this._buildURL(endpoint);
    const headers = this._buildHeaders(options.headers);
    
    const fetchOptions = {
      ...options,
      headers,
    };

    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);
        const data = await this._parseResponse(response);

        if (!response.ok) {
          this._handleErrorResponse(response, data);
        }

        return data;
      } catch (error) {
        lastError = error;
        
        // Don't retry if it's not a retryable error
        if (!this._isRetryableError(error)) {
          throw error;
        }
        
        // Don't retry if we've exhausted attempts
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this._sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Make GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async get(endpoint, options = {}) {
    return this._request(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make POST request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async post(endpoint, data, options = {}) {
    return this._request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Make PUT request
   * @param {string} endpoint - API endpoint
   * @param {any} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async put(endpoint, data, options = {}) {
    return this._request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Make DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} - Response data
   */
  async delete(endpoint, options = {}) {
    return this._request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}
