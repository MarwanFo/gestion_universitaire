import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read_at).length;
      setUnreadCount(unread);
    } catch (e) {
      console.warn("Failed to fetch notifications:", e);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      // Update state locally
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.warn("Failed to mark notification as read:", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      // Update state locally
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {
      console.warn("Failed to mark all notifications as read:", e);
    }
  };

  // Start/stop polling when user logins/logouts
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Polling every 30 seconds
      intervalRef.current = setInterval(() => {
        fetchNotifications();
      }, 30000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      loading
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
