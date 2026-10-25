import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Car,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  X,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Bookings() {
  const { token } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/admin/bookings?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleOpenDetails = (b) => {
    setSelectedBooking(b);
    setEditStatus(b.status);
    setInternalNotes(b.internalNotes || '');
    setMessage('');
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          internalNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Booking status and internal notes updated.');
        setSelectedBooking(data.booking);
        fetchBookings();
      }
    } catch (err) {
      setMessage('Failed to update booking.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/v1/admin/bookings/export/csv`, '_blank');
  };

  return (
    <AdminLayout title="Bookings & Itineraries">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Booking Management</h1>
          <p className="vdt-page-sub">
            Track, confirm, and manage private chauffeur bookings and customer day trips.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleExportCsv} className="vdt-btn-secondary">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button type="button" onClick={fetchBookings} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="vdt-card vdt-filter-card">
        <form onSubmit={handleSearchSubmit} className="vdt-search-form">
          <div className="vdt-search-box">
            <Search size={16} className="vdt-search-icon" />
            <input
              type="text"
              placeholder="Search by reference, passenger name, email, pickup/drop-off..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="vdt-btn-primary">Search</button>
        </form>

        <div className="vdt-status-pills">
          {['ALL', 'NEW', 'CONTACTED', 'QUOTATION_SENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`vdt-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="vdt-card" style={{ marginTop: '1.25rem' }}>
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Passenger</th>
                <th>Service & Vehicle</th>
                <th>Route (Pickup ➔ Dropoff)</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="vdt-ref-code">{b.reference}</td>
                    <td>
                      <div className="vdt-cell-name">{b.customerName}</div>
                      <div className="vdt-cell-sub">{b.email}</div>
                      <div className="vdt-cell-sub">{b.phone}</div>
                    </td>
                    <td>
                      <div className="vdt-cell-service">{b.serviceType}</div>
                      <div className="vdt-cell-sub">{b.preferredVehicle}</div>
                      <div className="vdt-cell-sub">{b.passengerCount} Passengers</div>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div className="vdt-cell-truncate" title={b.pickupLocation}>
                        <strong>From:</strong> {b.pickupLocation}
                      </div>
                      <div className="vdt-cell-truncate" title={b.dropoffLocation}>
                        <strong>To:</strong> {b.dropoffLocation}
                      </div>
                    </td>
                    <td>
                      <div className="vdt-cell-date">{b.pickupDate}</div>
                      <div className="vdt-cell-sub">{b.pickupTime}</div>
                    </td>
                    <td>
                      <span className={`vdt-badge vdt-badge-${b.status?.toLowerCase()}`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(b)}
                        className="vdt-action-btn"
                        title="View / Edit Booking"
                      >
                        <Edit size={14} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="vdt-empty-state">
                    {loading ? 'Loading bookings...' : 'No bookings found matching current criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details & Status Modal */}
      {selectedBooking && (
        <div className="vdt-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="vdt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">BOOKING DETAILS</span>
                <h3 className="vdt-modal-title">{selectedBooking.reference}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setSelectedBooking(null)}>
                <X size={20} />
              </button>
            </div>

            {message && <div className="vdt-modal-msg">{message}</div>}

            <div className="vdt-modal-body">
              <div className="vdt-detail-grid">
                <div>
                  <span className="vdt-detail-label">Passenger Name</span>
                  <p className="vdt-detail-value">{selectedBooking.customerName}</p>
                </div>
                <div>
                  <span className="vdt-detail-label">Contact Details</span>
                  <p className="vdt-detail-value">{selectedBooking.email} • {selectedBooking.phone}</p>
                </div>
                <div>
                  <span className="vdt-detail-label">Service & Vehicle</span>
                  <p className="vdt-detail-value">{selectedBooking.serviceType} ({selectedBooking.preferredVehicle})</p>
                </div>
                <div>
                  <span className="vdt-detail-label">Journey Date & Time</span>
                  <p className="vdt-detail-value">{selectedBooking.pickupDate} at {selectedBooking.pickupTime}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="vdt-detail-label">Pickup & Drop-off</span>
                  <p className="vdt-detail-value">{selectedBooking.pickupLocation} ➔ {selectedBooking.dropoffLocation}</p>
                </div>
                {selectedBooking.specialRequests && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="vdt-detail-label">Special Requests</span>
                    <p className="vdt-detail-value" style={{ fontStyle: 'italic' }}>
                      "{selectedBooking.specialRequests}"
                    </p>
                  </div>
                )}
              </div>

              {/* Status & Internal Notes Updater */}
              <div className="vdt-update-box">
                <div className="vdt-field-group">
                  <label htmlFor="modal-status">Change Booking Status</label>
                  <select
                    id="modal-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="vdt-select"
                  >
                    <option value="NEW">NEW (Awaiting review)</option>
                    <option value="CONTACTED">CONTACTED (Client contacted)</option>
                    <option value="QUOTATION_SENT">QUOTATION SENT (Pricing sent)</option>
                    <option value="CONFIRMED">CONFIRMED (Chauffeur booked)</option>
                    <option value="COMPLETED">COMPLETED (Journey finished)</option>
                    <option value="CANCELLED">CANCELLED (Cancelled by client)</option>
                  </select>
                </div>

                <div className="vdt-field-group">
                  <label htmlFor="modal-notes">Internal Concierge Notes (Visible to staff only)</label>
                  <textarea
                    id="modal-notes"
                    rows="3"
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Enter dispatch notes, assigned chauffeur, special flight numbers..."
                    className="vdt-textarea"
                  />
                </div>

                <div className="vdt-modal-actions">
                  <button
                    type="button"
                    onClick={handleSaveStatus}
                    disabled={saving}
                    className="vdt-btn-primary"
                  >
                    <Save size={15} />
                    <span>{saving ? 'Saving Changes...' : 'Save Updates'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
