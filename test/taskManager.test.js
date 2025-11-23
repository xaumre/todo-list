import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { TaskManager } from '../taskManager.js';
import { StorageManager } from '../storage.js';

describe('Task Manager', () => {
  let taskManager;
  let storageManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storageManager = new StorageManager();
    taskManager = new TaskManager(storageManager);
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: todo-list, Property 1: Task addition increases list size
     * Validates: Requirements 1.1
     * 
     * For any valid (non-whitespace) task description, adding it to the task 
     * list should result in the task list length increasing by one and the 
     * new task appearing in the list.
     */
    it('Property 1: Task addition increases list size', () => {
      // Generator for valid task descriptions (non-whitespace strings)
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      fc.assert(
        fc.property(validDescription, (description) => {
          // Get initial task list length
          const initialLength = taskManager.getTasks().length;

          // Add task
          const addedTask = taskManager.addTask(description);

          // Task should be created successfully
          expect(addedTask).not.toBeNull();

          // Get new task list length
          const newLength = taskManager.getTasks().length;

          // Length should increase by exactly 1
          expect(newLength).toBe(initialLength + 1);

          // The new task should appear in the list
          const tasks = taskManager.getTasks();
          const foundTask = tasks.find(t => t.id === addedTask.id);
          expect(foundTask).toBeDefined();
          expect(foundTask.description).toBe(description.trim());
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 4: Task completion toggle
     * Validates: Requirements 2.1, 2.3
     * 
     * For any task in the task list, toggling its completion status should 
     * change it from false to true or from true to false, and toggling twice 
     * should return it to its original state.
     */
    it('Property 4: Task completion toggle', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      fc.assert(
        fc.property(validDescription, (description) => {
          // Add a task
          const task = taskManager.addTask(description);
          expect(task).not.toBeNull();

          // Store original completion status (should be false for new tasks)
          const originalStatus = task.completed;
          expect(originalStatus).toBe(false);

          // Toggle once - should change to opposite
          const toggleResult1 = taskManager.toggleTaskCompletion(task.id);
          expect(toggleResult1).toBe(true);

          // Get updated task
          const tasks1 = taskManager.getTasks();
          const updatedTask1 = tasks1.find(t => t.id === task.id);
          expect(updatedTask1.completed).toBe(!originalStatus);

          // Toggle again - should return to original
          const toggleResult2 = taskManager.toggleTaskCompletion(task.id);
          expect(toggleResult2).toBe(true);

          // Get updated task
          const tasks2 = taskManager.getTasks();
          const updatedTask2 = tasks2.find(t => t.id === task.id);
          expect(updatedTask2.completed).toBe(originalStatus);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 6: Task deletion removes from list
     * Validates: Requirements 3.1
     * 
     * For any task in the task list, deleting it should result in the task 
     * list length decreasing by one and the task no longer appearing in the list.
     */
    it('Property 6: Task deletion removes from list', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      fc.assert(
        fc.property(validDescription, (description) => {
          // Add a task
          const task = taskManager.addTask(description);
          expect(task).not.toBeNull();

          // Get initial length
          const initialLength = taskManager.getTasks().length;

          // Delete the task
          const deleteResult = taskManager.deleteTask(task.id);
          expect(deleteResult).toBe(true);

          // Get new length
          const newLength = taskManager.getTasks().length;

          // Length should decrease by exactly 1
          expect(newLength).toBe(initialLength - 1);

          // The task should no longer appear in the list
          const tasks = taskManager.getTasks();
          const foundTask = tasks.find(t => t.id === task.id);
          expect(foundTask).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 9: Operations persist to storage
     * Validates: Requirements 1.4, 2.4, 3.2, 4.4
     * 
     * For any task operation (add, delete, toggle completion), the local 
     * storage should immediately reflect the updated task list state after 
     * the operation completes.
     */
    it('Property 9: Operations persist to storage', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      // Generator for operation type
      const operationType = fc.constantFrom('add', 'toggle', 'delete');

      fc.assert(
        fc.property(validDescription, operationType, (description, operation) => {
          // Clear storage and create fresh manager
          localStorage.clear();
          const freshStorageManager = new StorageManager();
          const freshTaskManager = new TaskManager(freshStorageManager);

          let taskId;

          // Perform operation
          if (operation === 'add') {
            // Add task
            const task = freshTaskManager.addTask(description);
            expect(task).not.toBeNull();
            taskId = task.id;
          } else {
            // For toggle and delete, we need to add a task first
            const task = freshTaskManager.addTask(description);
            expect(task).not.toBeNull();
            taskId = task.id;

            if (operation === 'toggle') {
              // Toggle task
              const result = freshTaskManager.toggleTaskCompletion(taskId);
              expect(result).toBe(true);
            } else if (operation === 'delete') {
              // Delete task
              const result = freshTaskManager.deleteTask(taskId);
              expect(result).toBe(true);
            }
          }

          // Get current state from task manager
          const currentTasks = freshTaskManager.getTasks();

          // Create a new storage manager and load from storage
          const verifyStorageManager = new StorageManager();
          const loadedTasks = verifyStorageManager.loadTasks();

          // Loaded tasks should match current tasks
          expect(loadedTasks).toHaveLength(currentTasks.length);

          // Verify each task matches
          for (let i = 0; i < currentTasks.length; i++) {
            expect(loadedTasks[i].id).toBe(currentTasks[i].id);
            expect(loadedTasks[i].description).toBe(currentTasks[i].description);
            expect(loadedTasks[i].completed).toBe(currentTasks[i].completed);
            expect(loadedTasks[i].createdAt).toBe(currentTasks[i].createdAt);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
