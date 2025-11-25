/**
 * Type definitions for the application
 * Using JSDoc for type safety without TypeScript
 */

/**
 * @typedef {Object} User
 * @property {string} id - User UUID
 * @property {string} email - User email address
 * @property {string} password_hash - Hashed password
 * @property {Date} created_at - Account creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Task UUID
 * @property {string} user_id - Owner user UUID
 * @property {string} description - Task description
 * @property {boolean} completed - Completion status
 * @property {Date} created_at - Task creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT authentication token
 * @property {UserPublic} user - User information
 */

/**
 * @typedef {Object} UserPublic
 * @property {string} id - User UUID
 * @property {string} email - User email address
 * @property {string} created_at - Account creation timestamp
 */

/**
 * @typedef {Object} TokenPayload
 * @property {string} userId - User UUID
 * @property {string} email - User email
 * @property {number} iat - Issued at timestamp
 * @property {number} exp - Expiration timestamp
 */

/**
 * @typedef {Object} CreateTaskRequest
 * @property {string} description - Task description
 */

/**
 * @typedef {Object} UpdateTaskRequest
 * @property {string} [description] - Updated task description
 * @property {boolean} [completed] - Updated completion status
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} error - Error message
 * @property {string} [stack] - Stack trace (development only)
 */

export {};
