// src/types/index.ts

import { Document } from 'mongoose';

// Enum for User Roles - This defines the hierarchy
export enum UserRole {
  CEO = 'CEO',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  ASSISTANT_PROJECT_MANAGER = 'ASSISTANT_PROJECT_MANAGER',
  TEAM_LEADER = 'TEAM_LEADER',
  SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER'
}

// Enum for Project Status - Tracks project progression
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  DEPLOYMENT = 'DEPLOYMENT',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

// Enum for Task Priority
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Enum for Task Status
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED'
}

// Base User Interface - Common properties for all users
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Project Interface - Represents a project in the system
export interface IProject extends Document {
  _id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  
  // Hierarchy relationships
  projectManager: string; // PM ID
  assistantProjectManager?: string; // APM ID
  teamLeader?: string; // Team Leader ID
  teamMembers: string[]; // Array of Software Engineer IDs
  
  // Progress tracking
  progress: number; // 0-100
  budget?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// Task Interface - Represents individual tasks within projects
export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Relationships
  project: string; // Project ID
  assignedTo: string; // User ID
  assignedBy: string; // User ID who assigned the task
  
  // Time tracking
  estimatedHours: number;
  actualHours: number;
  startDate: Date;
  dueDate: Date;
  completedDate?: Date;
  
  // Additional info
  tags: string[];
  attachments: string[];
  comments: IComment[];
  
  createdAt: Date;
  updatedAt: Date;
}

// Comment Interface - For task comments
export interface IComment {
  _id: string;
  content: string;
  author: string; // User ID
  createdAt: Date;
}

// Request interfaces for API endpoints
export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  projectManager: string;
  assistantProjectManager?: string;
  teamLeader?: string;
  teamMembers: string[];
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  budget?: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  project: string;
  assignedTo: string;
  estimatedHours: number;
  dueDate: Date;
  tags: string[];
}

// Response interfaces
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

// Dashboard data interfaces
export interface CEODashboardData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProjectManagers: number;
  projects: IProject[];
  projectManagers: IUser[];
}

export interface PMDashboardData {
  assignedProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalAPMs: number;
  projects: IProject[];
  assistantProjectManagers: IUser[];
}

export interface APMDashboardData {
  assignedProjects: number;
  activeProjects: number;
  totalTeamMembers: number;
  projects: IProject[];
  teamMembers: IUser[];
  teamLeaders: IUser[];
}

export interface EngineerDashboardData {
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projects: IProject[];
  tasks: ITask[];
}

// Custom Express Request interface to include user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}