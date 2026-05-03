import React from 'react';
import { Check } from 'lucide-react';

const DomicileCertificateTemplate = ({ data, trackingId }) => {
  const { formFields, updatedAt } = data;
  const issueDate = new Date(updatedAt).toLocaleDateString('en-GB');

  return (
    <div className="bg-white p-8 font-serif text-black border-[1.5pt] border-black max-w-[800px] mx-auto my-4 relative shadow-sm print:shadow-none print:my-0 print:border-black print:text-black"
      style={{ printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact', color: 'black' }}>

      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          img { max-width: 100% !important; display: block !important; }
          .force-black { color: black !important; border-color: black !important; }
          .print-border { border: 1pt solid black !important; }
        }
      `}</style>

      {/* Header Section */}
      <div className="flex justify-between items-start mb-4 border-b-[1.5pt] border-black pb-4">
        <div className="w-20">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmeq20W3b8502gFTTwqvK7iHhUAwaQeSEG6w&s" alt="Govt Emblem" className="w-16 h-16 object-contain block" crossOrigin="anonymous" />
        </div>
        <div className="text-center flex-grow px-4">
          <h4 className="text-xs font-bold uppercase underline">FORM NO. 1 (See Rule 3)</h4>
          <h2 className="text-base font-bold uppercase mt-1">Government of Maharashtra</h2>
          <h3 className="text-sm font-bold uppercase">Office of the Tahsildar, {formFields.area || 'Bhudargad'}</h3>
        </div>
        <div className="w-35">
          <div className="text-right">
            <div className="h-10 w-40 flex items-center justify-center border-b border-black mb-1 p-1 overflow-hidden">
              <div className="flex items-end gap-[1.5px] h-full w-full">
                {[...Array(45)].map((_, i) => (
                  <div key={i} className="border-l border-black h-full" style={{ height: `${30 + Math.random() * 70}%`, borderWidth: i % 3 === 0 ? '1.5pt' : '0.5pt' }}></div>
                ))}
              </div>
            </div>
            <p className="font-bold force-black text-[10px]">Tracking ID: {trackingId}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">Age, Nationality and Domicile Certificate</h1>
      </div>

      {/* Certificate Body */}
      <div className="text-sm leading-loose text-justify space-y-6 mb-10 px-4">
        <p>
          Certified that Shri/Smt./Kumari <span className="font-bold border-b border-black px-1">{formFields.fullName}</span>, 
          son/daughter of <span className="font-bold border-b border-black px-1">{formFields.fatherName || 'N/A'}</span>, 
          residing at <span className="font-bold border-b border-black px-1">{formFields.address || 'N/A'}</span>, 
          Village <span className="font-bold border-b border-black px-1">{formFields.village || 'N/A'}</span>, 
          Tahsil <span className="font-bold border-b border-black px-1">{formFields.taluka || formFields.area || 'Bhudargad'}</span>, 
          District <span className="font-bold border-b border-black px-1">{formFields.district || 'N/A'}</span>, 
          was born on <span className="font-bold border-b border-black px-1">{formFields.dob || 'N/A'}</span> at 
          <span className="font-bold border-b border-black px-1">{formFields.placeOfBirth || 'N/A'}</span>.
        </p>

        <p>
          He/She is a citizen of India. 
        </p>

        <p>
          He/She has been residing in the State of Maharashtra for a period of <span className="font-bold border-b border-black px-2">{formFields.residencyPeriod || '15'}</span> years.
        </p>

        <p>
          This certificate is issued on the basis of documentary evidence produced by him/her and after local inquiry.
        </p>
      </div>

      {/* Photo and Signature Section */}
      <div className="flex justify-between items-end mt-16 px-4">
        <div className="w-32 h-40 border border-black flex items-center justify-center text-[10px] text-black bg-gray-50 print-bg-gray relative overflow-hidden">
          {(() => {
            const photoDoc = data.documents?.find(d => d.type === 'Passport Photo');
            const photoUrl = photoDoc?.url || data.user?.avatar;

            if (photoUrl) {
              return <img src={photoUrl} alt="Applicant" className="w-full h-full object-cover block" crossOrigin="anonymous" />;
            }

            return (
              <div className="text-center px-2 font-bold opacity-50">
                <p>PASTE</p>
                <p>PHOTOGRAPH</p>
                <p>HERE</p>
              </div>
            );
          })()}
          <div className="absolute inset-0 border-2 border-dashed border-black/10 m-2 flex items-center justify-center pointer-events-none"></div>
        </div>

        <div className="text-center relative">
          <div className="mb-2">
            <div className="inline-block border-[1.5pt] border-green-700 rounded-lg p-2 rotate-[-5deg]">
              <div className="flex items-center gap-2 text-green-800 font-bold text-[10px] uppercase">
                <div className="border border-green-800 rounded-full p-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                Digitally Signed by Tahsildar
              </div>
              <div className="text-[9px] text-green-800 font-bold mt-1">
                Verified & Approved Document
              </div>
              <div className="text-[8px] text-green-700 mt-0.5">
                Date: {issueDate}
              </div>
            </div>
          </div>
          <div className="w-48 border-b border-black mx-auto"></div>
          <p className="font-bold text-xs mt-1 uppercase force-black">Executive Magistrate / Tahsildar</p>
          <p className="text-[10px] text-black italic">Office: {formFields.area || 'Bhudargad'}</p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-[9px] text-center text-gray-600">
        <p>This is a computer generated certificate. For verification, please visit http://aaplesarkar.mahaonline.gov.in</p>
        <p className="mt-1 font-bold">Barcoded Certificate No: {trackingId.toUpperCase()}</p>
      </div>
    </div>
  );
};

export default DomicileCertificateTemplate;
