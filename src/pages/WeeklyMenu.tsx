import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { USE_TID4K_BACKEND } from '@/api/config';
import { getMeniuStructurat, type MeniuStructurat } from '@/api/menu';
import {
  getMenuWeek, ensureMenuWeek, getNutritionalReference, addDish, addIngredient,
  updateIngredient, deleteIngredient, deleteDish, updateDishName, publishMenu,
  unpublishMenu, updateAgeGroup, computeDayNutrition, getCalorieStatus,
  checkBannedIngredients, AGE_GROUP_TARGETS, computeMacroBalance,
  getWeeklyOmsClassification, getRefCategories, CATEGORY_LABELS,
  type MenuWeek, type NutritionalRef, type Meal, type Dish, type DishIngredient,
} from '@/api/menuOms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Save, Printer, ChevronLeft, ChevronRight, CalendarIcon, Plus, Trash2, AlertTriangle,
  Check, Eye, EyeOff, Send, Undo2, ChefHat, Scale, ShieldAlert, FileText, Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { ro } from 'date-fns/locale';

const DAYS = [
  { num: 1, label: 'Luni' },
  { num: 2, label: 'Marți' },
  { num: 3, label: 'Miercuri' },
  { num: 4, label: 'Joi' },
  { num: 5, label: 'Vineri' },
];

const MEAL_TYPES = [
  { key: 'mic_dejun' as const, label: 'Mic dejun', emoji: '🌅' },
  { key: 'gustare_1' as const, label: 'Gustare', emoji: '🍎' },
  { key: 'pranz' as const, label: 'Prânz', emoji: '🍽️' },
  { key: 'gustare_2' as const, label: 'Gustare', emoji: '🍪' },
];

function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

function formatWeekLabel(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return `${format(monday, 'd MMMM', { locale: ro })} – ${format(friday, 'd MMMM yyyy', { locale: ro })}`;
}

const STATUS_COLORS = {
  green: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  yellow: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  gray: 'bg-muted text-muted-foreground border-border',
};

// ============================================================================
// VIEWER TID4K - afiseaza meniul structurat (parsat din HTML pe server)
// Replica interfata Lovable: tabel mese x zile, alergeni, semnaturi
// ============================================================================

const ZILE_LABEL: Record<string, string> = {
  luni: 'Luni', marti: 'Marți', miercuri: 'Miercuri', joi: 'Joi', vineri: 'Vineri',
};
const ZILE_ORDINE = ['luni', 'marti', 'miercuri', 'joi', 'vineri'];

// Culorile zilelor din editorul vechi (identice cu tabel_meniu_afisat.php)
const ZILE_CULORI: Record<string, string> = {
  luni: '#FF00FF', marti: '#32CD32', miercuri: '#FFA500', joi: '#1E90FF', vineri: '#FF69B4',
};

// Lunile în română pentru date calendaristice
const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie',
  'iulie','august','septembrie','octombrie','noiembrie','decembrie'];

/**
 * Calculează datele calendaristice Luni-Vineri din data_expirare (care e vineri)
 * Returnează: { luni: "09 martie", marti: "10 martie", ... }
 */
function calculeazaDateZile(dataExpirare: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!dataExpirare) return result;
  // data_expirare poate fi "2026-03-13" sau "2026-03-13 23:59:59"
  const vineri = new Date(dataExpirare.split(' ')[0] + 'T12:00:00');
  if (isNaN(vineri.getTime())) return result;
  // Luni = Vineri - 4 zile, Marți = Vineri - 3, etc.
  const offset: Record<string, number> = { luni: -4, marti: -3, miercuri: -2, joi: -1, vineri: 0 };
  for (const [zi, diff] of Object.entries(offset)) {
    const d = new Date(vineri);
    d.setDate(vineri.getDate() + diff);
    result[zi] = `${d.getDate()} ${LUNI_RO[d.getMonth()]}`;
  }
  return result;
}

// Alergeni care se evidentiaza (prezenti in meniu)
const ALERGENI_TOTI = [
  'Gluten', 'Lapte', 'Ouă', 'Pește', 'Soia', 'Arahide',
  'Fructe cu coajă', 'Țelină', 'Muștar', 'Susan', 'Sulfați', 'Lupin', 'Moluște', 'Crustacee',
];

