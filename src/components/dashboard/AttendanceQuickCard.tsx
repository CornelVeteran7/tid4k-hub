import { useState, useEffect, useCallback } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { getAttendance, saveAttendance } from '@/api/attendance';
import { onAttendanceUpdated } from '@/utils/attendanceSync';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Users } from 'lucide-react';
import { format } from 'date-fns';
import type { AttendanceRecord } from '@/types';

const PASTEL_COLORS = [
  'hsl(340 80% 85%)', 'hsl(200 80% 85%)', 'hsl(145 60% 82%)',
  'hsl(270 70% 85%)', 'hsl(37 90% 85%)', 'hsl(180 60% 82%)', 'hsl(15 80% 85%)',
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function AttendanceQuickCard() {
  const { currentGroup } = useGroup();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    if (!currentGroup) return;
    try {
      const day = await getAttendance(currentGroup.id, today);
      setRecords(day.records);
    } catch {
      setRecords([]);
    }
  }, [currentGroup, today]);

  useEffect(() => { loadData(); }, [loadData]);

  // Sync instant: reincarc cand alta componenta salveaza prezenta
  useEffect(() => {
    return onAttendanceUpdated((grupa, data) => {
      if (currentGroup && grupa === currentGroup.id && data === today) {
        loadData();
      }
    });
  }, [currentGroup, today, loadData]);

  const total = records.length;
  const present = records.filter(r => r.prezent).length;

  const toggleAttendance = async (childId: string) => {
    const updated = records.map(r =>
      r.child_id === childId ? { ...r, prezent: !r.prezent } : r
    );
    setRecords(updated);
    if (currentGroup) {
      try {
        await saveAttendance(currentGroup.id, today, updated);
      } catch { /* silent */ }
    }
  };

  if (!currentGroup || total === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="group relative flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
          aria-label="Prezența rapidă"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-[11px] font-medium text-muted-foreground">Prezența azi</span>
            <span className="text-sm font-bold text-foreground">{present}<span className="text-muted-foreground font-normal">/{total}</span></span>
          </div>
          {/* Hover overlay with stacked numbers */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-card/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-2xl font-black text-foreground leading-none">{total}</span>
            <div className="w-6 h-px bg-border my-0.5" />
            <span className="text-lg font-bold text-primary leading-none">{present}</span>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start" sideOffset={8}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Prezență — {currentGroup.nume}</h3>
            <span className="text-xs text-muted-foreground">{present}/{total}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {records.map((r, i) => (
              <button
                key={r.child_id}
                onClick={() => toggleAttendance(r.child_id)}
                className="flex flex-col items-center gap-1 group/avatar"
                title={`${r.nume_prenume_copil} — ${r.prezent ? 'Prezent' : 'Absent'}`}
              >
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-foreground/80 transition-transform group-hover/avatar:scale-110"
                    style={{ backgroundColor: PASTEL_COLORS[i % PASTEL_COLORS.length] }}
                  >
                    {getInitials(r.nume_prenume_copil)}
                  </div>
                  {/* Green/gray dot indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card transition-colors ${
                    r.prezent ? 'bg-green-500' : 'bg-muted-foreground/30'
                  }`} />
                </div>
                <span className="text-[9px] text-muted-foreground leading-tight text-center truncate w-full">
                  {r.nume_prenume_copil.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
