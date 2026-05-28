import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f12] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard par défaut du rôle de l'utilisateur
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'professor') return <Navigate to="/professor" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
}
