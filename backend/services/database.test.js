/**
 * Property-based tests and unit tests for database service
 * Tests task isolation and other database operations
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  pool,
  createUser,
  findUserByEmail,
  findUserById,
  createTask,
  getTasksByUserId,
  updateTask,
  deleteTask,
  verifyTaskOwnership,
  closePool
} from './database.js';

// Test database setup
beforeAll(async () => {
  // Verify database connection
  const client = await pool.connect();
  await client.query('SELECT NOW()');
  client.release();
});

afterAll(async () => {
  await closePool();
});

// Clean up test data before each test
beforeEach(async () => {
  // Delete all test tasks and users
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

// ============================================================================
// Generators for property-based testing
// ============================================================================

/**
 * Generate a valid email address with unique UUID
 */
const emailArbitrary = fc.uuid().map(uuid => `user-${uuid}@example.com`);

/**
 * Generate a valid password hash (simulated)
 */
const passwordHashArbitrary = fc.string({ minLength: 60, maxLength: 60 });

/**
 * Generate a task description
 */
const taskDescriptionArbitrary = fc.string({ minLength: 1, maxLength: 200 });

// ============================================================================
// Unit Tests
// ============================================================================

describe('Database Service - Unit Tests', () => {
  describe('User Operations', () => {
    test('should create a new user with email and password hash', async () => {
      const email = 'test@example.com';
      const passwordHash = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO';
      
      const user = await createUser(email, passwordHash);
      
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.created_at).toBeDefined();
      expect(user.updated_at).toBeDefined();
      expect(user.password_hash).toBeUndefined(); // Should not be returned
    });

    test('should find user by email', async () => {
      const email = 'findme@example.com';
      const passwordHash = '$2b$10$testHashValue1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      const createdUser = await createUser(email, passwordHash);
      const foundUser = await findUserByEmail(email);
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(email);
      expect(foundUser.password_hash).toBe(passwordHash);
    });

    test('should return null when user email not found', async () => {
      const foundUser = await findUserByEmail('nonexistent@example.com');
      
      expect(foundUser).toBeNull();
    });

    test('should find user by ID', async () => {
      const email = 'findbyid@example.com';
      const passwordHash = '$2b$10$testHashValue1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      
      const createdUser = await createUser(email, passwordHash);
      const foundUser = await findUserById(createdUser.id);
      
      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(email);
      expect(foundUser.password_hash).toBe(passwordHash);
    });

    test('should return null when user ID not found', async () => {
      const foundUser = await findUserById('00000000-0000-0000-0000-000000000000');
      
      expect(foundUser).toBeNull();
    });
  });

  describe('Task CRUD Operations', () => {
    test('should create a new task for a user', async () => {
      const user = await createUser('taskowner@example.com', 'hash123');
      const description = 'Test task description';
      
      const task = await createTask(user.id, description);
      
      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.user_id).toBe(user.id);
      expect(task.description).toBe(description);
      expect(task.completed).toBe(false);
      expect(task.created_at).toBeDefined();
      expect(task.updated_at).toBeDefined();
    });

    test('should retrieve all tasks for a user', async () => {
      const user = await createUser('multitask@example.com', 'hash123');
      
      await createTask(user.id, 'Task 1');
      await createTask(user.id, 'Task 2');
      await createTask(user.id, 'Task 3');
      
      const tasks = await getTasksByUserId(user.id);
      
      expect(tasks).toHaveLength(3);
      expect(tasks.every(t => t.user_id === user.id)).toBe(true);
    });

    test('should return empty array when user has no tasks', async () => {
      const user = await createUser('notasks@example.com', 'hash123');
      
      const tasks = await getTasksByUserId(user.id);
      
      expect(tasks).toEqual([]);
    });

    test('should update task description', async () => {
      const user = await createUser('updater@example.com', 'hash123');
      const task = await createTask(user.id, 'Original description');
      
      const updatedTask = await updateTask(task.id, { description: 'Updated description' });
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(task.id);
      expect(updatedTask.description).toBe('Updated description');
      expect(updatedTask.completed).toBe(false);
    });

    test('should update task completion status', async () => {
      const user = await createUser('completer@example.com', 'hash123');
      const task = await createTask(user.id, 'Task to complete');
      
      const updatedTask = await updateTask(task.id, { completed: true });
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask.id).toBe(task.id);
      expect(updatedTask.completed).toBe(true);
      expect(updatedTask.description).toBe('Task to complete');
    });

    test('should update both description and completion status', async () => {
      const user = await createUser('bothupdate@example.com', 'hash123');
      const task = await createTask(user.id, 'Original');
      
      const updatedTask = await updateTask(task.id, { 
        description: 'New description',
        completed: true 
      });
      
      expect(updatedTask).toBeDefined();
      expect(updatedTask.description).toBe('New description');
      expect(updatedTask.completed).toBe(true);
    });

    test('should delete a task', async () => {
      const user = await createUser('deleter@example.com', 'hash123');
      const task = await createTask(user.id, 'Task to delete');
      
      const deleted = await deleteTask(task.id);
      
      expect(deleted).toBe(true);
      
      const tasks = await getTasksByUserId(user.id);
      expect(tasks).toHaveLength(0);
    });

    test('should return false when deleting non-existent task', async () => {
      const deleted = await deleteTask('00000000-0000-0000-0000-000000000000');
      
      expect(deleted).toBe(false);
    });
  });

  describe('Task Ownership Verification', () => {
    test('should verify task belongs to user', async () => {
      const user = await createUser('owner@example.com', 'hash123');
      const task = await createTask(user.id, 'My task');
      
      const isOwner = await verifyTaskOwnership(task.id, user.id);
      
      expect(isOwner).toBe(true);
    });

    test('should reject ownership when task belongs to different user', async () => {
      const user1 = await createUser('user1@example.com', 'hash123');
      const user2 = await createUser('user2@example.com', 'hash456');
      const task = await createTask(user1.id, 'User 1 task');
      
      const isOwner = await verifyTaskOwnership(task.id, user2.id);
      
      expect(isOwner).toBe(false);
    });

    test('should return false for non-existent task', async () => {
      const user = await createUser('checker@example.com', 'hash123');
      
      const isOwner = await verifyTaskOwnership('00000000-0000-0000-0000-000000000000', user.id);
      
      expect(isOwner).toBe(false);
    });
  });
});

