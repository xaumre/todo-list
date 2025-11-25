/**
 * UI Controller
 * Handles DOM manipulation and event binding for the to-do list application
 */

/**
 * UIController class for managing UI rendering and user interactions
 */
export class UIController {
  /**
   * Creates a new UIController instance
   * @param {Object} elements - DOM element references
   * @param {HTMLFormElement} elements.form - The task form element
   * @param {HTMLInputElement} elements.input - The task input field
   * @param {HTMLElement} elements.taskList - The task list container (ul)
   * @param {HTMLElement} elements.emptyState - The empty state element
   */
  constructor(elements) {
    this.form = elements.form;
    this.input = elements.input;
    this.taskList = elements.taskList;
    this.emptyState = elements.emptyState;
    
    // Handler references for event binding
    this.addTaskHandler = null;
    this.deleteTaskHandler = null;
    this.toggleTaskHandler = null;
    
    // Store bound listener functions so we can remove them
    this.boundSubmitListener = null;
    this.boundClickListener = null;
    this.boundChangeListener = null;
    this.boundKeydownListener = null;
  }

  /**
   * Renders the task list to the DOM
   * @param {Array} tasks - Array of task objects to render
   */
  renderTasks(tasks) {
    // Clear existing task list
    this.taskList.innerHTML = '';

    // Show/hide empty state
    if (tasks.length === 0) {
      this.showEmptyState();
      return;
    } else {
      this.hideEmptyState();
    }

    // Render each task
    tasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      this.taskList.appendChild(taskElement);
    });
  }

  /**
   * Creates a DOM element for a single task
   * @param {Object} task - Task object
   * @returns {HTMLElement} - Task list item element
   */
  createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.taskId = task.id;
    li.setAttribute('role', 'listitem');
    
    // Add completed class if task is completed
    if (task.completed) {
      li.classList.add('completed');
      li.setAttribute('aria-label', `Completed task: ${task.description}`);
    } else {
      li.setAttribute('aria-label', `Incomplete task: ${task.description}`);
    }

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.id = `task-checkbox-${task.id}`;
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`);
    checkbox.setAttribute('aria-checked', task.completed.toString());
    
    // Create task description as label for better accessibility
    const description = document.createElement('label');
    description.className = 'task-description';
    description.htmlFor = `task-checkbox-${task.id}`;
    description.textContent = task.description;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.textContent = 'Delete';
    deleteButton.type = 'button';
    deleteButton.setAttribute('aria-label', `Delete task: ${task.description}`);

    // Assemble task element
    li.appendChild(checkbox);
    li.appendChild(description);
    li.appendChild(deleteButton);

    return li;
  }

  /**
   * Shows the empty state message
   */
  showEmptyState() {
    if (this.emptyState) {
      this.emptyState.hidden = false;
    }
  }

  /**
   * Hides the empty state message
   */
  hideEmptyState() {
    if (this.emptyState) {
      this.emptyState.hidden = true;
    }
  }

  /**
   * Clears the input field and manages focus
   */
  clearInput() {
    if (this.input) {
      this.input.value = '';
      // Return focus to input field for better accessibility
      this.input.focus();
    }
  }

  /**
   * Binds the add task event handler
   * @param {Function} handler - Handler function that receives task description
   */
  bindAddTask(handler) {
    this.addTaskHandler = handler;
    
    // Remove old listener if it exists
    if (this.form && this.boundSubmitListener) {
      this.form.removeEventListener('submit', this.boundSubmitListener);
    }
    
    // Create and store bound listener
    if (this.form) {
      this.boundSubmitListener = (e) => {
        e.preventDefault();
        
        const description = this.input.value;
        handler(description);
      };
      
      this.form.addEventListener('submit', this.boundSubmitListener);
    }
  }

  /**
   * Binds the delete task event handler
   * @param {Function} handler - Handler function that receives task ID
   */
  bindDeleteTask(handler) {
    this.deleteTaskHandler = handler;
    
    // Remove old listener if it exists
    if (this.taskList && this.boundClickListener) {
      this.taskList.removeEventListener('click', this.boundClickListener);
    }
    
    // Create and store bound listener
    if (this.taskList) {
      this.boundClickListener = (e) => {
        if (e.target.classList.contains('delete-button')) {
          const taskItem = e.target.closest('.task-item');
          if (taskItem) {
            const taskId = taskItem.dataset.taskId;
            handler(taskId);
          }
        }
      };
      
      this.taskList.addEventListener('click', this.boundClickListener);
    }
  }

  /**
   * Binds the toggle task completion event handler
   * @param {Function} handler - Handler function that receives task ID
   */
  bindToggleTask(handler) {
    this.toggleTaskHandler = handler;
    
    // Remove old listener if it exists
    if (this.taskList && this.boundChangeListener) {
      this.taskList.removeEventListener('change', this.boundChangeListener);
    }
    
    // Create and store bound listener
    if (this.taskList) {
      this.boundChangeListener = (e) => {
        if (e.target.classList.contains('task-checkbox')) {
          const taskItem = e.target.closest('.task-item');
          if (taskItem) {
            const taskId = taskItem.dataset.taskId;
            handler(taskId);
          }
        }
      };
      
      this.taskList.addEventListener('change', this.boundChangeListener);
    }
  }

  /**
   * Sets up keyboard navigation for accessibility
   */
  setupKeyboardNavigation() {
    // Remove old listener if it exists
    if (this.taskList && this.boundKeydownListener) {
      this.taskList.removeEventListener('keydown', this.boundKeydownListener);
    }
    
    // Create and store bound listener for task list
    if (this.taskList) {
      this.boundKeydownListener = (e) => {
        const target = e.target;
        
        // Handle Enter key on delete buttons
        if (e.key === 'Enter' && target.classList.contains('delete-button')) {
          e.preventDefault();
          target.click();
        }
        
        // Handle Space key on checkboxes (already handled by browser, but ensure consistency)
        if (e.key === ' ' && target.classList.contains('task-checkbox')) {
          // Let browser handle this naturally
          return;
        }
      };
      
      this.taskList.addEventListener('keydown', this.boundKeydownListener);
    }

    // Note: Input keydown listener is intentionally not stored/removed
    // as it's a simple form submission helper that's safe to re-attach
    if (this.input) {
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.form) {
            this.form.requestSubmit();
          }
        }
      });
    }
  }

  /**
   * Cleanup method to remove all event listeners
   * Call this before destroying the UIController instance
   */
  cleanup() {
    if (this.form && this.boundSubmitListener) {
      this.form.removeEventListener('submit', this.boundSubmitListener);
    }
    
    if (this.taskList && this.boundClickListener) {
      this.taskList.removeEventListener('click', this.boundClickListener);
    }
    
    if (this.taskList && this.boundChangeListener) {
      this.taskList.removeEventListener('change', this.boundChangeListener);
    }
    
    if (this.taskList && this.boundKeydownListener) {
      this.taskList.removeEventListener('keydown', this.boundKeydownListener);
    }
    
    // Clear references
    this.boundSubmitListener = null;
    this.boundClickListener = null;
    this.boundChangeListener = null;
    this.boundKeydownListener = null;
  }
}
