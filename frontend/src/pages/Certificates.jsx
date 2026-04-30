import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

export default function Certificates() {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appRes = await axios.get('http://localhost:5000/api/applications/my-applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(appRes.data.data);
      } catch (err) {
        console.error('Failed to load certificates', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>My Certificates</h1>
        <p style={{ color: '#6B7FAA', fontSize: 14, marginBottom: 28 }}>View and manage all your certificate applications</p>
        
        <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : applications.length === 0 ? (
             <div style={{ padding: '60px 22px', textAlign: 'center', color: '#4B5B7A' }}>
               <div style={{ fontSize: 44, marginBottom: 15 }}>📄</div>
               <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7FAA' }}>No certificates found</div>
             </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Tracking ID', 'Certificate Type', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app, idx) => (
                  <motion.tr
                    key={app._id} className="row-hover"
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <td style={{ padding: '16px 22px', fontWeight: 600, fontFamily: 'monospace', color: '#7B99C8' }}>#{app.trackingId.slice(0, 8).toUpperCase()}</td>
                    <td style={{ padding: '16px 22px', fontWeight: 600 }}>{app.certificateType}</td>
                    <td style={{ padding: '16px 22px' }}>
                      <span style={{
                        display: 'inline-flex', padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                        background: app.status === 'Approved' ? 'rgba(34,197,94,0.12)' : app.status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.12)',
                        color: app.status === 'Approved' ? '#22C55E' : app.status === 'Rejected' ? '#EF4444' : '#F97316'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 22px', color: '#6B7FAA', fontSize: 13 }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
