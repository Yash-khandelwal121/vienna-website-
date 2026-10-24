import { Router } from 'express';
import { authenticateAdmin, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

import { getDashboardStats } from '../controllers/dashboardController.js';
import {
  getAdminBookings,
  getBookingById,
  updateBooking,
  exportBookingsCsv
} from '../controllers/bookingController.js';
import {
  getAdminEnquiries,
  updateEnquiry,
  exportEnquiriesCsv
} from '../controllers/enquiryController.js';
import {
  getAdminVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/fleetController.js';
import {
  getAdminServices,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import {
  getAdminDayTrips,
  createDayTrip,
  updateDayTrip,
  deleteDayTrip
} from '../controllers/dayTripController.js';
import {
  getAdminBlogs,
  createBlog,
  updateBlog,
  deleteBlog
} from '../controllers/blogController.js';
import {
  getAllMedia,
  uploadMedia,
  deleteMedia
} from '../controllers/mediaController.js';
import {
  getSettings,
  updateSettings,
  getReviewsSettings,
  updateReviewsSettings,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../controllers/settingsController.js';

const router = Router();

// Apply authentication to ALL admin routes
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Bookings
router.get('/bookings', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), getAdminBookings);
router.get('/bookings/export/csv', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), exportBookingsCsv);
router.get('/bookings/:id', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), getBookingById);
router.patch('/bookings/:id', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), updateBooking);

// Enquiries
router.get('/enquiries', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), getAdminEnquiries);
router.get('/enquiries/export/csv', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), exportEnquiriesCsv);
router.patch('/enquiries/:id', requireRole('SUPER_ADMIN', 'BOOKING_MANAGER'), updateEnquiry);

// Fleet Management
router.get('/vehicles', getAdminVehicles);
router.post('/vehicles', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), createVehicle);
router.patch('/vehicles/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), updateVehicle);
router.delete('/vehicles/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), deleteVehicle);

// Services Management
router.get('/services', getAdminServices);
router.post('/services', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), createService);
router.patch('/services/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), updateService);
router.delete('/services/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), deleteService);

// Day Trips Management
router.get('/day-trips', getAdminDayTrips);
router.post('/day-trips', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), createDayTrip);
router.patch('/day-trips/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), updateDayTrip);
router.delete('/day-trips/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), deleteDayTrip);

// Blogs Management
router.get('/blogs', getAdminBlogs);
router.post('/blogs', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), createBlog);
router.patch('/blogs/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), updateBlog);
router.delete('/blogs/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), deleteBlog);

// Media Library
router.get('/media', getAllMedia);
router.post('/media/upload', upload.single('file'), uploadMedia);
router.delete('/media/:id', requireRole('SUPER_ADMIN', 'CONTENT_EDITOR'), deleteMedia);

// Settings & Reviews
router.get('/settings', getSettings);
router.patch('/settings', requireRole('SUPER_ADMIN'), updateSettings);
router.get('/reviews', getReviewsSettings);
router.patch('/reviews', requireRole('SUPER_ADMIN'), updateReviewsSettings);

// User Management (Super Admin only)
router.get('/users', requireRole('SUPER_ADMIN'), getAdminUsers);
router.post('/users', requireRole('SUPER_ADMIN'), createAdminUser);
router.patch('/users/:id', requireRole('SUPER_ADMIN'), updateAdminUser);
router.delete('/users/:id', requireRole('SUPER_ADMIN'), deleteAdminUser);

export default router;
