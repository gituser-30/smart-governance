import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { FileText, ExternalLink } from 'lucide-react';

const CERT_META = {
  Income: { label: 'Income Certificate', icon: <FileText size={18} />, color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  Domicile: { label: 'Domicile Certificate', icon: <FileText size={18} />, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  EWS: { label: 'EWS Certificate', icon: <FileText size={18} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  Birth: { label: 'Birth Certificate', icon: <FileText size={18} />, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
};
const CERT_TYPES = Object.keys(CERT_META);

export default function Certificates() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{t('sidebar_myCertificates', 'My Certificates')}</h1>
            <p style={{ color: '#6B7FAA', fontSize: 14 }}>{t('cert_desc', 'View and manage all your certificate applications')}</p>
          </div>
          <button onClick={() => setShowApplyModal(true)} className="btn-primary" style={{ padding: '12px 20px', borderRadius: 12 }}>
            + Apply for Certificate
          </button>
        </div>
        
        <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60 }} />)}
            </div>
          ) : applications.length === 0 ? (
             <div style={{ padding: '60px 22px', textAlign: 'center', color: '#4B5B7A' }}>
               <div style={{ fontSize: 44, marginBottom: 15 }}>📄</div>
               <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7FAA' }}>{t('cert_noFound', 'No certificates found')}</div>
             </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[t('table_trackingId', 'Tracking ID'), t('table_type', 'Certificate Type'), t('table_status', 'Status'), t('table_date', 'Date'), t('table_action', 'Action')].map(h => (
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
                    <td style={{ padding: '16px 22px' }}>
                      {app.status === 'Approved' && (
                        <button onClick={() => navigate(`/certificate/${app.trackingId}`)} style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {t('cert_viewDownload', 'View / Download')}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,12,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowApplyModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 500, overflow: 'hidden' }}
            >
              <div style={{ height: 4, background: 'linear-gradient(90deg, #F97316, #3B82F6, #22C55E)' }} />
              <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Choose Certificate</h3>
                <button onClick={() => setShowApplyModal(false)} style={{ background: '#131E33', border: 'none', color: '#6B7FAA', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>

              <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                {CERT_TYPES.map((type) => {
                  const m = CERT_META[type];
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} key={type}
                      onClick={() => { navigate(`/apply?type=${type}`); setShowApplyModal(false); }}
                      style={{ background: '#070C18', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '20px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {m.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{type}</div>
                        <div style={{ fontSize: 11, color: '#4B5B7A', fontWeight: 600 }}>Official Certificate</div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
