import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageManager } from '../storage.js';

describe('Storage Manager', () => {
  let storageManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storageManager = new StorageManager();
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: todo-list, Property 8: Storage persistence round-trip
     * Validates: Requirements 4.1
     * 
     * For any task list state, saving to local storage and then loading 
     * should produce an equivalent task list with all tasks and their 
     * properties preserved.
     */
    it('Property 8: Storage persistence round-trip', () => {
      // Generator for valid task objects
      const taskGenerator = fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        description: fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0),
        completed: fc.boolean(),
        createdAt: fc.integer({ min: 0, max: Date.now() })
      });

      // Generator for arrays of tasks
      const taskListGenerator = fc.array(taskGenerator, { minLength: 0, maxLength: 50 });

      fc.assert(
        fc.property(taskListGenerator, (tasks) => {
          // Save tasks to storage
          const saveResult = storageManager.saveTasks(tasks);
          expect(saveResult).toBe(true);

          // Load tasks from storage
          const loadedTasks = storageManager.loadTasks();

          // Verify the loaded tasks match the original tasks
          expect(loadedTasks).toHaveLength(tasks.length);
          
          // Check each task's properties are preserved
          for (let i = 0; i < tasks.length; i++) {
            expect(loadedTasks[i].id).toBe(tasks[i].id);
            expect(loadedTasks[i].description).toBe(tasks[i].description);
            expect(loadedTasks[i].completed).toBe(tasks[i].completed);
            expect(loadedTasks[i].createdAt).toBe(tasks[i].createdAt);
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 10: Corrupted storage handled gracefully
     * Validates: Requirements 4.3
     * 
     * For any invalid or corrupted data in local storage (malformed JSON, 
     * invalid task objects, wrong data types), the application should 
     * initialize with an empty task list without throwing errors.
     */
    it('Property 10: Corrupted storage handled gracefully', () => {
      // Generator for various types of corrupted data
      const corruptedDataGenerator = fc.oneof(
        // Malformed JSON strings
        fc.string().filter(s => {
          try {
            JSON.parse(s);
            return false; // Valid JSON, skip it
          } catch {
            return true; // Invalid JSON, use it
          }
        }),
        // Non-array JSON values
        fc.oneof(
          fc.integer().map(n => JSON.stringify(n)),
          fc.string().map(s => JSON.stringify(s)),
          fc.boolean().map(b => JSON.stringify(b)),
          fc.constant('null'),
          fc.record({ foo: fc.string() }).map(obj => JSON.stringify(obj))
        ),
        // Arrays with invalid task objects
        fc.array(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.string(),
            fc.boolean(),
            // Objects missing required properties
            fc.record({ id: fc.string() }),
            fc.record({ description: fc.string() }),
            fc.record({ completed: fc.boolean() }),
            // Objects with wrong types
            fc.record({
              id: fc.integer(),
              description: fc.string(),
              completed: fc.boolean(),
              createdAt: fc.integer()
            }),
            fc.record({
              id: fc.string(),
              description: fc.integer(),
              completed: fc.boolean(),
              createdAt: fc.integer()
            }),
            fc.record({
              id: fc.string(),
              description: fc.string(),
              completed: fc.string(),
              createdAt: fc.integer()
            })
          ),
          { minLength: 1, maxLength: 10 }
        ).map(arr => JSON.stringify(arr))
      );

      fc.assert(
        fc.property(corruptedDataGenerator, (corruptedData) => {
          // Manually set corrupted data in localStorage
          localStorage.setItem('todoTasks', corruptedData);

          // Attempt to load tasks - should not throw
          let loadedTasks;
          expect(() => {
            loadedTasks = storageManager.loadTasks();
          }).not.toThrow();

          // Should return an empty array
          expect(Array.isArray(loadedTasks)).toBe(true);
          
          // All returned tasks should be valid (if any survived filtering)
          loadedTasks.forEach(task => {
            expect(task).toBeDefined();
            expect(typeof task.id).toBe('string');
            expect(typeof task.description).toBe('string');
            expect(typeof task.completed).toBe('boolean');
            expect(typeof task.createdAt).toBe('number');
          });
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests - Edge Cases', () => {
    it('should initialize with empty array when storage is empty', () => {
      // Ensure localStorage is empty
      localStorage.clear();
      
      const tasks = storageManager.loadTasks();
      
      expect(tasks).toEqual([]);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should handle malformed JSON gracefully', () => {
      // Set malformed JSON in storage
      localStorage.setItem('todoTasks', '{invalid json}');
      
      const tasks = storageManager.loadTasks();
      
      expect(tasks).toEqual([]);
      expect(Array.isArray(tasks)).toBe(true);
    });

    it('should filter out invalid task objects with missing properties', () => {
      // Create array with mix of valid and invalid tasks
      const mixedTasks = [
        { id: '1', description: 'Valid task', completed: false, createdAt: 123 },
        { id: '2', description: 'Missing completed' }, // Invalid
        { id: '3' }, // Invalid - missing description
        { description: 'Missing id', completed: true, createdAt: 456 }, // Invalid
        { id: '4', description: 'Another valid', completed: true, createdAt: 789 }
      ];
      
      localStorage.setItem('todoTasks', JSON.stringify(mixedTasks));
      
      const tasks = storageManager.loadTasks();
      
      // Should only return the 2 valid tasks
      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('1');
      expect(tasks[1].id).toBe('4');
    });

    it('should filter out task objects with wrong data types', () => {
      const invalidTypeTasks = [
        { id: 123, description: 'Wrong id type', completed: false, createdAt: 123 }, // id not string
        { id: '1', description: 456, completed: false, createdAt: 123 }, // description not string
        { id: '2', description: 'Valid', completed: 'yes', createdAt: 123 }, // completed not boolean
        { id: '3', description: 'Valid', completed: true, createdAt: '123' }, // createdAt not number
        { id: '4', description: 'Valid task', completed: false, createdAt: 999 } // All valid
      ];
      
      localStorage.setItem('todoTasks', JSON.stringify(invalidTypeTasks));
      
      const tasks = storageManager.loadTasks();
      
      // Should only return the 1 valid task
      expect(tasks).toHaveLength(1);
      expect(tasks[0].id).toBe('4');
    });

    it('should return empty array when storage contains non-array JSON', () => {
      // Test with object
      localStorage.setItem('todoTasks', JSON.stringify({ foo: 'bar' }));
      expect(storageManager.loadTasks()).toEqual([]);
      
      // Test with string
      localStorage.setItem('todoTasks', JSON.stringify('just a string'));
      expect(storageManager.loadTasks()).toEqual([]);
      
      // Test with number
      localStorage.setItem('todoTasks', JSON.stringify(42));
      expect(storageManager.loadTasks()).toEqual([]);
      
      // Test with null
      localStorage.setItem('todoTasks', 'null');
      expect(storageManager.loadTasks()).toEqual([]);
    });

    it('should successfully save and clear tasks', () => {
      const tasks = [
        { id: '1', description: 'Task 1', completed: false, createdAt: 123 }
      ];
      
      // Save tasks
      const saveResult = storageManager.saveTasks(tasks);
      expect(saveResult).toBe(true);
      
      // Verify saved
      const loaded = storageManager.loadTasks();
      expect(loaded).toHaveLength(1);
      
      // Clear tasks
      const clearResult = storageManager.clearTasks();
      expect(clearResult).toBe(true);
      
      // Verify cleared
      const afterClear = storageManager.loadTasks();
      expect(afterClear).toEqual([]);
    });

    it('should return false when trying to save non-array', () => {
      const result = storageManager.saveTasks('not an array');
      expect(result).toBe(false);
    });
  });
});
