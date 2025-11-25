/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

/**
 * @typedef {Object} Config
 * @property {number} port - Server port
 * @property {string} nodeEnv - Node environment (development, production, test)
 * @property {string} databaseUrl - PostgreSQL connection string
 * @property {string} jwtSecret - Secret key for JWT signing
 * @property {string} jwtExpiresIn - JWT expiration time
 * @property {string} corsOrigin - Allowed CORS origin
 */

/**
 * Application configuration object
 * @type {Config}
 */
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5500'
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
export function validateConfig() {
  const required = ['jwtSecret', 'databaseUrl'];
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
  
  if (config.jwtSecret.length < 32) {
    console.warn(
      'WARNING: JWT_SECRET should be at least 32 characters for security. ' +
      'Current length:', config.jwtSecret.length
    );
  }
}

export default config;
