import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Eye, ClipboardList, User as UserIcon, Loader2, MessageSquare, Reply, Shield, FileText } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
   const { token, user } = useAuth();
   const navigate = useNavigate();
   const [applications, setApplications] = useState([]);
   const [grievances, setGrievances] = useState([]);
   const [loading, setLoading] = useState(true);
   const [viewMode, setViewMode] = useState('applications');

   const [selectedApp, setSelectedApp] = useState(null);
   const [selectedGrievance, setSelectedGrievance] = useState(null);
   const [adminReply, setAdminReply] = useState('');
   const [updating, setUpdating] = useState(false);

   const [searchQuery, setSearchQuery] = useState('');
   const [userHistory, setUserHistory] = useState([]);
   const [showHistoryModal, setShowHistoryModal] = useState(false);
   const [historyLoading, setHistoryLoading] = useState(false);

   useEffect(() => {
      if (user && user.role !== 'admin') navigate('/dashboard');
   }, [user, navigate]);

   useEffect(() => { fetchData(); }, [token]);

   const fetchData = async () => {
      try {
         const [appRes, grvRes] = await Promise.all([
            axios.get('http://localhost:5000/api/applications/all', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/grievances/all', { headers: { Authorization: `Bearer ${token}` } })
         ]);
         setApplications(appRes.data.data);
         setGrievances(grvRes.data.data);
      } catch (err) { console.error("Failed to load data", err); }
      finally { setLoading(false); }
   };

   const handleUpdateStatus = async (id, newStatus) => {
      setUpdating(true);
      try {
         await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
         setApplications(applications.map(app => app._id === id ? { ...app, status: newStatus } : app));
         setSelectedApp(null);
      } catch (err) { alert('Failed to update status.'); }
      finally { setUpdating(false); }
   };

   const handleResolveGrievance = async (id, status) => {
      setUpdating(true);
      try {
         await axios.put(`http://localhost:5000/api/grievances/${id}/resolve`, { status, adminReply }, { headers: { Authorization: `Bearer ${token}` } });
         setGrievances(grievances.map(g => g._id === id ? { ...g, status, adminReply } : g));
         setSelectedGrievance(null);
         setAdminReply('');
      } catch (err) { alert('Failed to resolve grievance.'); }
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

   const filteredGrievances = grievances.filter(g =>
      (g.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
   );

   const stats = {
      pending: applications.filter(a => a.status === 'Pending Review' || a.status === 'Submitted' || a.status === 'AI Verified').length,
      inProgress: applications.filter(a => a.status === 'In Progress').length,
      approved: applications.filter(a => a.status === 'Approved').length,
      rejected: applications.filter(a => a.status === 'Rejected').length,
   };

   const getStatusBadge = (status) => {
      const map = { 'Approved': 'badge-approved', 'Rejected': 'badge-rejected', 'In Progress': 'badge-progress' };
      return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || 'badge-pending'}`}>{status}</span>;
   };

   return (
      <div className="min-h-screen bg-navy-900 flex flex-col relative">
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-red-900/8 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-navy-700/15 rounded-full blur-[100px]"></div>
         </div>

         <Navbar />

         <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-24 w-full relative z-10">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-end mb-8 border-b border-navy-700/30 pb-6 gap-4">
               <div>
                  <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/15 mb-2"><Shield className="w-3 h-3" /> Secure Access</span>
                  <h2 className="text-2xl font-black text-white">Tahsildar Portal</h2>
                  <p className="text-navy-400 font-medium text-sm mt-1">Review AI-verified citizen applications.</p>
               </div>
               <div className="flex-1 max-w-sm">
                  <div className="relative">
                     <Search className="w-4 h-4 absolute left-3.5 top-3 text-navy-500" />
                     <input type="text" placeholder="Search by ID, Name, Email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="gov-input pl-10 text-sm" />
                  </div>
               </div>
               <div className="flex gap-3 items-center">
                  <div className="bg-navy-800/70 p-1 rounded-xl flex border border-navy-700/30">
                     <button onClick={() => setViewMode('applications')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'applications' ? 'bg-navy-700 text-saffron-500 border border-navy-600/30' : 'text-navy-400 hover:text-navy-300'}`}>Applications</button>
                     <button onClick={() => setViewMode('grievances')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'grievances' ? 'bg-navy-700 text-saffron-500 border border-navy-600/30' : 'text-navy-400 hover:text-navy-300'}`}>Grievances</button>
                  </div>
               </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               {[
                  { label: 'Pending', value: stats.pending, color: 'text-saffron-500', bg: 'bg-saffron-500/10', border: 'border-saffron-500/15' },
                  { label: 'In Progress', value: stats.inProgress, color: 'text-navy-500', bg: 'bg-navy-500/10', border: 'border-navy-500/15' },
                  { label: 'Approved', value: stats.approved, color: 'text-gov-green', bg: 'bg-gov-green/10', border: 'border-gov-green/15' },
                  { label: 'Rejected', value: stats.rejected, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/15' },
               ].map(s => (
                  <div key={s.label} className={`glass-card rounded-xl p-5 border ${s.border}`}>
                     <p className="text-xs font-bold text-navy-400 uppercase tracking-wider mb-1">{s.label}</p>
                     <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  </div>
               ))}
            </div>

            {/* Applications Table */}
            {viewMode === 'applications' ? (
               <div className="glass-card rounded-2xl overflow-hidden border-navy-600/15">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] uppercase tracking-wider text-navy-400 bg-navy-800/40 border-b border-navy-700/30">
                              <th className="px-5 py-4 font-bold">Tracking ID</th>
                              <th className="px-5 py-4 font-bold">Applicant</th>
                              <th className="px-5 py-4 font-bold">Certificate</th>
                              <th className="px-5 py-4 font-bold">Date</th>
                              <th className="px-5 py-4 font-bold">Status</th>
                              <th className="px-5 py-4 font-bold text-center">Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan="6" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-saffron-500 mx-auto" /></td></tr>
                           ) : filteredApps.length === 0 ? (
                              <tr><td colSpan="6" className="text-center py-12 text-navy-400 font-medium">No applications found.</td></tr>
                           ) : (
                              filteredApps.map((app) => (
                                 <tr key={app._id} className="border-b border-navy-700/20 hover:bg-navy-800/30 transition">
                                    <td className="px-5 py-4 font-mono text-xs font-semibold text-navy-300">#{app.trackingId}</td>
                                    <td className="px-5 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-navy-700 text-navy-300 flex items-center justify-center font-bold text-xs"><UserIcon className="w-4 h-4" /></div>
                                          <div>
                                             <div className="font-semibold text-sm text-white flex items-center gap-2">
                                                {app.user?.fullName}
                                                <button onClick={() => handleViewHistory(app.user?._id)} title="View History" className="text-saffron-500 hover:text-saffron-400"><ClipboardList className="w-3.5 h-3.5" /></button>
                                             </div>
                                             <div className="text-[10px] text-navy-500 font-mono">{app.user?.email}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-5 py-4 font-semibold text-sm text-white">{app.certificateType}</td>
                                    <td className="px-5 py-4 text-xs text-navy-300 font-medium">{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">{getStatusBadge(app.status)}</td>
                                    <td className="px-5 py-4 text-center">
                                       <button onClick={() => setSelectedApp(app)} className="bg-navy-800 border border-navy-600/30 text-saffron-500 hover:border-saffron-500/30 px-4 py-1.5 rounded-lg text-xs font-bold transition-all">Review</button>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            ) : (
               /* Grievances List */
               <div className="glass-card rounded-2xl p-6 border-navy-600/15">
                  <div className="space-y-4">
                     {loading ? (
                        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-saffron-500 mx-auto" /></div>
                     ) : filteredGrievances.length === 0 ? (
                        <div className="text-center py-12 text-navy-400 font-medium">No grievances found.</div>
                     ) : (
                        filteredGrievances.map((g) => (
                           <div key={g._id} className="p-4 border border-navy-600/20 rounded-xl bg-navy-800/30 hover:border-navy-500/30 transition">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className="font-bold text-white">{g.title}</h4>
                                    <p className="text-xs text-navy-400 font-medium">By: {g.user?.fullName} ({g.user?.email})</p>
                                 </div>
                                 {getStatusBadge(g.status === 'Resolved' ? 'Approved' : g.status === 'Open' ? 'In Progress' : g.status)}
                              </div>
                              <p className="text-xs text-navy-400 mb-3">{g.description}</p>
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                 <div className="flex text-[10px] text-navy-500 font-bold uppercase items-center gap-2">
                                    <span className="bg-navy-800 px-2.5 py-1 rounded-md border border-navy-700/30">Dept: {g.department}</span>
                                    <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 {g.status === 'Open' ? (
                                    <button onClick={() => setSelectedGrievance(g)} className="bg-navy-800 text-saffron-500 hover:border-saffron-500/30 px-4 py-1.5 rounded-lg text-xs font-bold border border-navy-600/30 flex items-center transition-all">
                                       <Reply className="w-3.5 h-3.5 mr-1" /> Reply & Resolve
                                    </button>
                                 ) : (
                                    <span className="text-xs text-gov-green font-bold flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> Resolved</span>
                                 )}
                              </div>
                              {g.adminReply && (
                                 <div className="mt-3 p-3 bg-navy-800/50 rounded-lg text-xs text-navy-300 border-l-2 border-saffron-500">
                                    <strong>Officer Reply:</strong> {g.adminReply}
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}
         </main>

         {/* Review Application Modal */}
         <AnimatePresence>
            {selectedApp && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-900/70 backdrop-blur-md" onClick={() => setSelectedApp(null)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-card bg-navy-900/95 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10 border-navy-600/20">
                     <div className="tricolor-bar"></div>
                     <div className="p-6 border-b border-navy-600/20 flex justify-between items-center sticky top-0 bg-navy-900/90 backdrop-blur-md z-20">
                        <div>
                           <h3 className="text-xl font-bold text-white">Review Application</h3>
                           <p className="text-xs text-navy-400 font-mono mt-1">Ref: {selectedApp.trackingId} | Citizen: {selectedApp.user?.fullName}</p>
                        </div>
                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-navy-800 rounded-full transition-colors"><XCircle className="w-6 h-6 text-navy-500" /></button>
                     </div>

                     <div className="p-6 space-y-6">
                        <div>
                           <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-saffron-500 pl-3 mb-4">Form Data</h4>
                           <div className="grid grid-cols-2 gap-4 bg-navy-800/40 p-4 rounded-xl border border-navy-600/20">
                              {Object.entries(selectedApp.formFields || {}).map(([key, val]) => (
                                 <div key={key}>
                                    <span className="block text-[10px] text-navy-500 font-bold uppercase tracking-wider">{key}</span>
                                    <span className="block text-sm font-semibold text-white">{val || 'N/A'}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-gov-green pl-3 mb-4">Uploaded Documents</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {selectedApp.documents?.map((doc, idx) => (
                                 <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-navy-600/20 rounded-xl hover:border-saffron-500/30 transition-colors group bg-navy-800/30">
                                    <div className="p-2 bg-navy-700/50 text-navy-400 rounded-lg group-hover:text-saffron-500 transition-colors"><FileText className="w-5 h-5" /></div>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                       <div className="text-sm font-semibold text-white truncate">{doc.type}</div>
                                       {doc.status === 'verified' && <div className="text-[10px] text-gov-green font-bold uppercase flex items-center mt-0.5"><CheckCircle className="w-3 h-3 mr-1" /> AI Verified</div>}
                                       {doc.status === 'rejected' && <div className="text-[10px] text-red-400 font-bold uppercase flex items-center mt-0.5"><XCircle className="w-3 h-3 mr-1" /> Rejected</div>}
                                       {(!doc.status || doc.status === 'pending') && <div className="text-[10px] text-saffron-500 font-bold uppercase flex items-center mt-0.5"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending</div>}
                                    </div>
                                    <Eye className="w-4 h-4 text-navy-600 group-hover:text-saffron-500" />
                                 </a>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="p-6 border-t border-navy-600/20 bg-navy-800/30 sticky bottom-0 flex justify-end gap-3 z-20">
                        <button onClick={() => setSelectedApp(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-navy-400 hover:bg-navy-800 transition-colors">Cancel</button>
                        {['Pending Review', 'In Progress', 'Submitted', 'AI Verified'].includes(selectedApp.status) && (
                           <>
                              <button disabled={updating} onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')} className="px-5 py-2.5 rounded-xl font-bold text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors disabled:opacity-50">Reject</button>
                              <button disabled={updating} onClick={() => handleUpdateStatus(selectedApp._id, 'Approved')} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gov-green hover:bg-emerald-600 shadow-lg shadow-gov-green/20 transition-colors disabled:opacity-50 flex items-center">
                                 {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />} Approve & Generate
                              </button>
                           </>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* Grievance Reply Modal */}
         <AnimatePresence>
            {selectedGrievance && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-900/70 backdrop-blur-md" onClick={() => setSelectedGrievance(null)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card bg-navy-900/95 rounded-2xl max-w-lg w-full relative z-10 overflow-hidden border-navy-600/20">
                     <div className="tricolor-bar"></div>
                     <div className="p-6 border-b border-navy-600/20 flex justify-between items-center">
                        <div>
                           <h3 className="text-lg font-bold text-white">Resolve Grievance</h3>
                           <p className="text-xs text-navy-400 font-medium">Citizen: {selectedGrievance.user?.fullName}</p>
                        </div>
                        <button onClick={() => setSelectedGrievance(null)} className="text-navy-500 hover:text-navy-300"><XCircle className="w-6 h-6" /></button>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="bg-navy-800/50 p-4 rounded-xl border border-navy-600/20">
                           <h4 className="font-bold text-navy-200 text-sm">{selectedGrievance.title}</h4>
                           <p className="text-xs text-navy-400 mt-1">{selectedGrievance.description}</p>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-navy-300 mb-2 uppercase tracking-wider">Officer Reply (Required)</label>
                           <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Explain the resolution..." rows="4" className="gov-input resize-none"></textarea>
                        </div>
                     </div>
                     <div className="p-5 bg-navy-800/30 border-t border-navy-600/20 flex justify-end gap-3">
                        <button onClick={() => setSelectedGrievance(null)} className="px-5 py-2 rounded-xl text-sm font-bold text-navy-400 hover:bg-navy-800">Cancel</button>
                        <button disabled={updating || !adminReply.trim()} onClick={() => handleResolveGrievance(selectedGrievance._id, 'Resolved')} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gov-green hover:bg-emerald-600 flex items-center disabled:opacity-50 shadow-lg shadow-gov-green/20">
                           {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} Resolve
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* User History Modal */}
         <AnimatePresence>
            {showHistoryModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-900/70 backdrop-blur-md" onClick={() => setShowHistoryModal(false)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card bg-navy-900/95 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative z-10 border-navy-600/20">
                     <div className="tricolor-bar"></div>
                     <div className="p-6 border-b border-navy-600/20 flex justify-between items-center sticky top-0 bg-navy-900/90 backdrop-blur-md z-20">
                        <div>
                           <h3 className="text-lg font-bold text-white">Applicant History</h3>
                           <p className="text-xs text-navy-400 font-medium mt-1">Past applications</p>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="text-navy-500 hover:text-navy-300"><XCircle className="w-6 h-6" /></button>
                     </div>
                     <div className="p-6">
                        {historyLoading ? (
                           <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-saffron-500 mx-auto" /></div>
                        ) : userHistory.length === 0 ? (
                           <div className="text-center py-12 text-navy-400 font-medium">No previous history found.</div>
                        ) : (
                           <div className="space-y-3">
                              {userHistory.map(hist => (
                                 <div key={hist._id} className="bg-navy-800/40 p-4 rounded-xl border border-navy-600/20">
                                    <div className="flex justify-between items-center mb-2">
                                       <div className="font-semibold text-sm text-white">{hist.certificateType} Certificate</div>
                                       {getStatusBadge(hist.status)}
                                    </div>
                                    <div className="text-xs text-navy-400 font-mono">ID: {hist.trackingId}</div>
                                    <div className="text-xs text-navy-400 font-mono">Applied: {new Date(hist.createdAt).toLocaleDateString()}</div>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}
