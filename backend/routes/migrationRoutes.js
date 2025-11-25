/**
 * Migration Routes
 * One-time endpoint to run database migrations
 * WARNING: This should be removed after migrations are complete
 */

import express from 'express';
import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const router = express.Router();
const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * POST /api/migrate
 * Run database migrations
 */
router.post('/migrate', async (req, res) => {
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Starting migrations...');
    const client = await pool.connect();
    
    // Get all migration files
    const migrationsDir = join(__dirname, '../migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    const results = [];

    // Run each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      
      try {
        await client.query(sql);
        results.push({ file, status: 'success' });
        console.log(`✓ ${file} completed`);
      } catch (error) {
        results.push({ file, status: 'error', error: error.message });
        console.error(`✗ ${file} failed:`, error.message);
      }
    }

    client.release();
    await pool.end();

    res.json({
      success: true,
      message: 'Migrations completed',
      results
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
