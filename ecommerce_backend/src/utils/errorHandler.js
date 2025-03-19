export class CustomError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const response = {
      success: false,
      error: err.message || 'Internal Server Error',
    };
  
    if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    }
  
    res.status(statusCode).json(response);
  };
  
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (!(error instanceof CustomError)) {
        error = new CustomError(error.message, 500);
      }
      next(error);
    });
  };