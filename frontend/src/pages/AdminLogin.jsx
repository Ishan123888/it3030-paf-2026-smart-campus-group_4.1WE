import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import fallbackLogo from '../logo.svg';

const LOGO_URL = 'https://i.imgur.com/BgTMqyZ.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoSrc, setLogoSrc] = useState(LOGO_URL);
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8081/api/auth/login', {
        email,
        password,
      });

      const { token, roles } = response.data;

      if (!roles || !roles.includes('ROLE_ADMIN')) {
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      await loginWithToken(token);
      navigate('/admin/resources', { replace: true });
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Back Button */}
        <button onClick={() => navigate('/login')} style={styles.backButton}>
          ← Back to Login
        </button>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoCircle}>
            <img
              src={logoSrc}
              onError={() => setLogoSrc(fallbackLogo)}
              alt="SmartCampus"
              style={styles.logoImg}
            />
          </div>
          <div style={styles.adminBadge}>
            <span style={styles.badgeText}>Admin Portal</span>
          </div>
          <h1 style={styles.title}>Administrator Access</h1>
          <p style={styles.subtitle}>Sign in with your admin credentials to manage the system</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartcampus.com"
              required
              style={styles.input}
              autoComplete="email"
              onFocus={(e) => {
                e.target.style.borderColor = '#4f6fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 111, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.togglePassword}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={styles.input}
              autoComplete="current-password"
              onFocus={(e) => {
                e.target.style.borderColor = '#4f6fff';
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 111, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 111, 255, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 111, 255, 0.25)';
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Signing in...
              </>
            ) : (
              <>
                Sign In as Admin
                <span style={styles.arrow}>→</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={styles.footer}>
          Authorized administrators only. All actions are logged.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    background: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '32px',
    fontFamily: 'inherit',
    display: 'inline-block',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #4f6fff 0%, #00e5c3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(79, 111, 255, 0.25)',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  adminBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '6px 14px',
    marginBottom: '16px',
  },
  badgeText: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#92400e',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.6',
  },
  errorBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '24px',
  },
  errorIcon: { fontSize: '16px', flexShrink: 0 },
  errorText: { fontSize: '14px', color: '#dc2626', fontWeight: '500' },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '28px',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '14px', fontWeight: '600', color: '#334155' },
  togglePassword: {
    background: 'none',
    border: 'none',
    color: '#4f6fff',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    color: '#0f172a',
    background: '#ffffff',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #4f6fff 0%, #00e5c3 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 14px rgba(79, 111, 255, 0.25)',
    marginTop: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  arrow: { fontSize: '18px' },
  footer: {
    fontSize: '12px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.5',
  },
};

// Add spinner animation and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 640px) {
    .admin-login-card {
      padding: 28px 24px !important;
    }
  }
  
  @media (max-width: 480px) {
    .admin-login-card {
      padding: 24px 20px !important;
    }
  }
`;
if (!document.querySelector('style[data-admin-login]')) {
  styleSheet.setAttribute('data-admin-login', 'true');
  document.head.appendChild(styleSheet);
}
