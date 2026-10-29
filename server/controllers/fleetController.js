import { db } from '../config/db.js';

/**
 * GET /api/v1/public/vehicles
 * Returns published vehicles ordered by displayOrder
 */
export async function getPublicVehicles(req, res) {
  try {
    const raw = await db.vehicles.findMany({ where: { isPublished: true } });
    const vehicles = raw.map((v) => ({
      ...v,
      image: v.transparentImage || v.mainImage || v.image
    }));
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve vehicles.' });
  }
}

/**
 * GET /api/v1/admin/vehicles
 */
export async function getAdminVehicles(req, res) {
  try {
    const vehicles = await db.vehicles.findMany();
    res.json({ success: true, count: vehicles.length, vehicles });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve admin vehicles.' });
  }
}

/**
 * POST /api/v1/admin/vehicles
 */
export async function createVehicle(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.category) {
      return res.status(400).json({ success: false, error: 'Vehicle name and category are required.' });
    }

    const vehicleId = (data.vehicleId || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/-+/g, '-');
    const existing = await db.vehicles.findUnique({ where: { vehicleId } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'A vehicle with this ID already exists.' });
    }

    const created = await db.vehicles.create({
      data: {
        vehicleId,
        name: data.name,
        category: data.category,
        badge: data.badge || '',
        tagline: data.tagline || '',
        shortDescription: data.shortDescription || '',
        fullDescription: data.fullDescription || '',
        passengers: data.passengers || '3 Guests',
        luggage: data.luggage || '2 Large Bags',
        ride: data.ride || 'AIRMATIC Suspension',
        features: data.features || [],
        mainImage: data.mainImage || '/cars/s-class.webp',
        transparentImage: data.transparentImage || '',
        gallery: data.gallery || [],
        availability: data.availability || 'AVAILABLE',
        displayOrder: Number(data.displayOrder) || 0,
        isPublished: data.isPublished !== false,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'CREATE_VEHICLE',
      entity: 'Vehicle',
      entityId: created.id,
      details: { vehicleName: created.name }
    });

    res.status(201).json({ success: true, message: 'Vehicle created successfully.', vehicle: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to create vehicle.' });
  }
}

/**
 * PATCH /api/v1/admin/vehicles/:id
 */
export async function updateVehicle(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Vehicle ID is required.' });
    }

    const { id: _id, createdAt: _ca, updatedAt: _ua, ...cleanData } = req.body || {};

    if (cleanData.vehicleId) {
      cleanData.vehicleId = cleanData.vehicleId.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
      const existing = await db.vehicles.findUnique({ where: { vehicleId: cleanData.vehicleId } });
      if (existing && existing.id !== id) {
        return res.status(409).json({ success: false, error: `A vehicle with ID "${cleanData.vehicleId}" already exists.` });
      }
    }

    if (cleanData.displayOrder !== undefined) {
      cleanData.displayOrder = Number(cleanData.displayOrder) || 0;
    }
    if (cleanData.isPublished !== undefined) {
      cleanData.isPublished = Boolean(cleanData.isPublished);
    }

    const updated = await db.vehicles.update({
      where: { id },
      data: cleanData
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Vehicle not found.' });
    }

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_VEHICLE',
      entity: 'Vehicle',
      entityId: updated.id,
      details: { vehicleName: updated.name }
    });

    res.json({ success: true, message: 'Vehicle updated successfully.', vehicle: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update vehicle.' });
  }
}

/**
 * DELETE /api/v1/admin/vehicles/:id
 */
export async function deleteVehicle(req, res) {
  try {
    await db.vehicles.delete({ where: { id: req.params.id } });
    await db.audit.log({
      userId: req.user?.id,
      action: 'DELETE_VEHICLE',
      entity: 'Vehicle',
      entityId: req.params.id
    });
    res.json({ success: true, message: 'Vehicle deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete vehicle.' });
  }
}
