import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, UploadCloud, FileText, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

const documentRequirements = {
  'Income': ['Aadhar Card', 'Income Proof', 'Passport Photo'],
  'Domicile': ['Aadhar Card', 'PAN Card'],
  'EWS': ['Aadhar Card', 'Income Certificate', 'Passport Photo'],
  'Birth': ['Hospital Summary', 'Parents Aadhar Card']
};

export default function ApplyForm() {
  const [searchParams] = useSearchParams();
  const certType = searchParams.get('type') || 'Income';
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [vaultDocs, setVaultDocs] = useState([]);
  const [extractedData, setExtractedData] = useState({});
  const [loadingVault, setLoadingVault] = useState(true);
  
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const requiredDocs = documentRequirements[certType] || ['Aadhar Card', 'Address Proof'];

  const [formFields, setFormFields] = useState({
     fullName: '', fatherName: '', idNumber: '', address: '', village: '',
     taluka: '', district: '', pincode: '', dob: '', placeOfBirth: '',
     motherName: '', gender: '', residencyPeriod: '15', income: '',
     financialYear: '2024-2025', caste: '', phone: '', purpose: '', area: ''
  });

  useEffect(() => {
    fetchVault();
  }, [token]);

  const fetchVault = async () => {
    setLoadingVault(true);
    try {
      const res = await axios.get('http://localhost:5000/api/documents/me', { headers: { Authorization: `Bearer ${token}` } });
      setVaultDocs(res.data.data.documents || []);
      
      const vaultData = res.data.data.extractedData || {};
      setExtractedData(vaultData);
      
      // Auto-fill form fields with vault data
      setFormFields(prev => ({
        ...prev,
        fullName: vaultData.fullName || user?.fullName || prev.fullName,
        idNumber: vaultData.idNumber || prev.idNumber,
        address: vaultData.address || prev.address,
        dob: vaultData.dob || prev.dob,
        income: vaultData.income || prev.income,
        gender: vaultData.gender || prev.gender,
        fatherName: vaultData.fatherName || prev.fatherName,
        motherName: vaultData.motherName || prev.motherName,
        placeOfBirth: vaultData.placeOfBirth || prev.placeOfBirth,
        village: vaultData.village || prev.village,
        taluka: vaultData.taluka || prev.taluka,
        district: vaultData.district || prev.district,
        pincode: vaultData.pincode || prev.pincode
      }));
    } catch (err) {
      console.error("Failed to load vault");
    } finally {
      setLoadingVault(false);
    }
  };

  const missingDocs = requiredDocs.filter(doc => {
    const found = vaultDocs.find(v => v.docType === doc && v.status === 'verified');
    return !found;
  });

  const handleFieldChange = (e) => {
    setFormFields({ ...formFields, [e.target.name]: e.target.value });
  };

  const handleUploadMissing = async (docType, file) => {
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
         fetchVault(); // Refresh vault to update missingDocs
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error communicating with AI verification service.');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleProceedToStep2 = () => {
    if (missingDocs.length > 0) {
      setErrorMsg(`Please upload all missing documents first.`);
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (formFields.phone && !/^\d{10}$/.test(formFields.phone)) {
      setErrorMsg("Please enter a valid 10-digit phone number.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (formFields.dob && new Date(formFields.dob) > new Date()) {
      setErrorMsg("Date of Birth cannot be in the future.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    if (formFields.idNumber) {
      if (!/^\d{12}$/.test(formFields.idNumber) && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formFields.idNumber)) {
        setErrorMsg("Please enter a valid 12-digit Aadhar number or 10-character PAN.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (extractedData.idNumber && formFields.idNumber !== extractedData.idNumber) {
        setErrorMsg(`The entered ID number does not match the AI-verified document ID (${extractedData.idNumber}). Please fix the ID or change the uploaded document.`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setSubmitting(true);
    
    // Map required vault docs to application document format
    const applicationDocs = requiredDocs.map(docType => {
      const vDoc = vaultDocs.find(d => d.docType === docType);
      return {
        type: vDoc.docType,
        url: vDoc.url,
        status: vDoc.status,
        aiRemark: vDoc.aiRemark,
        extractedData: extractedData
      };
    });

    try {
       const res = await axios.post('http://localhost:5000/api/applications/final-submit', {
         certificateType: certType,
         documents: applicationDocs,
         formFields: formFields
       }, {
         headers: { Authorization: `Bearer ${token}` }
       });
       
       setTrackingId(res.data.data.trackingId);
       setSuccess(true);
       setTimeout(() => navigate('/dashboard'), 4000);
    } catch (err) {
       setErrorMsg(err.response?.data?.message || 'Error performing final submission.');
       setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
      <main className="flex-grow py-24 px-4 sm:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
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
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {step === 2 ? 'Back to Vault Check' : 'Back to Dashboard'}
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
                <span className="inline-block bg-navy-800 text-saffron-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-navy-600/30 mb-3">Step 1: Vault Check</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Document Requirements</h2>
                <p className="text-navy-300 font-medium max-w-xl mx-auto">
                   We check your <span className="font-bold text-gov-green">Digital Vault</span> first. You only need to upload documents that are missing.
                </p>
              </div>

              {loadingVault ? (
                 <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-saffron-500" /></div>
              ) : (
                <div className="space-y-6">
                  {missingDocs.length === 0 ? (
                    <div className="bg-gov-green/10 border border-gov-green/30 rounded-xl p-8 text-center">
                      <ShieldCheck className="w-16 h-16 text-gov-green mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Vault Complete!</h3>
                      <p className="text-navy-300 mb-6">All required documents for this certificate are already verified in your vault.</p>
                      <button onClick={handleProceedToStep2} className="btn-primary w-full max-w-sm mx-auto justify-center text-lg py-4">Proceed to Form</button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-navy-800/40 border border-navy-600/30 rounded-xl p-6">
                        <h4 className="text-white font-bold mb-4">Required Documents</h4>
                        <div className="space-y-4">
                          {requiredDocs.map(docType => {
                            const isMissing = missingDocs.includes(docType);
                            const isUploading = uploadingDoc === docType;
                            
                            return (
                              <div key={docType} className={`flex items-center justify-between p-4 rounded-lg border ${isMissing ? 'border-red-500/30 bg-red-500/5' : 'border-gov-green/30 bg-gov-green/5'}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${isMissing ? 'bg-red-500/10 text-red-400' : 'bg-gov-green/10 text-gov-green'}`}>
                                    {isMissing ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{docType}</p>
                                    <p className="text-xs text-navy-400">{isMissing ? 'Missing from vault' : 'Pulled from vault'}</p>
                                  </div>
                                </div>
                                {isMissing && (
                                  <div className="flex-shrink-0">
                                    {isUploading ? (
                                      <span className="flex items-center gap-2 text-xs font-bold text-saffron-500 animate-pulse"><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</span>
                                    ) : (
                                      <label className="cursor-pointer py-2 px-4 rounded-lg font-bold text-xs bg-navy-700 text-white border border-navy-600 hover:border-saffron-500 hover:text-saffron-400 transition-all">
                                        Upload
                                        <input type="file" className="sr-only" onChange={(e) => handleUploadMissing(docType, e.target.files[0])} accept=".jpg,.jpeg,.png,.pdf" />
                                      </label>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <button disabled={missingDocs.length > 0} onClick={handleProceedToStep2} className={`w-full py-4 text-base font-bold rounded-xl text-white shadow-lg transition-all ${missingDocs.length > 0 ? 'bg-navy-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-saffron-500 to-saffron-600 hover:shadow-saffron-500/25 hover:-translate-y-0.5'}`}>
                        Continue to Application Form
                      </button>
                    </>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
             <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8 border-b border-navy-600/20 pb-6 flex justify-between items-center">
                   <div>
                     <span className="inline-flex items-center gap-1 bg-gov-green/10 text-gov-green px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gov-green/20 mb-2"><CheckCircle className="w-3 h-3" /> Auto-filled</span>
                     <h2 className="text-2xl md:text-3xl font-extrabold text-white">Finalize Application</h2>
                   </div>
                   <div className="bg-navy-800/60 p-3 rounded-xl border border-navy-600/20 hidden md:block">
                     <p className="text-xs text-navy-400 font-medium">Using verified vault data</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   <form onSubmit={handleFinalSubmit} className="space-y-6 xl:col-span-2">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-navy-800/30 p-6 rounded-xl border border-navy-600/20">
                      
                      <div className="col-span-1 md:col-span-2">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-saffron-500 pl-3 mb-1">Applicant Details</h4>
                        <p className="text-xs text-navy-400 mb-4 font-medium">Verify your pre-filled details. Correct any mistakes manually.</p>
                      </div>

                      <div>
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Full Legal Name <span className="text-red-400">*</span></label>
                         <div className="relative">
                            <input required type="text" name="fullName" value={formFields.fullName} onChange={handleFieldChange} className="gov-input" />
                            {extractedData.fullName && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                         </div>
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
                         <div className="relative">
                            <input type="date" name="dob" value={formFields.dob} onChange={handleFieldChange} className="gov-input" />
                            {extractedData.dob && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                         </div>
                      </div>

                      {certType === 'Income' || certType === 'EWS' ? (
                        <div>
                           <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Annual Income (₹) <span className="text-red-400">*</span></label>
                           <div className="relative">
                              <input required type="number" name="income" value={formFields.income} onChange={handleFieldChange} className="gov-input" />
                              {extractedData.income && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                           </div>
                        </div>
                      ) : null}

                      <div className="col-span-1 md:col-span-2">
                         <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Address</label>
                         <div className="relative">
                            <textarea name="address" value={formFields.address} onChange={handleFieldChange} rows="2" className="gov-input resize-none" />
                            {extractedData.address && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                         </div>
                      </div>

                      {(certType === 'Income' || certType === 'EWS') && (
                        <>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" placeholder="Mr. Full Name" />
                                {extractedData.fatherName && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Caste/Category <span className="text-red-400">*</span></label>
                             <input required type="text" name="caste" value={formFields.caste} onChange={handleFieldChange} className="gov-input" placeholder="e.g. MARATHA / OPEN" />
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Village <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="village" value={formFields.village} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.village && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Taluka <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="taluka" value={formFields.taluka} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.taluka && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">District <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="district" value={formFields.district} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.district && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Pincode <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="pincode" value={formFields.pincode} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.pincode && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
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
                             <div className="relative">
                                <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.fatherName && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Mother's Name <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="motherName" value={formFields.motherName} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.motherName && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Gender <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <select required name="gender" value={formFields.gender} onChange={handleFieldChange} className="gov-input">
                                   <option value="">Select Gender</option>
                                   <option value="Male">Male</option>
                                   <option value="Female">Female</option>
                                   <option value="Other">Other</option>
                                </select>
                                {extractedData.gender && <span className="absolute right-8 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Place of Birth <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="placeOfBirth" value={formFields.placeOfBirth} onChange={handleFieldChange} className="gov-input" placeholder="Hospital / Address" />
                                {extractedData.placeOfBirth && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                        </>
                      )}

                      {certType === 'Domicile' && (
                        <>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Father's Name <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="fatherName" value={formFields.fatherName} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.fatherName && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Place of Birth <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="placeOfBirth" value={formFields.placeOfBirth} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.placeOfBirth && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">Village <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="village" value={formFields.village} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.village && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-navy-300 uppercase mb-1.5">District <span className="text-red-400">*</span></label>
                             <div className="relative">
                                <input required type="text" name="district" value={formFields.district} onChange={handleFieldChange} className="gov-input" />
                                {extractedData.district && <span className="absolute right-3 top-3 text-[10px] bg-gov-green/15 text-gov-green px-2 py-0.5 rounded font-bold border border-gov-green/20">Auto</span>}
                             </div>
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

                {/* Vault Documents Preview Sidebar */}
                <div className="hidden xl:block space-y-4">
                   <h4 className="text-sm font-bold text-white uppercase tracking-wider border-l-3 border-gov-green pl-3 mb-1">Vault Documents</h4>
                   <p className="text-xs text-navy-400 mb-4 font-medium">Reference these documents while filling the form.</p>
                   <div className="space-y-3 h-auto max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                      {vaultDocs.filter(d => requiredDocs.includes(d.docType)).map(doc => (
                        <div key={doc.docType} className="bg-navy-800/40 border border-navy-600/30 rounded-xl overflow-hidden">
                           <div className="bg-navy-800 px-3 py-2 border-b border-navy-600/30 flex justify-between items-center">
                              <span className="text-xs font-bold text-white">{doc.docType}</span>
                              <div className="flex gap-3 items-center">
                                {uploadingDoc === doc.docType ? (
                                  <span className="text-[10px] text-saffron-500 animate-pulse font-bold">Uploading...</span>
                                ) : (
                                  <label className="cursor-pointer text-[10px] text-navy-300 hover:text-white transition-colors">
                                    Change Doc
                                    <input type="file" className="sr-only" onChange={(e) => handleUploadMissing(doc.docType, e.target.files[0])} accept=".jpg,.jpeg,.png,.pdf" />
                                  </label>
                                )}
                                <span className="text-[10px] text-gov-green px-2 py-0.5 rounded-full bg-gov-green/10 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>
                              </div>
                           </div>
                           <div className="p-2 bg-navy-900/50">
                              {doc.url.endsWith('.pdf') ? (
                                 <div className="flex items-center justify-center p-4">
                                    <FileText className="w-8 h-8 text-navy-400" />
                                    <span className="text-xs text-navy-400 ml-2 font-medium">PDF Document</span>
                                 </div>
                              ) : (
                                 <img src={doc.url} alt={doc.docType} className="w-full rounded border border-navy-600/20 object-contain max-h-48" />
                              )}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
             </motion.div>
          )}

        </motion.div>
      </main>
    </div>
  );
}
