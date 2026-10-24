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
  Save
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
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDesc: '',
    fullDesc: '',
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
      }
    } catch (err) {
      console.error(err);
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
      ctaLabel: 'Book Service',
      ctaUrl: '',
      image: '/images/vienna-palace-backdrop.webp',
      displayOrder: services.length + 1,
      isPublished: true
    });
    setSelectedService(null);
    setIsEditing(true);
    setMessage('');
  };

  const handleOpenEdit = (s) => {
    setForm({ ...s });
    setSelectedService(s);
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = selectedService ? `/api/v1/admin/services/${selectedService.id}` : '/api/v1/admin/services';
      const method = selectedService ? 'PATCH' : 'POST';

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
        setMessage('Service saved successfully.');
        setIsEditing(false);
        fetchServices();
      } else {
        setMessage(data.error || 'Failed to save service.');
      }
    } catch (err) {
      setMessage('Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await fetch(`/api/v1/admin/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchServices();
    } catch (err) {
      console.error(err);
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
          <button type="button" onClick={fetchServices} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-fleet-grid">
        {services.map((s) => (
          <div key={s.id} className="vdt-card vdt-fleet-card">
            <div className="vdt-fleet-img-box" style={{ background: '#FAF8F4' }}>
              <img src={s.image} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="vdt-fleet-content">
              <div className="vdt-fleet-title-row">
                <h3 className="vdt-fleet-name">{s.name}</h3>
                <span className="vdt-fleet-order">Order #{s.displayOrder}</span>
              </div>
              <p className="vdt-fleet-desc">{s.shortDesc}</p>
              <div className="vdt-fleet-actions-row">
                <span className={`vdt-badge ${s.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}>
                  {s.isPublished ? 'Active' : 'Draft'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => handleOpenEdit(s)} className="vdt-action-btn">
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(s.id)} className="vdt-action-btn-danger">
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
          <div className="vdt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">SERVICE CONFIGURATION</span>
                <h3 className="vdt-modal-title">{selectedService ? `Edit ${selectedService.name}` : 'New Service'}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              <div className="vdt-form-grid">
                <div className="vdt-field-group">
                  <label>Service Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Slug / Route Path</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Short Description (Homepage cards)</label>
                  <textarea
                    rows="3"
                    value={form.shortDesc}
                    onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                    required
                    className="vdt-textarea"
                  />
                </div>
              </div>

              <div className="vdt-modal-actions" style={{ marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="vdt-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="vdt-btn-primary">
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
