// Auth is now handled by Supabase Auth via AuthContext.
// This file is kept for legacy compatibility.
import { supabase } from '@/integrations/supabase/client';

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

export async function validateSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}
