import { sanityClient, urlForImage } from '../sanity/client';

/**
 * Normalizes blog post fields from Sanity into the format expected by the React frontend
 */
export function formatSanityBlogPost(post) {
  if (!post) return null;
  const imageSource = post.coverImage;
  let imageUrl = '/blog-images/feat-duernstein-day-trip.png';
  if (imageSource) {
    if (imageSource.imageUrl) {
      imageUrl = imageSource.imageUrl;
    } else if (imageSource.asset) {
      imageUrl = urlForImage(imageSource) || imageUrl;
    }
  }

  return {
    id: post._id,
    title: post.title,
    slug: typeof post.slug === 'string' ? post.slug : post.slug?.current || '',
    excerpt: post.excerpt || '',
    category: post.categoryName || post.category || 'Luxury Travel',
    author: post.author || 'Vienna Day Trip Editorial Team',
    date: post.publishedAt
      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'October 2026',
    rawDate: post.publishedAt,
    modified: post.modifiedAt || post.publishedAt,
    readTime: post.readTime || '5 min read',
    featuredImage: imageUrl,
    featuredImageAlt: imageSource?.alt || post.title,
    featuredImageTitle: imageSource?.title || '',
    content: post.content || '',
    body: post.body,
    keywords: post.keywords || post.seo?.keywords || [],
    isPublished: post.isPublished !== false,
    seo: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      keywords: post.seo?.keywords || post.keywords || [],
      canonical: post.seo?.canonicalUrl || '',
      headScript: post.seo?.headScript || '',
      bodyScript: post.seo?.bodyScript || '',
    },
    _source: 'sanity',
  };
}

/**
 * Fetch published blog articles from Sanity CMS (Safely disabled - returns null to route to PostgreSQL / backend)
 */
export async function fetchSanityBlogs() {
  return null;
}

/**
 * Fetch a single blog article by slug from Sanity CMS (Safely disabled)
 */
export async function fetchSanityBlogBySlug() {
  return null;
}

/**
 * Fetch published vehicles from Sanity CMS (Safely disabled)
 */
export async function fetchSanityFleet() {
  return null;
}

/**
 * Fetch day trips from Sanity CMS (Safely disabled)
 */
export async function fetchSanityDayTrips() {
  return null;
}

/**
 * Fetch services from Sanity CMS (Safely disabled)
 */
export async function fetchSanityServices() {
  return null;
}

/**
 * Fetch Homepage content from Sanity CMS (Safely disabled)
 */
export async function fetchSanityHomepage() {
  return null;
}

/**
 * Fetch About Us content from Sanity CMS (Safely disabled)
 */
export async function fetchSanityAbout() {
  return null;
}

/**
 * Fetch SEO settings for route (Safely disabled)
 */
export async function fetchSanitySEO() {
  return null;
}

