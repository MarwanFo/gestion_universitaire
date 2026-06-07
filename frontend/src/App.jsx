import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import Classroom from './pages/Classroom';
import Accueil from './pages/Accueil';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'professor') return <Navigate to="/professor" replace />;
  return <Navigate to="/student" replace />;
}

function DocumentRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-550">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin?tab=documents" replace />;
  if (user.role === 'professor') return <Navigate to="/professor?tab=documents" replace />;
  return <Navigate to="/student?tab=documents" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/login" element={<Login />} />
            <Route path="/portal-admin-login" element={<AdminLogin />} />
            <Route path="/redirect" element={<RootRedirect />} />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/professor" 
              element={
                <ProtectedRoute allowedRoles={['professor']}>
                  <ProfessorDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/classroom" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'professor', 'student']}>
                  <Classroom />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/documents" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'professor', 'student']}>
                  <DocumentRedirect />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
