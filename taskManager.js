/**
 * Task Manager
 * Manages task list state and operations with persistence
 */

import { createTask, isValidDescription } from './task.js';
import { StorageManager } from './storage.js';

/**
 * TaskManager class for managing the task list state
 */
export class TaskManager {
  /**
   * Creates a new TaskManager instance
   * @param {StorageManager} storageManager - Storage manager instance for persistence
   * @param {APIClient} apiClient - API client for backend communication (optional)
   */
  constructor(storageManager, apiClient = null) {
    this.storageManager = storageManager || new StorageManager();
    this.apiClient = apiClient;
    this.tasks = this.storageManager.loadTasks();
  }

  /**
   * Adds a new task to the task list
   * @param {string} description - The task description
   * @returns {Promise<Object|null>|Object|null} - The created task object or null if invalid
   */
  addTask(description) {
    // Validate description
    if (!isValidDescription(description)) {
      return null;
    }

    // If API client is available, use it
    if (this.apiClient) {
      return (async () => {
        try {
          const response = await this.apiClient.post('api/tasks', { description });
          
          // Extract task from response
          const task = response.task || response;
          
          // Don't add to local array - let the caller reload tasks from API
          // This prevents duplicates when re-rendering
          
          return task;
        } catch (error) {
          console.error('Error adding task via API:', error);
          throw error;
        }
      })();
    }

    // Fallback to local storage
    const task = createTask(description);
    
    if (task === null) {
      return null;
    }

    // Add to task list
    this.tasks.push(task);

    // Persist to storage
    this.storageManager.saveTasks(this.tasks);

    return task;
  }

  /**
   * Deletes a task from the task list
   * @param {string} id - The task ID to delete
   * @returns {Promise<boolean>|boolean} - True if task was deleted, false if not found
   */
  deleteTask(id) {
    // If API client is available, use it
    if (this.apiClient) {
      return (async () => {
        try {
          await this.apiClient.delete(`api/tasks/${id}`);
          
          // Remove from local task list
          const initialLength = this.tasks.length;
          this.tasks = this.tasks.filter(task => task.id !== id);
          
          return this.tasks.length < initialLength;
        } catch (error) {
          console.error('Error deleting task via API:', error);
          throw error;
        }
      })();
    }

    // Fallback to local storage
    const initialLength = this.tasks.length;
    
    // Filter out the task with the given id
    this.tasks = this.tasks.filter(task => task.id !== id);

    // Check if a task was actually removed
    const wasDeleted = this.tasks.length < initialLength;

    if (wasDeleted) {
      // Persist to storage
      this.storageManager.saveTasks(this.tasks);
    }

    return wasDeleted;
  }

  /**
   * Toggles the completion status of a task
   * @param {string} id - The task ID to toggle
   * @returns {Promise<boolean>|boolean} - True if task was toggled, false if not found
   */
  toggleTaskCompletion(id) {
    // Find the task
    const task = this.tasks.find(task => task.id === id);

    if (!task) {
      return false;
    }

    // If API client is available, use it
    if (this.apiClient) {
      return (async () => {
        try {
          const response = await this.apiClient.put(`api/tasks/${id}`, {
            completed: !task.completed
          });
          
          // Extract task from response
          const updatedTask = response.task || response;
          
          // Update local task
          task.completed = updatedTask.completed;
          
          return true;
        } catch (error) {
          console.error('Error toggling task via API:', error);
          throw error;
        }
      })();
    }

    // Fallback to local storage
    // Toggle completion status
    task.completed = !task.completed;

    // Persist to storage
    this.storageManager.saveTasks(this.tasks);

    return true;
  }

  /**
   * Gets all tasks
   * @returns {Array} - Array of all tasks
   */
  getTasks() {
    return [...this.tasks]; // Return a copy to prevent external modification
  }
}
