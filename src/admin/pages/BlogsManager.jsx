import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

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

  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '/images/vienna-palace-backdrop.webp',
    category: 'Travel Guides',
    author: 'Vienna Day Trip Concierge',
    date: 'October 2026',
    isPublished: true
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

  const handleOpenAdd = () => {
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '<p>Write your luxury travel insights here...</p>',
      featuredImage: '/images/vienna-palace-backdrop.webp',
      category: 'Travel Guides',
      author: 'Vienna Day Trip Concierge',
      date: 'October 2026',
      isPublished: true
    });
    setSelectedBlog(null);
    setIsEditing(true);
    setMessage('');
  };

  const handleOpenEdit = (b) => {
    setForm({ ...b });
    setSelectedBlog(b);
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = selectedBlog ? `/api/v1/admin/blogs/${selectedBlog.id}` : '/api/v1/admin/blogs';
      const method = selectedBlog ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(selectedBlog ? 'Article updated successfully.' : 'New article created and published.');
        setIsEditing(false);
        fetchBlogs();
      } else {
        setMessage(data.error || 'Failed to save article.');
      }
    } catch (err) {
      setMessage('Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
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

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <AdminLayout title="Blog CMS">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Travel Journal CMS ({total} Articles)</h1>
          <p className="vdt-page-sub">
            Manage all 129 migrated Vienna and Austrian travel guides, publish new articles, and edit SEO metadata.
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

      {message && <div className="vdt-banner-info">{message}</div>}

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

      {/* Blogs Table */}
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
                        title="Click to toggle status"
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

      {/* Edit / Create Article Modal */}
      {isEditing && (
        <div className="vdt-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="vdt-modal-card vdt-modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">ARTICLE EDITOR</span>
                <h3 className="vdt-modal-title">{selectedBlog ? 'Edit Article' : 'Create New Article'}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              <div className="vdt-form-grid">
                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Article Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    placeholder="e.g. Hallstatt Day Trip from Vienna — Complete 2026 Guide"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>URL Slug (Permanent link) *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    placeholder="hallstatt-day-trip-guide"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Day Trips, Airport Transfers, Guides"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Featured Image URL *</label>
                  <input
                    type="text"
                    value={form.featuredImage}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                    required
                    placeholder="/blog-images/feat-hallstatt.png"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Vienna Day Trip Concierge"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Excerpt / Summary (Used in search & meta descriptions)</label>
                  <textarea
                    rows="2"
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Brief 2-3 sentence overview..."
                    className="vdt-textarea"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Article Content (HTML / Rich Format) *</label>
                  <textarea
                    rows="10"
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    required
                    placeholder="Full article body content..."
                    className="vdt-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div className="vdt-modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="vdt-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="vdt-btn-primary">
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .vdt-blog-thumb-frame {
          width: 60px;
          height: 42px;
          border-radius: 4px;
          overflow: hidden;
          background: #EAE6DF;
        }

        .vdt-blog-thumb-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vdt-blog-row-title {
          font-weight: 600;
          color: #17191C;
          line-height: 1.35;
        }

        .vdt-blog-row-slug {
          font-family: monospace;
          font-size: 0.74rem;
          color: #8C877E;
        }

        .vdt-blog-cat-badge {
          display: inline-block;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: 4px;
          background: #FAF8F4;
          border: 1px solid #E6D8C3;
          color: #C69C50;
          font-weight: 600;
        }

        .vdt-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.25rem;
          margin-top: 1rem;
          border-top: 1px solid #F0EAE1;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .vdt-pagination-info {
          font-size: 0.82rem;
          color: #707070;
        }

        .vdt-pagination-btns {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .vdt-modal-xl {
          max-width: 860px;
        }
      `}</style>
    </AdminLayout>
  );
}
