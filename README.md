# To-Do List Application

A simple, elegant to-do list application built with vanilla JavaScript, featuring property-based testing for correctness guarantees.

## Features

- ✅ Add, complete, and delete tasks
- 💾 Persistent storage using browser's Local Storage
- ♿ Fully accessible with ARIA labels and keyboard navigation
- 📱 Responsive design
- ✨ Clean, minimal interface
- 🧪 Comprehensive test suite with property-based testing

## Live Demo

[View Live Demo](https://xaumre.github.io/todo-list)

## Getting Started

### Running Locally

1. Clone the repository:
```bash
git clone https://github.com/xaumre/todo-list.git
cd todo-list
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:8000`

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with flexbox
- **Vanilla JavaScript (ES6+)** - No framework dependencies
- **Vitest** - Unit testing framework
- **fast-check** - Property-based testing library

## Architecture

The application follows the MVC (Model-View-Controller) pattern:

- **Model**: Task data structure and storage management
- **View**: DOM manipulation and UI rendering (UIController)
- **Controller**: Event handling and coordination (TaskManager)

## Notification System

The application uses a dual notification system with clear separation of concerns:

### Notification Types

1. **Toast Notifications** (`ToastNotification` class)
   - Temporary, auto-dismissing pop-up messages
   - Used for operation feedback (success, error, info, warning)
   - Appear in the top-right corner
   - Auto-dismiss after 5 seconds (except errors which require manual dismissal)

2. **Inline Messages** (`AuthUI` class)
   - Persistent messages within forms
   - Used exclusively for form validation errors
   - Remain visible until corrected or form is switched
   - Provide context-specific feedback

### Notification Decision Matrix

Use this matrix to determine which notification system to use when adding new features:

| Event Type | Toast | Inline | Rationale |
|------------|-------|--------|-----------|
| Login success | ✓ | ✗ | Operation feedback |
| Registration success | ✓ | ✗ | Operation feedback |
| Logout | ✓ | ✗ | Operation feedback |
| Form validation error | ✗ | ✓ | Validation feedback (user-focused context) |
| Authentication server error | ✗ | ✓ | Form context feedback |
| Session expiration | ✓ | ✓ | **EXCEPTION**: Toast for attention + inline for persistent context |
| Task operation success | ✓ | ✗ | Operation feedback |
| Task operation error | ✓ | ✗ | Operation feedback |

### General Rules

- **Toast notifications**: Use for completed asynchronous operations (success/error/info)
- **Inline messages**: Use ONLY for client-side form validation errors
- **Never trigger both systems** for the same event (except session expiration)
- **Session expiration is the ONLY exception** where both are appropriate

### Developer Examples

#### Example 1: Showing a success toast for a task operation

```javascript
// ✓ CORRECT: Use toast for operation feedback
toast.success('Task added', 'Your task has been added successfully.');

// ✗ INCORRECT: Don't use inline messages for operations
authUI.displaySuccess('Task added', 'login'); // Wrong!
```

#### Example 2: Showing validation errors

```javascript
// ✓ CORRECT: Use inline messages for validation errors
const validation = authUI.validateLoginForm();
if (!validation.valid) {
  authUI.displayError(validation.errors.join('. '), 'login');
  return;
}

// ✗ INCORRECT: Don't use toast for validation errors
toast.error('Validation failed', 'Email is required'); // Wrong!
```

#### Example 3: Handling session expiration (special case)

```javascript
// ✓ CORRECT: Use BOTH for session expiration
toast.dismissAll(); // Clear existing toasts first
authUI.displayError('Your session has expired. Please log in again.', 'login');
toast.warning('Session expired', 'Please log in again to continue.');
```

### Implementation Details

For detailed implementation guidance, see:
- Code comments in `app.js` (Notification Decision Matrix)
- Code comments in `authUI.js` (Inline message strategy)
- Code comments in `toastNotification.js` (Toast notification strategy)
- Design document: `.kiro/specs/duplicate-notifications-fix/design.md`

## Testing

This project uses a dual testing approach:

- **Unit Tests**: Verify specific examples and edge cases
- **Property-Based Tests**: Verify universal properties across all inputs

All 11 correctness properties from the design specification are validated through property-based testing.

## Project Structure

```
.
├── index.html          # Main HTML file
├── styles.css          # Application styles
├── app.js             # Application entry point
├── task.js            # Task model
├── taskManager.js     # Task management logic
├── storage.js         # Local storage management
├── uiController.js    # UI rendering and events
├── test/              # Test files
│   ├── task.test.js
│   ├── taskManager.test.js
│   ├── storage.test.js
│   ├── uiController.test.js
│   └── integration.test.js
└── .kiro/specs/       # Feature specifications
    └── todo-list/
        ├── requirements.md
        ├── design.md
        └── tasks.md

```

## License

MIT
