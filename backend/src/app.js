const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// Import middleware
const { errorMiddleware, notFoundHandler } = require('./middlewares/error.middleware');
const { loadEnv } = require('./config/env');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/userRoutes.js'); 
const projectRoutes = require('./routes/project.routes.js'); 
const taskRoutes = require('./routes/task.routes.js');
const teamRoutes = require('./routes/team.routes');
// Load environment variables
loadEnv();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Handle 404 for undefined routes
app.use(notFoundHandler);

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;