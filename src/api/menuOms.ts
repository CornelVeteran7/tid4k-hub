import { supabase } from '@/integrations/supabase/client';

// ── Types ──
export interface NutritionalRef {
  id: string;
  ingredient_name: string;
  calories_per_100g: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  category: string;
  is_banned: boolean;
  ban_reason: string | null;
}

export interface DishIngredient {
  id?: string;
  menu_dish_id?: string;
  ingredient_ref_id: string | null;
  ingredient_name: string;
  quantity_grams: number;
  // Computed
  kcal?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export interface Dish {
  id?: string;
  menu_meal_id?: string;
  dish_name: string;
  ordine: number;
  ingredients: DishIngredient[];
}

export interface Meal {
  id?: string;
  menu_week_id?: string;
  day_of_week: number; // 1-5
  meal_type: 'mic_dejun' | 'gustare_1' | 'pranz' | 'gustare_2';
  dishes: Dish[];
}

export interface MenuWeek {
  id?: string;
  organization_id: string | null;
  week_start_date: string; // yyyy-MM-dd (Monday)
  status: 'draft' | 'published';
  age_group: string;
  notes: string;
  meals: Meal[];
}

export interface DayNutrition {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

// OMS 541/2025 calorie targets by age group
export const AGE_GROUP_TARGETS: Record<string, { min: number; max: number; label: string }> = {
  '3-4': { min: 1200, max: 1500, label: '3-4 ani' },
  '4-5': { min: 1290, max: 1660, label: '4-5 ani' },
  '5-6': { min: 1400, max: 1800, label: '5-6 ani' },
};

const MEAL_TYPES = ['mic_dejun', 'gustare_1', 'pranz', 'gustare_2'] as const;

// ── Helpers ──
async function getUserOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  return profile?.organization_id || null;
}

// ── Fetch nutritional reference ──
export async function getNutritionalReference(): Promise<NutritionalRef[]> {
  const { data } = await supabase.from('nutritional_reference').select('*').order('category').order('ingredient_name');
  return (data || []) as NutritionalRef[];
}

// ── Fetch a menu week with all nested data ──
export async function getMenuWeek(weekStartDate: string): Promise<MenuWeek | null> {
  const orgId = await getUserOrgId();
  if (!orgId) return null;

  // Get or check menu_week
  const { data: mw } = await supabase
    .from('menu_weeks')
    .select('*')
    .eq('organization_id', orgId)
    .eq('week_start_date', weekStartDate)
    .maybeSingle();

  if (!mw) return null;

  // Fetch meals
  const { data: meals } = await supabase
    .from('menu_meals')
    .select('*')
    .eq('menu_week_id', mw.id)
    .order('day_of_week')
    .order('meal_type');

  if (!meals || meals.length === 0) {
    return {
      id: mw.id,
      organization_id: mw.organization_id,
      week_start_date: mw.week_start_date,
      status: mw.status as 'draft' | 'published',
      age_group: mw.age_group,
      notes: mw.notes || '',
      meals: [],
    };
  }

  // Fetch dishes
  const mealIds = meals.map(m => m.id);
  const { data: dishes } = await supabase
    .from('menu_dishes')
    .select('*')
    .in('menu_meal_id', mealIds)
    .order('ordine');

  // Fetch ingredients
  const dishIds = (dishes || []).map(d => d.id);
  const { data: ingredients } = await supabase
    .from('menu_dish_ingredients')
    .select('*, nutritional_reference(*)')
    .in('menu_dish_id', dishIds.length > 0 ? dishIds : ['__none__']);

  // Assemble
  const ingMap = new Map<string, DishIngredient[]>();
  (ingredients || []).forEach((i: any) => {
    const ref = i.nutritional_reference;
    const ing: DishIngredient = {
      id: i.id,
      menu_dish_id: i.menu_dish_id,
      ingredient_ref_id: i.ingredient_ref_id,
      ingredient_name: i.ingredient_name,
      quantity_grams: Number(i.quantity_grams),
      kcal: ref ? (Number(ref.calories_per_100g) * Number(i.quantity_grams)) / 100 : 0,
      protein: ref ? (Number(ref.protein) * Number(i.quantity_grams)) / 100 : 0,
      fat: ref ? (Number(ref.fat) * Number(i.quantity_grams)) / 100 : 0,
      carbs: ref ? (Number(ref.carbs) * Number(i.quantity_grams)) / 100 : 0,
    };
    if (!ingMap.has(i.menu_dish_id)) ingMap.set(i.menu_dish_id, []);
    ingMap.get(i.menu_dish_id)!.push(ing);
  });

  const dishMap = new Map<string, Dish[]>();
  (dishes || []).forEach(d => {
    const dish: Dish = {
      id: d.id,
      menu_meal_id: d.menu_meal_id,
      dish_name: d.dish_name,
      ordine: d.ordine,
      ingredients: ingMap.get(d.id) || [],
    };
    if (!dishMap.has(d.menu_meal_id)) dishMap.set(d.menu_meal_id, []);
    dishMap.get(d.menu_meal_id)!.push(dish);
  });

  const assembledMeals: Meal[] = meals.map(m => ({
    id: m.id,
    menu_week_id: m.menu_week_id,
    day_of_week: m.day_of_week,
    meal_type: m.meal_type as Meal['meal_type'],
    dishes: dishMap.get(m.id) || [],
  }));

  return {
    id: mw.id,
    organization_id: mw.organization_id,
    week_start_date: mw.week_start_date,
    status: mw.status as 'draft' | 'published',
    age_group: mw.age_group,
    notes: mw.notes || '',
    meals: assembledMeals,
  };
}

// ── Create or get a menu week ──
export async function ensureMenuWeek(weekStartDate: string, ageGroup: string = '4-5'): Promise<MenuWeek> {
  const orgId = await getUserOrgId();
  
  // Try to get existing
  const existing = await getMenuWeek(weekStartDate);
  if (existing) return existing;

  // Create new
  const { data: mw, error } = await supabase
    .from('menu_weeks')
    .insert({ organization_id: orgId, week_start_date: weekStartDate, age_group: ageGroup })
    .select()
    .single();

  if (error) throw error;

  return {
    id: mw.id,
    organization_id: mw.organization_id,
    week_start_date: mw.week_start_date,
    status: 'draft',
    age_group: mw.age_group,
    notes: '',
    meals: [],
  };
}

// ── Add a dish to a meal slot ──
export async function addDish(menuWeekId: string, dayOfWeek: number, mealType: string, dishName: string): Promise<Dish> {
  // Ensure meal exists
  const { data: existingMeal } = await supabase
    .from('menu_meals')
    .select('id')
    .eq('menu_week_id', menuWeekId)
    .eq('day_of_week', dayOfWeek)
    .eq('meal_type', mealType)
    .maybeSingle();

  let mealId: string;
  if (existingMeal) {
    mealId = existingMeal.id;
  } else {
    const { data: newMeal, error } = await supabase
      .from('menu_meals')
      .insert({ menu_week_id: menuWeekId, day_of_week: dayOfWeek, meal_type: mealType })
      .select()
      .single();
    if (error) throw error;
    mealId = newMeal.id;
  }

  // Count existing dishes for ordering
  const { count } = await supabase
    .from('menu_dishes')
    .select('*', { count: 'exact', head: true })
    .eq('menu_meal_id', mealId);

  const { data: dish, error } = await supabase
    .from('menu_dishes')
    .insert({ menu_meal_id: mealId, dish_name: dishName, ordine: (count || 0) + 1 })
    .select()
    .single();

  if (error) throw error;
  return { id: dish.id, menu_meal_id: mealId, dish_name: dish.dish_name, ordine: dish.ordine, ingredients: [] };
}

// ── Add ingredient to dish ──
export async function addIngredient(dishId: string, refId: string | null, name: string, grams: number): Promise<void> {
  await supabase.from('menu_dish_ingredients').insert({
    menu_dish_id: dishId,
    ingredient_ref_id: refId,
    ingredient_name: name,
    quantity_grams: grams,
  });
}

// ── Update ingredient quantity ──
export async function updateIngredient(ingredientId: string, grams: number): Promise<void> {
  await supabase.from('menu_dish_ingredients').update({ quantity_grams: grams }).eq('id', ingredientId);
}

// ── Delete ingredient ──
export async function deleteIngredient(ingredientId: string): Promise<void> {
  await supabase.from('menu_dish_ingredients').delete().eq('id', ingredientId);
}

// ── Delete dish (cascades ingredients) ──
export async function deleteDish(dishId: string): Promise<void> {
  await supabase.from('menu_dishes').delete().eq('id', dishId);
}

// ── Update dish name ──
export async function updateDishName(dishId: string, name: string): Promise<void> {
  await supabase.from('menu_dishes').update({ dish_name: name }).eq('id', dishId);
}

// ── Publish / unpublish menu ──
export async function publishMenu(menuWeekId: string): Promise<void> {
  await supabase.from('menu_weeks').update({ status: 'published', updated_at: new Date().toISOString() }).eq('id', menuWeekId);
}

export async function unpublishMenu(menuWeekId: string): Promise<void> {
  await supabase.from('menu_weeks').update({ status: 'draft', updated_at: new Date().toISOString() }).eq('id', menuWeekId);
}

// ── Update age group ──
export async function updateAgeGroup(menuWeekId: string, ageGroup: string): Promise<void> {
  await supabase.from('menu_weeks').update({ age_group: ageGroup, updated_at: new Date().toISOString() }).eq('id', menuWeekId);
}

// ── Compute day nutrition from meals ──
export function computeDayNutrition(meals: Meal[], dayOfWeek: number): DayNutrition {
  const dayMeals = meals.filter(m => m.day_of_week === dayOfWeek);
  let kcal = 0, protein = 0, fat = 0, carbs = 0;
  for (const meal of dayMeals) {
    for (const dish of meal.dishes) {
      for (const ing of dish.ingredients) {
        kcal += ing.kcal || 0;
        protein += ing.protein || 0;
        fat += ing.fat || 0;
        carbs += ing.carbs || 0;
      }
    }
  }
  return { kcal: Math.round(kcal), protein: Math.round(protein), fat: Math.round(fat), carbs: Math.round(carbs) };
}

// ── Get calorie status color ──
export function getCalorieStatus(kcal: number, ageGroup: string): 'green' | 'yellow' | 'red' | 'gray' {
  if (kcal === 0) return 'gray';
  const target = AGE_GROUP_TARGETS[ageGroup];
  if (!target) return 'gray';
  if (kcal >= target.min && kcal <= target.max) return 'green';
  const margin = (target.max - target.min) * 0.15;
  if (kcal >= target.min - margin && kcal <= target.max + margin) return 'yellow';
  return 'red';
}

// ── Check for banned ingredients in a week ──
export function checkBannedIngredients(meals: Meal[], refMap: Map<string, NutritionalRef>): { dishName: string; ingredientName: string; reason: string }[] {
  const warnings: { dishName: string; ingredientName: string; reason: string }[] = [];
  for (const meal of meals) {
    for (const dish of meal.dishes) {
      for (const ing of dish.ingredients) {
        if (ing.ingredient_ref_id) {
          const ref = refMap.get(ing.ingredient_ref_id);
          if (ref?.is_banned) {
            warnings.push({ dishName: dish.dish_name, ingredientName: ing.ingredient_name, reason: ref.ban_reason || 'Interzis OMS' });
          }
        }
      }
    }
  }
  return warnings;
}

// ── OMS macro balance targets (% of daily kcal) ──
// OMS 541/2025: Proteine 10-15%, Lipide 25-35%, Glucide 50-60%
export const OMS_MACRO_TARGETS = {
  protein_pct: { min: 10, max: 15, label: 'Proteine' },
  fat_pct: { min: 25, max: 35, label: 'Lipide' },
  carbs_pct: { min: 50, max: 60, label: 'Glucide' },
};

export interface MacroBalance {
  protein_pct: number;
  fat_pct: number;
  carbs_pct: number;
  protein_status: 'green' | 'yellow' | 'red';
  fat_status: 'green' | 'yellow' | 'red';
  carbs_status: 'green' | 'yellow' | 'red';
}

export function computeMacroBalance(nut: DayNutrition): MacroBalance {
  const totalKcal = nut.kcal || 1;
  // 1g protein = 4 kcal, 1g fat = 9 kcal, 1g carbs = 4 kcal
  const protein_pct = ((nut.protein * 4) / totalKcal) * 100;
  const fat_pct = ((nut.fat * 9) / totalKcal) * 100;
  const carbs_pct = ((nut.carbs * 4) / totalKcal) * 100;

  const getStatus = (val: number, min: number, max: number): 'green' | 'yellow' | 'red' => {
    if (val >= min && val <= max) return 'green';
    const margin = (max - min) * 0.2;
    if (val >= min - margin && val <= max + margin) return 'yellow';
    return 'red';
  };

  return {
    protein_pct: Math.round(protein_pct),
    fat_pct: Math.round(fat_pct),
    carbs_pct: Math.round(carbs_pct),
    protein_status: getStatus(protein_pct, OMS_MACRO_TARGETS.protein_pct.min, OMS_MACRO_TARGETS.protein_pct.max),
    fat_status: getStatus(fat_pct, OMS_MACRO_TARGETS.fat_pct.min, OMS_MACRO_TARGETS.fat_pct.max),
    carbs_status: getStatus(carbs_pct, OMS_MACRO_TARGETS.carbs_pct.min, OMS_MACRO_TARGETS.carbs_pct.max),
  };
}

// ── Weekly OMS classification ──
export type OmsClassification = 'verde' | 'galben' | 'rosu' | 'gol';

export function getWeeklyOmsClassification(
  meals: Meal[],
  ageGroup: string,
  refMap: Map<string, NutritionalRef>
): { classification: OmsClassification; reasons: string[] } {
  const reasons: string[] = [];
  let hasRed = false;
  let hasYellow = false;

  // Check banned ingredients
  const banned = checkBannedIngredients(meals, refMap);
  if (banned.length > 0) {
    hasRed = true;
    reasons.push(`${banned.length} ingredient(e) interzis(e) OMS`);
  }

  // Check daily calories
  let daysWithData = 0;
  for (let day = 1; day <= 5; day++) {
    const nut = computeDayNutrition(meals, day);
    if (nut.kcal === 0) continue;
    daysWithData++;
    const status = getCalorieStatus(nut.kcal, ageGroup);
    if (status === 'red') { hasRed = true; reasons.push(`Ziua ${day}: calorii în afara limitelor`); }
    else if (status === 'yellow') { hasYellow = true; }

    // Check macro balance
    const macro = computeMacroBalance(nut);
    if (macro.protein_status === 'red' || macro.fat_status === 'red' || macro.carbs_status === 'red') {
      hasYellow = true;
      reasons.push(`Ziua ${day}: macronutrienți dezechilibrați`);
    }
  }

  if (daysWithData === 0) return { classification: 'gol', reasons: [] };
  if (hasRed) return { classification: 'rosu', reasons };
  if (hasYellow) return { classification: 'galben', reasons };
  return { classification: 'verde', reasons: ['Meniu conform OMS 541/2025'] };
}

// ── Get unique categories from ref list ──
export function getRefCategories(refs: NutritionalRef[]): string[] {
  return [...new Set(refs.map(r => r.category))].sort();
}

// ── Category labels in Romanian ──
export const CATEGORY_LABELS: Record<string, string> = {
  bauturi: '🥤 Băuturi',
  carne: '🥩 Carne',
  cereale: '🌾 Cereale',
  condimente: '🧂 Condimente',
  dulciuri: '🍰 Dulciuri',
  fructe: '🍎 Fructe',
  grasimi: '🫒 Grăsimi & Semințe',
  lactate: '🥛 Lactate',
  legume: '🥦 Legume',
  leguminoase: '🫘 Leguminoase',
  oua: '🥚 Ouă',
  peste: '🐟 Pește',
  snacks: '🚫 Snacks (interzis)',
  zahar: '🍬 Zahăr',
};
