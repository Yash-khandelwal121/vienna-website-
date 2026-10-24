import React, { useState, useEffect } from 'react';
import { Star, Save, RefreshCw, ExternalLink, CheckCircle } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function ReviewsManager() {
  const { token } = useAdminAuth();
  const [reviews, setReviews] = useState({
    googleMapsUrl: 'https://maps.app.goo.gl/vienna-day-trip',
    isVisible: true,
    maxReviews: 6,
    minRating: 4.5,
    reviewCount: 240,
    averageRating: 4.9
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/admin/reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.reviews) {
          setReviews(data.reviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/v1/admin/reviews', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reviews)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Google Reviews configuration saved successfully.');
      }
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Google Reviews Settings">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Google Business Reviews Integration</h1>
          <p className="vdt-page-sub">
            Configure the verified Google Business Profile link, rating badges, and review showcase.
          </p>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-card" style={{ maxWidth: '680px' }}>
        <form onSubmit={handleSave} className="vdt-form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="vdt-field-group">
            <label>Official Google Maps / Business Profile Link</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="url"
                value={reviews.googleMapsUrl}
                onChange={(e) => setReviews({ ...reviews, googleMapsUrl: e.target.value })}
                required
                className="vdt-input"
              />
              <a
                href={reviews.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="vdt-btn-secondary"
                style={{ padding: '0 0.85rem' }}
                title="Open Google Profile"
              >
                <ExternalLink size={15} />
              </a>
            </div>
            <span style={{ fontSize: '0.74rem', color: '#8C877E' }}>
              Customers clicking "Read Google Reviews" on the homepage will be directed here.
            </span>
          </div>

          <div className="vdt-field-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
            <input
              type="checkbox"
              id="show-reviews"
              checked={reviews.isVisible}
              onChange={(e) => setReviews({ ...reviews, isVisible: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#C69C50' }}
            />
            <label htmlFor="show-reviews" style={{ margin: 0, cursor: 'pointer' }}>
              Display Google Reviews Carousel on Website
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="vdt-field-group">
              <label>Average Rating Display</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={reviews.averageRating}
                onChange={(e) => setReviews({ ...reviews, averageRating: Number(e.target.value) })}
                className="vdt-input"
              />
            </div>
            <div className="vdt-field-group">
              <label>Total Verified Reviews Count</label>
              <input
                type="number"
                value={reviews.reviewCount}
                onChange={(e) => setReviews({ ...reviews, reviewCount: Number(e.target.value) })}
                className="vdt-input"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" disabled={saving} className="vdt-btn-primary">
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Review Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
