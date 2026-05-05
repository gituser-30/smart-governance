import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  ShieldCheck, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Globe,
  Monitor
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [page, filterAction]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/audit?page=${page}&limit=15${filterAction ? `&action=${filterAction}` : ''}`);
      setLogs(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Error fetching logs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/audit/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN_SUCCESS': return 'text-green-500 bg-green-50';
      case 'LOGIN_FAILURE': return 'text-red-500 bg-red-50';
      case 'REGISTER_SUCCESS': return 'text-blue-500 bg-blue-50';
      case 'GOOGLE_AUTH': return 'text-purple-500 bg-purple-50';
      case 'ADMIN_LOGIN': return 'text-saffron-600 bg-saffron-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-navy-900 tracking-tight flex items-center gap-3">
              <Activity className="text-saffron-500" /> System Audit Logs
            </h1>
            <p className="text-gray-500 mt-1">Monitor real-time user activity and system security events.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Filter action..."
                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-saffron-500/20 outline-none w-64"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Users Today</p>
              <h3 className="text-2xl font-black text-gray-900">{stats?.activeUsersToday || 0}</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Events Logged</p>
              <h3 className="text-2xl font-black text-gray-900">{logs.length > 0 ? (page === 1 ? logs.length : 'Many') : 0}</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className="p-3 bg-saffron-50 rounded-xl text-saffron-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">System Status</p>
              <h3 className="text-2xl font-black text-gray-900">Operational</h3>
            </div>
          </motion.div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User / Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{log.userId?.fullName || 'Anonymous'}</span>
                          <span className="text-xs text-gray-500">{log.email || log.userId?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getActionColor(log.action)}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-600 font-mono">
                          <Globe size={14} className="text-gray-400" />
                          {log.ipAddress || '127.0.0.1'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 truncate max-w-[200px]">
                          <Monitor size={14} className="text-gray-400" />
                          {log.userAgent ? (log.userAgent.includes('Windows') ? 'Windows' : 'Mobile/Other') : 'System'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-medium">No logs found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Page <span className="text-navy-900 font-bold">{page}</span> of <span className="text-navy-900 font-bold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
