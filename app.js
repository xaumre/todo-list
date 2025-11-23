/**
 * Main application entry point
 * Initializes and wires up all components
 */

import { TaskManager } from './taskManager.js';
import { StorageManager } from './storage.js';
import { UIController } from './uiController.js';

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
 * Initialize the application with error boundaries
 */
function initializeApp() {
  try {
    // Initialize components
    const storageManager = new StorageManager();
    const taskManager = new TaskManager(storageManager);

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
    const uiController = new UIController(elements);

    // Bind event handlers with error boundaries
    uiController.bindAddTask((description) => {
      try {
        const task = taskManager.addTask(description);
        
        if (task) {
          // Clear input field after successful addition
          uiController.clearInput();
          
          // Re-render task list
          uiController.renderTasks(taskManager.getTasks());
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    });

    uiController.bindDeleteTask((taskId) => {
      try {
        const success = taskManager.deleteTask(taskId);
        
        if (success) {
          // Re-render task list
          uiController.renderTasks(taskManager.getTasks());
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    });

    uiController.bindToggleTask((taskId) => {
      try {
        const success = taskManager.toggleTaskCompletion(taskId);
        
        if (success) {
          // Re-render task list
          uiController.renderTasks(taskManager.getTasks());
        }
      } catch (error) {
        console.error('Error toggling task:', error);
      }
    });

    // Set up keyboard navigation for accessibility
    uiController.setupKeyboardNavigation();

    // Initial render - load tasks from storage
    uiController.renderTasks(taskManager.getTasks());

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
