import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  MessageSquare,
  Clock,
  CheckCircle2,
  BookOpen,
  Car,
  ArrowRight,
  Plus,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import KpiCard from '../components/KpiCard';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function Dashboard() {
  const { token } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/v1/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setError(json.error || 'Failed to load metrics.');
      }
    } catch (err) {
      setError('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const stats = data?.stats || {
    totalBookings: 0,
    newEnquiries: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    publishedBlogs: 0,
    activeVehicles: 0
  };

  return (
    <AdminLayout title="Overview & Performance">
      <div className="vdt-dash-header">
        <div>
          <h1 className="vdt-page-title">Chauffeur Operations Dashboard</h1>
          <p className="vdt-page-sub">
            Real-time fleet bookings, customer inquiries, and published luxury content metrics.
          </p>
        </div>
        <div className="vdt-dash-actions">
          <button type="button" onClick={fetchDashboard} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh Data</span>
          </button>
          <Link to="/admin/bookings" className="vdt-btn-primary">
            <Plus size={15} />
            <span>Manage Bookings</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="vdt-banner-error">
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 
        =======================================================================
        1. SIX MANDATORY KPI CARDS (Real Database Statistics)
        =======================================================================
      */}
      <div className="vdt-kpi-grid">
        <KpiCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="All-time recorded customer itineraries"
          icon={CalendarCheck}
          color="#C69C50"
        />
        <KpiCard
          title="New Enquiries"
          value={stats.newEnquiries}
          subtitle="Awaiting concierge response"
          icon={MessageSquare}
          color="#3B82F6"
        />
        <KpiCard
          title="Pending Bookings"
          value={stats.pendingBookings}
          subtitle="New or in quotation phase"
          icon={Clock}
          color="#F59E0B"
        />
        <KpiCard
          title="Confirmed Bookings"
          value={stats.confirmedBookings}
          subtitle="Ready for chauffeur dispatch"
          icon={CheckCircle2}
          color="#10B981"
        />
        <KpiCard
          title="Published Blogs"
          value={stats.publishedBlogs}
          subtitle="Active SEO travel journal guides"
          icon={BookOpen}
          color="#8B5CF6"
        />
        <KpiCard
          title="Active Vehicles"
          value={stats.activeVehicles}
          subtitle="In service across Mercedes fleet"
          icon={Car}
          color="#17191C"
        />
      </div>

      {/* 
        =======================================================================
        2. RECENT BOOKINGS & RECENT ENQUIRIES DUAL GRID
        =======================================================================
      */}
      <div className="vdt-tables-split-grid">
        {/* Recent Bookings */}
        <div className="vdt-card">
          <div className="vdt-card-header">
            <div>
              <h2 className="vdt-card-title">Recent Booking Enquiries</h2>
              <p className="vdt-card-desc">Submitted via public website booking form</p>
            </div>
            <Link to="/admin/bookings" className="vdt-card-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="vdt-table-responsive">
            <table className="vdt-admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentBookings?.length > 0 ? (
                  data.recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="vdt-ref-code">{b.reference}</td>
                      <td>
                        <div className="vdt-cell-name">{b.customerName}</div>
                        <div className="vdt-cell-sub">{b.phone}</div>
                      </td>
                      <td>
                        <div className="vdt-cell-service">{b.serviceType}</div>
                        <div className="vdt-cell-sub">{b.preferredVehicle}</div>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="vdt-empty-state">
                      No customer bookings received yet. Submit a test enquiry on the website to see it appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contact Enquiries */}
        <div className="vdt-card">
          <div className="vdt-card-header">
            <div>
              <h2 className="vdt-card-title">Recent Contact Inquiries</h2>
              <p className="vdt-card-desc">Inbound concierge questions and tailored quotes</p>
            </div>
            <Link to="/admin/enquiries" className="vdt-card-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="vdt-table-responsive">
            <table className="vdt-admin-table">
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Contact</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentEnquiries?.length > 0 ? (
                  data.recentEnquiries.map((e) => (
                    <tr key={e.id}>
                      <td className="vdt-ref-code">{e.reference}</td>
                      <td>
                        <div className="vdt-cell-name">{e.name}</div>
                        <div className="vdt-cell-sub">{e.email}</div>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <div className="vdt-cell-truncate">{e.subject}</div>
                        <div className="vdt-cell-sub vdt-cell-truncate">{e.message}</div>
                      </td>
                      <td>
                        <span className={`vdt-badge vdt-badge-${e.status?.toLowerCase()}`}>
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="vdt-empty-state">
                      No contact inquiries received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 
        =======================================================================
        3. SYSTEM AUDIT LOG & QUICK SHORTCUTS
        =======================================================================
      */}
      <div className="vdt-card" style={{ marginTop: '1.75rem' }}>
        <div className="vdt-card-header">
          <div>
            <h2 className="vdt-card-title">Security & Audit Activity Stream</h2>
            <p className="vdt-card-desc">Immutable log of administrative logins, content changes and status updates</p>
          </div>
        </div>

        <div className="vdt-audit-list">
          {data?.auditLogs?.length > 0 ? (
            data.auditLogs.map((log) => (
              <div key={log.id} className="vdt-audit-item">
                <div className="vdt-audit-pip" />
                <div className="vdt-audit-main">
                  <span className="vdt-audit-action">{log.action?.replace(/_/g, ' ')}</span>
                  <span className="vdt-audit-entity">on {log.entity}</span>
                </div>
                <div className="vdt-audit-time">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))
          ) : (
            <div className="vdt-empty-state">No audit activities recorded.</div>
          )}
        </div>
      </div>

      <style>{`
        .vdt-dash-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.75rem;
        }

        .vdt-page-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 0.35rem 0;
        }

        .vdt-page-sub {
          color: #707070;
          font-size: 0.9rem;
          margin: 0;
        }

        .vdt-dash-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .vdt-btn-primary {
          background: #C69C50;
          color: #FFFFFF;
          border: none;
          padding: 0.6rem 1.1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vdt-btn-primary:hover {
          background: #B3893E;
        }

        .vdt-btn-secondary {
          background: #FFFFFF;
          color: #17191C;
          border: 1px solid #E6D8C3;
          padding: 0.6rem 1.1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .vdt-btn-secondary:hover {
          border-color: #C69C50;
          color: #C69C50;
        }

        .vdt-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .vdt-banner-error {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #DC3545;
          padding: 0.85rem 1.25rem;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .vdt-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .vdt-tables-split-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
          gap: 1.5rem;
        }

        .vdt-card {
          background: #FFFFFF;
          border: 1px solid #E6D8C3;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 15px rgba(23, 25, 28, 0.03);
        }

        .vdt-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .vdt-card-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #17191C;
          margin: 0 0 0.2rem 0;
        }

        .vdt-card-desc {
          font-size: 0.8rem;
          color: #707070;
          margin: 0;
        }

        .vdt-card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #C69C50;
          text-decoration: none;
        }

        .vdt-card-link:hover {
          text-decoration: underline;
        }

        .vdt-table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .vdt-admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.86rem;
        }

        .vdt-admin-table th {
          text-align: left;
          padding: 0.65rem 0.75rem;
          border-bottom: 1px solid #E6D8C3;
          color: #707070;
          font-weight: 600;
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          background: #FAF8F4;
        }

        .vdt-admin-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #F0EAE1;
          vertical-align: middle;
        }

        .vdt-admin-table tr:hover td {
          background: #FAF8F4;
        }

        .vdt-ref-code {
          font-family: monospace;
          font-weight: 700;
          color: #17191C;
          font-size: 0.82rem;
        }

        .vdt-cell-name {
          font-weight: 600;
          color: #17191C;
        }

        .vdt-cell-service {
          font-weight: 600;
          color: #C69C50;
        }

        .vdt-cell-sub {
          font-size: 0.76rem;
          color: #8C877E;
        }

        .vdt-cell-date {
          font-weight: 500;
          color: #17191C;
        }

        .vdt-cell-truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vdt-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .vdt-badge-new {
          background: #EFF6FF;
          color: #2563EB;
          border: 1px solid #BFDBFE;
        }

        .vdt-badge-contacted {
          background: #FFFBEB;
          color: #D97706;
          border: 1px solid #FDE68A;
        }

        .vdt-badge-confirmed, .vdt-badge-completed {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }

        .vdt-empty-state {
          padding: 2rem 1rem;
          text-align: center;
          color: #8C877E;
          font-size: 0.88rem;
        }

        .vdt-audit-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .vdt-audit-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.65rem;
          border-radius: 6px;
          font-size: 0.84rem;
        }

        .vdt-audit-pip {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #C69C50;
          flex-shrink: 0;
        }

        .vdt-audit-main {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vdt-audit-action {
          font-weight: 600;
          color: #17191C;
        }

        .vdt-audit-entity {
          color: #707070;
        }

        .vdt-audit-time {
          font-size: 0.76rem;
          color: #8C877E;
        }
      `}</style>
    </AdminLayout>
  );
}
