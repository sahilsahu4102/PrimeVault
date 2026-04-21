import Joi from 'joi';

export const createAssetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Asset name must be at least 2 characters',
    'string.max': 'Asset name must not exceed 100 characters',
    'any.required': 'Asset name is required',
  }),
  description: Joi.string().trim().max(1000).allow('', null).messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  price: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  category: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Category must be at least 2 characters',
    'any.required': 'Category is required',
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.min': 'Stock cannot be negative',
  }),
  isActive: Joi.boolean().default(true),
});

export const updateAssetSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().max(1000).allow('', null),
  price: Joi.number().positive().precision(2),
  category: Joi.string().trim().min(2).max(50),
  stock: Joi.number().integer().min(0),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

export const assetQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').max(100).default(''),
  category: Joi.string().trim().allow('').max(50).default(''),
  sortBy: Joi.string().valid('name', 'price', 'createdAt', 'stock', 'category').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  isActive: Joi.boolean().allow('').default(''),
});
