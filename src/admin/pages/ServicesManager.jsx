import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  Euro,
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
  HelpCircle,
  ShieldCheck,
  Check
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import RichTextEditor from '../components/RichTextEditor';
import { CANONICAL_SERVICE_IMAGES, sanitizeImageUrl } from '../../services/api';

const STEPS = [
  { id: 'basic', label: '1. Basic Information', icon: FileText },
  { id: 'image', label: '2. Cover Image & Gallery', icon: ImageIcon },
  { id: 'content', label: '3. Rich Content & Details', icon: Layers },
  { id: 'seo', label: '4. SEO Settings & SERP', icon: Globe },
  { id: 'publish', label: '5. Publishing Workflow', icon: Sliders },
];

export default function ServicesManager() {
  const { token } = useAdminAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal & Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [serviceStatus, setServiceStatus] = useState('NEW');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [modalNotice, setModalNotice] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [manualSlugEdit, setManualSlugEdit] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: '',
    slug: '',
    category: 'Airport Transportation',
    shortDesc: '',
    fullDesc: '',
    features: [
      'Meet & Greet inside terminal with custom sign',
      'Continuous real-time flight delay monitoring',
      'Complimentary 60 minutes waiting time post-landing',
      'Luggage assistance from carousel directly to vehicle'
    ],
    startingPrice: '€55',
    availability: '24/7 Monitored',
    displayOrder: 1,
    image: '/images/airport-transfer.webp',
    imageAlt: '',
    gallery: [],
    ctaLabel: 'Book Service',
    ctaUrl: '/airport-transfer-vienna/',
    included: [
      'Private Mercedes-Benz chauffeur vehicle',
      'Flight tracking and delayed arrival adjustment',
      'Chilled mineral water & Wi-Fi onboard'
    ],
    excluded: [
      'Unscheduled destination deviations',
      'Specialist child seats without advance notice'
    ],
    processSteps: [
      { step: '1', title: 'Reserve Online', desc: 'Book in 60 seconds with instant confirmation.' },
      { step: '2', title: 'Chauffeur Dispatched', desc: 'Driver details and vehicle registration sent prior.' },
      { step: '3', title: 'Executive Arrival', desc: 'Prompt luxury door-to-door transfer in Vienna.' }
    ],
    faqs: [
      { question: 'What happens if my flight is delayed?', answer: 'We monitor your flight status continuously and adjust pickup time automatically at no extra fee.' }
    ],
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
      setMessage({ type: 'error', text: 'Failed to load services from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  const handleNameChange = (val) => {
    setIsDirty(true);
    setValidationError(null);
    const updated = { ...form, name: val };
    if (!selectedService && !manualSlugEdit) {
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
      updated.slug = generatedSlug;
      updated.ctaUrl = `/${generatedSlug}/`;
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
      slug: '',
      category: 'Executive Chauffeur',
      shortDesc: '',
      fullDesc: '<p>Our private chauffeur service provides discerning travelers with supreme comfort and punctuality across Vienna...</p>',
      features: [
        'Dedicated professional chauffeur',
        'Immaculate Mercedes-Benz fleet',
        'Complimentary Wi-Fi and chilled water'
      ],
      startingPrice: '€55',
      availability: '24/7 Available',
      displayOrder: services.length + 1,
      image: '/images/vienna-palace-backdrop.webp',
      imageAlt: '',
      gallery: [],
      ctaLabel: 'Book Service',
      ctaUrl: '',
      included: ['Door-to-door transportation', 'English-speaking chauffeur', 'Fuel and parking fees'],
      excluded: ['Gratuities (discretionary)'],
      processSteps: [
        { step: '1', title: 'Select Journey', desc: 'Choose pickup, drop-off, date, and preferred Mercedes model.' },
        { step: '2', title: 'Confirmed Chauffeur', desc: 'Receive immediate driver dispatch notification.' }
      ],
      faqs: [],
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
    setSelectedService(null);
    setManualSlugEdit(false);
    setActiveTab('basic');
    setServiceStatus('NEW');
    setSaving(false);
    setSaveError(null);
    setValidationError(null);
    setModalNotice(null);
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (s) => {
    let feat = [];
    if (Array.isArray(s.features)) feat = s.features;
    else if (typeof s.features === 'string') {
      try { feat = JSON.parse(s.features); } catch { feat = s.features.split('\n').filter(Boolean); }
    }

    setForm({
      id: s.id,
      name: s.name || '',
      slug: s.slug || '',
      category: s.category || 'Executive Chauffeur',
      shortDesc: s.shortDesc || '',
      fullDesc: s.fullDesc || '',
      features: feat,
      startingPrice: s.startingPrice || '€55',
      availability: s.availability || '24/7 Available',
      displayOrder: Number(s.displayOrder) || 1,
      image: s.image || '/images/vienna-palace-backdrop.webp',
      imageAlt: s.imageAlt || s.name || '',
      gallery: Array.isArray(s.gallery) ? s.gallery : [],
      ctaLabel: s.ctaLabel || 'Book Service',
      ctaUrl: s.ctaUrl || `/${s.slug}/`,
      included: Array.isArray(s.included) ? s.included : ['Door-to-door transportation', 'Mercedes-Benz assignment'],
      excluded: Array.isArray(s.excluded) ? s.excluded : [],
      processSteps: Array.isArray(s.processSteps) ? s.processSteps : [],
      faqs: Array.isArray(s.faqs) ? s.faqs : [],
      isPublished: s.isPublished !== false,
      seo: {
        metaTitle: s.seoTitle || s.seo?.metaTitle || s.name || '',
        metaDescription: s.seoDesc || s.seo?.metaDescription || s.shortDesc || '',
        focusKeyword: s.focusKeyword || '',
        canonicalUrl: s.canonicalUrl || `https://viennadaytrip.com/${s.slug}/`,
        ogTitle: s.seo?.ogTitle || s.name || '',
        ogDescription: s.seo?.ogDescription || s.shortDesc || '',
        ogImage: s.seo?.ogImage || s.image || ''
      }
    });

    setSelectedService(s);
    setManualSlugEdit(true);
    setActiveTab('basic');
    setServiceStatus(s.isPublished !== false ? 'PUBLISHED' : 'DRAFT');
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
      if (!form.name.trim()) {
        setValidationError('Please enter Service Name in Step 1.');
        return;
      }
      setActiveTab('image');
    } else if (activeTab === 'image') {
      if (!form.image.trim()) {
        setValidationError('Please provide a Cover Image in Step 2.');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'service_cover');
      formData.append('altText', form.imageAlt || form.name || file.name);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        updateForm({ image: data.asset.url, imageAlt: form.imageAlt || form.name });
        setModalNotice({ type: 'success', text: 'Cover image uploaded and persisted.' });
      } else {
        alert(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      alert('Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publishStatus = null) => {
    if (saving) return;
    setValidationError(null);
    setSaveError(null);

    if (!form.name.trim()) {
      setValidationError('Service Name is required.');
      setActiveTab('basic');
      return;
    }

    const isPub = publishStatus !== null ? publishStatus : form.isPublished;

    try {
      setSaving(true);
      const cleanSlug = (form.slug || form.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const payload = {
        name: form.name.trim(),
        slug: cleanSlug,
        shortDesc: form.shortDesc || '',
        fullDesc: form.fullDesc || '',
        features: form.features || [],
        image: form.image || '/images/vienna-palace-backdrop.webp',
        ctaLabel: form.ctaLabel || 'Book Service',
        ctaUrl: form.ctaUrl || `/${cleanSlug}/`,
        displayOrder: Number(form.displayOrder) || 1,
        isPublished: isPub,
        seoTitle: form.seo.metaTitle || form.name,
        seoDesc: form.seo.metaDescription || form.shortDesc
      };

      const url = selectedService ? `/api/v1/admin/services/${selectedService.id}` : '/api/v1/admin/services';
      const method = selectedService ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.service) {
        setServiceStatus(isPub ? 'PUBLISHED' : 'DRAFT');
        setSelectedService(data.service);
        setForm((prev) => ({
          ...prev,
          id: data.service.id,
          slug: data.service.slug,
          isPublished: isPub
        }));
        setIsDirty(false);
        setModalNotice({
          type: 'success',
          text: isPub ? 'Service published successfully!' : 'Service saved as draft!'
        });
        setMessage({
          type: 'success',
          text: `Service "${data.service.name}" ${isPub ? 'published' : 'saved as draft'}.`
        });
        fetchServices();
      } else {
        setServiceStatus('ERROR');
        setSaveError(data.error || 'Failed to save service.');
        setModalNotice({ type: 'error', text: data.error || 'Failed to save service.' });
      }
    } catch (err) {
      setServiceStatus('ERROR');
      setSaveError('Network error while saving service.');
      setModalNotice({ type: 'error', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (srv) => {
    try {
      await fetch(`/api/v1/admin/services/${srv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !srv.isPublished })
      });
      fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
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

  const filteredServices = services.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.slug?.toLowerCase().includes(search.toLowerCase()) ||
      s.shortDesc?.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'PUBLISHED') return matchesSearch && s.isPublished;
    if (statusFilter === 'DRAFT') return matchesSearch && !s.isPublished;
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
    if (serviceStatus === 'PUBLISHED') {
      return <span className="vdt-badge vdt-badge-confirmed">STATUS: PUBLISHED</span>;
    }
    if (serviceStatus === 'DRAFT') {
      return <span className="vdt-badge vdt-badge-contacted">STATUS: DRAFT</span>;
    }
    return <span className="vdt-badge vdt-badge-unsaved">STATUS: NEW / UNSAVED</span>;
  };

  return (
    <AdminLayout>
      <div className="vdt-page-header">
        <div>
          <h2 className="vdt-page-title">Executive Services CMS</h2>
          <p className="vdt-page-sub">
            Manage airport transfers, hourly chauffeur packages, bespoke day trips, and tactical security transportation.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Create Service</span>
          </button>
          <button type="button" onClick={fetchServices} className="vdt-btn-secondary" disabled={loading}>
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
              placeholder="Search by service name, slug, or details..."
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

      {/* Services Table */}
      <div className="vdt-card" style={{ marginTop: '1.25rem' }}>
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Cover Image</th>
                <th>Service Name & Slug</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                  <tr key={s.id}>
                    <td style={{ width: '80px' }}>
                      <div className="vdt-blog-thumb-frame">
                        <img
                          src={sanitizeImageUrl(s.image, CANONICAL_SERVICE_IMAGES[s.slug] || '/images/vienna-palace-backdrop.webp')}
                          alt={s.name}
                        />
                      </div>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      <div className="vdt-blog-row-title">{s.name}</div>
                      <div className="vdt-blog-row-slug">/{s.slug}/</div>
                    </td>
                    <td>
                      <span className="vdt-badge vdt-badge-trans">{s.displayOrder || 1}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(s)}
                        className={`vdt-badge ${s.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle Draft / Published"
                      >
                        {s.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={s.ctaUrl || `/${s.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="vdt-action-btn"
                          title="Preview public page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="vdt-action-btn"
                          title="Edit service"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
                          className="vdt-action-btn-danger"
                          title="Delete service"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="vdt-empty-state">
                    {loading ? 'Loading services...' : 'No services found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          FIVE-STEP SERVICES EDITOR MODAL
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
                  {selectedService ? `Edit: ${form.name}` : 'Create Chauffeur Service'}
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
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Service Name *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Airport Transfers Vienna"
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Category</label>
                      <select
                        className="vdt-form-select"
                        value={form.category}
                        onChange={(e) => updateForm({ category: e.target.value })}
                      >
                        <option value="Airport Transportation">Airport Transportation</option>
                        <option value="Hourly Chauffeur">Hourly Chauffeur</option>
                        <option value="Private Tours">Private Tours</option>
                        <option value="Executive Protection">Executive Protection</option>
                        <option value="Corporate & Diplomatic">Corporate & Diplomatic</option>
                      </select>
                    </div>
                  </div>

                  <div className="vdt-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="vdt-form-label">URL Slug *</label>
                      <button
                        type="button"
                        onClick={() => setManualSlugEdit(!manualSlugEdit)}
                        style={{ background: 'none', border: 'none', color: '#C69C50', fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        {manualSlugEdit ? 'Lock Auto-Gen' : 'Edit Slug Manually'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#8C877E', fontSize: '0.86rem' }}>https://viennadaytrip.com/</span>
                      <input
                        type="text"
                        className="vdt-form-input"
                        value={form.slug}
                        readOnly={!manualSlugEdit}
                        onChange={(e) => updateForm({ slug: e.target.value, ctaUrl: `/${e.target.value}/` })}
                        style={{ flex: 1 }}
                      />
                      <span style={{ color: '#8C877E', fontSize: '0.86rem' }}>/</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Starting Price</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. From €55"
                        value={form.startingPrice}
                        onChange={(e) => updateForm({ startingPrice: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Availability</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. 24/7 Monitored"
                        value={form.availability}
                        onChange={(e) => updateForm({ availability: e.target.value })}
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
                    <label className="vdt-form-label">Short Description</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={3}
                      placeholder="Concise overview for cards and pillars..."
                      value={form.shortDesc}
                      onChange={(e) => updateForm({ shortDesc: e.target.value })}
                    />
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Key Features / Bullets (1 per line)</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={4}
                      value={Array.isArray(form.features) ? form.features.join('\n') : form.features}
                      onChange={(e) => updateForm({ features: e.target.value.split('\n').filter(Boolean) })}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: COVER IMAGE & GALLERY */}
              {activeTab === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Service Cover Image *</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="Image URL or upload..."
                        value={form.image}
                        onChange={(e) => updateForm({ image: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <label className="vdt-btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Upload size={14} />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Media'}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {form.image && (
                      <div
                        style={{
                          width: '100%',
                          maxHeight: '260px',
                          overflow: 'hidden',
                          borderRadius: '8px',
                          border: '1px solid #E6D8C3'
                        }}
                      >
                        <img src={form.image} alt={form.name} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: RICH CONTENT & DETAILS */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Full Service Description</label>
                    <RichTextEditor
                      value={form.fullDesc}
                      onChange={(html) => updateForm({ fullDesc: html })}
                      token={token}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--vdt-font-heading)', fontSize: '1.05rem', color: '#17191C', marginBottom: '0.5rem' }}>
                      Included & Excluded
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      <div className="vdt-form-group">
                        <label className="vdt-form-label" style={{ color: '#065F46' }}>What's Included (1 per line)</label>
                        <textarea
                          className="vdt-form-textarea"
                          rows={4}
                          value={Array.isArray(form.included) ? form.included.join('\n') : form.included}
                          onChange={(e) => updateForm({ included: e.target.value.split('\n').filter(Boolean) })}
                        />
                      </div>
                      <div className="vdt-form-group">
                        <label className="vdt-form-label" style={{ color: '#991B1B' }}>What's Excluded (1 per line)</label>
                        <textarea
                          className="vdt-form-textarea"
                          rows={4}
                          value={Array.isArray(form.excluded) ? form.excluded.join('\n') : form.excluded}
                          onChange={(e) => updateForm({ excluded: e.target.value.split('\n').filter(Boolean) })}
                        />
                      </div>
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
                      placeholder="e.g. Vienna Airport Transfer | Private Mercedes-Benz Chauffeur"
                      value={form.seo.metaTitle}
                      onChange={(e) => updateSeo({ metaTitle: e.target.value })}
                    />
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Meta Description</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={3}
                      placeholder="Reliable, fixed-price private chauffeur transfers between Vienna Airport and city center..."
                      value={form.seo.metaDescription}
                      onChange={(e) => updateSeo({ metaDescription: e.target.value })}
                    />
                  </div>

                  {/* SERP Preview */}
                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C877E', fontWeight: 700, marginBottom: '0.65rem' }}>
                      Google Search Result Preview
                    </div>
                    <div style={{ padding: '1.25rem', backgroundColor: '#FFFFFF', border: '1px solid #E6D8C3', borderRadius: '8px', maxWidth: '650px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#202124', marginBottom: '0.2rem' }}>
                        https://viennadaytrip.com &rsaquo; {form.slug || 'services'}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.35rem' }}>
                        {form.seo.metaTitle || form.name || 'Executive Chauffeur Service | Vienna Day Trip'}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5 }}>
                        {form.seo.metaDescription || form.shortDesc || 'Discover private chauffeur transportation with Vienna Day Trip.'}
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
                          Visibility & Public Status
                        </h4>
                        <p style={{ color: '#62666D', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                          Publishing makes this service immediately visible in the public services cards and booking form.
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
                      Public Navigation Route
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <LinkIcon size={16} style={{ color: '#C69C50' }} />
                      <a
                        href={form.ctaUrl || `/${form.slug}/`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#C69C50', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none' }}
                      >
                        https://viennadaytrip.com{form.ctaUrl || `/${form.slug}/`}
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
                  <span>{saving && serviceStatus !== 'PUBLISHED' ? 'Saving Draft...' : 'Save as Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="vdt-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={14} />
                  <span>{saving ? 'Publishing...' : selectedService ? 'Update & Publish' : 'Publish Service'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
