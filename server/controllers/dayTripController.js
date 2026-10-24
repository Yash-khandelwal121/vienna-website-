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
    const data = req.body;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const created = await db.dayTrips.create({
      data: {
        slug,
        name: data.name,
        title: data.title || `${data.name} from Vienna`,
        eyebrow: data.eyebrow || 'PRIVATE LUXURY CHAUFFEUR',
        shortDesc: data.shortDesc || '',
        fullDesc: data.fullDesc || '',
        duration: data.duration || 'Full Day (10-12h)',
        image: data.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        price: data.price || 'From €550',
        isPublished: data.isPublished !== false,
        displayOrder: Number(data.displayOrder) || 0
      }
    });
    res.status(201).json({ success: true, tour: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create day trip.' });
  }
}

export async function updateDayTrip(req, res) {
  try {
    const updated = await db.dayTrips.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, tour: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update day trip.' });
  }
}

export async function deleteDayTrip(req, res) {
  try {
    await db.dayTrips.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Day trip deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete day trip.' });
  }
}
