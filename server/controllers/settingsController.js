import { db } from '../config/db.js';
import { hashPassword } from '../utils/password.js';

// ==========================================
// 1. SITE SETTINGS
// ==========================================
export async function getSettings(req, res) {
  try {
    const settings = await db.settings.get();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
}

export async function updateSettings(req, res) {
  try {
    const updated = await db.settings.update(req.body);
    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_SETTINGS',
      entity: 'SiteSettings',
      entityId: 'singleton'
    });
    res.json({ success: true, message: 'Settings updated successfully.', settings: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
}

// ==========================================
// 2. REVIEWS SETTINGS
// ==========================================
export async function getReviewsSettings(req, res) {
  try {
    const reviews = await db.reviews.get();
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch reviews settings.' });
  }
}

export async function updateReviewsSettings(req, res) {
  try {
    const updated = await db.reviews.update(req.body);
    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_REVIEWS_SETTINGS',
      entity: 'ReviewIntegration',
      entityId: 'singleton'
    });
    res.json({ success: true, message: 'Review settings updated.', reviews: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update review settings.' });
  }
}

// ==========================================
// 3. ADMIN USERS (RBAC)
// ==========================================
export async function getAdminUsers(req, res) {
  try {
    const users = await db.users.findMany();
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin users.' });
  }
}

export async function createAdminUser(req, res) {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Email, name, and password are required.' });
    }

    const existing = await db.users.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const created = await db.users.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        role: role || 'CONTENT_EDITOR',
        isActive: true
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'CREATE_USER',
      entity: 'AdminUser',
      entityId: created.id,
      details: { email: created.email, role: created.role }
    });

    res.status(201).json({ success: true, message: 'User created successfully.', user: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create user.' });
  }
}

export async function updateAdminUser(req, res) {
  try {
    const { name, role, isActive, password } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.passwordHash = await hashPassword(password);

    const updated = await db.users.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, message: 'User updated successfully.', user: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user.' });
  }
}

export async function deleteAdminUser(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own active administrator account.' });
    }

    await db.users.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User removed.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user.' });
  }
}
