// Main Express application setup with TypeScript

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

/*
EXPRESS FUNDAMENTALS EXPLAINED:

1. Application Instance: express() creates an Express app instance
2. Middleware: Functions that execute during request-response cycle
3. Request Object (req): Contains HTTP request information
4. Response Object (res): Used to send HTTP response
5. NextFunction: Passes control to next middleware function
6. TypeScript Integration: We type our Express components for better development experience
*/

// ============================================================================
// GLOBAL MIDDLEWARE SETUP
// ============================================================================

// 1. CORS (Cross-Origin Resource Sharing)
// Allows our React frontend to communicate with Express backend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite's default port
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

/*
CORS EXPLAINED:
- Same-Origin Policy: Browsers block requests between different origins
- Origin: Protocol + Domain + Port (http://localhost:3000)
- Credentials: Allows sending cookies/auth headers cross-origin
- Preflight Requests: Browser sends OPTIONS request first for complex requests
*/

// 2. HELMET - Security middleware
// Sets various HTTP headers to secure Express apps
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow Tailwind CSS
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false // For development
}));

/*
HELMET SECURITY FEATURES:
- Content Security Policy: Prevents XSS attacks
- X-Frame-Options: Prevents clickjacking
- X-Content-Type-Options: Prevents MIME type sniffing
- Strict-Transport-Security: Enforces HTTPS
*/

// 3. MORGAN - HTTP request logger
// Logs HTTP requests for debugging and monitoring
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/*
MORGAN LOG FORMATS:
- dev: Colored output for development
- combined: Standard Apache combined log format for production
- common: Standard Apache common log format
- short: Shorter than default, includes response time
*/

// 4. EXPRESS JSON PARSER
// Parses incoming JSON payloads and makes them available in req.body
app.use(express.json({ 
  limit: '10mb' // Limit payload size to prevent DoS attacks
}));

// 5. EXPRESS URL ENCODED PARSER
// Parses URL-encoded payloads (form submissions) [name="test"&age=19]
app.use(express.urlencoded({ 
  extended: true, // Use qs library for parsing (supports nested objects)
  limit: '10mb' 
}));

/*
EXPRESS PARSERS EXPLAINED:
- express.json(): Parses JSON data from request body
- express.urlencoded(): Parses form data from request body
- extended: true: Allows parsing nested objects in form data
- limit: Prevents large payloads from overwhelming the server
*/

// ============================================================================
// ROUTES SETUP
// ============================================================================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'DevTasks API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes will be added here
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/tasks', taskRoutes);

/*
ROUTING EXPLAINED:
- Route: Combination of HTTP method + URL path
- Route Parameters: Dynamic parts of URL (/users/:id)
- Query Parameters: URL parameters after ? (/users?page=1)
- Route Handlers: Functions that handle specific routes
- Router: Express router for organizing routes into modules
*/

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 Not Found handler (must be after all routes)
app.use(notFound);

// Global error handler (must be last middleware)
app.use(errorHandler);

/*
ERROR HANDLING EXPLAINED:
- Express Error Handling: Express catches errors automatically
- Error Middleware: Special middleware with 4 parameters (err, req, res, next)
- 404 Handler: Catches requests that don't match any routes
- Global Error Handler: Catches all errors and sends appropriate responses
*/

// ============================================================================
// DATABASE CONNECTION AND SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

// Start server function
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB first
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Exit with failure code
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

/*
PROCESS MANAGEMENT EXPLAINED:
- process.exit(1): Exit with error code
- unhandledRejection: Catches promise rejections not handled by .catch()
- uncaughtException: Catches synchronous errors not handled by try/catch
- SIGTERM/SIGINT: System signals for graceful shutdown
- Graceful Shutdown: Properly close connections before exiting
*/

// Start the server
startServer();

export default app;