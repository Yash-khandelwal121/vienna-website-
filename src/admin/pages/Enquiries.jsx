import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Mail,
  Phone,
  MessageSquare,
  Edit,
  Save,
  X,
  RefreshCw,
  Archive
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Enquiries() {
  const { token } = useAdminAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/admin/enquiries?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleOpenDetails = (e) => {
    setSelectedEnquiry(e);
    setEditStatus(e.status);
    setInternalNotes(e.internalNotes || '');
    setMessage('');
  };

  const handleSaveStatus = async () => {
    if (!selectedEnquiry) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/v1/admin/enquiries/${selectedEnquiry.id}`, {
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
        setMessage('Enquiry status updated successfully.');
        setSelectedEnquiry(data.enquiry);
        fetchEnquiries();
      }
    } catch (err) {
      setMessage('Failed to update enquiry.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/v1/admin/enquiries/export/csv`, '_blank');
  };

  return (
    <AdminLayout title="Contact Enquiries">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Customer Enquiries</h1>
          <p className="vdt-page-sub">
            Inbound concierge contact messages, corporate requests, and custom day trip questions.
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleExportCsv} className="vdt-btn-secondary">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button type="button" onClick={fetchEnquiries} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="vdt-card vdt-filter-card">
        <form onSubmit={handleSearchSubmit} className="vdt-search-form">
          <div className="vdt-search-box">
            <Search size={16} className="vdt-search-icon" />
            <input
              type="text"
              placeholder="Search by reference, sender name, email, subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="vdt-btn-primary">Search</button>
        </form>

        <div className="vdt-status-pills">
          {['ALL', 'NEW', 'CONTACTED', 'FOLLOW_UP_REQUIRED', 'RESOLVED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`vdt-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="vdt-card" style={{ marginTop: '1.25rem' }}>
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Sender</th>
                <th>Subject & Message</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? (
                enquiries.map((e) => (
                  <tr key={e.id}>
                    <td className="vdt-ref-code">{e.reference}</td>
                    <td>
                      <div className="vdt-cell-name">{e.name}</div>
                      <div className="vdt-cell-sub">{e.email}</div>
                      {e.phone && <div className="vdt-cell-sub">{e.phone}</div>}
                    </td>
                    <td style={{ maxWidth: '320px' }}>
                      <div className="vdt-cell-subject">{e.subject}</div>
                      <div className="vdt-cell-sub vdt-cell-truncate">{e.message}</div>
                    </td>
                    <td>
                      <div className="vdt-cell-date">{new Date(e.createdAt).toLocaleDateString()}</div>
                      <div className="vdt-cell-sub">{new Date(e.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <span className={`vdt-badge vdt-badge-${e.status?.toLowerCase()}`}>
                        {e.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(e)}
                        className="vdt-action-btn"
                      >
                        <Edit size={14} />
                        <span>Respond</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="vdt-empty-state">
                    {loading ? 'Loading enquiries...' : 'No customer inquiries found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      {selectedEnquiry && (
        <div className="vdt-modal-overlay" onClick={() => setSelectedEnquiry(null)}>
          <div className="vdt-modal-card" onClick={(ev) => ev.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">CUSTOMER INQUIRY</span>
                <h3 className="vdt-modal-title">{selectedEnquiry.reference}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setSelectedEnquiry(null)}>
                <X size={20} />
              </button>
            </div>

            {message && <div className="vdt-modal-msg">{message}</div>}

            <div className="vdt-modal-body">
              <div className="vdt-detail-grid">
                <div>
                  <span className="vdt-detail-label">Sender Name</span>
                  <p className="vdt-detail-value">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <span className="vdt-detail-label">Email & Phone</span>
                  <p className="vdt-detail-value">{selectedEnquiry.email} • {selectedEnquiry.phone || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="vdt-detail-label">Subject</span>
                  <p className="vdt-detail-value" style={{ fontWeight: 600 }}>{selectedEnquiry.subject}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="vdt-detail-label">Message Content</span>
                  <p className="vdt-detail-value" style={{ whiteSpace: 'pre-wrap', background: '#FAF8F4', padding: '0.85rem', borderRadius: '6px', border: '1px solid #E6D8C3' }}>
                    {selectedEnquiry.message}
                  </p>
                </div>
              </div>

              {/* Status and Notes */}
              <div className="vdt-update-box">
                <div className="vdt-field-group">
                  <label htmlFor="enq-status">Inquiry Status</label>
                  <select
                    id="enq-status"
                    value={editStatus}
                    onChange={(ev) => setEditStatus(ev.target.value)}
                    className="vdt-select"
                  >
                    <option value="NEW">NEW (Unread / Needs review)</option>
                    <option value="CONTACTED">CONTACTED (Replied via email/WhatsApp)</option>
                    <option value="FOLLOW_UP_REQUIRED">FOLLOW UP REQUIRED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="vdt-field-group">
                  <label htmlFor="enq-notes">Internal Follow-Up Notes</label>
                  <textarea
                    id="enq-notes"
                    rows="3"
                    value={internalNotes}
                    onChange={(ev) => setInternalNotes(ev.target.value)}
                    placeholder="Add dispatch notes, quotation details, or phone log..."
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
                    <span>{saving ? 'Updating...' : 'Save Follow-Up'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vdt-cell-subject {
          font-weight: 600;
          color: #17191C;
        }
      `}</style>
    </AdminLayout>
  );
}
