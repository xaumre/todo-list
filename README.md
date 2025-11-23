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
