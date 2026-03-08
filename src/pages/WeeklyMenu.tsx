import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { getMenu, saveMenu } from '@/api/menu';
import type { WeeklyMenu as WeeklyMenuType, MenuItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Save, Printer, ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const DAY_INDEX_MAP: Record<number, string> = { 1: 'Luni', 2: 'Marți', 3: 'Miercuri', 4: 'Joi', 5: 'Vineri' };

function getTodayName(): string | null {
  const dow = new Date().getDay();
  return DAY_INDEX_MAP[dow] || null;
}
const MEALS: { key: MenuItem['masa']; label: string }[] = [
  { key: 'mic_dejun', label: 'Mic dejun' },
  { key: 'gustare_1', label: 'Gustare 1' },
  { key: 'pranz', label: 'Prânz' },
  { key: 'gustare_2', label: 'Gustare 2' },
];

const ALLERGENS = ['Gluten', 'Lapte', 'Ouă', 'Pește', 'Soia', 'Arahide', 'Fructe cu coajă', 'Țelină', 'Muștar', 'Susan', 'Sulfați', 'Lupin', 'Moluște', 'Crustacee'];

const MONTHS_RO = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];

function formatWeekLabel(weekStr: string): string {
  const [yearStr, wStr] = weekStr.split('-W');
  const year = Number(yearStr);
  const week = Number(wStr);
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

function dateToISOWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function isoWeekToMonday(weekStr: string): Date {
  const [yearStr, wStr] = weekStr.split('-W');
  const year = Number(yearStr);
  const week = Number(wStr);
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

export default function WeeklyMenu({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [menu, setMenu] = useState<WeeklyMenuType | null>(null);
  const [week, setWeek] = useState(() => dateToISOWeek(new Date()));
  const [showEmoji, setShowEmoji] = useState(() => localStorage.getItem('tid4k_emoji') !== 'false');
  const [showNutrients, setShowNutrients] = useState(() => localStorage.getItem('tid4k_nutrients') !== 'false');
  const [showKcal, setShowKcal] = useState(() => localStorage.getItem('tid4k_kcal') !== 'false');
  const todayName = dateToISOWeek(new Date()) === week ? getTodayName() : null;
  const isToday = (d: string) => d === todayName;
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const canEdit = user && (areRol(user.status, 'administrator') || areRol(user.status, 'director') || areRol(user.status, 'profesor'));

  useEffect(() => { getMenu(week).then(setMenu); }, [week]);

  useEffect(() => { localStorage.setItem('tid4k_emoji', String(showEmoji)); }, [showEmoji]);
  useEffect(() => { localStorage.setItem('tid4k_nutrients', String(showNutrients)); }, [showNutrients]);
  useEffect(() => { localStorage.setItem('tid4k_kcal', String(showKcal)); }, [showKcal]);

  const getCellContent = (masa: MenuItem['masa'], zi: string) => {
    const item = menu?.items.find((i) => i.masa === masa && i.zi === zi);
    if (!item) return '';
    return showEmoji ? item.continut : item.continut.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
  };

  const updateCell = (masa: MenuItem['masa'], zi: string, value: string) => {
    if (!menu) return;
    setMenu({
      ...menu,
      items: menu.items.map((i) => i.masa === masa && i.zi === zi ? { ...i, continut: value } : i),
    });
    setHasChanges(true);
    setEditingCell(null);
  };

  const handleSave = async () => {
    if (!menu) return;
    await saveMenu(menu);
    setHasChanges(false);
    toast.success('Meniul a fost salvat!');
  };

  const getKcalColor = (kcal: number) => {
    if (kcal >= 1290 && kcal <= 1660) return 'text-success';
    if (kcal >= 1200 && kcal <= 1750) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col gap-3">
        {!embedded && (
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Meniul Săptămânal</h1>
            <p className="text-muted-foreground text-sm">{formatWeekLabel(week)}</p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
            const [y, w] = week.split('-W').map(Number);
            setWeek(`${y}-W${String(w - 1).padStart(2, '0')}`);
          }}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium min-w-[200px] text-center">{formatWeekLabel(week)}</span>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => {
            const [y, w] = week.split('-W').map(Number);
            setWeek(`${y}-W${String(w + 1).padStart(2, '0')}`);
          }}><ChevronRight className="h-4 w-4" /></Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={isoWeekToMonday(week)}
                onSelect={(date) => {
                  if (date) setWeek(dateToISOWeek(date));
                }}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" className="gap-2 ml-auto"><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={showEmoji} onCheckedChange={setShowEmoji} id="emoji" />
          <Label htmlFor="emoji" className="text-sm">Emoji</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showNutrients} onCheckedChange={setShowNutrients} id="nutrients" />
          <Label htmlFor="nutrients" className="text-sm">Nutrienți</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showKcal} onCheckedChange={setShowKcal} id="kcal" />
          <Label htmlFor="kcal" className="text-sm">kcal/zi</Label>
        </div>
      </div>

      {/* Menu Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto -mx-px">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="border border-primary/30 p-2.5 text-left w-24 text-xs">Masa</th>
                  {DAYS.map((d) => (
                    <th key={d} className={cn("border border-primary/30 p-2.5 text-center font-medium text-xs", isToday(d) && "bg-primary-foreground/15 ring-2 ring-inset ring-primary-foreground/30")}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEALS.map((meal) => (
                  <tr key={meal.key}>
                    <td className="border p-2.5 font-medium bg-muted/50 text-xs">{meal.label}</td>
                    {DAYS.map((zi) => {
                      const cellKey = `${meal.key}-${zi}`;
                      const content = getCellContent(meal.key, zi);
                      return (
                        <td
                          key={cellKey}
                          className={cn("border p-2.5 text-xs leading-relaxed cursor-pointer hover:bg-muted/30 transition-colors", isToday(zi) && "bg-primary/5 border-primary/20")}
                          onDoubleClick={() => isAdmin && setEditingCell(cellKey)}
                        >
                          {editingCell === cellKey ? (
                            <Input
                              defaultValue={content}
                              autoFocus
                              onBlur={(e) => updateCell(meal.key, zi, e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && updateCell(meal.key, zi, (e.target as HTMLInputElement).value)}
                              className="text-xs h-8"
                            />
                          ) : (
                            content || <span className="text-muted-foreground italic">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {showKcal && menu && (
                  <tr>
                    <td className="border p-2.5 font-medium bg-muted/50 text-xs">kcal/zi</td>
                    {DAYS.map((zi) => {
                      const nut = menu.nutritional.find((n) => n.zi === zi);
                      return (
                        <td key={zi} className={cn("border p-2.5 text-center", isToday(zi) && "bg-primary/5 border-primary/20")}>
                          <span className={`font-mono font-bold text-xs ${nut ? getKcalColor(nut.kcal) : ''}`}>
                            {nut?.kcal || '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Nutritional Section */}
      {showNutrients && menu && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Valori nutriționale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-px">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border border-primary/30 p-2 text-left text-xs">Nutrient</th>
                    {DAYS.map((d) => <th key={d} className={cn("border border-primary/30 p-2 text-center text-xs", isToday(d) && "bg-primary-foreground/15 ring-2 ring-inset ring-primary-foreground/30")}>{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(['kcal', 'carbohidrati', 'proteine', 'grasimi', 'fibre'] as const).map((key) => (
                    <tr key={key}>
                      <td className="border p-2 font-medium capitalize text-xs">{key === 'kcal' ? 'Calorii (kcal)' : key.charAt(0).toUpperCase() + key.slice(1) + ' (g)'}</td>
                      {DAYS.map((zi) => {
                        const nut = menu.nutritional.find((n) => n.zi === zi);
                        return <td key={zi} className={cn("border p-2 text-center font-mono text-xs", isToday(zi) && "bg-primary/5 border-primary/20")}>{nut?.[key] || '—'}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Referință: 1290–1660 kcal/zi (copii 4-6 ani) — Ordinul MS 1582/2025
            </p>
          </CardContent>
        </Card>
      )}

      {/* Allergens */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alergeni prezenți</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(menu?.alergeni || []).map((a) => (
              <Badge key={a} variant="outline" className="bg-warning/10 text-warning border-warning/30">{a}</Badge>
            ))}
            {ALLERGENS.filter((a) => !menu?.alergeni?.includes(a)).map((a) => (
              <Badge key={a} variant="secondary" className="opacity-40">{a}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      {menu && (
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 text-sm">
            <div><span className="text-muted-foreground">Director:</span> <strong>{menu.semnaturi.director}</strong></div>
            <div><span className="text-muted-foreground">Asistent medical:</span> <strong>{menu.semnaturi.asistent_medical}</strong></div>
            <div><span className="text-muted-foreground">Administrator:</span> <strong>{menu.semnaturi.administrator}</strong></div>
          </CardContent>
        </Card>
      )}

      {/* Floating Save */}
      {hasChanges && (
        <div className="fixed bottom-20 right-6 z-50">
          <Button size="lg" className="gap-2 shadow-lg" onClick={handleSave}>
            <Save className="h-4 w-4" /> Salvează Meniul
          </Button>
        </div>
      )}
    </div>
  );
}
