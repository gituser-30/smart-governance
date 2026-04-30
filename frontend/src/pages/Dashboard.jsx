import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import DashboardLayout from '../components/DashboardLayout';

/* ─────────────────────────────────────────
   Certificate type metadata (UI only)
───────────────────────────────────────── */
const CERT_META = {
  Income:   { label: 'Income Certificate',   icon: '⚡', accent: '#F97316' },
  Domicile: { label: 'Domicile Certificate', icon: '📍', accent: '#22C55E' },
  EWS:      { label: 'EWS Certificate',      icon: '🏛', accent: '#3B82F6' },
  Birth:    { label: 'Birth Certificate',    icon: '🌱', accent: '#A855F7' },
};

const CERT_TYPES = Object.keys(CERT_META);

/* ─────────────────────────────────────────
   Status badge config
───────────────────────────────────────── */
const STATUS_CONFIG = {
  Approved:      { bg: 'rgba(34,197,94,0.12)',   color: '#22C55E', dot: '#22C55E' },
  Rejected:      { bg: 'rgba(239,68,68,0.10)',   color: '#EF4444', dot: '#EF4444' },
  'In Progress': { bg: 'rgba(59,130,246,0.12)',  color: '#60A5FA', dot: '#60A5FA' },
  Pending:       { bg: 'rgba(249,115,22,0.12)',  color: '#F97316', dot: '#F97316' },
};

