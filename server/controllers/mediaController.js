import { db } from '../config/db.js';
import { uploadFile, deleteFile } from '../utils/storageProvider.js';
import { buildFilename } from '../middleware/upload.js';

/**
 * POST /api/v1/admin/media/upload
 * Handles image uploads - routes to local disk or Vercel Blob transparently.
 */
export async function uploadMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No media file provided.' });
    }

    const { category = 'general', altText = '' } = req.body;

    // Build a clean, unique filename (timestamp + random suffix - guaranteed unique)
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
