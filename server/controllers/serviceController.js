import { db } from '../config/db.js';

export async function getPublicServices(req, res) {
  try {
    const services = await db.services.findMany({ where: { isPublished: true } });
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
}

export async function getAdminServices(req, res) {
  try {
    const services = await db.services.findMany();
    res.json({ success: true, count: services.length, services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admin services.' });
  }
}

export async function createService(req, res) {
  try {
    const data = req.body;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const created = await db.services.create({
      data: {
        slug,
        name: data.name,
        shortDesc: data.shortDesc || '',
        fullDesc: data.fullDesc || '',
        features: data.features || [],
        image: data.image || '/images/vienna-palace-backdrop.webp',
        ctaLabel: data.ctaLabel || 'Book Service',
        ctaUrl: data.ctaUrl || '',
        displayOrder: Number(data.displayOrder) || 0,
        isPublished: data.isPublished !== false
      }
    });
    res.status(201).json({ success: true, service: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create service.' });
  }
}

export async function updateService(req, res) {
  try {
    const updated = await db.services.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, service: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update service.' });
  }
}

export async function deleteService(req, res) {
  try {
    await db.services.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Service deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete service.' });
  }
}
