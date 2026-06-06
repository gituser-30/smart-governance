import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

export default function DashboardLayout({ children }) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif", minHeight: '100vh', background: '#060C18', color: '#fff' }}>
      {/* ── Global CSS inject for dashboard styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:#080E1A;}
        ::-webkit-scrollbar-thumb{background:#1E2D47;border-radius:4px;}

        .govai-input{
          width:100%;background:#0A1120;border:1px solid rgba(255,255,255,.07);
          border-radius:10px;padding:10px 14px;font-size:13px;color:#fff;
          font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border-color .15s;
        }
        .govai-input:focus{border-color:rgba(249,115,22,.5);}
        .govai-input option{background:#0D1626;}

        .sidebar-item{
          display:flex;align-items:center;gap:11px;padding:10px 12px;
          border-radius:10px;cursor:pointer;font-size:13px;font-weight:600;
          color:#5B6E94;background:transparent;border:none;width:100%;text-align:left;
          transition:all .15s;font-family:'Plus Jakarta Sans',sans-serif;
        }
        .sidebar-item:hover{background:rgba(255,255,255,0.04);color:#c0cfe8;}
        .sidebar-item.active{background:rgba(249,115,22,.12);color:#F97316;}

        .filter-pill{
          padding:6px 13px;border-radius:20px;font-size:11px;font-weight:700;
          cursor:pointer;border:1px solid rgba(255,255,255,0.06);
          transition:all .15s;background:transparent;color:#4B5B7A;
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .filter-pill.active{background:#F97316;color:#fff;border-color:#F97316;box-shadow:0 2px 10px rgba(249,115,22,.28);}
        .filter-pill:hover:not(.active){background:rgba(255,255,255,0.05);color:#aaa;border-color:rgba(255,255,255,.1);}

        .row-hover{transition:background .12s;}
        .row-hover:hover{background:rgba(255,255,255,0.022);}

        .btn-primary{
          background:#F97316;border:none;border-radius:10px;padding:10px 20px;
          font-size:13px;font-weight:800;color:#fff;cursor:pointer;
          display:inline-flex;align-items:center;gap:8px;
          box-shadow:0 4px 20px rgba(249,115,22,.32);
          font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s;
        }
        .btn-primary:hover{opacity:.88;}

        .btn-secondary{
          background:rgba(249,115,22,.1);border:1px solid rgba(249,115,22,.22);
          border-radius:10px;padding:9px 18px;font-size:12px;font-weight:700;
          color:#F97316;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
          transition:all .15s;
        }
        .btn-secondary:hover{background:rgba(249,115,22,.18);}

        .skeleton{
          background:linear-gradient(90deg,#111927 25%,#1a2640 50%,#111927 75%);
          background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:10px;
        }
        @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

        .pulse{animation:pulse 1.8s infinite;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
      `}</style>

      <Navbar />

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)', paddingTop: '72px' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px 28px 48px', overflowY: 'auto', background: '#080E1A' }}>
          {children}
        </main>
      </div>
      
      <Chatbot />
    </div>
  );
}
