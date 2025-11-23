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
   */
  constructor(storageManager) {
    this.storageManager = storageManager || new StorageManager();
    this.tasks = this.storageManager.loadTasks();
  }

  /**
   * Adds a new task to the task list
   * @param {string} description - The task description
   * @returns {Object|null} - The created task object or null if invalid
   */
  addTask(description) {
    // Validate description
    if (!isValidDescription(description)) {
      return null;
    }

    // Create new task
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
   * @returns {boolean} - True if task was deleted, false if not found
   */
  deleteTask(id) {
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
   * @returns {boolean} - True if task was toggled, false if not found
   */
  toggleTaskCompletion(id) {
    // Find the task
    const task = this.tasks.find(task => task.id === id);

    if (!task) {
      return false;
    }

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
