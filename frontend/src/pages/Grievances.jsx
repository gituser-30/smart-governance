import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

export default function Grievances() {
  const { token } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/grievances/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrievances(res.data.data);
      } catch (err) {
        console.error('Failed to load grievances', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>My Grievances</h1>
            <p style={{ color: '#6B7FAA', fontSize: 14 }}>Track your filed complaints and issues</p>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 140, borderRadius: 16 }} />)
          ) : grievances.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '60px 22px', textAlign: 'center', background: '#0D1626', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 44, marginBottom: 15 }}>💬</div>
               <div style={{ fontSize: 16, fontWeight: 700, color: '#6B7FAA' }}>No grievances filed</div>
            </div>
          ) : (
            grievances.map((g, idx) => (
              <motion.div
                key={g._id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                style={{
                  background: '#0D1626', padding: 22, borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.06)', borderTop: '4px solid #F97316'
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{g.title}</div>
                <div style={{ fontSize: 12, color: '#6B7FAA', marginBottom: 12 }}>{g.department} • {g.area}</div>
                <p style={{ fontSize: 13, color: '#9DB4D8', lineHeight: 1.5, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {g.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
                  <span style={{ fontSize: 11, color: '#4B5B7A', fontWeight: 600 }}>{new Date(g.createdAt).toLocaleDateString()}</span>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                    background: 'rgba(249,115,22,0.12)', color: '#F97316'
                  }}>
                    {g.status || 'Pending'}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
