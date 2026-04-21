import Joi from 'joi';

export const updateRoleSchema = Joi.object({
  role: Joi.string().valid('USER', 'ADMIN').required().messages({
    'any.only': 'Role must be either USER or ADMIN',
    'any.required': 'Role is required',
  }),
});

export const userQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').max(100).default(''),
});
