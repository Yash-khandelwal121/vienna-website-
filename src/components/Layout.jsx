import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ViennaFooter from './ViennaFooter';
import FloatingWhatsApp from './FloatingWhatsApp';
import CustomSchemaRenderer from './CustomSchemaRenderer';
import useScrollReveal from '../hooks/useScrollReveal';
import usePageMeta from '../hooks/usePageMeta';

export default function Layout() {
  const { pathname } = useLocation();

  // Activate TourlyTransfer-grade smooth cinematic scroll reveals
  useScrollReveal();

  // Sync admin-saved meta title & description into the live <head> on every route change
  usePageMeta();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <CustomSchemaRenderer />
      <Navbar />
      <main style={{ flex: '1 0 auto' }}>
        <Outlet />
      </main>
      <ViennaFooter />
      <FloatingWhatsApp />
    </div>
  );
}
