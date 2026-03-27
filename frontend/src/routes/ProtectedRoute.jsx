import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — Member 4
 * Wraps routes that require authentication and optional role check.
 *
 * Usage:
 *   <ProtectedRoute>                  → requires login only
 *   <ProtectedRoute requiredRole="ROLE_ADMIN"> → requires ADMIN role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0f1117'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{
            width: 40, height: 40, border: '3px solid #1e2a3a',
            borderTop: '3px solid #4f8ef7', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ color: '#6b7280', fontSize: 14 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;