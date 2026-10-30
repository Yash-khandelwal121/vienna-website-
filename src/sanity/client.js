import { createImageUrlBuilder } from '@sanity/image-url';

export const projectId = import.meta.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm';
export const dataset = import.meta.env.VITE_SANITY_DATASET || 'production';
export const apiVersion = import.meta.env.VITE_SANITY_API_VERSION || '2024-01-01';

const isDev = typeof window !== 'undefined' && import.meta.env.DEV;

// Sanity CMS Integration: Disabled (Website operates on Express + PostgreSQL)
export const SANITY_DISABLED = true;

// Public frontend client - network queries disabled
export const sanityClient = {
  fetch: async () => null,
  config: () => ({ projectId, dataset, apiVersion }),
};

// Helper for generating responsive, optimized Sanity image URLs using supported named export
const builder = createImageUrlBuilder({ projectId, dataset });

export function urlForImage(source) {
  if (!source) return null;
  // If source is already a direct string URL (e.g. from static fallback)
  if (typeof source === 'string') return source;
  if (source.imageUrl && typeof source.imageUrl === 'string' && source.imageUrl.trim() && !source.imageUrl.includes('drive.google.com')) {
    return source.imageUrl.trim();
  }
  if (source.url && typeof source.url === 'string') {
    return source.url.trim();
  }
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
 * Disabled fetch wrapper - safely returns null without making any network requests
 */
export async function sanityFetch() {
  return { data: null, error: null };
}

export default sanityClient;
