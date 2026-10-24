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
    readTime: post.readTime || '5 min read',
    featuredImage: imageUrl,
    content: post.content || '',
    body: post.body,
    isPublished: post.isPublished !== false,
    seo: {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      keywords: post.seo?.keywords || [],
    },
    _source: 'sanity',
  };
}

/**
 * Fetch published blog articles from Sanity CMS with fallback
 */
export async function fetchSanityBlogs({ page = 1, limit = 9, category = 'All', search = '' } = {}) {
  try {
    const start = (page - 1) * limit;
    const end = start + limit;

    // GROQ query for matching posts
    let filter = `_type == "blogPost" && isPublished == true`;
    const params = {};

    if (category && category !== 'All') {
      filter += ` && (categoryName == $cat || category->title == $cat)`;
      params.cat = category;
    }

    if (search && search.trim()) {
      filter += ` && (title match $search || excerpt match $search)`;
      params.search = `*${search.trim()}*`;
    }

    const query = `{
      "total": count(*[${filter}]),
      "items": *[${filter}] | order(publishedAt desc) [${start}...${end}] {
        _id,
        title,
        slug,
        excerpt,
        categoryName,
        "category": category->title,
        author,
        publishedAt,
        readTime,
        isPublished,
        coverImage,
        seo
      }
    }`;

    const res = await sanityClient.fetch(query, params);
    if (res && res.items && res.items.length > 0) {
      return {
        success: true,
        source: 'sanity',
        total: res.total,
        page,
        limit,
        totalPages: Math.ceil(res.total / limit) || 1,
        blogs: res.items.map(formatSanityBlogPost),
      };
    }
  } catch (err) {
    console.warn('[Sanity CMS] Blogs query notice:', err.message);
  }
  return null; // Return null so caller can fallback seamlessly
}

/**
 * Fetch a single blog article by slug from Sanity CMS with related posts
 */
export async function fetchSanityBlogBySlug(slug) {
  try {
    const query = `{
      "blog": *[_type == "blogPost" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        content,
        body,
        categoryName,
        "category": category->title,
        author,
        publishedAt,
        readTime,
        isPublished,
        coverImage,
        seo
      },
      "related": *[_type == "blogPost" && slug.current != $slug && isPublished == true][0...3] {
        _id,
        title,
        slug,
        excerpt,
        categoryName,
        "category": category->title,
        author,
        publishedAt,
        readTime,
        coverImage
      }
    }`;

    const res = await sanityClient.fetch(query, { slug });
    if (res && res.blog) {
      return {
        blog: formatSanityBlogPost(res.blog),
        related: (res.related || []).map(formatSanityBlogPost),
        source: 'sanity',
      };
    }
  } catch (err) {
    console.warn('[Sanity CMS] Single blog query notice:', err.message);
  }
  return null;
}

/**
 * Fetch published vehicles from Sanity CMS
 */
export async function fetchSanityFleet() {
  try {
    const query = `*[_type == "luxuryFleet" && isAvailable == true] | order(sortOrder asc) {
      _id,
      name,
      model,
      category,
      tagline,
      capacityPassengers,
      capacityLuggage,
      features,
      hourlyRate,
      dayRate,
      image,
      sortOrder
    }`;
    const items = await sanityClient.fetch(query);
    if (items && items.length > 0) {
      return items.map((v) => {
        let imageUrl = v.image?.imageUrl || '/images/fleet/s-class-transparent.png';
        if (v.image?.asset) {
          imageUrl = urlForImage(v.image) || imageUrl;
        }
        return {
          id: v._id,
          name: v.name,
          model: v.model,
          class: v.category,
          passengers: v.capacityPassengers || 3,
          luggage: v.capacityLuggage || 2,
          description: v.tagline || '',
          image: imageUrl,
          features: v.features || [],
          hourlyRate: v.hourlyRate,
          dayRate: v.dayRate,
          _source: 'sanity',
        };
      });
    }
  } catch (err) {
    console.warn('[Sanity CMS] Fleet query notice:', err.message);
  }
  return null;
}

/**
 * Fetch day trips from Sanity CMS
 */
export async function fetchSanityDayTrips() {
  try {
    const query = `*[_type == "dayTrip" && isActive == true] | order(sortOrder asc) {
      _id,
      title,
      slug,
      destination,
      duration,
      distance,
      price,
      shortDescription,
      itinerary,
      included,
      heroImage
    }`;
    const items = await sanityClient.fetch(query);
    if (items && items.length > 0) {
      return items.map((t) => ({
        id: t._id,
        title: t.title,
        slug: t.slug?.current || '',
        destination: t.destination,
        duration: t.duration,
        price: t.price,
        shortDescription: t.shortDescription,
        itinerary: t.itinerary,
        included: t.included,
        heroImage: t.heroImage?.imageUrl || (t.heroImage?.asset ? urlForImage(t.heroImage) : ''),
        _source: 'sanity',
      }));
    }
  } catch (err) {
    console.warn('[Sanity CMS] Day trips query notice:', err.message);
  }
  return null;
}

/**
 * Fetch services from Sanity CMS
 */
export async function fetchSanityServices() {
  try {
    const query = `*[_type == "chauffeurService" && isActive == true] | order(sortOrder asc) {
      _id,
      title,
      slug,
      subtitle,
      shortDescription,
      fullDescription,
      icon,
      startingPrice,
      priceUnit,
      highlights,
      heroImage
    }`;
    const items = await sanityClient.fetch(query);
    if (items && items.length > 0) {
      return items.map((s) => ({
        id: s._id,
        title: s.title,
        slug: s.slug?.current || '',
        subtitle: s.subtitle,
        description: s.shortDescription,
        fullDescription: s.fullDescription,
        icon: s.icon,
        startingPrice: s.startingPrice,
        priceUnit: s.priceUnit,
        highlights: s.highlights,
        heroImage: s.heroImage?.imageUrl || (s.heroImage?.asset ? urlForImage(s.heroImage) : ''),
        _source: 'sanity',
      }));
    }
  } catch (err) {
    console.warn('[Sanity CMS] Services query notice:', err.message);
  }
  return null;
}

/**
 * Fetch Homepage content from Sanity CMS
 */
export async function fetchSanityHomepage() {
  try {
    const query = `*[_type == "homepageContent"][0]`;
    const doc = await sanityClient.fetch(query);
    if (doc) return { ...doc, _source: 'sanity' };
  } catch (err) {
    console.warn('[Sanity CMS] Homepage query notice:', err.message);
  }
  return null;
}

/**
 * Fetch About Us content from Sanity CMS
 */
export async function fetchSanityAbout() {
  try {
    const query = `*[_type == "aboutContent"][0]`;
    const doc = await sanityClient.fetch(query);
    if (doc) return { ...doc, _source: 'sanity' };
  } catch (err) {
    console.warn('[Sanity CMS] About query notice:', err.message);
  }
  return null;
}

/**
 * Fetch SEO settings for route
 */
export async function fetchSanitySEO(route) {
  try {
    const query = `*[_type == "seoSettings" && pageRoute == $route][0]`;
    const doc = await sanityClient.fetch(query, { route });
    if (doc) return { ...doc, _source: 'sanity' };
  } catch (err) {
    console.warn('[Sanity CMS] SEO query notice:', err.message);
  }
  return null;
}
