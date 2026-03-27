import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useNotifications from '../../hooks/useNotifications';
import NotificationPanel from '../NotificationPanel';

/**
 * Navbar — Member 4 (Global Component)
 * Universal top navigation with notification bell and user avatar.
 */
const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,14,22,0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff',
          }}>S</div>
          <span style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>
            Smart<span style={{ color: '#4f8ef7' }}>Campus</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              textDecoration: 'none',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              color: location.pathname === link.to ? '#4f8ef7' : '#9ca3af',
              background: location.pathname === link.to ? 'rgba(79,142,247,0.1)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Bell + Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <>
              {/* Notification Bell */}
              <button onClick={() => setShowNotifs(v => !v)} style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: 20,
                padding: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = '#4f8ef7'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    background: '#ef4444',
                    color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    borderRadius: '50%',
                    width: 16, height: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Avatar */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowUserMenu(v => !v)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <img
                    src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f8ef7&color=fff`}
                    alt={user.name}
                    style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid #2d3748' }}
                  />
                  <span style={{ color: '#c9d1d9', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <span style={{ color: '#6b7280', fontSize: 11 }}>▾</span>
                </button>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute', top: 44, right: 0,
                    background: '#161b26',
                    border: '1px solid #2d3748',
                    borderRadius: 10,
                    padding: 8,
                    minWidth: 180,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    zIndex: 200,
                  }}>
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid #2d3748', marginBottom: 4 }}>
                      <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>{user.name}</div>
                      <div style={{ color: '#6b7280', fontSize: 11 }}>{user.email}</div>
                    </div>
                    {user.roles?.includes('ROLE_ADMIN') && (
                      <Link to="/admin" onClick={() => setShowUserMenu(false)} style={{
                        display: 'block', padding: '8px 12px', color: '#f59e0b',
                        textDecoration: 'none', fontSize: 13, borderRadius: 6,
                      }}>⚙ Admin Panel</Link>
                    )}
                    <button onClick={handleLogout} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', color: '#ef4444',
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 13, borderRadius: 6,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      ↩ Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <Link to="/login" style={{
              padding: '7px 16px',
              background: 'linear-gradient(135deg, #4f8ef7, #3b6fd4)',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Notification Panel Dropdown */}
      {showNotifs && (
        <NotificationPanel onClose={() => setShowNotifs(false)} />
      )}

      {/* Click outside to close menus */}
      {(showNotifs || showUserMenu) && (
        <div onClick={() => { setShowNotifs(false); setShowUserMenu(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
      )}
    </>
  );
};

export default Navbar;