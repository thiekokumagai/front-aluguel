import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, CheckCheck, CreditCard, Calendar, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationPopover: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'due':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'contract':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Notificações
              </h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {unreadCount} novas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar todas como lidas</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">Nenhuma notificação.</div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors flex items-start space-x-3 ${
                    !item.read
                      ? 'bg-blue-50/40 dark:bg-blue-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                      {item.message}
                    </p>
                    {item.linkUrl && (
                      <Link
                        to={item.linkUrl}
                        onClick={() => {
                          markAsRead(item.id);
                          setIsOpen(false);
                        }}
                        className="inline-block mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Ver detalhes &rarr;
                      </Link>
                    )}
                  </div>
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title="Marcar como lida"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
