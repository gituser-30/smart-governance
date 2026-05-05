import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ApplyForm from './pages/ApplyForm';

import AdminDashboard from './pages/AdminDashboard';
import AdminAuth from './pages/AdminAuth';
import CertificateView from './pages/CertificateView';
import AuditLogs from './pages/AuditLogs';

import Certificates from './pages/Certificates';
import Grievances from './pages/Grievances';
import TrackStatus from './pages/TrackStatus';
import Settings from './pages/Settings';
import HelpSupport from './pages/HelpSupport';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id'}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin-login" element={<AdminAuth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
            <Route path="/dashboard/grievances" element={<ProtectedRoute><Grievances /></ProtectedRoute>} />
            <Route path="/dashboard/track" element={<ProtectedRoute><TrackStatus /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/dashboard/support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><ApplyForm /></ProtectedRoute>} />
            <Route path="/certificate/:trackingId" element={<ProtectedRoute><CertificateView /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
