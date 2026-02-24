import { useState, useEffect } from 'react';
import { getMenu, saveMenu } from '@/api/menu';
import type { WeeklyMenu, MenuItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const ZILE = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const MESE: { key: MenuItem['masa']; label: string }[] = [
  { key: 'mic_dejun', label: '🥣 Mic dejun' },
  { key: 'gustare_1', label: '🍎 Gustare 1' },
  { key: 'pranz', label: '🍽️ Prânz' },
  { key: 'gustare_2', label: '🍪 Gustare 2' },
];

function getWeekString(offset: number) {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  const year = d.getFullYear();
  const week = Math.ceil(((d.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

export default function MenuTab() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [menu, setMenu] = useState<WeeklyMenu | null>(null);
  const week = getWeekString(weekOffset);

  useEffect(() => { getMenu(week).then(setMenu); }, [week]);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-[100px] text-center">{week}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset(o => o + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleSave}><Save className="h-4 w-4" />Salvează</Button>
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
