
-- Add CASCADE on menu_dish_ingredients → menu_dishes
ALTER TABLE public.menu_dish_ingredients 
  DROP CONSTRAINT menu_dish_ingredients_menu_dish_id_fkey,
  ADD CONSTRAINT menu_dish_ingredients_menu_dish_id_fkey 
    FOREIGN KEY (menu_dish_id) REFERENCES public.menu_dishes(id) ON DELETE CASCADE;

-- Add CASCADE on menu_dishes → menu_meals
ALTER TABLE public.menu_dishes 
  DROP CONSTRAINT menu_dishes_menu_meal_id_fkey,
  ADD CONSTRAINT menu_dishes_menu_meal_id_fkey 
    FOREIGN KEY (menu_meal_id) REFERENCES public.menu_meals(id) ON DELETE CASCADE;

-- Add CASCADE on menu_meals → menu_weeks
ALTER TABLE public.menu_meals 
  DROP CONSTRAINT menu_meals_menu_week_id_fkey,
  ADD CONSTRAINT menu_meals_menu_week_id_fkey 
    FOREIGN KEY (menu_week_id) REFERENCES public.menu_weeks(id) ON DELETE CASCADE;