// ============================================================================
// Property-Based Tests
// ============================================================================

describe('Database Service - Property-Based Tests', () => {
  /**
   * **Feature: multi-user-auth, Property 6: Task isolation between users**
   * **Validates: Requirements 5.1, 5.2**
   * 
   * For any two different authenticated users, the tasks returned for user A 
   * should not include any tasks belonging to user B.
   */
  test('Property 6: Task isolation between users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(emailArbitrary, emailArbitrary).filter(([email1, email2]) => email1 !== email2),
        passwordHashArbitrary,
        passwordHashArbitrary,
        fc.array(taskDescriptionArbitrary, { minLength: 1, maxLength: 5 }),
        fc.array(taskDescriptionArbitrary, { minLength: 1, maxLength: 5 }),
        async ([email1, email2], hash1, hash2, user1Tasks, user2Tasks) => {
          // Create two different users
          const user1 = await createUser(email1, hash1);
          const user2 = await createUser(email2, hash2);

          // Create tasks for user 1
          const user1TaskIds = [];
          for (const description of user1Tasks) {
            const task = await createTask(user1.id, description);
            user1TaskIds.push(task.id);
          }

          // Create tasks for user 2
          const user2TaskIds = [];
          for (const description of user2Tasks) {
            const task = await createTask(user2.id, description);
            user2TaskIds.push(task.id);
          }

          // Get tasks for user 1
          const retrievedUser1Tasks = await getTasksByUserId(user1.id);
          
          // Get tasks for user 2
          const retrievedUser2Tasks = await getTasksByUserId(user2.id);

          // Verify user 1's tasks don't include any of user 2's tasks
          const retrievedUser1TaskIds = retrievedUser1Tasks.map(t => t.id);
          for (const user2TaskId of user2TaskIds) {
            expect(retrievedUser1TaskIds).not.toContain(user2TaskId);
          }

          // Verify user 2's tasks don't include any of user 1's tasks
          const retrievedUser2TaskIds = retrievedUser2Tasks.map(t => t.id);
          for (const user1TaskId of user1TaskIds) {
            expect(retrievedUser2TaskIds).not.toContain(user1TaskId);
          }

          // Verify each user only sees their own tasks
          expect(retrievedUser1Tasks.length).toBe(user1Tasks.length);
          expect(retrievedUser2Tasks.length).toBe(user2Tasks.length);

          // Verify all returned tasks belong to the correct user
          for (const task of retrievedUser1Tasks) {
            expect(task.user_id).toBe(user1.id);
          }
          
          for (const task of retrievedUser2Tasks) {
            expect(task.user_id).toBe(user2.id);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in the design
    );
  });
});
