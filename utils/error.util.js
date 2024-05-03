
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
  
      this.statusCode = statusCode;
      // kaha par code phata hai uski information will be in stacckTrace
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export default AppError;
  