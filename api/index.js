import app from '../server/index.js';

/**
 * Vercel Serverless Function entrypoint
 * Directly delegates incoming HTTP requests to the Express application engine.
 *
 * CRITICAL: bodyParser must be disabled so that Vercel does NOT pre-parse the
 * HTTP request body before it reaches Express. If Vercel parses the body first,
 * the raw Buffer required by stripe.webhooks.constructEvent() for HMAC-SHA256
 * signature verification is destroyed, causing all webhook signature checks to
 * fail with "No signatures found matching the expected signature for payload."
 */
export const config = {
  api: {
    bodyParser: false,       // Let Express handle body parsing (raw buffer for webhooks)
    responseLimit: false,    // No response size limit for large API responses
    externalResolver: true   // Suppress Vercel's "No response" warnings for Express
  }
};

export default function handler(req, res) {
  return app(req, res);
}
