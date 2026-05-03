import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, UploadCloud, FileText, Loader2, AlertTriangle } from 'lucide-react';
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
     fatherName: '',
     idNumber: '',
     address: '',
     village: '',
     taluka: '',
     district: '',
     pincode: '',
     dob: '',
     placeOfBirth: '',
     motherName: '',
     gender: '',
     residencyPeriod: '15',
     income: '',
     financialYear: '2024-2025',
     caste: '',
     phone: '',
     purpose: '',
     area: ''
  });

  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const documentRequirements = {
    'Income': ['Aadhar Card', 'Income Proof', 'Passport Photo'],
    'Domicile': ['Aadhar Card', 'Birth Certificate'],
    'EWS': ['Aadhar Card', 'Income Certificate', 'Passport Photo'],
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
         setErrorMsg(`AI Validation Failed for ${resData.rejectedDocument}: ${resData.reason}`);
      } else {
         const extracted = resData.data.extractedFields || {};
         setExtractedData(extracted);
         setUploadedUrls(resData.data.documents);
         
         setFormFields((prev) => ({
           ...prev,
           fullName: extracted.fullName || prev.fullName,
           idNumber: extracted.idNumber || prev.idNumber,
           address: extracted.address || prev.address,
           dob: extracted.dob || prev.dob,
           income: extracted.income || prev.income,
           gender: extracted.gender || prev.gender,
           fatherName: extracted.fatherName || prev.fatherName,
           motherName: extracted.motherName || prev.motherName,
           placeOfBirth: extracted.placeOfBirth || prev.placeOfBirth,
           village: extracted.village || prev.village,
           taluka: extracted.taluka || prev.taluka,
           district: extracted.district || prev.district,
           pincode: extracted.pincode || prev.pincode
         }));
         
         setStep(2);
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
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-gov-green/10 rounded-full blur-[100px]"></div>
        </div>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card rounded-2xl p-12 max-w-lg text-center relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="inline-block p-5 rounded-full bg-gov-green/15 text-gov-green mb-6 border border-gov-green/20">
            <CheckCircle className="w-14 h-14" />
          </motion.div>
          <h2 className="text-3xl font-black text-white mb-2">Application Forwarded!</h2>
          <p className="text-navy-300 font-medium mb-8">Your verified application has been sent to the Tahsildar Officer for final review.</p>
          <div className="bg-navy-800/60 rounded-xl p-4 border border-navy-600/20 mb-6">
             <p className="text-[10px] text-navy-400 uppercase tracking-widest font-bold mb-1">Your Tracking ID</p>
             <p className="text-xl font-mono font-bold text-saffron-500 tracking-wider">#{trackingId}</p>
          </div>
          <p className="text-sm font-semibold text-navy-400 animate-pulse">Redirecting to Dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-900 relative overflow-hidden">
      <Navbar />
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-navy-700/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-saffron-500/5 blur-[100px] pointer-events-none"></div>

      <main className="flex-grow py-24 px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-${step === 1 ? '3xl' : '4xl'} mx-auto glass-card rounded-2xl p-8 md:p-10 transition-all duration-500 border-navy-600/20`}
        >
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= 1 ? 'bg-saffron-500 border-saffron-500 text-navy-900' : 'border-navy-600 text-navy-500'}`}>1</div>
              <div className={`w-20 h-0.5 rounded transition-all ${step >= 2 ? 'bg-saffron-500' : 'bg-navy-700'}`}></div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= 2 ? 'bg-saffron-500 border-saffron-500 text-navy-900' : 'border-navy-600 text-navy-500'}`}>2</div>
            </div>
          </div>

          <button onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')} className="group text-navy-400 hover:text-saffron-500 text-sm font-semibold mb-8 flex items-center gap-2 transition-colors bg-navy-800/50 px-4 py-2 rounded-full border border-navy-600/20 w-fit">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {step === 2 ? 'Back to Uploads' : 'Back to Dashboard'}
          </button>
          
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                 <div><strong className="block font-bold">Action Required</strong><span className="text-sm">{errorMsg}</span></div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="mb-10 text-center">
                <span className="inline-block bg-navy-800 text-saffron-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-navy-600/30 mb-3">Step 1: AI Verification</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Upload Documents</h2>
                <p className="text-navy-300 font-medium max-w-xl mx-auto">
                   Upload clear images of your documents. Our <span className="font-bold text-saffron-500">AI will analyze validity & extract data</span> instantly.
                </p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-5">
                <div className="space-y-4">
                  {requiredDocs.map((docType) => (
                    <div key={docType} className={`border ${files[docType] ? 'border-gov-green/30 bg-gov-green/5' : 'border-navy-600/30 bg-navy-800/40'} rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center backdrop-blur-sm transition-all group hover:border-navy-500/40`}>
                      <div className="mb-4 sm:mb-0 flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${files[docType] ? 'bg-gov-green/15 text-gov-green' : 'bg-navy-700/50 text-navy-400 group-hover:text-saffron-500 transition-colors'}`}>
                           <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{docType} <span className="text-red-400">*</span></h3>
                          <p className="text-xs text-navy-400 font-medium">JPG, JPEG, PNG (No PDF)</p>
                        </div>
                      </div>

                      <div className="flex-shrink-0 w-full sm:w-auto">
                        <label className={`cursor-pointer w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${files[docType] ? 'bg-gov-green text-white border-gov-green hover:bg-gov-green/90' : 'bg-navy-800 text-navy-300 border-navy-600/30 hover:border-saffron-500/30 hover:text-saffron-400'}`}>
                          {files[docType] ? <CheckCircle className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                          {files[docType] ? 'Change' : 'Upload'}
                          <input type="file" className="sr-only" onChange={(e) => handleFileChange(docType, e.target.files[0])} accept=".jpg,.jpeg,.png" />
                        </label>
                        {files[docType] && <span className="block mt-2 text-[11px] text-gov-green font-semibold truncate max-w-[200px]">✓ {files[docType].name}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Robot during submission */}
                {submitting && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="flex flex-col items-center py-6"
                  >
                    <motion.img
                      src="/ai_robot.gif"
                      alt="AI Processing"
                      className="w-28 h-28 object-contain mb-3"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <p className="text-saffron-500 font-bold text-sm animate-pulse">AI is analyzing your documents...</p>
                  </motion.div>
                )}

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className={`mt-6 w-full flex justify-center py-4 px-4 text-base font-bold rounded-xl text-white shadow-lg transition-all ${submitting ? 'bg-navy-700 cursor-not-allowed' : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-saffron-500/25 hover:-translate-y-0.5'}`}>
                  {submitting ? (<span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>) : 'Run AI Document Analysis'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8 border-b border-navy-600/20 pb-6 flex justify-between items-center">
                   <div>
                     <span className="inline-flex items-center gap-1 bg-gov-green/10 text-gov-green px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gov-green/20 mb-2"><CheckCircle className="w-3 h-3" /> AI Verified</span>
                     <h2 className="text-2xl md:text-3xl font-extrabold text-white">Finalize Application</h2>
                   </div>
                   <div className="bg-navy-800/60 p-3 rounded-xl border border-navy-600/20 hidden md:block">
                     <p className="text-xs text-navy-400 font-medium">Autofilled from</p>
                     <p className="text-sm font-bold text-saffron-500">{uploadedUrls.length} verified documents</p>
                   </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-800/30 p-6 rounded-xl border border-navy-600/20">
                      
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-saffron-500 pl-3 mb-1">Extracted Information</h4>
                        <p className="text-xs text-navy-400 mb-4 font-medium">Please verify the AI-extracted details. Correct any mistakes manually.</p>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Full Legal Name <span className="text-red-400">*</span></label>
                         <input required type="text" name="fullName" value={formFields.fullName} onChange={handleFieldChange} className="gov-input" />
                      </div>
                      
                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">ID Number (Aadhaar/PAN)</label>
                         <div className="relative">
                            <input type="text" name="idNumber" value={formFields.idNumber} onChange={handleFieldChange} className="gov-input" />
                            {extractedData.idNumber && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                         </div>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Date of Birth</label>
                         <input type="date" name="dob" value={formFields.dob} onChange={handleFieldChange} className="gov-input" />
                      </div>

                      {certType === 'Income' || certType === 'EWS' ? (
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Annual Income (₹) <span className="text-red-400">*</span></label>
                           <input required type="number" name="income" value={formFields.income} onChange={handleFieldChange} className="gov-input" />
                        </div>
                      ) : null}

                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Address</label>
                         <textarea name="address" value={formFields.address} onChange={handleFieldChange} rows="2" className="gov-input resize-none" />
                      </div>

                      {(certType === 'Income' || certType === 'EWS') && (
                        <>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                             <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" placeholder="Mr. Full Name" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Caste/Category <span className="text-red-400">*</span></label>
                             <input required type="text" name="caste" value={formFields.caste} onChange={handleFieldChange} className="gov-input" placeholder="e.g. MARATHA / OPEN" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Village <span className="text-red-400">*</span></label>
                             <input required type="text" name="village" value={formFields.village} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Taluka <span className="text-red-400">*</span></label>
                             <input required type="text" name="taluka" value={formFields.taluka} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">District <span className="text-red-400">*</span></label>
                             <input required type="text" name="district" value={formFields.district} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Pincode <span className="text-red-400">*</span></label>
                             <input required type="text" name="pincode" value={formFields.pincode} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Financial Year <span className="text-red-400">*</span></label>
                             <select required name="financialYear" value={formFields.financialYear} onChange={handleFieldChange} className="gov-input">
                                <option value="2023-2024">2023-2024</option>
                                <option value="2024-2025">2024-2025</option>
                                <option value="2025-2026">2025-2026</option>
                             </select>
                          </div>
                        </>
                      )}
                      
                      {certType === 'Birth' && (
                        <>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                             <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Mother's Name <span className="text-red-400">*</span></label>
                             <input required type="text" name="motherName" value={formFields.motherName} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Gender <span className="text-red-400">*</span></label>
                             <select required name="gender" value={formFields.gender} onChange={handleFieldChange} className="gov-input">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Place of Birth <span className="text-red-400">*</span></label>
                             <input required type="text" name="placeOfBirth" value={formFields.placeOfBirth} onChange={handleFieldChange} className="gov-input" placeholder="Hospital / Address" />
                          </div>
                        </>
                      )}

                      {certType === 'Domicile' && (
                        <>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                             <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Place of Birth <span className="text-red-400">*</span></label>
                             <input required type="text" name="placeOfBirth" value={formFields.placeOfBirth} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Village <span className="text-red-400">*</span></label>
                             <input required type="text" name="village" value={formFields.village} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">District <span className="text-red-400">*</span></label>
                             <input required type="text" name="district" value={formFields.district} onChange={handleFieldChange} className="gov-input" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Residency Period (Years) <span className="text-red-400">*</span></label>
                             <input required type="number" name="residencyPeriod" value={formFields.residencyPeriod} onChange={handleFieldChange} className="gov-input" />
                          </div>
                        </>
                      )}

                      <div className="col-span-1 md:col-span-2 mt-3 pt-4 border-t border-navy-600/20">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-gov-green pl-3 mb-1">Additional Information</h4>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                         <input required type="tel" name="phone" value={formFields.phone} onChange={handleFieldChange} className="gov-input" />
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Purpose <span className="text-red-400">*</span></label>
                         <select required name="purpose" value={formFields.purpose} onChange={handleFieldChange} className="gov-input">
                            <option value="">Select Purpose</option>
                            <option value="Education">Education/Admission</option>
                            <option value="Employment">Employment</option>
                            <option value="Government Scheme">Government Scheme</option>
                            <option value="Others">Others</option>
                         </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Area/Jurisdiction <span className="text-red-400">*</span></label>
                        <select required name="area" value={formFields.area} onChange={handleFieldChange} className="gov-input">
                           <option value="">Select Area</option>
                           <option value="Ambole Pali">Ambole Pali</option>
                           <option value="Panvel">Panvel</option>
                           <option value="North Zone">North Zone</option>
                           <option value="South Zone">South Zone</option>
                           <option value="East Zone">East Zone</option>
                           <option value="West Zone">West Zone</option>
                           <option value="Central Zone">Central Zone</option>
                        </select>
                     </div>
                   </div>

                   <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={submitting} type="submit" className={`mt-4 w-full flex justify-center py-4 px-4 text-base font-bold rounded-xl text-white shadow-lg transition-all ${submitting ? 'bg-navy-700 cursor-not-allowed' : 'bg-gradient-to-r from-gov-green to-emerald-600 hover:shadow-gov-green/25 hover:-translate-y-0.5'}`}>
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
