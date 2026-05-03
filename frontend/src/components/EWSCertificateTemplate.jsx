import React from 'react';
import { Check } from 'lucide-react';

const EWSCertificateTemplate = ({ data, trackingId }) => {
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
          <h4 className="text-xs font-bold uppercase underline">Annexure-I</h4>
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

      <div className="text-center mb-6">
        <h1 className="text-lg font-bold uppercase tracking-tight">Income & Asset Certificate to be Produced by Economically Weaker Sections</h1>
      </div>

      <div className="flex justify-between items-start mb-6 text-[10px]">
        <div className="flex flex-col gap-1">
          <p><span className="font-bold">Certificate No:</span> {trackingId.toUpperCase()}</p>
          <p><span className="font-bold">Date:</span> {issueDate}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">VALID FOR THE YEAR:</span> {formFields.financialYear || '2026-2027'}</p>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="text-sm leading-relaxed text-justify space-y-4 mb-10">
        <p>
          This is to certify that Shri/Smt./Kumari <span className="font-bold border-b border-black px-1">{formFields.fullName}</span>,
          son/daughter/wife of <span className="font-bold border-b border-black px-1">{formFields.fatherName || 'N/A'}</span>,
          permanent resident of <span className="font-bold border-b border-black px-1">{formFields.village || 'N/A'}</span>,
          Village/Street <span className="font-bold border-b border-black px-1">{formFields.address || 'N/A'}</span>,
          Post Office <span className="font-bold border-b border-black px-1">{formFields.village || 'N/A'}</span>,
          District <span className="font-bold border-b border-black px-1">{formFields.district || 'N/A'}</span> in the State of <span className="font-bold underline">MAHARASHTRA</span>,
          Pin Code <span className="font-bold border-b border-black px-1">{formFields.pincode || 'N/A'}</span>, whose photograph is attested below,
          belongs to Economically Weaker Sections, since the gross annual income* of his/her "family"** is below Rs. 8 lakh (Rupees Eight Lakh only) for the financial year <span className="font-bold border-b border-black px-1">{formFields.financialYear || '2024-2025'}</span>.
          His/her family does not own or possess any of the following assets***:
        </p>

        <ol className="list-roman pl-10 space-y-1">
          <li>5 acres of agricultural land and above;</li>
          <li>Residential flat of 1000 sq. ft. and above;</li>
          <li>Residential plot of 100 sq. yards and above in notified municipalities;</li>
          <li>Residential plot of 200 sq. yards and above in areas other than the notified municipalities.</li>
        </ol>

        <p>
          2. Shri/Smt./Kumari <span className="font-bold border-b border-black px-1">{formFields.fullName}</span> belongs to the
          <span className="font-bold border-b border-black px-1"> {formFields.caste || 'N/A'} </span> caste which is not recognized as a Scheduled Caste, Scheduled Tribe and Other Backward Classes (Central List).
        </p>
      </div>

      {/* Photo and Signature Section */}
      <div className="flex justify-between items-end mt-16">
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
          <p className="font-bold text-xs mt-1 uppercase force-black">Signature with seal of Office</p>
          <p className="text-[10px] text-black italic">Name: {formFields.area || 'Bhudargad'} Revenue Officer</p>
          <p className="text-[10px] text-black">Designation: Tahsildar</p>
        </div>
      </div>

      {/* Verification footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-[9px] text-gray-500">
        <p>*Note 1: Income covered all sources i.e. salary, agriculture, business, profession, etc.</p>
        <p>**Note 2: The term "Family" for this purpose include the person, who seeks benefit of reservation, his/her parents and siblings below the age of 18 years as also his/her spouse and children below the age of 18 years.</p>
        <p>***Note 3: The property held by a "Family" in different locations or different places/cities have been clubbed while applying the land or property holding test to determine EWS status.</p>
      </div>
    </div>
  );
};

export default EWSCertificateTemplate;
