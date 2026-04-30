import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

export default function TrackStatus() {
  const [trackingId, setTrackingId] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/certificate/${trackingId.trim()}`);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: 600, margin: '0 auto', paddingTop: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Track Status</h1>
          <p style={{ color: '#6B7FAA', fontSize: 14 }}>Enter your application Tracking ID to see the latest status</p>
        </div>
        
        <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Tracking ID
              </label>
              <input
                required
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="e.g. ABC123XYZ"
                style={{
                  width: '100%', background: '#0A1120', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '14px 16px', fontSize: 15, color: '#fff', outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '14px', fontSize: 15 }}
            >
              Track Application
            </button>
          </form>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
