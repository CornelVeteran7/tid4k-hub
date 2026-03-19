/**
 * Hook care incarca prezenta zilnica DOAR pentru grupa selectata curent.
 * Se actualizeaza automat cand o componenta salveaza prezenta.
 */
import { useState, useEffect, useCallback } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { getAttendance } from '@/api/attendance';
import { onAttendanceUpdated } from '@/utils/attendanceSync';
import { format } from 'date-fns';

export interface GroupAttendanceInfo {
  total: number;
  prezenti: number;
}

export function useGroupAttendance() {
  const { currentGroup } = useGroup();
  const [attendanceMap, setAttendanceMap] = useState<Record<string, GroupAttendanceInfo>>({});
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadCurrentGroup = useCallback(async () => {
    if (!currentGroup) return;

    try {
      const day = await getAttendance(currentGroup.id, today);
      const total = day.records.length;
      const prezenti = day.records.filter((r) => r.prezent).length;
      setAttendanceMap({ [currentGroup.id]: { total, prezenti } });
    } catch {
      setAttendanceMap({ [currentGroup.id]: { total: 0, prezenti: 0 } });
    }
  }, [currentGroup, today]);

  // Incarcare la schimbarea grupei
  useEffect(() => {
    loadCurrentGroup();
  }, [loadCurrentGroup]);

  // Reincarcare la actualizari din alte componente (sync instant)
  useEffect(() => {
    return onAttendanceUpdated((grupa, data) => {
      if (data === today && currentGroup && grupa === currentGroup.id) {
        getAttendance(grupa, today).then((day) => {
          const total = day.records.length;
          const prezenti = day.records.filter((r) => r.prezent).length;
          setAttendanceMap((prev) => ({ ...prev, [grupa]: { total, prezenti } }));
        }).catch(() => {});
      }
    });
  }, [today, currentGroup]);

  return attendanceMap;
}
