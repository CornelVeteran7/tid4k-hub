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
