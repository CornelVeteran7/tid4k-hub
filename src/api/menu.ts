import { supabase } from '@/integrations/supabase/client';
import type { WeeklyMenu, NutritionalData } from '@/types';

async function getUserOrgId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();
  return profile?.organization_id || null;
}

export async function getMenu(saptamana: string): Promise<WeeklyMenu> {
  const orgId = await getUserOrgId();

  let itemsQuery = supabase.from('menu_items').select('*').eq('saptamana', saptamana);
  let nutriQuery = supabase.from('nutritional_data').select('*').eq('saptamana', saptamana);
  let metaQuery = supabase.from('menu_metadata').select('*').eq('saptamana', saptamana);

  if (orgId) {
    itemsQuery = itemsQuery.eq('organization_id', orgId);
    nutriQuery = nutriQuery.eq('organization_id', orgId);
    metaQuery = metaQuery.eq('organization_id', orgId);
  }

  const [{ data: items }, { data: nutritional }, { data: meta }] = await Promise.all([
    itemsQuery,
    nutriQuery,
    metaQuery.single(),
  ]);

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
  const orgId = await getUserOrgId();

  // Delete existing items for this week (scoped to org)
  let delItems = supabase.from('menu_items').delete().eq('saptamana', menu.saptamana);
  let delNutri = supabase.from('nutritional_data').delete().eq('saptamana', menu.saptamana);
  if (orgId) {
    delItems = delItems.eq('organization_id', orgId);
    delNutri = delNutri.eq('organization_id', orgId);
  }
  await Promise.all([delItems, delNutri]);

  // Insert new items with organization_id
  if (menu.items.length > 0) {
    await supabase.from('menu_items').insert(
      menu.items.map(i => ({
        saptamana: menu.saptamana,
        masa: i.masa,
        zi: i.zi,
        continut: i.continut,
        emoji: i.emoji || '',
        organization_id: orgId,
      }))
    );
  }

  if (menu.nutritional.length > 0) {
    await supabase.from('nutritional_data').insert(
      menu.nutritional.map(n => ({
        saptamana: menu.saptamana,
        ...n,
        organization_id: orgId,
      }))
    );
  }

  // Upsert metadata
  await supabase.from('menu_metadata').upsert({
    saptamana: menu.saptamana,
    alergeni: menu.alergeni,
    semnatura_director: menu.semnaturi.director,
    semnatura_asistent: menu.semnaturi.asistent_medical,
    semnatura_administrator: menu.semnaturi.administrator,
    organization_id: orgId,
  }, { onConflict: 'saptamana' });
}

export async function getNutritionalData(saptamana: string): Promise<NutritionalData[]> {
  const orgId = await getUserOrgId();
  let query = supabase.from('nutritional_data').select('*').eq('saptamana', saptamana);
  if (orgId) query = query.eq('organization_id', orgId);

  const { data } = await query;

  return (data || []).map(n => ({
    zi: n.zi,
    kcal: n.kcal || 0,
    carbohidrati: n.carbohidrati || 0,
    proteine: n.proteine || 0,
    grasimi: n.grasimi || 0,
    fibre: n.fibre || 0,
  }));
}
