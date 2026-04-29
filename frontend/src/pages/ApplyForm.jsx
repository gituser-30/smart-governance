import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, UploadCloud, FileText, Loader2, AlertTriangle, Edit3 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ApplyForm() {
  const [searchParams] = useSearchParams();
  const certType = searchParams.get('type') || 'Income';
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Wizard state
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Phase 2 state
  const [extractedData, setExtractedData] = useState({});
  const [uploadedUrls, setUploadedUrls] = useState([]);
  
  // Final Form State
  const [formFields, setFormFields] = useState({
     fullName: user?.fullName || '',
     idNumber: '',
     address: '',
     dob: '',
     income: '',
     phone: '',
     purpose: '',
     area: ''
  });

  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const documentRequirements = {
    'Income': ['Aadhar Card', 'Income Proof'],
    'Domicile': ['Aadhar Card', 'Birth Certificate'],
    'EWS': ['Aadhar Card', 'Income Certificate', 'Caste Certificate'],
    'Birth': ['Hospital Summary', 'Parents Aadhar Card']
  };

  const requiredDocs = documentRequirements[certType] || ['Aadhar Card', 'Address Proof'];

  const handleFileChange = (docType, file) => {
    setFiles((prev) => ({ ...prev, [docType]: file }));
    setErrorMsg('');
  };

  const handleFieldChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  // --- Phase 1: AI Analysis ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    for (const doc of requiredDocs) {
      if (!files[doc]) {
        setErrorMsg(`Please upload required document: ${doc}`);
        return;
      }
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('certificateType', certType);

    Object.keys(files).forEach((docType) => {
      formData.append('documents', files[docType]);
      formData.append('documentTypes', docType);
    });

    try {
      const res = await axios.post('http://localhost:5000/api/applications/analyze', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const resData = res.data;
      
      if (!resData.success) {
         // Display specific AI rejection reason
         setErrorMsg(`AI Validation Failed for ${resData.rejectedDocument}: ${resData.reason}`);
      } else {
         // Success! AI extracted data
         const extracted = resData.data.extractedFields || {};
         setExtractedData(extracted);
         setUploadedUrls(resData.data.documents);
         
         // Auto-fill available fields from OCR
         setFormFields({
           ...formFields,
           fullName: extracted.fullName || formFields.fullName,
           idNumber: extracted.idNumber || '',
           address: extracted.address || '',
           dob: extracted.dob || '',
           income: extracted.income || ''
         });
         
         setStep(2); // Proceed to Final Form
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error communicating with AI Service. Is backend running?');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Phase 2: Final Submission ---
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
       const res = await axios.post('http://localhost:5000/api/applications/final-submit', {
         certificateType: certType,
         documents: uploadedUrls,
         formFields: formFields
       }, {
         headers: { 'Authorization': `Bearer ${token}` }
       });
       
       setTrackingId(res.data.data.trackingId);
       setSuccess(true);
       setTimeout(() => navigate('/dashboard'), 4000);
    } catch (err) {
       setErrorMsg('Error performing final submission.');
       setSubmitting(false);
    }
  };


  if (success) {
    return (
      <div className="min-h-screen animated-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-green-400/20 blur-[80px]"></div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-3d rounded-3xl p-12 max-w-lg text-center shadow-2xl border-slate-700 relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <CheckCircle className="w-16 h-16" />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-50 mb-2">Application Forwarded!</h2>
          <p className="text-slate-400 font-medium mb-6">Your verified application has been sent to the Tahsildar Officer for final review.</p>
          <div className="bg-slate-900/50 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-inner mb-6">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Your Tracking ID</p>
             <p className="text-xl font-mono font-bold text-blue-400 tracking-wider">#{trackingId}</p>
          </div>
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Redirecting to Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col animated-bg relative overflow-hidden">
      <Navbar />
      <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full bg-primary-400/20 blur-[100px] pointer-events-none"></div>

      <main className="flex-grow py-24 px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-${step === 1 ? '3xl' : '4xl'} mx-auto glass-3d rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-slate-700 p-8 md:p-10 transition-all duration-500`}
        >
          <button onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')} className="group text-slate-400 hover:text-blue-500 text-sm font-bold mb-8 flex items-center gap-2 transition-colors bg-slate-900/50 px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-transparent hover:border-primary-200 w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {step === 2 ? 'Back to Uploads' : 'Back to Dashboard'}
          </button>
          
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                 <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <div><strong className="block font-bold">Action Required</strong><span className="text-sm">{errorMsg}</span></div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="mb-10 text-center">
                <span className="inline-block bg-primary-100 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-3">Step 1: AI Verification</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50 mb-3 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">Upload Documents</h2>
                <p className="text-slate-400 font-medium bg-slate-900/40 p-3 rounded-lg border border-slate-700 max-w-xl mx-auto">
                   Securely upload your clear documents below. Our <span className="font-bold text-blue-500">AI algorithm will analyze validity & extract data</span> instantly.
                </p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="space-y-4 rounded-xl">
                  {requiredDocs.map((docType, index) => (
                    <div key={docType} className={`border ${files[docType] ? 'border-primary-300 bg-primary-50/50' : 'border-slate-700/60 bg-slate-900/60'} rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all group`}>
                      <div className="mb-4 sm:mb-0 flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${files[docType] ? 'bg-primary-100 text-blue-500' : 'bg-slate-800/70 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors'}`}>
                           <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-50 text-sm md:text-base">{docType} <span className="text-red-500">*</span></h3>
                          <p className="text-xs text-slate-400 font-medium">Valid JPG, JPEG, PNG (No PDF)</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <label className={`cursor-pointer w-full sm:w-auto py-2.5 px-6 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 border ${files[docType] ? 'bg-primary-600 text-white shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:bg-primary-700' : 'bg-slate-900 text-blue-400 hover:bg-primary-50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-slate-700'}`}>
                          {files[docType] ? <CheckCircle className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                          {files[docType] ? 'Change File' : 'Upload Image'}
                          <input type="file" className="sr-only" onChange={(e) => handleFileChange(docType, e.target.files[0])} accept=".jpg,.jpeg,.png" />
                        </label>
                        {files[docType] && <span className="block mt-2 text-[11px] text-blue-400 font-bold bg-primary-100/50 px-2 py-1 rounded w-fit truncate max-w-[200px]">✓ {files[docType].name}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className={`mt-10 w-full flex justify-center py-4 px-4 border border-transparent text-base font-extrabold rounded-xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all ${submitting ? 'bg-primary-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:shadow-primary-600/40 hover:-translate-y-0.5'}`}>
                  {submitting ? (<span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> AI Processing Documents...</span>) : 'Run AI Document Analysis'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8 border-b border-slate-700/50 pb-6 flex justify-between items-center">
                   <div>
                     <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-2"><CheckCircle className="inline w-3 h-3 mr-1" /> OCR Success</span>
                     <h2 className="text-2xl md:text-3xl font-extrabold text-slate-50">Finalize Application</h2>
                   </div>
                   <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hidden md:block">
                     <p className="text-xs text-slate-400 font-medium">Autofilled fields based on</p>
                     <p className="text-sm font-bold text-blue-400">{uploadedUrls.length} verified documents</p>
                   </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-6 rounded-xl border border-slate-700">
                      
                      <div className="col-span-1 md:col-span-2"><h4 className="text-sm font-extrabold text-slate-50 uppercase tracking-widest border-l-4 border-primary-500 pl-2 mb-2">Extracted Information</h4><p className="text-xs text-slate-400 mb-4 font-medium">Please verify these details extracted by AI. Correct any mistakes manually.</p></div>

                      <div>
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Legal Name <span className="text-red-500">*</span></label>
                         <input required type="text" name="fullName" value={formFields.fullName} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition font-medium" />
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">ID Number (Aadhar/PAN)</label>
                         <div className="relative">
                            <input type="text" name="idNumber" value={formFields.idNumber} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900/50 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium text-primary-900" />
                            {extractedData.idNumber && <span className="absolute right-3 top-2.5 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Auto</span>}
                         </div>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Date of Birth</label>
                         <input type="date" name="dob" value={formFields.dob} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium text-slate-300" />
                      </div>

                      {certType === 'Income' || certType === 'EWS' ? (
                        <div>
                           <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Annual Income (₹) <span className="text-red-500">*</span></label>
                           <input required type="number" name="income" value={formFields.income} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium" />
                        </div>
                      ) : null}

                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Address</label>
                         <textarea name="address" value={formFields.address} onChange={handleFieldChange} rows="2" className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium" />
                      </div>

                      <div className="col-span-1 md:col-span-2 mt-4 pt-4 border-t border-slate-700/50"><h4 className="text-sm font-extrabold text-slate-50 uppercase tracking-widest border-l-4 border-saffron-500 pl-2 mb-2">Additional Information</h4></div>

                      <div>
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Mobile Number <span className="text-red-500">*</span></label>
                         <input required type="tel" name="phone" value={formFields.phone} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Purpose of Certificate <span className="text-red-500">*</span></label>
                         <select required name="purpose" value={formFields.purpose} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium">
                            <option value="">Select Purpose</option>
                            <option value="Education">Education/Admission</option>
                            <option value="Employment">Employment</option>
                            <option value="Government Scheme">Government Scheme</option>
                            <option value="Others">Others</option>
                         </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Select Area/Jurisdiction <span className="text-red-500">*</span></label>
                        <select required name="area" value={formFields.area} onChange={handleFieldChange} className="w-full px-4 py-2.5 bg-slate-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition font-medium text-slate-50">
                           <option value="">Select Area</option>
                           <option value="North Zone">North Zone</option>
                           <option value="South Zone">South Zone</option>
                           <option value="East Zone">East Zone</option>
                           <option value="West Zone">West Zone</option>
                           <option value="Central Zone">Central Zone</option>
                        </select>
                     </div>
                   </div>

                   <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className={`mt-8 w-full flex justify-center py-4 px-4 border border-transparent text-base font-extrabold rounded-xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all ${submitting ? 'bg-primary-400 cursor-not-allowed' : 'bg-gradient-to-r from-saffron-500 to-orange-600 hover:shadow-saffron-500/40 hover:-translate-y-0.5'}`}>
                      {submitting ? (<span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Forwarding to Admin...</span>) : 'Final Submit to Officer'}
                   </motion.button>
                </form>
             </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
