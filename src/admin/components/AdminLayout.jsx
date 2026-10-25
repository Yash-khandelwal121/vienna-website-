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
        2. MAIN CONTENT AREA (Ivory #FAF8F4, Cards #FFFFFF)
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
    </div>
  );
}
