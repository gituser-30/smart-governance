import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';
import { useTranslation } from 'react-i18next';

export default function Grievances() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Grievance Modal State
  const [shGrievanceModal, setShGrievanceModal] = useState(false);
  const [gForm, setGForm] = useState({ title: '', department: 'Revenue', area: '', description: '' });
  const [gSubmitting, setGSubmitting] = useState(false);

  const submitGrievance = async (e) => {
    e.preventDefault();
    setGSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/grievances/submit', gForm, { headers: { Authorization: `Bearer ${token}` } });
      setShGrievanceModal(false);
      setGForm({ title: '', department: 'Revenue', area: '', description: '' });
      const res = await axios.get('http://localhost:5000/api/grievances/my', { headers: { Authorization: `Bearer ${token}` } });
      setGrievances(res.data.data);
    } catch (err) { console.error(err); alert('Failed to submit grievance'); }
    setGSubmitting(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/grievances/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrievances(res.data.data);
      } catch (err) {
        console.error('Failed to load grievances', err);
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
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{t('sidebar_myGrievances', 'My Grievances')}</h1>
            <p style={{ color: '#6B7FAA', fontSize: 14 }}>{t('griev_desc', 'Track your filed complaints and issues')}</p>
          </div>
          <button onClick={() => setShGrievanceModal(true)} className="btn-primary" style={{ padding: '12px 20px', borderRadius: 12 }}>
            + Lodge Complaint
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)
          ) : grievances.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 22px', textAlign: 'center', background: '#0D1626', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 44, marginBottom: 15 }}>💬</div>
               <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7FAA' }}>{t('griev_noFiled', 'No grievances filed')}</div>
            </div>
          ) : (
            grievances.map((g, idx) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                style={{
                  background: '#0D1626', padding: 22, borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)', borderTop: '4px solid #F97316'
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginBottom: 12 }}>{g.department} • {g.area}</div>
                <p style={{ fontSize: 13, color: '#9DB4D8', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {g.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                  <span style={{ fontSize: 11, color: '#4B5B7A', fontWeight: 600 }}>{new Date(g.createdAt).toLocaleDateString()}</span>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                    background: g.status === 'Resolved' ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.12)',
                    color: g.status === 'Resolved' ? '#22C55E' : '#F97316'
                  }}>
                    {g.status || t('dash_pending', 'Pending')}
                  </span>
                </div>
                {g.adminReply && (
                  <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: 12, borderLeft: '3px solid #22C55E' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', textTransform: 'uppercase', marginBottom: 4 }}>Officer Response</div>
                    <div style={{ fontSize: 13, color: '#E6F1FB', lineHeight: 1.5 }}>{g.adminReply}</div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Grievance Modal */}
      <AnimatePresence>
        {shGrievanceModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,12,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShGrievanceModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
              style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 500, overflow: 'hidden' }}
            >
              <div style={{ height: 4, background: '#F97316' }} />
              <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Lodge Grievance</h3>
                <button onClick={() => setShGrievanceModal(false)} style={{ background: '#131E33', border: 'none', color: '#6B7FAA', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}>×</button>
              </div>

              <form onSubmit={submitGrievance} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input required className="govai-input" placeholder="Ticket Title" value={gForm.title} onChange={e => setGForm({ ...gForm, title: e.target.value })} />
                <select className="govai-input" value={gForm.department} onChange={e => setGForm({ ...gForm, department: e.target.value })}>
                  <option value="Revenue">Revenue Authority</option>
                  <option value="General">General Administration</option>
                </select>
                <select required className="govai-input" value={gForm.area} onChange={e => setGForm({ ...gForm, area: e.target.value })}>
                  <option value="" disabled>Select Area/Jurisdiction</option>
                  <option value="Ambole Pali">Ambole Pali</option>
                  <option value="Panvel">Panvel</option>
                  <option value="North Zone">North Zone</option>
                  <option value="South Zone">South Zone</option>
                  <option value="East Zone">East Zone</option>
                  <option value="West Zone">West Zone</option>
                  <option value="Central Zone">Central Zone</option>
                </select>
                <textarea required className="govai-input" placeholder="Detailed description..." rows={4} value={gForm.description} onChange={e => setGForm({ ...gForm, description: e.target.value })} style={{ resize: 'none' }} />
                <button type="submit" disabled={gSubmitting} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
                  {gSubmitting ? 'Submitting...' : 'Submit Grievance'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
