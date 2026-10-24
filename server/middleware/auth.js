import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vienna_luxury_jwt_secret_dev_2026';

/**
 * Middleware: Verify Admin Authentication Token from HTTP-only Cookie or Bearer Header
 */
export async function authenticateAdmin(req, res, next) {
  try {
    let token = req.cookies?.vdt_admin_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Authentication required to access the admin portal.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session expired or invalid. Please sign in again.'
      });
    }

    const user = await db.users.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Account is inactive or no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(500).json({ success: false, error: 'Internal server authentication error.' });
  }
}

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Roles: SUPER_ADMIN, CONTENT_EDITOR, BOOKING_MANAGER
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next(); // Super Admin has access to all modules
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Your account role (${req.user.role}) does not have permission for this action.`
      });
    }

    next();
  };
}
