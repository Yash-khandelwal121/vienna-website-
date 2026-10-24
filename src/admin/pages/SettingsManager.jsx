import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function SettingsManager() {
  const { token } = useAdminAuth();
  const [settings, setSettings] = useState({
    businessName: 'Vienna Day Trip',
    contactEmail: 'info@viennadaytrip.com',
    phone: '+43 664 203 5445',
    whatsappNumber: '+43 664 203 5445',
    address: 'Vienna, Austria',
    logo: '/images/logo2.png',
    favicon: '/favicon.png',
    mapsUrl: 'https://maps.google.com/?q=Vienna+Day+Trip',
    defaultLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/v1/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Website business settings saved successfully.');
      } else {
        setMessage(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Website Settings">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Company & Contact Configuration</h1>
          <p className="vdt-page-sub">
            Update official company details, dispatch phone, WhatsApp concierge number and address.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={fetchSettings} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-card" style={{ maxWidth: '780px' }}>
        <form onSubmit={handleSave} className="vdt-form-grid">
          <div className="vdt-field-group">
            <label>Business Name</label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
              required
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group">
            <label>Primary Contact Email</label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group">
            <label>Dispatch Phone Number</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              required
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group">
            <label>WhatsApp Concierge Number</label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
              required
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group" style={{ gridColumn: 'span 2' }}>
            <label>Registered Business Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              required
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group">
            <label>Official Logo Path</label>
            <input
              type="text"
              value={settings.logo}
              onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
              className="vdt-input"
            />
          </div>

          <div className="vdt-field-group">
            <label>Favicon Path</label>
            <input
              type="text"
              value={settings.favicon}
              onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
              className="vdt-input"
            />
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '1.25rem' }}>
            <button type="submit" disabled={saving} className="vdt-btn-primary">
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* =========================================================================
          SANITY CMS CLOUD INTEGRATION CARD
          ========================================================================= */}
      <div className="vdt-card" style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #F0EEE9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#F8F4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C69C50', fontWeight: 'bold' }}>
              ☁️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: '#17191C' }}>
                Sanity CMS Cloud Integration
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#707070' }}>
                Headless content infrastructure configured for Vienna Day Trip
              </p>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#EBF7EE', color: '#1E7E34' }}>
            <CheckCircle size={12} /> Active Connection
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', backgroundColor: '#FAF8F4', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
            <div style={{ fontSize: '0.75rem', color: '#707070', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project ID</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#17191C', marginTop: '0.2rem' }}>lwp5b4fm</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#FAF8F4', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
            <div style={{ fontSize: '0.75rem', color: '#707070', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dataset</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#17191C', marginTop: '0.2rem' }}>production</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#FAF8F4', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
            <div style={{ fontSize: '0.75rem', color: '#707070', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Embedded Studio</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#C69C50', marginTop: '0.2rem' }}>/studio</div>
          </div>
          <div style={{ padding: '0.85rem', backgroundColor: '#FAF8F4', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
            <div style={{ fontSize: '0.75rem', color: '#707070', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prepared NDJSON</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#17191C', marginTop: '0.2rem' }}>157 Documents</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <a
            href="/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="vdt-btn-primary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <span>Launch Sanity Studio</span>
            <span style={{ fontSize: '0.8rem' }}>↗</span>
          </a>
          <a
            href="https://www.sanity.io/manage/project/lwp5b4fm/api"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.55rem 1rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E6D8C3',
              borderRadius: '6px',
              color: '#17191C',
              fontSize: '0.825rem',
              fontWeight: 500,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>Sanity Cloud Console (CORS & Tokens)</span>
            <span style={{ fontSize: '0.8rem' }}>↗</span>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
