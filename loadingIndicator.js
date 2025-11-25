/**
 * LoadingIndicator
 * Manages global and inline loading indicators
 */

export class LoadingIndicator {
  constructor() {
    this.overlay = document.getElementById('loading-overlay');
    this.loadingText = this.overlay?.querySelector('.loading-text');
    this.activeRequests = 0;
  }

  /**
   * Show the global loading overlay
   * @param {string} message - Optional loading message
   */
  show(message = 'Loading...') {
    if (this.overlay) {
      if (this.loadingText) {
        this.loadingText.textContent = message;
      }
      this.overlay.hidden = false;
      this.activeRequests++;
    }
  }

  /**
   * Hide the global loading overlay
   */
  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    // Only hide if no active requests
    if (this.activeRequests === 0 && this.overlay) {
      this.overlay.hidden = true;
    }
  }

  /**
   * Force hide the loading overlay regardless of active requests
   */
  forceHide() {
    this.activeRequests = 0;
    if (this.overlay) {
      this.overlay.hidden = true;
    }
  }

  /**
   * Create an inline loading indicator
   * @param {string} message - Loading message
   * @returns {HTMLElement} The loading indicator element
   */
  createInline(message = 'Loading...') {
    const container = document.createElement('div');
    container.className = 'inline-loading';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    
    const spinner = document.createElement('span');
    spinner.className = 'spinner';
    
    const text = document.createElement('span');
    text.textContent = message;
    
    container.appendChild(spinner);
    container.appendChild(text);
    
    return container;
  }
}
