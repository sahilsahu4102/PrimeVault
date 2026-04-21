import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';

const prisma = new PrismaClient();

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 * Attaches user object to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access token is required');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);

    // Fetch user from database (ensures user still exists and gets latest role)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(ApiError.unauthorized('Invalid access token'));
    } else if (error.name === 'TokenExpiredError') {
      next(ApiError.unauthorized('Access token has expired'));
    } else {
      next(error);
    }
  }
};

export default authenticate;
