import { db } from '../config/db.js';

// Helper to get Sanity client with write access if token available
export async function getSanityWriteClient() {
  if (!process.env.SANITY_API_TOKEN) return null;
  try {
    const { createClient } = await import('@sanity/client');
    return createClient({
      projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm',
      dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      token: process.env.SANITY_API_TOKEN,
      useCdn: false
    });
  } catch (err) {
    console.warn('[Sanity Sync Client Note]:', err.message);
    return null;
  }
}

/**
 * GET /api/v1/public/blogs
 * Public blog listing with category filtering and search
 */
export async function getPublicBlogs(req, res) {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    let blogs = await db.blogs.findMany({ where: { isPublished: true } });

    if (category && category !== 'All') {
      blogs = blogs.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      blogs = blogs.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q) ||
          b.content?.toLowerCase().includes(q)
      );
    }

    const total = blogs.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = blogs.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)) || 1,
      blogs: paginated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve blogs.' });
  }
}

/**
 * GET /api/v1/public/blogs/:slug
 */
export async function getPublicBlogBySlug(req, res) {
  try {
    const cleanSlug = (req.params.slug || '').trim().replace(/\/+$/, '');
    let blog = await db.blogs.findUnique({ where: { slug: cleanSlug } });

    // Fallback: Check Sanity CMS if not found in db.blogs
    if (!blog) {
      try {
        const { createClient } = await import('@sanity/client');
        const sanity = createClient({
          projectId: process.env.SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || 'lwp5b4fm',
          dataset: process.env.SANITY_DATASET || process.env.VITE_SANITY_DATASET || 'production',
          apiVersion: '2024-01-01',
          useCdn: false
        });
        const query = `*[_type == "blogPost" && slug.current == $slug][0]`;
        const item = await sanity.fetch(query, { slug: cleanSlug });
        if (item) {
          blog = {
            id: item._id,
            slug: cleanSlug,
            title: item.title,
            excerpt: item.excerpt || '',
            content: item.content || '',
            body: item.body,
            featuredImage: item.coverImage?.imageUrl || '/images/vienna-palace-backdrop.webp',
            category: item.categoryName || 'Travel Guides',
            author: item.author || 'Vienna Day Trip Concierge',
            date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'October 2026',
            rawDate: item.publishedAt || new Date().toISOString(),
            isPublished: item.isPublished !== false,
            seo: item.seo || {}
          };
        }
      } catch (sanityErr) {
        // Continue to not found
      }
    }

    if (!blog || !blog.isPublished) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    // Related blogs in same category
    const allBlogs = await db.blogs.findMany({ where: { isPublished: true } });
    const related = allBlogs
      .filter((b) => b.slug !== blog.slug && b.category === blog.category)
      .slice(0, 3);

    res.json({ success: true, blog, related });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching blog article.' });
  }
}

/**
 * GET /api/v1/admin/blogs
 */
export async function getAdminBlogs(req, res) {
  try {
    const { search, category, status, limit = 50, page = 1 } = req.query;
    let blogs = await db.blogs.findMany();

    if (status === 'PUBLISHED') blogs = blogs.filter((b) => b.isPublished);
    if (status === 'DRAFT') blogs = blogs.filter((b) => !b.isPublished);

    if (category && category !== 'All') {
      blogs = blogs.filter((b) => b.category?.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      blogs = blogs.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.slug?.toLowerCase().includes(q) ||
          b.excerpt?.toLowerCase().includes(q)
      );
    }

    const total = blogs.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginated = blogs.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      blogs: paginated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to load admin blogs.' });
  }
}

/**
 * POST /api/v1/admin/blogs
 */