function TID4KMenuViewer({ embedded }: { embedded?: boolean }) {
  const [meniu, setMeniu] = useState<MeniuStructurat | null>(null);
  const [indexCurent, setIndexCurent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(true);
  const [showNutrienti, setShowNutrienti] = useState(false);
  const [showKcal, setShowKcal] = useState(false);

  const loadMeniu = useCallback(async (idx: number) => {
    setLoading(true);
    const data = await getMeniuStructurat(idx);
    setMeniu(data);
    setIndexCurent(idx);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMeniu(0);
  }, [loadMeniu]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!meniu) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nu sunt meniuri disponibile.
        </CardContent>
      </Card>
    );
  }

  const totalMeniuri = meniu.total_meniuri || 1;

  // Datele calendaristice per zi (calculate din data_expirare)
  const dateZile = calculeazaDateZile(meniu.data_expirare);

  // Determina alergenii unici (normalizati) pentru highlight
  const alergeniActivi = new Set(
    (meniu.alergeni_unici || []).map(a => a.toLowerCase().trim())
  );

  // Verificam daca avem calorii per zi individuale (nu doar media)
  const areCaloriiPerZi = meniu.calorii_per_zi && Object.keys(meniu.calorii_per_zi).length > 0;

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-4'}>
      {/* Navigare saptamani */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={indexCurent >= totalMeniuri - 1}
          onClick={() => loadMeniu(indexCurent + 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="text-center">
          <span className="text-sm font-display font-bold">
            Săptămâna {meniu.saptamana}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={indexCurent <= 0}
            onClick={() => loadMeniu(indexCurent - 1)}
          >
            Următor <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Toggle-uri: Emoji, Nutrienți, kcal/zi */}
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showEmoji} onCheckedChange={setShowEmoji} />
          <span className="font-medium">Emoji</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showNutrienti} onCheckedChange={setShowNutrienti} />
          <span className="font-medium">Nutrienți</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showKcal} onCheckedChange={setShowKcal} />
          <span className="font-medium">kcal/zi</span>
        </label>
      </div>

      {/* Tabel meniu structurat */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-muted/60">
                  <th className="border p-2.5 text-left w-20 text-xs font-bold">Ora</th>
                  {ZILE_ORDINE.map(zi => (
                    <th key={zi} className="border p-2.5 text-center text-xs font-bold" style={{ color: ZILE_CULORI[zi] }}>
                      <div>{ZILE_LABEL[zi]}</div>
                      {dateZile[zi] && (
                        <div className="font-normal text-[10px] opacity-80">({dateZile[zi]})</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(meniu.mese || []).map(masa => (
                  <tr key={masa.masa}>
                    <td className="border p-2.5 font-medium bg-muted/50 text-xs align-top whitespace-nowrap text-center">
                      <div className="font-bold text-sm">{masa.ora}</div>
                      <div className="text-[10px] text-muted-foreground">{masa.label}</div>
                    </td>
                    {ZILE_ORDINE.map(zi => {
                      let text = masa.zile[zi] || '';
                      // Curatam emoji daca toggle-ul e off
                      if (!showEmoji) {
                        text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}]/gu, '').trim();
                      }
                      return (
                        <td key={zi} className="border p-2.5 text-xs align-top">
                          {text || <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Rand kcal/zi (vizibil doar cu toggle, doar daca avem date per zi) */}
                {showKcal && areCaloriiPerZi && (
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold">
                      <td className="border p-2.5 text-xs font-bold text-center">
                        <Scale className="h-3.5 w-3.5 inline mr-1" />kcal
                      </td>
                      {ZILE_ORDINE.map(zi => {
                        const val = meniu.calorii_per_zi?.[zi];
                        return (
                          <td key={zi} className="border p-2.5 text-center text-xs">
                            {val ? (
                              <span className="font-bold">{val} kcal</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Valori nutriționale medie/zi (vizibil doar cu toggle) */}
      {showNutrienti && (() => {
        const nm = meniu.nutrienti_medie || {};
        const NUTRIENTI_ITEMS: Array<{ label: string; cheie: string; unitate: string }> = [
          { label: 'Calorii', cheie: 'calorii', unitate: 'kcal' },
          { label: 'Proteine', cheie: 'proteine', unitate: 'g' },
          { label: 'Lipide', cheie: 'lipide', unitate: 'g' },
          { label: 'Carbohidrați', cheie: 'carbohidrati', unitate: 'g' },
          { label: 'Glucide', cheie: 'glucide', unitate: 'g' },
        ];
        const areDate = NUTRIENTI_ITEMS.some(item => nm[item.cheie]?.valoare);
        if (!areDate) return null;
        return (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-display font-bold mb-3">
                Nutrienți și Calorii (medie/zi)
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {NUTRIENTI_ITEMS.map(item => {
                  const val = nm[item.cheie]?.valoare;
                  if (!val) return null;
                  return (
                    <div key={item.cheie} className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{item.label}:</span>
                      <span className="font-bold">{val} {item.unitate}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Alergeni prezenti */}
      {meniu.alergeni_unici && meniu.alergeni_unici.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-display font-bold mb-3">Alergeni prezenți</h3>
            <div className="flex flex-wrap gap-2">
              {ALERGENI_TOTI.map(alergen => {
                const esteActiv = alergeniActivi.has(alergen.toLowerCase());
                return (
                  <Badge
                    key={alergen}
                    variant={esteActiv ? 'default' : 'outline'}
                    className={cn(
                      'text-xs',
                      esteActiv
                        ? 'bg-amber-500/20 text-amber-700 border-amber-500/40'
                        : 'text-muted-foreground/50 border-muted/50'
                    )}
                  >
                    {alergen}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semnaturi */}
      {meniu.semnaturi && Object.keys(meniu.semnaturi).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              {Object.entries(meniu.semnaturi).map(([functie, nume]) => (
                <div key={functie}>
                  <span className="text-muted-foreground capitalize">
                    {functie.replace(/_/g, ' ')}:
                  </span>{' '}
                  <span className="font-semibold">{nume}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referință OMS */}
      <div className="text-[11px] text-muted-foreground text-left px-1">
        <a
          href="https://legislatie.just.ro/Public/DetaliiDocument/304795"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline hover:text-primary transition-colors"
        >
          Referință: Ordinul MS 1.582/2025 — 1290–1660 kcal/zi (copii 4-6 ani)
        </a>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTA PRINCIPALA - alege intre viewer TID4K si editor OMS
// ============================================================================
export default function WeeklyMenu({ embedded }: { embedded?: boolean }) {
  // Daca backend-ul TID4K e activ, afiseaza viewer-ul cu date reale
  if (USE_TID4K_BACKEND) {
    return <TID4KMenuViewer embedded={embedded} />;
  }

  return <WeeklyMenuOMS embedded={embedded} />;
}

function WeeklyMenuOMS({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [monday, setMonday] = useState(() => getMondayOfWeek(new Date()));
  const [menuWeek, setMenuWeek] = useState<MenuWeek | null>(null);
  const [nutRef, setNutRef] = useState<NutritionalRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDishDialog, setAddDishDialog] = useState<{ day: number; mealType: string } | null>(null);
  const [addIngDialog, setAddIngDialog] = useState<{ dishId: string; dishName: string } | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [selectedIngRef, setSelectedIngRef] = useState<NutritionalRef | null>(null);
  const [ingGrams, setIngGrams] = useState('100');
  const [ingSearch, setIngSearch] = useState('');

  const canEdit = user && (areRol(user.status, 'profesor') || areRol(user.status, 'director') || areRol(user.status, 'administrator'));

  const weekKey = format(monday, 'yyyy-MM-dd');

  const refMap = useMemo(() => {
    const m = new Map<string, NutritionalRef>();
    nutRef.forEach(r => m.set(r.id, r));
    return m;
  }, [nutRef]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [mw, refs] = await Promise.all([getMenuWeek(weekKey), getNutritionalReference()]);
    setMenuWeek(mw);
    setNutRef(refs);
    setLoading(false);
  }, [weekKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // Create menu week if doesn't exist
  const handleCreateWeek = async () => {
    const mw = await ensureMenuWeek(weekKey);
    setMenuWeek(mw);
    toast.success('Meniu creat pentru această săptămână');
  };

  // Add dish
  const handleAddDish = async () => {
    if (!menuWeek?.id || !addDishDialog || !newDishName.trim()) return;
    await addDish(menuWeek.id, addDishDialog.day, addDishDialog.mealType, newDishName.trim());
    setAddDishDialog(null);
    setNewDishName('');
    await loadData();
    toast.success('Fel adăugat');
  };

  // Add ingredient
  const handleAddIngredient = async () => {
    if (!addIngDialog || !selectedIngRef) return;
    const grams = Number(ingGrams) || 0;
    if (grams <= 0) { toast.error('Cantitatea trebuie să fie > 0'); return; }

    if (selectedIngRef.is_banned) {
      toast.error(`⚠️ ${selectedIngRef.ingredient_name} este INTERZIS: ${selectedIngRef.ban_reason}`);
      return;
    }

    await addIngredient(addIngDialog.dishId, selectedIngRef.id, selectedIngRef.ingredient_name, grams);
    setAddIngDialog(null);
    setSelectedIngRef(null);
    setIngGrams('100');
    setIngSearch('');
    await loadData();
    toast.success('Ingredient adăugat');
  };

  // Delete dish
  const handleDeleteDish = async (dishId: string) => {
    await deleteDish(dishId);
    await loadData();
    toast.success('Fel șters');
  };

  // Delete ingredient
  const handleDeleteIngredient = async (ingId: string) => {
    await deleteIngredient(ingId);
    await loadData();
  };

  // Publish
  const handlePublish = async () => {
    if (!menuWeek?.id) return;
    await publishMenu(menuWeek.id);
    await loadData();
    toast.success('Meniu publicat! Este vizibil pe display și QR.');
  };

  const handleUnpublish = async () => {
    if (!menuWeek?.id) return;
    await unpublishMenu(menuWeek.id);
    await loadData();
    toast.info('Meniu retras din publicare');
  };

  // Age group change
  const handleAgeGroupChange = async (ag: string) => {
    if (!menuWeek?.id) return;
    await updateAgeGroup(menuWeek.id, ag);
    await loadData();
  };

  // Navigate weeks
  const prevWeek = () => setMonday(addWeeks(monday, -1));
  const nextWeek = () => setMonday(addWeeks(monday, 1));

  // Computed
  const meals = menuWeek?.meals || [];
  const ageGroup = menuWeek?.age_group || '4-5';
  const target = AGE_GROUP_TARGETS[ageGroup];
  const bannedWarnings = checkBannedIngredients(meals, refMap);
  const omsClassification = menuWeek ? getWeeklyOmsClassification(meals, ageGroup, refMap) : null;

  const OMS_BADGE_STYLES: Record<string, string> = {
    verde: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
    galben: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
    rosu: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40',
    gol: 'bg-muted text-muted-foreground border-border',
  };

  const OMS_BADGE_LABELS: Record<string, string> = {
    verde: '✅ Conform OMS',
    galben: '⚠️ Atenție OMS',
    rosu: '❌ Neconform OMS',
    gol: '📋 Incomplet',
  };

  // Get meals for a specific cell
  const getMealDishes = (day: number, mealType: string): Dish[] => {
    const meal = meals.find(m => m.day_of_week === day && m.meal_type === mealType);
    return meal?.dishes || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
            <ChefHat className="h-6 w-6" /> Meniu OMS Săptămânal
          </h1>
          <p className="text-muted-foreground text-sm">{formatWeekLabel(monday)}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[200px] text-center">{formatWeekLabel(monday)}</span>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={monday}
              onSelect={(date) => { if (date) setMonday(getMondayOfWeek(date)); }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-2">
          {menuWeek && (
            <Select value={ageGroup} onValueChange={handleAgeGroupChange}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGE_GROUP_TARGETS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {menuWeek && canEdit && (
            menuWeek.status === 'draft' ? (
              <Button size="sm" className="gap-2" onClick={handlePublish}>
                <Send className="h-4 w-4" /> Publică
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={handleUnpublish}>
                <Undo2 className="h-4 w-4" /> Retrage
              </Button>
            )
          )}
          {menuWeek && (
            <Badge variant={menuWeek.status === 'published' ? 'default' : 'secondary'}>
              {menuWeek.status === 'published' ? '✅ Publicat' : '📝 Draft'}
            </Badge>
          )}
          {omsClassification && omsClassification.classification !== 'gol' && (
            <Badge variant="outline" className={cn('gap-1 text-xs', OMS_BADGE_STYLES[omsClassification.classification])}>
              <Award className="h-3 w-3" />
              {OMS_BADGE_LABELS[omsClassification.classification]}
            </Badge>
          )}
          {menuWeek && (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          )}
        </div>
      </div>

      {/* No menu yet */}
      {!menuWeek && canEdit && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nu există meniu pentru această săptămână.</p>
            <Button onClick={handleCreateWeek} className="gap-2">
              <Plus className="h-4 w-4" /> Creează Meniu
            </Button>
          </CardContent>
        </Card>
      )}

      {!menuWeek && !canEdit && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nu există meniu publicat pentru această săptămână.</p>
          </CardContent>
        </Card>
      )}

      {/* Banned warnings */}
      {bannedWarnings.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
              <ShieldAlert className="h-5 w-5" /> Ingrediente INTERZISE detectate!
            </div>
            {bannedWarnings.map((w, i) => (
              <p key={i} className="text-sm text-destructive/80 ml-7">
                • <strong>{w.ingredientName}</strong> în „{w.dishName}" — {w.reason}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly Grid */}
      {menuWeek && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border border-primary/30 p-2.5 text-left w-24 text-xs">Masa</th>
                    {DAYS.map(d => {
                      const dayNut = computeDayNutrition(meals, d.num);
                      const status = getCalorieStatus(dayNut.kcal, ageGroup);
                      return (
                        <th key={d.num} className="border border-primary/30 p-2.5 text-center text-xs">
                          <div>{d.label}</div>
                          {dayNut.kcal > 0 && (
                            <Badge variant="outline" className={cn('mt-1 text-[10px] font-mono', STATUS_COLORS[status])}>
                              {dayNut.kcal} kcal
                            </Badge>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {MEAL_TYPES.map(meal => (
                    <tr key={meal.key}>
                      <td className="border p-2.5 font-medium bg-muted/50 text-xs align-top">
                        <div>{meal.emoji}</div>
                        <div>{meal.label}</div>
                      </td>
                      {DAYS.map(day => {
                        const dishes = getMealDishes(day.num, meal.key);
                        return (
                          <td key={day.num} className="border p-2 align-top text-xs">
                            {dishes.map(dish => (
                              <div key={dish.id} className="mb-2 last:mb-0">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="font-semibold text-foreground">{dish.dish_name}</span>
                                  {canEdit && (
                                    <button onClick={() => handleDeleteDish(dish.id!)} className="text-destructive/50 hover:text-destructive ml-auto">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                {dish.ingredients.length > 0 && (
                                  <div className="space-y-0.5 text-muted-foreground text-[11px]">
                                    {dish.ingredients.map(ing => (
                                      <div key={ing.id} className="flex items-center gap-1 group">
                                        <span>{ing.ingredient_name} ({ing.quantity_grams}g)</span>
                                        <span className="text-[10px] font-mono opacity-60 ml-auto">{Math.round(ing.kcal || 0)}kcal</span>
                                        {canEdit && (
                                          <button onClick={() => handleDeleteIngredient(ing.id!)} className="opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive">
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {canEdit && (
                                  <button
                                    onClick={() => setAddIngDialog({ dishId: dish.id!, dishName: dish.dish_name })}
                                    className="text-[10px] text-primary/60 hover:text-primary mt-1 flex items-center gap-0.5"
                                  >
                                    <Plus className="h-2.5 w-2.5" /> ingredient
                                  </button>
                                )}
                              </div>
                            ))}
                            {canEdit && (
                              <button
                                onClick={() => setAddDishDialog({ day: day.num, mealType: meal.key })}
                                className="text-[11px] text-primary/50 hover:text-primary flex items-center gap-1 mt-1"
                              >
                                <Plus className="h-3 w-3" /> Adaugă fel
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-muted/30">
                    <td className="border p-2.5 font-bold text-xs">
                      <Scale className="h-4 w-4 inline mr-1" /> Total / zi
                    </td>
                    {DAYS.map(day => {
                      const nut = computeDayNutrition(meals, day.num);
                      const status = getCalorieStatus(nut.kcal, ageGroup);
                      return (
                        <td key={day.num} className={cn('border p-2.5 text-center text-xs')}>
                          {nut.kcal > 0 ? (() => {
                            const macro = computeMacroBalance(nut);
                            return (
                              <div className="space-y-1">
                                <div className={cn('font-bold font-mono text-sm rounded px-2 py-1 inline-block border', STATUS_COLORS[status])}>
                                  {nut.kcal} kcal
                                </div>
                                <div className="text-muted-foreground text-[10px] space-x-2">
                                  <span className={cn(macro.protein_status === 'red' && 'text-destructive font-bold')}>P:{nut.protein}g ({macro.protein_pct}%)</span>
                                  <span className={cn(macro.fat_status === 'red' && 'text-destructive font-bold')}>L:{nut.fat}g ({macro.fat_pct}%)</span>
                                  <span className={cn(macro.carbs_status === 'red' && 'text-destructive font-bold')}>G:{nut.carbs}g ({macro.carbs_pct}%)</span>
                                </div>
                                {status === 'red' && target && (
                                  <div className="text-destructive text-[10px] flex items-center justify-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {nut.kcal < target.min ? `Sub limita de ${target.min}` : `Peste limita de ${target.max}`}
                                  </div>
                                )}
                              </div>
                            );
                          })() : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OMS Classification & Target reference */}
      {menuWeek && target && (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>OK: {target.min}–{target.max} kcal/zi ({target.label})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Aproape de limită</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Depășire / sub limită</span>
              </div>
              <span className="text-muted-foreground ml-auto text-xs">Conform OMS 541/2025</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Macro OMS: </span>
              Proteine 10-15% · Lipide 25-35% · Glucide 50-60% din kcal total
            </div>
            {omsClassification && omsClassification.reasons.length > 0 && omsClassification.classification !== 'verde' && (
              <div className="text-xs space-y-0.5">
                {omsClassification.reasons.map((r, i) => (
                  <p key={i} className={cn(
                    omsClassification.classification === 'rosu' ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                  )}>• {r}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Add Dish Dialog ── */}
      <Dialog open={!!addDishDialog} onOpenChange={(o) => !o && setAddDishDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă fel de mâncare</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Numele felului</Label>
              <Input
                placeholder="ex: Supă de pui cu fidea"
                value={newDishName}
                onChange={e => setNewDishName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDish()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDishDialog(null)}>Anulează</Button>
            <Button onClick={handleAddDish} disabled={!newDishName.trim()}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Ingredient Dialog ── */}
      <Dialog open={!!addIngDialog} onOpenChange={(o) => !o && setAddIngDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă ingredient la „{addIngDialog?.dishName}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Ingredient search */}
            <div>
              <Label>Ingredient din baza de date</Label>
              <Command className="border rounded-lg mt-1">
                <CommandInput
                  placeholder="Caută ingredient..."
                  value={ingSearch}
                  onValueChange={setIngSearch}
                />
                <CommandList>
                  <CommandEmpty>Nu s-a găsit. Verifică ortografia.</CommandEmpty>
                  <ScrollArea className="h-[250px]">
                    {getRefCategories(nutRef).map(cat => {
                      const items = nutRef
                        .filter(r => r.category === cat && r.ingredient_name.toLowerCase().includes(ingSearch.toLowerCase()));
                      if (items.length === 0) return null;
                      return (
                        <CommandGroup key={cat} heading={CATEGORY_LABELS[cat] || cat}>
                          {items.slice(0, 15).map(r => (
                            <CommandItem
                              key={r.id}
                              value={r.ingredient_name}
                              onSelect={() => setSelectedIngRef(r)}
                              className={cn(
                                'cursor-pointer',
                                r.is_banned && 'text-destructive line-through opacity-60',
                                selectedIngRef?.id === r.id && 'bg-primary/10'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {selectedIngRef?.id === r.id && <Check className="h-3 w-3 inline mr-1" />}
                                  {r.ingredient_name}
                                  {r.is_banned && ' ⛔'}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {r.calories_per_100g}kcal/100g
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </ScrollArea>
                </CommandList>
              </Command>
            </div>

            {selectedIngRef && (
              <>
                {selectedIngRef.is_banned && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                    <ShieldAlert className="h-4 w-4 inline mr-1" />
                    INTERZIS: {selectedIngRef.ban_reason}
                  </div>
                )}
                <div>
                  <Label>Cantitate (grame)</Label>
                  <Input
                    type="number"
                    value={ingGrams}
                    onChange={e => setIngGrams(e.target.value)}
                    min={1}
                  />
                  {Number(ingGrams) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {Math.round((selectedIngRef.calories_per_100g * Number(ingGrams)) / 100)} kcal,{' '}
                      P: {((selectedIngRef.protein * Number(ingGrams)) / 100).toFixed(1)}g,{' '}
                      G: {((selectedIngRef.fat * Number(ingGrams)) / 100).toFixed(1)}g,{' '}
                      C: {((selectedIngRef.carbs * Number(ingGrams)) / 100).toFixed(1)}g
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddIngDialog(null); setSelectedIngRef(null); setIngSearch(''); }}>
              Anulează
            </Button>
            <Button onClick={handleAddIngredient} disabled={!selectedIngRef || selectedIngRef.is_banned || Number(ingGrams) <= 0}>
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
