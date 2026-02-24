import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, X, MessageSquare, UtensilsCrossed, CalendarCheck, Send, Phone, Mail } from 'lucide-react';
import { useGroup } from '@/contexts/GroupContext';
import { getAttendanceStats } from '@/api/attendance';
import { useNavigate } from 'react-router-dom';
import type { Child, AttendanceStats } from '@/types';
import { format } from 'date-fns';

interface ChildDetailDialogProps {
  child: Child | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarColor: string;
}

// Mock food cost per day
const HRANA_COST_PER_DAY = 25; // RON

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ChildDetailDialog({ child, open, onOpenChange, avatarColor }: ChildDetailDialogProps) {
  const { currentGroup } = useGroup();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [presentToday, setPresentToday] = useState(true);
  const [message, setMessage] = useState('');

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  useEffect(() => {
    if (child && currentGroup && open) {
      getAttendanceStats(currentGroup.id, currentMonth, currentYear).then(setStats);
      // Randomize today's presence for demo
      setPresentToday(Math.random() > 0.3);
    }
  }, [child, currentGroup, open, currentMonth, currentYear]);

  if (!child) return null;

  const childStats = stats?.per_copil.find(c => c.id_copil === child.id_copil);
  const zilePrezent = childStats?.zile_prezent ?? 0;
  const hranaTotal = zilePrezent * HRANA_COST_PER_DAY;

  const handleTogglePresence = () => {
    setPresentToday(prev => !prev);
    // In real app: call saveAttendance API
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      // In real app: call messages API
      setMessage('');
      onOpenChange(false);
      // Navigate to messages with pre-selected parent
      navigate('/mesaje');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden">
        {/* Header with avatar */}
        <div className="flex flex-col items-center pt-6 pb-4 px-5" style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)` }}>
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center text-2xl font-bold text-foreground/80 shadow-lg">
            {getInitials(child.nume_prenume_copil)}
          </div>
          <h3 className="mt-3 text-lg font-display font-bold text-foreground">{child.nume_prenume_copil}</h3>
          {child.data_nasterii && (
            <p className="text-xs text-foreground/60 mt-0.5">
              Născut: {format(new Date(child.data_nasterii), 'dd MMM yyyy')}
            </p>
          )}
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Today's attendance toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-semibold">Prezență azi</p>
                <p className="text-xs text-muted-foreground">{format(today, 'dd MMMM yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={presentToday ? 'default' : 'destructive'} className={presentToday ? 'bg-success text-success-foreground' : ''}>
                {presentToday ? <><Check className="h-3 w-3 mr-1" /> Prezent</> : <><X className="h-3 w-3 mr-1" /> Absent</>}
              </Badge>
              <Switch checked={presentToday} onCheckedChange={handleTogglePresence} />
            </div>
          </div>

          {/* Monthly stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <CalendarCheck className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-foreground">{zilePrezent}</p>
              <p className="text-xs text-muted-foreground">Zile prezent</p>
              <p className="text-[10px] text-muted-foreground/60">{childStats?.procent ?? 0}% luna aceasta</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
              <UtensilsCrossed className="h-5 w-5 mx-auto text-warning mb-1" />
              <p className="text-2xl font-bold text-foreground">{hranaTotal} RON</p>
              <p className="text-xs text-muted-foreground">Hrană luna aceasta</p>
              <p className="text-[10px] text-muted-foreground/60">{zilePrezent} × {HRANA_COST_PER_DAY} RON/zi</p>
            </div>
          </div>

          {/* Parent contact */}
          {child.parinte_nume && (
            <div className="p-3 rounded-xl bg-muted/50 border border-border/50">
              <p className="text-xs font-semibold text-muted-foreground mb-2">CONTACT PĂRINTE</p>
              <p className="text-sm font-medium">{child.parinte_nume}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {child.parinte_telefon && (
                  <a href={`tel:${child.parinte_telefon}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <Phone className="h-3.5 w-3.5" /> {child.parinte_telefon}
                  </a>
                )}
                {child.parinte_email && (
                  <a href={`mailto:${child.parinte_email}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                    <Mail className="h-3.5 w-3.5" /> {child.parinte_email}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Quick message */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" /> TRIMITE MESAJ PĂRINTE
            </p>
            <Textarea
              placeholder={`Scrie un mesaj pentru ${child.parinte_nume || 'părinte'}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
            />
            <Button
              size="sm"
              className="w-full gap-2"
              disabled={!message.trim()}
              onClick={handleSendMessage}
            >
              <Send className="h-4 w-4" />
              Trimite mesaj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
