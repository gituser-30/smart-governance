import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Lock, Shield, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../../components/Navbar';

export default function AdminAuth() {
   const [username, setUsername] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [errorMsg, setErrorMsg] = useState('');
   
   const navigate = useNavigate();
   const { login } = useAuth();
   
   const handleAdminLogin = async (e) => {
      e.preventDefault();
      setErrorMsg('');
      setLoading(true);
      
      try {
         const res = await axios.post('http://localhost:5000/api/auth/admin-login', { username, password });
         const data = res.data;
         
         localStorage.setItem('token', data.token);
         navigate('/admin');
         window.location.reload();
      } catch (err) {
         setErrorMsg(err.response?.data?.message || 'Failed to authenticate');
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-navy-900 flex flex-col relative overflow-hidden">
         <Navbar />
         
         {/* Background elements */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-navy-700/15 rounded-full blur-[100px]"></div>
            {/* Subtle grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
               backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
               backgroundSize: '40px 40px'
            }}></div>
         </div>

         <div className="flex-grow flex items-center justify-center p-6 relative z-10">
            <motion.div 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               className="glass-card rounded-2xl p-8 md:p-12 w-full max-w-md relative overflow-hidden border-navy-600/20"
            >
               <div className="tricolor-bar-top"></div>

               {/* Decorative elements */}
               <div className="absolute -top-16 -right-16 w-40 h-40 bg-red-500/8 rounded-full blur-[40px] pointer-events-none"></div>

               <div className="text-center mb-8 relative z-10">
                  <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-400 mb-4 border border-red-500/15">
                     <Shield className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Tahsildar Login</h2>
                  <p className="text-navy-400 font-medium mt-2 text-sm">Restricted Access — Authorized Officers Only</p>
               </div>

               <AnimatePresence mode="wait">
                  {errorMsg && (
                     <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMsg}
                     </motion.div>
                  )}
               </AnimatePresence>

               <form onSubmit={handleAdminLogin} className="space-y-5 relative z-10">
                  <div>
                     <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Username</label>
                     <input 
                        type="text" 
                        required
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="gov-input"
                        placeholder="Enter admin username"
                     />
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-navy-300 uppercase tracking-wider mb-2">Password</label>
                     <div className="relative">
                        <Lock className="w-4 h-4 absolute left-4 top-3.5 text-navy-500" />
                        <input 
                           type="password" 
                           required
                           value={password} 
                           onChange={(e) => setPassword(e.target.value)} 
                           className="gov-input pl-11"
                           placeholder="••••••••"
                        />
                     </div>
                  </div>

                  <motion.button 
                     whileHover={{ scale: 1.01 }} 
                     whileTap={{ scale: 0.98 }} 
                     disabled={loading} 
                     type="submit" 
                     className={`w-full py-3.5 px-4 flex justify-between items-center bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all mt-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
