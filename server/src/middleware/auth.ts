// Authentication middleware

import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getDB } from '../config/database';
import { AppError } from './errorHandler';

// Interface for JWT payload
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number; // issued at
  exp: number; // expires
}

// Interface for authenticated request
export interface AuthenticatedRequest extends Request {
  user?: {
    _id: ObjectId;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

/*
AUTHENTICATION CONCEPTS:

1. **JWT (JSON Web Token)**: Stateless authentication token
2. **Token Structure**: Header.Payload.Signature (base64 encoded)
3. **Stateless**: Server doesn't store sessions, all info in token
4. **Bearer Token**: Sent in Authorization header as "Bearer <token>"
5. **Middleware**: Runs before protected routes to verify authentication

JWT ADVANTAGES:
- **Scalable**: No server-side session storage
- **Portable**: Can be used across different services
- **Self-contained**: Contains all necessary user information
*/

// Protect routes - require authentication
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1) Get token from request header
    let token: string | undefined;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    
    // 2) Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new AppError('JWT secret not configured', 500));
    }
    
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // 3) Check if user still exists
    const db = getDB();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(decoded.userId)
    });
    
    if (!user) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }
    
    // 4) Check if user is active
    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Please contact support.', 401));
    }
    
    // 5) Grant access to protected route
    req.user = user;
    next();
    
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Authentication failed', 401));
  }
};

/*
AUTHENTICATION FLOW:

1. **Extract Token**: Get JWT from Authorization header
2. **Verify Token**: Check if token is valid and not expired
3. **User Exists**: Verify user still exists in database
4. **User Active**: Check if user account is still active
5. **Attach User**: Add user info to request object
6. **Continue**: Call next() to proceed to route handler

SECURITY CONSIDERATIONS:
- **Token Expiration**: Tokens should have reasonable expiration time
- **User Validation**: Always check if user still exists
- **Account Status**: Check if account is active/not banned
- **Secret Security**: JWT secret should be strong and kept secure
*/

// Restrict access to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    
    next();
  };
};

/*
ROLE-BASED ACCESS CONTROL (RBAC):

1. **Roles**: CEO, PM, APM, ENGINEER
2. **Permissions**: Different roles have different access levels
3. **Hierarchy**: CEO > PM > APM > ENGINEER
4. **Flexible**: Can restrict to multiple roles

USAGE EXAMPLES:
- restrictTo('CEO') - Only CEO can access
- restrictTo('CEO', 'PM') - CEO and PM can access
- restrictTo('APM', 'PM', 'CEO') - All managers can access
*/

// Check if user can access specific resource
export const checkResourceAccess = (resourceType: 'project' | 'task' | 'user') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }
      
      const { user } = req;
      const resourceId = req.params.id;
      const db = getDB();
      
      // CEO can access everything
      if (user.role === 'CEO') {
        return next();
      }
      
      switch (resourceType) {
        case 'project':
          const project = await db.collection('projects').findOne({
            _id: new ObjectId(resourceId)
          });
          
          if (!project) {
            return next(new AppError('Project not found', 404));
          }
          
          // Check if user has access to this project
          const hasProjectAccess = 
            project.pmId.equals(user._id) ||
            project.apmId.equals(user._id) ||
            project.teamLeadId.equals(user._id) ||
            project.teamMembers.some((memberId: ObjectId) => memberId.equals(user._id));
          
          if (!hasProjectAccess) {
            return next(new AppError('You do not have access to this project', 403));
          }
          break;
          
        case 'task':
          const task = await db.collection('tasks').findOne({
            _id: new ObjectId(resourceId)
          });
          
          if (!task) {
            return next(new AppError('Task not found', 404));
          }
          
          // Check if user is assigned to this task or manages the project
          const taskProject = await db.collection('projects').findOne({
            _id: task.projectId
          });
          
          const hasTaskAccess = 
            task.assignedTo.equals(user._id) ||
            taskProject?.pmId.equals(user._id) ||
            taskProject?.apmId.equals(user._id) ||
            taskProject?.teamLeadId.equals(user._id);
          
          if (!hasTaskAccess) {
            return next(new AppError('You do not have access to this task', 403));
          }
          break;
          
        case 'user':
          // Users can access their own profile, managers can access their reports
          if (resourceId === user._id.toString()) {
            return next(); // Own profile
          }
          
          // Check if the requested user reports to current user
          const targetUser = await db.collection('users').findOne({
            _id: new ObjectId(resourceId)
          });
          
          if (!targetUser) {
            return next(new AppError('User not found', 404));
          }
          
          // Check hierarchy access
          const hasUserAccess = 
            targetUser.reportsTo?.equals(user._id) ||
            user.directReports.some((reportId: ObjectId) => reportId.equals(targetUser._id));
          
          if (!hasUserAccess) {
            return next(new AppError('You do not have access to this user', 403));
          }
          break;
      }
      
      next();
      
    } catch (error) {
      return next(new AppError('Error checking resource access', 500));
    }
  };
};

/*
RESOURCE-BASED ACCESS CONTROL:

1. **Project Access**: PM, APM, Team Lead, or Team Member
2. **Task Access**: Assigned user or project managers
3. **User Access**: Own profile or direct reports
4. **Hierarchical**: Respects organizational hierarchy

DATABASE RELATIONSHIPS:
- **reportsTo**: Who this user reports to
- **directReports**: Array of users reporting to this user
- **Project Roles**: PM, APM, Team Lead assignments
- **Team Members**: Array of users in project team
*/