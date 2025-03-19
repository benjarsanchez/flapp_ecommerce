export const successResponse = (res, data) => {
    res.json({
      success: true,
      data
    });
  };
  
export const errorResponse = (res, statusCode, message) => {
    res.status(statusCode).json({
      success: false,
      error: message
    });
  };