/* ─────────────────────────────────────────
   Tiny reusable components
───────────────────────────────────────── */
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 20,
      background: cfg.bg, color: cfg.color,
      fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, accent, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      style={{
        background: '#0D1626',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '20px 22px',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: accent, opacity: 0.07, filter: 'blur(20px)',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, margin: '0 0 8px' }}>
            {label}
          </p>
          <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1, margin: '0 0 6px' }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: 11, color: '#4B5B7A', margin: 0, fontWeight: 500 }}>{sub}</p>}
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${accent}1A`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Apply Modal — cert type picker
───────────────────────────────────────── */
const MODAL_OVERLAY = {
  position: 'fixed', inset: 0,
  background: 'rgba(4,10,20,0.82)', backdropFilter: 'blur(10px)',
  zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
};
const MODAL_CARD = {
  background: '#0D1626',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 18, width: '100%', position: 'relative', overflow: 'hidden',
};
const TRIBAR = {
  height: 3,
  background: 'linear-gradient(90deg,#F97316 33%,rgba(255,255,255,0.4) 33% 66%,#22C55E 66%)',
};
const MODAL_HEAD = {
  padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};
const MODAL_TITLE = { fontSize: 17, fontWeight: 800, color: '#fff' };
const CLOSE_BTN = {
  width: 28, height: 28, borderRadius: '50%',
  background: '#131E33', border: 'none',
  color: '#6B7FAA', fontSize: 18, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1,
};

function ApplyModal({ onClose }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={MODAL_OVERLAY}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 24 }}
        style={{ ...MODAL_CARD, maxWidth: 440 }}
      >
        <div style={TRIBAR} />
        <div style={MODAL_HEAD}>
          <span style={MODAL_TITLE}>Apply for Certificate</span>
          <button style={CLOSE_BTN} onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {CERT_TYPES.map((type) => {
            const m = CERT_META[type];
            return (
              <button
                key={type}
                onClick={() => { navigate(`/apply?type=${type}`); onClose(); }}
                style={{
                  background: '#0A1120', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '16px 14px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all .15s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = m.accent + '55';
                  e.currentTarget.style.background = m.accent + '0D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = '#0A1120';
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{type}</div>
                <div style={{ fontSize: 10, color: '#4B5B7A', fontWeight: 500 }}>Certificate</div>
              </button>
            );
          })}
        </div>
        <div style={{ padding: '0 22px 20px' }}>
          <p style={{ fontSize: 11, color: '#4B5B7A', textAlign: 'center', margin: 0 }}>
            Select the certificate type you want to apply for
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────── */
export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  /* ── State (UNCHANGED — exact original structure) ── */
  const [applications, setApplications]         = useState([]);
  const [grievances, setGrievances]             = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [shGrievanceModal, setShGrievanceModal] = useState(false);
  const [gForm, setGForm]                       = useState({ title: '', department: 'General', area: '', description: '' });

  /* ── Extra UI state (no logic impact) ── */
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [activeFilter, setActiveFilter]     = useState('All');
  const [gSubmitting, setGSubmitting]       = useState(false);

  /* ── Data fetch (UNCHANGED logic) ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, grvRes] = await Promise.all([
          axios.get('http://localhost:5000/api/applications/my-applications',
            { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:5000/api/grievances/my',
            { headers: { Authorization: `Bearer ${token}` } }),
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

  /* ── Grievance submit (UNCHANGED logic) ── */
  const submitGrievance = async (e) => {
    e.preventDefault();
    setGSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/grievances', gForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGrievances([res.data.data, ...grievances]);
      setShGrievanceModal(false);
      setGForm({ title: '', department: 'General', area: '', description: '' });
      alert('Grievance submitted successfully!');
    } catch {
      alert('Failed to submit grievance');
    } finally {
      setGSubmitting(false);
    }
  };

  /* ── Derived stats from REAL data only ── */
  const totalApps = applications.length;
  const approved  = applications.filter(a => a.status === 'Approved').length;
  const inProgress= applications.filter(a => a.status === 'In Progress').length;
  const pending   = applications.filter(a => a.status === 'Pending').length;
  const rejected  = applications.filter(a => a.status === 'Rejected').length;
  const totalGrv  = grievances.length;

  /* ── Filtered list ── */
  const FILTERS = ['All', 'Approved', 'In Progress', 'Pending', 'Rejected'];
  const filtered = activeFilter === 'All'
    ? applications
    : applications.filter(a => a.status === activeFilter);

  const recentGrievances = grievances.slice(0, 3);

  /* ── Status breakdown for summary bar ── */
  const breakdown = [
    { label: 'Approved',    count: approved,   color: '#22C55E' },
    { label: 'In Progress', count: inProgress, color: '#3B82F6' },
    { label: 'Pending',     count: pending,    color: '#F97316' },
    { label: 'Rejected',    count: rejected,   color: '#EF4444' },
  ];

  return (
    <DashboardLayout>          {/* ─── TOP BAR ─── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}
          >
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: '0 0 5px' }}>
                Welcome back,{' '}
                <span style={{ color: '#F97316' }}>{user?.fullName?.split(' ')[0] || 'there'}</span>
              </h1>
              <p style={{ fontSize: 13, color: '#4B5B7A', margin: 0, fontWeight: 500 }}>
                Track your certificate applications and manage your requests
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
              <button className="btn-secondary" onClick={() => setShGrievanceModal(true)}>
                💬 Lodge Complaint
              </button>
              <button className="btn-primary" onClick={() => setShowApplyModal(true)}>
                + Apply for Certificate
              </button>
            </div>
          </motion.div>

          {/* ─── STAT CARDS (real data only) ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 26 }}>
            <StatCard
              label="Total Applications" value={loading ? '—' : totalApps}
              sub="All submissions" icon="📋" accent="#F97316" delay={0.05}
            />
            <StatCard
              label="Approved" value={loading ? '—' : approved}
              sub={approved > 0 ? 'Ready to download' : 'None yet'} icon="✅" accent="#22C55E" delay={0.10}
            />
            <StatCard
              label="In Progress" value={loading ? '—' : inProgress + pending}
              sub="Being processed" icon="⏳" accent="#3B82F6" delay={0.15}
            />
            <StatCard
              label="Grievances Filed" value={loading ? '—' : totalGrv}
              sub="Complaints logged" icon="💬" accent="#A855F7" delay={0.20}
            />
          </div>

          {/* ─── CONTENT GRID ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 18, alignItems: 'start' }}>

            {/* ── LEFT: Applications Table ── */}
            <motion.div
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              style={{
                background: '#0D1626',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div style={{ padding: '20px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>My Applications</div>
                  <div style={{ fontSize: 11, color: '#4B5B7A', marginTop: 3, fontWeight: 500 }}>
                    {loading ? 'Loading…' : `${totalApps} submitted · ${approved} approved`}
                  </div>
                </div>
              </div>

              {/* Filter pills */}
              <div style={{ padding: '14px 22px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FILTERS.map((f) => {
                  const count = f === 'All'
                    ? totalApps
                    : applications.filter(a => a.status === f).length;
                  return (
                    <button
                      key={f}
                      className={`filter-pill${activeFilter === f ? ' active' : ''}`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {f}
                      {!loading && <span style={{ marginLeft: 4, opacity: 0.65 }}>({count})</span>}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              {loading ? (
                <div style={{ padding: '0 22px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 52 }} />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px 22px', textAlign: 'center', color: '#4B5B7A' }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>📭</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7FAA' }}>No applications found</div>
                  <div style={{ fontSize: 12, marginTop: 5 }}>
                    {activeFilter === 'All'
                      ? 'Click "Apply for Certificate" to get started.'
                      : `No ${activeFilter} applications.`}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0 22px 22px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        {['Tracking ID', 'Certificate Type', 'Status', 'Action'].map((h, i) => (
                          <th
                            key={h}
                            style={{
                              textAlign: i === 3 ? 'right' : 'left',
                              padding: '0 0 10px',
                              fontSize: 10, fontWeight: 700, color: '#4B5B7A',
                              letterSpacing: '0.07em', textTransform: 'uppercase',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((app, idx) => (
                        <motion.tr
                          key={app._id}
                          className="row-hover"
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, duration: 0.25 }}
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                        >
                          <td style={{ padding: '13px 0', fontWeight: 600, color: '#7B99C8', fontFamily: 'monospace', fontSize: 12 }}>
                            #{app.trackingId.slice(0, 8).toUpperCase()}
                          </td>
                          <td style={{ padding: '13px 0', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 15 }}>
                                {CERT_META[app.certificateType]?.icon || '📄'}
                              </span>
                              {app.certificateType} Certificate
                            </div>
                          </td>
                          <td style={{ padding: '13px 0' }}>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={{ padding: '13px 0', textAlign: 'right' }}>
                            {app.status === 'Approved' ? (
                              <button
                                onClick={() => navigate(`/certificate/${app.trackingId}`)}
                                style={{
                                  background: 'rgba(34,197,94,0.1)',
                                  border: '1px solid rgba(34,197,94,0.22)',
                                  color: '#22C55E', borderRadius: 8,
                                  padding: '5px 12px', fontSize: 11, fontWeight: 700,
                                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif",
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                }}
                              >
                                ↓ View
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: '#4B5B7A', fontWeight: 500 }}>
                                Processing…
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* ── RIGHT: Sidebar panels ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Quick Apply */}
              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.35 }}
                style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 14 }}>Quick Apply</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {CERT_TYPES.map((type) => {
                    const m = CERT_META[type];
                    return (
                      <button
                        key={type}
                        onClick={() => navigate(`/apply?type=${type}`)}
                        style={{
                          background: '#0A1120', border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: 10, padding: '13px 10px', cursor: 'pointer',
                          textAlign: 'left', transition: 'all .15s',
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = m.accent + '55';
                          e.currentTarget.style.background = m.accent + '0D';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.background = '#0A1120';
                        }}
                      >
                        <div style={{ fontSize: 20, marginBottom: 6 }}>{m.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#c0cfe8', lineHeight: 1.3 }}>{type}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Recent Grievances */}
              <motion.div
                initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33, duration: 0.35 }}
                style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>My Grievances</div>
                  <button
                    onClick={() => setShGrievanceModal(true)}
                    style={{ fontSize: 11, fontWeight: 700, color: '#F97316', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                  >
                    + New
                  </button>
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 54 }} />)}
                  </div>
                ) : recentGrievances.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#4B5B7A', fontSize: 12 }}>
                    No grievances filed yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recentGrievances.map((g) => (
                      <div
                        key={g._id}
                        style={{
                          background: '#0A1120', borderRadius: 10, padding: '11px 13px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderLeft: '3px solid #F97316',
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {g.title}
                        </div>
                        <div style={{ fontSize: 10, color: '#4B5B7A', fontWeight: 500 }}>
                          {g.department}{g.area ? ` · ${g.area}` : ''}
                        </div>
                      </div>
                    ))}
                    {grievances.length > 3 && (
                      <div style={{ fontSize: 11, color: '#4B5B7A', textAlign: 'center', paddingTop: 2 }}>
                        +{grievances.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Application Status Breakdown (real data) */}
              {!loading && totalApps > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38, duration: 0.35 }}
                  style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}
                >
                  <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>Status Breakdown</div>
                  {breakdown.map((row) => (
                    <div key={row.label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: '#9DB4D8', fontWeight: 600 }}>{row.label}</span>
                        <span style={{ fontSize: 11, color: row.color, fontWeight: 700 }}>{row.count}</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: totalApps > 0 ? `${(row.count / totalApps) * 100}%` : '0%' }}
                          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                          style={{ height: '100%', background: row.color, borderRadius: 4 }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

            </div>
          </div>

      <AnimatePresence>
        {showApplyModal && <ApplyModal onClose={() => setShowApplyModal(false)} />}
      </AnimatePresence>
    {/* ════════════ APPLY MODAL ════════════ */}

      {/* ════════════ GRIEVANCE MODAL ════════════ */}
      <AnimatePresence>
        {shGrievanceModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={MODAL_OVERLAY}
            onClick={(e) => { if (e.target === e.currentTarget) setShGrievanceModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ ...MODAL_CARD, maxWidth: 480 }}
            >
              <div style={TRIBAR} />
              <div style={MODAL_HEAD}>
                <span style={MODAL_TITLE}>Lodge a Complaint</span>
                <button style={CLOSE_BTN} onClick={() => setShGrievanceModal(false)}>×</button>
              </div>

              <form onSubmit={submitGrievance}>
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Title *
                    </label>
                    <input
                      required className="govai-input" type="text"
                      value={gForm.title}
                      onChange={(e) => setGForm({ ...gForm, title: e.target.value })}
                      placeholder="E.g., Delay in Income verification"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Department
                    </label>
                    <select
                      className="govai-input"
                      value={gForm.department}
                      onChange={(e) => setGForm({ ...gForm, department: e.target.value })}
                    >
                      <option value="Revenue">Revenue Authority</option>
                      <option value="General">General Administration</option>
                      <option value="Technical">Technical Operations</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Area / Jurisdiction *
                    </label>
                    <select
                      required className="govai-input"
                      value={gForm.area}
                      onChange={(e) => setGForm({ ...gForm, area: e.target.value })}
                    >
                      <option value="">Select Area</option>
                      <option value="North Zone">North Zone</option>
                      <option value="South Zone">South Zone</option>
                      <option value="East Zone">East Zone</option>
                      <option value="West Zone">West Zone</option>
                      <option value="Central Zone">Central Zone</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#4B5B7A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Description *
                    </label>
                    <textarea
                      required className="govai-input" rows={3}
                      value={gForm.description}
                      onChange={(e) => setGForm({ ...gForm, description: e.target.value })}
                      placeholder="Provide full context of your complaint…"
                      style={{ resize: 'none' }}
                    />
                  </div>
                </div>

                <div style={{
                  padding: '14px 24px 20px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', justifyContent: 'flex-end', gap: 10,
                }}>
                  <button
                    type="button"
                    onClick={() => setShGrievanceModal(false)}
                    style={{
                      padding: '10px 20px', fontWeight: 700, color: '#6B7FAA',
                      background: '#131E33', border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: 10, cursor: 'pointer', fontSize: 13,
                      fontFamily: "'Plus Jakarta Sans',sans-serif",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gSubmitting}
                    style={{
                      padding: '10px 22px', fontWeight: 800, color: '#fff',
                      background: gSubmitting ? '#7a3d0f' : '#F97316',
                      border: 'none', borderRadius: 10,
                      cursor: gSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
                      boxShadow: '0 4px 16px rgba(249,115,22,0.28)',
                      transition: 'background .15s',
                    }}
                  >
                    {gSubmitting ? 'Submitting…' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}