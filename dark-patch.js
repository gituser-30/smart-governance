const fs = require('fs');
const path = require('path');

const filesToUpdate = [
   'frontend/src/pages/Dashboard.jsx',
   'frontend/src/pages/AdminDashboard.jsx',
   'frontend/src/pages/ApplyForm.jsx',
   'frontend/src/pages/AdminAuth.jsx',
   'frontend/src/components/Navbar.jsx'
];

const replacements = [
   { r: /bg-\[\#f3f4f6\]/g, v: 'transparent' },
   { r: /bg-white\/95/g, v: 'bg-slate-900/95' },
   { r: /bg-white\/80/g, v: 'bg-slate-900/80' },
   { r: /bg-white\/70/g, v: 'bg-slate-900/70' },
   { r: /bg-white\/60/g, v: 'bg-slate-900/60' },
   { r: /bg-white\/50/g, v: 'bg-slate-900/50' },
   { r: /bg-white\/40/g, v: 'bg-slate-900/40' },
   { r: /bg-white\b/g, v: 'bg-slate-900' },
   { r: /text-gray-900/g, v: 'text-slate-50' },
   { r: /text-gray-800/g, v: 'text-slate-200' },
   { r: /text-gray-700/g, v: 'text-slate-300' },
   { r: /text-gray-600/g, v: 'text-slate-400' },
   { r: /text-gray-500/g, v: 'text-slate-400' },
   { r: /text-gray-400/g, v: 'text-slate-500' },
   { r: /text-gray-300/g, v: 'text-slate-600' },
   { r: /bg-gray-50/g, v: 'bg-slate-800/50' },
   { r: /bg-gray-100/g, v: 'bg-slate-800/70' },
   { r: /bg-gray-200/g, v: 'bg-slate-800' },
   { r: /border-white\/60/g, v: 'border-slate-700' },
   { r: /border-white\/50/g, v: 'border-slate-700' },
   { r: /border-white\/40/g, v: 'border-slate-700' },
   { r: /border-white\b/g, v: 'border-slate-700' },
   { r: /border-gray-200/g, v: 'border-slate-700' },
   { r: /border-gray-100/g, v: 'border-slate-800' },
   { r: /shadow-sm/g, v: 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]' },
   { r: /shadow-md/g, v: 'shadow-[0_8px_30px_rgba(0,0,0,0.6)]' },
   { r: /shadow-xl/g, v: 'shadow-[0_20px_50px_rgba(0,0,0,0.7)]' },
   { r: /text-primary-700/g, v: 'text-blue-400' },
   { r: /text-primary-600/g, v: 'text-blue-500' }
];

filesToUpdate.forEach(file => {
   const fullPath = path.join(__dirname, file);
   if (fs.existsSync(fullPath)) {
       let content = fs.readFileSync(fullPath, 'utf8');
       replacements.forEach(rep => {
          content = content.replace(rep.r, rep.v);
       });
       fs.writeFileSync(fullPath, content, 'utf8');
       console.log('Patched', file);
   }
});
