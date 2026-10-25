import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your administrator email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vdt-login-viewport">
      <div className="vdt-login-card">
        {/* Brand Header */}
        <div className="vdt-login-brand">
          <div className="vdt-login-logo">
            <img src="/images/logo2.png" alt="Vienna Day Trip Logo" />
          </div>
          <h1 className="vdt-login-title">VIENNA DAY TRIP</h1>
          <p className="vdt-login-subtitle">SECURE CHAUFFEUR MANAGEMENT CONSOLE</p>
        </div>

        {error && (
          <div className="vdt-login-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="vdt-login-form">
          <div className="vdt-input-group">
            <label htmlFor="admin-email">Administrator Email</label>
            <div className="vdt-input-box">
              <Mail size={16} className="vdt-input-icon" />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@viennadaytrip.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="vdt-input-group">
            <label htmlFor="admin-password">Password</label>
            <div className="vdt-input-box">
              <Lock size={16} className="vdt-input-icon" />
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="vdt-login-submit-btn">
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In To Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="vdt-login-footer">
          <span>Official Chauffeur Management Console</span>
          <span>Vienna, Austria • Licensed Since 2019</span>
        </div>
      </div>
    </div>
  );
}
