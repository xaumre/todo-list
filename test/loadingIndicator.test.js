/**
 * Tests for LoadingIndicator
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { LoadingIndicator } from '../loadingIndicator.js';

describe('LoadingIndicator', () => {
  let dom;
  let document;
  let loadingIndicator;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="loading-overlay" class="loading-overlay" hidden>
            <div class="loading-spinner-container">
              <div class="loading-spinner-large"></div>
              <div class="loading-text">Loading...</div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    document = dom.window.document;
    global.document = document;
    
    loadingIndicator = new LoadingIndicator();
  });

  describe('Show and Hide', () => {
    it('should show loading overlay', () => {
      loadingIndicator.show();
      
      const overlay = document.getElementById('loading-overlay');
      expect(overlay.hidden).toBe(false);
    });

    it('should hide loading overlay', () => {
      loadingIndicator.show();
      loadingIndicator.hide();
      
      const overlay = document.getElementById('loading-overlay');
      expect(overlay.hidden).toBe(true);
    });

    it('should update loading message', () => {
      loadingIndicator.show('Custom message');
      
      const loadingText = document.querySelector('.loading-text');
      expect(loadingText.textContent).toBe('Custom message');
    });

    it('should track multiple active requests', () => {
      loadingIndicator.show();
      loadingIndicator.show();
      loadingIndicator.hide();
      
      const overlay = document.getElementById('loading-overlay');
      expect(overlay.hidden).toBe(false);
      
      loadingIndicator.hide();
      expect(overlay.hidden).toBe(true);
    });

    it('should force hide regardless of active requests', () => {
      loadingIndicator.show();
      loadingIndicator.show();
      loadingIndicator.forceHide();
      
      const overlay = document.getElementById('loading-overlay');
      expect(overlay.hidden).toBe(true);
    });
  });

  describe('Inline Loading', () => {
    it('should create inline loading indicator', () => {
      const inline = loadingIndicator.createInline('Loading data...');
      
      expect(inline.className).toBe('inline-loading');
      expect(inline.textContent).toContain('Loading data...');
      expect(inline.querySelector('.spinner')).toBeTruthy();
    });
  });
});
