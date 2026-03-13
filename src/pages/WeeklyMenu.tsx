import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { USE_TID4K_BACKEND } from '@/api/config';
import { getMeniuriTID4K, type TID4KMenuEntry } from '@/api/menu';
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
// VIEWER TID4K - afiseaza meniurile HTML din baza de date TID4K
// ============================================================================
function TID4KMenuViewer({ embedded }: { embedded?: boolean }) {
  const [meniuri, setMeniuri] = useState<TID4KMenuEntry[]>([]);
  const [indexCurent, setIndexCurent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMeniuriTID4K().then(data => {
      setMeniuri(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (meniuri.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nu sunt meniuri disponibile.
        </CardContent>
      </Card>
    );
  }

  const meniu = meniuri[indexCurent];
  const dataExp = meniu.data_expirare ? new Date(meniu.data_expirare) : null;

  // Calculeaza lunea saptamanii din data_expirare (vineri) - 4 zile
  const getLuniVineri = () => {
    if (!dataExp) return '';
    const luni = new Date(dataExp);
    luni.setDate(dataExp.getDate() - 4);
    return `${format(luni, 'd MMMM', { locale: ro })} – ${format(dataExp, 'd MMMM yyyy', { locale: ro })}`;
  };

  return (
    <div className={embedded ? '' : 'space-y-4'}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Meniu Saptamanal</h1>
        </div>
      )}

      {/* Navigare saptamani */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={indexCurent >= meniuri.length - 1}
              onClick={() => setIndexCurent(i => Math.min(i + 1, meniuri.length - 1))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
            </Button>
            <CardTitle className="text-base font-display">
              {getLuniVineri()}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              disabled={indexCurent <= 0}
              onClick={() => setIndexCurent(i => Math.max(i - 1, 0))}
            >
              Urmator <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Render HTML meniu din TID4K */}
          <div
            className="tid4k-meniu-html overflow-x-auto text-sm"
            dangerouslySetInnerHTML={{ __html: meniu.continut || '' }}
          />
        </CardContent>
      </Card>
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
                          {nut.kcal > 0 ? (
                            <div className="space-y-1">
                              <div className={cn('font-bold font-mono text-sm rounded px-2 py-1 inline-block border', STATUS_COLORS[status])}>
                                {nut.kcal} kcal
                              </div>
                              <div className="text-muted-foreground text-[10px] space-x-2">
                                <span>P:{nut.protein}g</span>
                                <span>G:{nut.fat}g</span>
                                <span>C:{nut.carbs}g</span>
                              </div>
                              {status === 'red' && target && (
                                <div className="text-destructive text-[10px] flex items-center justify-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {nut.kcal < target.min ? `Sub limita de ${target.min}` : `Peste limita de ${target.max}`}
                                </div>
                              )}
                            </div>
                          ) : (
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

      {/* Target reference */}
      {menuWeek && target && (
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', 'bg-emerald-500')} />
              <span>OK: {target.min}–{target.max} kcal/zi ({target.label})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', 'bg-amber-500')} />
              <span>Aproape de limită</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', 'bg-red-500')} />
              <span>Depășire / sub limită</span>
            </div>
            <span className="text-muted-foreground ml-auto text-xs">Conform OMS 541/2025</span>
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
                  <CommandGroup>
                    <ScrollArea className="h-[200px]">
                      {nutRef
                        .filter(r => r.ingredient_name.toLowerCase().includes(ingSearch.toLowerCase()))
                        .slice(0, 30)
                        .map(r => (
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
                    </ScrollArea>
                  </CommandGroup>
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
