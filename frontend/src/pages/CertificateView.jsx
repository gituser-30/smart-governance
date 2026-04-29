import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DownloadCloud, ArrowLeft, ShieldCheck, Stamp } from 'lucide-react';

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
           navigate('/dashboard');
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-saffron-500"></div>
    </div>
  );
  if (!appData) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Certificate Not Found</div>;

  const { formFields, certificateType, user, updatedAt } = appData;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 print:py-0 print:px-0 print:bg-white relative">
      
      {/* Action Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
         <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 hover:text-saffron-600 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
         </button>
         <button onClick={handlePrint} className="bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg transition-transform hover:-translate-y-0.5">
            <DownloadCloud className="w-5 h-5 mr-2" /> Save as PDF
         </button>
      </div>

      {/* Certificate */}
      <motion.div 
         initial={{ opacity: 0, y: 20 }} 
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-4xl bg-white relative shadow-2xl print:shadow-none"
      >
         {/* Tricolor top border */}
         <div className="h-2 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
         
         {/* Decorative border */}
         <div className="border-[10px] border-double border-saffron-200 m-1">
           <div className="p-10 md:p-16 relative">

             {/* Background Watermark */}
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <ShieldCheck className="w-[400px] h-[400px] text-gray-900" />
             </div>

             {/* Header */}
             <div className="text-center border-b-2 border-gray-200 pb-8 mb-8 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img src="https://i.pinimg.com/236x/d2/4d/0b/d24d0ba8771e4e12006055ad3aee017a.jpg" alt="Emblem" className="w-14 h-14 print:w-12 print:h-12" />
                </div>
                <h1 className="text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-[0.15em]">
                   Government of Maharashtra
                </h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">Department of Revenue</p>
                <div className="w-24 h-0.5 bg-saffron-500 mx-auto mt-4"></div>
             </div>

             {/* Certificate Title */}
             <div className="text-center relative z-10 mb-10">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 underline decoration-2 decoration-saffron-300 underline-offset-8">
                   Official {certificateType} Certificate
                </h2>
             </div>

             {/* Certificate Body */}
             <div className="bg-orange-50/60 rounded-lg p-6 border border-orange-100 mb-8 relative z-10">
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

             {/* Certificate Footer Details */}
             <div className="grid grid-cols-2 gap-8 relative z-10 mt-16 pt-8 border-t border-gray-200">
                <div>
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Issue Date</p>
                   <p className="font-mono font-bold text-gray-800">{new Date(updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Tracking ID</p>
                   <p className="font-mono font-bold text-gray-800">#{trackingId}</p>
                </div>
             </div>

             {/* Signature & QR Section */}
             <div className="flex justify-between items-end mt-16 relative z-10">
                <div className="text-center">
                   <div className="w-28 h-28 border-2 border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 bg-gray-50">
                      <div className="w-full flex-grow bg-gradient-to-br from-gray-200 to-white flex items-center justify-center rounded">
                         <span className="text-[8px] font-mono font-bold text-gray-400 text-center uppercase">Scan to<br/>Verify</span>
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">Digital QR</p>
                </div>
                <div className="text-center">
                   <div className="text-red-600 mb-2 flex justify-center">
                      <Stamp className="w-16 h-16 opacity-70 rotate-12" />
                   </div>
                   <div className="w-48 border-b-2 border-gray-800 pt-4"></div>
                   <p className="text-sm font-bold text-gray-800 mt-2 uppercase tracking-wider">Digital Signature</p>
                   <p className="text-xs font-semibold text-gray-500">Tahsildar / Issuing Authority</p>
                </div>
             </div>
           </div>
         </div>
         
         {/* Bottom tricolor */}
         <div className="h-2 bg-gradient-to-r from-saffron-500 via-white to-green-600"></div>
      </motion.div>
    </div>
  );
}
