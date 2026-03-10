import { supabase } from '@/integrations/supabase/client';

export interface Workshop {
  id_atelier: string;
  titlu: string;
  descriere: string;
  luna: string;
  imagine_url: string;
  categorie: 'arta' | 'stiinta' | 'muzica' | 'sport' | 'natura';
  materiale: string[];
  instructor: string;
  durata_minute: number;
  scoli_target: string[];
  publicat: boolean;
  data_creare: string;
  data_publicare?: string;
}

export type WorkshopCreate = Omit<Workshop, 'id_atelier' | 'data_creare' | 'data_publicare' | 'publicat'>;

const CATEGORY_LABELS: Record<Workshop['categorie'], string> = {
  arta: 'Artă',
  stiinta: 'Știință',
  muzica: 'Muzică',
  sport: 'Sport',
  natura: 'Natură',
};

export function getCategoryLabel(cat: Workshop['categorie']) {
  return CATEGORY_LABELS[cat] || cat;
}

export async function getWorkshops(schoolId?: string, luna?: string): Promise<Workshop[]> {
  let query = supabase.from('workshops').select('*').order('created_at', { ascending: false });
  if (luna) query = query.eq('luna', luna);

  const { data, error } = await query;
  if (error) throw error;

  let result = (data || []).map(w => ({
    id_atelier: w.id,
    titlu: w.titlu,
    descriere: w.descriere || '',
    luna: w.luna,
    imagine_url: w.imagine_url || '',
    categorie: w.categorie as Workshop['categorie'],
    materiale: w.materiale || [],
    instructor: w.instructor || '',
    durata_minute: w.durata_minute || 30,
    scoli_target: w.scoli_target || ['all'],
    publicat: w.publicat || false,
    data_creare: w.created_at,
    data_publicare: w.data_publicare || undefined,
  }));

  if (schoolId && schoolId !== 'all') {
    result = result.filter(w => w.scoli_target.includes('all') || w.scoli_target.includes(schoolId));
  }

  return result;
}

