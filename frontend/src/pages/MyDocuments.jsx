import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, AlertTriangle, FileText, Loader2, User as UserIcon } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const requiredVaultDocs = ['Aadhar Card', 'Income Proof', 'Passport Photo', 'Birth Certificate', 'Hospital Summary'];

export default function MyDocuments() {
  const { token, user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyDocuments();
  }, [token]);

  const fetchMyDocuments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/documents/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data.data.documents || []);
      setExtractedData(res.data.data.extractedData || {});
    } catch (err) {
      console.error("Failed to fetch documents", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (docType, file) => {
    if (!file) return;
    setUploadingDoc(docType);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('docType', docType);

    try {
      const res = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.data.success) {
         setErrorMsg(`Upload failed for ${docType}: ${res.data.message}`);
      } else {
         fetchMyDocuments(); // Refresh vault
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error communicating with AI verification service.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocStatus = (docType) => {
    return documents.find(d => d.docType === docType);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-8">
        <div className="mb-10 border-b border-navy-600/30 pb-6 flex flex-wrap gap-6 justify-between items-end">
           <div>
             <h1 className="text-3xl font-black text-white mb-2">My Digital Vault</h1>
             <p className="text-navy-300 text-sm">Upload once. Apply instantly. Your AI-verified secure document storage.</p>
           </div>
           
           {/* Extracted Identity Card */}
           <div className="bg-navy-800/50 border border-gov-green/20 rounded-xl p-4 flex gap-4 min-w-[280px]">
             <div className="w-12 h-12 rounded-full bg-gov-green/10 text-gov-green flex items-center justify-center flex-shrink-0">
               <UserIcon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] text-gov-green font-bold uppercase tracking-widest mb-1">AI Verified Identity</p>
                <p className="text-sm font-bold text-white">{extractedData.fullName || user?.fullName || 'Pending Name'}</p>
                {extractedData.idNumber && <p className="text-xs text-navy-300 font-mono mt-0.5">ID: {extractedData.idNumber}</p>}
                {extractedData.dob && <p className="text-xs text-navy-300 font-mono mt-0.5">DOB: {extractedData.dob}</p>}
             </div>
           </div>
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
               <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
               <div><strong className="block font-bold text-sm">Upload Rejected by AI</strong><span className="text-xs">{errorMsg}</span></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...new Set([...requiredVaultDocs, ...documents.map(d => d.docType)])].map(docType => {
            const savedDoc = getDocStatus(docType);
            const isUploading = uploadingDoc === docType;
            
            return (
              <div key={docType} className={`border ${savedDoc?.status === 'verified' ? 'border-gov-green/30 bg-gov-green/5' : savedDoc?.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 'border-navy-600/30 bg-navy-800/40'} rounded-2xl p-6 transition-all hover:border-navy-500/50 flex flex-col h-full`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-xl ${savedDoc?.status === 'verified' ? 'bg-gov-green/15 text-gov-green' : 'bg-navy-700/50 text-navy-400'}`}>
                    <FileText className="w-6 h-6" />
                  </div>
                  {savedDoc?.status === 'verified' && <span className="inline-flex items-center gap-1 bg-gov-green/15 text-gov-green px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gov-green/20"><CheckCircle className="w-3 h-3" /> Verified</span>}
                  {savedDoc?.status === 'rejected' && <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20"><AlertTriangle className="w-3 h-3" /> Rejected</span>}
                </div>

                <div className="flex-grow">
                  <h3 className="font-bold text-white text-base mb-1">{docType}</h3>
                  <p className="text-xs text-navy-400 font-medium line-clamp-2">
                    {savedDoc?.aiRemark ? savedDoc.aiRemark : `Upload official ${docType} for AI verification`}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-navy-600/20">
                  {isUploading ? (
                     <div className="flex items-center justify-center gap-2 py-2 text-saffron-500 text-sm font-bold animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Document...
                     </div>
                  ) : savedDoc?.status === 'verified' ? (
                     <div className="flex justify-between items-center">
                       <a href={savedDoc.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-gov-green hover:underline flex items-center gap-1">View Saved File</a>
                       <label className="cursor-pointer text-xs font-bold text-navy-400 hover:text-white transition-colors">
                         Update
                         <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleUpload(docType, e.target.files[0])} />
                       </label>
                     </div>
                  ) : (
                     <label className="cursor-pointer w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-navy-700 text-white border border-navy-600/30 hover:border-saffron-500/30 hover:text-saffron-400 hover:bg-navy-800">
                        <UploadCloud className="w-4 h-4" /> Upload Document
                        <input type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleUpload(docType, e.target.files[0])} />
                     </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
