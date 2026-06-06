import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/DashboardLayout';
import {
  BarChart3,
  Clock,
  FileCheck,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

/* ─────────────────────────────────────────
   Certificate type metadata
───────────────────────────────────────── */
const CERT_META = {
  Income: { label: 'Income Certificate', icon: <FileText size={18} />, color: '#F97316', bg: 'rgba(249,115,22,0.1)' },
  Domicile: { label: 'Domicile Certificate', icon: <FileCheck size={18} />, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
  EWS: { label: 'EWS Certificate', icon: <BarChart3 size={18} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  Birth: { label: 'Birth Certificate', icon: <Clock size={18} />, color: '#A855F7', bg: 'rgba(168,85,247,0.1)' },
};

const CERT_TYPES = Object.keys(CERT_META);

/* ─────────────────────────────────────────
   Animation Variants
───────────────────────────────────────── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const hoverScale = {
  hover: { scale: 1.02, y: -4, transition: { duration: 0.2, ease: "easeOut" } }
};

/* ─────────────────────────────────────────
   Status badge config
───────────────────────────────────────── */
const STATUS_CONFIG = {
  Approved: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', icon: <CheckCircle2 size={12} /> },
  Rejected: { bg: 'rgba(239,68,68,0.10)', color: '#EF4444', icon: <XCircle size={12} /> },
  'In Progress': { bg: 'rgba(59,130,246,0.12)', color: '#60A5FA', icon: <Clock size={12} /> },
  Pending: { bg: 'rgba(249,115,22,0.12)', color: '#F97316', icon: <AlertCircle size={12} /> },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.02em',
      border: `1px solid ${cfg.color}1A`
    }}>
      {cfg.icon}
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent, icon, delay }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      variants={hoverScale}
      style={{
        background: 'linear-gradient(145deg, #0D1626 0%, #09101D 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 20, padding: '24px',
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: accent, opacity: 0.1, filter: 'blur(35px)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
            {label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
              {value}
            </h2>
            {value !== '—' && <TrendingUp size={16} color={accent} style={{ opacity: 0.8 }} />}
          </div>
          <p style={{ fontSize: 12, color: '#4B5B7A', marginTop: 8, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
            {sub}
          </p>
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `${accent}15`, border: `1px solid ${accent}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Apply Modal
───────────────────────────────────────── */
function ApplyModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(2,6,12,0.85)',
        backdropFilter: 'blur(12px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        style={{
          background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, width: '100%', maxWidth: 500, position: 'relative',
          overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ height: 4, background: 'linear-gradient(90deg, #F97316, #3B82F6, #22C55E)' }} />
        <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Choose Certificate</h3>
          <button onClick={onClose} style={{ background: '#131E33', border: 'none', color: '#6B7FAA', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        <div style={{ padding: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          {CERT_TYPES.map((type) => {
            const m = CERT_META[type];
            return (
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                key={type}
                onClick={() => { navigate(`/apply?type=${type}`); onClose(); }}
                style={{
                  background: '#070C18', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 16, padding: '20px', cursor: 'pointer',
                  textAlign: 'left', transition: 'border-color 0.2s',
                  display: 'flex', flexDirection: 'column', gap: 12
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = m.color + '40'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
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
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [applications, setApplications] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shGrievanceModal, setShGrievanceModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [gForm, setGForm] = useState({ title: '', department: 'General', area: '', description: '' });
  const [gSubmitting, setGSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, grvRes] = await Promise.all([
          axios.get('http://localhost:5000/api/applications/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/grievances/my', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setApplications(appRes.data.data);
        setGrievances(grvRes.data.data);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const submitGrievance = async (e) => {
    e.preventDefault();
    setGSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/grievances', gForm, { headers: { Authorization: `Bearer ${token}` } });
      setGrievances([res.data.data, ...grievances]);
      setShGrievanceModal(false);
      setGForm({ title: '', department: 'General', area: '', description: '' });
    } finally {
      setGSubmitting(false);
    }
  };

  const stats = {
    total: applications.length,
    approved: applications.filter(a => a.status === 'Approved').length,
    pending: applications.filter(a => ['Pending', 'In Progress'].includes(a.status)).length,
    grievances: grievances.length
  };

  const filtered = activeFilter === 'All' ? applications : applications.filter(a => a.status === activeFilter);
  const FILTERS = ['All', 'Approved', 'In Progress', 'Pending', 'Rejected'];

  return (
    <DashboardLayout>
      <div style={{ position: 'relative', minHeight: '100%' }}>
        {/* Background Glows */}
        <div style={{ position: 'fixed', top: '10%', right: '5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', bottom: '10%', left: '5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(59,130,246,0.03) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <motion.div
          initial="hidden" animate="visible" variants={containerVariants}
          style={{ position: 'relative', zIndex: 1 }}
        >
          {/* ── Header Section ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 20 }}>
            <motion.div variants={itemVariants}>
              <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 8px' }}>
                {t('sidebar_dashboard')}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 10px #22C55E' }} className="pulse" />
                <span style={{ fontSize: 14, color: '#4B5B7A', fontWeight: 600 }}>
                  {t('dash_activeSession')} <span style={{ color: '#fff' }}>{user?.fullName}</span>
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setShGrievanceModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px' }}>
                <AlertCircle size={16} /> {t('dash_lodgeComplaint')}
              </button>
              <button className="btn-primary" onClick={() => setShowApplyModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px' }}>
                <Plus size={18} /> {t('dash_newApplication')}
              </button>
            </motion.div>
          </div>

          {/* ── Stats Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
            <StatCard label={t('dash_totalSubmissions')} value={loading ? '—' : stats.total} sub={t('dash_totalApplicationsFiled')} icon={<FileText size={24} />} accent="#F97316" />
            <StatCard label={t('dash_approvedDocuments')} value={loading ? '—' : stats.approved} sub={t('dash_verifiedByAuthorities')} icon={<FileCheck size={24} />} accent="#22C55E" />
            <StatCard label={t('dash_awaitingReview')} value={loading ? '—' : stats.pending} sub={t('dash_inValidationPipeline')} icon={<Clock size={24} />} accent="#3B82F6" />
            <StatCard label={t('dash_activeGrievances')} value={loading ? '—' : stats.grievances} sub={t('dash_openSupportTickets')} icon={<AlertCircle size={24} />} accent="#A855F7" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
            {/* ── Main Application Tracking ── */}
            <motion.div variants={itemVariants} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{t('dash_applicationTracking')}</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {FILTERS.map(f => {
                    const fKeys = { 'All': 'dash_all', 'Approved': 'dash_approved', 'In Progress': 'dash_inProgress', 'Pending': 'dash_pending', 'Rejected': 'dash_rejected' };
                    return (
                      <button key={f} className={`filter-pill ${activeFilter === f ? 'active' : ''}`} onClick={() => setActiveFilter(f)}>
                        {t(fKeys[f]) || f}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ padding: '20px 30px 30px' }}>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 16 }} />)}
                  </div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>📂</div>
                    <p style={{ color: '#4B5B7A', fontWeight: 600 }}>{t('dash_noApplications')}</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filtered.map((app, idx) => (
                      <React.Fragment key={app._id}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 5, background: 'rgba(255,255,255,0.02)' }}
                        key={app._id}
                        style={{
                          display: 'grid', gridTemplateColumns: '80px 1fr 140px 100px', alignItems: 'center',
                          padding: '16px 20px', borderRadius: 16, background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.04)', transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#F97316', fontFamily: 'monospace' }}>#{app.trackingId.slice(-6).toUpperCase()}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: CERT_META[app.certificateType]?.bg || 'rgba(255,255,255,0.05)', color: CERT_META[app.certificateType]?.color || '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {CERT_META[app.certificateType]?.icon || <FileText size={16} />}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{app.certificateType} Certificate</span>
                        </div>
                        <StatusBadge status={app.status} />
                        <div style={{ textAlign: 'right' }}>
                          {app.status === 'Approved' ? (
                            <button onClick={() => navigate(`/certificate/${app.trackingId}`)} style={{ background: 'none', border: 'none', color: '#22C55E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontWeight: 800, fontSize: 12 }}>
                              {t('dash_view')} <ArrowRight size={14} />
                            </button>
                          ) : app.status === 'Rejected' ? (
                            <button onClick={() => { navigate(`/apply?type=${app.certificateType}`); setShowApplyModal(false); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontWeight: 800, fontSize: 12 }}>
                              Edit & Re-apply <ArrowRight size={14} />
                            </button>
                          ) : (
                            <div style={{ fontSize: 11, color: '#4B5B7A', fontWeight: 700 }}>{t('dash_inReview')}</div>
                          )}
                        </div>
                      </motion.div>
                      {app.status === 'Rejected' && app.adminRemark && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-1 ml-4 mr-4 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <p className="text-xs text-red-400 font-medium"><strong className="font-bold">Rejection Reason:</strong> {app.adminRemark}</p>
                         </motion.div>
                      )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* ── Sidebar Actions ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Quick Actions */}
              <motion.div variants={itemVariants} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24 }}>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('dash_recentGrievances')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {grievances.length === 0 ? (
                    <p style={{ fontSize: 12, color: '#4B5B7A', margin: 0 }}>{t('dash_noActiveGrievances')}</p>
                  ) : (
                    grievances.slice(0, 3).map(g => (
                      <div key={g._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</div>
                        <div style={{ fontSize: 11, color: '#4B5B7A' }}>{g.department} · {new Date(g.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                  <button onClick={() => navigate('/dashboard/grievances')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '10px 0 0', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {t('dash_viewAllTickets')} <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>

              {/* Resources */}
              <motion.div variants={itemVariants} style={{ background: 'linear-gradient(135deg, #F9731620 0%, #3B82F620 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{t('dash_needHelp')}</h4>
                  <p style={{ fontSize: 12, color: '#9DB4D8', lineHeight: 1.6, marginBottom: 20 }}>{t('dash_aiAssistantDesc')}</p>
                  <button onClick={() => navigate('/dashboard/support')} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: 12, padding: '12px', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {t('dash_helpCenter')} <ExternalLink size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showApplyModal && <ApplyModal onClose={() => setShowApplyModal(false)} />}
        </AnimatePresence>

        <AnimatePresence>
          {shGrievanceModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,12,0.85)', backdropFilter: 'blur(12px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShGrievanceModal(false); }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
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
      </div>
    </DashboardLayout>
  );
}