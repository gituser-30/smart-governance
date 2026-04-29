import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Shield, UserPlus, Lock, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ fullName, email, password });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError('Google Sign-In failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1590408544955-4cc70ad08eb4?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center flex flex-col font-sans relative">
      <div className="absolute inset-0 bg-primary-900/40 backdrop-blur-md"></div>
      
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative z-10 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card rounded-[2rem] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-white/20"
        >
          {/* Decorative Left Panel */}
          <div className="md:w-5/12 bg-primary-700/80 p-10 text-white flex flex-col justify-center relative overflow-hidden backdrop-blur-xl border-r border-white/10 hidden md:flex">
             <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-saffron-500/30 blur-[80px]"></div>
             <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-primary-400/30 blur-[80px]"></div>
             
             <div className="relative z-10 space-y-8">
                <div className="bg-white/10 p-4 rounded-2xl inline-block backdrop-blur-sm border border-white/20 shadow-xl">
                  <Shield className="w-12 h-12 text-saffron-400 drop-shadow-md" />
                </div>
                <div>
                  <h2 className="text-4xl font-serif font-extrabold leading-tight">National Smart <br/> Governance</h2>
                  <p className="mt-4 text-primary-100 text-lg leading-relaxed border-l-4 border-saffron-500 pl-4 font-medium backdrop-blur-sm bg-white/5 p-3 rounded-r-lg">
                     Fast, secure, and paperless validation for all your essential citizen certificates and documents.
                  </p>
                </div>
                
                <div className="pt-10 border-t border-white/10">
                   <div className="flex items-center space-x-4 opacity-90 glass px-4 py-3 rounded-xl border-white/10 w-fit">
                      <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg" alt="Maha Logo" className="w-10 h-10 drop-shadow-sm" />
                      <div>
                         <p className="font-bold text-white text-sm">Govt. of Maharashtra</p>
                         <p className="text-[10px] text-primary-100 uppercase tracking-widest font-bold">Aaple Sarkar</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Form Right Panel */}
          <div className="md:w-7/12 p-8 sm:p-12 md:p-14 bg-white/60 backdrop-blur-2xl flex flex-col justify-center relative">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-300/40 rounded-full blur-[60px] pointer-events-none"></div>

             <div className="text-center md:text-left mb-8 relative z-10">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
                <p className="text-gray-600 text-sm mt-2 font-medium">{isLogin ? 'Sign in to access your digital locker & applications' : 'Register to apply for citizen certificates seamlessly'}</p>
             </div>

             <AnimatePresence mode="wait">
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm border border-red-500/20 mb-6 font-semibold backdrop-blur-sm flex items-center shadow-sm"
                 >
                   <span className="mr-2">⚠</span> {error}
                 </motion.div>
               )}
             </AnimatePresence>

             <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
               <AnimatePresence mode="wait">
                 {!isLogin && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="overflow-hidden"
                   >
                     <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Legal Name</label>
                     <div className="relative group">
                       <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary-600 transition-colors"><UserPlus size={18} /></span>
                       <input
                         type="text"
                         required
                         className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                         placeholder="As per Aadhaar/PAN"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                       />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Email <span className="text-red-500">*</span></label>
                 <div className="relative group">
                   <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary-600 transition-colors"><Mail size={18} /></span>
                   <input
                     type="email"
                     required
                     className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 ml-1">Password <span className="text-red-500">*</span></label>
                 <div className="relative group">
                   <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary-600 transition-colors"><Lock size={18} /></span>
                   <input
                     type="password"
                     required
                     className="w-full pl-11 pr-4 py-3 bg-white/50 border border-gray-300/60 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:bg-white outline-none transition-all shadow-sm placeholder-gray-400 font-medium"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
               </div>

               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit"
                 className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white mt-4 py-3.5 rounded-xl font-bold text-lg shadow-lg shadow-primary-600/30 transition-all border border-primary-500/50 hover:shadow-xl hover:shadow-primary-600/40"
               >
                 {isLogin ? 'Sign In Securely' : 'Create Citizen Profile'}
               </motion.button>
             </form>

             <div className="relative flex items-center justify-center my-8 z-10">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300/60"></div></div>
               <div className="relative px-4 bg-transparent text-xs font-bold text-gray-400 uppercase tracking-widest backdrop-blur-md rounded-full bg-white/40">Or Continue With</div>
             </div>

             <div className="flex justify-center z-10 relative bg-white/30 p-2 rounded-2xl border border-white/50 backdrop-blur-sm self-center sm:self-start md:self-center w-full shadow-sm max-w-[280px] mx-auto">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Authentication Failed')}
                  useOneTap
                  theme="outline"
                  size="large"
                  text={isLogin ? 'signin_with' : 'signup_with'}
                  shape="pill"
                  width="260"
               />
             </div>

             <div className="mt-8 text-center text-sm text-gray-600 font-medium relative z-10">
               {isLogin ? "New to the portal? " : "Already registered? "}
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                 className="text-primary-700 font-bold hover:text-saffron-600 transition-colors underline decoration-2 underline-offset-4"
               >
                 {isLogin ? 'Create one now' : 'Sign in instead'}
               </button>
             </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