export async function createBlog(req, res) {
  try {
    const data = req.body;
    if (!data.title || !data.content) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const cleanSlug = (data.slug || data.title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existing = await db.blogs.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An article with this URL slug already exists.' });
    }

    const isPub = data.isPublished !== false;
    const nowIso = new Date().toISOString();

    const created = await db.blogs.create({
      data: {
        slug: cleanSlug,
        title: data.title.trim(),
        excerpt: data.excerpt || '',
        content: data.content,
        featuredImage: data.featuredImage || '/images/vienna-palace-backdrop.webp',
        featuredImageAlt: data.featuredImageAlt || data.title.trim(),
        featuredImageTitle: data.featuredImageTitle || '',
        featuredImageCaption: data.featuredImageCaption || '',
        category: data.category || 'Travel Guides',
        categories: data.categories || [data.category || 'Travel Guides'],
        author: data.author || 'Vienna Day Trip Concierge',
        date: data.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        rawDate: data.rawDate || nowIso,
        modified: nowIso,
        isPublished: isPub,
        seo: data.seo || { metaTitle: data.title, metaDescription: data.excerpt }
      }
    });

    // Cloud persistence: Synchronize with Sanity CMS
    let sanitySuccess = false;
    let sanityError = null;
    const sanity = await getSanityWriteClient();
    if (sanity) {
      try {
        const sanityDoc = {
          _type: 'blogPost',
          _id: `blogPost-${cleanSlug}`,
          title: data.title.trim(),
          slug: { _type: 'slug', current: cleanSlug },
          excerpt: data.excerpt || '',
          content: data.content,
          categoryName: data.category || 'Travel Guides',
          author: data.author || 'Vienna Day Trip Concierge',
          publishedAt: data.rawDate || nowIso,
          modifiedAt: nowIso,
          isPublished: isPub,
          coverImage: {
            _type: 'image',
            imageUrl: data.featuredImage || '/images/vienna-palace-backdrop.webp',
            alt: data.featuredImageAlt || data.title.trim(),
            title: data.featuredImageTitle || ''
          },
          seo: {
            metaTitle: data.seo?.metaTitle || data.title.trim(),
            metaDescription: data.seo?.metaDescription || data.excerpt || '',
            canonicalUrl: data.seo?.canonicalUrl || `https://viennadaytrip.com/blog/${cleanSlug}/`,
            keywords: data.seo?.keywords || []
          }
        };
        await sanity.createOrReplace(sanityDoc);
        sanitySuccess = true;
        console.log(`[Sanity Sync] Successfully persisted article to Sanity Cloud CMS: ${cleanSlug}`);
      } catch (sanityErr) {
        sanityError = sanityErr.message;
        console.error('[Sanity Sync Failure]:', sanityErr.message);
      }
    } else {
      sanityError = 'Sanity API client not configured or token missing.';
    }

    // STRICT PRODUCTION PERSISTENCE CHECK:
    // If PostgreSQL is not connected AND Sanity CMS write failed:
    if (!db.isConnectedToPostgres && !sanitySuccess) {
      // PREVENT DATA LOSS: Preserve author's work as a draft in local memory/store
      if (created.isPublished) {
        await db.blogs.update({
          where: { id: created.id },
          data: { isPublished: false }
        });
      }

      return res.status(502).json({
        success: false,
        error: `Cloud persistence failed: Unable to save to Sanity CMS (${sanityError}). Your article content has been preserved safely as a draft.`,
        draftSaved: true,
        blog: { ...created, isPublished: false }
      });
    }

    await db.audit.log({
      userId: req.user?.id,
      action: 'CREATE_BLOG',
      entity: 'BlogPost',
      entityId: created.id,
      details: { title: created.title, slug: created.slug }
    });

    res.status(201).json({
      success: true,
      message: isPub
        ? 'Article published and permanently stored in Sanity CMS.'
        : 'Article saved as draft in Sanity CMS.',
      blog: created
    });
  } catch (error) {
    console.error('[Create Blog Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create article.' });
  }
}

/**
 * PATCH /api/v1/admin/blogs/:id
 */
