import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * useScrollReveal Hook
 * Implements TourlyTransfer-inspired smooth cinematic scrolling reveals
 * - Duration: 600ms
 * - Translate Y: 24px → 0
 * - Opacity: 0 → 1
 * - Easing: cubic-bezier(0.22, 1, 0.36, 1)
 * - Single execution via IntersectionObserver
 * - Automatic stagger for card grids and feature groups
 * - Fallback & immediate reveal for elements already in viewport
 * - Respects prefers-reduced-motion
 */
export default function useScrollReveal() {
  const { pathname } = useLocation();

  useEffect(() => {
    // If reduced motion is preferred, immediately reveal everything without animation
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.querySelectorAll(
        '.reveal-on-scroll, .reveal-stagger, .vdt-section-heading, .vdt-grid, .section-header, .reveal-header'
      ).forEach((el) => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const observerOptions = {
      root: null, // viewport
      threshold: 0.12, // trigger when 12% visible
      rootMargin: '0px 0px -40px 0px' // trigger slightly before bottom edge
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // Animate each section strictly only once
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Query all revealable targets across homepage and inner pages
    const targets = document.querySelectorAll(
      '.reveal-on-scroll, .reveal-stagger, .vdt-section-heading, .vdt-grid, .section-header, .reveal-header, .destination-grid-track, .timeline-container, .gallery-grid, .marquee-container'
    );

    targets.forEach((target) => {
      // Check if target is already above or within the viewport on initial render
      const rect = target.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30) {
        target.classList.add('is-revealed');
      } else {
        observer.observe(target);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);
}
