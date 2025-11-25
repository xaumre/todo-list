/**
 * ToastNotification
 * Manages toast notification messages
 * 
 * ============================================================================
 * NOTIFICATION STRATEGY FOR TOAST NOTIFICATIONS
 * ============================================================================
 * 
 * This class provides TOAST NOTIFICATIONS for operation feedback.
 * 
 * WHEN TO USE TOAST NOTIFICATIONS:
 * - Successful operations (login, registration, logout, task operations)
 * - Operation errors (network errors, server errors, task operation failures)
 * - Session expiration warnings (immediate attention)
 * - Any asynchronous operation that completes (success or failure)
 * 
 * WHEN NOT TO USE TOAST NOTIFICATIONS:
 * - Client-side form validation errors (use AuthUI inline messages instead)
 * - Any feedback that should persist until user action (use inline messages)
 * 
 * KEY PRINCIPLE:
 * Toast notifications provide temporary, attention-grabbing feedback for completed
 * operations. They auto-dismiss (except errors) and don't require user interaction.
 * 
 * For form validation feedback, use AuthUI inline messages instead.
 * 
 * See app.js for the complete Notification Decision Matrix.
 * For detailed design rationale, see: .kiro/specs/duplicate-notifications-fix/design.md
 * 
 * Requirements: 2.1, 2.2, 2.3, 4.2, 4.3
 * ============================================================================
 */

export class ToastNotification {
  constructor() {
    this.container = document.getElementById('toast-container');
    this.toasts = new Map();
    this.nextId = 1;
    this.defaultDuration = 5000; // 5 seconds
  }

  /**
   * Show a toast notification
   * @param {Object} options - Toast options
   * @param {string} options.type - Toast type: 'success', 'error', 'info', 'warning'
   * @param {string} options.title - Toast title
   * @param {string} options.message - Toast message
   * @param {number} options.duration - Duration in milliseconds (0 for no auto-dismiss)
   * @returns {number} Toast ID
   */
  show({ type = 'info', title, message, duration = this.defaultDuration }) {
    if (!this.container) {
      console.error('Toast container not found');
      return null;
    }

    const id = this.nextId++;
    const toast = this._createToast(id, type, title, message);
    
    this.container.appendChild(toast);
    this.toasts.set(id, toast);

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  /**
   * Show a success toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Toast ID
   */
  success(title, message = '', duration = this.defaultDuration) {
    return this.show({ type: 'success', title, message, duration });
  }

  /**
   * Show an error toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {number} duration - Duration in milliseconds (0 for no auto-dismiss)
   * @returns {number} Toast ID
   */
  error(title, message = '', duration = 0) {
    return this.show({ type: 'error', title, message, duration });
  }

  /**
   * Show an info toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Toast ID
   */
  info(title, message = '', duration = this.defaultDuration) {
    return this.show({ type: 'info', title, message, duration });
  }

  /**
   * Show a warning toast
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {number} duration - Duration in milliseconds
   * @returns {number} Toast ID
   */
  warning(title, message = '', duration = this.defaultDuration) {
    return this.show({ type: 'warning', title, message, duration });
  }

  /**
   * Dismiss a toast by ID
   * @param {number} id - Toast ID
   */
  dismiss(id) {
    const toast = this.toasts.get(id);
    if (!toast) return;

    // Add exit animation
    toast.classList.add('toast-exit');

    // Remove after animation completes
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      this.toasts.delete(id);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    this.toasts.forEach((_, id) => {
      this.dismiss(id);
    });
  }

  /**
   * Create a toast element
   * @param {number} id - Toast ID
   * @param {string} type - Toast type
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @returns {HTMLElement} Toast element
   * @private
   */
  _createToast(id, type, title, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

    // Icon
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = this._getIcon(type);

    // Content
    const content = document.createElement('div');
    content.className = 'toast-content';

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'toast-title';
      titleEl.textContent = title;
      content.appendChild(titleEl);
    }

    if (message) {
      const messageEl = document.createElement('div');
      messageEl.className = 'toast-message';
      messageEl.textContent = message;
      content.appendChild(messageEl);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => {
      this.dismiss(id);
    });

    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(closeBtn);

    return toast;
  }

  /**
   * Get icon for toast type
   * @param {string} type - Toast type
   * @returns {string} Icon character
   * @private
   */
  _getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      info: 'i',
      warning: '⚠'
    };
    return icons[type] || icons.info;
  }
}
