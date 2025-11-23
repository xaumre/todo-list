/**
 * Integration Tests
 * Tests complete workflows across all components
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TaskManager } from '../taskManager.js';
import { StorageManager } from '../storage.js';
import { UIController } from '../uiController.js';

describe('Integration Tests - Complete Workflows', () => {
  let storageManager;
  let taskManager;
  let uiController;
  let elements;

  beforeEach(() => {
    // Create DOM elements for testing
    document.body.innerHTML = `
      <form id="add-task-form">
        <input type="text" id="task-input" />
        <button type="submit">Add</button>
      </form>
      <ul id="task-list"></ul>
      <div id="empty-state" hidden></div>
    `;
    
    // Initialize components
    storageManager = new StorageManager();
    taskManager = new TaskManager(storageManager);
    
    elements = {
      form: document.getElementById('add-task-form'),
      input: document.getElementById('task-input'),
      taskList: document.getElementById('task-list'),
      emptyState: document.getElementById('empty-state')
    };
    
    uiController = new UIController(elements);
  });

  describe('Add → Display → Persist Workflow', () => {
    it('should add a task, display it in the UI, and persist to storage', () => {
      // Bind add task handler
      let addedTask = null;
      uiController.bindAddTask((description) => {
        addedTask = taskManager.addTask(description);
        if (addedTask) {
          uiController.clearInput();
          uiController.renderTasks(taskManager.getTasks());
        }
      });

      // Simulate user input
      elements.input.value = 'Buy groceries';
      
      // Simulate form submission
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      elements.form.dispatchEvent(submitEvent);

      // Verify task was added
      expect(addedTask).not.toBeNull();
      expect(addedTask.description).toBe('Buy groceries');
      expect(addedTask.completed).toBe(false);

      // Verify task is in task manager
      const tasks = taskManager.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].description).toBe('Buy groceries');

      // Verify task is displayed in UI
      const taskItems = document.querySelectorAll('.task-item');
      expect(taskItems).toHaveLength(1);
      expect(taskItems[0].querySelector('.task-description').textContent).toBe('Buy groceries');

      // Verify task is persisted to storage
      const storedTasks = storageManager.loadTasks();
      expect(storedTasks).toHaveLength(1);
      expect(storedTasks[0].description).toBe('Buy groceries');
      expect(storedTasks[0].completed).toBe(false);

      // Verify input was cleared
      expect(elements.input.value).toBe('');
    });
  });

  describe('Add → Complete → Persist Workflow', () => {
    it('should add a task, mark it complete, and persist the change', () => {
      // Add a task
      const task = taskManager.addTask('Write tests');
      expect(task).not.toBeNull();

      // Render tasks
      uiController.renderTasks(taskManager.getTasks());

      // Bind toggle handler
      uiController.bindToggleTask((taskId) => {
        taskManager.toggleTaskCompletion(taskId);
        uiController.renderTasks(taskManager.getTasks());
      });

      // Verify task is initially incomplete
      expect(task.completed).toBe(false);
      let taskItems = document.querySelectorAll('.task-item');
      expect(taskItems[0].classList.contains('completed')).toBe(false);

      // Simulate checkbox click
      const checkbox = document.querySelector('.task-checkbox');
      checkbox.checked = true;
      const changeEvent = new Event('change', { bubbles: true });
      checkbox.dispatchEvent(changeEvent);

      // Verify task is now completed in task manager
      const tasks = taskManager.getTasks();
      expect(tasks[0].completed).toBe(true);

      // Verify UI reflects completion
      taskItems = document.querySelectorAll('.task-item');
      expect(taskItems[0].classList.contains('completed')).toBe(true);

      // Verify completion is persisted to storage
      const storedTasks = storageManager.loadTasks();
      expect(storedTasks[0].completed).toBe(true);
    });
  });

  describe('Add → Delete → Persist Workflow', () => {
    it('should add a task, delete it, and persist the deletion', () => {
      // Add a task
      const task = taskManager.addTask('Task to delete');
      expect(task).not.toBeNull();

      // Render tasks
      uiController.renderTasks(taskManager.getTasks());

      // Verify task is displayed
      let taskItems = document.querySelectorAll('.task-item');
      expect(taskItems).toHaveLength(1);

      // Bind delete handler
      uiController.bindDeleteTask((taskId) => {
        taskManager.deleteTask(taskId);
        uiController.renderTasks(taskManager.getTasks());
      });

      // Simulate delete button click
      const deleteButton = document.querySelector('.delete-button');
      const clickEvent = new Event('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: deleteButton, enumerable: true });
      deleteButton.dispatchEvent(clickEvent);

      // Verify task is removed from task manager
      const tasks = taskManager.getTasks();
      expect(tasks).toHaveLength(0);

      // Verify UI shows empty state
      taskItems = document.querySelectorAll('.task-item');
      expect(taskItems).toHaveLength(0);
      expect(elements.emptyState.hidden).toBe(false);

      // Verify deletion is persisted to storage
      const storedTasks = storageManager.loadTasks();
      expect(storedTasks).toHaveLength(0);
    });
  });

  describe('Load → Display Workflow', () => {
    it('should load tasks from storage and display them on startup', () => {
      // Pre-populate storage with tasks
      const existingTasks = [
        {
          id: '1',
          description: 'Existing task 1',
          completed: false,
          createdAt: Date.now()
        },
        {
          id: '2',
          description: 'Existing task 2',
          completed: true,
          createdAt: Date.now()
        }
      ];
      storageManager.saveTasks(existingTasks);

      // Create a new task manager (simulating app startup)
      const newTaskManager = new TaskManager(storageManager);

      // Verify tasks were loaded
      const loadedTasks = newTaskManager.getTasks();
      expect(loadedTasks).toHaveLength(2);
      expect(loadedTasks[0].description).toBe('Existing task 1');
      expect(loadedTasks[0].completed).toBe(false);
      expect(loadedTasks[1].description).toBe('Existing task 2');
      expect(loadedTasks[1].completed).toBe(true);

      // Create new UI controller and render
      const newUIController = new UIController(elements);
      newUIController.renderTasks(loadedTasks);

      // Verify tasks are displayed in UI
      const taskItems = document.querySelectorAll('.task-item');
      expect(taskItems).toHaveLength(2);
      expect(taskItems[0].querySelector('.task-description').textContent).toBe('Existing task 1');
      expect(taskItems[0].classList.contains('completed')).toBe(false);
      expect(taskItems[1].querySelector('.task-description').textContent).toBe('Existing task 2');
      expect(taskItems[1].classList.contains('completed')).toBe(true);
    });

    it('should handle empty storage gracefully on startup', () => {
      // Ensure storage is empty
      localStorage.clear();

      // Create a new task manager (simulating app startup)
      const newTaskManager = new TaskManager(storageManager);

      // Verify no tasks were loaded
      const loadedTasks = newTaskManager.getTasks();
      expect(loadedTasks).toHaveLength(0);

      // Create new UI controller and render
      const newUIController = new UIController(elements);
      newUIController.renderTasks(loadedTasks);

      // Verify empty state is displayed
      const taskItems = document.querySelectorAll('.task-item');
      expect(taskItems).toHaveLength(0);
      expect(elements.emptyState.hidden).toBe(false);
    });
  });
});
