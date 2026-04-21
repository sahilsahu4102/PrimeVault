/**
 * Standardized API Response wrapper
 * Ensures all responses have a consistent { success, message, data } shape
 */
class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }

  // Send the response
  send(res) {
    const body = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== null) {
      body.data = this.data;
    }
    return res.status(this.statusCode).json(body);
  }

  // Factory methods
  static ok(res, message = 'Success', data = null) {
    return new ApiResponse(200, message, data).send(res);
  }

  static created(res, message = 'Created successfully', data = null) {
    return new ApiResponse(201, message, data).send(res);
  }

  static noContent(res) {
    return res.status(204).send();
  }
}

export default ApiResponse;
