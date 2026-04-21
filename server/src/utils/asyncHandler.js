/**
 * Wraps async route handlers to catch errors and pass them to Express error middleware.
 * Eliminates the need for try/catch in every controller.
 *
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
