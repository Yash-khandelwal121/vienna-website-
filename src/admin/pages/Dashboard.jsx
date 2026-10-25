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
    </AdminLayout>
  );
}
