import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { comparePassword } from '../utils/password.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vienna_luxury_jwt_secret_dev_2026';
const isProduction = process.env.NODE_ENV === 'production';

// In-memory login attempt tracker for basic rate limiting
const loginAttempts = new Map();

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Rate limiting: 5 failed attempts per IP per 15 minutes
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
    if (attempts.count >= 5 && now - attempts.firstAttempt < 15 * 60 * 1000) {
      return res.status(429).json({
        success: false,
        error: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
      });
    }

    const user = await db.users.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.isActive) {
      attempts.count += 1;
      loginAttempts.set(ip, attempts);
      return res.status(401).json({ success: false, error: 'Invalid email credentials or inactive account.' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      attempts.count += 1;
      loginAttempts.set(ip, attempts);
      return res.status(401).json({ success: false, error: 'Invalid password. Please verify your credentials.' });
    }

    // Reset rate limiter on successful login
    loginAttempts.delete(ip);

    // Update lastLogin
    await db.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date().toISOString() }
    });

    // Generate JWT token (7 days validity)
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set secure HTTP-only cookie
    res.cookie('vdt_admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Audit log
    await db.audit.log({
      userId: user.id,
      action: 'ADMIN_LOGIN_SUCCESS',
      entity: 'AdminUser',
      entityId: user.id,
      ipAddress: ip
    });

    const { passwordHash, ...userClean } = user;

    res.json({
      success: true,
      message: 'Signed in successfully to Vienna Day Trip Admin Portal.',
      token,
      user: userClean
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ success: false, error: 'Internal server login error.' });
  }
}

/**
 * POST /api/v1/auth/logout
 */
export async function logout(req, res) {
  try {
    if (req.user) {
      await db.audit.log({
        userId: req.user.id,
        action: 'ADMIN_LOGOUT',
        entity: 'AdminUser',
        entityId: req.user.id,
        ipAddress: req.ip
      });
    }

    res.clearCookie('vdt_admin_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax'
    });

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Logout error.' });
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function getCurrentUser(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    const { passwordHash, ...userClean } = req.user;
    res.json({ success: true, user: userClean });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not fetch current user.' });
  }
}
