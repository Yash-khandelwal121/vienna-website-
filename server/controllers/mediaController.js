import { db } from '../config/db.js';
import { uploadFile, deleteFile, isBlobStorageActive } from '../utils/storageProvider.js';
import { buildFilename } from '../middleware/upload.js';

/**
 * GET /api/v1/admin/media/upload-mode
 *
 * Tells the frontend which upload strategy to use:
 *   { mode: "blob-client" }  → client should upload directly to Vercel Blob
 *   { mode: "server-proxy" } → client should POST the file to the server
 *
 * This endpoint is public-ish (authenticated but light) so the frontend can
 * determine the strategy before the user even picks a file.
 */
export async function getUploadMode(req, res) {
  res.json({
    success: true,
    mode: isBlobStorageActive ? 'blob-client' : 'server-proxy'
  });
}

/**
 * POST /api/v1/admin/media/blob-token
 *
 * Server-side handler for @vercel/blob client uploads.
 * Called by the frontend when mode === "blob-client".
 *
 * Vercel Blob's handleUpload() validates the request, generates a scoped
 * client token, and returns upload instructions.  The actual binary data
 * is transferred directly from the browser to Vercel's Blob CDN — it never
 * passes through this serverless function (avoiding the 4.5 MB body limit).
 *
 * After the upload, the frontend calls POST /api/v1/admin/media/register
 * with the resulting blob URL so we can persist it to the database.
 */
export async function getBlobUploadToken(req, res) {
  if (!isBlobStorageActive) {
    return res.status(400).json({
      success: false,
      error: 'Vercel Blob storage is not configured on this server. Use the server-proxy upload instead.'
    });
  }

  try {
    const { handleUpload } = await import('@vercel/blob/client');

    const jsonBody = await handleUpload({
      body: req.body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Enforce allowed MIME types server-side
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/avif',
          'image/svg+xml'
        ];

        // clientPayload is a JSON string set by the browser before calling upload()
        let payload = {};
        try {
          payload = clientPayload ? JSON.parse(clientPayload) : {};
        } catch {
          // ignore parse errors
        }

        return {
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: 15 * 1024 * 1024, // 15 MB
          tokenPayload: JSON.stringify({
            adminUserId: req.user?.id ?? 'unknown',
            ...payload
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This callback fires after Vercel Blob confirms the upload.
        // Note: this runs server-side but only in production (Vercel).
        // In local dev, onUploadCompleted is not called by the SDK.
        console.log(`[Blob] Upload completed: ${blob.url}`);
      }
    });

    return res.json(jsonBody);
  } catch (error) {
    console.error('[Blob Token Error]:', error);
    return res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/v1/admin/media/register
 *
 * Called after a successful client-side Vercel Blob upload.
 * Persists the blob URL and metadata to the database.
 *
 * Body: { url, filename, originalName, mimeType, size, altText, category }
 */
export async function registerBlobAsset(req, res) {
  try {
    const { url, filename, originalName, mimeType, size, altText = '', category = 'general' } = req.body;

    if (!url || !filename) {
      return res.status(400).json({ success: false, error: 'Missing required fields: url, filename.' });
    }

    // Persist metadata to Neon PostgreSQL
    const asset = await db.media.create({
      data: {
        filename,
        originalName: originalName || filename,
        mimeType: mimeType || 'image/jpeg',
        size: size || 0,
        url,
        altText,
        category
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPLOAD_MEDIA_BLOB',
      entity: 'MediaAsset',
      entityId: asset.id,
      details: { filename, url, provider: 'vercel-blob' }
    });

    res.status(201).json({
      success: true,
      message: 'Media asset registered successfully.',
      asset
    });
  } catch (error) {
    console.error('[Register Blob Asset Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to register media asset.' });
  }
}

/**
 * POST /api/v1/admin/media/upload
 * Handles image uploads via server proxy (local dev without blob token).
 * Routes to local disk or Vercel Blob transparently via storageProvider.
 * In production (blob-client mode), the frontend skips this and uses the
 * blob-token + register flow instead.
 */
export async function uploadMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No media file provided.' });
    }

    const { category = 'general', altText = '' } = req.body;

    // Build a clean, unique filename (timestamp + random suffix)
    const filename = buildFilename(req.file.originalname);

    // Upload to the configured storage provider (local or vercel-blob)
    const { url, provider } = await uploadFile({
      buffer: req.file.buffer,
      filename,
      mimeType: req.file.mimetype,
      folder: 'uploads'
    });

    // Persist metadata to Neon PostgreSQL
    const asset = await db.media.create({
      data: {
        filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url,
        altText,
        category
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPLOAD_MEDIA',
      entity: 'MediaAsset',
      entityId: asset.id,
      details: { filename, url, provider }
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully.',
      asset
    });
  } catch (error) {
    console.error('[Upload Media Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload media asset.' });
  }
}

/**
 * GET /api/v1/admin/media
 */
export async function getAllMedia(req, res) {
  try {
    const assets = await db.media.findMany();
    res.json({ success: true, count: assets.length, media: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve media library.' });
  }
}

/**
 * DELETE /api/v1/admin/media/:id
 *
 * Safety: checks whether the asset URL is still referenced by any blog
 * featuredImage before deleting the physical file.
 * If shared, the media record is removed from the library but the file is
 * preserved so existing blog pages continue to load the image.
 */
export async function deleteMedia(req, res) {
  try {
    const assets = await db.media.findMany();
    const asset = assets.find((a) => a.id === req.params.id);

    if (!asset) {
      return res.json({ success: true, message: 'Media not found - already removed.' });
    }

    // Check if this URL is still referenced by any published blog post
    let isShared = false;
    try {
      const blogs = await db.blogs.findMany({ where: { isPublished: true } });
      isShared = blogs.some(
        (b) => b.featuredImage === asset.url || b.image === asset.url
      );
    } catch {
      // If blog check fails, be conservative and preserve the file
      isShared = true;
    }

    if (isShared) {
      // Remove media library record but PRESERVE the physical file
      await db.media.delete({ where: { id: req.params.id } });
      console.log(`[Media] Preserved physical file (still referenced by blog): ${asset.url}`);
      return res.json({
        success: true,
        message: 'Media record removed from library. The file was preserved because it is still used by one or more blog articles.',
        filePreserved: true
      });
    }

    // Safe to delete - not referenced by any blog
    await deleteFile(asset.url);
    await db.media.delete({ where: { id: req.params.id } });

    await db.audit.log({
      userId: req.user?.id,
      action: 'DELETE_MEDIA',
      entity: 'MediaAsset',
      entityId: req.params.id,
      details: { filename: asset.filename, url: asset.url }
    });

    res.json({ success: true, message: 'Media removed.' });
  } catch (error) {
    console.error('[Delete Media Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to delete media.' });
  }
}