export async function getWorkshopOfMonth(schoolId?: string): Promise<Workshop | null> {
  const d = new Date();
  const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

  const { data } = await supabase
    .from('workshops')
    .select('*')
    .eq('luna', month)
    .eq('publicat', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;

  const w = data[0];
  if (schoolId && schoolId !== 'all' && !w.scoli_target?.includes('all') && !w.scoli_target?.includes(schoolId)) {
    return null;
  }

  return {
    id_atelier: w.id,
    titlu: w.titlu,
    descriere: w.descriere || '',
    luna: w.luna,
    imagine_url: w.imagine_url || '',
    categorie: w.categorie as Workshop['categorie'],
    materiale: w.materiale || [],
    instructor: w.instructor || '',
    durata_minute: w.durata_minute || 30,
    scoli_target: w.scoli_target || ['all'],
    publicat: true,
    data_creare: w.created_at,
    data_publicare: w.data_publicare || undefined,
  };
}

export async function createWorkshop(data: WorkshopCreate): Promise<Workshop> {
  const { data: w, error } = await supabase.from('workshops').insert({
    titlu: data.titlu,
    descriere: data.descriere,
    luna: data.luna,
    imagine_url: data.imagine_url,
    categorie: data.categorie,
    materiale: data.materiale,
    instructor: data.instructor,
    durata_minute: data.durata_minute,
    scoli_target: data.scoli_target,
    publicat: false,
  }).select().single();

  if (error) throw error;

  return {
    id_atelier: w.id,
    titlu: w.titlu,
    descriere: w.descriere || '',
    luna: w.luna,
    imagine_url: w.imagine_url || '',
    categorie: w.categorie as Workshop['categorie'],
    materiale: w.materiale || [],
    instructor: w.instructor || '',
    durata_minute: w.durata_minute || 30,
    scoli_target: w.scoli_target || ['all'],
    publicat: false,
    data_creare: w.created_at,
  };
}

export async function updateWorkshop(id: string, data: Partial<WorkshopCreate>): Promise<Workshop> {
  const { data: w, error } = await supabase.from('workshops').update(data).eq('id', id).select().single();
  if (error) throw error;

  return {
    id_atelier: w.id,
    titlu: w.titlu,
    descriere: w.descriere || '',
    luna: w.luna,
    imagine_url: w.imagine_url || '',
    categorie: w.categorie as Workshop['categorie'],
    materiale: w.materiale || [],
    instructor: w.instructor || '',
    durata_minute: w.durata_minute || 30,
    scoli_target: w.scoli_target || ['all'],
    publicat: w.publicat || false,
    data_creare: w.created_at,
    data_publicare: w.data_publicare || undefined,
  };
}

export async function deleteWorkshop(id: string): Promise<void> {
  const { error } = await supabase.from('workshops').delete().eq('id', id);
  if (error) throw error;
}

export async function publishWorkshop(id: string, scoli_target: string[]): Promise<Workshop> {
  const { data: w, error } = await supabase.from('workshops').update({
    publicat: true,
    scoli_target,
    data_publicare: new Date().toISOString(),
  }).eq('id', id).select().single();

  if (error) throw error;

  return {
    id_atelier: w.id,
    titlu: w.titlu,
    descriere: w.descriere || '',
    luna: w.luna,
    imagine_url: w.imagine_url || '',
    categorie: w.categorie as Workshop['categorie'],
    materiale: w.materiale || [],
    instructor: w.instructor || '',
    durata_minute: w.durata_minute || 30,
    scoli_target: w.scoli_target || ['all'],
    publicat: true,
    data_creare: w.created_at,
    data_publicare: w.data_publicare || undefined,
  };
}

/* ═══════════════════════════════════════════════════
   Vehicle Profiles CRUD (workshops vertical)
   ═══════════════════════════════════════════════════ */

export interface VehicleProfile {
  id: string;
  organization_id: string;
  nr_inmatriculare: string;
  marca: string;
  model: string;
  an_fabricatie: number;
  vin: string;
  culoare: string;
  owner_name: string;
  owner_phone: string;
  notes: string;
  created_at: string;
}

export interface WorkshopAppointment {
  id: string;
  organization_id: string;
  client_name: string;
  client_phone: string;
  vehicle_profile_id: string | null;
  appointment_date: string;
  time_slot: string;
  service_description: string;
  status: 'scheduled' | 'in_progress' | 'done' | 'cancelled';
  assigned_mechanic: string;
  notes: string;
  created_at: string;
}

export async function getVehicles(orgId: string): Promise<VehicleProfile[]> {
  const { data, error } = await supabase
    .from('vehicle_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false }) as any;
  if (error) throw error;
  return (data || []) as VehicleProfile[];
}

export async function createVehicle(v: Partial<VehicleProfile> & { organization_id: string; nr_inmatriculare: string }) {
  const { data, error } = await supabase.from('vehicle_profiles').insert(v).select().single() as any;
  if (error) throw error;
  return data as VehicleProfile;
}

export async function updateVehicle(id: string, update: Partial<VehicleProfile>) {
  const { error } = await supabase.from('vehicle_profiles').update(update).eq('id', id) as any;
  if (error) throw error;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from('vehicle_profiles').delete().eq('id', id) as any;
  if (error) throw error;
}

export async function getAppointments(orgId: string, date?: string): Promise<WorkshopAppointment[]> {
  let q = supabase.from('workshop_appointments').select('*').eq('organization_id', orgId).order('time_slot') as any;
  if (date) q = q.eq('appointment_date', date);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as WorkshopAppointment[];
}

export async function createAppointment(a: Partial<WorkshopAppointment> & { organization_id: string; client_name: string; appointment_date: string }) {
  const { data, error } = await supabase.from('workshop_appointments').insert(a).select().single() as any;
  if (error) throw error;
  return data as WorkshopAppointment;
}

export async function updateAppointment(id: string, update: Partial<WorkshopAppointment>) {
  const { error } = await supabase.from('workshop_appointments').update(update).eq('id', id) as any;
  if (error) throw error;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('workshop_appointments').delete().eq('id', id) as any;
  if (error) throw error;
}
