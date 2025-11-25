/**
 * Main application entry point
 * Initializes and wires up all components
 * 
 * ============================================================================
 * NOTIFICATION DECISION MATRIX
 * ============================================================================
 * 
 * This application uses two notification systems:
 * 1. Toast Notifications (ToastNotification class) - Global, temporary pop-ups
 * 2. Inline Messages (AuthUI class) - Form-specific, persistent messages
 * 
 * Use the following matrix to determine which notification system to use:
 * 
 * | Event Type                    | Toast | Inline | Rationale                                    |
 * |-------------------------------|-------|--------|----------------------------------------------|
 * | Login success                 |   ✓   |   ✗    | Operation feedback                           |
 * | Registration success          |   ✓   |   ✗    | Operation feedback                           |
 * | Logout                        |   ✓   |   ✗    | Operation feedback                           |
 * | Form validation error         |   ✗   |   ✓    | Validation feedback (user-focused context)   |
 * | Authentication server error   |   ✗   |   ✓    | Form context feedback                        |
 * | Session expiration            |   ✓   |   ✓    | EXCEPTION: Toast for attention + inline for  |
 * |                               |       |        | persistent context (see handleAuthError)     |
 * | Task operation success        |   ✓   |   ✗    | Operation feedback                           |
 * | Task operation error          |   ✓   |   ✗    | Operation feedback                           |
 * 
 * GENERAL RULES:
 * - Toast notifications: Use for completed asynchronous operations (success/error/info)
 * - Inline messages: Use ONLY for client-side form validation errors
 * - Never trigger both systems for the same event (except session expiration)
 * - Session expiration is the ONLY exception where both are appropriate
 * 
 * For detailed design rationale, see: .kiro/specs/duplicate-notifications-fix/design.md
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 * ============================================================================
 */

import { TaskManager } from './taskManager.js';
import { StorageManager } from './storage.js';
import { UIController } from './uiController.js';
import { AuthService } from './authService.js';
import { APIClient } from './apiClient.js';
import { AuthUI } from './authUI.js';
import { LoadingIndicator } from './loadingIndicator.js';
import { ToastNotification } from './toastNotification.js';
import { config } from './config.js';

// Global instances
let authService;
let apiClient;
let authUI;
let taskManager;
let uiController;
let loadingIndicator;
let toast;

/**
 * Global error handler for uncaught errors
 */
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // Prevent default error handling to avoid breaking the app
  event.preventDefault();
});

/**
 * Global error handler for unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent default error handling
  event.preventDefault();
});

/**
 * Show the authenticated app (task list)
 */
function showApp() {
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.hidden = false;
  }
  authUI.hideAuthForms();
  
  // Display current user email
  const user = authService.getCurrentUser();
  const userEmailElement = document.getElementById('user-email');
  if (userEmailElement && user && user.email) {
    userEmailElement.textContent = user.email;
  }
}

/**
 * Hide the authenticated app (task list)
 */
function hideApp() {
  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    appContainer.hidden = true;
  }
}

/**
 * Load tasks from the API and render them
 */
async function loadTasks() {
  try {
    loadingIndicator.show('Loading tasks...');
    const response = await apiClient.get('api/tasks');
    
    // Extract tasks array from response
    const tasks = response.tasks || response || [];
    
    // Update task manager with tasks from API
    taskManager.tasks = tasks;
    
    // Render tasks
    uiController.renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    
    // Check if it's an authentication error
    if (error.status === 401) {
      handleAuthenticationError();
    } else {
      // Show error toast
      toast.error('Failed to load tasks', 'Please try again later.');
    }
  } finally {
    loadingIndicator.hide();
  }
}

