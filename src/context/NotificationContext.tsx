import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AppNotification } from '../types';
import { mockStorage } from '../mocks/storage';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(mockStorage.getNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    mockStorage.saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    mockStorage.saveNotifications(updated);
  };

  const addNotification = (item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNot: AppNotification = {
      ...item,
      id: `not-${Date.now()}`,
      timestamp: 'Agora',
      read: false,
    };
    const updated = [newNot, ...notifications];
    setNotifications(updated);
    mockStorage.saveNotifications(updated);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
