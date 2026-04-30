import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/DashboardLayout';

export default function HelpSupport() {
  const faqs = [
    { q: 'How long does it take to process a certificate?', a: 'Most certificates are processed within 3-5 working days. You can track the live status using your Tracking ID.' },
    { q: 'What should I do if my application is rejected?', a: 'You can check the reason for rejection in the Track Status page and submit a fresh application with the corrected documents.' },
    { q: 'How do I lodge a grievance?', a: 'Navigate to "My Grievances" and click the "+ New" button or use the "Lodge Complaint" button on your main dashboard.' }
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Help & Support</h1>
        <p style={{ color: '#6B7FAA', fontSize: 14, marginBottom: 28 }}>Find answers or get in touch with our support team</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📞</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Call Us</div>
            <div style={{ fontSize: 13, color: '#6B7FAA' }}>1800-111-2222</div>
            <div style={{ fontSize: 11, color: '#4B5B7A', marginTop: 8 }}>Mon-Fri, 9AM to 6PM</div>
          </div>
          <div style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✉️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Email Us</div>
            <div style={{ fontSize: 13, color: '#6B7FAA' }}>support@govai.in</div>
            <div style={{ fontSize: 11, color: '#4B5B7A', marginTop: 8 }}>We reply within 24 hours</div>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: '#fff' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: '#0D1626', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: '#9DB4D8', lineHeight: 1.5 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
