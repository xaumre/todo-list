# Database Setup Instructions

## Render PostgreSQL Database

A PostgreSQL database has been created on Render with the following details:

- **Database ID**: dpg-d4ifq3vgi27c739iarug-a
- **Database Name**: todolist_db_32eg
- **Database User**: todolist_db_32eg_user
- **Region**: Oregon
- **Plan**: Free
- **Version**: PostgreSQL 16
- **Dashboard URL**: https://dashboard.render.com/d/dpg-d4ifq3vgi27c739iarug-a

## Getting the Connection String

✅ **Database Status**: Available

1. Visit the dashboard URL above: https://dashboard.render.com/d/dpg-d4ifq3vgi27c739iarug-a
2. Look for the "Connections" section
3. Copy the **External Database URL** (it will look like: `postgresql://user:password@host/database`)

## Updating Your Environment

Once you have the connection string:

1. Copy the **External Database URL** from the Render dashboard
2. Update `backend/.env` file:
   ```
   DATABASE_URL=postgresql://todolist_db_32eg_user:PASSWORD@dpg-d4ifq3vgi27c739iarug-a.oregon-postgres.render.com/todolist_db_32eg
   ```
   (Replace PASSWORD with the actual password from the dashboard)

## Running Database Migrations

After updating the DATABASE_URL, run the migrations to create the tables:

```bash
cd backend
npm run migrate
```

This will create the `users` and `tasks` tables with proper indexes.

## Running the Property Test

Once the database is set up and migrations are run:

```bash
cd backend
npm test
```

This will run the property-based test for task isolation (Property 6).

## Notes

- The free tier database expires after 90 days
- The database is accessible from anywhere (no IP restrictions on free tier)
- Make sure to run migrations before running tests
