/**
 * Tests for ToastNotification
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { ToastNotification } from '../toastNotification.js';

describe('ToastNotification', () => {
  let dom;
  let document;
  let toast;

  beforeEach(() => {
    vi.useFakeTimers();
    
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="toast-container" class="toast-container"></div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    global.document = document;
    
    toast = new ToastNotification();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Show Toast', () => {
    it('should show success toast', () => {
      toast.success('Success', 'Operation completed');
      
      const container = document.getElementById('toast-container');
      const toastEl = container.querySelector('.toast');
      
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-success')).toBe(true);
      expect(toastEl.textContent).toContain('Success');
      expect(toastEl.textContent).toContain('Operation completed');
    });

    it('should show error toast', () => {
      toast.error('Error', 'Something went wrong');
      
      const container = document.getElementById('toast-container');
      const toastEl = container.querySelector('.toast');
      
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-error')).toBe(true);
    });

    it('should show info toast', () => {
      toast.info('Info', 'Information message');
      
      const container = document.getElementById('toast-container');
      const toastEl = container.querySelector('.toast');
      
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-info')).toBe(true);
    });

    it('should show warning toast', () => {
      toast.warning('Warning', 'Warning message');
      
      const container = document.getElementById('toast-container');
      const toastEl = container.querySelector('.toast');
      
      expect(toastEl).toBeTruthy();
      expect(toastEl.classList.contains('toast-warning')).toBe(true);
    });
  });

  describe('Dismiss Toast', () => {
    it('should dismiss toast by ID', () => {
      const id = toast.success('Success', 'Message');
      
      toast.dismiss(id);
      
      // Fast-forward animation time
      vi.advanceTimersByTime(300);
      
      const container = document.getElementById('toast-container');
      expect(container.children.length).toBe(0);
    });

    it('should auto-dismiss after duration', () => {
      toast.success('Success', 'Message', 3000);
      
      const container = document.getElementById('toast-container');
      expect(container.children.length).toBe(1);
      
      // Fast-forward to auto-dismiss time
      vi.advanceTimersByTime(3000);
      
      // Fast-forward animation time
      vi.advanceTimersByTime(300);
      
      expect(container.children.length).toBe(0);
    });

    it('should not auto-dismiss error toasts by default', () => {
      toast.error('Error', 'Message');
      
      const container = document.getElementById('toast-container');
      expect(container.children.length).toBe(1);
      
      // Fast-forward past default duration
      vi.advanceTimersByTime(10000);
      
      // Toast should still be there
      expect(container.children.length).toBe(1);
    });

    it('should dismiss all toasts', () => {
      toast.success('Success 1', 'Message 1');
      toast.success('Success 2', 'Message 2');
      toast.error('Error', 'Message 3');
      
      const container = document.getElementById('toast-container');
      expect(container.children.length).toBe(3);
      
      toast.dismissAll();
      
      // Fast-forward animation time
      vi.advanceTimersByTime(300);
      
      expect(container.children.length).toBe(0);
    });
  });

  describe('Toast Content', () => {
    it('should show title only', () => {
      toast.success('Title only');
      
      const toastEl = document.querySelector('.toast');
      const title = toastEl.querySelector('.toast-title');
      const message = toastEl.querySelector('.toast-message');
      
      expect(title.textContent).toBe('Title only');
      expect(message).toBeFalsy();
    });

    it('should show title and message', () => {
      toast.success('Title', 'Message');
      
      const toastEl = document.querySelector('.toast');
      const title = toastEl.querySelector('.toast-title');
      const message = toastEl.querySelector('.toast-message');
      
      expect(title.textContent).toBe('Title');
      expect(message.textContent).toBe('Message');
    });

    it('should have close button', () => {
      toast.success('Title', 'Message');
      
      const toastEl = document.querySelector('.toast');
      const closeBtn = toastEl.querySelector('.toast-close');
      
      expect(closeBtn).toBeTruthy();
    });
  });
});
