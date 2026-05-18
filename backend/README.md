# Project Management System (PMS) Backend

Advanced, scalable backend for a Project Management System built with Node.js, Express, and MongoDB.

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **express-validator** - Request validation
- **winston** - Logging library

## Features

- User registration and authentication
- JWT-based authentication
- Password hashing with bcrypt
- Account lockout after failed login attempts
- Comprehensive logging
- Centralized error handling
- Input validation
- Role-based access control (RBAC) ready
- Future-ready for refresh tokens, OAuth, and audit logs

## Project Structure

```
src/
├── config/
│   ├── db.js          # Database connection
│   ├── env.js         # Environment variables
│   └── logger.js      # Logging configuration
├── controllers/
│   └── auth.controller.js  # Authentication controllers
├── models/
│   └── user.model.js  # User model
├── routes/
│   └── auth.routes.js # Authentication routes
├── services/
│   └── token.service.js # JWT token service
├── middlewares/
│   ├── auth.middleware.js     # Authentication middleware
│   ├── error.middleware.js    # Error handling middleware
│   └── validate.middleware.js # Validation middleware
├── utils/
│   └── response.util.js # Response utility functions
├── app.js             # Express app configuration
└── server.js          # Server entry point
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login to existing account
- `GET /health` - Health check endpoint

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/pms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=30d

# Security
BCRYPT_SALT_ROUNDS=12

# Server
PORT=8080
NODE_ENV=development

# Security Settings
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=600000 # 10 minutes in milliseconds

# Client URL
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Start the development server:
```bash
npm run dev
```

4. The server will start on `http://localhost:8080`

## Example Requests

### Register a new user

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Security Features

- Passwords are hashed using bcrypt
- Account lockout after multiple failed login attempts
- JWT tokens with configurable expiration
- Input validation using express-validator
- Comprehensive logging of authentication events
- CORS configured for security

## Future Enhancements

- Refresh token implementation
- OAuth integration
- Role-based access control (RBAC)
- Audit logging
- Two-factor authentication (2FA)
- Rate limiting