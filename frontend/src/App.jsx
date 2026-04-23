import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GrievanceList from './components/GrievanceList';

const PrivateRoute = ({ children }) => {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return student ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { student, loading } = useAuth();
  if (loading) return <div className="loading-screen">Loading...</div>;
  return !student ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/my-grievances" element={<PrivateRoute><GrievanceList /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
