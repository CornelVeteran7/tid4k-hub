import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  label: string;
  instant: boolean;
  date?: Date;
  time?: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
}

export default function ShareDialog({ open, onOpenChange, moduleTitle }: ShareDialogProps) {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'whatsapp', label: 'WhatsApp', instant: true },
    { id: 'facebook', label: 'Facebook', instant: true },
    { id: 'webpage', label: 'Web Page', instant: true },
  ]);
  const [scheduleOpen, setScheduleOpen] = useState<string | null>(null);

  const toggleChannel = (id: string) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, instant: c.instant } : c));
  };

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelected = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateChannel = (id: string, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Trimite — {moduleTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {channels.map(channel => (
            <div key={channel.id} className="border-b border-border/50 pb-3 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selected.has(channel.id)}
                    onCheckedChange={() => toggleSelected(channel.id)}
                  />
                  <div>
                    <p className="text-sm font-semibold">{channel.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {channel.instant ? 'Instant' : channel.date ? format(channel.date, 'PPP') + (channel.time ? ` ${channel.time}` : '') : 'Programat'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setScheduleOpen(scheduleOpen === channel.id ? null : channel.id)}
                >
                  <Clock className="h-4 w-4 text-primary" />
                </Button>
              </div>

              {/* Schedule picker */}
              {scheduleOpen === channel.id && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={channel.instant}
                      onCheckedChange={(checked) => updateChannel(channel.id, { instant: !!checked })}
                    />
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">Instant (trimite imediat)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Data:</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className={cn("flex-1 justify-start text-left font-normal h-8", !channel.date && "text-muted-foreground")} disabled={channel.instant}>
                          {channel.date ? format(channel.date, 'PPP') : 'Alege data'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={channel.date}
                          onSelect={(d) => updateChannel(channel.id, { date: d, instant: false })}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Ora:</span>
                    <Input
                      type="time"
                      value={channel.time || '17:00'}
                      onChange={(e) => updateChannel(channel.id, { time: e.target.value, instant: false })}
                      className="flex-1 h-8"
                      disabled={channel.instant}
                    />
                  </div>

                  <Button size="sm" className="w-full" onClick={() => setScheduleOpen(null)}>
                    OK
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          className="w-full mt-2 bg-primary hover:bg-primary/90"
          disabled={selected.size === 0}
          onClick={() => onOpenChange(false)}
        >
          Trimite
        </Button>
      </DialogContent>
    </Dialog>
  );
}
