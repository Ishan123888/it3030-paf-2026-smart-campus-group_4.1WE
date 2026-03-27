import React from 'react';

/**
 * Button — Member 4 (Global Component)
 * Variants: primary | secondary | danger | ghost
 * Sizes: sm | md | lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false,
  icon,
  loading = false,
  className = '',
}) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    borderRadius: 10,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.18s ease',
    opacity: disabled || loading ? 0.55 : 1,
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
  };

  const sizes = {
    sm: { padding: '7px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 14 },
    lg: { padding: '13px 28px', fontSize: 16 },
  };

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #4f8ef7 0%, #3b6fd4 100%)',
      color: '#fff',
      boxShadow: '0 2px 12px rgba(79,142,247,0.35)',
    },
    secondary: {
      background: '#1e2a3a',
      color: '#c9d1d9',
      border: '1px solid #2d3748',
    },
    danger: {
      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      color: '#fff',
      boxShadow: '0 2px 10px rgba(239,68,68,0.3)',
    },
    ghost: {
      background: 'transparent',
      color: '#4f8ef7',
      border: '1px solid #4f8ef7',
    },
  };

  const style = { ...base, ...sizes[size], ...variants[variant] };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={className}
      onMouseEnter={e => !disabled && !loading && (e.currentTarget.style.filter = 'brightness(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
    >
      {loading ? (
        <span style={{
          width: 14, height: 14,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid #fff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon ? (
        <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>
      ) : null}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
};

export default Button;