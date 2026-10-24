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

      <style>{`
        .vdt-login-viewport {
          min-height: 100vh;
          background: #0E1013 radial-gradient(circle at 50% 20%, rgba(198, 156, 80, 0.12) 0%, rgba(14, 16, 19, 1) 75%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .vdt-login-card {
          width: 100%;
          max-width: 440px;
          background: #17191C;
          border: 1px solid #C69C50;
          border-radius: 16px;
          padding: 2.5rem 2.2rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
          color: #FAF8F4;
        }

        .vdt-login-brand {
          text-align: center;
          margin-bottom: 2rem;
        }

        .vdt-login-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 1.5px solid #C69C50;
          background: #0E1013;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          box-shadow: 0 4px 18px rgba(198, 156, 80, 0.3);
        }

        .vdt-login-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .vdt-login-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #FFFFFF;
          margin: 0 0 0.35rem 0;
        }

        .vdt-login-subtitle {
          font-size: 0.68rem;
          letter-spacing: 0.18em;
          color: #C69C50;
          font-weight: 700;
          margin: 0;
        }

        .vdt-login-alert {
          background: rgba(220, 53, 69, 0.15);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #FF8585;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.84rem;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1.5rem;
        }

        .vdt-login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .vdt-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .vdt-input-group label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #B5AFA6;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .vdt-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .vdt-input-icon {
          position: absolute;
          left: 14px;
          color: #C69C50;
        }

        .vdt-input-box input {
          width: 100%;
          background: #0E1013;
          border: 1px solid rgba(230, 216, 195, 0.25);
          color: #FFFFFF;
          padding: 0.85rem 1rem 0.85rem 2.6rem;
          border-radius: 8px;
          font-size: 0.92rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          outline: none;
        }

        .vdt-input-box input:focus {
          border-color: #C69C50;
          box-shadow: 0 0 0 3px rgba(198, 156, 80, 0.2);
        }

        .vdt-login-submit-btn {
          margin-top: 0.5rem;
          background: #C69C50;
          color: #FFFFFF;
          border: none;
          padding: 0.95rem;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        .vdt-login-submit-btn:hover:not(:disabled) {
          background: #D4AF37;
          transform: translateY(-1px);
        }

        .vdt-login-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .vdt-quick-dev-fill {
          margin-top: 1.25rem;
          text-align: center;
        }

        .vdt-quick-fill-btn {
          background: none;
          border: 1px dashed rgba(198, 156, 80, 0.4);
          color: #C69C50;
          font-size: 0.74rem;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .vdt-quick-fill-btn:hover {
          background: rgba(198, 156, 80, 0.1);
          border-color: #C69C50;
        }

        .vdt-login-footer {
          margin-top: 2rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          color: #707070;
        }
      `}</style>
    </div>
  );
}
