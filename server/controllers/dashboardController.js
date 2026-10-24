import { db } from '../config/db.js';

/**
 * GET /api/v1/admin/dashboard/stats
 * Real database counts matching exact instructions
 */
export async function getDashboardStats(req, res) {
  try {
    const allBookings = await db.bookings.findMany();
    const allEnquiries = await db.enquiries.findMany();
    const allBlogs = await db.blogs.findMany();
    const allVehicles = await db.vehicles.findMany();
    const auditLogs = await db.audit.getRecent(10);

    const totalBookings = allBookings.length;
    const newEnquiries = allEnquiries.filter((e) => e.status === 'NEW').length;
    const pendingBookings = allBookings.filter((b) => b.status === 'NEW' || b.status === 'CONTACTED').length;
    const confirmedBookings = allBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length;
    const publishedBlogs = allBlogs.filter((b) => b.isPublished).length;
    const activeVehicles = allVehicles.filter((v) => v.isPublished && v.availability === 'AVAILABLE').length;

    // Recent 5 bookings
    const recentBookings = allBookings.slice(0, 5);

    // Recent 5 enquiries
    const recentEnquiries = allEnquiries.slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalBookings,
        newEnquiries,
        pendingBookings,
        confirmedBookings,
        publishedBlogs,
        activeVehicles
      },
      recentBookings,
      recentEnquiries,
      auditLogs
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    res.status(500).json({ success: false, error: 'Failed to load dashboard metrics.' });
  }
}
