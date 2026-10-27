import React, { useState } from 'react';
import { Globe, Save, CheckCircle, Search, Edit } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', completeness: 100, status: 'PUBLISHED' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇦🇹', completeness: 95, status: 'PUBLISHED' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷', completeness: 90, status: 'PUBLISHED' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹', completeness: 90, status: 'PUBLISHED' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸', completeness: 90, status: 'PUBLISHED' },
  { code: 'zh', name: 'Chinese (简体中文)', flag: '🇨🇳', completeness: 85, status: 'PUBLISHED' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇦🇪', completeness: 95, status: 'PUBLISHED' }
];

export default function TranslationsManager() {
  const [selectedLang, setSelectedLang] = useState('de');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  // Common UI translation tokens
  const [translations, setTranslations] = useState({
    nav_home: 'Startseite',
    nav_services: 'Dienstleistungen',
    nav_daytrips: 'Tagesausflüge',
    nav_fleet: 'Luxusflotte',
    nav_about: 'Über uns',
    nav_blog: 'Reisejournal',
    nav_contact: 'Kontakt',
    btn_book_now: 'JETZT BUCHEN',
    hero_title: 'Erstklassiger Chauffeurservice in Wien',
    hero_subtitle: 'Erleben Sie maßgeschneiderte Tagesausflüge und Flughafentransfers auf höchstem Niveau.'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage(`Translations for ${LANGUAGES.find(l => l.code === selectedLang)?.name} saved successfully.`);
    }, 400);
  };

  return (
    <AdminLayout title="Multilingual CMS">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Multilingual Translations (7 Languages)</h1>
          <p className="vdt-page-sub">
            Manage navigation, buttons, service descriptions, and localized content across all 7 supported languages.
          </p>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      {/* Language Tabs */}
      <div className="vdt-lang-grid" style={{ marginBottom: '1.5rem' }}>
        {LANGUAGES.map((l) => (
          <div
            key={l.code}
            className={`vdt-card vdt-lang-card ${selectedLang === l.code ? 'active' : ''}`}
            onClick={() => { setSelectedLang(l.code); setMessage(''); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '1.4rem' }}>{l.flag}</span>
              <span className="vdt-badge vdt-badge-confirmed">{l.status}</span>
            </div>
            <div style={{ marginTop: '0.65rem' }}>
              <h3 className="vdt-lang-name">{l.name}</h3>
              <div className="vdt-completeness-bar">
                <div className="vdt-completeness-fill" style={{ width: `${l.completeness}%` }} />
              </div>
              <span className="vdt-completeness-text">{l.completeness}% Complete</span>
            </div>
          </div>
        ))}
      </div>

      {/* Translations Editor */}
      <div className="vdt-card" style={{ maxWidth: '820px' }}>
        <div className="vdt-card-header">
          <h2 className="vdt-card-title">
            Key UI Terms: {LANGUAGES.find(l => l.code === selectedLang)?.name}
          </h2>
        </div>

        <form onSubmit={handleSave} className="vdt-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          {Object.entries(translations).map(([key, val]) => (
            <div key={key} className="vdt-field-group">
              <label style={{ fontFamily: 'monospace', color: '#C69C50' }}>{key}</label>
              <input
                type="text"
                value={val}
                onChange={(e) => setTranslations({ ...translations, [key]: e.target.value })}
                className="vdt-input"
              />
            </div>
          ))}

          <div style={{ marginTop: '1.25rem' }}>
            <button type="submit" disabled={saving} className="vdt-btn-primary">
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Translations'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
