// 404 Not Found middleware

import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error); // Pass to error handler
};

/*
404 HANDLER EXPLAINED:

1. **req.originalUrl**: The full URL path that was requested
2. **next(error)**: Passes the error to the global error handler
3. **Placement**: Must be after all route definitions
4. **Purpose**: Catches any requests that don't match defined routes
*/
