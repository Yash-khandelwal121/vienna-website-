import { db } from '../config/db.js';

export async function getPublicDayTrips(req, res) {
  try {
    const dayTrips = await db.dayTrips.findMany({ where: { isPublished: true } });
    res.json({ success: true, count: dayTrips.length, dayTrips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch day trips.' });
  }
}

export async function getPublicDayTripBySlug(req, res) {
  try {
    const tour = await db.dayTrips.findUnique({ where: { slug: req.params.slug } });
    if (!tour || !tour.isPublished) {
      return res.status(404).json({ success: false, error: 'Day trip destination not found.' });
    }
    res.json({ success: true, tour });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching day trip.' });
  }
}

export async function getAdminDayTrips(req, res) {
  try {
    const dayTrips = await db.dayTrips.findMany();
    res.json({ success: true, count: dayTrips.length, dayTrips });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin day trips.' });
  }
}

export async function createDayTrip(req, res) {
  try {
    const data = req.body || {};
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ success: false, error: 'Destination or tour name is required.' });
    }

    const rawSlug = data.slug || data.name;
    let slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      slug = `tour-${Date.now()}`;
    }

    const existing = await db.dayTrips.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A day trip with slug "${slug}" already exists. Please choose a different slug.`
      });
    }

    const created = await db.dayTrips.create({
      data: {
        slug,
        name: data.name.trim(),
        title: data.title ? data.title.trim() : `${data.name.trim()} from Vienna`,
        eyebrow: data.eyebrow ? data.eyebrow.trim() : 'PRIVATE LUXURY CHAUFFEUR',
        shortDesc: data.shortDesc ? data.shortDesc.trim() : '',
        fullDesc: data.fullDesc ? data.fullDesc.trim() : '',
        duration: data.duration ? data.duration.trim() : 'Full Day (10-12h)',
        image: data.image ? data.image.trim() : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        gallery: data.gallery || [],
        itinerary: data.itinerary || [],
        highlights: data.highlights || [],
        inclusions: data.inclusions || [],
        exclusions: data.exclusions || [],
        price: data.price ? data.price.trim() : 'From €550',
        isPublished: data.isPublished !== false,
        displayOrder: Number(data.displayOrder) || 0,
        seoTitle: data.seoTitle || null,
        seoDesc: data.seoDesc || null
      }
    });

    res.status(201).json({ success: true, tour: created });
  } catch (error) {
    console.error('[dayTripController] Error creating day trip:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create day trip.' });
  }
}

export async function updateDayTrip(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Tour ID is required.' });
    }

    const existing = await db.dayTrips.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Day trip destination not found.' });
    }

    // Strip immutable fields
    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = req.body || {};

    if (cleanData.slug) {
      cleanData.slug = cleanData.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (cleanData.slug !== existing.slug) {
        const slugExists = await db.dayTrips.findUnique({ where: { slug: cleanData.slug } });
        if (slugExists && slugExists.id !== id) {
          return res.status(409).json({
            success: false,
            error: `A day trip with slug "${cleanData.slug}" already exists.`
          });
        }
      }
    }

    if (cleanData.displayOrder !== undefined) {
      cleanData.displayOrder = Number(cleanData.displayOrder) || 0;
    }
    if (cleanData.isPublished !== undefined) {
      cleanData.isPublished = Boolean(cleanData.isPublished);
    }

    const updated = await db.dayTrips.update({
      where: { id },
      data: cleanData
    });
    res.json({ success: true, tour: updated });
  } catch (error) {
    console.error('[dayTripController] Error updating day trip:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update day trip.' });
  }
}

export async function deleteDayTrip(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Tour ID is required.' });
    }
    await db.dayTrips.delete({ where: { id } });
    res.json({ success: true, message: 'Day trip deleted.' });
  } catch (error) {
    console.error('[dayTripController] Error deleting day trip:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to delete day trip.' });
  }
}
