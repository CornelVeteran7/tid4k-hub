import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { CalendarDay } from '@/api/contributions';

interface Props {
  days: CalendarDay[];
  month: number;
  year: number;
  loading: boolean;
}

const DAY_NAMES = ['Lu', 'Ma', 'Mi', 'Jo', 'Vi'];

export default function AttendanceCalendar({ days, month, year, loading }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPresent = days.filter(d => d.prezent === true).length;
  const totalAbsent = days.filter(d => d.prezent === false).length;
  const totalNoData = days.filter(d => d.prezent === null).length;

  // Group days by week
  const weeks: CalendarDay[][] = [];
  let currentWeek: CalendarDay[] = [];

  // Find the day of week for the first day to add padding
  if (days.length > 0) {
    const firstDate = new Date(days[0].date);
    const firstDow = firstDate.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = firstDow === 0 ? 4 : firstDow - 1; // convert to Mon=0
    for (let i = 0; i < mondayOffset; i++) {
      currentWeek.push({ date: '', prezent: null });
    }
  }

  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 5) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 5) currentWeek.push({ date: '', prezent: null });
    weeks.push(currentWeek);
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <Badge variant="default" className="bg-emerald-600 gap-1">
          ✓ {totalPresent} prezent
        </Badge>
        <Badge variant="secondary" className="gap-1">
          ✗ {totalAbsent} absent
        </Badge>
        {totalNoData > 0 && (
          <Badge variant="outline" className="gap-1">
            — {totalNoData} fără date
          </Badge>
        )}
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-5 gap-1">
            {/* Header */}
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">
                {d}
              </div>
            ))}
            {/* Days */}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                if (!day.date) {
                  return <div key={`${wi}-${di}`} className="h-10" />;
                }
                const dayNum = new Date(day.date).getDate();
                const bgClass =
                  day.prezent === true
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : day.prezent === false
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                    : 'bg-muted/30 text-muted-foreground';

                return (
                  <div
                    key={day.date}
                    className={`h-10 flex items-center justify-center rounded-md text-sm font-medium ${bgClass}`}
                  >
                    {dayNum}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
