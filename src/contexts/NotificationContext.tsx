import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getConversations } from '@/api/messages';
import { getAnnouncements } from '@/api/announcements';
import { getWorkshopOfMonth } from '@/api/workshops';
import { getPolls } from '@/api/polls';
import type { Conversation, Announcement } from '@/types';

export interface NotificationItem {
  id: string;
  type: 'message' | 'announcement' | 'workshop' | 'poll';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  navigateTo: string;
  icon: 'message' | 'megaphone' | 'alert' | 'paintbrush' | 'vote';
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

const STORAGE_KEY = 'tid4k_notif_read';
const MAX_NOTIFICATIONS = 15;

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveReadIds(ids: Set<string>) {
  // Only keep last 50 to avoid unbounded growth
  const arr = [...ids].slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function isWithinPastMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  return date >= monthAgo;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newAnnouncements, setNewAnnouncements] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const readIdsRef = useRef<Set<string>>(loadReadIds());

  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    // In demo mode, return static mock notifications instead of hitting Supabase
    const isDemo = sessionStorage.getItem('demo_mode') === '1';
    if (isDemo) {
      const readIds = readIdsRef.current;
      const mockNotifs: NotificationItem[] = [
        { id: 'ann-demo-1', type: 'announcement', title: 'Bun venit în modul demo!', description: 'Explorați toate funcționalitățile', timestamp: new Date().toISOString(), read: readIds.has('ann-demo-1'), navigateTo: '/anunturi', icon: 'megaphone' },
        { id: 'ann-demo-2', type: 'announcement', title: 'Actualizare platformă', description: 'Versiune nouă disponibilă', timestamp: new Date(Date.now() - 3600000).toISOString(), read: readIds.has('ann-demo-2'), navigateTo: '/anunturi', icon: 'megaphone' },
        { id: 'msg-demo-1', type: 'message', title: 'Mesaj demo', description: 'Aceasta este o conversație demo', timestamp: new Date(Date.now() - 7200000).toISOString(), read: readIds.has('msg-demo-1'), navigateTo: '/mesaje', icon: 'message' },
      ];
      setUnreadMessages(mockNotifs.filter(n => n.type === 'message' && !n.read).length);
      setNewAnnouncements(mockNotifs.filter(n => n.type !== 'message' && !n.read).length);
      setNotifications(mockNotifs);
      return;
    }

    try {
      const [conversations, announcements, workshopOfMonth] = await Promise.all([
        getConversations(user.id),
        getAnnouncements(),
        getWorkshopOfMonth(),
      ]);

      const readIds = readIdsRef.current;

      // Build ALL notification items (not just unread)
      const msgNotifs: NotificationItem[] = conversations.map(c => ({
        id: `msg-${c.id}`,
        type: 'message' as const,
        title: c.contact_nume,
        description: c.necitite > 0
          ? (c.necitite === 1 ? c.ultimul_mesaj : `${c.necitite} mesaje necitite`)
          : c.ultimul_mesaj,
        timestamp: c.data_ultimul_mesaj,
        read: readIds.has(`msg-${c.id}`) || c.necitite === 0,
        navigateTo: '/mesaje',
        icon: 'message' as const,
      }));

      const annNotifs: NotificationItem[] = announcements.map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement' as const,
        title: a.titlu,
        description: a.prioritate === 'urgent' ? '⚠️ Urgent' : a.autor,
        timestamp: a.data_upload,
        read: readIds.has(`ann-${a.id}`) || a.citit,
        navigateTo: '/anunturi',
        icon: a.prioritate === 'urgent' ? 'alert' as const : 'megaphone' as const,
      }));

      const workshopNotifs: NotificationItem[] = [];
      if (workshopOfMonth) {
        const wsId = `ws-${workshopOfMonth.id_atelier}`;
        workshopNotifs.push({
          id: wsId,
          type: 'workshop',
          title: `Atelier nou: ${workshopOfMonth.titlu}`,
          description: `${workshopOfMonth.instructor} · ${workshopOfMonth.durata_minute} min`,
          timestamp: workshopOfMonth.data_publicare || workshopOfMonth.data_creare,
          read: readIds.has(wsId),
          navigateTo: '/',
          icon: 'paintbrush',
        });
      }

      // Combine, filter to past month, sort by date, limit to MAX
      const all = [...msgNotifs, ...annNotifs, ...workshopNotifs]
        .filter(n => isWithinPastMonth(n.timestamp))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, MAX_NOTIFICATIONS);

      // Count unread
      const unreadMsgs = all.filter(n => n.type === 'message' && !n.read).length;
      const unreadAnns = all.filter(n => (n.type === 'announcement' || n.type === 'workshop') && !n.read).length;

      setUnreadMessages(unreadMsgs);
      setNewAnnouncements(unreadAnns);
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
    readIdsRef.current.add(id);
    saveReadIds(readIdsRef.current);

    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      setUnreadMessages(updated.filter(n => n.type === 'message' && !n.read).length);
      setNewAnnouncements(updated.filter(n => (n.type === 'announcement' || n.type === 'workshop') && !n.read).length);
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      prev.forEach(n => readIdsRef.current.add(n.id));
      saveReadIds(readIdsRef.current);
      return prev.map(n => ({ ...n, read: true }));
    });
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
