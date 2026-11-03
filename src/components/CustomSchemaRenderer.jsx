import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { injectCustomSchema, removeCustomSchema } from '../utils/schemaInjector';

/**
 * Public Page Custom JSON-LD Schema Renderer
 *
 * Automatically resolves the active page route, loads the persistent custom
 * JSON-LD schema (if configured in Admin SEO & Sitemap), and safely injects
 * it into document.head via a unified deterministic <script> element.
 *
 * IMPORTANT: Tour/destination pages (e.g. /hallstatt-day-trip-from-vienna/)
 * manage their own JSON-LD via TourPage.jsx → injectCustomSchema().  This
 * component deliberately skips those routes to avoid conflicts or duplicates.
 */

// Tour slug keywords — routes that TourPage.jsx handles directly
const TOUR_ROUTE_KEYWORDS = [
  'hallstatt',
  'salzburg',
  'budapest',
  'prague',
  'bratislava',
  'wachau',
  'customized',
  'airport-transfer',
  'airport-pick',
  'hourly-chauffeur',
  'vienna-sightseeing',
  'secure-transportation',
];

function isTourRoute(pathname) {
  return TOUR_ROUTE_KEYWORDS.some((k) => pathname.includes(k));
}

export default function CustomSchemaRenderer() {
  const { pathname } = useLocation();

  useEffect(() => {
    let isMounted = true;

    // Do not run on Admin portal routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/studio')) {
      removeCustomSchema();
      return;
    }

    // Tour destination pages handle their own JSON-LD injection — skip here
    // to prevent stale/empty SEO page record from removing their schema.
    if (isTourRoute(pathname)) {
      return;
    }

    async function applyRouteSchema() {
      try {
        // Cache-bust so admin saves are reflected immediately
        const norm =
          pathname === '/'
            ? '/'
            : pathname.endsWith('/')
            ? pathname
            : `${pathname}/`;
        const ts = Date.now();
        const res = await fetch(
          `/api/v1/public/seo/page?path=${encodeURIComponent(norm)}&_t=${ts}`
        );
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.record?.schemaMarkup?.trim()) {
            injectCustomSchema(data.record.schemaMarkup);
          } else {
            removeCustomSchema();
          }
        } else {
          removeCustomSchema();
        }
      } catch (_err) {
        removeCustomSchema();
      }
    }

    applyRouteSchema();

    return () => {
      isMounted = false;
      // Only remove schema when navigating away from a non-tour page
      // Tour pages manage their own cleanup in TourPage's useEffect return
      if (!isTourRoute(pathname)) {
        removeCustomSchema();
      }
    };
  }, [pathname]);

  return null;
}