/**
 * Handle authentication errors (401)
 * 
 * Notification Strategy for Session Expiration:
 * This is an EXCEPTION to the single-notification rule where BOTH notifications serve distinct purposes:
 * 
 * 1. Toast (warning): Provides immediate, attention-grabbing feedback that the session expired
 *    - Appears immediately when session expires
 *    - Auto-dismisses after a few seconds
 *    - Ensures user notices the interruption even if they're not looking at the form
 * 
 * 2. Inline message: Provides persistent context in the login form explaining what happened
 *    - Remains visible in the login form
 *    - Explains why the user is seeing the login form
 *    - Provides context for users who may have stepped away and returned
 * 
 * Rationale:
 * - Session expiration can occur while the user is actively interacting with the app (not the form)
 * - Toast ensures the user notices the interruption immediately with visual feedback
 * - Inline message persists to remind the user why they're seeing the login form after toast dismisses
 * - Together they provide both immediate attention and persistent context
 * 
 * Clear existing toasts before showing session expiration:
 * - Prevents notification clutter from previous operations
 * - Ensures session expiration message is the only visible toast
 * - Provides a clean slate for the critical session expiration notification
 * 
 * Requirements: 5.1, 5.2, 5.3
 */
function handleAuthenticationError() {
  // Clear stored token
  authService.logout();
  
  // Clear API client token
  apiClient.clearAuthToken();
  
  // Hide app and show login form
  hideApp();
  authUI.showLoginForm();
  
  // Clear any existing toasts before showing session expiration notification
  // This ensures the session expiration message is prominent and not lost among other notifications
  // Requirement: 5.3
  toast.dismissAll();
  
  // Show both notifications (intentional exception - see function documentation)
  // Toast provides immediate attention, inline provides persistent context
  authUI.displayError('Your session has expired. Please log in again.', 'login');
  toast.warning('Session expired', 'Please log in again to continue.');
}

/**
 * Initialize the authenticated app
 */
