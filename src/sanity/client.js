import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm';
export const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
export const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';

// Public frontend client with CDN enabled for ultra-fast cached responses
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
});

// Helper for generating responsive, optimized Sanity image URLs
const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source) {
  if (!source) return null;
  // If source is already a direct string URL (e.g. from static fallback)
  if (typeof source === 'string') return source;
  if (source.imageUrl) return source.imageUrl;
  if (source.asset) {
    try {
      return builder.image(source).auto('format').fit('max').url();
    } catch {
      return source.imageUrl || null;
    }
  }
  return null;
}

/**
 * Robust fetch wrapper that gracefully catches network/CORS/empty errors
 * without ever crashing the application.
 */
export async function sanityFetch(query, params = {}) {
  try {
    const data = await sanityClient.fetch(query, params);
    return { data, error: null };
  } catch (err) {
    console.warn('[Sanity CMS] Query notice:', err.message);
    return { data: null, error: err };
  }
}

export default sanityClient;
