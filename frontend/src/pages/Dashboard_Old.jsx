import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, MapPin, Building, Baby, ChevronRight, Download, Search, Shield, MessageSquare, Zap, Globe, Briefcase } from 'lucide-react';
import Navbar from '../components/Navbar';

const CERT_TYPES = [
   { type: 'Income', icon: Zap, title: 'Income Certificate', desc: 'Family income verification & validation', color: 'from-saffron-500 to-saffron-600', iconBg: 'bg-saffron-500/15', iconColor: 'text-saffron-500' },
   { type: 'Domicile', icon: MapPin, title: 'Domicile Certificate', desc: 'State residency proof authentication', color: 'from-gov-green to-emerald-600', iconBg: 'bg-gov-green/15', iconColor: 'text-gov-green' },
   { type: 'EWS', icon: Building, title: 'EWS Certificate', desc: 'Economically weaker section proof', color: 'from-navy-500 to-navy-600', iconBg: 'bg-navy-500/15', iconColor: 'text-navy-500' },
   { type: 'Birth', icon: Baby, title: 'Birth Certificate', desc: 'Official birth record registration', color: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-500/15', iconColor: 'text-purple-300' },
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
      const styles = {
         'Approved': 'badge-approved',
         'Rejected': 'badge-rejected',
         'In Progress': 'badge-progress',
      };
      return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || 'badge-pending'}`}>{status}</span>;
   };

   return (
      <div className="min-h-screen bg-navy-900 relative overflow-hidden flex flex-col">

         {/* Ambient background orbs */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-navy-700/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] bg-saffron-500/8 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-gov-green/8 rounded-full blur-[80px]"></div>
         </div>

         <Navbar />

         <main className="max-w-[88rem] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10 flex-grow grid grid-cols-1 xl:grid-cols-12 gap-8">

            {/* LEFT PRIMARY PANEL */}
            <div className="xl:col-span-8 space-y-8">

               {/* Hero Banner with Video */}
               <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7 }}
                  className="rounded-2xl overflow-hidden relative min-h-[260px] shadow-2xl"
               >
                  <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                     <source src="/hero_bg.mp4" type="video/mp4" />
                  </video>
                  <div className="video-overlay"></div>
                  <div className="tricolor-bar-top"></div>

                  <div className="relative z-10 p-8 md:p-10 flex items-center justify-between">
                     <div className="space-y-4 max-w-xl">
                        <div className="inline-flex items-center space-x-2 bg-navy-800/60 backdrop-blur-md border border-navy-600/30 px-4 py-1.5 rounded-full">
                           <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
                           <span className="text-xs font-semibold text-navy-300 tracking-wider uppercase">System Online</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                           Welcome back,<br />
                           <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-500 to-saffron-400">{user?.fullName || 'Citizen'}</span>
                        </h1>
                        <p className="text-navy-300 font-medium text-base max-w-md leading-relaxed">
                           Access AI-verified digital certifications securely and transparently through your Smart Governance Portal.
                        </p>

                        {user?.role === 'admin' && (
                           <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/admin')} className="mt-2 bg-red-600 text-white shadow-lg shadow-red-500/25 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-red-500/50 hover:bg-red-700 transition-colors">
                              <Shield className="w-5 h-5" /> Access Tahsildar Portal
                           </motion.button>
                        )}
                     </div>

                     {/* AI Robot GIF */}
                     <div className="hidden lg:block">
                        <motion.img
                           src="/ai_robot.gif"
                           alt="AI Assistant"
                           className="w-40 h-40 object-contain drop-shadow-2xl"
                           animate={{ y: [0, -8, 0] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                     </div>
                  </div>
               </motion.div>

               {/* SVG Process Banner */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6 }}
                  className="glass-card rounded-2xl p-6 overflow-hidden"
               >
                  <h3 className="text-sm font-bold text-saffron-500 uppercase tracking-wider mb-4">How It Works</h3>
                  <img src="/banner_steps.svg" alt="3-step process: Select, Upload & Verify, Receive" className="w-full max-w-2xl mx-auto" />
               </motion.div>

               {/* Service Cards */}
               <div>
                  <div className="flex items-center justify-between mb-5">
                     <h3 className="text-xl font-bold text-white">Digital Services</h3>
                     <span className="text-xs font-semibold text-navy-400">{CERT_TYPES.length} available</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     {CERT_TYPES.map((cert, i) => (
                        <motion.div
                           key={cert.type}
                           initial={{ opacity: 0, y: 30 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.08, duration: 0.5 }}
                           whileHover={{ y: -4, scale: 1.01 }}
                           onClick={() => navigate(`/apply?type=${cert.type}`)}
                           className="gov-card cursor-pointer rounded-2xl p-6 group relative overflow-hidden"
                        >
                           {/* Subtle gradient overlay on hover */}
                           <div className={`absolute inset-0 bg-gradient-to-br ${cert.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-2xl`}></div>

                           <div className="flex justify-between items-start mb-5">
                              <div className={`p-3 rounded-xl ${cert.iconBg}`}>
                                 <cert.icon className={`w-6 h-6 ${cert.iconColor}`} />
                              </div>
                              <motion.div whileHover={{ scale: 1.1, x: 3 }} className="w-9 h-9 rounded-full bg-navy-800/60 flex items-center justify-center border border-navy-600/30 text-navy-400 group-hover:text-saffron-500 group-hover:border-saffron-500/30 transition-all">
                                 <ChevronRight className="w-4 h-4" />
                              </motion.div>
                           </div>

                           <h4 className="text-lg font-bold text-white group-hover:text-saffron-400 transition-colors">{cert.title}</h4>
                           <p className="text-sm text-navy-400 font-medium mt-1">{cert.desc}</p>

                           <div className="mt-5 flex items-center gap-2">
                              <span className="bg-navy-800/60 border border-navy-600/30 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-navy-300 flex items-center">
                                 <Zap className="w-3 h-3 text-saffron-500 mr-1" /> AI-Verified
                              </span>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>

               {/* Tracking Table */}
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 border-b border-navy-600/20 flex justify-between items-center">
                     <h3 className="text-lg font-bold text-white">Application Tracking</h3>
                     <span className="text-xs font-semibold text-navy-400">{applications.length} record{applications.length !== 1 ? 's' : ''}</span>
                  </div>

                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] text-navy-400 font-bold uppercase tracking-wider border-b border-navy-700/30">
                              <th className="px-6 py-3">Tracking ID</th>
                              <th className="px-6 py-3">Certificate</th>
                              <th className="px-6 py-3">Status</th>
                              <th className="px-6 py-3 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody>
                           {loading ? (
                              <tr><td colSpan="4" className="text-center py-12 text-navy-400 font-medium text-sm">Loading records...</td></tr>
                           ) : applications.length === 0 ? (
                              <tr><td colSpan="4" className="text-center py-16">
                                 <Search className="w-8 h-8 text-navy-600 mx-auto mb-3" />
                                 <p className="text-sm font-medium text-navy-400">No applications yet. Start by applying for a certificate above.</p>
                              </td></tr>
                           ) : (
                              applications.map(app => (
                                 <motion.tr whileHover={{ backgroundColor: "rgba(12, 68, 124, 0.3)" }} key={app._id} className="border-b border-navy-700/20 transition-all">
                                    <td className="px-6 py-4">
                                       <div className="font-mono text-xs font-semibold text-navy-300">#{app.trackingId.substring(0, 12)}...</div>
                                       <div className="text-[10px] text-navy-500 font-medium mt-0.5">{new Date(app.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-sm text-white">
                                       <span className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-navy-400" /> {app.certificateType}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                       {getStatusBadge(app.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       {app.status === 'Approved' ? (
                                          <button onClick={() => navigate(`/certificate/${app.trackingId}`)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gov-green/10 text-gov-green border border-gov-green/20 hover:bg-gov-green/20 text-xs font-bold transition-all">
                                             <Download className="w-3.5 h-3.5" /> View
                                          </button>
                                       ) : (
                                          <span className="text-xs font-medium text-navy-500">Processing</span>
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

            {/* RIGHT SIDEBAR */}
            <div className="xl:col-span-4 space-y-6">

               {/* Smart Vault */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="gov-card rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-40 h-40 bg-navy-500 rounded-full blur-[60px] opacity-15"></div>
                  <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2 relative z-10"><Shield className="w-5 h-5 text-saffron-500" /> Smart Vault</h3>
                  <p className="text-xs text-navy-400 font-medium mb-5 relative z-10">Secure storage for your identity credentials.</p>

                  <div className="space-y-3 relative z-10">
                     <div className="bg-navy-800/50 rounded-xl p-4 border border-navy-600/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-navy-500/15 rounded-lg"><FileText className="w-4 h-4 text-navy-400" /></div>
                           <span className="font-semibold text-sm text-navy-200">Aadhaar Cache</span>
                        </div>
                        <span className="text-[10px] font-bold text-gov-green uppercase tracking-wider">Synced</span>
                     </div>
                     <div className="bg-navy-800/50 rounded-xl p-4 border border-navy-600/20 flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-navy-500/15 rounded-lg"><FileText className="w-4 h-4 text-navy-500" /></div>
                           <span className="font-semibold text-sm text-navy-400">PAN Cache</span>
                        </div>
                        <span className="text-[10px] font-bold text-navy-500 uppercase tracking-wider">Empty</span>
                     </div>
                  </div>
               </motion.div>

               {/* SVG Savings Banner */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl overflow-hidden shadow-lg">
                  <img src="/banner_savings.svg" alt="Save time and money — no queues, no middlemen" className="w-full" />
               </motion.div>

               {/* Grievance Hub */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-5">
                     <h3 className="font-bold text-white text-base flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-red-400" /> Support Hub</h3>
                     <button onClick={() => setShGrievanceModal(true)} className="bg-navy-800 border border-navy-600/30 text-xs font-bold text-navy-300 px-3 py-1.5 rounded-lg hover:border-saffron-500/30 hover:text-saffron-400 transition-all">New Case</button>
                  </div>

                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                     {grievances.length === 0 ? (
                        <div className="text-center py-6"><p className="text-xs font-medium text-navy-500">No active support tickets.</p></div>
                     ) : (
                        grievances.map(g => (
                           <div key={g._id} className="bg-navy-800/50 p-4 rounded-xl border border-navy-600/20 hover:border-navy-500/30 transition-all">
                              <div className="flex justify-between items-center mb-2">
                                 <h4 className="text-sm font-semibold text-navy-200 truncate pr-2">{g.title}</h4>
                                 <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${g.status === 'Resolved' ? 'badge-approved' : 'badge-rejected'}`}>{g.status}</span>
                              </div>
                              <p className="text-xs text-navy-400 font-medium mb-2 truncate">{g.description}</p>
                              {g.adminReply && (
                                 <div className="bg-navy-700/30 p-2 rounded-lg border-l-2 border-saffron-500 text-[10px] font-medium text-navy-300 line-clamp-2">
                                    <strong>Response:</strong> {g.adminReply}
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               </motion.div>

               {/* Broadcast */}
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl p-6">
                  <h3 className="font-bold text-navy-300 text-xs tracking-widest uppercase mb-4 border-b border-navy-600/20 pb-3">Announcements</h3>
                  <div className="space-y-3 text-sm font-medium text-navy-400">
                     <p className="flex items-start gap-2"><span className="text-saffron-500 mt-0.5">●</span> All certificates now feature 256-bit secure QR validation.</p>
                     <p className="flex items-start gap-2"><span className="text-saffron-500 mt-0.5">●</span> Scheduled portal maintenance on upcoming Sunday.</p>
                  </div>
               </motion.div>

            </div>
         </main>

         {/* Grievance Modal */}
         <AnimatePresence>
            {shGrievanceModal && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-navy-900/70 backdrop-blur-md" onClick={() => setShGrievanceModal(false)}></motion.div>

                  <motion.div
                     initial={{ opacity: 0, scale: 0.95, y: 20 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 20 }}
                     className="glass-card bg-navy-900/95 rounded-2xl max-w-lg w-full relative z-10 overflow-hidden border-navy-600/20"
                  >
                     <div className="tricolor-bar"></div>
                     <div className="p-6 border-b border-navy-600/20 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">Lodge Complaint</h3>
                        <button onClick={() => setShGrievanceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-navy-800 hover:bg-navy-700 text-navy-400 transition-all">×</button>
                     </div>

                     <form onSubmit={submitGrievance} className="p-6 space-y-5">
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Title</label>
                           <input required type="text" value={gForm.title} onChange={e => setGForm({ ...gForm, title: e.target.value })} className="gov-input" placeholder="E.g., Delay in Income verification" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Department</label>
                           <select value={gForm.department} onChange={e => setGForm({ ...gForm, department: e.target.value })} className="gov-input">
                              <option value="Revenue">Revenue Authority</option>
                              <option value="General">General Administration</option>
                              <option value="Technical">Technical Operations</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Area / Jurisdiction</label>
                           <select required value={gForm.area} onChange={e => setGForm({ ...gForm, area: e.target.value })} className="gov-input">
                              <option value="">Select Area</option>
                              <option value="North Zone">North Zone</option>
                              <option value="South Zone">South Zone</option>
                              <option value="East Zone">East Zone</option>
                              <option value="West Zone">West Zone</option>
                              <option value="Central Zone">Central Zone</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Description</label>
                           <textarea required value={gForm.description} onChange={e => setGForm({ ...gForm, description: e.target.value })} rows="3" className="gov-input resize-none" placeholder="Provide full context..."></textarea>
                        </div>

                        <div className="pt-3 flex justify-end gap-3 border-t border-navy-600/20">
                           <button type="button" onClick={() => setShGrievanceModal(false)} className="px-5 py-2.5 font-bold text-navy-400 bg-navy-800 border border-navy-600/30 rounded-xl hover:bg-navy-700 transition-all">Cancel</button>
                           <button type="submit" className="px-5 py-2.5 font-bold text-white bg-saffron-500 hover:bg-saffron-600 rounded-xl shadow-lg shadow-saffron-500/20 transition-all">Submit</button>
                        </div>
                     </form>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}