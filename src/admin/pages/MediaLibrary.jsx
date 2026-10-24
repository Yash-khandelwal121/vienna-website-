import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Folder
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function MediaLibrary() {
  const { token } = useAdminAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [token]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category === 'ALL' ? 'general' : category);

    try {
      setUploading(true);
      setMessage('');
      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Asset "${file.name}" uploaded successfully.`);
        fetchMedia();
      } else {
        setMessage(data.error || 'Upload failed.');
      }
    } catch (err) {
      setMessage('Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (asset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media asset?')) return;
    try {
      await fetch(`/api/v1/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMedia();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMedia = media.filter((m) => {
    const matchesCat = category === 'ALL' || m.category === category;
    const matchesSearch =
      !search ||
      m.originalName?.toLowerCase().includes(search.toLowerCase()) ||
      m.filename?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AdminLayout title="Media Library">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Digital Media Asset Manager</h1>
          <p className="vdt-page-sub">
            Upload, optimize, and organize luxury photography, vehicle renders, and editorial images.
          </p>
        </div>
        <div className="vdt-header-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp, image/svg+xml, image/avif"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="vdt-btn-primary"
          >
            <UploadCloud size={16} />
            <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
          </button>
          <button type="button" onClick={fetchMedia} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      {/* Filter and Search */}
      <div className="vdt-card vdt-filter-card">
        <div className="vdt-search-box">
          <Search size={16} className="vdt-search-icon" />
          <input
            type="text"
            placeholder="Search by original filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="vdt-status-pills">
          {['ALL', 'general', 'fleet', 'tours', 'blogs'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`vdt-pill-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="vdt-media-grid" style={{ marginTop: '1.5rem' }}>
        {filteredMedia.length > 0 ? (
          filteredMedia.map((asset) => (
            <div key={asset.id} className="vdt-card vdt-media-card">
              <div className="vdt-media-preview-box">
                <img src={asset.url} alt={asset.altText || asset.originalName} />
              </div>
              <div className="vdt-media-info">
                <div className="vdt-media-name" title={asset.originalName}>
                  {asset.originalName}
                </div>
                <div className="vdt-media-meta">
                  <span>{(asset.size / 1024).toFixed(0)} KB</span>
                  <span>•</span>
                  <span>{asset.mimeType?.split('/')[1]?.toUpperCase()}</span>
                </div>
                <div className="vdt-media-actions">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset)}
                    className="vdt-action-btn"
                    title="Copy Image URL"
                  >
                    {copiedId === asset.id ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copiedId === asset.id ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(asset.id)}
                    className="vdt-action-btn-danger"
                    title="Delete Asset"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="vdt-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 1rem' }}>
            <Folder size={36} color="#C69C50" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: '#707070', margin: 0 }}>
              {loading ? 'Loading media assets...' : 'No media assets found in this category. Click Upload Image to add your first asset.'}
            </p>
          </div>
        )}
      </div>

      <style>{`
        .vdt-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.25rem;
        }

        .vdt-media-card {
          padding: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .vdt-media-preview-box {
          height: 140px;
          background: #FAF8F4;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-bottom: 1px solid #F0EAE1;
          padding: 0.5rem;
        }

        .vdt-media-preview-box img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .vdt-media-info {
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .vdt-media-name {
          font-size: 0.82rem;
          font-weight: 600;
          color: #17191C;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vdt-media-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #8C877E;
        }

        .vdt-media-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 0.25rem;
        }
      `}</style>
    </AdminLayout>
  );
}
