import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { getAttendance, saveAttendance } from '@/api/attendance';
import { toast } from 'sonner';
import type { AttendanceRecord } from '@/types';

const PASTEL_COLORS = [
  'hsl(340 80% 85%)', 'hsl(200 80% 85%)', 'hsl(145 60% 82%)',
  'hsl(270 70% 85%)', 'hsl(37 90% 85%)', 'hsl(180 60% 82%)', 'hsl(15 80% 85%)',
  'hsl(60 70% 84%)', 'hsl(310 60% 85%)', 'hsl(160 70% 80%)',
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

interface AttendanceGridProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
}

export default function AttendanceGrid({ open, onClose, groupId, groupName }: AttendanceGridProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayLabel = format(new Date(), 'EEEE, d MMMM', { locale: ro });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const day = await getAttendance(groupId, today);
      setRecords(day.records);
    } catch {
      setRecords([]);
    }
    setLoading(false);
  }, [groupId, today]);

  useEffect(() => {
    if (open) loadData();
  }, [open, loadData]);

  const present = records.filter(r => r.prezent).length;
  const total = records.length;

  const toggleChild = (childId: string) => {
    setRecords(prev => {
      const updated = prev.map(r =>
        r.child_id === childId ? { ...r, prezent: !r.prezent } : r
      );
      // Debounced save
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveAttendance(groupId, today, updated).catch(() => {});
      }, 800);
      return updated;
    });
  };

  const handleClose = useCallback(async () => {
    // Final save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    try {
      await saveAttendance(groupId, today, records);
    } catch { /* silent */ }
    const p = records.filter(r => r.prezent).length;
    const a = records.length - p;
    toast.success('✅ Prezența confirmată!', {
      description: `Prezenți: ${p} · Absenți: ${a}`,
      duration: 3000,
    });
    onClose();
  }, [groupId, today, records, onClose]);

  // Compute grid columns based on total children
  const gridCols = total <= 12 ? 'grid-cols-3' :
                   total <= 20 ? 'grid-cols-4' :
                   total <= 30 ? 'grid-cols-5' :
                   'grid-cols-6';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Transparent backdrop — tap to close */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />

          {/* Floating card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-md max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <div>
                <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Prezența — {groupName}
                </h2>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{todayLabel}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-black text-card-foreground">{present}</span>
                  <span className="text-sm text-muted-foreground">/{total}</span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors"
                  aria-label="Închide"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {loading ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  Se încarcă...
                </div>
              ) : records.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                  Nu sunt copii înregistrați în această grupă.
                </div>
              ) : (
                <div className={`grid ${gridCols} gap-3`}>
                  {records.map((r, i) => (
                    <button
                      key={r.child_id}
                      onClick={() => toggleChild(r.child_id)}
                      className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all active:scale-95 hover:bg-muted/40"
                    >
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            r.prezent
                              ? 'ring-[3px] ring-green-500 ring-offset-2 ring-offset-card'
                              : 'opacity-60'
                          }`}
                          style={{ backgroundColor: PASTEL_COLORS[i % PASTEL_COLORS.length], color: 'hsl(var(--foreground) / 0.8)' }}
                        >
                          {getInitials(r.nume_prenume_copil)}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card transition-colors ${
                          r.prezent ? 'bg-green-500' : 'bg-muted-foreground/30'
                        }`} />
                      </div>
                      <span className={`text-[10px] leading-tight text-center truncate w-full font-medium ${
                        r.scanned_by_parent ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        {r.nume_prenume_copil.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border/30 px-5 py-3 bg-muted/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Apasă pe copil pentru a marca prezența
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-card-foreground font-semibold">{present}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <span className="text-card-foreground font-semibold">{total - present}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
