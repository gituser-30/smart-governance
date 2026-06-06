import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Search, CheckCircle, XCircle, Eye, ClipboardList, User as UserIcon, Loader2, Shield, FileText } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend, Filler);

export default function AdminDashboard() {
   const { token, user } = useAuth();
   const navigate = useNavigate();
   const [applications, setApplications] = useState([]);
   const [grievances, setGrievances] = useState([]);
   const [totalUsers, setTotalUsers] = useState(0);
   const [loading, setLoading] = useState(true);

   const [selectedApp, setSelectedApp] = useState(null);
   const [updating, setUpdating] = useState(false);

   const [searchQuery, setSearchQuery] = useState('');
   const [userHistory, setUserHistory] = useState([]);
   const [showHistoryModal, setShowHistoryModal] = useState(false);
   const [historyLoading, setHistoryLoading] = useState(false);

   const [rejectionRemark, setRejectionRemark] = useState('');
   const [showRejectPrompt, setShowRejectPrompt] = useState(false);

   useEffect(() => {
      if (user && user.role !== 'admin') navigate('/dashboard');
   }, [user, navigate]);

   useEffect(() => { fetchData(); }, [token]);

   const fetchData = async () => {
      try {
         const [appRes, grvRes, userRes] = await Promise.all([
            axios.get('http://localhost:5000/api/applications/all', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/grievances/all', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/auth/users/count', { headers: { Authorization: `Bearer ${token}` } })
         ]);
         setApplications(appRes.data.data);
         setGrievances(grvRes.data.data);
         setTotalUsers(userRes.data.count || 0);
      } catch (err) { console.error("Failed to load data", err); }
      finally { setLoading(false); }
   };

   const handleUpdateStatus = async (id, newStatus, reason = null) => {
      setUpdating(true);
      try {
         await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status: newStatus, rejectionReason: reason }, { headers: { Authorization: `Bearer ${token}` } });
         setApplications(applications.map(app => app._id === id ? { ...app, status: newStatus } : app));
         setSelectedApp(null);
         setShowRejectPrompt(false);
         setRejectionRemark('');
      } catch (err) { alert('Failed to update status.'); }
      finally { setUpdating(false); }
   };

   const handleViewHistory = async (userId) => {
      setShowHistoryModal(true);
      setHistoryLoading(true);
      try {
         const res = await axios.get(`http://localhost:5000/api/applications/user-history/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
         setUserHistory(res.data.data);
      } catch (err) { console.error("Failed to load user history", err); }
      finally { setHistoryLoading(false); }
   };

   const filteredApps = applications.filter(app =>
      (app.trackingId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.certificateType || '').toLowerCase().includes(searchQuery.toLowerCase())
   );

   const stats = {
      pending: applications.filter(a => a.status === 'Pending Review' || a.status === 'Submitted' || a.status === 'AI Verified').length,
      inProgress: applications.filter(a => a.status === 'In Progress').length,
      approved: applications.filter(a => a.status === 'Approved').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
   };

   const getStatusBadge = (status) => {
      const map = { 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'In Progress': 'badge-progress' };
      return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || 'badge-pending'}`} style={{
          background: status === 'Approved' ? 'rgba(34,197,94,0.12)' : status === 'Rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.12)',
          color: status === 'Approved' ? '#22C55E' : status === 'Rejected' ? '#EF4444' : '#F97316'
      }}>{status}</span>;
   };

   // Generate monthly chart data
   const getMonthlyData = () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map(m => ({ name: m, Requests: 0, Pending: 0, SolvedGrievances: 0 }));
      
      applications.forEach(app => {
         const d = new Date(app.createdAt);
         const monthIndex = d.getMonth();
         data[monthIndex].Requests += 1;
         if (['Pending Review', 'In Progress', 'Submitted', 'AI Verified'].includes(app.status)) {
            data[monthIndex].Pending += 1;
         }
      });
      
      grievances.forEach(g => {
         const d = new Date(g.createdAt);
         const monthIndex = d.getMonth();
         if (g.status === 'Resolved') {
            data[monthIndex].SolvedGrievances += 1;
         } else {
            data[monthIndex].Pending += 1; 
         }
      });
      
      return data;
   };
   const chartData = getMonthlyData();

   return (
      <AdminLayout>
         {/* Header */}
         <div className="flex flex-wrap justify-between items-end mb-8 pb-6 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
               <h2 className="text-2xl font-black text-white">System Analytics & Overview</h2>
               <p className="text-navy-400 font-medium text-sm mt-1" style={{ color: '#6B7FAA' }}>Monitor citizen engagement and system performance.</p>
            </div>
         </div>

         {/* Analytics Panel */}
         <div style={{ background: 'linear-gradient(145deg, rgba(13,22,38,0.9), rgba(9,16,29,0.95))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, marginBottom: 40, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
               {[
                  { label: 'Active Citizens', value: totalUsers, color: '#A855F7' },
                  { label: 'Total Requests', value: applications.length, color: '#3B82F6' },
                  { label: 'Pending Issues', value: stats.pending + grievances.filter(g => g.status !== 'Resolved').length, color: '#F97316' },
                  { label: 'Resolved Cases', value: stats.approved + grievances.filter(g => g.status === 'Resolved').length, color: '#22C55E' },
               ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
                     <p style={{ fontSize: 11, fontWeight: 800, color: '#5B6E94', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{s.label}</p>
                     <p style={{ fontSize: 32, fontWeight: 900, color: s.color, fontFamily: 'monospace' }}>{s.value}</p>
                  </div>
               ))}
            </div>

            {/* Graphical Analytics */}
            <div>
               <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} /> Monthly Engagement Graph
               </h3>
               <div style={{ width: '100%', height: 320, background: 'rgba(2,21,38,0.5)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <Line 
                     options={{
                     responsive: true,
                     maintainAspectRatio: false,
                     plugins: {
                        legend: { position: 'top', labels: { color: '#fff', font: { family: 'Outfit', weight: 'bold' } } }
                     },
                     scales: {
                        x: { grid: { display: false }, ticks: { color: '#5B6E94', font: { family: 'monospace' } } },
                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#5B6E94' }, beginAtZero: true }
                     },
                     interaction: { mode: 'index', intersect: false }
                  }}
                  data={{
                     labels: chartData.map(d => d.name),
                     datasets: [
                        {
                           label: 'Requests',
                           data: chartData.map(d => d.Requests),
                           borderColor: '#3B82F6',
                           backgroundColor: 'rgba(59, 130, 246, 0.2)',
                           fill: true,
                           tension: 0.4,
                           borderWidth: 3,
                           pointBackgroundColor: '#3B82F6'
                        },
                        {
                           label: 'Pending Issues',
                           data: chartData.map(d => d.Pending),
                           borderColor: '#F97316',
                           backgroundColor: 'rgba(249, 115, 22, 0.2)',
                           fill: true,
                           tension: 0.4,
                           borderWidth: 3,
                           pointBackgroundColor: '#F97316'
                        },
                        {
                           label: 'Solved Grievances',
                           data: chartData.map(d => d.SolvedGrievances),
                           borderColor: '#22C55E',
                           backgroundColor: 'rgba(34, 197, 94, 0.2)',
                           fill: true,
                           tension: 0.4,
                           borderWidth: 3,
                           pointBackgroundColor: '#22C55E'
                        }
                     ]
                  }} 
               />
            </div>
         </div>
      </div>

         {/* Application Review Header */}
         <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
            <div>
               <h3 className="text-xl font-black text-white">Application Queue</h3>
               <p className="text-navy-400 font-medium text-sm mt-1" style={{ color: '#6B7FAA' }}>Review and approve AI-verified citizen applications.</p>
            </div>
            <div className="flex-1 max-w-sm">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#5B6E94' }} />
                  <input type="text" placeholder="Search by ID, Name, Email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="govai-input pl-10" />
               </div>
            </div>
         </div>

         {/* Applications Table */}
         <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
               <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                  <thead>
                     <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase' }}>Tracking ID</th>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase' }}>Applicant</th>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase' }}>Certificate</th>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '16px 22px', fontSize: 11, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase', textAlign: 'center' }}>Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {loading ? (
                        <tr><td colSpan="6" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#22C55E' }} /></td></tr>
                     ) : filteredApps.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-12 font-medium" style={{ color: '#5B6E94' }}>No applications found.</td></tr>
                     ) : (
                        filteredApps.map((app) => (
                           <tr key={app._id} className="row-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '16px 22px', fontWeight: 600, fontFamily: 'monospace', color: '#7B99C8' }}>#{app.trackingId}</td>
                              <td style={{ padding: '16px 22px' }}>
                                 <div className="flex items-center gap-3">
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserIcon size={16} /></div>
                                    <div>
                                       <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                          {app.user?.fullName}
                                          <button onClick={() => handleViewHistory(app.user?._id)} title="View History" style={{ color: '#3B82F6' }}><ClipboardList size={14} /></button>
                                       </div>
                                       <div style={{ fontSize: 11, color: '#5B6E94' }}>{app.user?.email}</div>
                                    </div>
                                 </div>
                              </td>
                              <td style={{ padding: '16px 22px', fontWeight: 600, fontSize: 13 }}>{app.certificateType}</td>
                              <td style={{ padding: '16px 22px', fontSize: 13, color: '#5B6E94' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                              <td style={{ padding: '16px 22px' }}>{getStatusBadge(app.status)}</td>
                              <td style={{ padding: '16px 22px', textAlign: 'center' }}>
                                 <button onClick={() => setSelectedApp(app)} className="btn-secondary">Review</button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Review Application Modal */}
         <AnimatePresence>
            {selectedApp && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => { setSelectedApp(null); setShowRejectPrompt(false); }}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 768, maxHeight: '90vh', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
                     <div style={{ height: 4, background: 'linear-gradient(90deg, #F97316, #3B82F6, #22C55E)' }} />
                     <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(13,22,38,0.9)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
                        <div>
                           <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#fff' }}>Review Application</h3>
                           <p style={{ fontSize: 12, color: '#5B6E94', marginTop: 4, fontFamily: 'monospace' }}>Ref: {selectedApp.trackingId} | Citizen: {selectedApp.user?.fullName}</p>
                        </div>
                         <button onClick={() => { setSelectedApp(null); setShowRejectPrompt(false); }} style={{ background: 'transparent', border: 'none', color: '#5B6E94', cursor: 'pointer' }}><XCircle size={24} /></button>
                     </div>

                     <div style={{ padding: '24px 30px' }}>
                        <div style={{ marginBottom: 30 }}>
                           <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 4, height: 16, background: '#F97316', borderRadius: 2 }} /> Form Data
                           </h4>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                              {Object.entries(selectedApp.formFields || {}).map(([key, val]) => (
                                 <div key={key}>
                                    <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#5B6E94', textTransform: 'uppercase', marginBottom: 4 }}>{key}</span>
                                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#fff' }}>{val || 'N/A'}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <h4 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 4, height: 16, background: '#22C55E', borderRadius: 2 }} /> Uploaded Documents
                           </h4>
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                              {selectedApp.documents?.map((doc, idx) => (
                                 <a key={idx} href={doc.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', padding: 16, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, background: 'rgba(255,255,255,0.01)', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                                    <div style={{ padding: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 10, color: '#5B6E94' }}><FileText size={20} /></div>
                                    <div style={{ marginLeft: 16, flex: 1, overflow: 'hidden' }}>
                                       <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.type}</div>
                                       {doc.status === 'verified' && <div style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><CheckCircle size={12} /> AI Verified</div>}
                                       {doc.status === 'rejected' && (
                                          <div style={{ marginTop: 6 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> AI Flagged</div>
                                            {doc.aiRemark && <div style={{ fontSize: 10, color: '#fca5a5', marginTop: 4, background: 'rgba(239,68,68,0.1)', padding: 6, borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>{doc.aiRemark}</div>}
                                          </div>
                                       )}
                                       {(!doc.status || doc.status === 'pending') && <div style={{ fontSize: 10, fontWeight: 800, color: '#F97316', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><Loader2 size={12} className="animate-spin" /> Pending</div>}
                                    </div>
                                    <Eye size={16} style={{ color: '#5B6E94' }} />
                                 </a>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div style={{ padding: '20px 30px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)', position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'flex-end', gap: 12, zIndex: 20 }}>
                        <button onClick={() => { setSelectedApp(null); setShowRejectPrompt(false); }} style={{ background: 'transparent', border: 'none', color: '#5B6E94', fontWeight: 700, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
                        {['Pending Review', 'In Progress', 'Submitted', 'AI Verified'].includes(selectedApp.status) && (
                           <>
                              {!showRejectPrompt ? (
                                <button disabled={updating} onClick={() => {
                                   const remarks = selectedApp.documents?.filter(d => d.status === 'rejected' && d.aiRemark).map(d => d.aiRemark).join(' | ');
                                   setRejectionRemark(remarks || '');
                                   setShowRejectPrompt(true);
                                }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 700, padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}>Reject & Request Resubmission</button>
                              ) : (
                                <div style={{ flex: 1, marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                   <input type="text" value={rejectionRemark} onChange={e => setRejectionRemark(e.target.value)} placeholder="Reason for rejection..." className="govai-input" style={{ flex: 1, padding: '8px 12px' }} />
                                   <button disabled={updating || !rejectionRemark} onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected', rejectionRemark)} style={{ background: '#EF4444', color: '#fff', border: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: 10, cursor: 'pointer' }}>Confirm</button>
                                </div>
                              )}
                              {!showRejectPrompt && (
                                <button disabled={updating} onClick={() => handleUpdateStatus(selectedApp._id, 'Approved')} className="btn-primary">
                                   {updating ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} Approve & Generate
                                </button>
                              )}
                           </>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* User History Modal */}
         <AnimatePresence>
            {showHistoryModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 600, maxHeight: '80vh', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
                     <div style={{ height: 4, background: '#3B82F6' }} />
                     <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(13,22,38,0.9)', backdropFilter: 'blur(8px)', zIndex: 20 }}>
                        <div style={{ flex: 1 }}>
                           <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Applicant History</h3>
                           <p style={{ fontSize: 12, color: '#5B6E94' }}>Past applications</p>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} style={{ background: 'transparent', border: 'none', color: '#5B6E94', cursor: 'pointer' }}><XCircle size={24} /></button>
                     </div>
                     <div style={{ padding: 30 }}>
                        {historyLoading ? (
                           <div className="text-center py-12"><Loader2 size={32} className="animate-spin mx-auto" style={{ color: '#3B82F6' }} /></div>
                        ) : userHistory.length === 0 ? (
                           <div className="text-center py-12" style={{ color: '#5B6E94' }}>No previous history found.</div>
                        ) : (
                           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {userHistory.map(hist => (
                                 <div key={hist._id} style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                       <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{hist.certificateType} Certificate</div>
                                       {getStatusBadge(hist.status)}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#5B6E94', fontFamily: 'monospace' }}>ID: {hist.trackingId}</div>
                                    <div style={{ fontSize: 11, color: '#5B6E94', fontFamily: 'monospace' }}>Applied: {new Date(hist.createdAt).toLocaleDateString()}</div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </AdminLayout>
   );
}
