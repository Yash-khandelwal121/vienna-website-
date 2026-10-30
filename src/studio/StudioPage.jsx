import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Sanity Studio has been disabled in favor of the integrated Express + PostgreSQL Admin Console.
 */
export default function StudioPage() {
  return <Navigate to="/admin" replace />;
}

