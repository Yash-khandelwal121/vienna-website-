import React, { useState, useEffect } from 'react';
import { Search, Save, CheckCircle, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cleanAndValidateJson } from '../../utils/schemaInjector';
import { clearSeoCache } from '../../services/api';

const DEFAULT_SEO_ROUTES = [
  { path: '/', name: 'Homepage', title: 'Vienna Private Chauffeur, Transfers & Day Trips', desc: 'Private chauffeur service in Vienna since 2019; airport transfers, hourly hire and day trips to Hallstatt, Salzburg and Budapest in Mercedes cars.', canonical: 'https://viennadaytrip.com/', schemaMarkup: '' },
  { path: '/about-vienna-day-trip/', name: 'About Us', title: 'About Vienna Day Trip | Licensed Chauffeur Company Since 2019', desc: 'Discover Vienna Day Trip, a premier licensed chauffeur company founded in 2019. Built on precision, elegance, and authentic Austrian hospitality.', canonical: 'https://viennadaytrip.com/about-vienna-day-trip/', schemaMarkup: '' },
  { path: '/our-fleet/', name: 'Luxury Fleet', title: 'Mercedes-Benz Luxury Chauffeur Fleet | Vienna Day Trip', desc: 'Explore our flagship Mercedes-Benz fleet: S-Class First Class, E-Class Business, V-Class VIP Van, Sprinter Minibus, and certified Armored VR6/VR7.', canonical: 'https://viennadaytrip.com/our-fleet/', schemaMarkup: '' },
  { path: '/our-services/', name: 'Services Overview', title: 'Executive Chauffeur Services | Vienna Day Trip', desc: 'Comprehensive luxury private transportation: Airport transfers, hourly chauffeur hire, private day trips, and high-security diplomatic convoys.', canonical: 'https://viennadaytrip.com/our-services/', schemaMarkup: '' },
  { path: '/blog/', name: 'Travel Journal', title: 'The Vienna Travel Journal | Day Trip Guides & Insights', desc: 'Discover 129 comprehensive travel guides, itineraries, and expert insights for exploring Vienna, Hallstatt, Salzburg, Budapest, Prague, and Wachau.', canonical: 'https://viennadaytrip.com/blog/', schemaMarkup: '' },
  { path: '/contact-us-i/', name: 'Contact Us', title: 'Contact Vienna Day Trip | 24/7 VIP Chauffeur Concierge', desc: 'Contact our 24/7 private chauffeur concierge desk for bespoke travel itineraries, airport transfers, and tailored Central European day trips.', canonical: 'https://viennadaytrip.com/contact-us-i/', schemaMarkup: '' },
  { path: '/b2b-solution/', name: 'B2B Solutions', title: 'B2B & Corporate Chauffeur Solutions Vienna | Vienna Day Trip', desc: 'Executive corporate chauffeur services, diplomatic delegations, VIP roadshows, and business event transportation in Vienna.', canonical: 'https://viennadaytrip.com/b2b-solution/', schemaMarkup: '' },
  { path: '/day-trips/', name: 'Day Trips & Tours', title: 'Luxury Private Day Trips & Tours from Vienna | Vienna Day Trip', desc: 'Bespoke private day trips from Vienna to Hallstatt, Salzburg, Budapest, Prague, and Wachau Valley in luxury Mercedes-Benz vehicles.', canonical: 'https://viennadaytrip.com/day-trips/', schemaMarkup: '' },
  { path: '/privacy-policy/', name: 'Privacy Policy', title: 'Privacy Policy | Vienna Day Trip', desc: 'Privacy policy and data protection terms for Vienna Day Trip chauffeur services in accordance with GDPR regulations.', canonical: 'https://viennadaytrip.com/privacy-policy/', schemaMarkup: '' },
  { path: '/cancellation-refund-policy/', name: 'Cancellation & Refund Policy', title: 'Cancellation & Refund Policy | Vienna Day Trip', desc: 'Transparent cancellation and refund terms for private chauffeur bookings and day trips with Vienna Day Trip.', canonical: 'https://viennadaytrip.com/cancellation-refund-policy/', schemaMarkup: '' },
  { path: '/imprint/', name: 'Imprint / Impressum', title: 'Imprint & Legal Notice | Vienna Day Trip', desc: 'Legal notice, licensing details, and company information for Vienna Day Trip private chauffeur services.', canonical: 'https://viennadaytrip.com/imprint/', schemaMarkup: '' }
];

