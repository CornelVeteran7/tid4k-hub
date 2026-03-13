-- Add unique constraint on ingredient_name for nutritional_reference
ALTER TABLE nutritional_reference ADD CONSTRAINT nutritional_reference_ingredient_name_key UNIQUE (ingredient_name);