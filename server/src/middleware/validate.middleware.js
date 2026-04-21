import ApiError from '../utils/ApiError.js';

/**
 * Joi validation middleware factory
 * Validates request body, query, or params against a Joi schema
 *
 * @param {Object} schema - Joi schema object with body/query/params keys
 * @returns {Function} Express middleware
 *
 * @example
 * validate({ body: registerSchema })
 */
const validate = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each part of the request
    for (const [key, joiSchema] of Object.entries(schema)) {
      if (!req[key]) continue;

      const { error, value } = joiSchema.validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const details = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/"/g, ''),
        }));
        errors.push(...details);
      } else {
        // Replace with sanitized values
        Object.defineProperty(req, key, {
          value: value,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest('Validation failed', errors));
    }

    next();
  };
};

export default validate;
