import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Calendar,
  User,
  X,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Globe,
  FileText,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import RichTextEditor from '../components/RichTextEditor';

export default function BlogsManager() {
  const { token } = useAdminAuth();
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal & Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'image' | 'content' | 'seo' | 'publish'
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [manualSlugEdit, setManualSlugEdit] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '/images/vienna-palace-backdrop.webp',
    featuredImageAlt: '',
    featuredImageTitle: '',
    featuredImageCaption: '',
    category: 'Travel Guides',
    author: 'Vienna Day Trip Concierge',
    date: 'October 2026',
    modified: '',
    isPublished: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      schemaJson: ''
    }
  });

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/admin/blogs?page=${page}&limit=${limit}&status=${statusFilter}&category=${categoryFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load articles from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, statusFilter, categoryFilter, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  // Auto-generate slug from title (only for new articles or when unlocked)
  const handleTitleChange = (val) => {
    const updated = { ...form, title: val };
    if (!selectedBlog && !manualSlugEdit) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
      updated.slug = generatedSlug;
    }
    setForm(updated);
  };

  // Open Create Article Modal
  const handleOpenAdd = () => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '<p>Welcome to Vienna Day Trip. Begin crafting your European luxury travel article...</p>',
      featuredImage: '/images/vienna-palace-backdrop.webp',
      featuredImageAlt: '',
      featuredImageTitle: '',
      featuredImageCaption: '',
      category: 'Travel Guides',
      author: 'Vienna Day Trip Concierge',
      date: currentDate,
      modified: '',
      isPublished: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        keywords: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        schemaJson: ''
      }
    });
    setSelectedBlog(null);
    setManualSlugEdit(false);
    setActiveTab('basic');
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  // Open Edit Article Modal
  const handleOpenEdit = (b) => {
    setForm({
      id: b.id,
      title: b.title || '',
      slug: b.slug || '',
      excerpt: b.excerpt || '',
      content: b.content || '',
      featuredImage: b.featuredImage || '/images/vienna-palace-backdrop.webp',
      featuredImageAlt: b.featuredImageAlt || b.title || '',
      featuredImageTitle: b.featuredImageTitle || '',
      featuredImageCaption: b.featuredImageCaption || '',
      category: b.category || 'Travel Guides',
      author: b.author || 'Vienna Day Trip Concierge',
      date: b.date || 'October 2026',
      modified: b.modified || b.updatedAt || '',
      isPublished: b.isPublished !== false,
      seo: {
        metaTitle: b.seo?.title || b.seo?.metaTitle || b.title || '',
        metaDescription: b.seo?.description || b.seo?.metaDescription || b.excerpt || '',
        focusKeyword: b.seo?.focusKeyword || '',
        keywords: Array.isArray(b.seo?.keywords) ? b.seo.keywords.join(', ') : (b.seo?.keywords || ''),
        canonicalUrl: b.seo?.canonical || b.seo?.canonicalUrl || '',
        ogTitle: b.seo?.ogTitle || b.title || '',
        ogDescription: b.seo?.ogDescription || b.excerpt || '',
        ogImage: b.seo?.ogImage || b.featuredImage || '',
        schemaJson: b.seo?.schema ? (typeof b.seo.schema === 'string' ? b.seo.schema : JSON.stringify(b.seo.schema, null, 2)) : ''
      }
    });
    setSelectedBlog(b);
    setManualSlugEdit(true); // Preserve existing URL slug!
    setActiveTab('basic');
    setIsEditing(true);
    setMessage({ type: '', text: '' });
  };

  // Save Article (handles both Draft and Published)
  const handleSave = async (publishStatus = null) => {
    if (!form.title.trim()) {
      alert('Please enter an Article Title.');
      setActiveTab('basic');
      return;
    }
    if (!form.content.trim()) {
      alert('Please enter Article Content.');
      setActiveTab('content');
      return;
    }

    try {
      setSaving(true);
      const isPub = publishStatus !== null ? publishStatus : form.isPublished;

      // Validate JSON-LD if provided
      let parsedSchema = null;
      if (form.seo.schemaJson?.trim()) {
        try {
          parsedSchema = JSON.parse(form.seo.schemaJson);
        } catch {
          alert('Warning: The Schema Markup JSON-LD is not valid JSON. Please correct it in the SEO Settings tab.');
          setActiveTab('seo');
          setSaving(false);
          return;
        }
      }

      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt,
        content: form.content,
        featuredImage: form.featuredImage,
        featuredImageAlt: form.featuredImageAlt,
        featuredImageTitle: form.featuredImageTitle,
        featuredImageCaption: form.featuredImageCaption,
        category: form.category,
        author: form.author,
        date: form.date,
        isPublished: isPub,
        seo: {
          title: form.seo.metaTitle || form.title,
          metaTitle: form.seo.metaTitle || form.title,
          description: form.seo.metaDescription || form.excerpt,
          metaDescription: form.seo.metaDescription || form.excerpt,
          focusKeyword: form.seo.focusKeyword,
          keywords: form.seo.keywords ? form.seo.keywords.split(',').map((k) => k.trim()) : [],
          canonical: form.seo.canonicalUrl || `https://viennadaytrip.com/blog/${form.slug}/`,
          canonicalUrl: form.seo.canonicalUrl || `https://viennadaytrip.com/blog/${form.slug}/`,
          ogTitle: form.seo.ogTitle || form.title,
          ogDescription: form.seo.ogDescription || form.excerpt,
          ogImage: form.seo.ogImage || form.featuredImage,
          schema: parsedSchema
        }
      };

      const url = selectedBlog ? `/api/v1/admin/blogs/${selectedBlog.id}` : '/api/v1/admin/blogs';
      const method = selectedBlog ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: selectedBlog
            ? `Article updated successfully (${isPub ? 'Published' : 'Saved as Draft'}).`
            : `New article created successfully (${isPub ? 'Published' : 'Saved as Draft'}).`
        });
        setIsEditing(false);
        fetchBlogs();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save article.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving article.' });
    } finally {
      setSaving(false);
    }
  };

  // Upload Featured Image directly to Sanity CDN with persistent cloud storage
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'blog_featured');
      formData.append('altText', form.featuredImageAlt || form.title || file.name);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        setForm({
          ...form,
          featuredImage: data.asset.url,
          featuredImageAlt: form.featuredImageAlt || form.title,
          seo: {
            ...form.seo,
            ogImage: form.seo.ogImage || data.asset.url
          }
        });
        setMessage({ type: 'success', text: 'Image uploaded and stored persistently.' });
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      alert('Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Toggle publish status from table
  const handleTogglePublish = async (b) => {
    try {
      await fetch(`/api/v1/admin/blogs/${b.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !b.isPublished })
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete article
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) return;
    try {
      await fetch(`/api/v1/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (err) {
      console.error(err);
    }
  };

  // SERP Preview Values
  const serpTitle = form.seo.metaTitle || form.title || 'Article Title | Vienna Day Trip';
  const serpDesc = form.seo.metaDescription || form.excerpt || 'Read this exclusive luxury travel story from Vienna Day Trip concierge...';
  const serpSlug = form.slug || 'article-slug';

  // Word count & read time calculation
  const wordCount = useMemo(() => {
    const text = form.content.replace(/<[^>]+>/g, ' ').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [form.content]);

  const estimatedReadTime = useMemo(() => {
    return Math.max(1, Math.ceil(wordCount / 200)) + ' min read';
  }, [wordCount]);

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title="Blog CMS">
      {/* Top Header */}
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Travel Journal CMS ({total} Articles)</h1>
          <p className="vdt-page-sub">
            Growthora-powered luxury editorial CMS: author articles, manage persistent media, optimize SEO, and control publishing.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Create Article</span>
          </button>
          <button type="button" onClick={fetchBlogs} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div
          className={message.type === 'error' ? 'vdt-banner-error' : 'vdt-banner-info'}
          style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}
        >
          {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage({ type: '', text: '' })}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="vdt-card vdt-filter-card">
        <form onSubmit={handleSearchSubmit} className="vdt-search-form">
          <div className="vdt-search-box">
            <Search size={16} className="vdt-search-icon" />
            <input
              type="text"
              placeholder="Search by article title, slug, or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="vdt-btn-primary">Search</button>
        </form>

        <div className="vdt-status-pills">
          <span style={{ fontSize: '0.76rem', color: '#8C877E', alignSelf: 'center', fontWeight: 600 }}>STATUS:</span>
          {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
            <button
              key={st}
              type="button"
              className={`vdt-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => { setStatusFilter(st); setPage(1); }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table */}
      <div className="vdt-card" style={{ marginTop: '1.25rem' }}>
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Featured Image</th>
                <th>Title & Slug</th>
                <th>Category</th>
                <th>Author</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length > 0 ? (
                blogs.map((b) => (
                  <tr key={b.id}>
                    <td style={{ width: '80px' }}>
                      <div className="vdt-blog-thumb-frame">
                        <img src={b.featuredImage} alt={b.title} />
                      </div>
                    </td>
                    <td style={{ maxWidth: '380px' }}>
                      <div className="vdt-blog-row-title">{b.title}</div>
                      <div className="vdt-blog-row-slug">/blog/{b.slug}/</div>
                    </td>
                    <td>
                      <span className="vdt-blog-cat-badge">{b.category}</span>
                    </td>
                    <td>
                      <div className="vdt-cell-name" style={{ fontSize: '0.82rem' }}>{b.author}</div>
                      <div className="vdt-cell-sub">{b.date}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(b)}
                        className={`vdt-badge ${b.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle Draft / Published status"
                      >
                        {b.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`/blog/${b.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="vdt-action-btn"
                          title="Preview public page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="vdt-action-btn"
                          title="Edit article"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="vdt-action-btn-danger"
                          title="Delete article"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="vdt-empty-state">
                    {loading ? 'Loading travel journal articles...' : 'No articles found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="vdt-pagination-bar">
          <span className="vdt-pagination-info">
            Showing Page {page} of {totalPages} ({total} Total Articles)
          </span>
          <div className="vdt-pagination-btns">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="vdt-btn-secondary"
              style={{ padding: '0.35rem 0.75rem' }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="vdt-btn-secondary"
              style={{ padding: '0.35rem 0.75rem' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          UPGRADED PROFESSIONAL BLOG EDITOR MODAL (Tabs: Basic, Image, Content, SEO, Publish)
          ========================================================================= */}
      {isEditing && (
        <div className="vdt-modal-overlay" onClick={() => setIsEditing(false)}>
          <div
            className="vdt-modal-card"
            style={{ maxWidth: '1100px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="vdt-modal-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #E6D8C3' }}>
              <div>
                <span className="vdt-modal-eyebrow">VIENNA DAY TRIP CMS STUDIO</span>
                <h3 className="vdt-modal-title">
                  {selectedBlog ? `Edit: ${form.title || 'Untitled Article'}` : 'Create Luxury Travel Article'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`vdt-badge ${form.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}>
                  {form.isPublished ? 'STATUS: PUBLISHED' : 'STATUS: DRAFT'}
                </span>
                <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: '#FAF8F4',
                borderBottom: '1px solid #E6D8C3',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'basic', label: '1. Basic Information', icon: FileText },
                { id: 'image', label: '2. Featured Image', icon: ImageIcon },
                { id: 'content', label: '3. Rich Content Editor', icon: BookOpen },
                { id: 'seo', label: '4. SEO Settings & SERP', icon: Globe },
                { id: 'publish', label: '5. Publishing Workflow', icon: Sliders },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.55rem 1rem',
                      borderRadius: '8px',
                      border: active ? '1px solid #C69C50' : '1px solid transparent',
                      backgroundColor: active ? '#FFFFFF' : 'transparent',
                      color: active ? '#C69C50' : '#62666D',
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? '0 2px 8px rgba(198, 156, 80, 0.15)' : 'none',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents Scroll Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="vdt-field-group">
                    <label style={{ fontWeight: 700 }}>Blog Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      placeholder="e.g. Wachau Valley Wine Tasting & Danube Tour from Vienna"
                      className="vdt-input"
                      style={{ fontSize: '1.05rem', fontWeight: 600 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="vdt-field-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 700 }}>URL Slug (Permanent Link) *</label>
                        <button
                          type="button"
                          onClick={() => setManualSlugEdit(!manualSlugEdit)}
                          style={{ background: 'none', border: 'none', color: '#C69C50', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {manualSlugEdit ? 'Auto-Lock Slug' : 'Edit Manually'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', color: '#8E929B', fontSize: '0.82rem' }}>/blog/</span>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                          disabled={!manualSlugEdit && selectedBlog}
                          required
                          placeholder="wachau-valley-wine-tasting"
                          className="vdt-input"
                          style={{ paddingLeft: '55px' }}
                        />
                      </div>
                    </div>

                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Category</label>
                      <input
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Travel Guides, Day Trips, Concierge Insights"
                        className="vdt-input"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Author</label>
                      <input
                        type="text"
                        value={form.author}
                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                        placeholder="Vienna Day Trip Concierge"
                        className="vdt-input"
                      />
                    </div>
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Publish Date</label>
                      <input
                        type="text"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        placeholder="e.g. October 2026 or October 28, 2026"
                        className="vdt-input"
                      />
                    </div>
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Last Modified Date</label>
                      <input
                        type="text"
                        value={form.modified ? new Date(form.modified).toLocaleString() : 'Will update upon save'}
                        disabled
                        className="vdt-input"
                        style={{ backgroundColor: '#FAF8F4', color: '#8E929B' }}
                      />
                    </div>
                  </div>

                  <div className="vdt-field-group">
                    <label style={{ fontWeight: 700 }}>Summary / Excerpt (Lead Paragraph)</label>
                    <textarea
                      rows="3"
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                      placeholder="Brief 2-3 sentence overview of this article..."
                      className="vdt-textarea"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURED IMAGE MANAGEMENT */}
              {activeTab === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ border: '2px dashed #E6D8C3', borderRadius: '16px', padding: '2rem', textAlign: 'center', backgroundColor: '#FAF8F4' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid #E6D8C3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#C69C50' }}>
                      <Upload size={22} />
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.05rem', fontWeight: 700, color: '#17191C' }}>
                      Upload High-Resolution Featured Image
                    </h4>
                    <p style={{ margin: '0 0 1.25rem', color: '#62666D', fontSize: '0.88rem' }}>
                      Persisted to Sanity Cloud CDN. Compatible with embedded text without aggressive cropping.
                    </p>
                    <label
                      className="vdt-btn-primary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.65rem 1.4rem' }}
                    >
                      <Upload size={16} />
                      <span>{uploadingImage ? 'Uploading to Sanity CDN...' : 'Select File From Computer'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFeaturedImageUpload}
                        disabled={uploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>

                  {/* Image Preview & URL Fallback */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) 1fr', gap: '1.75rem', alignItems: 'start' }}>
                    {/* Preview Box */}
                    <div>
                      <label style={{ fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>Image Preview</label>
                      <div
                        style={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid #E6D8C3',
                          backgroundColor: '#0E1013',
                          minHeight: '220px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {form.featuredImage ? (
                          <img
                            src={form.featuredImage}
                            alt={form.featuredImageAlt || form.title}
                            style={{ width: '100%', maxHeight: '280px', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ color: '#8E929B', fontSize: '0.88rem' }}>No image selected</span>
                        )}
                      </div>
                      {form.featuredImage && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.65rem' }}>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, featuredImage: '' })}
                            className="vdt-btn-secondary"
                            style={{ color: '#E53E3E', fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Metadata Inputs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>Featured Image URL (Direct / Fallback)</label>
                        <input
                          type="text"
                          value={form.featuredImage}
                          onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                          placeholder="https://cdn.sanity.io/... or /blog-images/image.png"
                          className="vdt-input"
                        />
                      </div>

                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>Image ALT Text (Accessibility & Google Image Search)</label>
                        <input
                          type="text"
                          value={form.featuredImageAlt}
                          onChange={(e) => setForm({ ...form, featuredImageAlt: e.target.value })}
                          placeholder="Descriptive explanation of what is shown in the image"
                          className="vdt-input"
                        />
                      </div>

                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>Image Title (Hover tooltip)</label>
                        <input
                          type="text"
                          value={form.featuredImageTitle}
                          onChange={(e) => setForm({ ...form, featuredImageTitle: e.target.value })}
                          placeholder="e.g. Hallstatt Lake Panorama View"
                          className="vdt-input"
                        />
                      </div>

                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>Optional Image Caption (Displayed below photo)</label>
                        <input
                          type="text"
                          value={form.featuredImageCaption}
                          onChange={(e) => setForm({ ...form, featuredImageCaption: e.target.value })}
                          placeholder="e.g. Photo courtesy of Vienna Day Trip Chauffeurs"
                          className="vdt-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: RICH CONTENT EDITOR */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontWeight: 700 }}>Article Content *</label>
                    <div style={{ display: 'flex', gap: '1rem', color: '#62666D', fontSize: '0.82rem' }}>
                      <span>Words: <strong>{wordCount}</strong></span>
                      <span>Read Time: <strong>{estimatedReadTime}</strong></span>
                    </div>
                  </div>

                  <RichTextEditor
                    value={form.content}
                    onChange={(val) => setForm({ ...form, content: val })}
                    token={token}
                  />
                </div>
              )}

              {/* TAB 4: COMPLETE SEO SETTINGS */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Google Search Result Preview Card */}
                  <div style={{ backgroundColor: '#FAF8F4', border: '1px solid #E6D8C3', borderRadius: '14px', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                      <Globe size={16} style={{ color: '#C69C50' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#C69C50', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Google Search Result Preview (SERP)
                      </span>
                    </div>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '10px', border: '1px solid #E6D8C3' }}>
                      <div style={{ fontSize: '0.82rem', color: '#202124', marginBottom: '4px' }}>
                        https://viennadaytrip.com &gt; blog &gt; {serpSlug}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '6px' }}>
                        {serpTitle}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5 }}>
                        {serpDesc.length > 160 ? serpDesc.substring(0, 160) + '...' : serpDesc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {/* SEO Title */}
                    <div className="vdt-field-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontWeight: 700 }}>SEO Meta Title</label>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: (form.seo.metaTitle?.length || 0) > 60 ? '#E53E3E' : '#C69C50' }}>
                          {form.seo.metaTitle?.length || 0} / 60 chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={form.seo.metaTitle}
                        onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaTitle: e.target.value } })}
                        placeholder={form.title || 'Page title for search engines'}
                        className="vdt-input"
                      />
                    </div>

                    {/* Focus Keyword */}
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Focus Keyword</label>
                      <input
                        type="text"
                        value={form.seo.focusKeyword}
                        onChange={(e) => setForm({ ...form, seo: { ...form.seo, focusKeyword: e.target.value } })}
                        placeholder="e.g. Wachau Valley day trip from Vienna"
                        className="vdt-input"
                      />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div className="vdt-field-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontWeight: 700 }}>Meta Description</label>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: (form.seo.metaDescription?.length || 0) > 160 ? '#E53E3E' : '#C69C50' }}>
                        {form.seo.metaDescription?.length || 0} / 160 chars
                      </span>
                    </div>
                    <textarea
                      rows="2"
                      value={form.seo.metaDescription}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, metaDescription: e.target.value } })}
                      placeholder={form.excerpt || 'Engaging 140-160 character description for Google search snippets...'}
                      className="vdt-textarea"
                    />
                  </div>

                  {/* Additional Keywords & Canonical URL */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Additional Keywords (Comma-separated)</label>
                      <input
                        type="text"
                        value={form.seo.keywords}
                        onChange={(e) => setForm({ ...form, seo: { ...form.seo, keywords: e.target.value } })}
                        placeholder="Vienna Chauffeur, Wachau Wine Tour, Melk Abbey"
                        className="vdt-input"
                      />
                    </div>
                    <div className="vdt-field-group">
                      <label style={{ fontWeight: 700 }}>Canonical URL (Defaults to article link)</label>
                      <input
                        type="text"
                        value={form.seo.canonicalUrl}
                        onChange={(e) => setForm({ ...form, seo: { ...form.seo, canonicalUrl: e.target.value } })}
                        placeholder={`https://viennadaytrip.com/blog/${form.slug}/`}
                        className="vdt-input"
                      />
                    </div>
                  </div>

                  {/* Open Graph Tags */}
                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 1rem', fontSize: '0.98rem', fontWeight: 700, color: '#17191C' }}>
                      Social Media Sharing (Open Graph)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>OG Title (Facebook, LinkedIn, X)</label>
                        <input
                          type="text"
                          value={form.seo.ogTitle}
                          onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogTitle: e.target.value } })}
                          placeholder={form.title}
                          className="vdt-input"
                        />
                      </div>
                      <div className="vdt-field-group">
                        <label style={{ fontWeight: 700 }}>OG Image URL</label>
                        <input
                          type="text"
                          value={form.seo.ogImage}
                          onChange={(e) => setForm({ ...form, seo: { ...form.seo, ogImage: e.target.value } })}
                          placeholder={form.featuredImage}
                          className="vdt-input"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Schema Markup (JSON-LD) */}
                  <div className="vdt-field-group">
                    <label style={{ fontWeight: 700 }}>Custom JSON-LD Schema Markup (Structured Data)</label>
                    <textarea
                      rows="4"
                      value={form.seo.schemaJson}
                      onChange={(e) => setForm({ ...form, seo: { ...form.seo, schemaJson: e.target.value } })}
                      placeholder='{ "@context": "https://schema.org", "@type": "BlogPosting", ... }'
                      className="vdt-textarea"
                      style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                    />
                    <small style={{ color: '#8E929B', marginTop: '4px', display: 'block' }}>
                      Leave blank to automatically use standard Vienna Day Trip BlogPosting schema.
                    </small>
                  </div>
                </div>
              )}

              {/* TAB 5: PUBLISHING WORKFLOW */}
              {activeTab === 'publish' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ backgroundColor: '#FAF8F4', borderRadius: '14px', border: '1px solid #E6D8C3', padding: '1.75rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#17191C' }}>
                      Publishing Status & Visibility
                    </h4>
                    <p style={{ margin: '0 0 1.5rem', color: '#62666D', fontSize: '0.9rem' }}>
                      Draft articles are hidden from the public blog listing and search engines.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isPublished: true })}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '10px',
                          border: form.isPublished ? '2px solid #C69C50' : '1px solid #E6D8C3',
                          backgroundColor: form.isPublished ? 'rgba(198, 156, 80, 0.1)' : '#FFFFFF',
                          color: form.isPublished ? '#C69C50' : '#62666D',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Publish Publicly
                      </button>

                      <button
                        type="button"
                        onClick={() => setForm({ ...form, isPublished: false })}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '10px',
                          border: !form.isPublished ? '2px solid #C69C50' : '1px solid #E6D8C3',
                          backgroundColor: !form.isPublished ? 'rgba(198, 156, 80, 0.1)' : '#FFFFFF',
                          color: !form.isPublished ? '#C69C50' : '#62666D',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Keep as Draft
                      </button>
                    </div>

                    {/* Preview Button */}
                    {form.slug && (
                      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #E6D8C3' }}>
                        <a
                          href={`/blog/${form.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="vdt-btn-secondary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                        >
                          <Eye size={15} />
                          <span>Preview Public Article Page</span>
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.75rem',
                borderTop: '1px solid #E6D8C3',
                backgroundColor: '#FAF8F4',
              }}
            >
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="vdt-btn-secondary"
              >
                Cancel
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="vdt-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={14} />
                  <span>{saving ? 'Saving...' : 'Save as Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="vdt-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={14} />
                  <span>{saving ? 'Publishing...' : selectedBlog ? 'Update & Publish' : 'Publish Article'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
