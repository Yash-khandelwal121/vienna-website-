import { db } from '../config/db.js';
import { generateEnquiryReference, jsonToCsv, sanitizeText } from '../utils/helpers.js';

/**
 * POST /api/v1/public/contact
 * Public Contact Enquiry submission
 */
export async function createContactEnquiry(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name, email address, and inquiry message.'
      });
    }

    const reference = generateEnquiryReference();

    const enquiry = await db.enquiries.create({
      data: {
        reference,
        name: sanitizeText(name),
        email: sanitizeText(email).toLowerCase(),
        phone: sanitizeText(phone || ''),
        subject: sanitizeText(subject || 'General Inquiry'),
        message: sanitizeText(message),
        status: 'NEW',
        internalNotes: ''
      }
    });

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received. Our concierge desk will contact you promptly.',
      reference: enquiry.reference,
      enquiry
    });
  } catch (error) {
    console.error('[Create Enquiry Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to submit contact enquiry.' });
  }
}

/**
 * GET /api/v1/admin/enquiries
 */
export async function getAdminEnquiries(req, res) {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    let enquiries = await db.enquiries.findMany();

    if (status && status !== 'ALL') {
      enquiries = enquiries.filter((e) => e.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      enquiries = enquiries.filter(
        (e) =>
          e.reference?.toLowerCase().includes(q) ||
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.subject?.toLowerCase().includes(q) ||
          e.message?.toLowerCase().includes(q)
      );
    }

    const total = enquiries.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = enquiries.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      enquiries: paginated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch enquiries.' });
  }
}

/**
 * PATCH /api/v1/admin/enquiries/:id
 */
export async function updateEnquiry(req, res) {
  try {
    const { status, internalNotes, isArchived } = req.body;
    const enquiry = await db.enquiries.findUnique({ where: { id: req.params.id } });

    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    const updated = await db.enquiries.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status } : {}),
        ...(internalNotes !== undefined ? { internalNotes } : {}),
        ...(isArchived !== undefined ? { isArchived } : {})
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_ENQUIRY',
      entity: 'ContactEnquiry',
      entityId: enquiry.id,
      details: { status, internalNotesUpdated: !!internalNotes }
    });

    res.json({ success: true, message: 'Enquiry updated.', enquiry: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update enquiry.' });
  }
}

/**
 * GET /api/v1/admin/enquiries/export/csv
 */
export async function exportEnquiriesCsv(req, res) {
  try {
    const enquiries = await db.enquiries.findMany();
    const fields = [
      { key: 'reference', label: 'Reference' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'subject', label: 'Subject' },
      { key: 'message', label: 'Message' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Date' }
    ];

    const csv = jsonToCsv(enquiries, fields);
    res.header('Content-Type', 'text/csv');
    res.attachment(`vienna-day-trip-enquiries-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to export enquiries CSV.' });
  }
}
