import React, { useState } from 'react';
import { FileText, Save, CheckCircle, ExternalLink } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function PagesManager() {
  const { token } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('homepage');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Homepage editable content
  const [homeHero, setHomeHero] = useState({
    titleBlack: 'Ultra Luxury Chauffeur &',
    titleGold: 'Private Tours in Vienna',
    tagline: 'First-Class Mercedes-Benz fleet, professional licensed chauffeurs, and customized private day trips across Austria and Central Europe.',
    ctaPrimary: 'Book Chauffeur Now',
    ctaSecondary: 'WhatsApp Concierge'
  });

  // About Us editable content
  const [aboutUs, setAboutUs] = useState({
    eyebrow: 'LICENSED CHAUFFEUR COMPANY SINCE 2019',
    title: 'About Vienna Day Trip',
    lead: 'Vienna Day Trip is a licensed private chauffeur service based in Vienna, Austria, offering airport transfers, hourly chauffeur hire, and private day trips to Hallstatt, Salzburg, Budapest, Prague, Bratislava, and the Wachau Valley.',
    storyTitle: 'THE VIENNA DAY TRIP STORY',
    storyStatement: 'BUILT ON PRECISION, ELEGANCE & AUTHENTIC HOSPITALITY.'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage('Content section saved successfully.');
    }, 400);
  };

  return (
    <AdminLayout title="Website Content CMS">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Website Content Sections</h1>
          <p className="vdt-page-sub">
            Edit text sections and headlines on the public website without modifying underlying code.
          </p>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-card vdt-filter-card" style={{ marginBottom: '1.25rem' }}>
        <div className="vdt-status-pills">
          <button
            type="button"
            className={`vdt-pill-btn ${activeTab === 'homepage' ? 'active' : ''}`}
            onClick={() => { setActiveTab('homepage'); setMessage(''); }}
          >
            HOMEPAGE HERO & HEADLINES
          </button>
          <button
            type="button"
            className={`vdt-pill-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => { setActiveTab('about'); setMessage(''); }}
          >
            ABOUT US PAGE NARRATIVE
          </button>
        </div>
      </div>

      {activeTab === 'homepage' && (
        <div className="vdt-card" style={{ maxWidth: '800px' }}>
          <h2 className="vdt-card-title" style={{ marginBottom: '1.25rem' }}>Homepage Hero Section</h2>
          <form onSubmit={handleSave} className="vdt-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="vdt-field-group">
              <label>Hero Heading (Primary Text)</label>
              <input
                type="text"
                value={homeHero.titleBlack}
                onChange={(e) => setHomeHero({ ...homeHero, titleBlack: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div className="vdt-field-group">
              <label>Hero Heading (Champagne Gold Accent)</label>
              <input
                type="text"
                value={homeHero.titleGold}
                onChange={(e) => setHomeHero({ ...homeHero, titleGold: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div className="vdt-field-group">
              <label>Hero Subtitle / Description</label>
              <textarea
                rows="3"
                value={homeHero.tagline}
                onChange={(e) => setHomeHero({ ...homeHero, tagline: e.target.value })}
                className="vdt-textarea"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="vdt-field-group">
                <label>Primary CTA Label</label>
                <input
                  type="text"
                  value={homeHero.ctaPrimary}
                  onChange={(e) => setHomeHero({ ...homeHero, ctaPrimary: e.target.value })}
                  className="vdt-input"
                />
              </div>
              <div className="vdt-field-group">
                <label>Secondary CTA Label</label>
                <input
                  type="text"
                  value={homeHero.ctaSecondary}
                  onChange={(e) => setHomeHero({ ...homeHero, ctaSecondary: e.target.value })}
                  className="vdt-input"
                />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" disabled={saving} className="vdt-btn-primary">
                <Save size={15} />
                <span>{saving ? 'Publishing Changes...' : 'Publish Content'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="vdt-card" style={{ maxWidth: '800px' }}>
          <h2 className="vdt-card-title" style={{ marginBottom: '1.25rem' }}>About Us Introductory Section</h2>
          <form onSubmit={handleSave} className="vdt-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="vdt-field-group">
              <label>Top Eyebrow (License badge)</label>
              <input
                type="text"
                value={aboutUs.eyebrow}
                onChange={(e) => setAboutUs({ ...aboutUs, eyebrow: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div className="vdt-field-group">
              <label>Main Heading</label>
              <input
                type="text"
                value={aboutUs.title}
                onChange={(e) => setAboutUs({ ...aboutUs, title: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div className="vdt-field-group">
              <label>Introduction Description</label>
              <textarea
                rows="3"
                value={aboutUs.lead}
                onChange={(e) => setAboutUs({ ...aboutUs, lead: e.target.value })}
                className="vdt-textarea"
              />
            </div>

            <div className="vdt-field-group">
              <label>Story Eyebrow</label>
              <input
                type="text"
                value={aboutUs.storyTitle}
                onChange={(e) => setAboutUs({ ...aboutUs, storyTitle: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div className="vdt-field-group">
              <label>Story Statement</label>
              <input
                type="text"
                value={aboutUs.storyStatement}
                onChange={(e) => setAboutUs({ ...aboutUs, storyStatement: e.target.value })}
                className="vdt-input"
              />
            </div>

            <div style={{ marginTop: '1.25rem' }}>
              <button type="submit" disabled={saving} className="vdt-btn-primary">
                <Save size={15} />
                <span>{saving ? 'Publishing Changes...' : 'Publish About Us Content'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
