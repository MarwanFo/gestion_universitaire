import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restaurer l'utilisateur depuis le localStorage au démarrage
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, isAdminLogin = false) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password, is_admin_login: isAdminLogin });
      const { user, token } = response.data;

      // Double-check de sécurité côté client
      if (user.role === 'admin' && !isAdminLogin) {
        return { success: false, message: "Les administrateurs doivent utiliser le portail d'administration sécurisé." };
      }
      if (user.role !== 'admin' && isAdminLogin) {
        return { success: false, message: "Accès refusé. Ce portail est réservé exclusivement aux administrateurs." };
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.warn("API login failed, checking fallback credentials...", error);
      
      // Sécurité avant vérification des identifiants hors-ligne
      if (email === 'admin@upf.ac.ma' && !isAdminLogin) {
        return { success: false, message: "Les administrateurs doivent utiliser le portail d'administration sécurisé." };
      }
      if (email !== 'admin@upf.ac.ma' && isAdminLogin) {
        return { success: false, message: "Accès refusé. Ce portail est réservé exclusivement aux administrateurs." };
      }

      // Fallback local pour faciliter le test / demo si le backend n'est pas lancé
      if (password === 'Password123') {
        let mockUser = null;
        if (email === 'admin@upf.ac.ma') {
          mockUser = { id: 1, name: 'Directeur Académique', email: 'admin@upf.ac.ma', role: 'admin' };
        } else if (email === 'prof.benjelloun@upf.ac.ma') {
          mockUser = { id: 2, name: 'Prof. Benjelloun', email: 'prof.benjelloun@upf.ac.ma', role: 'professor' };
        } else if (email === 'student.alami@upf.ac.ma') {
          mockUser = { id: 3, name: 'Marwan Alami', email: 'student.alami@upf.ac.ma', role: 'student', group: 'GINFO-3A' };
        }

        if (mockUser) {
          if (mockUser.role === 'admin' && !isAdminLogin) {
            return { success: false, message: "Les administrateurs doivent utiliser le portail d'administration sécurisé." };
          }
          if (mockUser.role !== 'admin' && isAdminLogin) {
            return { success: false, message: "Accès refusé. Ce portail est réservé exclusivement aux administrateurs." };
          }
          localStorage.setItem('token', 'mock-jwt-token-for-demo');
          localStorage.setItem('user', JSON.stringify(mockUser));
          setUser(mockUser);
          return { success: true, user: mockUser };
        }
      }

      return { 
        success: false, 
        message: error.response?.data?.message || "Identifiants invalides ou serveur indisponible." 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Logout backend error", error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
    isProfessor: user?.role === 'professor',
    isStudent: user?.role === 'student'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false, message: "Auth provider is missing" }),
      logout: async () => {},
      isAdmin: false,
      isProfessor: false,
      isStudent: false
    };
  }
  return context;
};
