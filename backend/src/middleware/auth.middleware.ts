// backend/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.warn('Access denied - No token provided', {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login to continue.',
      });
    }

    try {
      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Get user from database
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        logger.warn('Token valid but user not found', {
          userId: decoded.id,
          ip: req.ip,
        });
        return res.status(401).json({
          success: false,
          message: 'User not found. Please login again.',
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (jwtError: any) {
      logger.warn('Invalid or expired token', {
        error: jwtError.message,
        ip: req.ip,
      });

      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.',
      });
    }
  } catch (error: any) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Invalid token, but continue without user
        logger.debug('Optional auth - invalid token, continuing without user');
      }
    }

    next();
  } catch (error) {
    next();
  }
};