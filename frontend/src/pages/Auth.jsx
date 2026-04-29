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
    <div className="min-h-screen bg-navy-900 flex flex-col relative overflow-hidden">
      <Navbar />

      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-navy-700/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-saffron-500/8 rounded-full blur-[100px]"></div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative z-10 pt-24">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row shadow-2xl border border-navy-600/20"
        >
          {/* Left Panel — Video + Branding */}
          <div className="md:w-5/12 relative overflow-hidden hidden md:flex flex-col justify-center min-h-[550px]">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/hero_bg.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900/90 via-navy-800/80 to-navy-900/95"></div>
            <div className="tricolor-bar-top"></div>

            <div className="relative z-10 p-10 space-y-8">
               <div className="bg-saffron-500/15 p-4 rounded-2xl inline-block border border-saffron-500/20">
                 <Shield className="w-10 h-10 text-saffron-500" />
               </div>
               <div>
                 <h2 className="text-3xl font-serif font-black text-white leading-tight">Smart<br />Governance<br />Portal</h2>
                 <p className="mt-4 text-navy-300 text-sm leading-relaxed border-l-2 border-saffron-500 pl-4">
                    Fast, secure, and paperless validation for all your essential citizen certificates and documents.
                 </p>
               </div>
               
               {/* AI Robot GIF */}
               <div className="flex justify-center">
                 <motion.img
                   src="/ai_robot.gif"
                   alt="AI Assistant"
                   className="w-24 h-24 object-contain opacity-90"
                   animate={{ y: [0, -6, 0] }}
                   transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                 />
               </div>

               <div className="pt-6 border-t border-navy-600/30">
                  <div className="flex items-center space-x-3 bg-navy-800/40 px-4 py-3 rounded-xl border border-navy-600/20 w-fit backdrop-blur-sm">
                     <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg" alt="Maha Logo" className="w-9 h-9" />
                     <div>
                        <p className="font-bold text-white text-sm">Govt. of Maharashtra</p>
                        <p className="text-[9px] text-saffron-500 uppercase tracking-[0.15em] font-semibold">Aaple Sarkar</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Panel — Form */}
          <div className="md:w-7/12 p-8 sm:p-12 md:p-14 bg-white flex flex-col justify-center relative">
             <div className="absolute -top-24 -right-24 w-48 h-48 bg-saffron-500/10 rounded-full blur-[60px] pointer-events-none"></div>

             <div className="text-center md:text-left mb-8 relative z-10">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Create an Account'}</h3>
                <p className="text-gray-500 text-sm mt-2 font-medium">{isLogin ? 'Sign in to access your digital locker & applications' : 'Register to apply for citizen certificates seamlessly'}</p>
             </div>

             <AnimatePresence mode="wait">
               {error && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                   className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200 mb-6 font-semibold flex items-center"
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
                     <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">Full Name</label>
                     <div className="relative group">
                       <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-saffron-500 transition-colors"><UserPlus size={18} /></span>
                       <input
                         type="text"
                         required
                         className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                         placeholder="As per Aadhaar/PAN"
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                       />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <div>
                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">Email <span className="text-red-500">*</span></label>
                 <div className="relative group">
                   <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-saffron-500 transition-colors"><Mail size={18} /></span>
                   <input
                     type="email"
                     required
                     className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                     placeholder="you@example.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 ml-1">Password <span className="text-red-500">*</span></label>
                 <div className="relative group">
                   <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-saffron-500 transition-colors"><Lock size={18} /></span>
                   <input
                     type="password"
                     required
                     className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
                     placeholder="••••••••"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                   />
                 </div>
               </div>

               <motion.button
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.98 }}
                 type="submit"
                 className="w-full bg-gradient-to-r from-saffron-500 to-saffron-600 text-white mt-2 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-saffron-500/25 transition-all hover:shadow-xl"
               >
                 {isLogin ? 'Sign In Securely' : 'Create Citizen Profile'}
               </motion.button>
             </form>

             <div className="relative flex items-center justify-center my-8 z-10">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
               <div className="relative px-4 text-xs font-bold text-gray-400 uppercase tracking-widest bg-white">Or Continue With</div>
             </div>

             <div className="flex justify-center z-10 relative bg-gray-50 p-2 rounded-2xl border border-gray-200 mx-auto w-full max-w-[280px]">
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

             <div className="mt-8 text-center text-sm text-gray-500 font-medium relative z-10">
               {isLogin ? "New to the portal? " : "Already registered? "}
               <button 
                 onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                 className="text-saffron-600 font-bold hover:text-saffron-500 transition-colors underline decoration-2 underline-offset-4"
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
