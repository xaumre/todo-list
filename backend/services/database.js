/**
 * Database Service
 * Handles PostgreSQL connection pooling and data access operations
 */

import pg from 'pg';
import config from '../config/env.js';

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 * Manages database connections efficiently
 */
export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection cannot be established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// ============================================================================
// User Operations
// ============================================================================

/**
 * Create a new user
 * @param {string} email - User email address
 * @param {string} passwordHash - Bcrypt hashed password
 * @returns {Promise<import('../types.js').User>} Created user
 */
export async function createUser(email, passwordHash) {
  const query = `
    INSERT INTO users (email, password_hash)
    VALUES ($1, $2)
    RETURNING id, email, created_at, updated_at
  `;
  
  const result = await pool.query(query, [email, passwordHash]);
  return result.rows[0];
}

/**
 * Find user by email address
 * @param {string} email - User email address
 * @returns {Promise<import('../types.js').User | null>} User or null if not found
 */
export async function findUserByEmail(email) {
  const query = `
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE email = $1
  `;
  
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * Find user by ID
 * @param {string} userId - User UUID
 * @returns {Promise<import('../types.js').User | null>} User or null if not found
 */
export async function findUserById(userId) {
  const query = `
    SELECT id, email, password_hash, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

// ============================================================================
// Task Operations
// ============================================================================

/**
 * Create a new task for a user
 * @param {string} userId - Owner user UUID
 * @param {string} description - Task description
 * @returns {Promise<import('../types.js').Task>} Created task
 */
export async function createTask(userId, description) {
  const query = `
    INSERT INTO tasks (user_id, description, completed)
    VALUES ($1, $2, FALSE)
    RETURNING id, user_id, description, completed, created_at, updated_at
  `;
  
  const result = await pool.query(query, [userId, description]);
  return result.rows[0];
}

/**
 * Get all tasks for a specific user
 * @param {string} userId - User UUID
 * @returns {Promise<import('../types.js').Task[]>} Array of user's tasks
 */
export async function getTasksByUserId(userId) {
  const query = `
    SELECT id, user_id, description, completed, created_at, updated_at
    FROM tasks
    WHERE user_id = $1
    ORDER BY created_at DESC
  `;
  
  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Update a task
 * @param {string} taskId - Task UUID
 * @param {Partial<import('../types.js').Task>} updates - Fields to update
 * @returns {Promise<import('../types.js').Task | null>} Updated task or null if not found
 */
export async function updateTask(taskId, updates) {
  const fields = [];
  const values = [];
  let paramCount = 1;
  
  // Build dynamic UPDATE query based on provided fields
  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    values.push(updates.description);
  }
  
  if (updates.completed !== undefined) {
    fields.push(`completed = $${paramCount++}`);
    values.push(updates.completed);
  }
  
  // Always update the updated_at timestamp
  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  
  if (fields.length === 1) {
    // Only updated_at would be updated, nothing to do
    return findTaskById(taskId);
  }
  
  values.push(taskId);
  
  const query = `
    UPDATE tasks
    SET ${fields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, user_id, description, completed, created_at, updated_at
  `;
  
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

/**
 * Delete a task
 * @param {string} taskId - Task UUID
 * @returns {Promise<boolean>} True if task was deleted
 */
export async function deleteTask(taskId) {
  const query = `
    DELETE FROM tasks
    WHERE id = $1
    RETURNING id
  `;
  
  const result = await pool.query(query, [taskId]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Find task by ID
 * @param {string} taskId - Task UUID
 * @returns {Promise<import('../types.js').Task | null>} Task or null if not found
 */
export async function findTaskById(taskId) {
  const query = `
    SELECT id, user_id, description, completed, created_at, updated_at
    FROM tasks
    WHERE id = $1
  `;
  
  const result = await pool.query(query, [taskId]);
  return result.rows[0] || null;
}

/**
 * Verify that a task belongs to a specific user
 * @param {string} taskId - Task UUID
 * @param {string} userId - User UUID
 * @returns {Promise<boolean>} True if task belongs to user
 */
export async function verifyTaskOwnership(taskId, userId) {
  const query = `
    SELECT id
    FROM tasks
    WHERE id = $1 AND user_id = $2
  `;
  
  const result = await pool.query(query, [taskId, userId]);
  return (result.rowCount ?? 0) > 0;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Close the database pool
 * Should be called when shutting down the application
 */
export async function closePool() {
  await pool.end();
}

export default {
  pool,
  testConnection,
  createUser,
  findUserByEmail,
  findUserById,
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
  findTaskById,
  verifyTaskOwnership,
  closePool
};
