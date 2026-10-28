import fs from 'fs';
import path from 'path';
import { db } from '../config/db.js';

export async function uploadMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No media file provided.' });
    }

    const { category = 'general', altText = '' } = req.body;
    let url = `/uploads/${req.file.filename}`;

    // Upload to persistent Sanity Cloud CDN when API token is configured
    if (process.env.SANITY_API_TOKEN) {
      try {
        const { createClient } = await import('@sanity/client');
        const sanity = createClient({
          projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm',
          dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
          apiVersion: '2024-01-01',
          token: process.env.SANITY_API_TOKEN,
          useCdn: false
        });
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          const stream = fs.createReadStream(filePath);
          const sanityAsset = await sanity.assets.upload('image', stream, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
          });
          if (sanityAsset?.url) {
            url = sanityAsset.url;
            console.log(`[Media Upload] Successfully persisted to Sanity CDN: ${url}`);
          }
        }
      } catch (sanityErr) {
        console.warn('[Sanity CDN Upload Warning]: Falling back to local upload:', sanityErr.message);
      }
    }

    const asset = await db.media.create({
      data: {
        filename: req.file.filename,
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
      details: { filename: req.file.filename, url }
    });

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully.',
      asset
    });
  } catch (error) {
    console.error('[Upload Media Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to upload media asset.' });
  }
}

export async function getAllMedia(req, res) {
  try {
    const assets = await db.media.findMany();
    res.json({ success: true, count: assets.length, media: assets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve media library.' });
  }
}

export async function deleteMedia(req, res) {
  try {
    const assets = await db.media.findMany();
    const asset = assets.find((a) => a.id === req.params.id);

    if (asset) {
      const filePath = path.resolve(`public/uploads/${asset.filename}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      await db.media.delete({ where: { id: req.params.id } });
    }

    res.json({ success: true, message: 'Media removed.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete media.' });
  }
}
