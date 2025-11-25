/**
 * AuthUI Controller
 * Manages authentication UI components including login and registration forms
 * 
 * ============================================================================
 * NOTIFICATION STRATEGY FOR INLINE MESSAGES
 * ============================================================================
 * 
 * This class provides INLINE MESSAGES for form validation feedback only.
 * 
 * WHEN TO USE INLINE MESSAGES (displayError/displaySuccess):
 * - Client-side form validation errors (invalid email, short password, etc.)
 * - Session expiration context (persistent reminder in login form)
 * - Authentication server errors (form-specific context)
 * 
 * WHEN NOT TO USE INLINE MESSAGES:
 * - Successful operations (use toast notifications instead)
 * - Task operations (use toast notifications instead)
 * - Any feedback not directly related to form validation
 * 
 * KEY PRINCIPLE:
 * Inline messages provide persistent, form-specific context for validation errors.
 * They remain visible until the user corrects the error or switches forms.
 * 
 * For operation feedback (success/error), use ToastNotification class instead.
 * 
 * See app.js for the complete Notification Decision Matrix.
 * For detailed design rationale, see: .kiro/specs/duplicate-notifications-fix/design.md
 * 
 * Requirements: 2.4, 3.1, 3.2, 3.3, 4.1
 * ============================================================================
 */

export class AuthUI {
  constructor() {
    // Get DOM elements
    this.authContainer = document.getElementById('auth-container');
    this.loginFormContainer = document.getElementById('login-form-container');
    this.registerFormContainer = document.getElementById('register-form-container');
    
    this.loginForm = document.getElementById('login-form');
    this.registerForm = document.getElementById('register-form');
    
    this.loginMessage = document.getElementById('login-message');
    this.registerMessage = document.getElementById('register-message');
    
    this.showRegisterLink = document.getElementById('show-register-link');
    this.showLoginLink = document.getElementById('show-login-link');
    
    // Validate required elements
    if (!this.authContainer || !this.loginFormContainer || !this.registerFormContainer) {
      throw new Error('Required auth DOM elements not found');
    }
    
    // Set up form switching
    this._setupFormSwitching();
  }
  
