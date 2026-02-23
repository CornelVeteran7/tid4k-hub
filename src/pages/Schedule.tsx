import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { getSchedule } from '@/api/schedule';
import type { ScheduleCell } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Printer } from 'lucide-react';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const HOURS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export default function Schedule() {
  const { currentGroup } = useGroup();
  const [cells, setCells] = useState<ScheduleCell[]>([]);

  useEffect(() => {
    if (currentGroup) getSchedule(currentGroup.id).then(setCells);
  }, [currentGroup]);

  const getCell = (zi: string, ora: string) => cells.find((c) => c.zi === zi && c.ora === ora);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Orar</h1>
          <p className="text-muted-foreground">{currentGroup?.nume}</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Printează
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Program Săptămânal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left w-16">Ora</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border p-2 bg-muted text-center font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hora) => (
                  <tr key={hora}>
                    <td className="border p-2 font-mono text-xs text-muted-foreground">{hora}</td>
                    {DAYS.map((zi) => {
                      const cell = getCell(zi, hora);
                      return (
                        <td
                          key={`${zi}-${hora}`}
                          className="border p-2 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                          style={cell ? { backgroundColor: cell.culoare } : undefined}
                        >
                          {cell ? (
                            <div>
                              <p className="font-medium text-xs">{cell.materie}</p>
                              <p className="text-[10px] text-muted-foreground">{cell.profesor}</p>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
