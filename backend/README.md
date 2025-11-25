# Todo List Backend API

Backend API for the multi-user todo list application with authentication.

## Project Structure

```
backend/
├── config/          # Configuration files
│   └── env.js       # Environment variable configuration
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic and data access
├── server.js        # Main application entry point
├── package.json     # Dependencies and scripts
├── .env             # Environment variables (not in git)
└── .env.example     # Example environment variables
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up PostgreSQL database (see database setup instructions)

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `JWT_EXPIRES_IN` - JWT expiration time (e.g., "7d")
- `CORS_ORIGIN` - Allowed CORS origin

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (coming soon)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks (coming soon)
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment configuration
