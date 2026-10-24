import app from '../server/index.js';

/**
 * Vercel Serverless Function entrypoint
 * Directly delegates incoming HTTP requests to the Express application engine.
 */
export default function handler(req, res) {
  return app(req, res);
}
