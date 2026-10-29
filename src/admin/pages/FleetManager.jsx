import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Users,
  Briefcase,
  ShieldCheck,
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
  Sparkles,
  Link as LinkIcon,
  Layers,
  Award,
  Clock
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import RichTextEditor from '../components/RichTextEditor';

const STEPS = [
  { id: 'basic', label: '1. Basic Specifications', icon: FileText },
  { id: 'image', label: '2. Vehicle Visuals & Cutouts', icon: ImageIcon },
  { id: 'content', label: '3. Interior & Amenities', icon: Layers },
  { id: 'seo', label: '4. SEO Settings & SERP', icon: Globe },
  { id: 'publish', label: '5. Publishing Workflow', icon: Sliders },
];

export default function FleetManager() {
  const { token } = useAdminAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal & Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [vehicleStatus, setVehicleStatus] = useState('NEW');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [modalNotice, setModalNotice] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingTransparent, setUploadingTransparent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [manualIdEdit, setManualIdEdit] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: 'Mercedes-Benz S-Class',
    vehicleId: 's-class',
    category: 'First Class Sedan',
    badge: 'First Class Sedan',
    tagline: 'The Pinnacle of Automotive Luxury',
    shortDescription: 'The pinnacle of luxury travel. The Mercedes-Benz S-Class combines supreme elegance with cutting-edge technology for discerning travelers.',
    fullDescription: '<p>The Mercedes-Benz S-Class has long stood as the definitive standard for luxury chauffeured travel worldwide. Featuring acoustic comfort glass, extended legroom, and active ambient lighting.</p>',
    passengers: '3 Guests',
    luggage: '2 Large Bags',
    ride: 'AIRMATIC Air Suspension',
    features: [
      'Active Noise Cancellation & Acoustic Glazing',
      'Rear Reclining Heated & Ventilated Executive Seats',
      'Burmester® 3D High-End Surround Sound System',
      'Onboard High-Speed 5G Wi-Fi & Multiple Device Ports',
      'Complimentary Chilled Vöslauer Mineral Water'
    ],
    amenities: [
      'Mineral Water (Still & Sparkling)',
      'High-Speed Wi-Fi',
      'Daily Financial & Travel Press',
      'USB-C Fast Chargers & Apple Lightning',
      'Individual Climate Control Zones'
    ],
    mainImage: '/cars/s-class.webp',
    transparentImage: '/cars/s-class.png',
    gallery: [],
    availability: 'AVAILABLE',
    displayOrder: 1,
    isPublished: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: ''
    }
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeTab);

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
      setMessage({ type: 'error', text: 'Failed to load fleet from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [token]);

  const handleNameChange = (val) => {
    setIsDirty(true);
    setValidationError(null);
    const updated = { ...form, name: val };
    if (!selectedVehicle && !manualIdEdit) {
      const generatedId = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
      updated.vehicleId = generatedId;
    }
    setForm(updated);
  };

  const updateForm = (patch) => {
    setIsDirty(true);
    setValidationError(null);
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const updateSeo = (patch) => {
    setIsDirty(true);
    setValidationError(null);
    setForm((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }));
  };

  const handleOpenAdd = () => {
    setForm({
      name: '',
      vehicleId: '',
      category: 'First Class Sedan',
      badge: 'First Class',
      tagline: 'Flagship Luxury Transportation',
      shortDescription: '',
      fullDescription: '<p>Experience first-class private transportation in Vienna with pristine Mercedes-Benz luxury...</p>',
      passengers: '3 Guests',
      luggage: '2 Large Bags',
      ride: 'AIRMATIC Air Suspension',
      features: [
        'Acoustic comfort glazing',
        'High-speed 5G Wi-Fi onboard',
        'Complimentary chilled mineral water'
      ],
      amenities: [
        'Chilled Mineral Water',
        'Device Fast Chargers',
        'Individual Climate Controls'
      ],
      mainImage: '/cars/s-class.webp',
      transparentImage: '/cars/s-class.png',
      gallery: [],
      availability: 'AVAILABLE',
      displayOrder: vehicles.length + 1,
      isPublished: true,
      seo: {
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        canonicalUrl: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: ''
      }
    });
    setSelectedVehicle(null);
    setManualIdEdit(false);
    setActiveTab('basic');
    setVehicleStatus('NEW');
    setSaving(false);
    setSaveError(null);
    setValidationError(null);
    setModalNotice(null);
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (v) => {
    let feat = [];
    if (Array.isArray(v.features)) feat = v.features;
    else if (typeof v.features === 'string') {
      try { feat = JSON.parse(v.features); } catch { feat = v.features.split('\n').filter(Boolean); }
    }

    let gal = [];
    if (Array.isArray(v.gallery)) gal = v.gallery;
    else if (typeof v.gallery === 'string') {
      try { gal = JSON.parse(v.gallery); } catch { gal = []; }
    }

    setForm({
      id: v.id,
      name: v.name || '',
      vehicleId: v.vehicleId || '',
      category: v.category || 'First Class Sedan',
      badge: v.badge || '',
      tagline: v.tagline || '',
      shortDescription: v.shortDescription || '',
      fullDescription: v.fullDescription || '',
      passengers: v.passengers || '3 Guests',
      luggage: v.luggage || '2 Large Bags',
      ride: v.ride || 'AIRMATIC Air Suspension',
      features: feat,
      amenities: Array.isArray(v.amenities) ? v.amenities : [
        'Chilled Mineral Water',
        'High-Speed Wi-Fi',
        'Device Fast Chargers'
      ],
      mainImage: v.mainImage || '/cars/s-class.webp',
      transparentImage: v.transparentImage || '',
      gallery: gal,
      availability: v.availability || 'AVAILABLE',
      displayOrder: Number(v.displayOrder) || 1,
      isPublished: v.isPublished !== false,
      seo: {
        metaTitle: v.seoTitle || v.name || '',
        metaDescription: v.seoDescription || v.shortDescription || '',
        focusKeyword: v.focusKeyword || '',
        canonicalUrl: `https://viennadaytrip.com/luxury-fleet/`,
        ogTitle: v.seoTitle || v.name || '',
        ogDescription: v.seoDescription || v.shortDescription || '',
        ogImage: v.mainImage || ''
      }
    });

    setSelectedVehicle(v);
    setManualIdEdit(true);
    setActiveTab('basic');
    setVehicleStatus(v.isPublished !== false ? 'PUBLISHED' : 'DRAFT');
    setSaving(false);
    setSaveError(null);
    setValidationError(null);
    setModalNotice(null);
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard them?')) return;
    }
    setIsEditing(false);
    setValidationError(null);
    setModalNotice(null);
    setIsDirty(false);
  };

  const handleNextStep = () => {
    setValidationError(null);
    if (activeTab === 'basic') {
      if (!form.name.trim() || !form.category.trim()) {
        setValidationError('Please specify Vehicle Name and Category in Step 1.');
        return;
      }
      setActiveTab('image');
    } else if (activeTab === 'image') {
      if (!form.mainImage.trim()) {
        setValidationError('Please provide a Main Vehicle Image in Step 2.');
        return;
      }
      setActiveTab('content');
    } else if (activeTab === 'content') {
      setActiveTab('seo');
    } else if (activeTab === 'seo') {
      setActiveTab('publish');
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    if (currentStepIndex > 0) {
      setActiveTab(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleUploadMain = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingMain(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'fleet_main');
      formData.append('altText', form.name);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        updateForm({ mainImage: data.asset.url });
        setModalNotice({ type: 'success', text: 'Main image uploaded successfully.' });
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      alert('Error uploading image.');
    } finally {
      setUploadingMain(false);
    }
  };

  const handleUploadTransparent = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingTransparent(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'fleet_transparent');
      formData.append('altText', `${form.name} Cutout`);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        updateForm({ transparentImage: data.asset.url });
        setModalNotice({ type: 'success', text: 'Transparent vehicle cutout uploaded successfully.' });
      } else {
        alert(data.error || 'Failed to upload cutout.');
      }
    } catch (err) {
      alert('Error uploading transparent image.');
    } finally {
      setUploadingTransparent(false);
    }
  };

  const handleAddGalleryItem = () => {
    if (!newGalleryUrl.trim()) return;
    updateForm({
      gallery: [...form.gallery, { url: newGalleryUrl.trim(), caption: newGalleryCaption.trim() || 'Interior' }]
    });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
  };

  const handleRemoveGalleryItem = (idx) => {
    updateForm({ gallery: form.gallery.filter((_, i) => i !== idx) });
  };

  const handleSave = async (publishStatus = null) => {
    if (saving) return;
    setValidationError(null);
    setSaveError(null);

    if (!form.name.trim() || !form.category.trim()) {
      setValidationError('Vehicle Name and Category are required.');
      setActiveTab('basic');
      return;
    }

    const isPub = publishStatus !== null ? publishStatus : form.isPublished;

    try {
      setSaving(true);
      const cleanId = (form.vehicleId || form.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');

      const payload = {
        name: form.name.trim(),
        vehicleId: cleanId,
        category: form.category.trim(),
        badge: form.badge || '',
        tagline: form.tagline || '',
        shortDescription: form.shortDescription || '',
        fullDescription: form.fullDescription || '',
        passengers: form.passengers || '3 Guests',
        luggage: form.luggage || '2 Large Bags',
        ride: form.ride || 'AIRMATIC Suspension',
        features: form.features || [],
        amenities: form.amenities || [],
        mainImage: form.mainImage || '/cars/s-class.webp',
        transparentImage: form.transparentImage || '',
        gallery: form.gallery || [],
        availability: form.availability || 'AVAILABLE',
        displayOrder: Number(form.displayOrder) || 1,
        isPublished: isPub,
        seoTitle: form.seo.metaTitle || form.name,
        seoDescription: form.seo.metaDescription || form.shortDescription
      };

      const url = selectedVehicle ? `/api/v1/admin/vehicles/${selectedVehicle.id}` : '/api/v1/admin/vehicles';
      const method = selectedVehicle ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.vehicle) {
        setVehicleStatus(isPub ? 'PUBLISHED' : 'DRAFT');
        setSelectedVehicle(data.vehicle);
        setForm((prev) => ({
          ...prev,
          id: data.vehicle.id,
          vehicleId: data.vehicle.vehicleId,
          isPublished: isPub
        }));
        setIsDirty(false);
        setModalNotice({
          type: 'success',
          text: isPub ? 'Vehicle published and active!' : 'Vehicle saved as draft!'
        });
        setMessage({
          type: 'success',
          text: `Vehicle "${data.vehicle.name}" ${isPub ? 'published' : 'saved as draft'}.`
        });
        fetchVehicles();
      } else {
        setVehicleStatus('ERROR');
        setSaveError(data.error || 'Failed to save vehicle.');
        setModalNotice({ type: 'error', text: data.error || 'Failed to save vehicle.' });
      }
    } catch (err) {
      setVehicleStatus('ERROR');
      setSaveError('Network error while saving vehicle.');
      setModalNotice({ type: 'error', text: 'Network error while saving.' });
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
    if (!window.confirm('Are you sure you want to delete this vehicle from the fleet?')) return;
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

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.category?.toLowerCase().includes(search.toLowerCase()) ||
      v.vehicleId?.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'PUBLISHED') return matchesSearch && v.isPublished;
    if (statusFilter === 'DRAFT') return matchesSearch && !v.isPublished;
    return matchesSearch;
  });

  const getStatusBadge = () => {
    if (saving) {
      return (
        <span className="vdt-badge vdt-badge-saving" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <RefreshCw size={12} className="vdt-spin" />
          <span>STATUS: SAVING...</span>
        </span>
      );
    }
    if (saveError) {
      return <span className="vdt-badge vdt-badge-error">STATUS: ERROR</span>;
    }
    if (vehicleStatus === 'PUBLISHED') {
      return <span className="vdt-badge vdt-badge-confirmed">STATUS: PUBLISHED</span>;
    }
    if (vehicleStatus === 'DRAFT') {
      return <span className="vdt-badge vdt-badge-contacted">STATUS: DRAFT</span>;
    }
    return <span className="vdt-badge vdt-badge-unsaved">STATUS: NEW / UNSAVED</span>;
  };

  return (
    <AdminLayout>
      <div className="vdt-page-header">
        <div>
          <h2 className="vdt-page-title">Luxury Fleet CMS</h2>
          <p className="vdt-page-sub">
            Manage Mercedes-Benz flagship sedans, luxury MPVs, specifications, transparent visual cutouts, and showroom galleries.
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
        <div className="vdt-search-form" style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap' }}>
          <div className="vdt-search-box" style={{ flex: 1, minWidth: '240px' }}>
            <Search size={16} className="vdt-search-icon" />
            <input
              type="text"
              placeholder="Search by vehicle name, category, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="vdt-status-pills">
            <span style={{ fontSize: '0.76rem', color: '#8C877E', alignSelf: 'center', fontWeight: 600 }}>STATUS:</span>
            {['ALL', 'PUBLISHED', 'DRAFT'].map((st) => (
              <button
                key={st}
                type="button"
                className={`vdt-pill-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="vdt-fleet-grid" style={{ marginTop: '1.25rem' }}>
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((v) => (
            <div key={v.id} className="vdt-fleet-card">
              <div className="vdt-fleet-img-box">
                <img
                  src={v.transparentImage || v.mainImage || '/cars/s-class.png'}
                  alt={v.name}
                  className="vdt-fleet-img"
                />
                <div className="vdt-fleet-badges">
                  <span className="vdt-badge vdt-badge-trans">{v.badge || v.category}</span>
                </div>
              </div>
              <div className="vdt-fleet-content">
                <div className="vdt-fleet-title-row">
                  <div>
                    <span className="vdt-fleet-cat">{v.category}</span>
                    <h4 className="vdt-fleet-name">{v.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(v)}
                    className={`vdt-badge ${v.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {v.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', margin: '0.65rem 0', color: '#62666D', fontSize: '0.82rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={14} style={{ color: '#C69C50' }} />
                    {v.passengers}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Briefcase size={14} style={{ color: '#C69C50' }} />
                    {v.luggage}
                  </span>
                </div>

                <p style={{ color: '#62666D', fontSize: '0.84rem', lineHeight: '1.5', margin: '0 0 1rem', flex: 1 }}>
                  {v.shortDescription?.substring(0, 110)}...
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E6D8C3', paddingTop: '0.85rem' }}>
                  <a
                    href="/luxury-fleet/"
                    target="_blank"
                    rel="noreferrer"
                    className="vdt-action-btn"
                  >
                    <ExternalLink size={13} />
                    <span>Showroom</span>
                  </a>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(v)}
                      className="vdt-action-btn"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(v.id)}
                      className="vdt-action-btn-danger"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="vdt-empty-state" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
            {loading ? 'Loading luxury fleet...' : 'No vehicles found in fleet.'}
          </div>
        )}
      </div>

      {/* =========================================================================
          FIVE-STEP FLEET EDITOR MODAL
          ========================================================================= */}
      {isEditing && (
        <div className="vdt-modal-overlay" onClick={handleCloseModal}>
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
                  {selectedVehicle ? `Edit: ${form.name}` : 'Add Luxury Fleet Vehicle'}
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {getStatusBadge()}
                <button type="button" className="vdt-modal-close" onClick={handleCloseModal} title="Close Editor">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Validation & Notification Banners */}
            {validationError && (
              <div
                style={{
                  margin: '1rem 1.75rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={16} />
                <span>{validationError}</span>
                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {modalNotice && (
              <div
                style={{
                  margin: '1rem 1.75rem 0',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: modalNotice.type === 'error' ? '#FEE2E2' : '#ECFDF5',
                  border: modalNotice.type === 'error' ? '1px solid #FCA5A5' : '1px solid #6EE7B7',
                  color: modalNotice.type === 'error' ? '#991B1B' : '#065F46',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {modalNotice.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                <span>{modalNotice.text}</span>
                <button
                  type="button"
                  onClick={() => setModalNotice(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Navigation Tabs Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: '#FAF8F4',
                borderBottom: '1px solid #E6D8C3',
                overflowX: 'auto'
              }}
            >
              {STEPS.map((tab) => {
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
                      boxShadow: active ? '0 2px 8px rgba(198, 156, 80, 0.15)' : 'none'
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content */}
            <div className="vdt-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
              {/* TAB 1: BASIC SPECIFICATIONS */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Vehicle Name *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Mercedes-Benz S-Class"
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Category *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. First Class Sedan"
                        value={form.category}
                        onChange={(e) => updateForm({ category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="vdt-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="vdt-form-label">Vehicle Identifier (Slug) *</label>
                      <button
                        type="button"
                        onClick={() => setManualIdEdit(!manualIdEdit)}
                        style={{ background: 'none', border: 'none', color: '#C69C50', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        {manualIdEdit ? 'Lock Auto-Gen' : 'Edit Manually'}
                      </button>
                    </div>
                    <input
                      type="text"
                      className="vdt-form-input"
                      value={form.vehicleId}
                      readOnly={!manualIdEdit}
                      onChange={(e) => updateForm({ vehicleId: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Passenger Capacity</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. 3 Guests"
                        value={form.passengers}
                        onChange={(e) => updateForm({ passengers: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Luggage Capacity</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. 2 Large Bags"
                        value={form.luggage}
                        onChange={(e) => updateForm({ luggage: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Suspension / Ride</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. AIRMATIC Air Suspension"
                        value={form.ride}
                        onChange={(e) => updateForm({ ride: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Display Order</label>
                      <input
                        type="number"
                        className="vdt-form-input"
                        value={form.displayOrder}
                        onChange={(e) => updateForm({ displayOrder: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Badge Label</label>
                    <input
                      type="text"
                      className="vdt-form-input"
                      placeholder="e.g. Flagship Sedan"
                      value={form.badge}
                      onChange={(e) => updateForm({ badge: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: VISUALS & CUTOUTS */}
              {activeTab === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Main Image */}
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Main Image URL *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        value={form.mainImage}
                        onChange={(e) => updateForm({ mainImage: e.target.value })}
                        style={{ marginBottom: '0.65rem' }}
                      />
                      <label className="vdt-btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        <Upload size={14} />
                        <span>{uploadingMain ? 'Uploading...' : 'Upload Main Image'}</span>
                        <input type="file" accept="image/*" onChange={handleUploadMain} style={{ display: 'none' }} />
                      </label>

                      {form.mainImage && (
                        <div style={{ height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E6D8C3' }}>
                          <img src={form.mainImage} alt={form.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    {/* Transparent Cutout */}
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Transparent PNG/WebP Cutout</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        value={form.transparentImage}
                        onChange={(e) => updateForm({ transparentImage: e.target.value })}
                        style={{ marginBottom: '0.65rem' }}
                      />
                      <label className="vdt-btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                        <Upload size={14} />
                        <span>{uploadingTransparent ? 'Uploading...' : 'Upload Cutout (PNG/WebP)'}</span>
                        <input type="file" accept="image/png,image/webp" onChange={handleUploadTransparent} style={{ display: 'none' }} />
                      </label>

                      <div
                        style={{
                          height: '180px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #E6D8C3',
                          backgroundColor: '#0E1013',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '1rem'
                        }}
                      >
                        {form.transparentImage ? (
                          <img
                            src={form.transparentImage}
                            alt={`${form.name} Cutout`}
                            style={{ maxWidth: '90%', maxHeight: '140px', objectFit: 'contain' }}
                          />
                        ) : (
                          <span style={{ color: '#8C877E', fontSize: '0.82rem' }}>No transparent cutout uploaded</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: INTERIOR & AMENITIES */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Short Description</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={2}
                      value={form.shortDescription}
                      onChange={(e) => updateForm({ shortDescription: e.target.value })}
                    />
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Full Vehicle Editorial & Specification</label>
                    <RichTextEditor
                      value={form.fullDescription}
                      onChange={(html) => updateForm({ fullDescription: html })}
                      token={token}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Key Features (1 per line)</label>
                      <textarea
                        className="vdt-form-textarea"
                        rows={4}
                        value={Array.isArray(form.features) ? form.features.join('\n') : form.features}
                        onChange={(e) => updateForm({ features: e.target.value.split('\n').filter(Boolean) })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Interior Amenities (1 per line)</label>
                      <textarea
                        className="vdt-form-textarea"
                        rows={4}
                        value={Array.isArray(form.amenities) ? form.amenities.join('\n') : form.amenities}
                        onChange={(e) => updateForm({ amenities: e.target.value.split('\n').filter(Boolean) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SEO SETTINGS & SERP */}
              {activeTab === 'seo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Meta Title</label>
                    <input
                      type="text"
                      className="vdt-form-input"
                      placeholder="e.g. Mercedes-Benz S-Class Chauffeur Vienna | Luxury Fleet"
                      value={form.seo.metaTitle}
                      onChange={(e) => updateSeo({ metaTitle: e.target.value })}
                    />
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Meta Description</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={3}
                      placeholder="Travel in supreme comfort with the Mercedes-Benz S-Class chauffeur service in Vienna..."
                      value={form.seo.metaDescription}
                      onChange={(e) => updateSeo({ metaDescription: e.target.value })}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C877E', fontWeight: 700, marginBottom: '0.65rem' }}>
                      SERP Live Preview
                    </div>
                    <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E6D8C3', borderRadius: '8px', maxWidth: '650px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#202124', marginBottom: '0.2rem' }}>
                        https://viennadaytrip.com &rsaquo; luxury-fleet &rsaquo; {form.vehicleId || 'sedan'}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.35rem' }}>
                        {form.seo.metaTitle || form.name || 'Luxury Chauffeur Fleet | Vienna Day Trip'}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5 }}>
                        {form.seo.metaDescription || form.shortDescription || 'Discover our private Mercedes-Benz fleet in Vienna.'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PUBLISHING WORKFLOW */}
              {activeTab === 'publish' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div
                    style={{
                      padding: '1.5rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E6D8C3',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontFamily: 'var(--vdt-font-heading)', fontSize: '1.15rem', color: '#17191C', margin: 0 }}>
                          Fleet Availability & Showcase Status
                        </h4>
                        <p style={{ color: '#62666D', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                          When published, this vehicle automatically appears in the luxury fleet cards, 360° showroom, and booking selector.
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: form.isPublished ? '#065F46' : '#991B1B' }}>
                          {form.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        <input
                          type="checkbox"
                          checked={form.isPublished}
                          onChange={(e) => updateForm({ isPublished: e.target.checked })}
                          style={{ width: '18px', height: '18px', accentColor: '#C69C50', cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '1.25rem', backgroundColor: '#FAF8F4', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
                    <div style={{ fontSize: '0.76rem', color: '#8C877E', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Public Showroom Link
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <LinkIcon size={16} style={{ color: '#C69C50' }} />
                      <a
                        href="/luxury-fleet/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#C69C50', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none' }}
                      >
                        https://viennadaytrip.com/luxury-fleet/
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer Action Bar */}
            <div className="vdt-editor-footer" style={{ borderTop: '1px solid #E6D8C3' }}>
              <div className="vdt-footer-left">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="vdt-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                >
                  Cancel
                </button>
              </div>

              <div className="vdt-footer-center">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="vdt-btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    opacity: currentStepIndex === 0 ? 0.45 : 1,
                    cursor: currentStepIndex === 0 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>Previous Step</span>
                </button>

                {currentStepIndex < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="vdt-btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
                  >
                    <span>Next Step</span>
                    <ChevronRight size={16} />
                  </button>
                ) : (
                  <div className="vdt-footer-final-step">
                    <CheckCircle2 size={15} style={{ color: '#C69C50' }} />
                    <span>Final Step — Ready to Publish</span>
                  </div>
                )}
              </div>

              <div className="vdt-footer-right">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="vdt-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={14} />
                  <span>{saving && vehicleStatus !== 'PUBLISHED' ? 'Saving Draft...' : 'Save as Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="vdt-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={14} />
                  <span>{saving ? 'Publishing...' : selectedVehicle ? 'Update & Publish' : 'Publish Vehicle'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
