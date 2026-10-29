import { db } from '../config/db.js';
import { generateBookingReference, jsonToCsv, sanitizeText } from '../utils/helpers.js';

/**
 * POST /api/v1/public/bookings
 * Public submission from website booking form
 */
export async function createBooking(req, res) {
  try {
    const {
      customerName,
      email,
      phone,
      serviceType,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      passengerCount,
      luggageDetails,
      preferredVehicle,
      specialRequests
    } = req.body;

    const resolvedDropoff =
      (dropoffLocation && dropoffLocation.trim()) ||
      (serviceType?.toLowerCase().includes('hourly')
        ? 'Vienna (As Directed)'
        : serviceType?.toLowerCase().includes('day trip')
        ? 'Vienna Day Trip'
        : '');

    if (!customerName || !email || !pickupLocation || !resolvedDropoff || !pickupDate || !pickupTime) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required journey fields (Name, Email, Pickup, Dropoff, Date, Time).'
      });
    }

    const reference = generateBookingReference();

    const booking = await db.bookings.create({
      data: {
        reference,
        customerName: sanitizeText(customerName),
        email: sanitizeText(email).toLowerCase(),
        phone: sanitizeText(phone || ''),
        serviceType: sanitizeText(serviceType || 'Airport Transfer'),
        pickupLocation: sanitizeText(pickupLocation),
        dropoffLocation: sanitizeText(resolvedDropoff),
        pickupDate: sanitizeText(pickupDate),
        pickupTime: sanitizeText(pickupTime),
        passengerCount: sanitizeText(passengerCount || '1-3'),
        luggageDetails: sanitizeText(luggageDetails || ''),
        preferredVehicle: sanitizeText(preferredVehicle || 'Mercedes-Benz E-Class'),
        specialRequests: sanitizeText(specialRequests || ''),
        status: 'NEW',
        internalNotes: ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking enquiry submitted successfully. A confirmation email and quote will follow.',
      reference: booking.reference,
      booking
    });
  } catch (error) {
    console.error('[Create Booking Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to submit booking enquiry.' });
  }
}

/**
 * GET /api/v1/admin/bookings
 */
export async function getAdminBookings(req, res) {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let bookings = await db.bookings.findMany();

    if (status && status !== 'ALL') {
      bookings = bookings.filter((b) => b.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.reference?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.includes(q) ||
          b.pickupLocation?.toLowerCase().includes(q) ||
          b.dropoffLocation?.toLowerCase().includes(q)
      );
    }

    const total = bookings.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = bookings.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      bookings: paginated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve bookings.' });
  }
}

/**
 * GET /api/v1/admin/bookings/:id
 */
export async function getBookingById(req, res) {
  try {
    const booking = await db.bookings.findUnique({ where: { id: req.params.id } });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching booking details.' });
  }
}

/**
 * PATCH /api/v1/admin/bookings/:id
 */
export async function updateBooking(req, res) {
  try {
    const { status, internalNotes } = req.body;
    const booking = await db.bookings.findUnique({ where: { id: req.params.id } });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const updated = await db.bookings.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {})
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_BOOKING',
      entity: 'Booking',
      entityId: booking.id,
      details: { oldStatus: booking.status, newStatus: status, notesUpdated: !!internalNotes }
    });

    res.json({ success: true, message: 'Booking updated successfully.', booking: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update booking.' });
  }
}

/**
 * GET /api/v1/admin/bookings/export/csv
 */
export async function exportBookingsCsv(req, res) {
  try {
    const bookings = await db.bookings.findMany();
    const fields = [
      { key: 'reference', label: 'Reference' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'serviceType', label: 'Service' },
      { key: 'preferredVehicle', label: 'Vehicle' },
      { key: 'pickupLocation', label: 'Pickup Location' },
      { key: 'dropoffLocation', label: 'Drop-off Location' },
      { key: 'pickupDate', label: 'Date' },
      { key: 'pickupTime', label: 'Time' },
      { key: 'passengerCount', label: 'Passengers' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' }
    ];

    const csv = jsonToCsv(bookings, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment(`vienna-day-trip-bookings-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
}
