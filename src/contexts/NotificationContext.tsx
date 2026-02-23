import React, { createContext, useContext, useState } from 'react';

interface NotificationContextType {
  unreadMessages: number;
  newAnnouncements: number;
  setUnreadMessages: (count: number) => void;
  setNewAnnouncements: (count: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadMessages, setUnreadMessages] = useState(3);
  const [newAnnouncements, setNewAnnouncements] = useState(2);

  return (
    <NotificationContext.Provider value={{ unreadMessages, newAnnouncements, setUnreadMessages, setNewAnnouncements }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
