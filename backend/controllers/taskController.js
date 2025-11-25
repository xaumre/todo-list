/**
 * Task Controller
 * Handles task CRUD operations
 */

import {
  getTasksByUserId,
  createTask,
  updateTask,
  deleteTask,
  verifyTaskOwnership
} from '../services/database.js';

/**
 * Get all tasks for the authenticated user
 * @param {import('express').Request & { user: { userId: string, email: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function getTasks(req, res, next) {
  try {
    const userId = req.user.userId;
    
    const tasks = await getTasksByUserId(userId);
    
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new task for the authenticated user
 * @param {import('express').Request & { user: { userId: string, email: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function createNewTask(req, res, next) {
  try {
    const userId = req.user.userId;
    const { description } = req.body;
    
    const task = await createTask(userId, description.trim());
    
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing task
 * @param {import('express').Request & { user: { userId: string, email: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function updateExistingTask(req, res, next) {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;
    const { description, completed } = req.body;
    
    // Validate task ID
    if (!taskId) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Task ID is required'
      });
    }
    
    // Verify task ownership
    const isOwner = await verifyTaskOwnership(taskId, userId);
    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to update this task'
      });
    }
    
    // Build updates object
    const updates = {};
    if (description !== undefined) {
      updates.description = description.trim();
    }
    if (completed !== undefined) {
      updates.completed = completed;
    }
    
    const task = await updateTask(taskId, updates);
    
    if (!task) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Task not found'
      });
    }
    
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a task
 * @param {import('express').Request & { user: { userId: string, email: string } }} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 */
export async function deleteExistingTask(req, res, next) {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;
    
    // Validate task ID
    if (!taskId) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Task ID is required'
      });
    }
    
    // Verify task ownership
    const isOwner = await verifyTaskOwnership(taskId, userId);
    if (!isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to delete this task'
      });
    }
    
    const deleted = await deleteTask(taskId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Task not found'
      });
    }
    
    res.json({ 
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}
