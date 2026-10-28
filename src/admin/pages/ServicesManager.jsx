import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ServicesManager() {
  const { token } = useAdminAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [modalError, setModalError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
    features: '',
    ctaLabel: 'Book Service',
    ctaUrl: '',
    image: '/images/vienna-palace-backdrop.webp',
    displayOrder: 1,
    isPublished: true
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.services || []);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to load services.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error connecting to services API.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      slug: '',
      shortDesc: '',
      fullDesc: '',
      features: '',
      ctaLabel: 'Book Service',
      ctaUrl: '',
      image: '/images/vienna-palace-backdrop.webp',
      displayOrder: services.length + 1,
      isPublished: true
    });
    setSelectedService(null);
    setModalError(null);
    setIsEditing(true);
  };

  const handleOpenEdit = (s) => {
    let featuresText = '';
    if (Array.isArray(s.features)) {
      featuresText = s.features.join('\n');
    } else if (typeof s.features === 'string') {
      try {
        const parsed = JSON.parse(s.features);
        featuresText = Array.isArray(parsed) ? parsed.join('\n') : s.features;
      } catch {
        featuresText = s.features;
      }
    }

    setForm({
      name: s.name || '',
      slug: s.slug || '',
      shortDesc: s.shortDesc || '',
      fullDesc: s.fullDesc || '',
      features: featuresText,
      ctaLabel: s.ctaLabel || 'Book Service',
      ctaUrl: s.ctaUrl || '',
      image: s.image || '/images/vienna-palace-backdrop.webp',
      displayOrder: Number(s.displayOrder) || 1,
      isPublished: s.isPublished !== false
    });
    setSelectedService(s);
    setModalError(null);
    setIsEditing(true);
  };

  const handleNameChange = (val) => {
    // When adding a new service, auto-generate the slug if the user hasn't explicitly customized it
    if (!selectedService) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm((prev) => ({
        ...prev,
        name: val,
        slug: generatedSlug,
        ctaUrl: generatedSlug ? `/${generatedSlug}/` : ''
      }));
    } else {
      setForm((prev) => ({ ...prev, name: val }));
    }
  };

  const handleTogglePublished = async (s) => {
    try {
      const newStatus = !s.isPublished;
      const res = await fetch(`/api/v1/admin/services/${s.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `Service "${s.name}" is now ${newStatus ? 'Active' : 'Draft'}.`
        });
        setServices((prev) =>
          prev.map((item) => (item.id === s.id ? { ...item, isPublished: newStatus } : item))
        );
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to toggle status.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to update service status.' });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Validation
    if (!form.name.trim()) {
      setModalError('Service Name is required.');
      return;
    }
    if (!form.shortDesc.trim()) {
      setModalError('Short Description is required.');
      return;
    }

    try {
      setSaving(true);
      const url = selectedService
        ? `/api/v1/admin/services/${selectedService.id}`
        : '/api/v1/admin/services';
      const method = selectedService ? 'PATCH' : 'POST';

      const featuresArray = form.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDesc: form.shortDesc.trim(),
        fullDesc: form.fullDesc.trim(),
        features: featuresArray,
        image: form.image.trim() || '/images/vienna-palace-backdrop.webp',
        ctaLabel: form.ctaLabel.trim() || 'Book Service',
        ctaUrl: form.ctaUrl.trim() || `/${form.slug.trim()}/`,
        displayOrder: Number(form.displayOrder) || 1,
        isPublished: Boolean(form.isPublished)
      };

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
        setStatusMessage({
          type: 'success',
          text: `Service "${payload.name}" saved successfully to persistent database.`
        });
        setIsEditing(false);
        fetchServices();
      } else {
        setModalError(data.error || 'Failed to save service.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Server communication error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${s.name}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/services/${s.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `Service "${s.name}" deleted successfully.` });
        fetchServices();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to delete service.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error deleting service.' });
    }
  };

  return (
    <AdminLayout title="Services Management">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Executive Chauffeur Services</h1>
          <p className="vdt-page-sub">
            Manage Airport Transfers, Hourly Chauffeur, Private Day Trips and Secure Transportation.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Add Service</span>
          </button>
          <button
            type="button"
            onClick={fetchServices}
            className="vdt-btn-secondary"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={statusMessage.type === 'error' ? 'vdt-banner-error' : 'vdt-banner-info'}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {statusMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="vdt-fleet-grid">
        {services.map((s) => (
          <div key={s.id} className="vdt-card vdt-fleet-card">
            <div className="vdt-fleet-img-box" style={{ background: '#FAF8F4' }}>
              <img
                src={s.image}
                alt={s.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div className="vdt-fleet-content">
              <div className="vdt-fleet-title-row">
                <h3 className="vdt-fleet-name">{s.name}</h3>
                <span className="vdt-fleet-order">Order #{s.displayOrder}</span>
              </div>
              <p className="vdt-fleet-desc">{s.shortDesc}</p>

              {/* Service Features Preview */}
              {Array.isArray(s.features) && s.features.length > 0 && (
                <div style={{ margin: '0.65rem 0', fontSize: '0.78rem', color: '#666' }}>
                  <strong>Key Highlights:</strong>
                  <ul style={{ margin: '0.35rem 0 0 1rem', padding: 0 }}>
                    {s.features.slice(0, 3).map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                    {s.features.length > 3 && (
                      <li style={{ fontStyle: 'italic' }}>+{s.features.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="vdt-fleet-actions-row">
                <button
                  type="button"
                  onClick={() => handleTogglePublished(s)}
                  title="Click to toggle publication status"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <span
                    className={`vdt-badge ${
                      s.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'
                    }`}
                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {s.isPublished ? (
                      <>
                        <Eye size={12} /> Active
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} /> Draft
                      </>
                    )}
                  </span>
                </button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(s)}
                    className="vdt-action-btn"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(s)}
                    className="vdt-action-btn-danger"
                    title="Delete service"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="vdt-modal-overlay" onClick={() => setIsEditing(false)}>
          <div
            className="vdt-modal-card"
            style={{ maxWidth: '680px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">SERVICE CONFIGURATION</span>
                <h3 className="vdt-modal-title">
                  {selectedService ? `Edit ${selectedService.name}` : 'New Executive Service'}
                </h3>
              </div>
              <button
                type="button"
                className="vdt-modal-close"
                onClick={() => setIsEditing(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              {modalError && (
                <div
                  className="vdt-banner-error"
                  style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <AlertCircle size={16} />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="vdt-form-grid">
                <div className="vdt-field-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Executive VIP Protocol"
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>URL Slug / Route Path *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="e.g. executive-vip-protocol"
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Publication Status</label>
                  <select
                    value={form.isPublished ? 'true' : 'false'}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.value === 'true' })}
                    className="vdt-select"
                  >
                    <option value="true">Active (Published on Website)</option>
                    <option value="false">Draft (Admin Only)</option>
                  </select>
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Cover Image URL</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="e.g. /images/about-vclass-chauffeur.webp or HTTPS URL"
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Short Description (Overview cards & Website pillars) *</label>
                  <textarea
                    rows="3"
                    value={form.shortDesc}
                    onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                    placeholder="Brief 1-2 sentence overview of this chauffeur service..."
                    required
                    className="vdt-textarea"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Key Features / Bullet Points (One per line)</label>
                  <textarea
                    rows="4"
                    value={form.features}
                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                    placeholder="Flight tracking & Meet & Greet&#10;Complimentary Wi-Fi and chilled refreshments&#10;Transparent upfront pricing"
                    className="vdt-textarea"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>CTA Button Label</label>
                  <input
                    type="text"
                    value={form.ctaLabel}
                    onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
                    placeholder="Book Service"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>CTA Target URL</label>
                  <input
                    type="text"
                    value={form.ctaUrl}
                    onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })}
                    placeholder="e.g. /airport-transfer-vienna/ or /contact/"
                    className="vdt-input"
                  />
                </div>
              </div>

              <div className="vdt-modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="vdt-btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="vdt-btn-primary">
                  {saving ? (
                    <>
                      <RefreshCw size={14} className="vdt-spin" />
                      <span>Saving to Database...</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Service</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
