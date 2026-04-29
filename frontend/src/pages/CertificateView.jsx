import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FileDown, ShieldCheck, DownloadCloud, ArrowLeft, Stamp } from 'lucide-react';

export default function CertificateView() {
  const { trackingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/applications/track/${trackingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.data.status !== 'Approved') {
           navigate('/dashboard'); // Can't view unapproved certificates
        }
        setAppData(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApp();
  }, [trackingId, token, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!appData) return <div className="min-h-screen flex items-center justify-center">Certificate Not Found</div>;

  const { formFields, certificateType, user, updatedAt } = appData;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 print:py-0 print:px-0 print:bg-white relative">
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
         <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 hover:text-primary-600 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
         </button>
         <button onClick={handlePrint} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-transform hover:-translate-y-0.5">
            <DownloadCloud className="w-5 h-5 mr-2" /> Save as PDF
         </button>
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }} 
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-4xl bg-white border-[12px] border-double border-saffron-200 p-10 md:p-16 relative shadow-2xl print:shadow-none print:border-[8px]"
      >
         {/* Background Watermark */}
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <ShieldCheck className="w-96 h-96 text-gray-900" />
         </div>

         <div className="text-center border-b-2 border-gray-300 pb-8 mb-8 relative z-10">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 via-gray-900 to-green-600">
               Government of State
            </h1>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">Department of Revenue</p>
         </div>

         <div className="text-center relative z-10">
            <h2 className="text-3xl font-serif font-bold text-gray-800 mb-8 underline decoration-double decoration-gray-300 underline-offset-8">
               Official {certificateType} Certificate
            </h2>
         </div>

         <div className="bg-orange-50/50 rounded-lg p-6 border border-orange-100 mb-8 relative z-10">
            <p className="text-lg leading-loose text-gray-800 font-medium text-justify">
               This is to certify that <span className="font-bold text-xl uppercase border-b border-gray-400">{formFields.fullName || user.fullName}</span>, 
               {formFields.idNumber ? <span> bearing identification number <span className="font-bold font-mono">{formFields.idNumber}</span>, </span> : ' '}
               residing at <span className="font-bold border-b border-gray-400">{formFields.address || 'N/A'}</span>, 
               has been formally verified by our secure AI routing system and thoroughly reviewed by the Tahsildar.
            </p>
            {certificateType === 'Income' && formFields.income && (
               <p className="text-lg leading-loose text-gray-800 font-medium text-justify mt-4">
                  The verified annual family income is determined to be <span className="font-bold text-xl text-green-700">₹{formFields.income}</span>.
               </p>
            )}
         </div>

         <div className="grid grid-cols-2 gap-8 relative z-10 mt-16 pt-8 border-t border-gray-100">
            <div>
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Issue Date</p>
               <p className="font-mono font-bold text-gray-800">{new Date(updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
               <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tracking ID</p>
               <p className="font-mono font-bold text-gray-800">#{trackingId}</p>
            </div>
         </div>

         <div className="flex justify-between items-end mt-16 relative z-10">
            <div className="text-center">
               <div className="w-32 h-32 border-4 border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 bg-gray-50">
                   <div className="w-full flex-grow bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-300 via-gray-100 to-white flex items-center justify-center shadow-inner">
                      <span className="text-[8px] font-mono font-bold text-gray-400 text-center uppercase">Scan to<br/>Verify</span>
                   </div>
               </div>
               <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Digital Auth QR</p>
            </div>
            <div className="text-center">
               <div className="text-red-600 mb-2 flex justify-center">
                  <Stamp className="w-20 h-20 opacity-80 rotate-12" />
               </div>
               <div className="w-48 border-b-2 border-gray-900 pt-4"></div>
               <p className="text-sm font-bold text-gray-900 mt-2 uppercase tracking-widest">Digital Signature</p>
               <p className="text-xs font-bold text-gray-500">Tahsildar / Issuing Authority</p>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
