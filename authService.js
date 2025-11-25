/**
 * Authentication Service
 * Handles user authentication operations and token management
 */

import { config } from './config.js';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

/**
 * AuthService class for managing authentication state and operations
 */
export class AuthService {
  /**
   * Register a new user
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, token?: string, user?: Object, error?: string}>}
   */
  async register(email, password) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed',
        };
      }

      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);

      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error during registration',
      };
    }
  }

  /**
   * Log in an existing user
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, token?: string, user?: Object, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // Store token and user data
      this.setToken(data.token);
      this.setUser(data.user);

      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error during login',
      };
    }
  }

  /**
   * Log out the current user
   * Clears token and user data from storage
   */
  logout() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  /**
   * Get the stored authentication token
   * @returns {string|null} - The stored token or null if not found
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store authentication token
   * @param {string} token - JWT token to store
   */
  setToken(token) {
    try {
      if (token && typeof token === 'string') {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  /**
   * Get the current user data
   * @returns {Object|null} - The current user object or null if not found
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(USER_KEY);
      if (!userData) {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Store user data
   * @param {Object} user - User object to store
   */
  setUser(user) {
    try {
      if (user && typeof user === 'object') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} - True if user has a valid token, false otherwise
   */
  isAuthenticated() {
    const token = this.getToken();
    return token !== null && token !== undefined && token !== '';
  }
}
