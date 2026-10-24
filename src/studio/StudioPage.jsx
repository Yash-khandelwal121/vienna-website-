import React from 'react';
import { Studio } from 'sanity';
import sanityConfig from '../../sanity.config';

export default function StudioPage() {
  return (
    <div
      id="sanity-studio-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        overflow: 'hidden',
        backgroundColor: '#101112',
      }}
    >
      <Studio config={sanityConfig} />
    </div>
  );
}
