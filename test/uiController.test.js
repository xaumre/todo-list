import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { UIController } from '../uiController.js';
import { createTask } from '../task.js';

describe('UI Controller', () => {
  let elements;
  let uiController;

  beforeEach(() => {
    // Create DOM elements for testing
    document.body.innerHTML = `
      <form id="add-task-form">
        <input type="text" id="task-input" />
        <button type="submit">Add</button>
      </form>
      <ul id="task-list"></ul>
      <div id="empty-state" hidden>No tasks</div>
    `;

    elements = {
      form: document.getElementById('add-task-form'),
      input: document.getElementById('task-input'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state')
    };

    uiController = new UIController(elements);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: todo-list, Property 5: Completed tasks have visual distinction
     * Validates: Requirements 2.2, 2.5
     * 
     * For any task list containing both completed and incomplete tasks, the 
     * rendered DOM should contain different visual indicators (classes, styles, 
     * or attributes) for completed versus incomplete tasks.
     */
    it('Property 5: Completed tasks have visual distinction', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      // Generator that ensures we have at least one completed and one incomplete task
      const mixedTaskListGenerator = fc.tuple(
        // At least one incomplete task
        fc.array(
          fc.record({
            description: validDescription,
            completed: fc.constant(false)
          }),
          { minLength: 1, maxLength: 10 }
        ),
        // At least one completed task
        fc.array(
          fc.record({
            description: validDescription,
            completed: fc.constant(true)
          }),
          { minLength: 1, maxLength: 10 }
        )
      ).map(([incomplete, complete]) => [...incomplete, ...complete]);

      fc.assert(
        fc.property(mixedTaskListGenerator, (taskData) => {
          // Create actual task objects from the generated data
          const tasks = taskData.map(data => {
            const task = createTask(data.description);
            if (task) {
              task.completed = data.completed;
            }
            return task;
          }).filter(task => task !== null);

          // Render the tasks
          uiController.renderTasks(tasks);

          // Get all task items
          const taskItems = elements.taskList.querySelectorAll('.task-item');

          // Separate completed and incomplete tasks
          const completedTasks = tasks.filter(t => t.completed);
          const incompleteTasks = tasks.filter(t => !t.completed);

          // Verify we have both types (as guaranteed by generator)
          expect(completedTasks.length).toBeGreaterThan(0);
          expect(incompleteTasks.length).toBeGreaterThan(0);

          // Check that completed tasks have visual distinction
          taskItems.forEach((taskItem) => {
            const taskId = taskItem.dataset.taskId;
            const task = tasks.find(t => t.id === taskId);

            const checkbox = taskItem.querySelector('.task-checkbox');
            
            if (task.completed) {
              // Completed tasks should have:
              // 1. The 'completed' class
              expect(taskItem.classList.contains('completed')).toBe(true);
              // 2. Checkbox checked
              expect(checkbox.checked).toBe(true);
            } else {
              // Incomplete tasks should NOT have:
              // 1. The 'completed' class
              expect(taskItem.classList.contains('completed')).toBe(false);
              // 2. Checkbox unchecked
              expect(checkbox.checked).toBe(false);
            }
          });

          // Verify that completed and incomplete tasks have different visual indicators
          const completedItems = Array.from(taskItems).filter(item => 
            item.classList.contains('completed')
          );
          const incompleteItems = Array.from(taskItems).filter(item => 
            !item.classList.contains('completed')
          );

          // The number of completed items should match completed tasks
          expect(completedItems.length).toBe(completedTasks.length);
          expect(incompleteItems.length).toBe(incompleteTasks.length);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 7: UI reflects current task state
     * Validates: Requirements 3.3, 5.1, 5.2
     * 
     * For any task list state, the rendered DOM should display all tasks 
     * with their current descriptions and completion statuses accurately reflected.
     */
    it('Property 7: UI reflects current task state', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      // Generator for task lists (arrays of tasks)
      const taskListGenerator = fc.array(
        fc.record({
          description: validDescription,
          completed: fc.boolean()
        }),
        { minLength: 0, maxLength: 20 }
      );

      fc.assert(
        fc.property(taskListGenerator, (taskData) => {
          // Create actual task objects from the generated data
          const tasks = taskData.map(data => {
            const task = createTask(data.description);
            if (task) {
              task.completed = data.completed;
            }
            return task;
          }).filter(task => task !== null);

          // Render the tasks
          uiController.renderTasks(tasks);

          // Verify the DOM reflects the task state
          const taskItems = elements.taskList.querySelectorAll('.task-item');

          // Number of rendered tasks should match
          expect(taskItems.length).toBe(tasks.length);

          // Verify each task is rendered correctly
          tasks.forEach((task, index) => {
            const taskItem = taskItems[index];

            // Check task ID is set
            expect(taskItem.dataset.taskId).toBe(task.id);

            // Check description is displayed
            const descriptionElement = taskItem.querySelector('.task-description');
            expect(descriptionElement).not.toBeNull();
            expect(descriptionElement.textContent).toBe(task.description);

            // Check completion status is reflected
            const checkbox = taskItem.querySelector('.task-checkbox');
            expect(checkbox).not.toBeNull();
            expect(checkbox.checked).toBe(task.completed);

            // Check completed class is applied correctly
            if (task.completed) {
              expect(taskItem.classList.contains('completed')).toBe(true);
            } else {
              expect(taskItem.classList.contains('completed')).toBe(false);
            }
          });

          // Verify empty state visibility
          if (tasks.length === 0) {
            expect(elements.emptyState.hidden).toBe(false);
          } else {
            expect(elements.emptyState.hidden).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Feature: todo-list, Property 11: Input field cleared after addition
     * Validates: Requirements 1.3
     * 
     * For any valid task addition, the input field should be empty after 
     * the task is successfully added.
     */
    it('Property 11: Input field cleared after addition', () => {
      // Generator for valid task descriptions
      const validDescription = fc.string({ minLength: 1, maxLength: 200 })
        .filter(str => str.trim().length > 0);

      fc.assert(
        fc.property(validDescription, (description) => {
          // Set the input field value
          elements.input.value = description;

          // Verify input has the value
          expect(elements.input.value).toBe(description);

          // Call clearInput (simulating what happens after successful task addition)
          uiController.clearInput();

          // Verify input field is now empty
          expect(elements.input.value).toBe('');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests - Edge Cases', () => {
    /**
     * Test empty state display
     * Requirements: 3.4, 5.3
     */
    it('should display empty state when task list is empty', () => {
      // Render empty task list
      uiController.renderTasks([]);

      // Empty state should be visible
      expect(elements.emptyState.hidden).toBe(false);

      // Task list should be empty
      const taskItems = elements.taskList.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(0);
    });

    /**
     * Test single task display
     * Requirements: 5.3
     */
    it('should display single task correctly', () => {
      // Create a single task
      const task = createTask('Single task');
      expect(task).not.toBeNull();

      // Render the task
      uiController.renderTasks([task]);

      // Empty state should be hidden
      expect(elements.emptyState.hidden).toBe(true);

      // Should have exactly one task item
      const taskItems = elements.taskList.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(1);

      // Verify task content
      const taskItem = taskItems[0];
      expect(taskItem.dataset.taskId).toBe(task.id);
      
      const description = taskItem.querySelector('.task-description');
      expect(description.textContent).toBe('Single task');

      const checkbox = taskItem.querySelector('.task-checkbox');
      expect(checkbox.checked).toBe(false);
    });

    /**
     * Test multiple tasks display
     * Requirements: 5.3
     */
    it('should display multiple tasks correctly', () => {
      // Create multiple tasks
      const tasks = [
        createTask('First task'),
        createTask('Second task'),
        createTask('Third task')
      ].filter(t => t !== null);

      // Mark second task as completed
      tasks[1].completed = true;

      // Render the tasks
      uiController.renderTasks(tasks);

      // Empty state should be hidden
      expect(elements.emptyState.hidden).toBe(true);

      // Should have three task items
      const taskItems = elements.taskList.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(3);

      // Verify first task (incomplete)
      expect(taskItems[0].querySelector('.task-description').textContent).toBe('First task');
      expect(taskItems[0].querySelector('.task-checkbox').checked).toBe(false);
      expect(taskItems[0].classList.contains('completed')).toBe(false);

      // Verify second task (completed)
      expect(taskItems[1].querySelector('.task-description').textContent).toBe('Second task');
      expect(taskItems[1].querySelector('.task-checkbox').checked).toBe(true);
      expect(taskItems[1].classList.contains('completed')).toBe(true);

      // Verify third task (incomplete)
      expect(taskItems[2].querySelector('.task-description').textContent).toBe('Third task');
      expect(taskItems[2].querySelector('.task-checkbox').checked).toBe(false);
      expect(taskItems[2].classList.contains('completed')).toBe(false);
    });
  });
});
