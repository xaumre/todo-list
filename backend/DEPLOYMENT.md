# Deployment Guide

## PostgreSQL Database on Render

### Database Information
- **Database ID**: dpg-d4isqrogjchc73eu2ltg-a
- **Database Name**: todolist_db_tds7
- **Database User**: todolist_db_tds7_user
- **Region**: Virginia
- **Status**: Creating (check dashboard for availability)
- **Dashboard URL**: https://dashboard.render.com/d/dpg-d4isqrogjchc73eu2ltg-a

### Getting the Connection String

1. Go to the database dashboard: https://dashboard.render.com/d/dpg-d4isqrogjchc73eu2ltg-a
2. Wait for the database status to show "Available"
3. Copy the **Internal Database URL** (this is the connection string)
4. The format will be: `postgresql://todolist_db_tds7_user:[PASSWORD]@[HOST]/todolist_db_tds7`

### Running Migrations

Once the database status shows "Available" (check the dashboard):

#### Option 1: Using Render Dashboard (Recommended)

1. Go to https://dashboard.render.com/d/dpg-d4isqrogjchc73eu2ltg-a
2. Click on the "Shell" or "SQL" tab
3. Copy and paste the contents of `backend/migrations/001_create_users_table.sql`
4. Execute the SQL
5. Copy and paste the contents of `backend/migrations/002_create_tasks_table.sql`
6. Execute the SQL

#### Option 2: Using the Migration Script

1. **Get the Internal Database URL** from the Render dashboard
2. **Set the DATABASE_URL environment variable locally**:
   ```bash
   export DATABASE_URL="[INTERNAL_DATABASE_URL_FROM_RENDER]"
   ```

3. **Run the migration script**:
   ```bash
   cd backend
   node scripts/run-migrations.js
   ```

4. **Verify migrations**:
   The script will create:
   - `users` table with email authentication
   - `tasks` table with user ownership
   - Appropriate indexes for performance

#### Option 3: Using psql

```bash
# Get the connection string from Render dashboard
psql "[INTERNAL_DATABASE_URL]" -f backend/migrations/001_create_users_table.sql
psql "[INTERNAL_DATABASE_URL]" -f backend/migrations/002_create_tasks_table.sql
```

## Deploying the Backend Web Service

### Prerequisites
- GitHub repository: https://github.com/xaumre/todo-list.git
- Payment information added to Render account (required for web services)

### Deployment Steps

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `xaumre/todo-list`
   - Select the `main` branch

3. **Configure Build Settings**:
   - **Name**: `todolist-backend`
   - **Region**: `Virginia (US East)`
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or specify `backend` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

4. **Configure Environment Variables**:
   Add the following environment variables:
   
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `DATABASE_URL` | Get from database dashboard (Internal Database URL) |
   | `JWT_SECRET` | Generate a secure random string (min 32 characters) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CORS_ORIGIN` | Your frontend URL (e.g., `https://todo-list-j4gw.onrender.com`) |

5. **Generate JWT Secret**:
   You can generate a secure JWT secret using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Deploy**:
   - Click "Create Web Service"
   - Wait for the deployment to complete
   - Note the service URL (e.g., `https://todolist-backend.onrender.com`)

### Important Notes

- **Free Tier Limitations**: Render's free web services spin down after 15 minutes of inactivity
- **Cold Starts**: First request after inactivity may take 30-60 seconds
- **Database Connection**: Make sure to use the **Internal Database URL** from the database dashboard
- **CORS**: Set `CORS_ORIGIN` to match your frontend URL exactly

### Verifying Deployment

Once deployed, test the API:

```bash
# Health check (if you add one)
curl https://todolist-backend.onrender.com/

# Test registration endpoint
curl -X POST https://todolist-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## Updating Frontend Configuration (Task 13.3)

After the backend is deployed, you need to update the frontend to use the production API URL.

### Steps:

1. **Get your backend URL** from Render (e.g., `https://todolist-backend.onrender.com`)

2. **Update `config.js`** in the root directory:
   ```javascript
   function getApiBaseUrl() {
     if (window.location.hostname.includes('onrender.com')) {
       // Replace with your actual backend URL
       return 'https://todolist-backend.onrender.com';
     }
     return 'http://localhost:3000';
   }
   ```

3. **Update CORS_ORIGIN** in backend environment variables:
   - Go to your backend service on Render
   - Update the `CORS_ORIGIN` environment variable to your frontend URL
   - Example: `https://todo-list-j4gw.onrender.com`

4. **Commit and push changes**:
   ```bash
   git add config.js
   git commit -m "Configure production API URL"
   git push origin main
   ```

5. **Test the deployment**:
   - Visit your frontend URL
   - Try registering a new account
   - Add some tasks
   - Refresh the page to verify session persistence
   - Log out and log back in

### Troubleshooting

**CORS Errors**:
- Verify `CORS_ORIGIN` in backend matches your frontend URL exactly
- Check browser console for specific CORS error messages

**Connection Errors**:
- Verify backend service is running on Render
- Check backend logs for errors
- Ensure DATABASE_URL is set correctly

**Authentication Errors**:
- Verify JWT_SECRET is set in backend environment variables
- Check that migrations have been run successfully
- Verify database connection is working

## Next Steps

After deployment is complete:
1. Test the full authentication flow
2. Monitor logs for any issues
3. Consider adding health check endpoints
4. Set up monitoring and alerts
