// User type definitions

import { ObjectId } from 'mongodb';

export interface User {
  _id: ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  
  // Hierarchy
  reportsTo: ObjectId | null;
  directReports: ObjectId[];
  
  // Profile
  department: string;
  joinDate: Date;
  isActive: boolean;
  profileImage?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CEO = 'CEO',
  PM = 'PM',
  APM = 'APM',
  ENGINEER = 'ENGINEER'
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  reportsTo?: string; // ObjectId as string
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, 'password'>;
}

/*
TYPE DEFINITIONS EXPLAINED:

1. **User Interface**: Defines the complete user structure
2. **UserRole Enum**: Defines valid user roles
3. **Request Types**: Defines request body structures
4. **Response Types**: Defines API response structures
5. **Omit<User, 'password'>**: User object without password field

TYPESCRIPT BENEFITS:
- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better code completion
- **Refactoring**: Safer code refactoring
- **Documentation**: Types serve as documentation
- **Consistency**: Ensures consistent data structures
*/