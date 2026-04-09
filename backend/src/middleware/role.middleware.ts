// backend/src/middleware/role.middleware.ts
// Update to ensure admin-only access

import { Request, Response, NextFunction } from 'express';

const normalizeRole = (role: unknown): string => {
  return typeof role === 'string' ? role.trim().toLowerCase() : '';
};

const requireRole = (role: 'client' | 'vendor' | 'admin', message: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRole = normalizeRole(req.user.role);

    if (userRole !== role) {
      return res.status(403).json({
        message,
        requiredRole: role,
        yourRole: req.user.role
      });
    }

    next();
  };
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedRoles = roles.map(normalizeRole);

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        requiredRole: roles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// Specific admin-only middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (normalizeRole(req.user.role) !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin access required.',
      yourRole: req.user.role
    });
  }

  next();
};

export const clientOnly = requireRole('client', 'Access denied. Client access required.');
export const vendorOnly = requireRole('vendor', 'Access denied. Vendor access required.');