  /**
   * Set up event listeners for switching between login and register forms
   * @private
   */
  _setupFormSwitching() {
    this.showRegisterLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showRegisterForm();
    });
    
    this.showLoginLink?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showLoginForm();
    });
  }
  
  /**
   * Show the login form and hide registration form
   */
  showLoginForm() {
    this.authContainer.hidden = false;
    this.loginFormContainer.hidden = false;
    this.registerFormContainer.hidden = true;
    
    // Clear any messages
    this.clearMessage('login');
    this.clearMessage('register');
    
    // Focus on email input
    const emailInput = document.getElementById('login-email');
    if (emailInput) {
      emailInput.focus();
    }
  }
  
  /**
   * Show the registration form and hide login form
   */
  showRegisterForm() {
    this.authContainer.hidden = false;
    this.loginFormContainer.hidden = true;
    this.registerFormContainer.hidden = false;
    
    // Clear any messages
    this.clearMessage('login');
    this.clearMessage('register');
    
    // Focus on email input
    const emailInput = document.getElementById('register-email');
    if (emailInput) {
      emailInput.focus();
    }
  }
  
  /**
   * Hide all authentication forms
   */
  hideAuthForms() {
    this.authContainer.hidden = true;
    this.loginFormContainer.hidden = true;
    this.registerFormContainer.hidden = true;
    
    // Clear any messages
    this.clearMessage('login');
    this.clearMessage('register');
  }
  
  /**
   * Display an error message
   * @param {string} message - The error message to display
   * @param {string} formType - Either 'login' or 'register'
   */
  displayError(message, formType = 'login') {
    const messageElement = formType === 'login' ? this.loginMessage : this.registerMessage;
    
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'auth-message error';
      messageElement.hidden = false;
    }
  }
  
  /**
   * Display a success message
   * @param {string} message - The success message to display
   * @param {string} formType - Either 'login' or 'register'
   */
  displaySuccess(message, formType = 'login') {
    const messageElement = formType === 'login' ? this.loginMessage : this.registerMessage;
    
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = 'auth-message success';
      messageElement.hidden = false;
    }
  }
  
  /**
   * Clear message for a specific form
   * @param {string} formType - Either 'login' or 'register'
   */
  clearMessage(formType = 'login') {
    const messageElement = formType === 'login' ? this.loginMessage : this.registerMessage;
    
    if (messageElement) {
      messageElement.textContent = '';
      messageElement.className = 'auth-message';
      messageElement.hidden = true;
    }
  }
  
  /**
   * Show loading state on a form
   * @param {string} formType - Either 'login' or 'register'
   */
  showLoadingState(formType = 'login') {
    const form = formType === 'login' ? this.loginForm : this.registerForm;
    
    if (form) {
      const button = form.querySelector('.auth-button');
      const buttonText = button?.querySelector('.button-text');
      const buttonSpinner = button?.querySelector('.button-spinner');
      
      if (button) {
        button.disabled = true;
      }
      
      if (buttonText) {
        buttonText.hidden = true;
      }
      
      if (buttonSpinner) {
        buttonSpinner.hidden = false;
      }
      
      // Disable all inputs
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.disabled = true;
      });
    }
  }
  
  /**
   * Hide loading state on a form
   * @param {string} formType - Either 'login' or 'register'
   */
  hideLoadingState(formType = 'login') {
    const form = formType === 'login' ? this.loginForm : this.registerForm;
    
    if (form) {
      const button = form.querySelector('.auth-button');
      const buttonText = button?.querySelector('.button-text');
      const buttonSpinner = button?.querySelector('.button-spinner');
      
      if (button) {
        button.disabled = false;
      }
      
      if (buttonText) {
        buttonText.hidden = false;
      }
      
      if (buttonSpinner) {
        buttonSpinner.hidden = true;
      }
      
      // Enable all inputs
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        input.disabled = false;
      });
    }
  }
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Validate password length
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   */
  validatePassword(password) {
    return password.length >= 8;
  }
  
  /**
   * Validate login form
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateLoginForm() {
    const errors = [];
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    
    if (!email) {
      errors.push('Email is required');
    } else if (!this.validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password) {
      errors.push('Password is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate registration form
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateRegisterForm() {
    const errors = [];
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-password-confirm');
    
    const email = emailInput?.value.trim() || '';
    const password = passwordInput?.value || '';
    const confirmPassword = confirmPasswordInput?.value || '';
    
    if (!email) {
      errors.push('Email is required');
    } else if (!this.validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password) {
      errors.push('Password is required');
    } else if (!this.validatePassword(password)) {
      errors.push('Password must be at least 8 characters');
    }
    
    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Get login form data
   * @returns {{email: string, password: string}}
   */
  getLoginFormData() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    return {
      email: emailInput?.value.trim() || '',
      password: passwordInput?.value || ''
    };
  }
  
  /**
   * Get registration form data
   * @returns {{email: string, password: string}}
   */
  getRegisterFormData() {
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    
    return {
      email: emailInput?.value.trim() || '',
      password: passwordInput?.value || ''
    };
  }
  
  /**
   * Clear login form
   */
  clearLoginForm() {
    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }
  
  /**
   * Clear registration form
   */
  clearRegisterForm() {
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const confirmPasswordInput = document.getElementById('register-password-confirm');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (confirmPasswordInput) confirmPasswordInput.value = '';
  }
  
  /**
   * Bind login form submission handler
   * @param {Function} handler - Handler function that receives form data
   */
  bindLoginSubmit(handler) {
    this.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous messages
      this.clearMessage('login');
      
      // Validate form
      const validation = this.validateLoginForm();
      if (!validation.valid) {
        // Display validation errors as inline messages (NOT toast notifications)
        // Validation errors are form-specific and should remain visible until corrected
        // Requirements: 2.4, 3.1, 3.3
        this.displayError(validation.errors.join('. '), 'login');
        return;
      }
      
      // Show loading state
      this.showLoadingState('login');
      
      try {
        // Get form data and call handler
        const formData = this.getLoginFormData();
        await handler(formData);
      } catch (error) {
        // Handler should handle errors, but catch just in case
        this.displayError(error.message || 'An error occurred', 'login');
      } finally {
        // Hide loading state
        this.hideLoadingState('login');
      }
    });
  }
  
  /**
   * Bind registration form submission handler
   * @param {Function} handler - Handler function that receives form data
   */
  bindRegisterSubmit(handler) {
    this.registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Clear previous messages
      this.clearMessage('register');
      
      // Validate form
      const validation = this.validateRegisterForm();
      if (!validation.valid) {
        // Display validation errors as inline messages (NOT toast notifications)
        // Validation errors are form-specific and should remain visible until corrected
        // Requirements: 2.4, 3.2, 3.3
        this.displayError(validation.errors.join('. '), 'register');
        return;
      }
      
      // Show loading state
      this.showLoadingState('register');
      
      try {
        // Get form data and call handler
        const formData = this.getRegisterFormData();
        await handler(formData);
      } catch (error) {
        // Handler should handle errors, but catch just in case
        this.displayError(error.message || 'An error occurred', 'register');
      } finally {
        // Hide loading state
        this.hideLoadingState('register');
      }
    });
  }
}
