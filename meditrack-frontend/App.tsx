import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import ProfilePage from './features/profile/ProfilePage';
import PatientsPage from './features/patients/PatientsPage';
import PatientDetailsPage from './features/patients/PatientDetailsPage';
import ChatPage from './features/chat/ChatPage';
import MedicationsPage from './features/medications/MedicationsPage';
import RemindersPage from './features/medications/RemindersPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: React.PropsWithChildren) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A7EF0]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

// Admin Protected Route
const AdminRoute = ({ children }: React.PropsWithChildren) => {
    const { user } = useAuth();
    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
}

// Patient Protected Route
const PatientRoute = ({ children }: React.PropsWithChildren) => {
    const { user } = useAuth();
    if (user?.role !== 'patient') {
        return <Navigate to="/patients" replace />;
    }
    return <>{children}</>;
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <PatientRoute>
                <DashboardPage />
              </PatientRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <PatientRoute>
                <DashboardPage />
              </PatientRoute>
            </ProtectedRoute>
          } />
          
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          } />
          
          <Route path="/medications" element={
            <ProtectedRoute>
              <MedicationsPage />
            </ProtectedRoute>
          } />

          <Route path="/reminders" element={
            <ProtectedRoute>
              <RemindersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="/patients" element={
            <ProtectedRoute>
              <AdminRoute>
                <PatientsPage />
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Patient's own profile route - MUST come before /patients/:id */}
          <Route path="/patients/me" element={
            <ProtectedRoute>
              <PatientRoute>
                <PatientDetailsPage />
              </PatientRoute>
            </ProtectedRoute>
          } />

          <Route path="/patients/:id" element={
            <ProtectedRoute>
              <AdminRoute>
                <PatientDetailsPage />
              </AdminRoute>
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;