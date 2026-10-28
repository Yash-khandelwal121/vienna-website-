import { db } from '../config/db.js';

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
    const blog = await db.blogs.findUnique({ where: { slug: req.params.slug } });
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

    const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/-+/g, '-');
    const existing = await db.blogs.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'An article with this URL slug already exists.' });
    }

    const created = await db.blogs.create({
      data: {
        slug,
        title: data.title,
        excerpt: data.excerpt || '',
        content: data.content,
        featuredImage: data.featuredImage || '/images/vienna-palace-backdrop.webp',
        featuredImageAlt: data.featuredImageAlt || data.title,
        featuredImageTitle: data.featuredImageTitle || '',
        featuredImageCaption: data.featuredImageCaption || '',
        category: data.category || 'Travel Guides',
        categories: data.categories || [data.category || 'Travel Guides'],
        author: data.author || 'Vienna Day Trip Concierge',
        date: data.date || 'October 2026',
        rawDate: data.rawDate || new Date().toISOString(),
        modified: new Date().toISOString(),
        isPublished: data.isPublished !== false,
        seo: data.seo || { metaTitle: data.title, metaDescription: data.excerpt }
      }
    });

    await db.audit.log({
      userId: req.user?.id,
      action: 'CREATE_BLOG',
      entity: 'BlogPost',
      entityId: created.id,
      details: { title: created.title, slug: created.slug }
    });

    res.status(201).json({ success: true, message: 'Article created successfully.', blog: created });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create article.' });
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
    const updated = await db.blogs.update({
      where: { id: req.params.id },
      data: updateData
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    await db.audit.log({
      userId: req.user?.id,
      action: 'UPDATE_BLOG',
      entity: 'BlogPost',
      entityId: updated.id,
      details: { title: updated.title, slug: updated.slug }
    });

    res.json({ success: true, message: 'Article updated successfully.', blog: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update article.' });
  }
}

/**
 * DELETE /api/v1/admin/blogs/:id
 */
export async function deleteBlog(req, res) {
  try {
    await db.blogs.delete({ where: { id: req.params.id } });
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
