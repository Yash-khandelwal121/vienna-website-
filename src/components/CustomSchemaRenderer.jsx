import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchPublicSeoRecord } from '../services/api';
import { injectCustomSchema, removeCustomSchema } from '../utils/schemaInjector';

/**
 * Public Page Custom JSON-LD Schema Renderer
 * 
 * Automatically resolves the active page route, loads the persistent custom
 * JSON-LD schema (if configured in Admin SEO & Sitemap), and safely injects
 * it into document.head via a unified deterministic <script> element.
 */
export default function CustomSchemaRenderer() {
  const { pathname } = useLocation();

  useEffect(() => {
    let isMounted = true;

    // Do not run on Admin portal routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/studio')) {
      removeCustomSchema();
      return;
    }

    // Identify if this is a dedicated Tour destination page (handled with tourKey by TourPage)
    const isTourRoute = [
      'hallstatt',
      'salzburg',
      'budapest',
      'prague',
      'bratislava',
      'wachau',
      'customized'
    ].some((k) => pathname.includes(k));

    async function applyRouteSchema() {
      try {
        const record = await fetchPublicSeoRecord(pathname);
        if (!isMounted) return;

        if (record && record.schemaMarkup && record.schemaMarkup.trim()) {
          injectCustomSchema(record.schemaMarkup);
        } else if (!isTourRoute) {
          // If no custom schema configured for this general page, ensure any stale schema is removed
          removeCustomSchema();
        }
      } catch (err) {
        if (!isTourRoute) removeCustomSchema();
      }
    }

    applyRouteSchema();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return null;
}
