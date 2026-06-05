import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

const Toggle = ({ active, onChange }) => (
  <div 
    onClick={() => onChange(!active)}
    style={{ 
      width: 44, height: 24, 
      background: active ? '#F97316' : '#1E2D47', 
      borderRadius: 12, position: 'relative', cursor: 'pointer',
      transition: 'background 0.3s'
    }}
  >
    <div style={{ 
      width: 20, height: 20, background: '#fff', borderRadius: '50%', 
      position: 'absolute', top: 2, 
      left: active ? 22 : 2,
      transition: 'left 0.3s'
    }} />
  </div>
);

export default function Settings() {
  const { user } = useAuth();
  
  const [settings, setSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    darkMode: true,
    twoFactor: false
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [pwdMessage, setPwdMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('govai_settings');
    if (saved) {
      try {
        setSettings({ ...settings, ...JSON.parse(saved) });
      } catch (e) {}
    }
  }, []);

  const updateSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('govai_settings', JSON.stringify(updated));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.new.length < 6) {
      setPwdMessage('Password must be at least 6 characters.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPwdMessage('New passwords do not match!');
      return;
    }
    // Simulate API call
    setPwdMessage('Password updated successfully!');
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswords({ old: '', new: '', confirm: '' });
      setPwdMessage('');
    }, 2000);
  };

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
              <Toggle active={settings.emailAlerts} onChange={(val) => updateSetting('emailAlerts', val)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>SMS Alerts</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Get text messages for critical status changes</div>
              </div>
              <Toggle active={settings.smsAlerts} onChange={(val) => updateSetting('smsAlerts', val)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Dark Mode</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Experience the dark theme across the application</div>
              </div>
              <Toggle active={settings.darkMode} onChange={(val) => updateSetting('darkMode', val)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Two-Factor Authentication (2FA)</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Secure your account with an extra layer of protection</div>
              </div>
              <button 
                onClick={() => updateSetting('twoFactor', !settings.twoFactor)}
                style={{ background: settings.twoFactor ? 'rgba(34,197,94,0.2)' : '#1E2D47', color: settings.twoFactor ? '#22C55E' : '#fff', border: `1px solid ${settings.twoFactor ? '#22C55E' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s' }}>
                {settings.twoFactor ? '2FA Enabled ✓' : 'Enable 2FA'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Change Password</div>
                  <div style={{ fontSize: 12, color: '#6B7FAA', marginTop: 2 }}>Update your current password for security</div>
                </div>
                <button 
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  style={{ background: 'transparent', color: '#F97316', border: '1px solid #F97316', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  {showPasswordForm ? 'Cancel' : 'Update'}
                </button>
              </div>

              <AnimatePresence>
                {showPasswordForm && (
                  <motion.form 
                    initial={{ height: 0, opacity: 0, marginTop: 0 }} 
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }} 
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    style={{ overflow: 'hidden' }}
                    onSubmit={handlePasswordSubmit}
                  >
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <input required type="password" placeholder="Current Password" value={passwords.old} onChange={(e) => setPasswords({...passwords, old: e.target.value})} className="govai-input" style={{ padding: '10px 14px', fontSize: 13 }} />
                      <input required type="password" placeholder="New Password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="govai-input" style={{ padding: '10px 14px', fontSize: 13 }} />
                      <input required type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="govai-input" style={{ padding: '10px 14px', fontSize: 13 }} />
                      {pwdMessage && <div style={{ fontSize: 12, fontWeight: 600, color: pwdMessage.includes('success') ? '#22C55E' : '#EF4444' }}>{pwdMessage}</div>}
                      <button type="submit" className="btn-primary" style={{ padding: '10px', display: 'flex', justifyContent: 'center' }}>Save Password</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
