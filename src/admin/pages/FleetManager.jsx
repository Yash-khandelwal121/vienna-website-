import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
  RefreshCw,
  Users,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function FleetManager() {
  const { token } = useAdminAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    vehicleId: '',
    name: '',
    category: '',
    badge: '',
    tagline: '',
    shortDescription: '',
    fullDescription: '',
    passengers: '3 Guests',
    luggage: '2 Large Bags',
    ride: 'AIRMATIC Suspension',
    mainImage: '/cars/s-class.webp',
    transparentImage: '/cars/s-class.png',
    availability: 'AVAILABLE',
    displayOrder: 1,
    isPublished: true
  });

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/vehicles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const handleOpenAdd = () => {
    setForm({
      vehicleId: '',
      name: '',
      category: 'First Class Limousine',
      badge: 'First Class Sedan',
      tagline: '',
      shortDescription: '',
      fullDescription: '',
      passengers: '3 Guests',
      luggage: '2 Large Bags',
      ride: 'AIRMATIC Suspension',
      mainImage: '/cars/s-class.webp',
      transparentImage: '/cars/s-class.png',
      availability: 'AVAILABLE',
      displayOrder: vehicles.length + 1,
      isPublished: true
    });
    setSelectedVehicle(null);
    setIsEditing(true);
    setMessage('');
  };

  const handleOpenEdit = (v) => {
    setForm({ ...v });
    setSelectedVehicle(v);
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = selectedVehicle
        ? `/api/v1/admin/vehicles/${selectedVehicle.id}`
        : '/api/v1/admin/vehicles';
      const method = selectedVehicle ? 'PATCH' : 'POST';

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
        setMessage(selectedVehicle ? 'Vehicle specifications updated.' : 'New vehicle added.');
        setIsEditing(false);
        fetchVehicles();
      } else {
        setMessage(data.error || 'Failed to save vehicle.');
      }
    } catch (err) {
      setMessage('Failed to save vehicle changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (v) => {
    try {
      await fetch(`/api/v1/admin/vehicles/${v.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !v.isPublished })
      });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from the fleet?')) return;
    try {
      await fetch(`/api/v1/admin/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVehicles();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Fleet Management">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Luxury Mercedes Fleet</h1>
          <p className="vdt-page-sub">
            Manage Mercedes-Benz S-Class, E-Class, V-Class, Sprinter & Armored security vehicles.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Add Vehicle</span>
          </button>
          <button type="button" onClick={fetchVehicles} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      {/* Vehicle Grid Cards */}
      <div className="vdt-fleet-grid">
        {vehicles.map((v) => (
          <div key={v.id} className="vdt-card vdt-fleet-card">
            {/* Image Preview with Transparency Badge */}
            <div className="vdt-fleet-img-box">
              <img src={v.mainImage} alt={v.name} className="vdt-fleet-img" />
              <div className="vdt-fleet-badges">
                <span className={`vdt-badge ${v.availability === 'AVAILABLE' ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}>
                  {v.availability?.replace('_', ' ')}
                </span>
                {v.transparentImage && (
                  <span className="vdt-badge vdt-badge-trans">
                    PNG/WebP Alpha
                  </span>
                )}
              </div>
            </div>

            <div className="vdt-fleet-content">
              <div className="vdt-fleet-title-row">
                <div>
                  <span className="vdt-fleet-cat">{v.category}</span>
                  <h3 className="vdt-fleet-name">{v.name}</h3>
                </div>
                <div className="vdt-fleet-order">Order #{v.displayOrder}</div>
              </div>

              <p className="vdt-fleet-desc">{v.shortDescription}</p>

              <div className="vdt-fleet-specs-row">
                <div className="vdt-spec-item">
                  <Users size={14} />
                  <span>{v.passengers}</span>
                </div>
                <div className="vdt-spec-item">
                  <Briefcase size={14} />
                  <span>{v.luggage}</span>
                </div>
                {v.ride && (
                  <div className="vdt-spec-item">
                    <ShieldCheck size={14} />
                    <span>{v.ride}</span>
                  </div>
                )}
              </div>

              <div className="vdt-fleet-actions-row">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(v)}
                  className="vdt-action-btn"
                  title={v.isPublished ? 'Unpublish Vehicle' : 'Publish Vehicle'}
                >
                  {v.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{v.isPublished ? 'Published' : 'Draft'}</span>
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="button" onClick={() => handleOpenEdit(v)} className="vdt-action-btn">
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={() => handleDelete(v.id)} className="vdt-action-btn-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Vehicle Modal */}
      {isEditing && (
        <div className="vdt-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="vdt-modal-card vdt-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">FLEET CONFIGURATION</span>
                <h3 className="vdt-modal-title">{selectedVehicle ? `Edit ${selectedVehicle.name}` : 'Add New Vehicle'}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              <div className="vdt-form-grid">
                <div className="vdt-field-group">
                  <label>Vehicle Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Mercedes-Benz S-Class"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Category *</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    required
                    placeholder="e.g. First Class Limousine"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Badge / Label</label>
                  <input
                    type="text"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    placeholder="e.g. First Class Sedan"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Availability Status</label>
                  <select
                    value={form.availability}
                    onChange={(e) => setForm({ ...form, availability: e.target.value })}
                    className="vdt-select"
                  >
                    <option value="AVAILABLE">AVAILABLE (Immediate booking)</option>
                    <option value="ON_REQUEST">ON REQUEST (Advance inquiry)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Temporarily paused)</option>
                  </select>
                </div>

                <div className="vdt-field-group">
                  <label>Passenger Capacity</label>
                  <input
                    type="text"
                    value={form.passengers}
                    onChange={(e) => setForm({ ...form, passengers: e.target.value })}
                    placeholder="e.g. 3 Guests"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Luggage Capacity</label>
                  <input
                    type="text"
                    value={form.luggage}
                    onChange={(e) => setForm({ ...form, luggage: e.target.value })}
                    placeholder="e.g. 2 Large Bags"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Main Image Path / URL *</label>
                  <input
                    type="text"
                    value={form.mainImage}
                    onChange={(e) => setForm({ ...form, mainImage: e.target.value })}
                    required
                    placeholder="/cars/s-class.webp"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Transparent Studio Vehicle Image (WebP/PNG)</label>
                  <input
                    type="text"
                    value={form.transparentImage}
                    onChange={(e) => setForm({ ...form, transparentImage: e.target.value })}
                    placeholder="/cars/s-class.png"
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Short Description (Overview cards)</label>
                  <input
                    type="text"
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Brief description for cards and popups..."
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
                  <label>Full Editorial Description (Fleet showroom)</label>
                  <textarea
                    rows="3"
                    value={form.fullDescription}
                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                    placeholder="Comprehensive luxury vehicle description..."
                    className="vdt-textarea"
                  />
                </div>
              </div>

              <div className="vdt-modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="vdt-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="vdt-btn-primary">
                  {saving ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
