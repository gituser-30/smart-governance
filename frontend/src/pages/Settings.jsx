import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

export default function Settings() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: '#6B7FAA', fontSize: 14, marginBottom: 28 }}>Manage your account preferences</p>
        
        <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32, maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg,#F97316,#ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, fontWeight: 800, flexShrink: 0, color: '#fff',
            }}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{user?.fullName || 'Citizen User'}</div>
              <div style={{ fontSize: 13, color: '#6B7FAA', marginTop: 4 }}>{user?.email || 'user@example.com'}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Preferences</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Email Notifications</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Receive updates about your applications</div>
              </div>
              <div style={{ width: 44, height: 24, background: '#F97316', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, right: 2 }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>SMS Alerts</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Get text messages for critical status changes</div>
              </div>
              <div style={{ width: 44, height: 24, background: '#1E2D47', borderRadius: 12, position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
