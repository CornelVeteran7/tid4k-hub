import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getConversations } from '@/api/messages';
import { getAnnouncements } from '@/api/announcements';
import { getWorkshopOfMonth } from '@/api/workshops';
import type { Conversation, Announcement } from '@/types';

export interface NotificationItem {
  id: string;
  type: 'message' | 'announcement' | 'workshop';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  navigateTo: string;
  icon: 'message' | 'megaphone' | 'alert' | 'paintbrush';
}

interface NotificationContextType {
  unreadMessages: number;
  newAnnouncements: number;
  notifications: NotificationItem[];
  setUnreadMessages: (count: number) => void;
  setNewAnnouncements: (count: number) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newAnnouncements, setNewAnnouncements] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const [conversations, announcements, workshopOfMonth] = await Promise.all([
        getConversations(user.id_utilizator),
        getAnnouncements(),
        getWorkshopOfMonth(),
      ]);

      // Count real unread messages
      const totalUnreadMsgs = conversations.reduce((sum, c) => sum + c.necitite, 0);
      setUnreadMessages(totalUnreadMsgs);

      // Count unread announcements
      const unreadAnns = announcements.filter(a => !a.citit);
      setNewAnnouncements(unreadAnns.length);

      // Build notification items
      const msgNotifs: NotificationItem[] = conversations
        .filter(c => c.necitite > 0)
        .map(c => ({
          id: `msg-${c.id}`,
          type: 'message' as const,
          title: c.contact_nume,
          description: c.necitite === 1
            ? c.ultimul_mesaj
            : `${c.necitite} mesaje necitite`,
          timestamp: c.data_ultimul_mesaj,
          read: false,
          navigateTo: '/mesaje',
          icon: 'message' as const,
        }));

      const annNotifs: NotificationItem[] = unreadAnns.map(a => ({
        id: `ann-${a.id_info}`,
        type: 'announcement' as const,
        title: a.titlu,
        description: a.prioritate === 'urgent' ? '⚠️ Urgent' : a.autor,
        timestamp: a.data_upload,
        read: false,
        navigateTo: '/anunturi',
        icon: a.prioritate === 'urgent' ? 'alert' as const : 'megaphone' as const,
      }));

      // Workshop notification
      const workshopNotifs: NotificationItem[] = [];
      if (workshopOfMonth) {
        const seenKey = `tid4k_seen_workshop_${workshopOfMonth.id_atelier}`;
        if (!localStorage.getItem(seenKey)) {
          workshopNotifs.push({
            id: `ws-${workshopOfMonth.id_atelier}`,
            type: 'workshop',
            title: `Atelier nou: ${workshopOfMonth.titlu}`,
            description: `${workshopOfMonth.instructor} · ${workshopOfMonth.durata_minute} min`,
            timestamp: workshopOfMonth.data_publicare || workshopOfMonth.data_creare,
            read: false,
            navigateTo: '/',
            icon: 'paintbrush',
          });
        }
      }

      // Sort by timestamp descending
      const all = [...msgNotifs, ...annNotifs, ...workshopNotifs].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(all);
    } catch (err) {
      console.error('Failed to refresh notifications:', err);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Periodic refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    // Recalculate counts
    setNotifications(prev => {
      const unreadMsgs = prev.filter(n => n.type === 'message' && !n.read && n.id !== id).length;
      const unreadAnns = prev.filter(n => n.type === 'announcement' && !n.read && n.id !== id).length;
      setUnreadMessages(unreadMsgs);
      setNewAnnouncements(unreadAnns);
      return prev.map(n => n.id === id ? { ...n, read: true } : n);
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadMessages(0);
    setNewAnnouncements(0);
  }, []);

  return (
    <NotificationContext.Provider value={{
      unreadMessages,
      newAnnouncements,
      notifications,
      setUnreadMessages,
      setNewAnnouncements,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
