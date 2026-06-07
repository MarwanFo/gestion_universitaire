import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'bg-white hover:bg-slate-50/40 opacity-80';
    switch (type) {
      case 'success':
        return 'bg-emerald-50/50 hover:bg-emerald-50 border-l-4 border-l-emerald-500';
      case 'warning':
        return 'bg-amber-50/50 hover:bg-amber-50 border-l-4 border-l-amber-500';
      default:
        return 'bg-indigo-50/50 hover:bg-indigo-50 border-l-4 border-l-indigo-500';
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm flex items-center justify-center text-slate-600 focus:outline-none"
      >
        <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-250/50 backdrop-blur-xl animate-scaleUp overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[10px] font-bold text-rose-600 border border-rose-100 animate-pulse">
                  {unreadCount} nouvelles
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider flex items-center gap-1 active:scale-95 duration-150"
              >
                <Check className="h-3 w-3" />
                Marquer tout lu
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic">
                Aucune notification pour le moment.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read_at) {
                      markAsRead(notif.id);
                    }
                    if (notif.link) {
                      navigate(notif.link);
                    }
                  }}
                  className={`p-4 transition-all duration-200 cursor-pointer flex gap-3 ${getBgColor(notif.type, !!notif.read_at)}`}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        {notif.title}
                      </h4>
                      {!notif.read_at && (
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 mt-1 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-550 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-400 font-medium block pt-1">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {notif.link && (
                    <div className="flex items-center text-slate-300">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
