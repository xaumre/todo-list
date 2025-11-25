# Implementation Plan

- [x] 1. Set up backend project structure and dependencies
  - Create backend directory with Node.js/Express project
  - Install dependencies: express, pg, bcrypt, jsonwebtoken, cors, dotenv
  - Set up TypeScript or JSDoc for type safety
  - Create folder structure: controllers, middleware, services, routes, config
  - Set up environment configuration with .env file
  - _Requirements: 7.4, 7.5_

- [x] 2. Set up PostgreSQL database
  - [x] 2.1 Create database schema
    - Write SQL migration for users table
    - Write SQL migration for tasks table
    - Add indexes for performance optimization
    - _Requirements: 4.1, 5.3_
  
  - [x] 2.2 Create database service
    - Implement connection pooling
    - Create user CRUD operations
    - Create task CRUD operations
    - Implement task ownership verification
    - _Requirements: 5.2, 5.4, 5.5_
  
  - [x] 2.3 Write property test for task isolation
    - **Property 6: Task isolation between users**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 2.4 Write unit tests for database service
    - Test user creation and retrieval
    - Test task CRUD operations
    - Test ownership verification
    - _Requirements: 5.2, 5.4, 5.5_

- [x] 3. Implement authentication system
  - [x] 3.1 Create authentication service
    - Implement password hashing with bcrypt
    - Implement JWT token generation
    - Implement JWT token verification
    - _Requirements: 7.4, 7.5_
  
  - [x] 3.2 Write property test for password hashing
    - **Property 11: Password hashing security**
    - **Validates: Requirements 7.4**
  
  - [x] 3.3 Create authentication middleware
    - Implement token verification middleware
    - Extract user ID from token
    - Handle authentication errors
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 3.4 Write property test for unauthorized requests
    - **Property 10: Unauthorized request rejection**
    - **Validates: Requirements 7.2, 7.3**
  
  - [x] 3.5 Write unit tests for authentication service
    - Test password hashing and verification
    - Test JWT generation and validation
    - Test token expiration
    - _Requirements: 7.4, 7.5_

- [x] 4. Implement authentication endpoints
  - [x] 4.1 Create registration endpoint
    - Implement POST /api/auth/register
    - Validate email format and password length
    - Check for duplicate emails
    - Hash password and create user
    - Generate JWT token
    - Return token and user data
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 4.2 Write property test for registration
    - **Property 1: Registration creates unique users**
    - **Validates: Requirements 1.1, 1.2**
  
  - [x] 4.3 Write property test for password validation
    - **Property 2: Password minimum length enforcement**
    - **Validates: Requirements 1.3**
  
  - [x] 4.4 Write property test for auto-login
    - **Property 3: Successful registration auto-login**
    - **Validates: Requirements 1.4**
  
  - [x] 4.5 Create login endpoint
    - Implement POST /api/auth/login
    - Validate credentials
    - Verify password hash
    - Generate JWT token
    - Return token and user data
    - _Requirements: 2.1, 2.2, 2.4_
  
  - [x] 4.6 Write property test for valid login
    - **Property 4: Valid credentials authenticate**
    - **Validates: Requirements 2.1**
  
  - [x] 4.7 Write property test for invalid login
    - **Property 5: Invalid credentials rejection**
    - **Validates: Requirements 2.2**
  
  - [x] 4.8 Create current user endpoint
    - Implement GET /api/auth/me
    - Require authentication
    - Return current user data
    - _Requirements: 2.4, 6.1_
  
  - [ ]* 4.9 Write integration tests for auth endpoints
    - Test registration flow
    - Test login flow
    - Test authentication errors
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 5. Implement task API endpoints
  - [x] 5.1 Create get tasks endpoint
    - Implement GET /api/tasks
    - Require authentication
    - Filter tasks by authenticated user ID
    - Return user's tasks only
    - _Requirements: 4.4, 5.1_
  
  - [x] 5.2 Create create task endpoint
    - Implement POST /api/tasks
    - Require authentication
    - Associate task with authenticated user
    - Persist to database
    - Return created task
    - _Requirements: 4.1, 5.3_
  
  - [x] 5.3 Create update task endpoint
    - Implement PUT /api/tasks/:id
    - Require authentication
    - Verify task ownership
    - Update task in database
    - Return updated task
    - _Requirements: 4.3, 5.4_
  
  - [x] 5.4 Create delete task endpoint
    - Implement DELETE /api/tasks/:id
    - Require authentication
    - Verify task ownership
    - Delete task from database
    - Return success response
    - _Requirements: 4.2, 5.5_
  
  - [x] 5.5 Write property test for task ownership
    - **Property 7: Task ownership verification**
    - **Validates: Requirements 5.4, 5.5**
  
  - [x] 5.6 Write property test for task persistence
    - **Property 12: Task CRUD persistence**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  
  - [ ]* 5.7 Write integration tests for task endpoints
    - Test task creation with authentication
    - Test task retrieval filtering
    - Test task updates with ownership verification
    - Test task deletion with ownership verification
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.4, 5.5_

