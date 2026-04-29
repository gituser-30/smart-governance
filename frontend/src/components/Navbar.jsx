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

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 print:hidden"
    >
      {/* Tricolor bar */}
      <div className="tricolor-bar"></div>

      <div className="bg-navy-900/80 backdrop-blur-xl border-b border-navy-700/30">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-8 flex justify-between items-center">

          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden border-2 border-saffron-500/40 bg-navy-800 shadow-lg"
            >
              <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg" alt="Maha Logo" className="w-8 h-8 object-contain" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold font-serif leading-tight tracking-wide text-white">
                Government of Maharashtra
              </h1>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-saffron-500 hidden sm:block">
                Smart Governance Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center space-x-4 z-10">
            {user ? (
              <>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-medium hidden md:block text-navy-300"
                >
                  Hello, <span className="font-bold text-white">{user.fullName || user.name}</span>
                </motion.span>
                <Link to="/dashboard" className="text-sm font-semibold text-navy-400 hover:text-saffron-500 transition-colors hidden sm:block">
                  Dashboard
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-red-500/80 hover:bg-red-600 text-white py-1.5 px-5 rounded-full text-sm font-bold transition shadow-lg shadow-red-500/20"
                >
                  Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/auth" className="font-semibold text-sm text-navy-300 hover:text-saffron-500 transition-colors">
                  Citizen Login
                </Link>
                <Link to="/auth">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="py-1.5 px-5 rounded-full font-bold text-sm bg-saffron-500 text-navy-900 hover:bg-saffron-400 transition-all shadow-lg shadow-saffron-500/20"
                  >
                    Register
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
