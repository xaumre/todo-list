/**
 * Task Routes
 * Defines routes for task CRUD endpoints
 */

import express from 'express';
import {
  getTasks,
  createNewTask,
  updateExistingTask,
  deleteExistingTask
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTaskCreation, validateTaskUpdate } from '../middleware/validation.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.get('/', getTasks);
router.post('/', validateTaskCreation, createNewTask);
router.put('/:id', validateTaskUpdate, updateExistingTask);
router.delete('/:id', deleteExistingTask);

export default router;
