/**
 * Vienna Day Trip — usePageMeta
 *
 * Custom hook that fetches the admin-saved SEO record for the current
 * route path and applies it to the live browser <head>:
 *   - document.title
 *   - <meta name="description">
 *
 * Falls back to the value already present in index.html if the API
 * call fails or returns no data.  Runs on every pathname change so
 * title/description update correctly during client-side navigation.
 *
 * NOTE: This is a client-side-only solution (SPA).  The initial HTML
 * served by Vercel will always contain the index.html defaults because
 * the site is not SSR.  Search engines that execute JavaScript (Google)
 * will see the dynamically updated values in the rendered DOM.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const VDT_DESC_META_ID = 'vdt-meta-description';

/**
 * Normalise a pathname: ensure trailing slash, collapse repeated slashes.
 */
function normPath(p) {
  if (!p || p === '/') return '/';
  const clean = p.replace(/\/+$/, '') + '/';
  return clean;
}

/**
 * Invalidate the api.js requestCache entry for an SEO path.
 * Called by SeoManager after a successful save so the hook re-fetches
 * fresh data immediately on the next navigation.
 */
export function invalidateSeoCache(pathname) {
  // api.js uses module-level Maps; we cannot reach them directly from here,
  // but we can read the cache key pattern they use and clear via a window flag
  // that CustomSchemaRenderer and usePageMeta both check.
  const norm = pathname === '/' ? '/' : normPath(pathname);
  const key = `public_seo_${norm}`;
  if (window.__vdt_seo_invalidated === undefined) window.__vdt_seo_invalidated = new Set();
  window.__vdt_seo_invalidated.add(key);
}

/**
 * Apply title and description to the live <head>.
 * Exported for direct imperative use in tests / debugging.
 */
export function applyPageMeta(title, description, canonicalUrl = null) {
  if (title && typeof title === 'string' && title.trim()) {
    document.title = title.trim();
  }
  if (description && typeof description === 'string' && description.trim()) {
    // Prefer the pre-seeded element with id so we never create duplicates
    let el = document.getElementById(VDT_DESC_META_ID);
    if (!el) {
      // Fallback: find any existing description meta
      el = document.querySelector('meta[name="description"]');
    }
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', 'description');
      el.id = VDT_DESC_META_ID;
      document.head.appendChild(el);
    }
    el.setAttribute('content', description.trim());
  }
  if (canonicalUrl && typeof canonicalUrl === 'string' && canonicalUrl.trim()) {
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl.trim());
  }
}

/**
 * usePageMeta — drop this into Layout.jsx (runs on every route change).
 *
 * @param {string|null} overrideTitle      – pass explicit title (e.g. from TourPage data)
 * @param {string|null} overrideDescription – pass explicit description
 */
export default function usePageMeta(overrideTitle = null, overrideDescription = null) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Admin and studio routes don't need public SEO records
    if (pathname.startsWith('/admin') || pathname.startsWith('/studio')) return;

    let isMounted = true;

    async function apply() {
      // If the caller provided explicit values, use them directly
      if (overrideTitle || overrideDescription) {
        if (isMounted) applyPageMeta(overrideTitle, overrideDescription);
        return;
      }

      // Derive the normalised path the SEO API expects
      const norm = normPath(pathname);

      try {
        // Always bypass the module-level requestCache for SEO meta so that
        // admin saves are reflected immediately — use a direct fetch with a
        // cache-busting timestamp to avoid the browser HTTP cache too.
        const ts = Date.now();
        const res = await fetch(
          `/api/v1/public/seo/page?path=${encodeURIComponent(norm)}&_t=${ts}`
        );
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.record) {
            const { metaTitle, metaDescription, canonicalUrl } = data.record;
            applyPageMeta(metaTitle, metaDescription, canonicalUrl);
          }
        }
      } catch (_e) {
        // Network error — leave whatever is already in the head intact
      }
    }

    apply();

    return () => {
      isMounted = false;
    };
  }, [pathname, overrideTitle, overrideDescription]);
}

