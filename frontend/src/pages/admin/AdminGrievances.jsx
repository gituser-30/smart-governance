import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Reply } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

export default function AdminGrievances() {
   const { token, user } = useAuth();
   const navigate = useNavigate();
   const [grievances, setGrievances] = useState([]);
   const [loading, setLoading] = useState(true);

   const [selectedGrievance, setSelectedGrievance] = useState(null);
   const [adminReply, setAdminReply] = useState('');
   const [updating, setUpdating] = useState(false);

   const [searchQuery, setSearchQuery] = useState('');

   useEffect(() => {
      if (user && user.role !== 'admin') navigate('/dashboard');
   }, [user, navigate]);

   useEffect(() => { fetchData(); }, [token]);

   const fetchData = async () => {
      try {
         const res = await axios.get('http://localhost:5000/api/grievances/all', { headers: { Authorization: `Bearer ${token}` } });
         setGrievances(res.data.data);
      } catch (err) { console.error("Failed to load grievances", err); }
      finally { setLoading(false); }
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

   const filteredGrievances = grievances.filter(g =>
      (g.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase())
   );

   const getStatusBadge = (status) => {
      const displayStatus = status === 'Resolved' ? 'Resolved' : status === 'Open' ? 'In Progress' : status;
      const isResolved = status === 'Resolved';
      return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`} style={{
          background: isResolved ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)',
          color: isResolved ? '#22C55E' : '#3B82F6'
      }}>{displayStatus}</span>;
   };

   return (
      <AdminLayout>
         {/* Header */}
         <div className="flex flex-wrap justify-between items-end mb-8 pb-6 gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
               <h2 className="text-2xl font-black text-white">Citizen Grievances</h2>
               <p className="text-navy-400 font-medium text-sm mt-1" style={{ color: '#6B7FAA' }}>Review and resolve citizen complaints.</p>
            </div>
            <div className="flex-1 max-w-sm">
               <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: '#5B6E94' }} />
                  <input type="text" placeholder="Search by Title, Name, Email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="govai-input pl-10" />
               </div>
            </div>
         </div>

         {/* Grievances List */}
         <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
            <div className="space-y-4">
               {loading ? (
                  <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: '#3B82F6' }} /></div>
               ) : filteredGrievances.length === 0 ? (
                  <div className="text-center py-12 font-medium" style={{ color: '#5B6E94' }}>No grievances found.</div>
               ) : (
                  filteredGrievances.map((g) => (
                     <div key={g._id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, transition: 'background 0.2s' }} className="hover:bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{g.title}</h4>
                              <p style={{ fontSize: 12, color: '#5B6E94', fontWeight: 500 }}>By: {g.user?.fullName} ({g.user?.email})</p>
                           </div>
                           {getStatusBadge(g.status)}
                        </div>
                        <p style={{ fontSize: 13, color: '#7B99C8', marginBottom: 16, lineHeight: 1.5 }}>{g.description}</p>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                           <div className="flex text-[10px] font-bold uppercase items-center gap-2" style={{ color: '#5B6E94' }}>
                              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 6 }}>Dept: {g.department}</span>
                              <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                           </div>
                           {g.status === 'Open' ? (
                              <button onClick={() => setSelectedGrievance(g)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                 <Reply size={14} /> Reply & Resolve
                              </button>
                           ) : (
                              <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 700, display: 'flex', alignItems: 'center' }}><CheckCircle size={14} style={{ marginRight: 4 }} /> Resolved</span>
                           )}
                        </div>
                        {g.adminReply && (
                           <div style={{ marginTop: 16, padding: 12, background: 'rgba(34,197,94,0.05)', borderRadius: 8, borderLeft: '3px solid #22C55E', fontSize: 12, color: '#7B99C8' }}>
                              <strong style={{ color: '#22C55E' }}>Officer Reply:</strong> {g.adminReply}
                           </div>
                        )}
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Grievance Reply Modal */}
         <AnimatePresence>
            {selectedGrievance && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedGrievance(null)}></motion.div>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, width: '100%', maxWidth: 500, position: 'relative', zIndex: 10, overflow: 'hidden' }}>
                     <div style={{ height: 4, background: '#3B82F6' }} />
                     <div style={{ padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ flex: 1 }}>
                           <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Resolve Grievance</h3>
                           <p style={{ fontSize: 12, color: '#5B6E94', fontWeight: 500 }}>Citizen: {selectedGrievance.user?.fullName}</p>
                        </div>
                        <button onClick={() => setSelectedGrievance(null)} style={{ background: 'transparent', border: 'none', color: '#5B6E94', cursor: 'pointer' }}><XCircle size={24} /></button>
                     </div>
                     <div style={{ padding: '24px 30px' }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)', marginBottom: 20 }}>
                           <h4 style={{ fontWeight: 700, color: '#c0cfe8', fontSize: 14 }}>{selectedGrievance.title}</h4>
                           <p style={{ fontSize: 12, color: '#5B6E94', marginTop: 4 }}>{selectedGrievance.description}</p>
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#5B6E94', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Officer Reply (Required)</label>
                           <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)} placeholder="Explain the resolution..." rows="4" className="govai-input" style={{ resize: 'none' }}></textarea>
                        </div>
                     </div>
                     <div style={{ padding: '20px 30px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button onClick={() => setSelectedGrievance(null)} style={{ background: 'transparent', border: 'none', color: '#5B6E94', fontWeight: 700, padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
                        <button disabled={updating || !adminReply.trim()} onClick={() => handleResolveGrievance(selectedGrievance._id, 'Resolved')} style={{ background: '#22C55E', color: '#fff', border: 'none', fontWeight: 700, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                           {updating ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />} Resolve
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </AdminLayout>
   );
}
