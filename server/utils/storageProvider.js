/**
 * storageProvider.js
 *
 * Unified storage abstraction that automatically switches between:
 *  - "local"       - disk storage under public/uploads  (development / non-Vercel)
 *  - "vercel-blob" - Vercel Blob (persistent, CDN-backed, Vercel production/preview)
 *
 * Configuration is driven by env vars:
 *   STORAGE_PROVIDER = "local" | "vercel-blob"
 *   BLOB_READ_WRITE_TOKEN (required for Vercel Blob)
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

// Detect serverless environment
const isServerless =
  process.env.VERCEL === '1' || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// Resolve the effective storage provider
const resolvedProvider = (() => {
  const configured = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();

  // Auto-upgrade: if running on Vercel with a blob token, always use vercel-blob
  if (isServerless && process.env.BLOB_READ_WRITE_TOKEN) {
    if (configured !== 'vercel-blob') {
      console.log('[Storage] Auto-switching to vercel-blob on serverless environment.');
    }
    return 'vercel-blob';
  }

  // Safety guard: warn loudly if running on Vercel without any persistent storage
  if (isServerless && !process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      '[Storage] CRITICAL WARNING: Running on Vercel serverless without BLOB_READ_WRITE_TOKEN. ' +
      'Uploads will be written to ephemeral /tmp and WILL BE LOST on function restart. ' +
      'Set BLOB_READ_WRITE_TOKEN in Vercel environment variables to enable persistent storage.'
    );
  }

  return configured;
})();

export const STORAGE_PROVIDER = resolvedProvider;

// Local upload directory (used only when STORAGE_PROVIDER=local)
export const localUploadDir = isServerless
  ? path.join(os.tmpdir(), 'uploads')
  : path.resolve('public/uploads');

// Ensure local upload dir exists (safe - silently fails on read-only FS)
try {
  if (!fs.existsSync(localUploadDir)) {
    fs.mkdirSync(localUploadDir, { recursive: true });
  }
} catch {
  // Graceful no-op on read-only serverless filesystem
}

/**
 * Upload a file buffer to the configured storage provider.
 *
 * @param {Object} opts
 * @param {Buffer}  opts.buffer   - File data as a Buffer
 * @param {string}  opts.filename - Sanitized, unique filename (e.g. "image-1234.jpg")
 * @param {string}  opts.mimeType - MIME type (e.g. "image/jpeg")
 * @param {string} [opts.folder]  - Optional sub-folder prefix in Blob store (default: "uploads")
 *
 * @returns {Promise<{ url: string, provider: string }>}
 */
export async function uploadFile({ buffer, filename, mimeType, folder = 'uploads' }) {
  if (STORAGE_PROVIDER === 'vercel-blob') {
    // Guard: if vercel-blob is selected but the token is missing, fail fast with a clear error
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        'Storage misconfiguration: STORAGE_PROVIDER=vercel-blob but BLOB_READ_WRITE_TOKEN is not set. ' +
        'Add the token in Vercel Dashboard > Settings > Environment Variables.'
      );
    }
    return uploadToVercelBlob({ buffer, filename, mimeType, folder });
  }
  return uploadToLocal({ buffer, filename });
}

async function uploadToVercelBlob({ buffer, filename, mimeType, folder }) {
  const { put } = await import('@vercel/blob');
  const blobPath = `${folder}/${filename}`;

  const blob = await put(blobPath, buffer, {
    access: 'public',
    contentType: mimeType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false
  });

  console.log(`[Storage] Uploaded to Vercel Blob: ${blob.url}`);
  return { url: blob.url, provider: 'vercel-blob' };
}

async function uploadToLocal({ buffer, filename }) {
  const destPath = path.join(localUploadDir, filename);
  await fs.promises.writeFile(destPath, buffer);
  const url = `/uploads/${filename}`;
  console.log(`[Storage] Saved locally: ${destPath}  ->  ${url}`);
  return { url, provider: 'local' };
}

/**
 * Delete a file from the configured storage provider.
 *
 * SAFETY: deleteFile only removes files from storage; it does NOT check
 * whether the URL is still referenced by other blog records.
 * Callers (mediaController) must enforce reference-counting before calling this.
 *
 * @param {string} fileUrl - The stored URL (local /uploads/... path or full Vercel Blob URL)
 */
export async function deleteFile(fileUrl) {
  if (!fileUrl) return;

  if (STORAGE_PROVIDER === 'vercel-blob' && fileUrl.startsWith('https://')) {
    try {
      const { del } = await import('@vercel/blob');
      await del(fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
      console.log(`[Storage] Deleted from Vercel Blob: ${fileUrl}`);
    } catch (err) {
      console.warn('[Storage] Blob delete warning:', err.message);
    }
    return;
  }

  // Local file deletion
  const filename = path.basename(fileUrl);
  const localPath = path.join(localUploadDir, filename);
  try {
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      console.log(`[Storage] Deleted local file: ${localPath}`);
    }
  } catch (err) {
    console.warn('[Storage] Local file delete warning:', err.message);
  }
}
