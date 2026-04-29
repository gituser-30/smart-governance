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

   // Modal State
   const [selectedApp, setSelectedApp] = useState(null);
   const [selectedGrievance, setSelectedGrievance] = useState(null);
   const [adminReply, setAdminReply] = useState('');
   const [updating, setUpdating] = useState(false);

   // Search & History State
   const [searchQuery, setSearchQuery] = useState('');
   const [userHistory, setUserHistory] = useState([]);
   const [showHistoryModal, setShowHistoryModal] = useState(false);
   const [historyLoading, setHistoryLoading] = useState(false);

   useEffect(() => {
      // If not admin, boot them
      if (user && user.role !== 'admin') {
         navigate('/dashboard');
      }
   }, [user, navigate]);

   useEffect(() => {
      fetchData();
   }, [token]);

   const fetchData = async () => {
      try {
         const [appRes, grvRes] = await Promise.all([
            axios.get('http://localhost:5000/api/applications/all', { headers: { Authorization: `Bearer ${token}` } }),
            axios.get('http://localhost:5000/api/grievances/all', { headers: { Authorization: `Bearer ${token}` } })
         ]);
         setApplications(appRes.data.data);
         setGrievances(grvRes.data.data);
      } catch (err) {
         console.error("Failed to load data", err);
      } finally {
         setLoading(false);
      }
   };

   const handleUpdateStatus = async (id, newStatus) => {
      setUpdating(true);
      try {
         await axios.put(`http://localhost:5000/api/applications/${id}/status`, { status: newStatus }, {
            headers: { Authorization: `Bearer ${token}` }
         });
         // Update UI
         setApplications(applications.map(app => app._id === id ? { ...app, status: newStatus } : app));
         setSelectedApp(null);
      } catch (err) {
         alert('Failed to update status.');
      } finally {
         setUpdating(false);
      }
   };

   const handleReviewCase = async (app) => {
      setSelectedApp(app);
      if (app.status === 'Submitted' || app.status === 'Pending Review' || app.status === 'AI Verified') {
         try {
            // Silently mark as "In Progress"
            await axios.put(`http://localhost:5000/api/applications/${app._id}/status`, { status: 'In Progress' }, {
               headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(applications.map(a => a._id === app._id ? { ...a, status: 'In Progress' } : a));
         } catch (e) {
            console.error("Failed to mark 'In Progress'", e);
         }
      }
   };

   const handleResolveGrievance = async (id, status) => {
      setUpdating(true);
      try {
         await axios.put(`http://localhost:5000/api/grievances/${id}/resolve`, { status, adminReply }, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setGrievances(grievances.map(g => g._id === id ? { ...g, status, adminReply } : g));
         setSelectedGrievance(null);
         setAdminReply('');
      } catch (err) {
         alert('Failed to resolve grievance.');
      } finally {
         setUpdating(false);
      }
   };

   const handleViewHistory = async (userId) => {
      setShowHistoryModal(true);
      setHistoryLoading(true);
      try {
         const res = await axios.get(`http://localhost:5000/api/applications/user-history/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setUserHistory(res.data.data);
      } catch (err) {
         console.error("Failed to load user history", err);
      } finally {
         setHistoryLoading(false);
      }
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

   return (
      <div className="min-h-screen font-sans animated-bg flex flex-col">
         <Navbar />

         <main className="flex-grow max-w-7xl mx-auto px-4 md:px-8 py-24 w-full relative z-10">

            <div className="flex justify-between items-end mb-8 border-b border-slate-700 pb-6">
               <div>
                  <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-2 opacity-80 border border-red-200"><Shield className="inline w-3 h-3 mr-1" /> Secure Access</span>
                  <h2 className="text-3xl font-black text-slate-50">Tahsildar Portal</h2>
                  <p className="text-slate-400 font-medium text-sm mt-1">Review AI-verified citizen applications and provide final approval.</p>
               </div>
               <div className="flex-1 max-w-md mx-6">
                  <div className="relative">
                     <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-500" />
                     <input 
                        type="text" 
                        placeholder="Search by ID, Name, Email or Type..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/70 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                     />
                  </div>
               </div>
               <div className="flex gap-4 items-center">
                  <div className="bg-slate-800/70 p-1 rounded-xl flex shadow-inner">
                     <button onClick={() => setViewMode('applications')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'applications' ? 'bg-slate-900 text-blue-400 shadow border border-slate-700' : 'text-slate-400 hover:text-slate-300'}`}>
                        Applications
                     </button>
                     <button onClick={() => setViewMode('grievances')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'grievances' ? 'bg-slate-900 text-blue-400 shadow border border-slate-700' : 'text-slate-400 hover:text-slate-300'}`}>
                        Grievances
                     </button>
                  </div>
                  <div className="text-right ml-4 border-l border-slate-700 pl-4">
                     <div className="text-2xl font-black text-blue-400">{viewMode === 'applications' ? applications.filter(a => a.status === 'Pending Review').length : grievances.filter(g => g.status === 'Open').length}</div>
                     <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Action</div>
                  </div>
               </div>
            </div>

            {viewMode === 'applications' ? (
               <div className="glass-3d rounded-2xl p-6 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-800/50/50">
                              <th className="px-5 py-4 font-bold rounded-tl-xl truncate">Tracking ID</th>
                              <th className="px-5 py-4 font-bold">Applicant</th>
                              <th className="px-5 py-4 font-bold">Certificate</th>
                              <th className="px-5 py-4 font-bold">Date Applied</th>
                              <th className="px-5 py-4 font-bold">Status</th>
                              <th className="px-5 py-4 font-bold text-center rounded-tr-xl">Officer Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan="5" className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></td></tr>
                           ) : filteredApps.length === 0 ? (
                              <tr><td colSpan="5" className="text-center py-12 text-slate-400 font-medium">No applications found.</td></tr>
                           ) : (
                              filteredApps.map((app) => (
                                 <tr key={app._id} className="border-b border-slate-800/50 hover:bg-slate-900/40 transition">
                                    <td className="px-5 py-4 font-mono text-xs font-bold text-slate-400">#{app.trackingId}</td>
                                    <td className="px-5 py-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-primary-100 text-blue-400 flex items-center justify-center font-bold text-xs"><UserIcon className="w-4 h-4" /></div>
                                          <div>
                                             <div className="font-bold text-sm text-slate-50 flex items-center gap-2">
                                                {app.user?.fullName} 
                                                <button onClick={() => handleViewHistory(app.user?._id)} title="View History" className="text-blue-400 hover:text-blue-300">
                                                   <ClipboardList className="w-3.5 h-3.5" />
                                                </button>
                                             </div>
                                             <div className="text-[10px] text-slate-400 font-mono">{app.user?.email}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-5 py-4 font-bold text-sm text-slate-50">{app.certificateType}</td>
                                    <td className="px-5 py-4 text-xs text-slate-300 font-medium">{new Date(app.createdAt).toLocaleDateString()}</td>
                                    <td className="px-5 py-4">
                                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-[0_4px_20px_rgba(0,0,0,0.5)] ${app.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                          app.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                             'bg-blue-100 text-blue-700 border-blue-200'
                                          }`}>
                                          {app.status}
                                       </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                       <button onClick={() => setSelectedApp(app)} className="bg-slate-900 border border-slate-700 text-blue-400 hover:bg-primary-50 hover:border-primary-200 px-4 py-1.5 rounded-lg text-xs font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all focus:ring-2 focus:ring-primary-500">
                                          Review Case
                                       </button>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            ) : (
               <div className="glass-3d rounded-2xl p-6 border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden">
                  <div className="space-y-4">
                     {loading ? (
                        <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
                     ) : filteredGrievances.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 font-medium">No grievances found.</div>
                     ) : (
                        filteredGrievances.map((g) => (
                           <div key={g._id} className="p-4 border border-slate-700 rounded-xl bg-slate-900 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h4 className="font-bold text-slate-50">{g.title}</h4>
                                    <p className="text-xs text-slate-400 font-medium">By: {g.user?.fullName} ({g.user?.email})</p>
                                 </div>
                                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${g.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    g.status === 'Open' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                       'bg-slate-800/70 text-slate-300 border-slate-700'
                                    }`}>
                                    {g.status}
                                 </span>
                              </div>
                              <p className="text-xs text-slate-400 mb-3">{g.description}</p>
                              <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                                 <div className="flex text-[10px] text-slate-400 font-bold uppercase items-center">
                                    <span className="bg-slate-800/70 px-2.5 py-1 rounded-md mr-2 text-slate-400">Dept: {g.department}</span>
                                    <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                                 </div>
                                 {g.status === 'Open' ? (
                                    <button onClick={() => setSelectedGrievance(g)} className="bg-primary-50 text-blue-400 hover:bg-primary-100 px-4 py-1.5 rounded-lg text-xs font-bold border border-primary-200 transition-colors flex items-center">
                                       <Reply className="w-3.5 h-3.5 mr-1" /> Reply & Resolve
                                    </button>
                                 ) : (
                                    <span className="text-xs text-green-600 font-bold flex items-center">
                                       <CheckCircle className="w-4 h-4 mr-1" /> Resolved
                                    </span>
                                 )}
                              </div>
                              {g.adminReply && (
                                 <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-300 border border-slate-800">
                                    <strong>Officer Reply: </strong> {g.adminReply}
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}
         </main>

         {/* Review Modal */}
         <AnimatePresence>
            {selectedApp && (
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></motion.div>

                  <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="glass-3d bg-slate-900/95 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10">

                     <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md z-20">
                        <div>
                           <h3 className="text-xl font-black text-slate-50">Review Application</h3>
                           <p className="text-xs text-slate-400 font-mono mt-1">Ref: {selectedApp.trackingId} | Citizen: {selectedApp.user?.fullName}</p>
                        </div>
                        <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-slate-800/70 rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-500" /></button>
                     </div>

                     <div className="p-6 space-y-8">

                        <div>
                           <h4 className="text-sm font-extrabold text-slate-50 uppercase tracking-widest border-l-4 border-primary-500 pl-2 mb-4">Extracted Form Data</h4>
                           <div className="grid grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                              {Object.entries(selectedApp.formFields || {}).map(([key, val]) => (
                                 <div key={key}>
                                    <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{key}</span>
                                    <span className="block text-sm font-semibold text-slate-50">{val || 'N/A'}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div>
                           <h4 className="text-sm font-extrabold text-slate-50 uppercase tracking-widest border-l-4 border-saffron-500 pl-2 mb-4">Uploaded Documents</h4>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedApp.documents?.map((doc, idx) => (
                                 <a key={idx} href={doc.url} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-slate-700 rounded-xl hover:bg-primary-50 hover:border-primary-200 transition-colors group">
                                    <div className="p-2 bg-slate-800/70 text-slate-400 rounded-lg group-hover:bg-primary-100 group-hover:text-blue-500 transition-colors"><FileText className="w-5 h-5" /></div>
                                    <div className="ml-3 flex-1 overflow-hidden">
                                       <div className="text-sm font-bold text-slate-50 truncate">{doc.type}</div>
                                       {(!doc.status || doc.status === 'pending') && <div className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center mt-0.5"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending Validation</div>}
                                        {doc.status === 'verified' && <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center mt-0.5"><CheckCircle className="w-3 h-3 mr-1" /> AI Verified</div>}
                                        {doc.status === 'rejected' && <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center mt-0.5"><XCircle className="w-3 h-3 mr-1" /> AI Rejected</div>}
                                    </div>
                                    <Eye className="w-4 h-4 text-slate-600 group-hover:text-primary-500" />
                                 </a>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="p-6 border-t border-slate-700 bg-slate-800/50 sticky bottom-0 flex justify-end gap-3 z-20">
                        <button onClick={() => setSelectedApp(null)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-800 transition-colors">Cancel</button>
                        {(selectedApp.status === 'Pending Review' || selectedApp.status === 'In Progress' || selectedApp.status === 'Submitted' || selectedApp.status === 'AI Verified') && (
                           <>
                              <button disabled={updating} onClick={() => handleUpdateStatus(selectedApp._id, 'Rejected')} className="px-5 py-2.5 rounded-xl font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50">Reject Substandard Form</button>
                              <button disabled={updating} onClick={() => handleUpdateStatus(selectedApp._id, 'Approved')} className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-[0_8px_30px_rgba(0,0,0,0.6)] shadow-green-600/20 focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 flex items-center">
                                 {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                                 Approve & Generate Certificate
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedGrievance(null)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-3d bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full relative z-10 overflow-hidden">
                     <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                        <div>
                           <h3 className="text-xl font-bold">Resolve Grievance</h3>
                           <p className="text-xs text-slate-400 font-medium">Citizen: {selectedGrievance.user?.fullName}</p>
                        </div>
                        <button onClick={() => setSelectedGrievance(null)} className="text-slate-500 hover:text-slate-400"><XCircle className="w-6 h-6" /></button>
                     </div>
                     <div className="p-6 space-y-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                           <h4 className="font-bold text-slate-200 text-sm">{selectedGrievance.title}</h4>
                           <p className="text-xs text-slate-400 mt-1">{selectedGrievance.description}</p>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-300 mb-2">Officer Reply (Required)</label>
                           <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Explain the resolution..." rows="4" className="w-full text-sm p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"></textarea>
                        </div>
                     </div>
                     <div className="p-5 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-3">
                        <button onClick={() => setSelectedGrievance(null)} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-800">Cancel</button>
                        <button disabled={updating || !adminReply.trim()} onClick={() => handleResolveGrievance(selectedGrievance._id, 'Resolved')} className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 flex items-center disabled:opacity-50">
                           {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />} Mark Resolved
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
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-3d bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative z-10 border border-slate-700">
                     <div className="p-6 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-900/80 backdrop-blur-md z-20">
                        <div>
                           <h3 className="text-xl font-bold text-slate-50">Applicant History</h3>
                           <p className="text-xs text-slate-400 font-medium mt-1">Review past applications</p>
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-slate-400"><XCircle className="w-6 h-6" /></button>
                     </div>
                     <div className="p-6">
                        {historyLoading ? (
                           <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
                        ) : userHistory.length === 0 ? (
                           <div className="text-center py-12 text-slate-400 font-medium">No previous history found for this user.</div>
                        ) : (
                           <div className="space-y-4">
                              {userHistory.map(hist => (
                                 <div key={hist._id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                    <div className="flex justify-between items-center mb-2">
                                       <div className="font-bold text-sm text-slate-50">{hist.certificateType} Certificate</div>
                                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${hist.status === 'Approved' ? 'bg-green-900/40 text-green-400 border border-green-800' : hist.status === 'Rejected' ? 'bg-red-900/40 text-red-400 border border-red-800' : 'bg-blue-900/40 text-blue-400 border border-blue-800'}`}>{hist.status}</span>
                                    </div>
                                    <div className="text-xs text-slate-400 font-mono">Tracking ID: {hist.trackingId}</div>
                                    <div className="text-xs text-slate-400 font-mono">Applied On: {new Date(hist.createdAt).toLocaleDateString()}</div>
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
