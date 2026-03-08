import { supabase } from '@/integrations/supabase/client';
import type { WeeklyMenu, NutritionalData } from '@/types';

export async function getMenu(saptamana: string): Promise<WeeklyMenu> {
  const { data: items } = await supabase
    .from('menu_items')
    .select('*')
    .eq('saptamana', saptamana);

  const { data: nutritional } = await supabase
    .from('nutritional_data')
    .select('*')
    .eq('saptamana', saptamana);

  const { data: meta } = await supabase
    .from('menu_metadata')
    .select('*')
    .eq('saptamana', saptamana)
    .single();

  return {
    saptamana,
    items: (items || []).map(i => ({
      masa: i.masa as any,
      zi: i.zi,
      continut: i.continut,
      emoji: i.emoji || undefined,
    })),
    nutritional: (nutritional || []).map(n => ({
      zi: n.zi,
      kcal: n.kcal || 0,
      carbohidrati: n.carbohidrati || 0,
      proteine: n.proteine || 0,
      grasimi: n.grasimi || 0,
      fibre: n.fibre || 0,
    })),
    alergeni: meta?.alergeni || [],
    semnaturi: {
      director: meta?.semnatura_director || '',
      asistent_medical: meta?.semnatura_asistent || '',
      administrator: meta?.semnatura_administrator || '',
    },
  };
}

export async function saveMenu(menu: WeeklyMenu): Promise<void> {
  // Delete existing items for this week
  await supabase.from('menu_items').delete().eq('saptamana', menu.saptamana);
  await supabase.from('nutritional_data').delete().eq('saptamana', menu.saptamana);

  // Insert new items
  if (menu.items.length > 0) {
    await supabase.from('menu_items').insert(
      menu.items.map(i => ({ saptamana: menu.saptamana, masa: i.masa, zi: i.zi, continut: i.continut, emoji: i.emoji || '' }))
    );
  }

  if (menu.nutritional.length > 0) {
    await supabase.from('nutritional_data').insert(
      menu.nutritional.map(n => ({ saptamana: menu.saptamana, ...n }))
    );
  }

  // Upsert metadata
  await supabase.from('menu_metadata').upsert({
    saptamana: menu.saptamana,
    alergeni: menu.alergeni,
    semnatura_director: menu.semnaturi.director,
    semnatura_asistent: menu.semnaturi.asistent_medical,
    semnatura_administrator: menu.semnaturi.administrator,
  }, { onConflict: 'saptamana' });
}

export async function getNutritionalData(saptamana: string): Promise<NutritionalData[]> {
  const { data } = await supabase
    .from('nutritional_data')
    .select('*')
    .eq('saptamana', saptamana);

  return (data || []).map(n => ({
    zi: n.zi,
    kcal: n.kcal || 0,
    carbohidrati: n.carbohidrati || 0,
    proteine: n.proteine || 0,
    grasimi: n.grasimi || 0,
    fibre: n.fibre || 0,
  }));
}
