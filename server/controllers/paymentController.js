import Stripe from 'stripe';
import { db } from '../config/db.js';

// Initialize Stripe Client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const isPlaceholderKey =
  !stripeSecretKey ||
  stripeSecretKey.includes('ViennaDayTripChauffeurTestKey') ||
  stripeSecretKey.includes('XXXXXXXX') ||
  stripeSecretKey.startsWith('sk_test_'); // treat test-mode keys as simulation mode

const isLiveMode = stripeSecretKey.startsWith('sk_live_');

let stripe = null;
try {
  stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder', {
    apiVersion: '2024-06-20'
  });
  if (isLiveMode) {
    console.log('✅ [Stripe] Initialized Stripe Client — LIVE MODE active.');
  } else if (!isPlaceholderKey) {
    console.log('ℹ️ [Stripe] Initialized Stripe Client — TEST MODE active.');
  } else {
    console.log('⚠️ [Stripe] Configured with placeholder/simulation key. Webhook signature engine active.');
  }
} catch (err) {
  console.warn('⚠️ [Stripe] Note initializing Stripe SDK:', err.message);
}

// Note: Webhook event idempotency is now database-backed via db.webhookEvents
// (processedWebhookEvent table in PostgreSQL). No in-memory Set needed here.
// See server/config/db.js for the implementation with hot-cache + PostgreSQL.

// Canonical Rates & Multipliers (EUR)
const BASE_RATES = {
  // Day Trips
  'hallstatt': 595,
  'salzburg': 595,
  'wachau': 416,
  'bratislava': 208,
  'budapest': 495,
  'prague': 513,
  'vienna': 208,
  // Transfers
  'airport': 55,
  'city': 55,
  'hourly': 52
};

const VEHICLE_MULTIPLIERS = {
  'mercedes-benz e-class': 1.0,
  'e-class': 1.0,
  'mercedes-benz s-class': 1.5,
  's-class': 1.5,
  'mercedes-benz eqs': 1.5,
  'eqs': 1.5,
  'mercedes-benz v-class': 1.35,
  'v-class': 1.35,
  'mercedes-benz sprinter': 2.2,
  'sprinter': 2.2,
  'armored luxury vehicle': 3.0,
  'armored': 3.0
};

const CHILD_SEAT_RATE_EUR = 10; // €10 per child seat

/**
 * Server-side calculation of payable amount in EUR based on verified booking data
 */
