import ApiError from '../utils/ApiError.js';

/**
 * Role-Based Access Control middleware
 * Checks if authenticated user has one of the allowed roles
 *
 * @param  {...string} roles - Allowed roles (e.g., 'ADMIN', 'USER')
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/users/:id', authenticate, authorize('ADMIN'), deleteUser);
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`
        )
      );
    }

    next();
  };
};

export default authorize;