- [x] 6. Implement error handling and validation
  - [x] 6.1 Add input validation middleware
    - Validate email format
    - Validate password requirements
    - Validate required fields
    - Return appropriate error messages
    - _Requirements: 1.2, 1.3, 8.3_
  
  - [x] 6.2 Add global error handler
    - Catch and format errors
    - Log errors appropriately
    - Return user-friendly error messages
    - Handle database errors
    - _Requirements: 4.5, 8.3, 8.4_
  
  - [ ]* 6.3 Write unit tests for error handling
    - Test validation errors
    - Test authentication errors
    - Test authorization errors
    - Test database errors
    - _Requirements: 4.5, 8.3, 8.4_

- [x] 7. Checkpoint - Backend API complete
  - Ensure all backend tests pass, ask the user if questions arise.

- [x] 8. Create frontend authentication service
  - [x] 8.1 Implement AuthService class
    - Create register method
    - Create login method
    - Create logout method
    - Implement token storage in localStorage
    - Implement token retrieval
    - Implement authentication state checking
    - _Requirements: 1.1, 2.1, 3.1, 3.2, 6.1, 6.2_
  
  - [x] 8.2 Write property test for logout
    - **Property 8: Logout clears session**
    - **Validates: Requirements 3.1, 3.2**
  
  - [x] 8.3 Write property test for token persistence
    - **Property 9: Token persistence across refresh**
    - **Validates: Requirements 6.1, 6.2, 6.4**
  
  - [ ]* 8.4 Write unit tests for AuthService
    - Test token storage and retrieval
    - Test authentication state management
    - Test logout functionality
    - _Requirements: 3.1, 3.2, 6.1, 6.2_

- [x] 9. Create frontend API client
  - [x] 9.1 Implement APIClient class
    - Create HTTP request methods (GET, POST, PUT, DELETE)
    - Add authentication token to request headers
    - Handle response parsing
    - Handle error responses
    - Implement retry logic for network errors
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.4_
  
  - [ ]* 9.2 Write unit tests for APIClient
    - Test request formatting
    - Test header injection
    - Test error handling
    - Test retry logic
    - _Requirements: 4.5, 8.4_

- [x] 10. Create authentication UI components
  - [x] 10.1 Create login form HTML and CSS
    - Design login form layout
    - Add email and password inputs
    - Add submit button
    - Add link to registration form
    - Style form with existing CSS patterns
    - _Requirements: 2.1, 8.1_
  
  - [x] 10.2 Create registration form HTML and CSS
    - Design registration form layout
    - Add email and password inputs
    - Add password confirmation input
    - Add submit button
    - Add link to login form
    - Style form consistently
    - _Requirements: 1.1, 8.1_
  
  - [x] 10.3 Implement AuthUI controller
    - Create form show/hide methods
    - Implement form validation
    - Add loading state indicators
    - Add error message display
    - Add success message display
    - Handle form submission
    - _Requirements: 8.1, 8.2, 8.3, 8.5_
  
  - [ ]* 10.4 Write unit tests for AuthUI
    - Test form validation
    - Test error display
    - Test loading states
    - _Requirements: 8.1, 8.3, 8.5_

- [x] 11. Integrate authentication with existing app
  - [x] 11.1 Update app.js initialization
    - Check authentication state on load
    - Show login form if not authenticated
    - Show task list if authenticated
    - Initialize AuthService and APIClient
    - _Requirements: 2.3, 6.1, 6.2_
  
  - [x] 11.2 Add logout functionality to UI
    - Add logout button to header
    - Implement logout handler
    - Clear UI state on logout
    - Redirect to login form
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 11.3 Update TaskManager to use API
    - Replace localStorage with API calls
    - Update addTask to call POST /api/tasks
    - Update deleteTask to call DELETE /api/tasks/:id
    - Update toggleTaskCompletion to call PUT /api/tasks/:id
    - Load tasks from GET /api/tasks on login
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 11.4 Add authentication error handling
    - Detect 401 responses
    - Redirect to login on authentication failure
    - Clear stored token on 401
    - Display appropriate error messages
    - _Requirements: 6.3, 8.3, 8.4_
  
  - [ ]* 11.5 Write integration tests for authenticated flows
    - Test registration → task creation flow
    - Test login → task retrieval flow
    - Test logout → redirect flow
    - Test session persistence across refresh
    - _Requirements: 1.4, 2.3, 3.3, 6.1, 6.4_

- [x] 12. Add user feedback and loading states
  - [x] 12.1 Implement loading indicators
    - Add spinner component
    - Show during API requests
    - Disable forms during submission
    - _Requirements: 8.1, 8.5_
  
  - [x] 12.2 Implement toast notifications
    - Create toast notification component
    - Show success messages
    - Show error messages
    - Auto-dismiss after timeout
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [ ]* 12.3 Write unit tests for UI feedback
    - Test loading state display
    - Test notification display
    - Test form disabling
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 13. Deploy backend to Render
  - [x] 13.1 Create PostgreSQL database on Render
    - Set up Render PostgreSQL instance
    - Run database migrations
    - Configure connection string
    - _Requirements: 4.1, 4.4_
  
  - [x] 13.2 Deploy backend web service
    - Create Render web service for backend
    - Configure environment variables
    - Set up build and start commands
    - Configure CORS for frontend origin
    - _Requirements: All backend requirements_
  
  - [x] 13.3 Update frontend to use production API
    - Configure API base URL for production
    - Update CORS settings
    - Test production deployment
    - _Requirements: All_

- [x] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