async function initializeAuthenticatedApp() {
  try {
    // Only initialize once - prevent duplicate event listeners
    if (uiController) {
      console.log('Authenticated app already initialized');
      return;
    }
    
    // Get DOM elements
    const elements = {
      form: document.getElementById('add-task-form'),
      input: document.getElementById('task-input'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state')
    };

    // Validate required DOM elements exist
    if (!elements.form || !elements.input || !elements.taskList) {
      throw new Error('Required DOM elements not found');
    }

    // Initialize UI Controller
    uiController = new UIController(elements);

    // Bind event handlers with error boundaries
    uiController.bindAddTask(async (description) => {
      try {
        const task = await taskManager.addTask(description);
        
        if (task) {
          // Clear input field after successful addition
          uiController.clearInput();
          
          // Reload tasks from API to get the updated list
          await loadTasks();
          
          // Show success toast
          toast.success('Task added', 'Your task has been added successfully.');
        }
      } catch (error) {
        console.error('Error adding task:', error);
        
        // Check if it's an authentication error
        if (error.status === 401) {
          handleAuthenticationError();
        } else {
          toast.error('Failed to add task', 'Please try again.');
        }
      }
    });

    uiController.bindDeleteTask(async (taskId) => {
      try {
        const success = await taskManager.deleteTask(taskId);
        
        if (success) {
          // Reload tasks from API to get the updated list
          await loadTasks();
          
          // Show success toast
          toast.success('Task deleted', 'Your task has been removed.');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        
        // Check if it's an authentication error
        if (error.status === 401) {
          handleAuthenticationError();
        } else {
          toast.error('Failed to delete task', 'Please try again.');
        }
      }
    });

    uiController.bindToggleTask(async (taskId) => {
      try {
        const success = await taskManager.toggleTaskCompletion(taskId);
        
        if (success) {
          // Reload tasks from API to get the updated list
          await loadTasks();
          
          // Show success toast (check task status from reloaded tasks)
          const task = taskManager.getTasks().find(t => t.id === taskId);
          if (task) {
            const status = task.completed ? 'completed' : 'reopened';
            toast.success(`Task ${status}`, '');
          }
        }
      } catch (error) {
        console.error('Error toggling task:', error);
        
        // Check if it's an authentication error
        if (error.status === 401) {
          handleAuthenticationError();
        } else {
          toast.error('Failed to update task', 'Please try again.');
        }
      }
    });

    // Set up keyboard navigation for accessibility
    uiController.setupKeyboardNavigation();

    // Load tasks from API
    await loadTasks();

    console.log('Authenticated app initialized');
  } catch (error) {
    console.error('Failed to initialize authenticated app:', error);
    
    // Check if it's an authentication error
    if (error.status === 401) {
      handleAuthenticationError();
    } else {
      alert('Failed to initialize application. Please refresh the page.');
    }
  }
}

/**
 * Handle successful login/registration
 * 
 * Notification Strategy:
 * - Success: Toast notification only (operation feedback)
 * - Failure: Inline message only (form context feedback)
 * 
 * Rationale for authentication failures:
 * - Inline messages provide context within the form where the user is focused
 * - Toast notifications would be redundant since the user is already viewing the form
 * - This aligns with the pattern: inline for validation/form errors, toast for operations
 * 
 * Note: Session expiration (handleAuthenticationError) is an exception that uses both
 * toast (immediate attention) and inline (persistent context) notifications.
 * 
 * Requirements: 2.1, 2.3, 4.2, 4.4
 */
async function handleAuthSuccess(result, formType) {
  if (result.success) {
    // Set token in API client
    apiClient.setAuthToken(result.token);
    
    // Show success toast
    toast.success('Welcome!', 'You have successfully logged in.');
    
    // Initialize the authenticated app
    await initializeAuthenticatedApp();
    
    // Show the app
    showApp();
  } else {
    // Show inline error message only (no toast for authentication failures)
    // The inline message provides sufficient context within the form
    authUI.displayError(result.error || 'Authentication failed', formType);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  try {
    // Clear authentication
    authService.logout();
    
    // Clear API client token
    apiClient.clearAuthToken();
    
    // Clear task manager state
    if (taskManager) {
      taskManager.tasks = [];
    }
    
    // Clear UI and cleanup event listeners
    if (uiController) {
      uiController.renderTasks([]);
      uiController.cleanup(); // Remove event listeners to prevent duplicates
    }
    
    // Reset UI controller so it can be re-initialized on next login
    uiController = null;
    
    // Hide app and show login form
    hideApp();
    authUI.showLoginForm();
    
    // Show logout toast
    toast.info('Logged out', 'You have been logged out successfully.');
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Initialize the application with error boundaries
 */
function initializeApp() {
  try {
    // Initialize loading indicator
    loadingIndicator = new LoadingIndicator();
    
    // Initialize toast notifications
    toast = new ToastNotification();
    
    // Initialize authentication service
    authService = new AuthService();
    
    // Initialize API client with configuration
    apiClient = new APIClient(config.apiBaseUrl, config.apiMaxRetries, config.apiRetryDelay);
    
    // Initialize AuthUI
    authUI = new AuthUI();
    
    // Initialize task manager with API client
    const storageManager = new StorageManager();
    taskManager = new TaskManager(storageManager, apiClient);
    
    // Bind login form
    authUI.bindLoginSubmit(async (formData) => {
      const result = await authService.login(formData.email, formData.password);
      await handleAuthSuccess(result, 'login');
    });
    
    // Bind registration form
    authUI.bindRegisterSubmit(async (formData) => {
      const result = await authService.register(formData.email, formData.password);
      await handleAuthSuccess(result, 'register');
    });
    
    // Bind logout button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', handleLogout);
    }
    
    // Check authentication state on load
    if (authService.isAuthenticated()) {
      const token = authService.getToken();
      apiClient.setAuthToken(token);
      
      // Initialize and show authenticated app
      initializeAuthenticatedApp().then(() => {
        showApp();
      }).catch((error) => {
        console.error('Error initializing authenticated app:', error);
        
        // If initialization fails, show login form
        hideApp();
        authUI.showLoginForm();
      });
    } else {
      // Not authenticated, show login form
      hideApp();
      authUI.showLoginForm();
    }

    console.log('To-Do List Application Initialized');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Display error message to user
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Failed to initialize application. Please refresh the page.</div>';
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
