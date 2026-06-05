import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const mainNav = [
    { label: 'Applications',  icon: '📄', path: '/admin' },
    { label: 'Grievances',    icon: '💬', path: '/admin/grievances' },
    { label: 'Audit Logs',    icon: '📊', path: '/admin/audit-logs' },
  ];

  return (
    <aside style={{
      width: 224, background: '#080E1B',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      padding: '22px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      height: '100%' // Ensure it stretches in the layout
    }}>
      {/* Logo mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px', marginBottom: 22 }}>
        <div style={{
          width: 36, height: 36, background: 'linear-gradient(135deg,#22C55E,#16a34a)',
          borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
        }}>🏛️</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>GovAI</div>
          <div style={{ fontSize: 10, color: '#4B5B7A', fontWeight: 500 }}>Admin Portal</div>
        </div>
      </div>

      {/* Nav items */}
      {mainNav.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`sidebar-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Logout button */}
      <button
        onClick={() => {
            logout();
            navigate('/admin-login');
        }}
        className="sidebar-item"
        style={{ color: '#EF4444' }}
      >
        <span style={{ fontSize: 15, flexShrink: 0 }}>🚪</span>
        Logout
      </button>

      {/* User chip */}
      <div style={{
        marginTop: 12, padding: '11px 10px', borderRadius: 12,
        background: '#0D1626', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg,#22C55E,#16a34a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, flexShrink: 0, color: '#fff',
        }}>
          {user?.fullName?.[0]?.toUpperCase() || 'A'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.fullName || 'Tahsildar Officer'}
          </div>
          <div style={{ fontSize: 10, color: '#4B5B7A', fontWeight: 500 }}>{user?.area || 'All Areas'}</div>
        </div>
      </div>
    </aside>
  );
}
