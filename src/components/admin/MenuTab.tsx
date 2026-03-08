import { useState, useEffect } from 'react';
import { getMenu, saveMenu } from '@/api/menu';
import type { WeeklyMenu, MenuItem, School } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ZILE = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const MESE: { key: MenuItem['masa']; label: string }[] = [
  { key: 'mic_dejun', label: '🥣 Mic dejun' },
  { key: 'gustare_1', label: '🍎 Gustare 1' },
  { key: 'pranz', label: '🍽️ Prânz' },
  { key: 'gustare_2', label: '🍪 Gustare 2' },
];

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

function getWeekString(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  const year = d.getFullYear();
  const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function formatWeekLabel(weekStr: string): string {
  const [yearStr, wStr] = weekStr.split('-W');
  const year = Number(yearStr);
  const week = Number(wStr);
  // ISO week to Monday date
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  const dMon = monday.getDate();
  const dFri = friday.getDate();
  if (monday.getMonth() === friday.getMonth()) {
    return `Săptămâna ${dMon}-${dFri} ${MONTHS_RO[monday.getMonth()]}`;
  }
  return `Săptămâna ${dMon} ${MONTHS_RO[monday.getMonth()]} - ${dFri} ${MONTHS_RO[friday.getMonth()]}`;
}

interface Props {
  schoolId: string;
  schools: School[];
}

export default function MenuTab({ schoolId, schools }: Props) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const [selectedGrupa, setSelectedGrupa] = useState('');
  const week = getWeekString(weekOffset);

  const currentSchool = schools.find(s => s.id.toString() === schoolId);
  const grupe = currentSchool?.grupe || [];

  // Reset group when school changes
  useEffect(() => {
    if (grupe.length) setSelectedGrupa(grupe[0]);
    else setSelectedGrupa('');
  }, [schoolId]);

  useEffect(() => { getMenu(week).then(setMenu); }, [week, selectedGrupa]);

  const getItem = (zi: string, masa: MenuItem['masa']) => menu?.items.find(i => i.zi === zi && i.masa === masa);

  const updateItem = (zi: string, masa: MenuItem['masa'], continut: string) => {
    if (!menu) return;
    const exists = menu.items.find(i => i.zi === zi && i.masa === masa);
    const items = exists
      ? menu.items.map(i => i.zi === zi && i.masa === masa ? { ...i, continut } : i)
      : [...menu.items, { zi, masa, continut }];
    setMenu({ ...menu, items });
  };

  const handleSave = async () => {
    if (!menu) return;
    await saveMenu(menu);
    toast.success('Meniu salvat!');
  };

  if (schoolId === 'all') {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Selectează o școală din filtrul global pentru a edita meniul.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-[200px] text-center">{formatWeekLabel(week)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-3">
          {grupe.length > 0 && (
            <Select value={selectedGrupa} onValueChange={setSelectedGrupa}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Grupă" /></SelectTrigger>
              <SelectContent>{grupe.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button size="sm" className="gap-1.5" onClick={handleSave}><Save className="h-4 w-4" />Salvează</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left text-xs font-medium text-muted-foreground w-28">Masă</th>
                  {ZILE.map(z => <th key={z} className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[140px]">{z}</th>)}
                </tr>
              </thead>
              <tbody>
                {MESE.map(({ key, label }) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="p-2 text-xs font-medium whitespace-nowrap">{label}</td>
                    {ZILE.map(zi => (
                      <td key={zi} className="p-1">
                        <Input
                          placeholder="..."
                          value={getItem(zi, key)?.continut || ''}
                          onChange={e => updateItem(zi, key, e.target.value)}
                          className="h-8 text-xs"
                        />
                      </td>
                    ))}
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
