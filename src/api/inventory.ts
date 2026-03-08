import { supabase } from '@/integrations/supabase/client';

export interface InventoryItem {
  id: string;
  organization_id: string;
  nume: string;
  categorie: string;
  cantitate: number;
  unitate: string;
  locatie: string;
  cod_qr: string;
  pret_unitar: number;
  descriere: string;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  organization_id: string;
  item_id: string;
  tip: 'in' | 'out';
  cantitate: number;
  motiv: string;
  efectuat_de: string;
  created_at: string;
}

export async function getInventoryItems(orgId: string): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('organization_id', orgId)
    .order('nume');
  if (error) throw error;
  return (data || []) as InventoryItem[];
}

export async function createInventoryItem(item: Partial<InventoryItem> & { organization_id: string; nume: string }) {
  const { error } = await supabase.from('inventory_items').insert(item);
  if (error) throw error;
}

export async function updateInventoryItem(id: string, update: Partial<InventoryItem>) {
  const { error } = await supabase.from('inventory_items').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw error;
}

export async function getMovements(itemId: string): Promise<InventoryMovement[]> {
  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as InventoryMovement[];
}

export async function recordMovement(mov: { organization_id: string; item_id: string; tip: string; cantitate: number; motiv: string; efectuat_de: string }) {
  // Insert movement
  const { error } = await supabase.from('inventory_movements').insert(mov);
  if (error) throw error;

  // Update item quantity
  const { data: item } = await supabase.from('inventory_items').select('cantitate').eq('id', mov.item_id).single();
  if (item) {
    const newQty = mov.tip === 'in' ? item.cantitate + mov.cantitate : item.cantitate - mov.cantitate;
    await supabase.from('inventory_items').update({ cantitate: Math.max(0, newQty), updated_at: new Date().toISOString() }).eq('id', mov.item_id);
  }
}
