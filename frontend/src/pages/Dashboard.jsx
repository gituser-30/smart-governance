import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Building, Baby, ChevronRight, Download, Search, Bell, AlertCircle, Shield, Mail, MessageSquare, Briefcase, Zap, Globe } from 'lucide-react';
import Navbar from '../components/Navbar';

const CERT_TYPES = [
   { type: 'Income', icon: Zap, title: 'Income Validation', desc: 'Secure Family Income Auth', color: 'from-blue-400 to-indigo-600', shadow: 'shadow-blue-500/30' },
   { type: 'Domicile', icon: MapPin, title: 'State Domicile', desc: 'Digital Residency Proof', color: 'from-emerald-400 to-green-600', shadow: 'shadow-emerald-500/30' },
   { type: 'EWS', icon: Building, title: 'EWS Verification', desc: 'Economic Backwardness Check', color: 'from-fuchsia-400 to-purple-600', shadow: 'shadow-fuchsia-500/30' },
   { type: 'Birth', icon: Baby, title: 'Birth Registration', desc: 'Official Date & Place Record', color: 'from-orange-400 to-red-600', shadow: 'shadow-orange-500/30' },
];

export default function Dashboard() {
   const { user, token } = useAuth();
   const navigate = useNavigate();
   const [applications, setApplications] = useState([]);
   const [grievances, setGrievances] = useState([]);
   const [loading, setLoading] = useState(true);
   const [shGrievanceModal, setShGrievanceModal] = useState(false);
   const [gForm, setGForm] = useState({ title: '', department: 'General', area: '', description: '' });

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [appRes, grvRes] = await Promise.all([
               axios.get('http://localhost:5000/api/applications/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
               axios.get('http://localhost:5000/api/grievances/my', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setApplications(appRes.data.data);
            setGrievances(grvRes.data.data);
         } catch (err) {
            console.error("Failed to load data", err);
         } finally {
            setLoading(false);
         }
      };
      if (token) fetchData();
   }, [token]);

   const submitGrievance = async (e) => {
      e.preventDefault();
      try {
         const res = await axios.post('http://localhost:5000/api/grievances', gForm, {
            headers: { Authorization: `Bearer ${token}` }
         });
         setGrievances([res.data.data, ...grievances]);
         setShGrievanceModal(false);
         setGForm({ title: '', department: 'General', description: '' });
         alert('Grievance submitted successfully!');
      } catch (err) {
         alert('Failed to submit grievance');
      }
   };

   const getStatusBadge = (status) => {
      switch (status) {
         case 'Approved': return <span className="px-3 py-1 bg-green-500/20 text-green-700 border border-green-500/30 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.3)] backdrop-blur-md">{status}</span>;
         case 'Rejected': return <span className="px-3 py-1 bg-red-500/20 text-red-700 border border-red-500/30 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.3)] backdrop-blur-md">{status}</span>;
         case 'In Progress': return <span className="px-3 py-1 bg-purple-500/20 text-purple-700 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.3)] backdrop-blur-md scale-105 inline-block animate-pulse">{status}</span>;
         default: return <span className="px-3 py-1 bg-blue-500/20 text-blue-700 border border-blue-500/30 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md">{status}</span>;
      }
   };

   return (
      <div className="min-h-screen transparent relative overflow-hidden flex flex-col perspective-1000">

         {/* 3D Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-blue-400/20 rounded-full blur-[120px]"></motion.div>
            <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute top-[30%] -right-[15%] w-[60%] h-[70%] bg-purple-400/20 rounded-full blur-[150px]"></motion.div>
            <div className="absolute bottom-[0%] left-[20%] w-[40%] h-[40%] bg-saffron-400/10 rounded-full blur-[100px]"></div>
            {/* Subtle grid mesh overlay */}
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
         </div>

         <Navbar />

         <main className="max-w-[90rem] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10 flex-grow grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* LEFT PRIMARY PANEL */}
            <div className="xl:col-span-8 space-y-8">

               {/* 3D Hero Banner */}
               <motion.div
                  initial={{ opacity: 0, rotateX: 20, y: 30 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  className="glass-3d rounded-3xl p-8 relative overflow-hidden shadow-2xl group"
               >
                  <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
                  <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute -right-10 -bottom-10 opacity-10">
                     <Globe className="w-64 h-64 text-blue-900" />
                  </motion.div>

                  <div className="relative z-10 space-y-4">
                     <div className="inline-flex items-center space-x-2 bg-slate-900/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-slate-700 px-4 py-1.5 rounded-full">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">System Online</span>
                     </div>
                     <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-50 tracking-tight leading-tight">
                        Supercharging<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Citizen Services.</span>
                     </h1>
                     <p className="text-slate-400 font-medium text-lg max-w-xl leading-relaxed">
                        Welcome back, <strong>{user?.fullName || 'Citizen'}</strong>. Access AI-verified digital certifications securely and transparently.
                     </p>

                     {user?.role === 'admin' && (
                        <motion.button whileHover={{ scale: 1.05, z: 20 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/admin')} className="mt-4 bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] shadow-red-500/30 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-red-400">
                           <Shield className="w-5 h-5" /> Access Tahsildar Portal
                        </motion.button>
                     )}
                  </div>
               </motion.div>

               {/* AI Service Cards 3D Grid */}
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-2xl font-black text-slate-200 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Digital Services</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {CERT_TYPES.map((cert, i) => (
                        <motion.div
                           key={cert.type}
                           initial={{ opacity: 0, y: 40 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1, duration: 0.5 }}
                           whileHover={{ y: -10, scale: 1.02, rotateX: 5, rotateY: -5, zIndex: 30 }}
                           onClick={() => navigate(`/apply?type=${cert.type}`)}
                           style={{ transformStyle: "preserve-3d" }}
                           className={`glass-3d cursor-pointer rounded-3xl p-6 group relative overflow-hidden transition-all duration-300 ${cert.shadow}`}
                        >
                           <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>

                           <div className="flex justify-between items-start mb-6" style={{ transform: "translateZ(30px)" }}>
                              <div className={`p-4 rounded-2xl bg-gradient-to-br ${cert.color} text-white shadow-lg`}>
                                 <cert.icon className="w-8 h-8" />
                              </div>
                              <motion.div whileHover={{ scale: 1.2, rotate: 15 }} className="w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-700 text-slate-500 group-hover:bg-slate-900 group-hover:text-blue-600 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all">
                                 <ChevronRight className="w-5 h-5" />
                              </motion.div>
                           </div>

                           <div style={{ transform: "translateZ(20px)" }}>
                              <h4 className="text-xl font-black text-slate-50 group-hover:text-blue-700 transition-colors drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">{cert.title}</h4>
                              <p className="text-sm text-slate-400 font-medium mt-1">{cert.desc}</p>

                              <div className="mt-6 flex items-center gap-3">
                                 <span className="bg-slate-900/60 border border-slate-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center">
                                    <Zap className="w-3 h-3 text-yellow-500 mr-1" /> Auto-Verified
                                 </span>
                              </div>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Unified Data Tables */}
               <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-3d rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 border-b border-slate-700/50 pb-4">
                     <h3 className="text-2xl font-black text-slate-50 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Tracking Board</h3>
                  </div>

                  {/* Modern Table Layout */}
                  <div className="overflow-x-auto overflow-y-hidden pb-4">
                     <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                           <tr className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-4">
                              <th className="px-4 py-2">Entity ID</th>
                              <th className="px-4 py-2">Service Route</th>
                              <th className="px-4 py-2">State</th>
                              <th className="px-4 py-2 text-right">Access</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan="4" className="text-center py-10 font-bold text-slate-500">Syncing with server...</td></tr>
                           ) : applications.length === 0 ? (
                              <tr><td colSpan="4" className="text-center py-12"><div className="bg-slate-900/50 inline-block p-4 rounded-full mb-3 shadow-inner"><Search className="w-6 h-6 text-slate-600" /></div><p className="text-sm font-bold text-slate-500">No active tracking records</p></td></tr>
                           ) : (
                              applications.map(app => (
                                 <motion.tr whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.7)" }} key={app._id} className="bg-slate-900/40 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all rounded-xl relative group">
                                    <td className="px-4 py-4 rounded-l-xl border-t border-l border-b border-slate-700">
                                       <div className="font-mono text-xs font-black text-slate-400">#{app.trackingId.substring(0, 10)}...</div>
                                       <div className="text-[9px] text-slate-500 uppercase font-bold mt-1">Submitted: {new Date(app.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-4 py-4 font-bold text-slate-200 border-t border-b border-slate-700">
                                       <span className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-slate-500" /> {app.certificateType} Cert</span>
                                    </td>
                                    <td className="px-4 py-4 border-t border-b border-slate-700">
                                       {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-4 py-4 rounded-r-xl border-t border-r border-b border-slate-700 text-right">
                                       {app.status === 'Approved' ? (
                                          <button onClick={() => navigate(`/certificate/${app.trackingId}`)} className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-900 shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:bg-blue-50 text-blue-600 transition-all border border-blue-100">
                                             <span className="text-xs font-bold mr-2 hidden sm:inline">Portal</span>
                                             <Download className="w-4 h-4" />
                                          </button>
                                       ) : (
                                          <span className="text-xs font-bold text-slate-500">In Transit</span>
                                       )}
                                    </td>
                                 </motion.tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </motion.div>

            </div>

            {/* RIGHT SIDEBAR PANEL */}
            <div className="xl:col-span-4 space-y-8">

               {/* Smart Digital Locker */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="rounded-3xl bg-gradient-to-br from-gray-900 to-blue-950 text-white p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <h3 className="text-xl font-black mb-2 flex items-center gap-3 relative z-10"><Shield className="w-6 h-6 text-blue-400" /> Smart Vault</h3>
                  <p className="text-sm text-slate-600 font-medium mb-6 relative z-10 leading-relaxed">Cryptographically secure storage for your identity credentials & approved payloads.</p>

                  <div className="space-y-3 relative z-10">
                     <div className="bg-slate-900/10 backdrop-blur-md rounded-xl p-4 border border-slate-700/10 flex items-center justify-between cursor-pointer hover:bg-slate-900/20 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-blue-500/20 rounded-lg"><FileText className="w-4 h-4 text-blue-300" /></div>
                           <span className="font-bold text-sm">Aadhar Cache</span>
                        </div>
                        <span className="text-xs font-bold text-green-400">SYNCED</span>
                     </div>
                     <div className="bg-slate-900/10 backdrop-blur-md rounded-xl p-4 border border-slate-700/10 flex items-center justify-between cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-purple-500/20 rounded-lg"><FileText className="w-4 h-4 text-purple-300" /></div>
                           <span className="font-bold text-sm">PAN Cache</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">EMPTY</span>
                     </div>
                  </div>
               </motion.div>

               {/* Grievance Module */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-3d rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-slate-50 text-lg flex items-center"><MessageSquare className="w-5 h-5 mr-2 text-red-500" /> Support Hub</h3>
                     <button onClick={() => setShGrievanceModal(true)} className="bg-slate-900 border text-xs font-bold text-slate-300 px-3 py-1.5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all">New Case</button>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                     {grievances.length === 0 ? (
                        <div className="text-center py-4 opacity-50"><p className="text-xs font-bold text-slate-400">No active support tickets.</p></div>
                     ) : (
                        grievances.map(g => (
                           <div key={g._id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-slate-900 transition-all cursor-pointer">
                              <div className="flex justify-between items-center mb-2">
                                 <h4 className="text-sm font-bold text-slate-200 truncate pr-2">{g.title}</h4>
                                 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${g.status === 'Resolved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{g.status}</span>
                              </div>
                              <p className="text-xs text-slate-400 font-medium mb-2 truncate">{g.description}</p>
                              {g.adminReply && (
                                 <div className="bg-blue-50/50 p-2 rounded-lg border-l-2 border-blue-500 text-[10px] font-medium text-blue-800 line-clamp-2">
                                    <strong>Response:</strong> {g.adminReply}
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               </motion.div>

               {/* Rapid Info Widget */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-3d rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden">

                  <h3 className="font-black text-slate-50 text-sm tracking-widest uppercase mb-4 relative z-10 border-b border-slate-700 pb-2">Broadcast</h3>
                  <div className="space-y-4 relative z-10 text-sm font-medium text-slate-400">
                     <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> All certificates now feature 256-bit secure QR validation.</p>
                     <p className="flex items-start gap-2"><span className="text-blue-500 font-black">•</span> Scheduled portal maintenance on upcoming Sunday.</p>
                  </div>
               </motion.div>

            </div>
         </main>

         {/* Grievance Modal (3D Glass) */}
         <AnimatePresence>
            {shGrievanceModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShGrievanceModal(false)}></motion.div>

                  <motion.div
                     initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                     animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                     exit={{ opacity: 0, scale: 0.9, rotateX: -20 }}
                     style={{ transformStyle: "preserve-3d" }}
                     className="glass-3d bg-slate-900/80 rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] max-w-lg w-full relative z-10 overflow-hidden"
                  >
                     <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/40">
                        <h3 className="text-xl font-black text-slate-50 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Lodge Complaint</h3>
                        <button onClick={() => setShGrievanceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900/60 hover:bg-slate-900 text-slate-400 border border-transparent hover:border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">×</button>
                     </div>

                     <form onSubmit={submitGrievance} className="p-6 space-y-5 relative z-10">
                        <div>
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Title</label>
                           <input required type="text" value={gForm.title} onChange={e => setGForm({ ...gForm, title: e.target.value })} className="w-full bg-slate-900/70 backdrop-blur-sm border border-slate-700 shadow-inner rounded-xl p-3 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="E.g., Delay in Income verification" />
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Department Route</label>
                           <div className="relative">
                              <select value={gForm.department} onChange={e => setGForm({ ...gForm, department: e.target.value })} className="w-full appearance-none bg-slate-900/70 backdrop-blur-sm border border-slate-700 shadow-inner rounded-xl p-3 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                 <option value="Revenue">Revenue Authority</option>
                                 <option value="General">General Administration</option>
                                 <option value="Technical">Technical Operations</option>
                                 <option value="Other">Other Routing</option>
                              </select>
                              <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-4 rotate-90 pointer-events-none" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Area/Jurisdiction</label>
                           <div className="relative">
                              <select required value={gForm.area} onChange={e => setGForm({ ...gForm, area: e.target.value })} className="w-full appearance-none bg-slate-900/70 backdrop-blur-sm border border-slate-700 shadow-inner rounded-xl p-3 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                 <option value="">Select Area</option>
                                 <option value="North Zone">North Zone</option>
                                 <option value="South Zone">South Zone</option>
                                 <option value="East Zone">East Zone</option>
                                 <option value="West Zone">West Zone</option>
                                 <option value="Central Zone">Central Zone</option>
                              </select>
                              <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-4 rotate-90 pointer-events-none" />
                           </div>
                        </div>
                        <div>
                           <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Context</label>
                           <textarea required value={gForm.description} onChange={e => setGForm({ ...gForm, description: e.target.value })} rows="4" className="w-full bg-slate-900/70 backdrop-blur-sm border border-slate-700 shadow-inner rounded-xl p-3 text-sm font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Provide full context..."></textarea>
                        </div>

                        <div className="pt-2 flex justify-end gap-3 border-t border-slate-700/50 mt-4 pt-6">
                           <button type="button" onClick={() => setShGrievanceModal(false)} className="px-5 py-2.5 font-bold text-slate-400 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all">Discard</button>
                           <button type="submit" className="px-5 py-2.5 font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 rounded-xl hover:-translate-y-0.5 transition-all outline-none">Transmit</button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}


// import React, { useState, useEffect, useRef } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
// import {
//    FileText, MapPin, Building, Baby, ChevronRight, Download,
//    Search, Shield, MessageSquare, Zap, Globe, X, AlertTriangle,
//    Terminal, Activity, Lock, Cpu, Radio, Eye
// } from 'lucide-react';
// import Navbar from '../components/Navbar';

// /* ── Google Font injection ───────────────────────────────────────── */
// const FontInjector = () => (
//    <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');

//     :root {
//       --cyan:   #00f5ff;
//       --lime:   #aaff00;
//       --red:    #ff2d55;
//       --amber:  #ffb800;
//       --bg:     #060a0f;
//       --surface:#0d1520;
//       --border: rgba(0,245,255,0.15);
//       --glow:   0 0 20px rgba(0,245,255,0.3);
//     }

//     .dash-root { background: var(--bg); font-family: 'Rajdhani', sans-serif; }
//     .mono      { font-family: 'Share Tech Mono', monospace; }
//     .display   { font-family: 'Orbitron', sans-serif; }

//     /* scanline overlay */
//     .scanlines::before {
//       content: '';
//       position: fixed; inset: 0; pointer-events: none; z-index: 1000;
//       background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
//     }

//     /* neon card */
//     .neon-card {
//       background: var(--surface);
//       border: 1px solid var(--border);
//       border-radius: 4px;
//       position: relative;
//       overflow: hidden;
//     }
//     .neon-card::before {
//       content: '';
//       position: absolute; inset: 0;
//       background: linear-gradient(135deg, rgba(0,245,255,0.04) 0%, transparent 60%);
//       pointer-events: none;
//     }
//     .neon-card:hover { border-color: rgba(0,245,255,0.45); box-shadow: var(--glow); }

//     /* corner accent */
//     .corner::after, .corner::before {
//       content: ''; position: absolute; width: 12px; height: 12px;
//       border-color: var(--cyan); border-style: solid;
//     }
//     .corner::before { top: 6px; left: 6px; border-width: 1px 0 0 1px; }
//     .corner::after  { bottom: 6px; right: 6px; border-width: 0 1px 1px 0; }

//     /* grid bg */
//     .grid-bg {
//       background-image:
//         linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
//         linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px);
//       background-size: 40px 40px;
//     }

//     /* glitch text */
//     @keyframes glitch {
//       0%,100% { clip-path: inset(0 0 100% 0); transform: translate(0); }
//       20%      { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 1px); }
//       40%      { clip-path: inset(50% 0 30% 0); transform: translate(2px, -1px); }
//       60%      { clip-path: inset(80% 0 5%  0); transform: translate(-1px, 2px); }
//       80%      { clip-path: inset(5%  0 80% 0); transform: translate(1px, -2px); }
//     }

//     /* pulse ring */
//     @keyframes pulse-ring {
//       0%   { transform: scale(1);   opacity: 0.8; }
//       100% { transform: scale(2.2); opacity: 0; }
//     }
//     .pulse-ring::after {
//       content: ''; position: absolute; inset: 0; border-radius: 50%;
//       border: 1px solid var(--cyan);
//       animation: pulse-ring 2s ease-out infinite;
//     }

//     /* ticker */
//     @keyframes ticker {
//       from { transform: translateX(100%); }
//       to   { transform: translateX(-100%); }
//     }
//     .ticker-inner { animation: ticker 18s linear infinite; white-space: nowrap; }

//     /* table row hover */
//     .app-row:hover td { background: rgba(0,245,255,0.04); }

//     /* scrollbar */
//     .custom-scroll::-webkit-scrollbar { width: 4px; }
//     .custom-scroll::-webkit-scrollbar-track { background: transparent; }
//     .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.3); border-radius: 2px; }

//     /* modal backdrop blur */
//     .modal-backdrop { backdrop-filter: blur(12px); background: rgba(6,10,15,0.85); }

//     /* button */
//     .btn-cyber {
//       font-family: 'Orbitron', sans-serif;
//       font-size: 11px; font-weight: 700; letter-spacing: 2px;
//       background: transparent; border: 1px solid var(--cyan);
//       color: var(--cyan); padding: 10px 22px;
//       clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
//       cursor: pointer; transition: all 0.2s;
//       position: relative; overflow: hidden;
//     }
//     .btn-cyber::before {
//       content: ''; position: absolute; inset: 0;
//       background: var(--cyan); transform: translateX(-101%);
//       transition: transform 0.2s;
//     }
//     .btn-cyber:hover::before { transform: translateX(0); }
//     .btn-cyber:hover { color: var(--bg); }

//     .btn-solid {
//       font-family: 'Orbitron', sans-serif;
//       font-size: 11px; font-weight: 700; letter-spacing: 2px;
//       background: var(--cyan); border: none; color: var(--bg);
//       padding: 10px 22px;
//       clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
//       cursor: pointer; transition: all 0.2s;
//     }
//     .btn-solid:hover { background: var(--lime); }

//     /* stat bar */
//     @keyframes fill-bar { from { width: 0; } }

//     /* input */
//     .cyber-input {
//       background: rgba(0,245,255,0.03);
//       border: 1px solid rgba(0,245,255,0.2);
//       border-radius: 2px; color: #e0f7fa;
//       font-family: 'Share Tech Mono', monospace; font-size: 13px;
//       padding: 10px 14px; width: 100%; outline: none;
//       transition: border-color 0.2s, box-shadow 0.2s;
//     }
//     .cyber-input:focus {
//       border-color: var(--cyan);
//       box-shadow: 0 0 0 2px rgba(0,245,255,0.12);
//     }
//     .cyber-input::placeholder { color: rgba(0,245,255,0.25); }
//     select.cyber-input option { background: #0d1520; }
//   `}</style>
// );

// /* ── Particle canvas background ─────────────────────────────────── */
// function ParticleField() {
//    const canvasRef = useRef(null);
//    useEffect(() => {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext('2d');
//       let W = canvas.width = window.innerWidth;
//       let H = canvas.height = window.innerHeight;
//       const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
//       window.addEventListener('resize', resize);

//       const pts = Array.from({ length: 80 }, () => ({
//          x: Math.random() * W, y: Math.random() * H,
//          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
//          r: Math.random() * 1.5 + 0.5,
//       }));

//       let raf;
//       const draw = () => {
//          ctx.clearRect(0, 0, W, H);
//          pts.forEach(p => {
//             p.x += p.vx; p.y += p.vy;
//             if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
//             if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
//             ctx.beginPath();
//             ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
//             ctx.fillStyle = 'rgba(0,245,255,0.5)';
//             ctx.fill();
//          });
//          for (let i = 0; i < pts.length; i++) {
//             for (let j = i + 1; j < pts.length; j++) {
//                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
//                const d = Math.sqrt(dx * dx + dy * dy);
//                if (d < 120) {
//                   ctx.beginPath();
//                   ctx.moveTo(pts[i].x, pts[i].y);
//                   ctx.lineTo(pts[j].x, pts[j].y);
//                   ctx.strokeStyle = `rgba(0,245,255,${(1 - d / 120) * 0.15})`;
//                   ctx.lineWidth = 0.5;
//                   ctx.stroke();
//                }
//             }
//          }
//          raf = requestAnimationFrame(draw);
//       };
//       draw();
//       return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
//    }, []);
//    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
// }

// /* ── Ticker bar ──────────────────────────────────────────────────── */
// function Ticker() {
//    const items = [
//       'SYSTEM ONLINE — ALL NODES OPERATIONAL',
//       'PORTAL VERSION 4.2.1',
//       'AI VERIFICATION ENGINE ACTIVE',
//       'ENCRYPTION: AES-256-GCM',
//       'UPTIME: 99.97%',
//       'NEXT MAINTENANCE WINDOW: SUNDAY 02:00 IST',
//    ];
//    return (
//       <div className="overflow-hidden border-t border-b" style={{ borderColor: 'var(--border)', background: 'rgba(0,245,255,0.03)' }}>
//          <div className="ticker-inner py-1.5 mono text-xs" style={{ color: 'var(--cyan)', opacity: 0.6 }}>
//             {items.map((t, i) => (
//                <span key={i} className="mx-12">◈ {t}</span>
//             ))}
//          </div>
//       </div>
//    );
// }

// /* ── Service card ────────────────────────────────────────────────── */
// const CERT_TYPES = [
//    { type: 'Income', icon: Zap, title: 'INCOME', sub: 'Validation Protocol', accent: '#00f5ff', code: 'INC-4X' },
//    { type: 'Domicile', icon: MapPin, title: 'DOMICILE', sub: 'Residency Auth', accent: '#aaff00', code: 'DOM-7R' },
//    { type: 'EWS', icon: Building, title: 'EWS', sub: 'Economic Status Verify', accent: '#ff2d55', code: 'EWS-2K' },
//    { type: 'Birth', icon: Baby, title: 'BIRTH', sub: 'Registration Record', accent: '#ffb800', code: 'BRT-9M' },
// ];

// function ServiceCard({ cert, onClick, index }) {
//    const x = useMotionValue(0), y = useMotionValue(0);
//    const rotX = useTransform(y, [-60, 60], [8, -8]);
//    const rotY = useTransform(x, [-60, 60], [-8, 8]);

//    return (
//       <motion.div
//          initial={{ opacity: 0, y: 50 }}
//          animate={{ opacity: 1, y: 0 }}
//          transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
//          style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 800 }}
//          onMouseMove={e => {
//             const r = e.currentTarget.getBoundingClientRect();
//             x.set(e.clientX - r.left - r.width / 2);
//             y.set(e.clientY - r.top - r.height / 2);
//          }}
//          onMouseLeave={() => { x.set(0); y.set(0); }}
//          onClick={onClick}
//          className="neon-card corner cursor-pointer group transition-all duration-300"
//          whileTap={{ scale: 0.97 }}
//       >
//          {/* top accent bar */}
//          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${cert.accent}, transparent)` }} />

//          <div className="p-6">
//             {/* header row */}
//             <div className="flex justify-between items-start mb-5">
//                <div className="relative">
//                   <div className="w-12 h-12 flex items-center justify-center rounded-sm border"
//                      style={{ borderColor: `${cert.accent}40`, background: `${cert.accent}10` }}>
//                      <cert.icon className="w-6 h-6" style={{ color: cert.accent }} />
//                   </div>
//                </div>
//                <span className="mono text-xs px-2 py-0.5 rounded-sm border"
//                   style={{ color: cert.accent, borderColor: `${cert.accent}30`, background: `${cert.accent}08`, fontSize: 10 }}>
//                   {cert.code}
//                </span>
//             </div>

//             {/* title */}
//             <h4 className="display font-black text-white mb-1 tracking-wider" style={{ fontSize: 18 }}>{cert.title}</h4>
//             <p className="text-xs font-medium mb-6" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Rajdhani' }}>{cert.sub}</p>

//             {/* bottom row */}
//             <div className="flex items-center justify-between">
//                <span className="mono text-xs flex items-center gap-1.5" style={{ color: `${cert.accent}99` }}>
//                   <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: cert.accent }} />
//                   AI ACTIVE
//                </span>
//                <motion.div
//                   whileHover={{ x: 4 }}
//                   className="w-8 h-8 flex items-center justify-center rounded-sm border transition-colors"
//                   style={{ borderColor: `${cert.accent}40`, color: cert.accent }}
//                >
//                   <ChevronRight className="w-4 h-4" />
//                </motion.div>
//             </div>
//          </div>
//       </motion.div>
//    );
// }

// /* ── Status badge ────────────────────────────────────────────────── */
// function StatusBadge({ status }) {
//    const cfg = {
//       Approved: { color: '#aaff00', bg: 'rgba(170,255,0,0.08)', border: 'rgba(170,255,0,0.25)', icon: '◉' },
//       Rejected: { color: '#ff2d55', bg: 'rgba(255,45,85,0.08)', border: 'rgba(255,45,85,0.25)', icon: '✕' },
//       'In Progress': { color: '#ffb800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.25)', icon: '◎' },
//       Submitted: { color: '#00f5ff', bg: 'rgba(0,245,255,0.08)', border: 'rgba(0,245,255,0.25)', icon: '◈' },
//    };
//    const c = cfg[status] || cfg.Submitted;
//    return (
//       <span className="mono inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs"
//          style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}>
//          <span style={{ fontSize: 8 }}>{c.icon}</span>{status.toUpperCase()}
//       </span>
//    );
// }

// /* ── Main Dashboard ──────────────────────────────────────────────── */
// export default function Dashboard() {
//    const { user, token } = useAuth();
//    const navigate = useNavigate();
//    const [applications, setApplications] = useState([]);
//    const [grievances, setGrievances] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [showModal, setShowModal] = useState(false);
//    const [gForm, setGForm] = useState({ title: '', department: 'General', description: '' });
//    const [submitGrv, setSubmitGrv] = useState(false);
//    const [clock, setClock] = useState(new Date());

//    useEffect(() => {
//       const t = setInterval(() => setClock(new Date()), 1000);
//       return () => clearInterval(t);
//    }, []);

//    useEffect(() => {
//       const fetchData = async () => {
//          try {
//             const [appRes, grvRes] = await Promise.all([
//                axios.get('http://localhost:5000/api/applications/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
//                axios.get('http://localhost:5000/api/grievances/my', { headers: { Authorization: `Bearer ${token}` } }),
//             ]);
//             setApplications(appRes.data.data);
//             setGrievances(grvRes.data.data);
//          } catch (err) {
//             console.error('Failed to load data', err);
//          } finally {
//             setLoading(false);
//          }
//       };
//       if (token) fetchData();
//    }, [token]);

//    const submitGrievance = async (e) => {
//       e.preventDefault();
//       setSubmitGrv(true);
//       try {
//          const res = await axios.post('http://localhost:5000/api/grievances', gForm, {
//             headers: { Authorization: `Bearer ${token}` },
//          });
//          setGrievances([res.data.data, ...grievances]);
//          setShowModal(false);
//          setGForm({ title: '', department: 'General', description: '' });
//       } catch (err) {
//          alert('Failed to submit grievance');
//       } finally {
//          setSubmitGrv(false);
//       }
//    };

//    const timeStr = clock.toLocaleTimeString('en-IN', { hour12: false });
//    const dateStr = clock.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

//    return (
//       <>
//          <FontInjector />
//          <div className="dash-root scanlines grid-bg min-h-screen flex flex-col relative">
//             <ParticleField />

//             {/* subtle vignette */}
//             <div className="fixed inset-0 pointer-events-none z-10"
//                style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(6,10,15,0.85) 100%)' }} />

//             <Navbar />
//             <Ticker />

//             <main className="relative z-20 max-w-[1440px] mx-auto w-full px-4 sm:px-8 lg:px-12 pt-10 pb-20">

//                {/* ── TOP STATUS BAR ── */}
//                <motion.div
//                   initial={{ opacity: 0, y: -20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="neon-card corner mb-8 px-6 py-4 flex flex-wrap items-center justify-between gap-4"
//                >
//                   <div className="flex items-center gap-6">
//                      <div>
//                         <p className="mono text-xs mb-0.5" style={{ color: 'rgba(0,245,255,0.45)' }}>OPERATOR</p>
//                         <p className="display font-bold text-white tracking-wide text-sm">
//                            {user?.fullName?.toUpperCase() || 'CITIZEN'}
//                         </p>
//                      </div>
//                      <div className="w-px h-8" style={{ background: 'var(--border)' }} />
//                      <div>
//                         <p className="mono text-xs mb-0.5" style={{ color: 'rgba(0,245,255,0.45)' }}>SESSION</p>
//                         <p className="mono text-sm" style={{ color: 'var(--lime)' }}>AUTHENTICATED</p>
//                      </div>
//                      <div className="w-px h-8" style={{ background: 'var(--border)' }} />
//                      <div>
//                         <p className="mono text-xs mb-0.5" style={{ color: 'rgba(0,245,255,0.45)' }}>ACTIVE FILINGS</p>
//                         <p className="mono text-sm text-white">{applications.length.toString().padStart(2, '0')}</p>
//                      </div>
//                   </div>

//                   <div className="flex items-center gap-4">
//                      {user?.role === 'admin' && (
//                         <button className="btn-cyber" onClick={() => navigate('/admin')}>
//                            ADMIN ACCESS
//                         </button>
//                      )}
//                      <div className="text-right">
//                         <p className="mono font-bold text-lg leading-none text-white">{timeStr}</p>
//                         <p className="mono text-xs mt-0.5" style={{ color: 'rgba(0,245,255,0.4)' }}>{dateStr}</p>
//                      </div>
//                   </div>
//                </motion.div>

//                {/* ── MAIN GRID ── */}
//                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

//                   {/* LEFT COL */}
//                   <div className="xl:col-span-8 space-y-6">

//                      {/* Hero */}
//                      <motion.div
//                         initial={{ opacity: 0, scale: 0.97 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.6 }}
//                         className="neon-card corner relative overflow-hidden"
//                         style={{ minHeight: 220 }}
//                      >
//                         {/* diagonal accent line */}
//                         <div className="absolute inset-0 pointer-events-none"
//                            style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06) 0%, transparent 50%)' }} />
//                         <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none flex items-center justify-center">
//                            <Globe style={{ width: 240, height: 240, color: 'var(--cyan)' }} />
//                         </div>

//                         <div className="p-8 relative z-10">
//                            <div className="flex items-center gap-2 mb-4">
//                               <span className="relative w-2 h-2 pulse-ring">
//                                  <span className="absolute inset-0 rounded-full" style={{ background: 'var(--cyan)' }} />
//                               </span>
//                               <span className="mono text-xs tracking-widest" style={{ color: 'var(--cyan)', opacity: 0.7 }}>
//                                  CERTIFYGOV — e-GOVERNANCE PORTAL v4.2
//                               </span>
//                            </div>

//                            <h1 className="display font-black text-white leading-tight mb-3"
//                               style={{ fontSize: 'clamp(28px, 4vw, 52px)', letterSpacing: '-1px' }}>
//                               CITIZEN<br />
//                               <span style={{
//                                  background: 'linear-gradient(90deg, var(--cyan), var(--lime))',
//                                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
//                               }}>SERVICES HUB</span>
//                            </h1>

//                            <p className="text-sm font-medium max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Rajdhani' }}>
//                               AI-verified digital certifications processed with cryptographic integrity.
//                               All documents authenticated via multi-layer OCR analysis.
//                            </p>

//                            <div className="mt-6 flex flex-wrap gap-3">
//                               {[
//                                  { icon: Lock, label: 'AES-256 ENCRYPTED' },
//                                  { icon: Cpu, label: 'AI OCR ENGINE' },
//                                  { icon: Activity, label: 'REAL-TIME TRACKING' },
//                               ].map(({ icon: Icon, label }) => (
//                                  <span key={label} className="mono inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs"
//                                     style={{ color: 'rgba(0,245,255,0.6)', background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
//                                     <Icon className="w-3 h-3" />{label}
//                                  </span>
//                               ))}
//                            </div>
//                         </div>
//                      </motion.div>

//                      {/* Service Cards */}
//                      <div>
//                         <div className="flex items-center justify-between mb-4">
//                            <div className="flex items-center gap-3">
//                               <Terminal className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
//                               <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>
//                                  SERVICE MODULES
//                               </h3>
//                            </div>
//                            <span className="mono text-xs" style={{ color: 'rgba(0,245,255,0.35)' }}>
//                               {CERT_TYPES.length} PROTOCOLS AVAILABLE
//                            </span>
//                         </div>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                            {CERT_TYPES.map((cert, i) => (
//                               <ServiceCard
//                                  key={cert.type}
//                                  cert={cert}
//                                  index={i}
//                                  onClick={() => navigate(`/apply?type=${cert.type}`)}
//                               />
//                            ))}
//                         </div>
//                      </div>

//                      {/* Applications Table */}
//                      <motion.div
//                         initial={{ opacity: 0, y: 30 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ delay: 0.3 }}
//                         className="neon-card corner"
//                      >
//                         <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
//                            <div className="flex items-center gap-3">
//                               <Radio className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
//                               <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>
//                                  APPLICATION TRACKING
//                               </h3>
//                            </div>
//                            <span className="mono text-xs" style={{ color: 'rgba(0,245,255,0.35)' }}>
//                               LIVE FEED
//                            </span>
//                         </div>

//                         <div className="overflow-x-auto">
//                            <table className="w-full app-row" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
//                               <thead>
//                                  <tr style={{ borderBottom: '1px solid rgba(0,245,255,0.08)' }}>
//                                     {['TRACKING ID', 'PROTOCOL', 'ISSUED', 'STATUS', 'ACCESS'].map(h => (
//                                        <th key={h} className="mono px-6 py-3 text-left text-xs font-normal"
//                                           style={{ color: 'rgba(0,245,255,0.35)', letterSpacing: '1.5px' }}>
//                                           {h}
//                                        </th>
//                                     ))}
//                                  </tr>
//                               </thead>
//                               <tbody>
//                                  {loading ? (
//                                     <tr><td colSpan={5} className="px-6 py-12 text-center">
//                                        <div className="mono text-sm animate-pulse" style={{ color: 'rgba(0,245,255,0.4)' }}>
//                                           ◈ SYNCING WITH SERVER...
//                                        </div>
//                                     </td></tr>
//                                  ) : applications.length === 0 ? (
//                                     <tr><td colSpan={5} className="px-6 py-16 text-center">
//                                        <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(0,245,255,0.2)' }} />
//                                        <p className="mono text-sm" style={{ color: 'rgba(0,245,255,0.3)' }}>NO ACTIVE RECORDS FOUND</p>
//                                     </td></tr>
//                                  ) : (
//                                     applications.map((app, i) => (
//                                        <motion.tr
//                                           key={app._id}
//                                           initial={{ opacity: 0, x: -10 }}
//                                           animate={{ opacity: 1, x: 0 }}
//                                           transition={{ delay: i * 0.05 }}
//                                           className="app-row cursor-default"
//                                           style={{ borderBottom: '1px solid rgba(0,245,255,0.05)' }}
//                                        >
//                                           <td className="px-6 py-4">
//                                              <span className="mono text-xs" style={{ color: 'var(--cyan)' }}>
//                                                 #{app.trackingId?.substring(0, 12)}…
//                                              </span>
//                                           </td>
//                                           <td className="px-6 py-4">
//                                              <span className="mono text-xs text-white">{app.certificateType?.toUpperCase()} CERT</span>
//                                           </td>
//                                           <td className="px-6 py-4">
//                                              <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
//                                                 {new Date(app.createdAt).toLocaleDateString('en-IN')}
//                                              </span>
//                                           </td>
//                                           <td className="px-6 py-4">
//                                              <StatusBadge status={app.status} />
//                                           </td>
//                                           <td className="px-6 py-4">
//                                              {app.status === 'Approved' ? (
//                                                 <button
//                                                    onClick={() => navigate(`/certificate/${app.trackingId}`)}
//                                                    className="mono inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs transition-all hover:opacity-80"
//                                                    style={{ color: 'var(--lime)', background: 'rgba(170,255,0,0.08)', border: '1px solid rgba(170,255,0,0.25)' }}
//                                                 >
//                                                    <Download className="w-3 h-3" /> RETRIEVE
//                                                 </button>
//                                              ) : (
//                                                 <span className="mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>PENDING</span>
//                                              )}
//                                           </td>
//                                        </motion.tr>
//                                     ))
//                                  )}
//                               </tbody>
//                            </table>
//                         </div>
//                      </motion.div>

//                   </div>

//                   {/* RIGHT SIDEBAR */}
//                   <div className="xl:col-span-4 space-y-6">

//                      {/* Vault */}
//                      <motion.div
//                         initial={{ opacity: 0, x: 30 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.2 }}
//                         className="neon-card corner"
//                      >
//                         <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
//                            <Lock className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
//                            <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>SECURE VAULT</h3>
//                         </div>

//                         <div className="p-6 space-y-3">
//                            {[
//                               { label: 'AADHAAR CACHE', status: 'SYNCED', color: 'var(--lime)', active: true },
//                               { label: 'PAN CACHE', status: 'EMPTY', color: 'rgba(255,255,255,0.2)', active: false },
//                               { label: 'DIGILOCKER', status: 'LINKED', color: 'var(--cyan)', active: true },
//                            ].map(item => (
//                               <div key={item.label}
//                                  className="flex items-center justify-between p-4 rounded-sm transition-all"
//                                  style={{ background: item.active ? 'rgba(0,245,255,0.04)' : 'transparent', border: '1px solid rgba(0,245,255,0.08)' }}>
//                                  <div className="flex items-center gap-3">
//                                     <FileText className="w-4 h-4" style={{ color: item.active ? 'var(--cyan)' : 'rgba(255,255,255,0.2)' }} />
//                                     <span className="mono text-xs" style={{ color: item.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
//                                        {item.label}
//                                     </span>
//                                  </div>
//                                  <span className="mono text-xs" style={{ color: item.color }}>{item.status}</span>
//                               </div>
//                            ))}
//                         </div>
//                      </motion.div>

//                      {/* Grievance Hub */}
//                      <motion.div
//                         initial={{ opacity: 0, x: 30 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.3 }}
//                         className="neon-card corner"
//                      >
//                         <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
//                            <div className="flex items-center gap-3">
//                               <MessageSquare className="w-4 h-4" style={{ color: 'var(--red)' }} />
//                               <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>SUPPORT TICKETS</h3>
//                            </div>
//                            <button className="btn-cyber" style={{ padding: '6px 14px', fontSize: 9 }} onClick={() => setShowModal(true)}>
//                               + NEW
//                            </button>
//                         </div>

//                         <div className="p-4 space-y-3 max-h-72 overflow-y-auto custom-scroll">
//                            {grievances.length === 0 ? (
//                               <div className="text-center py-8">
//                                  <Eye className="w-6 h-6 mx-auto mb-2" style={{ color: 'rgba(0,245,255,0.2)' }} />
//                                  <p className="mono text-xs" style={{ color: 'rgba(0,245,255,0.3)' }}>NO ACTIVE TICKETS</p>
//                               </div>
//                            ) : grievances.map(g => (
//                               <div key={g._id} className="p-4 rounded-sm transition-all hover:opacity-80"
//                                  style={{ background: 'rgba(255,45,85,0.04)', border: '1px solid rgba(255,45,85,0.15)' }}>
//                                  <div className="flex justify-between items-center mb-2">
//                                     <span className="mono text-xs text-white truncate pr-2">{g.title}</span>
//                                     <span className="mono text-xs px-2 py-0.5 rounded-sm"
//                                        style={{
//                                           color: g.status === 'Resolved' ? 'var(--lime)' : 'var(--amber)',
//                                           background: g.status === 'Resolved' ? 'rgba(170,255,0,0.08)' : 'rgba(255,184,0,0.08)',
//                                           border: `1px solid ${g.status === 'Resolved' ? 'rgba(170,255,0,0.2)' : 'rgba(255,184,0,0.2)'}`,
//                                           fontSize: 9
//                                        }}>
//                                        {g.status?.toUpperCase()}
//                                     </span>
//                                  </div>
//                                  <p className="mono text-xs truncate mb-2" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
//                                     {g.description}
//                                  </p>
//                                  {g.adminReply && (
//                                     <div className="p-2 rounded-sm" style={{ background: 'rgba(0,245,255,0.05)', borderLeft: '2px solid var(--cyan)' }}>
//                                        <p className="mono text-xs line-clamp-2" style={{ color: 'rgba(0,245,255,0.7)', fontSize: 10 }}>
//                                           ▶ {g.adminReply}
//                                        </p>
//                                     </div>
//                                  )}
//                               </div>
//                            ))}
//                         </div>
//                      </motion.div>

//                      {/* Broadcast */}
//                      <motion.div
//                         initial={{ opacity: 0, x: 30 }}
//                         animate={{ opacity: 1, x: 0 }}
//                         transition={{ delay: 0.4 }}
//                         className="neon-card corner"
//                      >
//                         <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
//                            <Radio className="w-4 h-4" style={{ color: 'var(--amber)' }} />
//                            <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>BROADCAST</h3>
//                         </div>
//                         <div className="p-6 space-y-4">
//                            {[
//                               'All certificates now include 256-bit QR validation for instant verification.',
//                               'Scheduled maintenance window: Sunday 02:00–04:00 IST.',
//                               'New Domicile certificate fast-track available for senior citizens.',
//                            ].map((msg, i) => (
//                               <div key={i} className="flex gap-3">
//                                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--amber)' }} />
//                                  <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'Rajdhani' }}>
//                                     {msg}
//                                  </p>
//                               </div>
//                            ))}
//                         </div>
//                      </motion.div>

//                   </div>
//                </div>
//             </main>

//             {/* ── GRIEVANCE MODAL ── */}
//             <AnimatePresence>
//                {showModal && (
//                   <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
//                      <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         className="absolute inset-0 modal-backdrop"
//                         onClick={() => setShowModal(false)}
//                      />
//                      <motion.div
//                         initial={{ opacity: 0, scale: 0.93, y: 20 }}
//                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                         exit={{ opacity: 0, scale: 0.93, y: 20 }}
//                         transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                         className="neon-card corner relative z-10 w-full max-w-lg"
//                         style={{ borderColor: 'rgba(255,45,85,0.3)' }}
//                      >
//                         {/* top accent */}
//                         <div className="h-0.5" style={{ background: 'linear-gradient(90deg, transparent, var(--red), transparent)' }} />

//                         <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,45,85,0.15)' }}>
//                            <div className="flex items-center gap-3">
//                               <AlertTriangle className="w-4 h-4" style={{ color: 'var(--red)' }} />
//                               <h3 className="display font-bold text-white tracking-wider" style={{ fontSize: 13 }}>LODGE COMPLAINT</h3>
//                            </div>
//                            <button onClick={() => setShowModal(false)}
//                               className="w-8 h-8 flex items-center justify-center rounded-sm text-white transition-colors hover:bg-white/10"
//                               style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
//                               <X className="w-4 h-4" />
//                            </button>
//                         </div>

//                         <form onSubmit={submitGrievance} className="p-6 space-y-5">
//                            <div>
//                               <label className="mono block text-xs mb-2" style={{ color: 'rgba(0,245,255,0.5)', letterSpacing: '1.5px' }}>
//                                  SUBJECT TITLE
//                               </label>
//                               <input
//                                  required type="text" value={gForm.title}
//                                  onChange={e => setGForm({ ...gForm, title: e.target.value })}
//                                  className="cyber-input"
//                                  placeholder="e.g. DELAY IN INCOME CERT PROCESSING"
//                               />
//                            </div>

//                            <div>
//                               <label className="mono block text-xs mb-2" style={{ color: 'rgba(0,245,255,0.5)', letterSpacing: '1.5px' }}>
//                                  DEPARTMENT ROUTE
//                               </label>
//                               <select
//                                  value={gForm.department}
//                                  onChange={e => setGForm({ ...gForm, department: e.target.value })}
//                                  className="cyber-input"
//                               >
//                                  <option value="Revenue">REVENUE AUTHORITY</option>
//                                  <option value="General">GENERAL ADMINISTRATION</option>
//                                  <option value="Technical">TECHNICAL OPERATIONS</option>
//                                  <option value="Other">OTHER ROUTING</option>
//                               </select>
//                            </div>

//                            <div>
//                               <label className="mono block text-xs mb-2" style={{ color: 'rgba(0,245,255,0.5)', letterSpacing: '1.5px' }}>
//                                  CONTEXT / DETAILS
//                               </label>
//                               <textarea
//                                  required rows={4} value={gForm.description}
//                                  onChange={e => setGForm({ ...gForm, description: e.target.value })}
//                                  className="cyber-input resize-none"
//                                  placeholder="Provide full context of your complaint..."
//                               />
//                            </div>

//                            <div className="flex gap-3 pt-2">
//                               <button type="button" className="btn-cyber flex-1" onClick={() => setShowModal(false)}>
//                                  DISCARD
//                               </button>
//                               <button type="submit" disabled={submitGrv} className="btn-solid flex-1"
//                                  style={{ opacity: submitGrv ? 0.6 : 1 }}>
//                                  {submitGrv ? 'TRANSMITTING…' : 'TRANSMIT'}
//                               </button>
//                            </div>
//                         </form>
//                      </motion.div>
//                   </div>
//                )}
//             </AnimatePresence>
//          </div>
//       </>
//    );
// }