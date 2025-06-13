// Global error handling middleware

import { Request, Response, NextFunction } from 'express';

// Custom error class for application-specific errors
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public status: string;
  
  constructor(message: string, statusCode: number) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Operational errors are expected errors
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/*
CUSTOM ERROR CLASS EXPLAINED:

1. **extends Error**: Inherits from JavaScript's built-in Error class
2. **statusCode**: HTTP status code (400, 404, 500, etc.)
3. **isOperational**: Distinguishes between operational and programming errors
4. **status**: 'fail' for 4xx errors, 'error' for 5xx errors
5. **Error.captureStackTrace**: Provides detailed error stack trace

OPERATIONAL vs PROGRAMMING ERRORS:
- **Operational**: Expected errors we can handle (invalid input, network issues)
- **Programming**: Bugs in our code (typos, logic errors)
*/

// Development error response (detailed)
const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack, // Stack trace for debugging
    timestamp: new Date().toISOString()
  });
};

// Production error response (minimal)
const sendErrorProd = (err: AppError, res: Response): void => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString()
    });
  }
};

/*
ERROR RESPONSE STRATEGY:

DEVELOPMENT:
- Show detailed error information
- Include stack traces
- Help developers debug issues

PRODUCTION:
- Hide sensitive error details
- Only show safe error messages
- Log detailed errors server-side
*/

// Handle MongoDB duplicate key errors
const handleDuplicateKeyError = (err: any): AppError => {
  // Extract the field that caused the duplicate key error
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  const message = `${field} '${value}' already exists. Please choose another value.`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again.', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired. Please log in again.', 401);
};

/*
SPECIFIC ERROR HANDLERS:

1. **Duplicate Key**: When trying to create duplicate unique fields
2. **Validation Error**: When data doesn't meet schema requirements
3. **JWT Error**: When authentication token is invalid
4. **JWT Expired**: When authentication token has expired
*/

// Main error handling middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (process.env.NODE_ENV === 'development') {
    // Development environment: send detailed errors
    sendErrorDev(err, res);
  } else {
    // Production environment: handle specific errors
    let error = { ...err };
    error.message = err.message;
    
    // Handle specific MongoDB errors
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

