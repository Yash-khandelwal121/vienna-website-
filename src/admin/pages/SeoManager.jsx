import React, { useState } from 'react';
import { Search, Save, CheckCircle, ExternalLink, Globe } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const SEO_ROUTES = [
  { path: '/', name: 'Homepage', title: 'Vienna Day Trip | Ultra-Luxury Chauffeur & Private Tours', desc: 'Licensed ultra-luxury private chauffeur service in Vienna, Austria. Airport transfers, hourly hire, and day trips to Hallstatt, Salzburg, Budapest, Prague & Wachau.' },
  { path: '/about-vienna-day-trip/', name: 'About Us', title: 'About Vienna Day Trip | Licensed Chauffeur Company Since 2019', desc: 'Discover Vienna Day Trip, a premier licensed chauffeur company founded in 2019. Built on precision, elegance, and authentic Austrian hospitality.' },
  { path: '/our-fleet/', name: 'Luxury Fleet', title: 'Mercedes-Benz Luxury Chauffeur Fleet | Vienna Day Trip', desc: 'Explore our flagship Mercedes-Benz fleet: S-Class First Class, E-Class Business, V-Class VIP Van, Sprinter Minibus, and certified Armored VR6/VR7.' },
  { path: '/our-services/', name: 'Services Overview', title: 'Executive Chauffeur Services | Vienna Day Trip', desc: 'Comprehensive luxury private transportation: Airport transfers, hourly chauffeur hire, private day trips, and high-security diplomatic convoys.' },
  { path: '/blog/', name: 'Travel Journal', title: 'The Vienna Travel Journal | Day Trip Guides & Insights', desc: 'Discover 129 comprehensive travel guides, itineraries, and expert insights for exploring Vienna, Hallstatt, Salzburg, Budapest, Prague, and Wachau.' },
  { path: '/contact-us-i/', name: 'Contact Us', title: 'Contact Vienna Day Trip | 24/7 VIP Chauffeur Concierge', desc: 'Contact our 24/7 private chauffeur concierge desk for bespoke travel itineraries, airport transfers, and tailored Central European day trips.' }
];

export default function SeoManager() {
  const [selectedRoute, setSelectedRoute] = useState(SEO_ROUTES[0]);
  const [title, setTitle] = useState(SEO_ROUTES[0].title);
  const [desc, setDesc] = useState(SEO_ROUTES[0].desc);
  const [canonical, setCanonical] = useState(`https://viennadaytrip.com${SEO_ROUTES[0].path}`);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSelectRoute = (r) => {
    setSelectedRoute(r);
    setTitle(r.title);
    setDesc(r.desc);
    setCanonical(`https://viennadaytrip.com${r.path}`);
    setMessage('');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage(`SEO Metadata for "${selectedRoute.name}" updated successfully.`);
    }, 400);
  };

  return (
    <AdminLayout title="SEO & Metadata">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Search Engine Optimization & Sitemap</h1>
          <p className="vdt-page-sub">
            Configure meta titles, descriptions, canonical URLs, and indexation controls across all public pages.
          </p>
        </div>
        <div className="vdt-header-actions">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="vdt-btn-secondary">
            <Globe size={14} />
            <span>Open sitemap.xml</span>
          </a>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 280px) 1fr', gap: '1.5rem' }}>
        {/* Route Selector List */}
        <div className="vdt-card" style={{ padding: '0.85rem' }}>
          <span className="vdt-nav-section-label">PAGE ROUTES</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '0.5rem' }}>
            {SEO_ROUTES.map((r) => (
              <button
                key={r.path}
                type="button"
                className={`vdt-nav-link ${selectedRoute.path === r.path ? 'active' : ''}`}
                onClick={() => handleSelectRoute(r)}
                style={{ textAlign: 'left', border: 'none', background: selectedRoute.path === r.path ? 'rgba(198, 156, 80, 0.15)' : 'none', color: selectedRoute.path === r.path ? '#17191C' : '#555' }}
              >
                <span>{r.name}</span>
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
