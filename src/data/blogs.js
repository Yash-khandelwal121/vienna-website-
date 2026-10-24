// Auto-generated blog database for Vienna Day Trip
import blogPostsData from './blogPosts.json';

export const allBlogPosts = blogPostsData;

export const blogCategories = [
  {
    "name": "Our Blog",
    "count": 56
  },
  {
    "name": "Uncategorized",
    "count": 27
  },
  {
    "name": "Chauffeur",
    "count": 40
  },
  {
    "name": "General",
    "count": 11
  },
  {
    "name": "Car Rent",
    "count": 8
  },
  {
    "name": "Services",
    "count": 1
  }
];

export function getBlogPostBySlug(slug) {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, '');
  return allBlogPosts.find(p => p.slug.toLowerCase() === cleanSlug) || null;
}

export function getRelatedBlogPosts(currentSlug, primaryCategory, limit = 3) {
  const current = getBlogPostBySlug(currentSlug);
  const others = allBlogPosts.filter(p => p.slug !== currentSlug);
  
  // Prefer same category
  const sameCategory = others.filter(p => 
    p.categories.includes(primaryCategory) || p.primaryCategory === primaryCategory
  );
  
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  
  // Fill remaining from others
  const remaining = others.filter(p => !sameCategory.includes(p));
  return [...sameCategory, ...remaining].slice(0, limit);
}
