import { fleetData } from '../data/fleet';
import { allBlogPosts } from '../data/blogs';
import { toursData } from '../data/tours';
import { servicesData } from '../data/pages';
import {
  fetchSanityBlogs,
  fetchSanityBlogBySlug,
  fetchSanityFleet,
  fetchSanityServices,
  fetchSanityDayTrips,
  fetchSanityHomepage,
  fetchSanityAbout,
  fetchSanitySEO,
} from './sanityApi';

export {
  fetchSanityBlogs,
  fetchSanityBlogBySlug,
  fetchSanityFleet,
  fetchSanityServices,
  fetchSanityDayTrips,
  fetchSanityHomepage,
  fetchSanityAbout,
  fetchSanitySEO,
};

/**
 * Fetch published fleet vehicles from Sanity CMS -> Backend API -> Static Fallback
 */
export async function fetchPublicVehicles() {
  // 1. Try Sanity CMS
  try {
    const sanityVehicles = await fetchSanityFleet();
    if (sanityVehicles && sanityVehicles.length > 0) {
      return sanityVehicles;
    }
  } catch (err) {
    // continue to backend
  }

  // 2. Try Node.js Backend API
  try {
    const res = await fetch('/api/v1/public/vehicles');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.vehicles?.length > 0) {
        return data.vehicles;
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 3. Fallback to bundled dataset
  return fleetData;
}

/**
 * Fetch published services from Node.js Backend API (PostgreSQL) -> Sanity CMS -> Static Fallback
 */
export async function fetchPublicServices() {
  // 1. Try Node.js Backend API (PostgreSQL Neon store)
  try {
    const res = await fetch('/api/v1/public/services');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.services) && data.services.length > 0) {
        return data.services;
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 2. Try Sanity CMS
  try {
    const sanityServices = await fetchSanityServices();
    if (sanityServices && sanityServices.length > 0) {
      return sanityServices.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.title,
        shortDesc: s.description || s.subtitle || '',
        fullDesc: s.fullDescription || '',
        features: s.highlights || [],
        image: s.heroImage || '/images/vienna-palace-backdrop.webp',
        ctaLabel: 'Book Service',
        ctaUrl: `/${s.slug}/`,
        displayOrder: 1,
        isPublished: true,
      }));
    }
  } catch (err) {
    // Graceful fallback
  }

  // 3. Fallback to bundled static dataset
  return (servicesData.pillars || []).map((p, idx) => ({
    id: `srv_${p.id}`,
    slug: p.link?.replace(/^\/|\/$/g, '') || p.id,
    name: p.title,
    shortDesc: p.desc,
    fullDesc: p.desc,
    features: p.bullets || [],
    image: p.image,
    ctaLabel: 'LEARN MORE & BOOK',
    ctaUrl: p.link,
    displayOrder: idx + 1,
    isPublished: true,
  }));
}

/**
 * Fetch published blog articles with pagination, category filter & search
 * Order: Sanity CMS -> Node.js Backend API -> Local Static Dataset
 */
export async function fetchPublicBlogs({ page = 1, limit = 9, category = 'All', search = '' } = {}) {
  // 1. Try Sanity CMS
  try {
    const sanityResult = await fetchSanityBlogs({ page, limit, category, search });
    if (sanityResult && sanityResult.blogs?.length > 0) {
      return sanityResult;
    }
  } catch (err) {
    // continue to backend
  }

  // 2. Try Node.js Backend API
  try {
    const url = `/api/v1/public/blogs?page=${page}&limit=${limit}&category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.blogs?.length > 0) {
        return data;
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }

  // 3. Fallback to local blog dataset (All 129 articles)
  let list = allBlogPosts;
  if (category && category !== 'All') {
    list = list.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter((b) => b.title?.toLowerCase().includes(q) || b.excerpt?.toLowerCase().includes(q));
  }
  const total = list.length;
  const startIndex = (page - 1) * limit;
  const paginated = list.slice(startIndex, startIndex + limit);

  return {
    success: true,
    source: 'local',
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    blogs: paginated,
  };
}

/**
 * Fetch single blog article by slug
 * Order: Sanity CMS -> Node.js Backend API -> Local Static Dataset
 */
export async function fetchPublicBlogBySlug(slug) {
  // 1. Try Sanity CMS
  try {
    const sanityArticle = await fetchSanityBlogBySlug(slug);
    if (sanityArticle && sanityArticle.blog) {
      return sanityArticle;
    }
  } catch (err) {
    // continue to backend
  }

  // 2. Try Node.js Backend API
  try {
    const res = await fetch(`/api/v1/public/blogs/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.blog) {
        return { blog: data.blog, related: data.related || [], source: 'backend' };
      }
    }
  } catch (err) {
    // fallback
  }

  // 3. Fallback to local dataset
  const blog = allBlogPosts.find((b) => b.slug === slug);
  const related = allBlogPosts.filter((b) => b.slug !== slug && b.category === blog?.category).slice(0, 3);
  return { blog, related, source: 'local' };
}

/**
 * Submit booking enquiry to PostgreSQL and return generated reference
 */
export async function submitBookingEnquiry(formData) {
  try {
    const res = await fetch('/api/v1/public/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Backend currently offline. You can proceed directly through WhatsApp.',
    };
  }
}

/**
 * Submit contact message enquiry to PostgreSQL and return reference
 */
export async function submitContactEnquiry(contactData) {
  try {
    const res = await fetch('/api/v1/public/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Backend currently offline. You can proceed directly through WhatsApp.',
    };
  }
}
