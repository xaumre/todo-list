/**
 * Main server entry point
 * Sets up Express application and starts the server
 */

import express from 'express';
import cors from 'cors';
import config, { validateConfig } from './config/env.js';
import { testConnection } from './services/database.js';

// Validate configuration on startup
try {
  validateConfig();
} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}

// Test database connection on startup
try {
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  console.log('Database connection successful');
} catch (error) {
  console.error('Database connection error:', error.message);
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Import routes
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// API routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Todo List API',
    version: '1.0.0'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Task routes
app.use('/api/tasks', taskRoutes);

// Import error handler
import { errorHandler } from './middleware/errorHandler.js';

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`CORS origin: ${config.corsOrigin}`);
});

export default app;
