/**
 * Tests for AuthUI controller
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { AuthUI } from '../authUI.js';

describe('AuthUI', () => {
  let dom;
  let document;
  let authUI;

  beforeEach(() => {
    // Create a minimal DOM structure for testing
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="auth-container">
            <div id="login-form-container">
              <form id="login-form">
                <input type="email" id="login-email" />
                <input type="password" id="login-password" />
                <button class="auth-button">
                  <span class="button-text">Log In</span>
                  <span class="button-spinner" hidden>
                    <span class="spinner"></span>
                  </span>
                </button>
                <div id="login-message" class="auth-message" hidden></div>
              </form>
              <a href="#" id="show-register-link">Sign up</a>
            </div>
            
            <div id="register-form-container" hidden>
              <form id="register-form">
                <input type="email" id="register-email" />
                <input type="password" id="register-password" />
                <input type="password" id="register-password-confirm" />
                <button class="auth-button">
                  <span class="button-text">Sign Up</span>
                  <span class="button-spinner" hidden>
                    <span class="spinner"></span>
                  </span>
                </button>
                <div id="register-message" class="auth-message" hidden></div>
              </form>
              <a href="#" id="show-login-link">Log in</a>
            </div>
          </div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    global.document = document;
    
    authUI = new AuthUI();
  });

  describe('Form Visibility', () => {
    it('should show login form and hide register form', () => {
      authUI.showLoginForm();
      
      const authContainer = document.getElementById('auth-container');
      const loginContainer = document.getElementById('login-form-container');
      const registerContainer = document.getElementById('register-form-container');
      
      expect(authContainer.hidden).toBe(false);
      expect(loginContainer.hidden).toBe(false);
      expect(registerContainer.hidden).toBe(true);
    });

    it('should show register form and hide login form', () => {
      authUI.showRegisterForm();
      
      const authContainer = document.getElementById('auth-container');
      const loginContainer = document.getElementById('login-form-container');
      const registerContainer = document.getElementById('register-form-container');
      
      expect(authContainer.hidden).toBe(false);
      expect(loginContainer.hidden).toBe(true);
      expect(registerContainer.hidden).toBe(false);
    });

    it('should hide all auth forms', () => {
      authUI.hideAuthForms();
      
      const authContainer = document.getElementById('auth-container');
      const loginContainer = document.getElementById('login-form-container');
      const registerContainer = document.getElementById('register-form-container');
      
      expect(authContainer.hidden).toBe(true);
      expect(loginContainer.hidden).toBe(true);
      expect(registerContainer.hidden).toBe(true);
    });
  });

  describe('Message Display', () => {
    it('should display error message for login form', () => {
      authUI.displayError('Invalid credentials', 'login');
      
      const message = document.getElementById('login-message');
      expect(message.textContent).toBe('Invalid credentials');
      expect(message.className).toBe('auth-message error');
      expect(message.hidden).toBe(false);
    });

    it('should display success message for register form', () => {
      authUI.displaySuccess('Account created', 'register');
      
      const message = document.getElementById('register-message');
      expect(message.textContent).toBe('Account created');
      expect(message.className).toBe('auth-message success');
      expect(message.hidden).toBe(false);
    });

    it('should clear message', () => {
      authUI.displayError('Error', 'login');
      authUI.clearMessage('login');
      
      const message = document.getElementById('login-message');
      expect(message.textContent).toBe('');
      expect(message.hidden).toBe(true);
    });
  });

  describe('Loading State', () => {
    it('should show loading state on login form', () => {
      authUI.showLoadingState('login');
      
      const form = document.getElementById('login-form');
      const button = form.querySelector('.auth-button');
      const buttonText = button.querySelector('.button-text');
      const buttonSpinner = button.querySelector('.button-spinner');
      const inputs = form.querySelectorAll('input');
      
      expect(button.disabled).toBe(true);
      expect(buttonText.hidden).toBe(true);
      expect(buttonSpinner.hidden).toBe(false);
      inputs.forEach(input => {
        expect(input.disabled).toBe(true);
      });
    });

    it('should hide loading state on login form', () => {
      authUI.showLoadingState('login');
      authUI.hideLoadingState('login');
      
      const form = document.getElementById('login-form');
      const button = form.querySelector('.auth-button');
      const buttonText = button.querySelector('.button-text');
      const buttonSpinner = button.querySelector('.button-spinner');
      const inputs = form.querySelectorAll('input');
      
      expect(button.disabled).toBe(false);
      expect(buttonText.hidden).toBe(false);
      expect(buttonSpinner.hidden).toBe(true);
      inputs.forEach(input => {
        expect(input.disabled).toBe(false);
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      expect(authUI.validateEmail('test@example.com')).toBe(true);
      expect(authUI.validateEmail('invalid-email')).toBe(false);
      expect(authUI.validateEmail('')).toBe(false);
    });

    it('should validate password length', () => {
      expect(authUI.validatePassword('12345678')).toBe(true);
      expect(authUI.validatePassword('short')).toBe(false);
      expect(authUI.validatePassword('')).toBe(false);
    });

    it('should validate login form with valid data', () => {
      document.getElementById('login-email').value = 'test@example.com';
      document.getElementById('login-password').value = 'password123';
      
      const result = authUI.validateLoginForm();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate login form with invalid email', () => {
      document.getElementById('login-email').value = 'invalid-email';
      document.getElementById('login-password').value = 'password123';
      
      const result = authUI.validateLoginForm();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Please enter a valid email address');
    });

    it('should validate login form with missing password', () => {
      document.getElementById('login-email').value = 'test@example.com';
      document.getElementById('login-password').value = '';
      
      const result = authUI.validateLoginForm();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should validate register form with valid data', () => {
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      document.getElementById('register-password-confirm').value = 'password123';
      
      const result = authUI.validateRegisterForm();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate register form with short password', () => {
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'short';
      document.getElementById('register-password-confirm').value = 'short';
      
      const result = authUI.validateRegisterForm();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters');
    });

    it('should validate register form with mismatched passwords', () => {
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      document.getElementById('register-password-confirm').value = 'different123';
      
      const result = authUI.validateRegisterForm();
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });
  });

  describe('Form Data', () => {
    it('should get login form data', () => {
      document.getElementById('login-email').value = 'test@example.com';
      document.getElementById('login-password').value = 'password123';
      
      const data = authUI.getLoginFormData();
      expect(data.email).toBe('test@example.com');
      expect(data.password).toBe('password123');
    });

    it('should get register form data', () => {
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      
      const data = authUI.getRegisterFormData();
      expect(data.email).toBe('test@example.com');
      expect(data.password).toBe('password123');
    });

    it('should clear login form', () => {
      document.getElementById('login-email').value = 'test@example.com';
      document.getElementById('login-password').value = 'password123';
      
      authUI.clearLoginForm();
      
      expect(document.getElementById('login-email').value).toBe('');
      expect(document.getElementById('login-password').value).toBe('');
    });

    it('should clear register form', () => {
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      document.getElementById('register-password-confirm').value = 'password123';
      
      authUI.clearRegisterForm();
      
      expect(document.getElementById('register-email').value).toBe('');
      expect(document.getElementById('register-password').value).toBe('');
      expect(document.getElementById('register-password-confirm').value).toBe('');
    });
  });

  describe('Form Submission', () => {
    it('should handle login form submission with valid data', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      authUI.bindLoginSubmit(handler);
      
      document.getElementById('login-email').value = 'test@example.com';
      document.getElementById('login-password').value = 'password123';
      
      const form = document.getElementById('login-form');
      const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(handler).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should not call handler with invalid login data', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      authUI.bindLoginSubmit(handler);
      
      document.getElementById('login-email').value = 'invalid-email';
      document.getElementById('login-password').value = 'password123';
      
      const form = document.getElementById('login-form');
      const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(handler).not.toHaveBeenCalled();
      
      const message = document.getElementById('login-message');
      expect(message.hidden).toBe(false);
      expect(message.className).toBe('auth-message error');
    });

    it('should handle register form submission with valid data', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      authUI.bindRegisterSubmit(handler);
      
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      document.getElementById('register-password-confirm').value = 'password123';
      
      const form = document.getElementById('register-form');
      const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(handler).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should not call handler with mismatched passwords', async () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      authUI.bindRegisterSubmit(handler);
      
      document.getElementById('register-email').value = 'test@example.com';
      document.getElementById('register-password').value = 'password123';
      document.getElementById('register-password-confirm').value = 'different123';
      
      const form = document.getElementById('register-form');
      const event = new dom.window.Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(event);
      
      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(handler).not.toHaveBeenCalled();
      
      const message = document.getElementById('register-message');
      expect(message.hidden).toBe(false);
      expect(message.className).toBe('auth-message error');
    });
  });
});
