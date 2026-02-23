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
import { Save, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const DAYS = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const MEALS: { key: MenuItem['masa']; label: string }[] = [
  { key: 'mic_dejun', label: 'Mic dejun' },
  { key: 'gustare_1', label: 'Gustare 1' },
  { key: 'pranz', label: 'Prânz' },
  { key: 'gustare_2', label: 'Gustare 2' },
];

const ALLERGENS = ['Gluten', 'Lapte', 'Ouă', 'Pește', 'Soia', 'Arahide', 'Fructe cu coajă', 'Țelină', 'Muștar', 'Susan', 'Sulfați', 'Lupin', 'Moluște', 'Crustacee'];

export default function WeeklyMenu() {
  const { user } = useAuth();
  const [menu, setMenu] = useState<WeeklyMenuType | null>(null);
  const [week, setWeek] = useState('2026-W09');
  const [showEmoji, setShowEmoji] = useState(() => localStorage.getItem('tid4k_emoji') !== 'false');
  const [showNutrients, setShowNutrients] = useState(() => localStorage.getItem('tid4k_nutrients') !== 'false');
  const [showKcal, setShowKcal] = useState(() => localStorage.getItem('tid4k_kcal') !== 'false');
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  const isAdmin = user && areRol(user.status, 'administrator');

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Meniul Săptămânal</h1>
          <p className="text-muted-foreground">Săptămâna {week}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => {
            const [y, w] = week.split('-W').map(Number);
            setWeek(`${y}-W${String(w - 1).padStart(2, '0')}`);
          }}><ChevronLeft className="h-4 w-4" /></Button>
          <Input value={week} onChange={(e) => setWeek(e.target.value)} className="w-32 text-center font-mono" />
          <Button variant="outline" size="icon" onClick={() => {
            const [y, w] = week.split('-W').map(Number);
            setWeek(`${y}-W${String(w + 1).padStart(2, '0')}`);
          }}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" className="gap-2"><Printer className="h-4 w-4" /> Print</Button>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Switch checked={showEmoji} onCheckedChange={setShowEmoji} id="emoji" />
          <Label htmlFor="emoji">Emoji</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showNutrients} onCheckedChange={setShowNutrients} id="nutrients" />
          <Label htmlFor="nutrients">Nutrienți</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showKcal} onCheckedChange={setShowKcal} id="kcal" />
          <Label htmlFor="kcal">kcal/zi</Label>
        </div>
      </div>

      {/* Menu Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="border border-primary/30 p-3 text-left w-28">Masa</th>
                  {DAYS.map((d) => (
                    <th key={d} className="border border-primary/30 p-3 text-center font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MEALS.map((meal) => (
                  <tr key={meal.key}>
                    <td className="border p-3 font-medium bg-muted/50">{meal.label}</td>
                    {DAYS.map((zi) => {
                      const cellKey = `${meal.key}-${zi}`;
                      const content = getCellContent(meal.key, zi);
                      return (
                        <td
                          key={cellKey}
                          className="border p-3 text-xs leading-relaxed cursor-pointer hover:bg-muted/30 transition-colors min-w-[140px]"
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
                {/* kcal row */}
                {showKcal && menu && (
                  <tr>
                    <td className="border p-3 font-medium bg-muted/50">kcal/zi</td>
                    {DAYS.map((zi) => {
                      const nut = menu.nutritional.find((n) => n.zi === zi);
                      return (
                        <td key={zi} className="border p-3 text-center">
                          <span className={`font-mono font-bold ${nut ? getKcalColor(nut.kcal) : ''}`}>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Valori nutriționale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 bg-muted text-left">Nutrient</th>
                    {DAYS.map((d) => <th key={d} className="border p-2 bg-muted text-center">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(['kcal', 'carbohidrati', 'proteine', 'grasimi', 'fibre'] as const).map((key) => (
                    <tr key={key}>
                      <td className="border p-2 font-medium capitalize">{key === 'kcal' ? 'Calorii (kcal)' : key.charAt(0).toUpperCase() + key.slice(1) + ' (g)'}</td>
                      {DAYS.map((zi) => {
                        const nut = menu.nutritional.find((n) => n.zi === zi);
                        return <td key={zi} className="border p-2 text-center font-mono">{nut?.[key] || '—'}</td>;
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Alergeni prezenți</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(menu?.alergeni || []).map((a) => (
              <Badge key={a} variant="outline">{a}</Badge>
            ))}
            {ALLERGENS.filter((a) => !menu?.alergeni?.includes(a)).map((a) => (
              <Badge key={a} variant="secondary" className="opacity-40">{a}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      {menu && (
        <Card>
          <CardContent className="p-4 flex flex-wrap gap-8 text-sm">
            <div><span className="text-muted-foreground">Director:</span> <strong>{menu.semnaturi.director}</strong></div>
            <div><span className="text-muted-foreground">Asistent medical:</span> <strong>{menu.semnaturi.asistent_medical}</strong></div>
            <div><span className="text-muted-foreground">Administrator:</span> <strong>{menu.semnaturi.administrator}</strong></div>
          </CardContent>
        </Card>
      )}

      {/* Floating Save */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="gap-2 shadow-lg" onClick={handleSave}>
            <Save className="h-4 w-4" /> Salvează Meniul
          </Button>
        </div>
      )}
    </div>
  );
}
