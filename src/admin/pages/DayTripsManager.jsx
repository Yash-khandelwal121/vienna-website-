import React, { useState, useEffect } from 'react';
import {
  MapPin,
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
  Compass,
  ListPlus,
  Calendar
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import RichTextEditor from '../components/RichTextEditor';
import { CANONICAL_DAY_TRIP_IMAGES, sanitizeImageUrl } from '../../services/api';

const STEPS = [
  { id: 'basic', label: '1. Basic Information', icon: FileText },
  { id: 'image', label: '2. Featured Image & Gallery', icon: ImageIcon },
  { id: 'content', label: '3. Rich Itinerary & Details', icon: Compass },
  { id: 'seo', label: '4. SEO Settings & SERP', icon: Globe },
  { id: 'publish', label: '5. Publishing Workflow', icon: Sliders },
];

export default function DayTripsManager() {
  const { token } = useAdminAuth();
  const [dayTrips, setDayTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal & Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [tourStatus, setTourStatus] = useState('NEW');
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
    title: '',
    slug: '',
    eyebrow: 'PRIVATE LUXURY CHAUFFEUR',
    category: 'Alpine Landscapes',
    destination: '',
    duration: 'Full Day (10-12 Hours)',
    price: 'From €650',
    shortDesc: '',
    fullDesc: '',
    image: '/images/Hallstatt.jpg',
    imageAlt: '',
    imageCaption: '',
    gallery: [],
    highlights: [],
    itinerary: [],
    inclusions: [
      'Door-to-door hotel pickup & return in Vienna',
      'Private Mercedes-Benz luxury vehicle assignment',
      'Professional English & German-speaking chauffeur',
      'Chilled mineral water & onboard high-speed Wi-Fi',
      'All fuel, road tolls, and parking fees included'
    ],
    exclusions: [
      'Museum, funicular or castle entrance tickets',
      'Meals, snacks, and personal tasting expenses',
      'Licensed local city tour guide (available upon request)'
    ],
    departure: 'Vienna Hotel / Address',
    returnLocation: 'Vienna Hotel / Address',
    languages: 'English, German',
    displayOrder: 1,
    isFeatured: true,
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

  // Gallery input draft state
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  const currentStepIndex = STEPS.findIndex((s) => s.id === activeTab);

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
      setMessage({ type: 'error', text: 'Failed to load day trips from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayTrips();
  }, [token]);

  // Title / Name change handler
  const handleNameChange = (val) => {
    setIsDirty(true);
    setValidationError(null);
    const updated = {
      ...form,
      name: val,
      title: form.title && form.title !== `${form.name} from Vienna` ? form.title : `${val} from Vienna`
    };
    if (!selectedTour && !manualSlugEdit) {
      const generatedSlug = `${val}-day-trip-from-vienna`
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-');
      updated.slug = generatedSlug;
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
      title: '',
      slug: '',
      eyebrow: 'PRIVATE LUXURY CHAUFFEUR',
      category: 'Alpine Landscapes',
      destination: '',
      duration: 'Full Day (10-12 Hours)',
      price: 'From €650',
      shortDesc: '',
      fullDesc: '<p>Experience the picturesque alpine scenery and historic European landscapes with your personal chauffeur from Vienna...</p>',
      image: '/images/Hallstatt.jpg',
      imageAlt: '',
      imageCaption: '',
      gallery: [],
      highlights: [
        'Scenic drive through the Austrian countryside',
        'Flexible schedule tailored to your pace',
        'Door-to-door luxury transport'
      ],
      itinerary: [
        { time: '08:30 AM', title: 'Pickup in Vienna', desc: 'Door-to-door pickup from your hotel or preferred address in Vienna.' },
        { time: '11:30 AM', title: 'Arrival & Scenic Exploration', desc: 'Arrive at destination, free time for historic sights, photography, and lake walk.' },
        { time: '01:30 PM', title: 'Alpine Lunch & Local Gastronomy', desc: 'Enjoy authentic regional cuisine at a recommended lakeside restaurant.' },
        { time: '04:30 PM', title: 'Relaxed Return Journey', desc: 'Comfortable return ride through scenic mountain passes back to Vienna.' }
      ],
      inclusions: [
        'Door-to-door hotel pickup & return in Vienna',
        'Private Mercedes-Benz luxury vehicle assignment',
        'Professional English & German-speaking chauffeur',
        'Chilled mineral water & onboard high-speed Wi-Fi',
        'All fuel, road tolls, and parking fees included'
      ],
      exclusions: [
        'Museum, funicular or castle entrance tickets',
        'Meals, snacks, and personal tasting expenses',
        'Licensed local city tour guide (available upon request)'
      ],
      departure: 'Vienna Hotel / Address',
      returnLocation: 'Vienna Hotel / Address',
      languages: 'English, German',
      displayOrder: dayTrips.length + 1,
      isFeatured: true,
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
    setSelectedTour(null);
    setManualSlugEdit(false);
    setActiveTab('basic');
    setTourStatus('NEW');
    setSaving(false);
    setSaveError(null);
    setValidationError(null);
    setModalNotice(null);
    setIsDirty(false);
    setIsEditing(true);
  };

  const handleOpenEdit = (t) => {
    // Parse highlights/itinerary/gallery if stringified
    let hl = Array.isArray(t.highlights) ? t.highlights : [];
    if (typeof t.highlights === 'string') {
      try { hl = JSON.parse(t.highlights); } catch { hl = t.highlights.split('\n').filter(Boolean); }
    }

    let itin = Array.isArray(t.itinerary) ? t.itinerary : [];
    if (typeof t.itinerary === 'string') {
      try { itin = JSON.parse(t.itinerary); } catch { itin = []; }
    }

    let gal = Array.isArray(t.gallery) ? t.gallery : [];
    if (typeof t.gallery === 'string') {
      try { gal = JSON.parse(t.gallery); } catch { gal = []; }
    }

    let inc = Array.isArray(t.inclusions) ? t.inclusions : [];
    if (typeof t.inclusions === 'string') {
      try { inc = JSON.parse(t.inclusions); } catch { inc = []; }
    }

    let exc = Array.isArray(t.exclusions) ? t.exclusions : [];
    if (typeof t.exclusions === 'string') {
      try { exc = JSON.parse(t.exclusions); } catch { exc = []; }
    }

    setForm({
      id: t.id,
      name: t.name || '',
      title: t.title || `${t.name || ''} from Vienna`,
      slug: t.slug || '',
      eyebrow: t.eyebrow || 'PRIVATE LUXURY CHAUFFEUR',
      category: t.category || 'Alpine Landscapes',
      destination: t.destination || t.name || '',
      duration: t.duration || 'Full Day (10-12 Hours)',
      price: t.price || 'From €650',
      shortDesc: t.shortDesc || '',
      fullDesc: t.fullDesc || '',
      image: t.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      imageAlt: t.imageAlt || t.title || '',
      imageCaption: t.imageCaption || '',
      gallery: gal,
      highlights: hl,
      itinerary: itin,
      inclusions: inc.length > 0 ? inc : [
        'Door-to-door hotel pickup & return in Vienna',
        'Private Mercedes-Benz luxury vehicle assignment',
        'Professional English & German-speaking chauffeur'
      ],
      exclusions: exc.length > 0 ? exc : ['Entrance tickets & meals'],
      departure: t.departure || 'Vienna Hotel / Address',
      returnLocation: t.returnLocation || 'Vienna Hotel / Address',
      languages: t.languages || 'English, German',
      displayOrder: Number(t.displayOrder) || 1,
      isFeatured: t.isFeatured !== false,
      isPublished: t.isPublished !== false,
      seo: {
        metaTitle: t.seoTitle || t.seo?.metaTitle || t.title || '',
        metaDescription: t.seoDesc || t.seo?.metaDescription || t.shortDesc || '',
        focusKeyword: t.focusKeyword || t.seo?.focusKeyword || '',
        canonicalUrl: t.canonicalUrl || t.seo?.canonicalUrl || `https://viennadaytrip.com/${t.slug}/`,
        ogTitle: t.seo?.ogTitle || t.title || '',
        ogDescription: t.seo?.ogDescription || t.shortDesc || '',
        ogImage: t.seo?.ogImage || t.image || ''
      }
    });

    setSelectedTour(t);
    setManualSlugEdit(true);
    setActiveTab('basic');
    setTourStatus(t.isPublished !== false ? 'PUBLISHED' : 'DRAFT');
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
      if (!form.name.trim() || !form.title.trim()) {
        setValidationError('Please enter both Destination Name and Tour Title in Step 1.');
        return;
      }
      setActiveTab('image');
    } else if (activeTab === 'image') {
      if (!form.image.trim()) {
        setValidationError('Please specify or upload a Featured Cover Image in Step 2.');
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
      formData.append('category', 'daytrip_cover');
      formData.append('altText', form.imageAlt || form.title || file.name);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        updateForm({ image: data.asset.url, imageAlt: form.imageAlt || form.title });
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

  const handleAddGalleryItem = () => {
    if (!newGalleryUrl.trim()) return;
    const newItem = {
      url: newGalleryUrl.trim(),
      caption: newGalleryCaption.trim() || 'Tour Highlight',
      alt: newGalleryCaption.trim() || form.title
    };
    updateForm({ gallery: [...form.gallery, newItem] });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
  };

  const handleRemoveGalleryItem = (idx) => {
    const updated = form.gallery.filter((_, i) => i !== idx);
    updateForm({ gallery: updated });
  };

  const handleSave = async (publishStatus = null) => {
    if (saving) return;
    setValidationError(null);
    setSaveError(null);

    if (!form.name.trim() || !form.title.trim()) {
      setValidationError('Destination Name and Tour Title are required in Basic Information.');
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
        title: form.title.trim(),
        slug: cleanSlug,
        eyebrow: form.eyebrow ? form.eyebrow.trim() : 'PRIVATE LUXURY CHAUFFEUR',
        category: form.category || 'Alpine Landscapes',
        destination: form.destination || form.name.trim(),
        duration: form.duration || 'Full Day (10-12 Hours)',
        price: form.price || 'From €650',
        shortDesc: form.shortDesc || '',
        fullDesc: form.fullDesc || '',
        image: form.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        gallery: form.gallery || [],
        highlights: form.highlights || [],
        itinerary: form.itinerary || [],
        inclusions: form.inclusions || [],
        exclusions: form.exclusions || [],
        departure: form.departure || 'Vienna',
        returnLocation: form.returnLocation || 'Vienna',
        languages: form.languages || 'English, German',
        displayOrder: Number(form.displayOrder) || 1,
        isFeatured: Boolean(form.isFeatured),
        isPublished: isPub,
        seoTitle: form.seo.metaTitle || form.title,
        seoDesc: form.seo.metaDescription || form.shortDesc
      };

      const url = selectedTour ? `/api/v1/admin/day-trips/${selectedTour.id}` : '/api/v1/admin/day-trips';
      const method = selectedTour ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.tour) {
        setTourStatus(isPub ? 'PUBLISHED' : 'DRAFT');
        setSelectedTour(data.tour);
        setForm((prev) => ({
          ...prev,
          id: data.tour.id,
          slug: data.tour.slug,
          isPublished: isPub
        }));
        setIsDirty(false);
        setModalNotice({
          type: 'success',
          text: isPub ? 'Day Trip tour published successfully!' : 'Day Trip saved as draft successfully!'
        });
        setMessage({
          type: 'success',
          text: `Destination "${data.tour.name}" ${isPub ? 'published' : 'saved as draft'}.`
        });
        fetchDayTrips();
      } else {
        setTourStatus('ERROR');
        setSaveError(data.error || 'Failed to save day trip destination.');
        setModalNotice({ type: 'error', text: data.error || 'Failed to save day trip.' });
      }
    } catch (err) {
      setTourStatus('ERROR');
      setSaveError('Network error while saving day trip.');
      setModalNotice({ type: 'error', text: 'Network error while saving.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (tour) => {
    try {
      await fetch(`/api/v1/admin/day-trips/${tour.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPublished: !tour.isPublished })
      });
      fetchDayTrips();
    } catch (err) {
      console.error(err);
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

  const filteredTrips = dayTrips.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.slug?.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'PUBLISHED') return matchesSearch && t.isPublished;
    if (statusFilter === 'DRAFT') return matchesSearch && !t.isPublished;
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
    if (tourStatus === 'PUBLISHED') {
      return <span className="vdt-badge vdt-badge-confirmed">STATUS: PUBLISHED</span>;
    }
    if (tourStatus === 'DRAFT') {
      return <span className="vdt-badge vdt-badge-contacted">STATUS: DRAFT</span>;
    }
    return <span className="vdt-badge vdt-badge-unsaved">STATUS: NEW / UNSAVED</span>;
  };

  return (
    <AdminLayout>
      <div className="vdt-page-header">
        <div>
          <h2 className="vdt-page-title">Day Trips & Private Tours CMS</h2>
          <p className="vdt-page-sub">
            Author and publish bespoke European day trips, rich itineraries, galleries, and SEO configurations.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Create Destination</span>
          </button>
          <button type="button" onClick={fetchDayTrips} className="vdt-btn-secondary" disabled={loading}>
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
              placeholder="Search by destination name, tour title, or slug..."
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

      {/* Day Trips Grid */}
      <div className="vdt-card" style={{ marginTop: '1.25rem' }}>
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Cover Image</th>
                <th>Destination & Title</th>
                <th>Duration & Price</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.length > 0 ? (
                filteredTrips.map((t) => (
                  <tr key={t.id}>
                    <td style={{ width: '80px' }}>
                      <div className="vdt-blog-thumb-frame">
                        <img
                          src={sanitizeImageUrl(t.image, CANONICAL_DAY_TRIP_IMAGES[t.slug] || '/images/vienna-palace-backdrop.webp')}
                          alt={t.name}
                        />
                      </div>
                    </td>
                    <td style={{ maxWidth: '340px' }}>
                      <div className="vdt-blog-row-title">{t.title || t.name}</div>
                      <div className="vdt-blog-row-slug">/{t.slug}/</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--vdt-text-primary)' }}>{t.price}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--vdt-text-muted)' }}>{t.duration}</div>
                    </td>
                    <td>
                      <span className="vdt-badge vdt-badge-trans">{t.displayOrder || 1}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(t)}
                        className={`vdt-badge ${t.isPublished ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle Draft / Published"
                      >
                        {t.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`/${t.slug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="vdt-action-btn"
                          title="Preview public page"
                        >
                          <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(t)}
                          className="vdt-action-btn"
                          title="Edit tour"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(t.id)}
                          className="vdt-action-btn-danger"
                          title="Delete tour"
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
                    {loading ? 'Loading day trips...' : 'No day trips found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          FIVE-STEP DAY TRIPS EDITOR MODAL
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
                  {selectedTour ? `Edit: ${form.title || form.name}` : 'Create Private Day Trip Experience'}
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

            {/* Scrollable Modal Content */}
            <div className="vdt-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.75rem' }}>
              {/* TAB 1: BASIC INFORMATION */}
              {activeTab === 'basic' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Destination Name *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Hallstatt"
                        value={form.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Tour Title *</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Hallstatt Day Trip from Vienna"
                        value={form.title}
                        onChange={(e) => updateForm({ title: e.target.value })}
                      />
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
                        {manualSlugEdit ? 'Lock Slug Auto-Gen' : 'Edit Slug Manually'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#8C877E', fontSize: '0.86rem' }}>https://viennadaytrip.com/</span>
                      <input
                        type="text"
                        className="vdt-form-input"
                        value={form.slug}
                        readOnly={!manualSlugEdit}
                        onChange={(e) => updateForm({ slug: e.target.value })}
                        style={{ flex: 1 }}
                      />
                      <span style={{ color: '#8C877E', fontSize: '0.86rem' }}>/</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Category</label>
                      <select
                        className="vdt-form-select"
                        value={form.category}
                        onChange={(e) => updateForm({ category: e.target.value })}
                      >
                        <option value="Alpine Landscapes">Alpine Landscapes</option>
                        <option value="Imperial Heritage">Imperial Heritage</option>
                        <option value="Wine Country">Wine Country</option>
                        <option value="Cross-Border Grand Tours">Cross-Border Grand Tours</option>
                        <option value="Lakeside Villages">Lakeside Villages</option>
                      </select>
                    </div>

                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Duration</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Full Day (10-12 Hours)"
                        value={form.duration}
                        onChange={(e) => updateForm({ duration: e.target.value })}
                      />
                    </div>

                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Starting Price</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. From €650"
                        value={form.price}
                        onChange={(e) => updateForm({ price: e.target.value })}
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
                    <label className="vdt-form-label">Short Description (for cards and previews)</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={3}
                      placeholder="Concise overview highlighting Dachstein peaks, lake vistas, and chauffeur perks..."
                      value={form.shortDesc}
                      onChange={(e) => updateForm({ shortDesc: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Departure & Return Point</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="Vienna Door-to-Door Pickup"
                        value={form.departure}
                        onChange={(e) => updateForm({ departure: e.target.value, returnLocation: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Available Chauffeur Languages</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="English, German"
                        value={form.languages}
                        onChange={(e) => updateForm({ languages: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FEATURED IMAGE & GALLERY */}
              {activeTab === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Cover / Hero Image *</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="Enter direct image URL..."
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
                          border: '1px solid #E6D8C3',
                          backgroundColor: '#0E1013'
                        }}
                      >
                        <img src={form.image} alt={form.title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  {/* Gallery Management */}
                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--vdt-font-heading)', fontSize: '1.05rem', color: '#17191C', marginBottom: '0.75rem' }}>
                      Tour Photo Gallery
                    </h4>
                    <p style={{ color: '#62666D', fontSize: '0.85rem', marginBottom: '1rem' }}>
                      Add secondary vista photographs to be showcased in the destination gallery and carousel.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="Image URL (e.g. https://...)"
                        value={newGalleryUrl}
                        onChange={(e) => setNewGalleryUrl(e.target.value)}
                        style={{ flex: 2, minWidth: '220px' }}
                      />
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="Caption (e.g. Hallstatt Skywalk View)"
                        value={newGalleryCaption}
                        onChange={(e) => setNewGalleryCaption(e.target.value)}
                        style={{ flex: 1, minWidth: '160px' }}
                      />
                      <button type="button" onClick={handleAddGalleryItem} className="vdt-btn-primary">
                        <Plus size={14} />
                        <span>Add Photo</span>
                      </button>
                    </div>

                    {form.gallery.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                        {form.gallery.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: '1px solid #E6D8C3',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            <img src={item.url || item} alt={item.caption || 'Gallery'} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                            <div style={{ padding: '0.45rem', fontSize: '0.76rem', color: '#62666D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.caption || `Photo ${idx + 1}`}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryItem(idx)}
                              style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'rgba(239, 68, 68, 0.9)',
                                color: '#FFF',
                                border: 'none',
                                borderRadius: '50%',
                                width: '22px',
                                height: '22px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: RICH CONTENT & ITINERARY */}
              {activeTab === 'content' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Tour Overview & Detailed Narrative</label>
                    <RichTextEditor
                      value={form.fullDesc}
                      onChange={(html) => updateForm({ fullDesc: html })}
                      token={token}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <h4 style={{ fontFamily: 'var(--vdt-font-heading)', fontSize: '1.05rem', color: '#17191C', marginBottom: '0.5rem' }}>
                      Included & Excluded Services
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                      <div className="vdt-form-group">
                        <label className="vdt-form-label" style={{ color: '#065F46' }}>What's Included (1 per line)</label>
                        <textarea
                          className="vdt-form-textarea"
                          rows={5}
                          value={Array.isArray(form.inclusions) ? form.inclusions.join('\n') : form.inclusions}
                          onChange={(e) => updateForm({ inclusions: e.target.value.split('\n').filter(Boolean) })}
                        />
                      </div>
                      <div className="vdt-form-group">
                        <label className="vdt-form-label" style={{ color: '#991B1B' }}>What's Excluded (1 per line)</label>
                        <textarea
                          className="vdt-form-textarea"
                          rows={5}
                          value={Array.isArray(form.exclusions) ? form.exclusions.join('\n') : form.exclusions}
                          onChange={(e) => updateForm({ exclusions: e.target.value.split('\n').filter(Boolean) })}
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
                      placeholder="e.g. Hallstatt Private Day Trip from Vienna | Luxury Chauffeur"
                      value={form.seo.metaTitle}
                      onChange={(e) => updateSeo({ metaTitle: e.target.value })}
                    />
                  </div>

                  <div className="vdt-form-group">
                    <label className="vdt-form-label">Meta Description</label>
                    <textarea
                      className="vdt-form-textarea"
                      rows={3}
                      placeholder="Private day trip to Hallstatt with personal chauffeur. Mercedes-Benz comfort, door-to-door pickup, scenic Dachstein alpine vistas..."
                      value={form.seo.metaDescription}
                      onChange={(e) => updateSeo({ metaDescription: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Focus Keyword</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="e.g. Hallstatt day trip from Vienna"
                        value={form.seo.focusKeyword}
                        onChange={(e) => updateSeo({ focusKeyword: e.target.value })}
                      />
                    </div>
                    <div className="vdt-form-group">
                      <label className="vdt-form-label">Canonical URL</label>
                      <input
                        type="text"
                        className="vdt-form-input"
                        placeholder="https://viennadaytrip.com/hallstatt-day-trip-from-vienna/"
                        value={form.seo.canonicalUrl}
                        onChange={(e) => updateSeo({ canonicalUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Google SERP Live Preview */}
                  <div style={{ borderTop: '1px solid #E6D8C3', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C877E', fontWeight: 700, marginBottom: '0.65rem' }}>
                      Google Search Result Snippet Preview
                    </div>
                    <div
                      style={{
                        padding: '1.25rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E6D8C3',
                        borderRadius: '8px',
                        maxWidth: '650px'
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', color: '#202124', marginBottom: '0.2rem' }}>
                        https://viennadaytrip.com &rsaquo; {form.slug || 'day-trip'}
                      </div>
                      <div style={{ fontSize: '1.2rem', color: '#1a0dab', fontWeight: 500, lineHeight: 1.3, marginBottom: '0.35rem', cursor: 'pointer' }}>
                        {form.seo.metaTitle || form.title || 'Day Trip from Vienna | Vienna Day Trip'}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#4d5156', lineHeight: 1.5 }}>
                        {form.seo.metaDescription || form.shortDesc || 'Discover the best private day trips from Vienna with professional Mercedes-Benz chauffeur service.'}
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
                          Visibility & Public Deployment
                        </h4>
                        <p style={{ color: '#62666D', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                          Control whether this tour destination is immediately accessible to the public and featured in the Day Trips section.
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F0EAE1', paddingTop: '1rem' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: '#17191C', fontSize: '0.92rem' }}>Featured Destination</span>
                        <p style={{ color: '#62666D', fontSize: '0.82rem', margin: '0.2rem 0 0' }}>
                          Showcase in the signature destination carousel on the homepage.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => updateForm({ isFeatured: e.target.checked })}
                        style={{ width: '18px', height: '18px', accentColor: '#C69C50', cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Summary & Live Public Link */}
                  <div
                    style={{
                      padding: '1.25rem',
                      backgroundColor: '#FAF8F4',
                      borderRadius: '8px',
                      border: '1px solid #E6D8C3'
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', color: '#8C877E', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem' }}>
                      Live Destination Route
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <LinkIcon size={16} style={{ color: '#C69C50' }} />
                      <a
                        href={`/${form.slug}/`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#C69C50', fontWeight: 600, fontSize: '0.92rem', textDecoration: 'none' }}
                      >
                        https://viennadaytrip.com/{form.slug}/
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
                  <span>{saving && tourStatus !== 'PUBLISHED' ? 'Saving Draft...' : 'Save as Draft'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="vdt-btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Sparkles size={14} />
                  <span>{saving ? 'Publishing...' : selectedTour ? 'Update & Publish' : 'Publish Destination'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
