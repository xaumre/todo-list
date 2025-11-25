# Database Migrations

This directory contains SQL migration files for setting up the PostgreSQL database schema.

## Migration Files

1. `001_create_users_table.sql` - Creates the users table with authentication support
2. `002_create_tasks_table.sql` - Creates the tasks table with user ownership

## Running Migrations

### Using psql command line:

```bash
# Connect to your database
psql $DATABASE_URL

# Run migrations in order
\i backend/migrations/001_create_users_table.sql
\i backend/migrations/002_create_tasks_table.sql
```

### Using pg client in Node.js:

```javascript
import { readFileSync } from 'fs';
import { pool } from './services/database.js';

const migration1 = readFileSync('./migrations/001_create_users_table.sql', 'utf8');
const migration2 = readFileSync('./migrations/002_create_tasks_table.sql', 'utf8');

await pool.query(migration1);
await pool.query(migration2);
```

## Schema Overview

### Users Table
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique, indexed
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Tasks Table
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users, indexed
- `description` (TEXT)
- `completed` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Indexes

- `idx_users_email` - Fast email lookups for authentication
- `idx_tasks_user_id` - Fast task retrieval by user
- `idx_tasks_user_completed` - Optimized filtering by user and completion status
