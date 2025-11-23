/**
 * Storage Manager
 * Handles all Local Storage operations for task persistence
 */

const STORAGE_KEY = 'todoTasks';

/**
 * StorageManager class for managing task persistence in Local Storage
 */
export class StorageManager {
  /**
   * Loads tasks from Local Storage
   * @returns {Array} - Array of task objects, empty array if no tasks or on error
   */
  loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      // No data in storage - return empty array
      if (data === null || data === undefined) {
        return [];
      }
      
      // Parse JSON data
      const parsed = JSON.parse(data);
      
      // Validate that parsed data is an array
      if (!Array.isArray(parsed)) {
        console.warn('Storage data is not an array, initializing with empty array');
        return [];
      }
      
      // Validate each task object has required properties
      const validTasks = parsed.filter(task => {
        return (
          task &&
          typeof task === 'object' &&
          typeof task.id === 'string' &&
          typeof task.description === 'string' &&
          typeof task.completed === 'boolean' &&
          typeof task.createdAt === 'number'
        );
      });
      
      // If some tasks were invalid, log a warning
      if (validTasks.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - validTasks.length} invalid task(s)`);
      }
      
      return validTasks;
    } catch (error) {
      // Handle JSON parse errors or other exceptions
      console.error('Error loading tasks from storage:', error);
      return [];
    }
  }

  /**
   * Saves tasks to Local Storage
   * @param {Array} tasks - Array of task objects to save
   * @returns {boolean} - True if save was successful, false otherwise
   */
  saveTasks(tasks) {
    try {
      // Validate input is an array
      if (!Array.isArray(tasks)) {
        console.error('saveTasks expects an array');
        return false;
      }
      
      // Serialize and save to Local Storage
      const data = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEY, data);
      
      return true;
    } catch (error) {
      // Handle quota exceeded or other storage errors
      console.error('Error saving tasks to storage:', error);
      return false;
    }
  }

  /**
   * Clears all tasks from Local Storage
   * @returns {boolean} - True if clear was successful, false otherwise
   */
  clearTasks() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing tasks from storage:', error);
      return false;
    }
  }
}
