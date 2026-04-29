import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const isDarkBg = location.pathname === '/auth';

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 print:hidden ${isDarkBg ? 'bg-[rgba(4,8,26,0.92)] text-white' : 'glass border-b border-slate-700/50'
        }`}
    >
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-8 flex justify-between items-center relative">
        {/* Subtle top border gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-saffron-500 via-white to-green-500 opacity-80"></div>

        <Link to="/" className="flex items-center space-x-3 group relative z-10">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg text-sm overflow-hidden border-2 ${isDarkBg ? 'border-slate-700/30 bg-slate-900/10 backdrop-blur-md' : 'border-slate-700 bg-slate-900'}`}
          >
            <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg" alt="Maha Logo" className="w-8 h-8 object-contain" />
          </motion.div>
          <div>
            <h1 className={`text-lg font-bold font-serif leading-tight tracking-wide ${isDarkBg ? 'text-white' : 'text-blue-400'}`}>
              Government of Maharashtra
            </h1>
            <p className={`text-xs font-medium tracking-wider uppercase ${isDarkBg ? 'text-primary-100/80' : 'text-primary-500/80'} hidden sm:block`}>
              Smart Governance Portal
            </p>
          </div>
        </Link>

        <div className="flex items-center space-x-5 z-10">
          {user ? (
            <>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm font-medium hidden md:block ${isDarkBg ? 'text-white/90' : 'text-slate-400'}`}
              >
                Hello, <span className="font-bold">{user.fullName || user.name}</span>
              </motion.span>
              <Link to="/dashboard" className={`text-sm font-medium transition hover:scale-105 hidden sm:block ${isDarkBg ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-blue-500'}`}>
                Dashboard
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white py-1.5 px-5 rounded-full text-sm font-bold transition shadow-lg shadow-red-500/30 border border-red-400/50"
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <Link to="/auth" className={`font-semibold transition text-sm hover:scale-105 ${isDarkBg ? 'text-white hover:text-saffron-400' : 'text-slate-400 hover:text-blue-500'}`}>
                Citizen Login
              </Link>
              <Link to="/auth" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-saffron-500 to-primary-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative py-1.5 px-5 rounded-full font-bold transition text-sm ${isDarkBg ? 'bg-slate-900/10 text-white border border-slate-700/20' : 'bg-slate-900 text-blue-400'}`}
                >
                  Register
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
