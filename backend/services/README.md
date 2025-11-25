# Services

This directory contains business logic and data access services.

## Database Service (`database.js`)

Handles PostgreSQL connection pooling and data access operations.

### Connection Pool

- Uses `pg` Pool for efficient connection management
- Max 20 concurrent connections
- 30 second idle timeout
- 2 second connection timeout

### User Operations

- `createUser(email, passwordHash)` - Create new user account
- `findUserByEmail(email)` - Find user by email address
- `findUserById(userId)` - Find user by UUID

### Task Operations

- `createTask(userId, description)` - Create new task for user
- `getTasksByUserId(userId)` - Get all tasks for a user
- `updateTask(taskId, updates)` - Update task fields
- `deleteTask(taskId)` - Delete a task
- `findTaskById(taskId)` - Find task by UUID
- `verifyTaskOwnership(taskId, userId)` - Verify task belongs to user

### Utility Functions

- `testConnection()` - Test database connectivity
- `closePool()` - Close connection pool (for shutdown)

## Future Services

Services to be added:
- `authService.js` - Authentication logic (password hashing, JWT generation)
- `userService.js` - User-related business logic
- `taskService.js` - Task-related business logic
