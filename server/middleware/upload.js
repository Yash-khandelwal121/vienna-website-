import multer from 'multer';
import path from 'path';
import fs from 'fs';

import os from 'os';

// In serverless environments (Vercel / AWS Lambda), the deployment filesystem root is read-only.
// Use os.tmpdir() (/tmp/uploads) for temporary file uploads on serverless, and public/uploads for local development.
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
export const uploadDir = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve('public/uploads');

// Ensure upload directory exists safely without throwing on read-only filesystems
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('[Upload Middleware Warning]: Could not create initial upload directory:', err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  }
});

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

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size
  }
});