export function calculatePayableAmount(booking, discountCode, childSeatCountOverride) {
  const service = (booking.serviceType || '').toLowerCase();
  const vehicle = (booking.preferredVehicle || '').toLowerCase();

  // 1. Determine Base Rate
  let basePrice = 55; // Default minimum transfer

  if (service.includes('hallstatt')) basePrice = 595;
  else if (service.includes('salzburg')) basePrice = 595;
  else if (service.includes('wachau')) basePrice = 416;
  else if (service.includes('bratislava')) basePrice = 208;
  else if (service.includes('budapest')) basePrice = 495;
  else if (service.includes('prague')) basePrice = 513;
  else if (service.includes('sightseeing') || service.includes('vienna tour')) basePrice = 208;
  else if (service.includes('day trip')) basePrice = 495;
  else if (service.includes('hourly')) {
    // 3 hours default if unspecified
    basePrice = 52 * 3;
  } else if (service.includes('return')) {
    basePrice = 55 * 2;
  } else {
    basePrice = 55;
  }

  // 2. Vehicle Multiplier
  let mult = 1.0;
  for (const [vKey, vMult] of Object.entries(VEHICLE_MULTIPLIERS)) {
    if (vehicle.includes(vKey)) {
      mult = vMult;
      break;
    }
  }

  const vehicleSubtotal = basePrice * mult;

  // 3. Child Seat Charges (€10 per seat) — use override from request or stored booking field
  const childSeatCount = Number(
    childSeatCountOverride !== undefined
      ? childSeatCountOverride
      : booking.childSeatCount || 0
  );
  const childSeatCharge = Math.max(0, childSeatCount) * CHILD_SEAT_RATE_EUR;

  const subtotal = vehicleSubtotal + childSeatCharge;

  // 4. Discount Validation (Server-Side — applied to vehicle subtotal only, not child seat charge)
  let discountPercent = 0;
  const cleanCode = (discountCode || '').trim().toUpperCase();
  if (cleanCode === 'WELCOME10') {
    discountPercent = 10;
  }

  const discountAmount = (vehicleSubtotal * discountPercent) / 100;
  const total = Math.max(35, subtotal - discountAmount);

  return {
    vehicleSubtotal: Math.round(vehicleSubtotal * 100) / 100,
    childSeatCount,
    childSeatCharge: Math.round(childSeatCharge * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
    currency: 'EUR'
  };
}

/**
 * Helper to parse embedded payment metadata from internalNotes or memory
 */
export function extractPaymentMeta(booking) {
  if (!booking) return null;

  // 1. First check explicit fields
  if (booking.paymentStatus) {
    return {
      status: booking.paymentStatus,
      amount: booking.paymentAmount || 0,
      currency: booking.currency || 'EUR',
      sessionId: booking.stripeSessionId || null,
      paymentIntentId: booking.stripePaymentIntentId || null,
      timestamp: booking.paymentTimestamp || null
    };
  }

  // 2. Parse embedded metadata tag [PAYMENT_META]{...}[/PAYMENT_META]
  const notes = booking.internalNotes || '';
  const match = notes.match(/\[PAYMENT_META\]([\s\S]*?)\[\/PAYMENT_META\]/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch {}
  }

  // 3. Check text patterns
  if (notes.includes('PAID via Stripe') || notes.includes('Payment: PAID')) {
    return {
      status: 'PAID',
      amount: 0,
      currency: 'EUR',
      sessionId: null,
      paymentIntentId: null,
      timestamp: booking.updatedAt || booking.createdAt
    };
  }

  return {
    status: 'UNPAID',
    amount: 0,
    currency: 'EUR',
    sessionId: null,
    paymentIntentId: null,
    timestamp: null
  };
}

/**
 * POST /api/v1/public/payments/create-checkout-session
 * Creates a Stripe Checkout Session for an existing booking
 */
export async function createStripeCheckoutSession(req, res) {
  try {
    const { bookingId, discountCode, childSeatCount } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID or reference is required.'
      });
    }

    // Retrieve booking securely from database
    let booking = await db.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) {
      booking = await db.bookings.findUnique({ where: { reference: bookingId } });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking record not found. Please submit your booking details first.'
      });
    }

    // Check if already paid
    const currentMeta = extractPaymentMeta(booking);
    if (currentMeta?.status === 'PAID') {
      return res.status(400).json({
        success: false,
        error: 'This booking has already been paid and confirmed.'
      });
    }

    // Calculate payable amount in EUR strictly on the backend
    // childSeatCount from request takes precedence over what's stored; backend verifies max limit (0-3)
    const resolvedChildSeatCount = Math.min(3, Math.max(0, Number(childSeatCount || booking.childSeatCount || 0)));
    const calculation = calculatePayableAmount(booking, discountCode, resolvedChildSeatCount);
    const amountEur = calculation.total;
    const amountCents = Math.round(amountEur * 100);

    // Determine host origin for return redirects
    const origin =
      req.headers.origin ||
      (req.headers.referer ? new URL(req.headers.referer).origin : '') ||
      'http://localhost:5173';

    const lineItemDescription = [
      `Vehicle: ${booking.preferredVehicle}`,
      `Route: ${booking.pickupLocation} ➔ ${booking.dropoffLocation}`,
      `Date: ${booking.pickupDate} at ${booking.pickupTime}`,
      calculation.childSeatCount > 0 ? `Child seats: ${calculation.childSeatCount} × €${CHILD_SEAT_RATE_EUR}` : ''
    ].filter(Boolean).join(' | ');

    // 1. If real Stripe client is configured, create live/test hosted session
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'ideal', 'bancontact', 'sofort', 'klarna', 'eps'],
        mode: 'payment',
        customer_email: booking.email,
        client_reference_id: booking.id,
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Vienna Day Trip — ${booking.serviceType}`,
                description: lineItemDescription,
                images: ['https://viennadaytrip.com/wp-content/uploads/2026/03/your-professional-chauffeur.jpg']
              },
              unit_amount: amountCents
            },
            quantity: 1
          }
        ],
        metadata: {
          bookingId: booking.id,
          reference: booking.reference,
          amountEur: amountEur.toFixed(2),
          vehicleSubtotal: calculation.vehicleSubtotal.toFixed(2),
          childSeatCount: String(calculation.childSeatCount),
          childSeatCharge: calculation.childSeatCharge.toFixed(2),
          discountCode: discountCode || 'NONE',
          customerName: booking.customerName,
          customerEmail: booking.email
        },
        success_url: `${origin}/booking?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}&payment_status=success`,
        cancel_url: `${origin}/booking?booking_id=${booking.id}&payment_status=cancelled`
      });

      // Save session info with PENDING status in database
      const paymentMeta = {
        status: 'PENDING',
        amount: amountEur,
        currency: 'EUR',
        sessionId: session.id,
        paymentIntentId: null,
        childSeatCount: calculation.childSeatCount,
        childSeatCharge: calculation.childSeatCharge,
        vehicleSubtotal: calculation.vehicleSubtotal,
        discountAmount: calculation.discountAmount,
        timestamp: new Date().toISOString()
      };

      const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
      const cleanNotes = (booking.internalNotes || '').replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '').trim();
      const updatedNotes = cleanNotes
        ? `${cleanNotes}\n\nStripe Session Created: ${session.id} (Amount: €${amountEur.toFixed(2)})\n${metaTag}`
        : `Stripe Session Created: ${session.id} (Amount: €${amountEur.toFixed(2)})\n${metaTag}`;

      await db.bookings.update({
        where: { id: booking.id },
        data: {
          internalNotes: updatedNotes,
          paymentStatus: 'PENDING',
          paymentAmount: amountEur,
          currency: 'EUR',
          stripeSessionId: session.id
        }
      });

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        amount: amountEur,
        currency: 'EUR',
        breakdown: {
          vehicleSubtotal: calculation.vehicleSubtotal,
          childSeatCount: calculation.childSeatCount,
          childSeatCharge: calculation.childSeatCharge,
          discountAmount: calculation.discountAmount,
          total: amountEur
        }
      });
    }

    // 2. Test Simulation Mode (When Stripe key is placeholder or during local testing)
    // NOTE: isSimulation=true flag is set so the frontend shows a local test modal instead of redirecting
    const simulatedSessionId = `cs_test_sim_${Date.now()}`;
    const paymentMeta = {
      status: 'PENDING',
      amount: amountEur,
      currency: 'EUR',
      sessionId: simulatedSessionId,
      paymentIntentId: `pi_test_sim_${Date.now()}`,
      childSeatCount: calculation.childSeatCount,
      childSeatCharge: calculation.childSeatCharge,
      vehicleSubtotal: calculation.vehicleSubtotal,
      discountAmount: calculation.discountAmount,
      timestamp: new Date().toISOString()
    };

    const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
    const cleanNotes = (booking.internalNotes || '').replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '').trim();
    const updatedNotes = cleanNotes
      ? `${cleanNotes}\n\nStripe Test Session: ${simulatedSessionId} (Amount: €${amountEur.toFixed(2)})\n${metaTag}`
      : `Stripe Test Session: ${simulatedSessionId} (Amount: €${amountEur.toFixed(2)})\n${metaTag}`;

    await db.bookings.update({
      where: { id: booking.id },
      data: {
        internalNotes: updatedNotes,
        paymentStatus: 'PENDING',
        paymentAmount: amountEur,
        currency: 'EUR',
        stripeSessionId: simulatedSessionId
      }
    });

    const simulatedUrl = `${origin}/booking?session_id=${simulatedSessionId}&booking_id=${booking.id}&payment_status=simulated_modal`;

    return res.json({
      success: true,
      url: simulatedUrl,
      sessionId: simulatedSessionId,
      amount: amountEur,
      currency: 'EUR',
      isSimulation: true,
      breakdown: {
        vehicleSubtotal: calculation.vehicleSubtotal,
        childSeatCount: calculation.childSeatCount,
        childSeatCharge: calculation.childSeatCharge,
        discountAmount: calculation.discountAmount,
        total: amountEur
      }
    });
  } catch (error) {
    console.error('[Stripe Session Creation Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate secure Stripe checkout session.'
    });
  }
}

/**
 * POST /api/v1/public/payments/webhook
 * Handles cryptographically signed Stripe webhooks for verified payment confirmation
 */
export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  // 1. Enforce presence of Stripe-Signature header
  if (!sig) {
    console.warn('⚠️ [Stripe Webhook] Rejected: Missing Stripe-Signature header.');
    return res.status(400).json({
      success: false,
      error: 'Missing Stripe-Signature header.'
    });
  }

  // 2. Enforce presence of server webhook secret
  if (!webhookSecret) {
    console.error('❌ [Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured on the server.');
    return res.status(500).json({
      success: false,
      error: 'Stripe webhook secret is not configured on the server.'
    });
  }

  // 3. Extract verified raw body buffer
  const rawBody =
    req.rawBody ||
    (Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {})));

  // 4. Verify cryptographic signature via Stripe SDK
  let event = null;
  try {
    const webhookEngine = stripe?.webhooks || Stripe.webhooks;
    event = webhookEngine.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.warn('⚠️ [Stripe Webhook] Cryptographic signature verification failed:', err.message);
    return res.status(400).json({
      success: false,
      error: `Webhook signature verification failed: ${err.message}`
    });
  }

  if (!event || !event.type) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Stripe webhook event structure.'
    });
  }

  // 5. DB-backed Idempotency Check: Prevent duplicate webhook processing across cold starts
  if (event.id && await db.webhookEvents.hasProcessed(event.id)) {
    console.log(`ℹ️ [Stripe Webhook] Duplicate event detected (${event.id}) — already in PostgreSQL. Skipping.`);
    return res.status(200).json({
      received: true,
      duplicate: true,
      eventId: event.id
    });
  }

  try {
    // 6. Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.client_reference_id || session.metadata?.bookingId;

      if (!bookingId) {
        console.warn('⚠️ [Stripe Webhook] checkout.session.completed missing client_reference_id or bookingId metadata.');
        await db.webhookEvents.markProcessed(event.id, event.type, null);
        return res.status(400).json({ error: 'Missing booking ID reference in session.' });
      }

      let booking = await db.bookings.findUnique({ where: { id: bookingId } });
      if (!booking) {
        booking = await db.bookings.findUnique({ where: { reference: bookingId } });
      }

      if (!booking) {
        console.warn(`⚠️ [Stripe Webhook] Booking not found for ID/reference: ${bookingId}`);
        await db.webhookEvents.markProcessed(event.id, event.type, null);
        return res.status(404).json({ error: 'Booking not found.' });
      }

      // Idempotency: Check if already marked as PAID for this Stripe session / Payment Intent
      if (
        booking.paymentStatus === 'PAID' &&
        (booking.stripeSessionId === session.id ||
          (session.payment_intent &&
            booking.stripePaymentIntentId ===
              (typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent.id)))
      ) {
        console.log(`ℹ️ [Stripe Webhook] Booking ${booking.reference} is already PAID for session ${session.id}. Skipping.`);
        await db.webhookEvents.markProcessed(event.id, event.type, booking.reference);
        return res.status(200).json({
          received: true,
          duplicate: true,
          bookingReference: booking.reference
        });
      }

      // 7. Validate payment_status ('paid')
      if (session.payment_status !== 'paid') {
        console.warn(
          `⚠️ [Stripe Webhook] Session ${session.id} completed with status: '${session.payment_status}' (not paid). Booking remains UNPAID.`
        );
        await db.webhookEvents.markProcessed(event.id, event.type, booking.reference);
        return res.status(200).json({
          received: true,
          status: session.payment_status,
          paid: false
        });
      }

      // 8. Validate Currency (EUR)
      const sessionCurrency = (session.currency || '').toUpperCase();
      if (sessionCurrency && sessionCurrency !== 'EUR') {
        console.warn(`⚠️ [Stripe Webhook] Currency mismatch for booking ${booking.reference}: expected EUR, got ${sessionCurrency}`);
        await db.webhookEvents.markProcessed(event.id, event.type, booking.reference);
        return res.status(400).json({ error: `Currency mismatch: expected EUR, got ${sessionCurrency}` });
      }

      // 9. Validate Amount
      const amountReceivedEur =
        session.amount_total !== undefined && session.amount_total !== null
          ? session.amount_total / 100
          : Number(session.metadata?.amountEur || 0);

      if (!amountReceivedEur || amountReceivedEur <= 0) {
        console.warn(`⚠️ [Stripe Webhook] Invalid amount (€${amountReceivedEur}) for booking ${booking.reference}`);
        await db.webhookEvents.markProcessed(event.id, event.type, booking.reference);
        return res.status(400).json({ error: 'Invalid payment amount received.' });
      }

      // Cross-check with server expected payable amount
      const expectedCalc = calculatePayableAmount(
        booking,
        booking.promoCode || session.metadata?.discountCode,
        session.metadata?.childSeatCount !== undefined
          ? Number(session.metadata.childSeatCount)
          : booking.childSeatCount
      );
      const expectedTotalEur = expectedCalc.total;
      const difference = Math.abs(amountReceivedEur - expectedTotalEur);

      let amountNote = '';
      if (difference > 1.0) {
        amountNote = ` [Warning: Received €${amountReceivedEur.toFixed(2)}, expected €${expectedTotalEur.toFixed(2)}]`;
        console.warn(`⚠️ [Stripe Webhook] Amount discrepancy for ${booking.reference}: received €${amountReceivedEur}, expected €${expectedTotalEur}`);
      }

      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id || `pi_${Date.now()}`;

      const paymentMeta = {
        status: 'PAID',
        amount: amountReceivedEur,
        currency: 'EUR',
        sessionId: session.id,
        paymentIntentId,
        eventId: event.id,
        timestamp: new Date().toISOString()
      };

      const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
      const cleanNotes = (booking.internalNotes || '')
        .replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '')
        .trim();

      const updatedNotes = cleanNotes
        ? `${cleanNotes}\n\n✅ Payment: PAID via Verified Stripe Webhook\nAmount: €${amountReceivedEur.toFixed(2)} EUR${amountNote}\nSession ID: ${session.id}\nPaymentIntent ID: ${paymentIntentId}\nEvent ID: ${event.id}\nTimestamp: ${paymentMeta.timestamp}\n${metaTag}`
        : `✅ Payment: PAID via Verified Stripe Webhook\nAmount: €${amountReceivedEur.toFixed(2)} EUR${amountNote}\nSession ID: ${session.id}\nPaymentIntent ID: ${paymentIntentId}\nEvent ID: ${event.id}\nTimestamp: ${paymentMeta.timestamp}\n${metaTag}`;

      // Persist verified payment in Neon PostgreSQL & persistent store
      await db.bookings.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentAmount: amountReceivedEur,
          currency: 'EUR',
          stripeSessionId: session.id,
          stripePaymentIntentId: paymentIntentId,
          paymentTimestamp: paymentMeta.timestamp,
          internalNotes: updatedNotes
        }
      });

      await db.webhookEvents.markProcessed(event.id, event.type, booking.reference);
      console.log(`✅ [Stripe Webhook] Booking ${booking.reference} verified PAID (€${amountReceivedEur.toFixed(2)} EUR). Event persisted to DB.`);

      return res.status(200).json({
        received: true,
        bookingReference: booking.reference,
        paymentStatus: 'PAID',
        amount: amountReceivedEur
      });
    }

    // 10. Handle payment_intent.payment_failed (Booking remains UNPAID)
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        let booking = await db.bookings.findUnique({ where: { id: bookingId } });
        if (!booking) {
          booking = await db.bookings.findUnique({ where: { reference: bookingId } });
        }
        if (booking && booking.paymentStatus !== 'PAID') {
          const failureMsg = intent.last_payment_error?.message || 'Payment intent failed.';
          await db.bookings.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'FAILED',
              internalNotes: `${booking.internalNotes || ''}\n\n❌ Stripe Payment Failed: ${failureMsg} (${new Date().toISOString()})`.trim()
            }
          });
          console.log(`❌ [Stripe Webhook] Booking ${booking.reference} payment FAILED: ${failureMsg}. Booking remains UNPAID.`);
        }
      }
      await db.webhookEvents.markProcessed(event.id, event.type, booking?.reference || null);
      return res.status(200).json({ received: true, event: event.type, paid: false });
    }

    // 11. Handle checkout.session.expired (Booking remains UNPAID)
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const bookingId = session.client_reference_id || session.metadata?.bookingId;
      if (bookingId) {
        let booking = await db.bookings.findUnique({ where: { id: bookingId } });
        if (!booking) {
          booking = await db.bookings.findUnique({ where: { reference: bookingId } });
        }
        if (booking && booking.paymentStatus !== 'PAID') {
          await db.bookings.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'EXPIRED',
              internalNotes: `${booking.internalNotes || ''}\n\n⚠️ Stripe Checkout Expired: Session expired without payment (${new Date().toISOString()})`.trim()
            }
          });
          console.log(`ℹ️ [Stripe Webhook] Booking ${booking.reference} session expired. Booking remains UNPAID.`);
        }
      }
      await db.webhookEvents.markProcessed(event.id, event.type, null);
      return res.status(200).json({ received: true, event: event.type, paid: false });
    }

    // Default handler for other verified events
    await db.webhookEvents.markProcessed(event.id, event.type, null);
    return res.status(200).json({ received: true, event: event.type });
  } catch (error) {
    console.error('[Stripe Webhook Processing Error]:', error);
    return res.status(500).json({ error: 'Internal server error processing Stripe webhook.' });
  }
}

/**
 * GET /api/v1/public/payments/status/:id
 * Securely verify payment status of a booking from database
 */
export async function getPaymentStatus(req, res) {
  try {
    const { id } = req.params;
    let booking = await db.bookings.findUnique({ where: { id } });
    if (!booking) {
      booking = await db.bookings.findUnique({ where: { reference: id } });
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const meta = extractPaymentMeta(booking);

    res.json({
      success: true,
      bookingId: booking.id,
      reference: booking.reference,
      status: booking.status,
      paymentStatus: meta.status,
      amount: meta.amount,
      currency: meta.currency,
      stripeSessionId: meta.sessionId,
      stripePaymentIntentId: meta.paymentIntentId,
      paymentTimestamp: meta.timestamp
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve payment status.' });
  }
}

/**
 * POST /api/v1/public/payments/simulate-confirmation (For local test mode only)
 * NOTE: Simulation mode NEVER marks bookings as genuine 'PAID'
 */
export async function simulatePaymentConfirmation(req, res) {
  // LIVE MODE GUARD: block simulation endpoint entirely when a live Stripe key is configured
  if (isLiveMode) {
    console.warn('⛔ [Stripe] simulate-confirmation blocked — LIVE mode is active. Use real Stripe webhooks.');
    return res.status(403).json({
      success: false,
      error: 'Payment simulation is disabled in LIVE mode. Real Stripe payments are active.'
    });
  }

  try {
    const { bookingId, sessionId } = req.body;
    let booking = await db.bookings.findUnique({ where: { id: bookingId } });
    if (!booking) {
      booking = await db.bookings.findUnique({ where: { reference: bookingId } });
    }

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const calc = calculatePayableAmount(booking);
    const amount = calc.total;
    const simSession = sessionId || `cs_test_sim_${Date.now()}`;
    const simIntent = `pi_test_sim_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const paymentMeta = {
      status: 'SIMULATED', // NEVER genuine PAID
      amount,
      currency: 'EUR',
      sessionId: simSession,
      paymentIntentId: simIntent,
      timestamp,
      isSimulation: true
    };

    const metaTag = `[PAYMENT_META]${JSON.stringify(paymentMeta)}[/PAYMENT_META]`;
    const cleanNotes = (booking.internalNotes || '')
      .replace(/\[PAYMENT_META\][\s\S]*?\[\/PAYMENT_META\]/, '')
      .trim();

    const updatedNotes = cleanNotes
      ? `${cleanNotes}\n\n⚠️ Payment: SIMULATED TEST ONLY (NOT Genuine Stripe Paid - Awaiting verified Stripe webhook)\nAmount: €${amount.toFixed(2)} EUR\nSession ID: ${simSession}\nTimestamp: ${timestamp}\n${metaTag}`
      : `⚠️ Payment: SIMULATED TEST ONLY (NOT Genuine Stripe Paid - Awaiting verified Stripe webhook)\nAmount: €${amount.toFixed(2)} EUR\nSession ID: ${simSession}\nTimestamp: ${timestamp}\n${metaTag}`;

    const updated = await db.bookings.update({
      where: { id: booking.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'SIMULATED', // Mark as SIMULATED, NEVER genuine 'PAID'
        paymentAmount: amount,
        currency: 'EUR',
        stripeSessionId: simSession,
        stripePaymentIntentId: simIntent,
        paymentTimestamp: timestamp,
        internalNotes: updatedNotes
      }
    });

    res.json({
      success: true,
      message: 'Simulated payment recorded. Booking marked as SIMULATED (requires verified Stripe webhook for genuine PAID status).',
      booking: updated,
      paymentMeta
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to simulate payment.' });
  }
}
