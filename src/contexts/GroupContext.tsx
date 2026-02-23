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
  const [currentIndex, setCurrentIndex] = useState(user?.index_grupa_clasa_curenta || 0);

  const currentGroup = groups[currentIndex] || null;

  const switchGroup = useCallback((groupId: string) => {
    const idx = groups.findIndex((g) => g.id === groupId);
    if (idx !== -1) setCurrentIndex(idx);
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
