import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Car,
  Compass,
  MapPin,
  BookOpen,
  FileText,
  Image,
  Star,
  Globe,
  Search,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Bell,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { path: '/admin/fleet', label: 'Fleet Management', icon: Car },
  { path: '/admin/services', label: 'Services', icon: Compass },
  { path: '/admin/day-trips', label: 'Day Trips', icon: MapPin },
  { path: '/admin/blogs', label: 'Blog CMS', icon: BookOpen },
  { path: '/admin/pages', label: 'Website Content', icon: FileText },
  { path: '/admin/media', label: 'Media Library', icon: Image },
  { path: '/admin/reviews', label: 'Google Reviews', icon: Star },
  { path: '/admin/translations', label: 'Translations (6)', icon: Globe },
  { path: '/admin/seo', label: 'SEO & Sitemap', icon: Search },
  { path: '/admin/users', label: 'Admin Users', icon: Users, role: 'SUPER_ADMIN' },
  { path: '/admin/settings', label: 'Website Settings', icon: Settings, role: 'SUPER_ADMIN' }
];

export default function AdminLayout({ children, title = 'Dashboard' }) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (!item.role) return true;
    return user?.role === item.role || user?.role === 'SUPER_ADMIN';
  });

  return (
    <div className="vdt-admin-root">
      {/* 
        =======================================================================
        1. LEFT SIDEBAR (Dark Charcoal #17191C, Gold Accents #C69C50)
        =======================================================================
      */}
      <aside className={`vdt-admin-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="vdt-sidebar-header">
          <Link to="/admin/dashboard" className="vdt-sidebar-brand" onClick={() => setMobileMenuOpen(false)}>
            <div className="vdt-sidebar-logo-frame">
              <img src="/images/logo2.png" alt="Vienna Day Trip" />
            </div>
            <div className="vdt-sidebar-brand-text">
              <span className="vdt-sidebar-title">VIENNA DAY TRIP</span>
              <span className="vdt-sidebar-sub">MANAGEMENT CONSOLE</span>
            </div>
          </Link>
          <button
            type="button"
            className="vdt-sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="vdt-sidebar-nav">
          <div className="vdt-nav-section-label">MANAGEMENT</div>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`vdt-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} className="vdt-nav-icon" />
                <span>{item.label}</span>
                {isActive && <span className="vdt-nav-active-pip" />}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout (Bottom Sidebar) */}
        <div className="vdt-sidebar-footer">
          <div className="vdt-user-card">
            <div className="vdt-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="vdt-user-info">
              <span className="vdt-user-name">{user?.name || 'Administrator'}</span>
              <span className="vdt-user-role-badge">
                <ShieldCheck size={11} />
                {user?.role?.replace('_', ' ') || 'SUPER ADMIN'}
              </span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="vdt-logout-btn" title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="vdt-sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 
        =======================================================================
        2. MAIN CONTENT AREA (Ivory #F8F7F4, Cards #FFFFFF)
        =======================================================================
      */}
      <div className="vdt-admin-main-wrap">
        {/* Top Header */}
        <header className="vdt-admin-header">
          <div className="vdt-header-left">
            <button
              type="button"
              className="vdt-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="vdt-breadcrumbs">
              <span className="vdt-crumb-root">Admin</span>
              <ChevronRight size={13} className="vdt-crumb-sep" />
              <span className="vdt-crumb-active">{title}</span>
            </div>
          </div>

          <div className="vdt-header-right">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="vdt-view-site-btn"
              title="Open public website in new tab"
            >
              <ExternalLink size={14} />
              <span>View Website</span>
            </a>
            <div className="vdt-header-divider" />
            <div className="vdt-header-user-pill">
              <span className="vdt-header-role">{user?.role?.replace('_', ' ')}</span>
              <div className="vdt-header-avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="vdt-admin-content">{children}</main>
      </div>

      {/* Scoped CSS for Admin Console */}
      <style>{`
        .vdt-admin-root {
          display: flex;
          min-height: 100vh;
          background-color: #F8F7F4;
          color: #17191C;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow-x: hidden;
        }

        /* Sidebar Styling */
        .vdt-admin-sidebar {
          width: 260px;
          background-color: #17191C;
          color: #EAE6DF;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          height: 100vh;
          position: sticky;
          top: 0;
          z-index: 100;
          border-right: 1px solid rgba(198, 156, 80, 0.2);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .vdt-sidebar-header {
          padding: 1.25rem 1.2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .vdt-sidebar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: inherit;
        }

        .vdt-sidebar-logo-frame {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #C69C50;
          background: #0E1013;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 2px;
          flex-shrink: 0;
        }

        .vdt-sidebar-logo-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vdt-sidebar-brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .vdt-sidebar-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 0.98rem;
          letter-spacing: 0.05em;
          color: #FFFFFF;
        }

        .vdt-sidebar-sub {
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          color: #C69C50;
          font-weight: 700;
        }

        .vdt-sidebar-close-btn {
          display: none;
          background: none;
          border: none;
          color: #C69C50;
          cursor: pointer;
        }

        .vdt-sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .vdt-nav-section-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #8C877E;
          padding: 0.5rem 0.75rem 0.35rem;
        }

        .vdt-nav-link {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 0.85rem;
          border-radius: 8px;
          color: #B5AFA6;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.18s ease;
          position: relative;
        }

        .vdt-nav-link:hover {
          color: #FFFFFF;
          background: rgba(198, 156, 80, 0.09);
        }

        .vdt-nav-link.active {
          color: #FFFFFF;
          background: rgba(198, 156, 80, 0.18);
          font-weight: 600;
        }

        .vdt-nav-icon {
          color: #C69C50;
          flex-shrink: 0;
        }

        .vdt-nav-active-pip {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C69C50;
          margin-left: auto;
        }

        .vdt-sidebar-footer {
          padding: 1rem 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: #111315;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .vdt-user-card {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .vdt-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #C69C50;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .vdt-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .vdt-user-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #FFFFFF;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .vdt-user-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.68rem;
          color: #C69C50;
          font-weight: 600;
          text-transform: uppercase;
        }

        .vdt-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.55rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #D6D0C5;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .vdt-logout-btn:hover {
          background: rgba(220, 53, 69, 0.15);
          color: #FF6B6B;
          border-color: rgba(220, 53, 69, 0.3);
        }

        /* Main Content Layout */
        .vdt-admin-main-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .vdt-admin-header {
          height: 64px;
          background: #FFFFFF;
          border-bottom: 1px solid #E6D8C3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.75rem;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .vdt-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .vdt-mobile-toggle-btn {
          display: none;
          background: none;
          border: none;
          color: #17191C;
          cursor: pointer;
          padding: 4px;
        }

        .vdt-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.88rem;
        }

        .vdt-crumb-root {
          color: #707070;
        }

        .vdt-crumb-sep {
          color: #A09A8F;
        }

        .vdt-crumb-active {
          color: #17191C;
          font-weight: 600;
        }

        .vdt-header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .vdt-view-site-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: #17191C;
          text-decoration: none;
          padding: 0.45rem 0.85rem;
          border-radius: 6px;
          border: 1px solid #E6D8C3;
          background: #FAF8F4;
          transition: all 0.2s ease;
        }

        .vdt-view-site-btn:hover {
          border-color: #C69C50;
          color: #C69C50;
        }

        .vdt-header-divider {
          width: 1px;
          height: 24px;
          background: #E6D8C3;
        }

        .vdt-header-user-pill {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .vdt-header-role {
          font-size: 0.78rem;
          font-weight: 600;
          color: #707070;
          text-transform: uppercase;
        }

        .vdt-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #17191C;
          color: #C69C50;
          border: 1px solid #C69C50;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .vdt-admin-content {
          padding: 1.75rem;
          flex: 1;
        }

        /* Mobile Breakpoint (< 1024px) */
        @media (max-width: 1024px) {
          .vdt-admin-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            transform: translateX(-100%);
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.4);
          }

          .vdt-admin-sidebar.open {
            transform: translateX(0);
          }

          .vdt-sidebar-close-btn {
            display: block;
          }

          .vdt-sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 90;
            backdrop-filter: blur(3px);
          }

          .vdt-mobile-toggle-btn {
            display: block;
          }

          .vdt-admin-header {
            padding: 0 1rem;
          }

          .vdt-admin-content {
            padding: 1.25rem 1rem;
          }

          .vdt-header-role {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
