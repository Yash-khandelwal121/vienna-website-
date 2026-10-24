import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Clock,
  Euro,
  RefreshCw,
  X,
  Save,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function DayTripsManager() {
  const { token } = useAdminAuth();
  const [dayTrips, setDayTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    title: '',
    eyebrow: 'PRIVATE LUXURY CHAUFFEUR',
    shortDesc: '',
    fullDesc: '',
    duration: '11-12 Hours',
    image: '',
    price: 'From €650',
    isPublished: true,
    displayOrder: 1
  });

  const fetchDayTrips = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/day-trips', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDayTrips(data.dayTrips || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayTrips();
  }, [token]);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      slug: '',
      title: '',
      eyebrow: 'PRIVATE LUXURY CHAUFFEUR',
      shortDesc: '',
      fullDesc: '',
      duration: '10-12 Hours',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      price: 'From €550',
      isPublished: true,
      displayOrder: dayTrips.length + 1
    });
    setSelectedTour(null);
    setIsEditing(true);
    setMessage('');
  };

  const handleOpenEdit = (t) => {
    setForm({ ...t });
    setSelectedTour(t);
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = selectedTour ? `/api/v1/admin/day-trips/${selectedTour.id}` : '/api/v1/admin/day-trips';
      const method = selectedTour ? 'PATCH' : 'POST';

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
        setMessage('Day trip destination saved successfully.');
        setIsEditing(false);
        fetchDayTrips();
      } else {
        setMessage(data.error || 'Failed to save tour.');
      }
    } catch (err) {
      setMessage('Failed to save tour.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this day trip destination?')) return;
    try {
      await fetch(`/api/v1/admin/day-trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDayTrips();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Day Trips CMS">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Day Trips & Private Tours</h1>
          <p className="vdt-page-sub">
            Hallstatt, Salzburg, Budapest, Prague, Bratislava & Wachau Valley tour itineraries.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Add Destination</span>
          </button>
          <button type="button" onClick={fetchDayTrips} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-fleet-grid">
        {dayTrips.map((tour) => (
          <div key={tour.id} className="vdt-card vdt-fleet-card">
            <div className="vdt-fleet-img-box" style={{ padding: 0 }}>
              <img
                src={tour.image}
                alt={tour.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="vdt-fleet-badges">
                <span className="vdt-badge vdt-badge-confirmed">{tour.price || 'From €550'}</span>
              </div>
            </div>

            <div className="vdt-fleet-content">
              <div className="vdt-fleet-title-row">
                <div>
                  <span className="vdt-fleet-cat">{tour.eyebrow || 'DAY TOUR'}</span>
                  <h3 className="vdt-fleet-name">{tour.name}</h3>
                </div>
                <div className="vdt-spec-item">
                  <Clock size={13} />
                  <span>{tour.duration}</span>
                </div>
              </div>

              <p className="vdt-fleet-desc">{tour.shortDesc}</p>

              <div className="vdt-fleet-actions-row">
                <a
                  href={`/${tour.slug}/`}
                  target="_blank"
                  rel="noreferrer"
                  className="vdt-action-btn"
                  title="View Public Page"
                >
                  <ExternalLink size={14} />
                  <span>View</span>
                </a>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => handleOpenEdit(tour)} className="vdt-action-btn">
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(tour.id)} className="vdt-action-btn-danger">
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
          <div className="vdt-modal-card vdt-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">TOUR DESTINATION</span>
                <h3 className="vdt-modal-title">{selectedTour ? `Edit ${selectedTour.name}` : 'New Destination'}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              <div className="vdt-form-grid">
                <div className="vdt-field-group">
                  <label>Destination Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Hallstatt Day Trip"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>URL Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    required
                    placeholder="hallstatt-day-trip-from-vienna"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 11-12 Hours"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Starting Price</label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="e.g. From €650"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Cover Photo URL *</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Short Description (Overview cards)</label>
                  <textarea
                    rows="2"
                    value={form.shortDesc}
                    onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
                    required
                    className="vdt-textarea"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Full Itinerary Description</label>
                  <textarea
                    rows="4"
                    value={form.fullDesc}
                    onChange={(e) => setForm({ ...form, fullDesc: e.target.value })}
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
                  {saving ? 'Saving...' : 'Save Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