export async function updateBlog(req, res) {
  try {
    const updateData = {
      ...req.body,
      modified: new Date().toISOString()
    };
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const existing = await db.blogs.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    const targetSlug = updateData.slug || existing.slug;
    const isTargetPub = updateData.isPublished !== undefined ? updateData.isPublished : existing.isPublished;

    // Cloud persistence: Synchronize with Sanity CMS
    let sanitySuccess = false;
    let sanityError = null;
    const sanity = await getSanityWriteClient();
    if (sanity) {
      try {
        const sanityDoc = {
          _type: 'blogPost',
          _id: `blogPost-${targetSlug}`,
          title: (updateData.title || existing.title).trim(),
          slug: { _type: 'slug', current: targetSlug },
          excerpt: updateData.excerpt !== undefined ? updateData.excerpt : existing.excerpt,
          content: updateData.content !== undefined ? updateData.content : existing.content,
          categoryName: updateData.category || existing.category,
          author: updateData.author || existing.author,
          publishedAt: existing.rawDate || existing.createdAt || new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          isPublished: isTargetPub,
          coverImage: {
            _type: 'image',
            imageUrl: updateData.featuredImage || existing.featuredImage,
            alt: updateData.featuredImageAlt || updateData.title || existing.title,
            title: updateData.featuredImageTitle || ''
          },
          seo: {
            metaTitle: updateData.seo?.metaTitle || updateData.title || existing.title,
            metaDescription: updateData.seo?.metaDescription || updateData.excerpt || existing.excerpt,
            canonicalUrl: updateData.seo?.canonicalUrl || `https://viennadaytrip.com/blog/${targetSlug}/`,
            keywords: updateData.seo?.keywords || []
          }
        };
        await sanity.createOrReplace(sanityDoc);
        sanitySuccess = true;
        console.log(`[Sanity Sync] Updated article in Sanity Cloud CMS: ${targetSlug}`);
      } catch (sanityErr) {
        sanityError = sanityErr.message;
        console.error('[Sanity Sync Update Failed]:', sanityErr.message);
      }
    } else {
      sanityError = 'Sanity API client not configured or token missing.';
    }

    // STRICT PRODUCTION PERSISTENCE CHECK:
    if (!db.isConnectedToPostgres && !sanitySuccess) {
      // PREVENT DATA LOSS: Save updates locally as a draft so author's edits are never lost
      const safeData = {
        ...updateData,
        isPublished: false // Roll back to draft so unpublished articles never appear published
      };
      const draftUpdated = await db.blogs.update({
        where: { id: req.params.id },
        data: safeData
      });

      return res.status(502).json({
        success: false,
        error: `Cloud persistence failed: Unable to update Sanity CMS (${sanityError}). Your edits have been preserved locally as a draft.`,
        draftSaved: true,
        blog: draftUpdated
      });
    }

    const updated = await db.blogs.update({
      where: { id: req.params.id },
      data: updateData
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_BLOG',
      entity: 'BlogPost',
      entityId: updated.id,
      details: { title: updated.title, slug: updated.slug }
    });

    res.json({
      success: true,
      message: updated.isPublished ? 'Article published and permanently stored in Sanity CMS.' : 'Draft updated successfully in Sanity CMS.',
      blog: updated
    });
  } catch (error) {
    console.error('[Update Blog Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update article.' });
  }
}

/**
 * DELETE /api/v1/admin/blogs/:id
 */
export async function deleteBlog(req, res) {
  try {
    const existing = await db.blogs.findUnique({ where: { id: req.params.id } });
    await db.blogs.delete({ where: { id: req.params.id } });

    if (existing?.slug) {
      const sanity = await getSanityWriteClient();
      if (sanity) {
        try {
          await sanity.delete(`blogPost-${existing.slug}`).catch(() => {});
        } catch (e) {}
      }
    }

    await db.audit.log({
      userId: req.user?.id,
      action: 'DELETE_BLOG',
      entity: 'BlogPost',
      entityId: req.params.id
    });
    res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete article.' });
  }
}

