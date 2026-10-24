import crypto from 'crypto';

/**
 * Generate a unique booking reference e.g. VDT-BK-2026-A1B2
 */
export function generateBookingReference() {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `VDT-BK-${year}-${random}`;
}

/**
 * Generate a unique contact enquiry reference e.g. VDT-ENQ-2026-X9Y8
 */
export function generateEnquiryReference() {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `VDT-ENQ-${year}-${random}`;
}

/**
 * Convert JSON array to CSV format
 */
export function jsonToCsv(items, fields) {
  if (!items || items.length === 0) return '';
  const header = fields.map((f) => `"${f.label || f.key}"`).join(',');
  const rows = items.map((item) =>
    fields
      .map((f) => {
        let val = item[f.key] ?? '';
        if (typeof val === 'object') val = JSON.stringify(val);
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      })
      .join(',')
  );
  return [header, ...rows].join('\r\n');
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeText(str) {
  if (!str || typeof str !== 'string') return '';
  return str.trim();
}
