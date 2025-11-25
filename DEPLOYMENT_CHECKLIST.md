# Deployment Checklist

This checklist will guide you through deploying the todo list application to Render.

## Prerequisites

- [x] GitHub repository: https://github.com/xaumre/todo-list.git
- [ ] Payment information added to Render account (required for web services)
- [ ] Render account connected to GitHub

## Step 1: PostgreSQL Database ✅

- [x] Database created: `todolist-db`
- [x] Region: Virginia (US East)
- [x] Database ID: `dpg-d4isqrogjchc73eu2ltg-a`
- [ ] Database status: Available (check dashboard)
- [ ] Migrations run successfully

### Run Migrations

**Option A: Using Render Dashboard (Recommended)**
1. Go to: https://dashboard.render.com/d/dpg-d4isqrogjchc73eu2ltg-a
2. Click "Shell" or "SQL" tab
3. Run contents of `backend/migrations/001_create_users_table.sql`
4. Run contents of `backend/migrations/002_create_tasks_table.sql`

**Option B: Using Migration Script**
```bash
# Get Internal Database URL from Render dashboard
export DATABASE_URL="[INTERNAL_DATABASE_URL]"
cd backend
node scripts/run-migrations.js
```

## Step 2: Deploy Backend Web Service

### 2.1 Create Web Service on Render

1. Go to: https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository: `xaumre/todo-list`
4. Select branch: `main`

### 2.2 Configure Service

**Basic Settings:**
- Name: `todolist-backend`
- Region: `Virginia (US East)`
- Branch: `main`
- Root Directory: (leave empty)
- Runtime: `Node`

**Build & Deploy:**
- Build Command: `cd backend && npm install`
- Start Command: `cd backend && npm start`

### 2.3 Environment Variables

Add these environment variables in Render:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `3000` | |
| `DATABASE_URL` | [Get from database dashboard] | Use Internal Database URL |
| `JWT_SECRET` | [Generate secure string] | Min 32 characters |
| `JWT_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `https://todo-list-j4gw.onrender.com` | Your frontend URL |

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.4 Deploy

- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Note the backend URL (e.g., `https://todolist-backend.onrender.com`)

## Step 3: Update Frontend Configuration

### 3.1 Update config.js

Edit `config.js` in the root directory:

```javascript
function getApiBaseUrl() {
  if (window.location.hostname.includes('onrender.com')) {
    // Replace with your actual backend URL
    return 'https://todolist-backend.onrender.com'; // ← Update this
  }
  return 'http://localhost:3000';
}
```

### 3.2 Commit and Deploy

```bash
git add config.js
git commit -m "Configure production API URL"
git push origin main
```

The frontend static site should auto-deploy on Render.

## Step 4: Verify Deployment

### 4.1 Test Backend API

```bash
# Health check
curl https://todolist-backend.onrender.com/health

# Test registration
curl -X POST https://todolist-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 4.2 Test Frontend

1. Visit: https://todo-list-j4gw.onrender.com
2. Register a new account
3. Add some tasks
4. Refresh the page (verify session persistence)
5. Log out and log back in
6. Verify tasks are still there

## Troubleshooting

### CORS Errors
- Verify `CORS_ORIGIN` in backend matches frontend URL exactly
- Check browser console for specific error messages
- Ensure no trailing slashes in URLs

### Connection Errors
- Verify backend service is running (check Render dashboard)
- Check backend logs for errors
- Ensure `DATABASE_URL` is set correctly
- Wait for cold start (free tier spins down after 15 min)

### Authentication Errors
- Verify `JWT_SECRET` is set and at least 32 characters
- Check that migrations ran successfully
- Verify database connection is working

### Database Connection Issues
- Ensure you're using the **Internal Database URL** (not external)
- Verify database status is "Available"
- Check database logs on Render

## Important Notes

- **Free Tier**: Backend spins down after 15 minutes of inactivity
- **Cold Starts**: First request may take 30-60 seconds
- **Database**: Free tier expires after 30 days
- **Logs**: Check Render dashboard for service logs

## Deployment Status

- [x] Task 13.1: PostgreSQL database created
- [ ] Task 13.1: Migrations run
- [ ] Task 13.2: Backend web service deployed
- [ ] Task 13.3: Frontend configuration updated
- [ ] Task 13.3: Deployment tested

## Next Steps After Deployment

1. Monitor logs for errors
2. Test all authentication flows
3. Verify task CRUD operations
4. Test session persistence
5. Consider adding:
   - Health check monitoring
   - Error tracking (e.g., Sentry)
   - Performance monitoring
   - Automated backups

## Support Resources

- Render Documentation: https://render.com/docs
- Backend Dashboard: https://dashboard.render.com/d/dpg-d4isqrogjchc73eu2ltg-a
- Frontend Dashboard: https://dashboard.render.com/static/srv-d4hqkmchg0os738k0500
- GitHub Repository: https://github.com/xaumre/todo-list