export default function SeoManager() {
  const { token } = useAdminAuth();
  const [routes, setRoutes] = useState(DEFAULT_SEO_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState(DEFAULT_SEO_ROUTES[0]);
  const [title, setTitle] = useState(DEFAULT_SEO_ROUTES[0].title);
  const [desc, setDesc] = useState(DEFAULT_SEO_ROUTES[0].desc);
  const [canonical, setCanonical] = useState(DEFAULT_SEO_ROUTES[0].canonical);
  const [schemaJson, setSchemaJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationError, setValidationError] = useState('');

  // Fetch persistent SEO records from backend on mount
  const fetchSeoRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/seo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.records)) {
        const merged = DEFAULT_SEO_ROUTES.map((def) => {
          const found = data.records.find((r) => r.routePath === def.path || r.routePath === def.path.replace(/\/$/, ''));
          const sMarkup = found?.schemaMarkup ? (typeof found.schemaMarkup === 'string' ? found.schemaMarkup : JSON.stringify(found.schemaMarkup, null, 2)) : '';
          return {
            ...def,
            title: found?.metaTitle || def.title,
            desc: found?.metaDescription || def.desc,
            canonical: found?.canonicalUrl || def.canonical,
            schemaMarkup: sMarkup
          };
        });
        setRoutes(merged);

        // Update active selection with fresh database record
        const activeMatch = merged.find((r) => r.path === selectedRoute.path) || merged[0];
        setSelectedRoute(activeMatch);
        setTitle(activeMatch.title);
        setDesc(activeMatch.desc);
        setCanonical(activeMatch.canonical);
        setSchemaJson(activeMatch.schemaMarkup || '');
      }
    } catch (err) {
      console.warn('[SeoManager] Could not fetch remote SEO records, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoRecords();
  }, [token]);

  const handleSelectRoute = (r) => {
    setSelectedRoute(r);
    setTitle(r.title);
    setDesc(r.desc);
    setCanonical(r.canonical || `https://viennadaytrip.com${r.path}`);
    setSchemaJson(r.schemaMarkup || '');
    setMessage({ type: '', text: '' });
    setValidationError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setValidationError('');
    setMessage({ type: '', text: '' });

    // Validate JSON-LD if provided
    let cleanedSchema = schemaJson;
    if (schemaJson && schemaJson.trim()) {
      const validation = cleanAndValidateJson(schemaJson);
      if (!validation.valid) {
        setValidationError(`Custom Schema Markup is not valid JSON: ${validation.error}. Please correct it before saving.`);
        return;
      }
      cleanedSchema = validation.jsonString;
    } else {
      // Requirement: "Preserve existing schema when the new field is empty; do not erase it automatically."
      cleanedSchema = selectedRoute.schemaMarkup || '';
    }

    try {
      setSaving(true);
      const res = await fetch('/api/v1/admin/seo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          routePath: selectedRoute.path,
          metaTitle: title.trim(),
          metaDescription: desc.trim(),
          canonicalUrl: canonical.trim(),
          schemaMarkup: schemaJson.trim() ? cleanedSchema : (selectedRoute.schemaMarkup || null)
        })
      });

      const data = await res.json();
      if (data.success && data.record) {
        const savedSchema = data.record.schemaMarkup || cleanedSchema;
        const updatedRoutes = routes.map((r) => {
          if (r.path === selectedRoute.path) {
            return {
              ...r,
              title: data.record.metaTitle || title,
              desc: data.record.metaDescription || desc,
              canonical: data.record.canonicalUrl || canonical,
              schemaMarkup: savedSchema
            };
          }
          return r;
        });

        setRoutes(updatedRoutes);
        setSelectedRoute((prev) => ({
          ...prev,
          title: data.record.metaTitle || title,
          desc: data.record.metaDescription || desc,
          canonical: data.record.canonicalUrl || canonical,
          schemaMarkup: savedSchema
        }));
        setSchemaJson(savedSchema || '');
        clearSeoCache();
        setMessage({
          type: 'success',
          text: `SEO Metadata and Custom Schema for "${selectedRoute.name}" updated successfully.`
        });
      } else {
        setValidationError(data.error || 'Failed to save SEO settings.');
      }
    } catch (err) {
      setValidationError('Network error while saving SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="SEO & Metadata">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Search Engine Optimization & Sitemap</h1>
          <p className="vdt-page-sub">
            Configure meta titles, descriptions, canonical URLs, and custom JSON-LD schema markup across all public pages.
          </p>
        </div>
        <div className="vdt-header-actions">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="vdt-btn-secondary">
            <Globe size={14} />
            <span>Open sitemap.xml</span>
          </a>
        </div>
      </div>

      {message.text && (
        <div className={message.type === 'success' ? 'vdt-banner-info' : 'vdt-banner-error'} style={{ marginBottom: '1.25rem' }}>
          {message.text}
        </div>
      )}

      {validationError && (
        <div className="vdt-banner-error" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{validationError}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.5rem' }}>
        {/* Route Selector List */}
        <div className="vdt-card" style={{ padding: '0.85rem' }}>
          <span className="vdt-nav-section-label">PAGE ROUTES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.5rem' }}>
            {routes.map((r) => (
              <button
                key={r.path}
                type="button"
                className={`vdt-nav-link ${selectedRoute.path === r.path ? 'active' : ''}`}
                onClick={() => handleSelectRoute(r)}
                style={{
                  textAlign: 'left',
                  border: 'none',
                  background: selectedRoute.path === r.path ? 'rgba(198, 156, 80, 0.15)' : 'none',
                  color: selectedRoute.path === r.path ? '#17191C' : '#555',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{r.name}</span>
                {r.schemaMarkup && (
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#E0F2FE', color: '#0369A1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                    JSON-LD
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SEO Editor Form */}
        <div className="vdt-card">
          <div className="vdt-card-header">
            <div>
              <h2 className="vdt-card-title">Editing SEO for: {selectedRoute.name}</h2>
              <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#8C877E' }}>{selectedRoute.path}</span>
            </div>
            {selectedRoute.schemaMarkup && (
              <span style={{ fontSize: '0.75rem', backgroundColor: '#ECFDF5', color: '#047857', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                Custom Schema Active
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="vdt-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="vdt-field-group">
              <label>Meta Title ({title.length} characters)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="vdt-input"
              />
              <span style={{ fontSize: '0.72rem', color: title.length > 60 ? '#D97706' : '#10B981' }}>
                Recommended length: 50–60 characters.
              </span>
            </div>

            <div className="vdt-field-group">
              <label>Meta Description ({desc.length} characters)</label>
              <textarea
                rows="3"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                className="vdt-textarea"
              />
              <span style={{ fontSize: '0.72rem', color: desc.length > 160 ? '#D97706' : '#10B981' }}>
                Recommended length: 140–160 characters.
              </span>
            </div>

            <div className="vdt-field-group">
              <label>Canonical URL</label>
              <input
                type="url"
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                required
                className="vdt-input"
              />
            </div>

            {/* Custom JSON-LD Schema Markup (Structured Data) */}
            <div className="vdt-field-group">
              <label style={{ fontWeight: 700 }}>Custom JSON-LD Schema Markup (Structured Data)</label>
              <textarea
                rows="8"
                value={schemaJson}
                onChange={(e) => setSchemaJson(e.target.value)}
                placeholder={`{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${title || 'Vienna Day Trip'}",
  "description": "${desc || 'Licensed ultra-luxury private chauffeur service in Vienna.'}",
  "url": "${canonical || 'https://viennadaytrip.com/'}"
}`}
                className="vdt-textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.4' }}
              />
              <small style={{ color: '#8E929B', marginTop: '4px', display: 'block' }}>
                Paste custom JSON-LD structured data. Validated before saving. Leave blank to preserve existing schema.
              </small>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" disabled={saving} className="vdt-btn-primary">
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save Meta Settings'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
