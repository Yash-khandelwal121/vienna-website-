import { db } from '../config/db.js';

export async function getPublicServices(req, res) {
  try {
    const services = await db.services.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('[serviceController] Failed to fetch public services:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
}

export async function getAdminServices(req, res) {
  try {
    const services = await db.services.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    console.error('[serviceController] Failed to fetch admin services:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admin services.' });
  }
}

export async function createService(req, res) {
  try {
    const data = req.body || {};
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ success: false, error: 'Service name is required.' });
    }

    // Generate or sanitize slug
    let rawSlug = data.slug || data.name;
    let slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = `service-${Date.now()}`;
    }

    // Check slug collision
    const existing = await db.services.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A service with slug "${slug}" already exists. Please choose a different slug or title.`
      });
    }

    // Parse features (bullet points)
    let features = data.features;
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch {
        features = features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean);
      }
    }
    if (!Array.isArray(features)) {
      features = [];
    }

    const created = await db.services.create({
      data: {
        slug,
        name: data.name.trim(),
        shortDesc: data.shortDesc ? data.shortDesc.trim() : '',
        fullDesc: data.fullDesc ? data.fullDesc.trim() : '',
        features,
        icon: data.icon || null,
        image: data.image ? data.image.trim() : '/images/vienna-palace-backdrop.webp',
        ctaLabel: data.ctaLabel ? data.ctaLabel.trim() : 'Book Service',
        ctaUrl: data.ctaUrl ? data.ctaUrl.trim() : `/${slug}/`,
        displayOrder: Number(data.displayOrder) || 0,
        isPublished: data.isPublished !== false,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null
      }
    });

    res.status(201).json({ success: true, service: created });
  } catch (error) {
    console.error('[serviceController] Error creating service:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create service in database.'
    });
  }
}

export async function updateService(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Service ID is required.' });
    }

    const existing = await db.services.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    // Strip immutable fields so Prisma does not reject payload
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = req.body || {};

    if (cleanData.slug) {
      cleanData.slug = cleanData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (cleanData.slug !== existing.slug) {
        const slugExists = await db.services.findUnique({ where: { slug: cleanData.slug } });
        if (slugExists && slugExists.id !== id) {
          return res.status(409).json({
            success: false,
            error: `A service with slug "${cleanData.slug}" already exists.`
          });
        }
      }
    }

    if (cleanData.name) {
      cleanData.name = cleanData.name.trim();
    }

    if (cleanData.features !== undefined) {
      if (typeof cleanData.features === 'string') {
        try {
          cleanData.features = JSON.parse(cleanData.features);
        } catch {
          cleanData.features = cleanData.features
            .split('\n')
            .map((f) => f.trim())
            .filter(Boolean);
        }
      }
      if (!Array.isArray(cleanData.features)) {
        cleanData.features = [];
      }
    }

    if (cleanData.displayOrder !== undefined) {
      cleanData.displayOrder = Number(cleanData.displayOrder) || 0;
    }

    if (cleanData.isPublished !== undefined) {
      cleanData.isPublished = Boolean(cleanData.isPublished);
    }

    const updated = await db.services.update({
      where: { id },
      data: cleanData
    });

    res.json({ success: true, service: updated });
  } catch (error) {
    console.error('[serviceController] Error updating service:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update service.'
    });
  }
}

export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Service ID is required.' });
    }
    await db.services.delete({ where: { id } });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    console.error('[serviceController] Error deleting service:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete service.' });
  }
}
