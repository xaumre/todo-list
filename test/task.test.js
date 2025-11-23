import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createTask, isValidDescription, Task } from '../task.js';

describe('Task Model', () => {
  describe('Property-Based Tests', () => {
    /**
     * Feature: todo-list, Property 2: Whitespace-only inputs are rejected
     * Validates: Requirements 1.2
     * 
     * For any string composed entirely of whitespace characters (spaces, tabs, 
     * newlines, or combinations), attempting to add it as a task should be 
     * rejected, and the task list should remain unchanged.
     */
    it('Property 2: Whitespace-only inputs are rejected', () => {
      // Generator for whitespace-only strings
      const whitespaceChar = fc.oneof(
        fc.constant(' '),
        fc.constant('\t'),
        fc.constant('\n'),
        fc.constant('\r')
      );
      
      const whitespaceString = fc.array(whitespaceChar, { minLength: 1, maxLength: 50 })
        .map(chars => chars.join(''));

      fc.assert(
        fc.property(whitespaceString, (whitespace) => {
          // Attempt to create a task with whitespace-only description
          const task = createTask(whitespace);
          
          // Task creation should return null (rejected)
          expect(task).toBeNull();
          
          // Validation function should return false
          expect(isValidDescription(whitespace)).toBe(false);
          
          // Constructor should throw an error
          expect(() => new Task(whitespace)).toThrow();
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 3: New tasks initialize as incomplete
     * Validates: Requirements 1.5
     * 
     * For any valid task description, when a new task is created, 
     * its completed status should be false.
     */
    it('Property 3: New tasks initialize as incomplete', () => {
      // Generator for valid task descriptions (non-whitespace strings)
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      fc.assert(
        fc.property(validDescription, (description) => {
          // Create task using createTask function
          const task1 = createTask(description);
          expect(task1).not.toBeNull();
          expect(task1.completed).toBe(false);
          
          // Create task using Task constructor
          const task2 = new Task(description);
          expect(task2.completed).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });
});
