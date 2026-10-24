import { Router } from 'express';
import publicRoutes from './publicRoutes.js';
import adminRoutes from './adminRoutes.js';
import { login, logout, getCurrentUser } from '../controllers/authController.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = Router();

// Authentication Endpoints
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', authenticateAdmin, getCurrentUser);

// Public API
router.use('/public', publicRoutes);

// Protected Admin API
router.use('/admin', adminRoutes);

export default router;
