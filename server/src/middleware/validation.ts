// Request validation middleware

import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Validation schema interface
interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'email' | 'date';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    enum?: string[];
    pattern?: RegExp;
  };
}

/*
VALIDATION CONCEPTS:

1. **Input Validation**: Ensure data meets requirements before processing
2. **Type Checking**: Verify data types (string, number, etc.)
3. **Format Validation**: Check email format, date format, etc.
4. **Business Rules**: Ensure data meets business requirements
5. **Security**: Prevent malicious input and injection attacks

WHY VALIDATE:
- **Data Integrity**: Ensure clean, consistent data
- **Security**: Prevent XSS, injection attacks
- **User Experience**: Provide clear error messages
- **Database Safety**: Prevent invalid data storage
*/

// Validate request body
export const validateBody = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    // Check each field in schema
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip validation if field is not provided and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Type validation
      if (rules.type) {
        switch (rules.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${field} must be a string`);
            }
            break;
          case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
              errors.push(`${field} must be a number`);
            }
            break;
          case 'boolean':
            if (typeof value !== 'boolean') {
              errors.push(`${field} must be a boolean`);
            }
            break;
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${field} must be a valid email address`);
            }
            break;
          case 'date':
            if (isNaN(Date.parse(value))) {
              errors.push(`${field} must be a valid date`);
            }
            break;
        }
      }
      
      // String length validation
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }
      }
      
      // Number range validation
      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must not exceed ${rules.max}`);
        }
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      
      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        errors.push(`${field} format is invalid`);
      }
    }
    
    // Return validation errors
    if (errors.length > 0) {
      return next(new AppError(`Validation failed: ${errors.join('; ')}`, 400));
    }
    
    next();
  };
};

/*
VALIDATION RULES EXPLANATION:

1. **required**: Field must be present and not empty
2. **type**: Data type validation (string, number, email, etc.)
3. **minLength/maxLength**: String length constraints
4. **min/max**: Number range constraints
5. **enum**: Value must be from predefined list
6. **pattern**: Regular expression pattern matching

USAGE EXAMPLE:
const userSchema = {
  email: { required: true, type: 'email' },
  password: { required: true, type: 'string', minLength: 8 },
  role: { required: true, enum: ['CEO', 'PM', 'APM', 'ENGINEER'] }
};
*/

// Validate MongoDB ObjectId format
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    // Check if ObjectId format is valid (24 character hex string)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      return next(new AppError(`Invalid ${paramName} format`, 400));
    }
    
    next();
  };
};

/*
OBJECTID VALIDATION:

1. **MongoDB ObjectId**: 24-character hexadecimal string
2. **Format**: 12-byte identifier (timestamp + machine + process + counter)
3. **Validation**: Prevents invalid ID errors in database queries
4. **Security**: Prevents potential injection attacks

OBJECTID STRUCTURE:
- **4 bytes**: Unix timestamp
- **5 bytes**: Random unique value
- **3 bytes**: Incrementing counter
*/

// Rate limiting middleware
export const rateLimit = (windowMs: number, maxRequests: number) => {
  const clients = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    for (const [ip, data] of clients.entries()) {
      if (now > data.resetTime) {
        clients.delete(ip);
      }
    }
    
    // Get or create client data
    let clientData = clients.get(clientIP);
    if (!clientData) {
      clientData = { count: 0, resetTime: now + windowMs };
      clients.set(clientIP, clientData);
    }
    
    // Check rate limit
    if (clientData.count >= maxRequests) {
      const resetIn = Math.ceil((clientData.resetTime - now) / 1000);
      return next(new AppError(`Too many requests. Try again in ${resetIn} seconds.`, 429));
    }
    
    // Increment counter
    clientData.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - clientData.count);
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime));
    
    next();
  };
};

/*
RATE LIMITING EXPLAINED:

1. **Purpose**: Prevent abuse and protect server resources
2. **Window**: Time period for counting requests (e.g., 15 minutes)
3. **Limit**: Maximum requests allowed in window (e.g., 100 requests)
4. **IP-based**: Tracks requests per IP address
5. **Headers**: Informs client about rate limit status

SECURITY BENEFITS:
- **DDoS Protection**: Prevents overwhelming server
- **Brute Force Prevention**: Limits login attempts
- **API Abuse**: Prevents excessive API usage
- **Resource Conservation**: Ensures fair usage
*/