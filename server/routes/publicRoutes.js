import { Router } from 'express';
import { createBooking } from '../controllers/bookingController.js';
import { createContactEnquiry } from '../controllers/enquiryController.js';
import { getPublicVehicles } from '../controllers/fleetController.js';
import { getPublicServices } from '../controllers/serviceController.js';
import { getPublicDayTrips, getPublicDayTripBySlug } from '../controllers/dayTripController.js';
import { getPublicBlogs, getPublicBlogBySlug } from '../controllers/blogController.js';
import { getSettings, getReviewsSettings } from '../controllers/settingsController.js';

import {
  createStripeCheckoutSession,
  handleStripeWebhook,
  getPaymentStatus,
  simulatePaymentConfirmation
} from '../controllers/paymentController.js';

const router = Router();

// Public Enquiries & Bookings
router.post('/bookings', createBooking);
router.post('/contact', createContactEnquiry);

// Stripe Payment Gateway Endpoints
router.post('/payments/create-checkout-session', createStripeCheckoutSession);
router.post('/payments/webhook', handleStripeWebhook);
router.get('/payments/status/:id', getPaymentStatus);
router.post('/payments/simulate-confirmation', simulatePaymentConfirmation);

// Public Content Endpoints (Only published items)
router.get('/vehicles', getPublicVehicles);
router.get('/services', getPublicServices);
router.get('/day-trips', getPublicDayTrips);
router.get('/day-trips/:slug', getPublicDayTripBySlug);
router.get('/blogs', getPublicBlogs);
router.get('/blogs/:slug', getPublicBlogBySlug);
router.get('/settings', getSettings);
router.get('/reviews', getReviewsSettings);

export default router;
