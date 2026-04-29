import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AdminAuth() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [errorMsg, setErrorMsg] = useState('');
   
   const navigate = useNavigate();
   const { login } = useAuth(); // We'll just call the custom logic or manually set the token
   
   const handleAdminLogin = async (e) => {
      e.preventDefault();
      setErrorMsg('');
      setLoading(true);
      
      try {
         const res = await axios.post('http://localhost:5000/api/auth/admin-login', { username, password });
         const data = res.data;
         
         // Using the auth context login logic if it accepts token and user directly, 
         // else we manually save it to localStorage.
         localStorage.setItem('token', data.token);
         navigate('/admin');
         window.location.reload(); // Quick refresh to update full react auth context state
      } catch (err) {
         setErrorMsg(err.response?.data?.message || 'Failed to authenticate');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen animated-bg flex flex-col relative overflow-hidden">
         <Navbar />
         
         <div className="flex-grow flex items-center justify-center p-6 relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-md shadow-2xl border-slate-700 relative overflow-hidden"
            >
               {/* Decorative background elements */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

               <div className="text-center mb-8 relative z-10">
                  <div className="inline-block p-4 rounded-full bg-red-100/80 text-red-700 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-red-200">
                     <Shield className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-50 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Tahsildar Login</h2>
                  <p className="text-slate-400 font-medium mt-2 text-sm">Restricted Access Portal.</p>
               </div>

               <AnimatePresence mode="wait">
                  {errorMsg && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
                     </motion.div>
                  )}
               </AnimatePresence>

               <form onSubmit={handleAdminLogin} className="space-y-6 relative z-10">
                  <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Username</label>
                     <input 
                        type="text" 
                        required
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="w-full px-5 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium"
                        placeholder="Enter admin username"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
                     <div className="relative">
                        <Lock className="w-5 h-5 absolute left-4 top-3.5 text-slate-500" />
                        <input 
                           type="password" 
                           required
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           className="w-full pl-12 pr-5 py-3.5 bg-slate-900/70 backdrop-blur-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition font-medium tracking-widest"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>

                  <motion.button 
                     whileHover={{ scale: 1.02 }} 
                     whileTap={{ scale: 0.98 }} 
                     disabled={loading} 
                     type="submit" 
                     className={`w-full py-4 px-4 flex justify-between items-center bg-gradient-to-r from-red-600 to-red-700 text-white font-black rounded-xl shadow-lg border border-red-500 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-red-600/40 hover:-translate-y-0.5'}`}
                  >
                     {loading ? <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</span> : <span>Secure Login</span>}
                     {!loading && <ArrowRight className="w-5 h-5" />}
                  </motion.button>
               </form>

            </motion.div>
         </div>
      </div>
   );
}
