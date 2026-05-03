import React from 'react';
import { Check } from 'lucide-react';

const BirthCertificateTemplate = ({ data, trackingId }) => {
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
          <h4 className="text-xs font-bold uppercase underline">FORM NO. 5</h4>
          <h2 className="text-base font-bold uppercase mt-1">Government of Maharashtra</h2>
          <h3 className="text-sm font-bold uppercase">Health Department, {formFields.area || 'Bhudargad'}</h3>
          <p className="text-[10px] italic mt-1">(Issued under Section 12/17 of the Registration of Births & Deaths Act, 1969)</p>
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
        <h1 className="text-xl font-bold uppercase tracking-widest border-b-2 border-black inline-block pb-1">Birth Certificate</h1>
      </div>

      {/* Certificate Body */}
      <div className="text-sm leading-loose space-y-6 mb-10">
        <p className="text-justify">
          This is to certify that the following information has been taken from the original record of birth which is the register for 
          <span className="font-bold border-b border-black px-1 mx-1">{formFields.area || 'Bhudargad'}</span> of 
          Tahsil <span className="font-bold border-b border-black px-1 mx-1">{formFields.taluka || formFields.area || 'Bhudargad'}</span> of 
          District <span className="font-bold border-b border-black px-1 mx-1">{formFields.district || 'N/A'}</span> of 
          State <span className="font-bold border-b border-black px-1 mx-1">Maharashtra</span>.
        </p>

        <div className="grid grid-cols-1 gap-4 border border-black p-4">
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Name:</span>
            <span className="uppercase">{formFields.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Sex:</span>
            <span className="uppercase">{formFields.gender || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Date of Birth:</span>
            <span>{formFields.dob || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Place of Birth:</span>
            <span className="uppercase">{formFields.placeOfBirth || formFields.village || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Name of Father:</span>
            <span className="uppercase">{formFields.fatherName || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Name of Mother:</span>
            <span className="uppercase">{formFields.motherName || 'N/A'}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-1">
            <span className="font-bold">Registration Number:</span>
            <span className="font-mono">{trackingId.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold">Date of Registration:</span>
            <span>{issueDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-end mt-16">
        <div className="text-left text-[10px]">
          <p>Date of Issue: <span className="font-bold">{issueDate}</span></p>
          <p>Place of Issue: <span className="font-bold uppercase">{formFields.area || 'Bhudargad'}</span></p>
        </div>

        <div className="text-center relative">
          <div className="mb-2">
            <div className="inline-block border-[1.5pt] border-green-700 rounded-lg p-2 rotate-[-5deg]">
              <div className="flex items-center gap-2 text-green-800 font-bold text-[10px] uppercase">
                <div className="border border-green-800 rounded-full p-0.5">
                  <Check size={12} strokeWidth={4} />
                </div>
                Digitally Signed by Registrar
              </div>
              <div className="text-[9px] text-green-800 font-bold mt-1">
                Verified & Registered
              </div>
              <div className="text-[8px] text-green-700 mt-0.5">
                Date: {issueDate}
              </div>
            </div>
          </div>
          <div className="w-48 border-b border-black mx-auto"></div>
          <p className="font-bold text-xs mt-1 uppercase force-black">Registrar (Birth & Death)</p>
          <p className="text-[10px] text-black italic">{formFields.area || 'Bhudargad'} Municipal Council / Grampanchayat</p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-[9px] text-center text-gray-600">
        <p>This is a computer generated certificate. For verification, please visit http://mahaonline.gov.in</p>
      </div>
    </div>
  );
};

export default BirthCertificateTemplate;
