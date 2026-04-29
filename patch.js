const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace Button Text
content = content.replace('Approve Certificate', 'Approve & Generate Certificate');

// Replace badge layout
let oldBadge = `<div className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center mt-0.5"><CheckCircle className="w-3 h-3 mr-1" /> AI Verified</div>`;

let newBadges = `{(!doc.status || doc.status === 'pending') && <div className="text-[10px] text-orange-500 font-bold uppercase tracking-wider flex items-center mt-0.5"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Pending Validation</div>}
                                        {doc.status === 'verified' && <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center mt-0.5"><CheckCircle className="w-3 h-3 mr-1" /> AI Verified</div>}
                                        {doc.status === 'rejected' && <div className="text-[10px] text-red-600 font-bold uppercase tracking-wider flex items-center mt-0.5"><XCircle className="w-3 h-3 mr-1" /> AI Rejected</div>}`;

content = content.replace(oldBadge, newBadges);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed');
