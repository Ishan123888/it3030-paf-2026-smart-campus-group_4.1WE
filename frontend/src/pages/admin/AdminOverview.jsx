import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAllUsers, getResources } from '../../api/api';
import {
  IconUsers, IconResource, IconAlertTriangle,
  IconTrendingUp, IconActivity, IconUserCheck, IconPackage,
  IconChevronRight,
} from '../../components/common/Icons';

export default function AdminOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, admins: 0, resources: 0, active: 0, oos: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [usersRes, resourcesRes] = await Promise.all([getAllUsers(), getResources({})]);
        const users = usersRes.data || [];
        const resources = resourcesRes.data || [];
        setStats({
          users: users.length,
          admins: users.filter(u => u.roles?.includes('ROLE_ADMIN')).length,
          resources: resources.length,
          active: resources.filter(r => r.status === 'ACTIVE').length,
          oos: resources.filter(r => r.status === 'OUT_OF_SERVICE').length,
        });
      } catch (err) {
        console.error('Failed to load overview stats', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards = [
    { label: 'Total Users',      value: stats.users,     icon: IconUsers,         color: '#4f6fff', bg: '#eff6ff', border: '#bfdbfe', path: '/admin/users' },
    { label: 'Administrators',   value: stats.admins,    icon: IconUserCheck,     color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', path: '/admin/users' },
    { label: 'Total Resources',  value: stats.resources, icon: IconPackage,       color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', path: '/admin/resources' },
    { label: 'Active Resources', value: stats.active,    icon: IconActivity,      color: '#059669', bg: '#f0fdf4', border: '#bbf7d0', path: '/admin/resources' },
  ];

  const quickActions = [
    { label: 'Add Resource',    desc: 'Create a new campus resource',    icon: IconResource,      color: '#4f6fff', path: '/admin/resources' },
    { label: 'Manage Users',    desc: 'Update roles and permissions',     icon: IconUsers,         color: '#7c3aed', path: '/admin/users' },
    { label: 'View Incidents',  desc: 'Review and resolve incidents',     icon: IconAlertTriangle, color: '#dc2626', path: '/admin/incidents' },
    { label: 'System Stats',    desc: 'Monitor usage and performance',    icon: IconTrendingUp,    color: '#059669', path: '/admin/resources' },
  ];

  return (
    <AdminLayout title="Overview">
      {/* Welcome Banner */}
      <div style={s.banner}>
        <div style={s.bannerContent}>
          <div style={s.bannerText}>
            <h2 style={s.bannerTitle}>Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋</h2>
            <p style={s.bannerSub}>Here's what's happening with your SmartCampus system today.</p>
          </div>
          <div style={s.bannerIcon}>
            <IconLayoutDashboard size={48} style={{ color: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.statsGrid}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <button key={card.label} onClick={() => navigate(card.path)} style={{ ...s.statCard, background: card.bg, border: `1px solid ${card.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ ...s.statValue, color: card.color }}>
                    {loading ? '—' : card.value}
                  </div>
                  <div style={s.statLabel}>{card.label}</div>
                </div>
                <div style={{ ...s.statIconBox, background: `${card.color}18`, color: card.color }}>
                  <Icon size={22} />
                </div>
              </div>
              <div style={{ ...s.statFooter, color: card.color }}>
                View details <IconChevronRight size={13} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div style={s.sectionHeader}>
        <h3 style={s.sectionTitle}>Quick Actions</h3>
        <p style={s.sectionSub}>Jump to common admin tasks</p>
      </div>

      <div style={s.actionsGrid}>
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <button key={action.label} onClick={() => navigate(action.path)} style={s.actionCard}>
              <div style={{ ...s.actionIconBox, background: `${action.color}12`, color: action.color }}>
                <Icon size={24} />
              </div>
              <div style={s.actionText}>
                <div style={s.actionLabel}>{action.label}</div>
                <div style={s.actionDesc}>{action.desc}</div>
              </div>
              <IconChevronRight size={16} style={{ color: '#cbd5e1', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>

      {/* System Status */}
      <div style={s.sectionHeader}>
        <h3 style={s.sectionTitle}>System Status</h3>
      </div>
      <div style={s.statusCard}>
        <div style={s.statusRow}>
          <div style={s.statusItem}>
            <span style={{ ...s.statusDot, background: '#059669' }} />
            <span style={s.statusLabel}>Backend API</span>
            <span style={{ ...s.statusBadge, background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>Online</span>
          </div>
          <div style={s.statusItem}>
            <span style={{ ...s.statusDot, background: '#059669' }} />
            <span style={s.statusLabel}>MongoDB Atlas</span>
            <span style={{ ...s.statusBadge, background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>Connected</span>
          </div>
          <div style={s.statusItem}>
            <span style={{ ...s.statusDot, background: stats.oos > 0 ? '#f59e0b' : '#059669' }} />
            <span style={s.statusLabel}>Resources Out of Service</span>
            <span style={{ ...s.statusBadge, background: stats.oos > 0 ? '#fffbeb' : '#f0fdf4', color: stats.oos > 0 ? '#d97706' : '#059669', border: `1px solid ${stats.oos > 0 ? '#fde68a' : '#bbf7d0'}` }}>
              {loading ? '—' : stats.oos}
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Need to import this for the banner icon
function IconLayoutDashboard(props) {
  return (
    <svg width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" style={props.style}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const s = {
  banner: {
    background: 'linear-gradient(135deg, #4f6fff 0%, #00e5c3 100%)',
    borderRadius: 16, padding: '28px 32px', marginBottom: 28,
    boxShadow: '0 4px 20px rgba(79,111,255,0.2)',
  },
  bannerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  bannerText: {},
  bannerTitle: { fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.3px' },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', margin: 0 },
  bannerIcon: { opacity: 0.6 },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
    padding: '20px', cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.15s', fontFamily: 'inherit',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  statValue: { fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: 500 },
  statIconBox: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statFooter: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, marginTop: 16 },

  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.2px' },
  sectionSub: { fontSize: 13, color: '#64748b', margin: 0 },

  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 32 },
  actionCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12,
    padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
    transition: 'all 0.15s', fontFamily: 'inherit',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  actionIconBox: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  actionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },

  statusCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  statusRow: { display: 'flex', flexWrap: 'wrap', gap: 20 },
  statusItem: { display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  statusLabel: { fontSize: 13, color: '#475569', fontWeight: 500 },
  statusBadge: { fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
};
