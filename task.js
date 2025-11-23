/**
 * Task Model
 * Represents a single task in the to-do list
 */

/**
 * Validates if a task description is valid (not empty or whitespace-only)
 * @param {string} description - The task description to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidDescription(description) {
  if (typeof description !== 'string') {
    return false;
  }
  return description.trim().length > 0;
}

/**
 * Generates a unique ID for a task
 * Combines timestamp with random component for uniqueness
 * @returns {string} - Unique task ID
 */
function generateTaskId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates a new Task object
 * @param {string} description - The task description
 * @returns {Object|null} - Task object or null if description is invalid
 */
export function createTask(description) {
  if (!isValidDescription(description)) {
    return null;
  }

  return {
    id: generateTaskId(),
    description: description.trim(),
    completed: false,
    createdAt: Date.now()
  };
}

/**
 * Task class for managing individual tasks
 */
export class Task {
  /**
   * Creates a new Task instance
   * @param {string} description - The task description
   * @throws {Error} - If description is invalid
   */
  constructor(description) {
    if (!isValidDescription(description)) {
      throw new Error('Task description cannot be empty or whitespace-only');
    }

    this.id = generateTaskId();
    this.description = description.trim();
    this.completed = false;
    this.createdAt = Date.now();
  }

  /**
   * Toggles the completion status of the task
   */
  toggleCompletion() {
    this.completed = !this.completed;
  }

  /**
   * Converts the task to a plain object for storage
   * @returns {Object} - Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      description: this.description,
      completed: this.completed,
      createdAt: this.createdAt
    };
  }

  /**
   * Creates a Task instance from a plain object
   * @param {Object} obj - Plain object with task properties
   * @returns {Task|null} - Task instance or null if invalid
   */
  static fromJSON(obj) {
    if (!obj || typeof obj !== 'object') {
      return null;
    }

    if (!obj.description || typeof obj.description !== 'string') {
      return null;
    }

    const task = Object.create(Task.prototype);
    task.id = obj.id || generateTaskId();
    task.description = obj.description.trim();
    task.completed = Boolean(obj.completed);
    task.createdAt = obj.createdAt || Date.now();

    return task;
  }
}
