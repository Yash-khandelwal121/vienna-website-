import React, { useState } from 'react';

/**
 * Heuristic to detect whether an image is an infographic / poster-style cover
 * (with embedded titles, icons, and text) or a clean photographic cover.
 */
export function isPosterCover(src) {
  if (!src) return false;
  const s = src.toLowerCase();
  // Photographic assets
  if (s.includes('vienna-hero') || s.includes('gallery-') || s.includes('about-') || s.includes('cars/')) {
    return false;
  }
  // Sanity & local blog featured posters
  if (s.includes('feat-') || s.endsWith('.png') || s.includes('blog-images')) {
    return true;
  }
  return false;
}

/**
 * Reusable Blog Cover Image component
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {('featured'|'recommended'|'card')} variant - Display context
 * @param {boolean} [isPoster] - Explicit override for poster-style contain vs photo cover
 * @param {string} [className] - Additional wrapper class
 * @param {boolean} [eager] - Load eagerly if above the fold
 */
export default function BlogCoverImage({
  src,
  alt = '',
  variant = 'card',
  isPoster: explicitIsPoster,
  className = '',
  eager = false,
}) {
  const [hasError, setHasError] = useState(false);
  const poster = explicitIsPoster !== undefined ? explicitIsPoster : isPosterCover(src);

  // Fallbacks
  const fallbackSrc = poster
    ? '/blog-images/feat-duernstein-day-trip.png'
    : '/images/gallery-hallstatt.webp';

  const imageSrc = hasError || !src ? fallbackSrc : src;

  return (
    <div
      className={`vdt-cover-wrap vdt-cover-wrap-${variant} ${poster ? 'is-poster' : 'is-photo'} ${className}`}
    >
      <img
        src={imageSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding={eager ? 'sync' : 'async'}
        className={`vdt-cover-img vdt-cover-img-${variant} ${poster ? 'fit-contain' : 'fit-cover'}`}
        onError={() => {
          if (!hasError) setHasError(true);
        }}
      />
    </div>
  );
}
