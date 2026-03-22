import React, { createContext, useContext, useState, useCallback } from 'react';
import type { GroupInfo } from '@/types';
import { useAuth } from './AuthContext';

interface GroupContextType {
  currentGroup: GroupInfo | null;
  availableGroups: GroupInfo[];
  switchGroup: (groupId: string) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const groups = user?.grupe_disponibile || [];

  // Restaurăm grupa salvată din localStorage (persistă la reload)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('tid4k_grupa_selectata');
    if (saved && groups.length > 0) {
      const idx = groups.findIndex((g) => g.id === saved);
      if (idx !== -1) return idx;
    }
    return user?.index_grupa_clasa_curenta || 0;
  });

  const currentGroup = groups[currentIndex] || null;

  const switchGroup = useCallback((groupId: string) => {
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx !== -1) {
      setCurrentIndex(idx);
      localStorage.setItem('tid4k_grupa_selectata', groupId);
    }
  }, [groups]);

  return (
    <GroupContext.Provider value={{ currentGroup, availableGroups: groups, switchGroup }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  const ctx = useContext(GroupContext);
  if (!ctx) throw new Error('useGroup must be used within GroupProvider');
  return ctx;
}
