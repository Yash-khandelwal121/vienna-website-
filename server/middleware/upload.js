/**
 * upload.js — Multer middleware
 *
 * Uses memoryStorage so the file buffer is always available in req.file.buffer
 * regardless of whether we ultimately store to local disk or Vercel Blob.
 * The actual persistence decision is made inside storageProvider.js.
 */

import multer from 'multer';
import path from 'path';

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/avif'
  ];
  if (allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP, SVG, and AVIF image formats are allowed.'), false);
  }
};

// Memory storage — buffer is available as req.file.buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max
  }
});

// Helper: generate a clean, unique filename from the original file
export function buildFilename(originalname) {
  const ext = path.extname(originalname).toLowerCase();
  const cleanBase = path
    .basename(originalname, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
  return `${cleanBase}-${uniqueSuffix}${ext}`;
}
