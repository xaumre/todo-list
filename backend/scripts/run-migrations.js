/**
 * Database Migration Runner
 * Runs all SQL migration files in order
 */

import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from '../config/env.js';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully!');

    // Get all migration files
    const migrationsDir = join(__dirname, '../migrations');
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`Found ${files.length} migration files`);

    // Run each migration
    for (const file of files) {
      console.log(`\nRunning migration: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      
      try {
        await client.query(sql);
        console.log(`✓ ${file} completed successfully`);
      } catch (error) {
        console.error(`✗ ${file} failed:`, error.message);
        throw error;
      }
    }

    client.release();
    console.log('\n✓ All migrations completed successfully!');
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
