// src/types/index.ts

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiList<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;    // VD: "UNAUTHORIZED", "NOT_FOUND", "VALIDATION_ERROR"
    message: string; // Message tiếng Việt cho user
  };
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; zaloId: string }
    }
  }
}
