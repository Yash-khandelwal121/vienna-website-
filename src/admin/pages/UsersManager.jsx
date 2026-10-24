import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  RefreshCw,
  X,
  Save,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function UsersManager() {
  const { token, user: currentUser } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONTENT_EDITOR',
    isActive: true
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleOpenAdd = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      role: 'CONTENT_EDITOR',
      isActive: true
    });
    setSelectedUser(null);
    setIsEditing(true);
    setMessage('');
  };

  const handleOpenEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      isActive: u.isActive
    });
    setSelectedUser(u);
    setIsEditing(true);
    setMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const url = selectedUser ? `/api/v1/admin/users/${selectedUser.id}` : '/api/v1/admin/users';
      const method = selectedUser ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User updated successfully.');
        setIsEditing(false);
        fetchUsers();
      } else {
        setMessage(data.error || 'Failed to save user.');
      }
    } catch (err) {
      setMessage('Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own logged-in administrator account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this administrator account?')) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('User removed.');
        fetchUsers();
      } else {
        setMessage(data.error || 'Could not delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminLayout title="Admin User Management">
      <div className="vdt-page-header">
        <div>
          <h1 className="vdt-page-title">Administrator Accounts & Roles</h1>
          <p className="vdt-page-sub">
            Manage administrative access with role-based permissions (Super Admin, Content Editor, Booking Manager).
          </p>
        </div>
        <div className="vdt-header-actions">
          <button type="button" onClick={handleOpenAdd} className="vdt-btn-primary">
            <Plus size={15} />
            <span>Create Admin User</span>
          </button>
          <button type="button" onClick={fetchUsers} className="vdt-btn-secondary" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'vdt-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {message && <div className="vdt-banner-info">{message}</div>}

      <div className="vdt-card">
        <div className="vdt-table-responsive">
          <table className="vdt-admin-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Account Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="vdt-cell-name">{u.name}</div>
                    {u.id === currentUser?.id && (
                      <span style={{ fontSize: '0.68rem', color: '#C69C50', fontWeight: 700 }}>(You)</span>
                    )}
                  </td>
                  <td className="vdt-cell-sub">{u.email}</td>
                  <td>
                    <span className="vdt-badge vdt-badge-trans">
                      {u.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`vdt-badge ${u.isActive ? 'vdt-badge-confirmed' : 'vdt-badge-contacted'}`}>
                      {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="vdt-cell-sub">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button type="button" onClick={() => handleOpenEdit(u)} className="vdt-action-btn">
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      {u.id !== currentUser?.id && (
                        <button type="button" onClick={() => handleDelete(u.id)} className="vdt-action-btn-danger">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="vdt-modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="vdt-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="vdt-modal-header">
              <div>
                <span className="vdt-modal-eyebrow">USER PERMISSIONS</span>
                <h3 className="vdt-modal-title">{selectedUser ? `Edit ${selectedUser.name}` : 'Create Admin User'}</h3>
              </div>
              <button type="button" className="vdt-modal-close" onClick={() => setIsEditing(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="vdt-modal-body">
              <div className="vdt-form-grid">
                <div className="vdt-field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={!!selectedUser}
                    className="vdt-input"
                  />
                </div>

                <div className="vdt-field-group">
                  <label>Assign Role *</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="vdt-select"
                  >
                    <option value="SUPER_ADMIN">SUPER ADMIN (Full system access)</option>
                    <option value="CONTENT_EDITOR">CONTENT EDITOR (Blogs, pages, fleet, media)</option>
                    <option value="BOOKING_MANAGER">BOOKING MANAGER (Bookings & enquiries only)</option>
                  </select>
                </div>

                <div className="vdt-field-group">
                  <label>{selectedUser ? 'Reset Password (Leave blank to keep current)' : 'Password *'}</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!selectedUser}
                    placeholder="••••••••••••"
                    className="vdt-input"
                  />
                </div>
              </div>

              <div className="vdt-modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="vdt-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="vdt-btn-primary">
                  {saving ? 'Saving...' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
