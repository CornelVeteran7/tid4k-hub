import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSession, GroupInfo } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { loadAndApplyBranding } from '@/utils/branding';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: () => void;
  // Legacy compatibility
  qrLogin: (sessionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function buildUserSession(authUser: User): Promise<UserSession> {
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Fetch roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', authUser.id);

  const status = roles?.map(r => r.role).join(',') || 'parinte';

  // Fetch organization info
  let orgInfo: { vertical_type: string; name: string } | null = null;
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('vertical_type, name')
      .eq('id', profile.organization_id)
      .single();
    if (org) {
      orgInfo = { vertical_type: org.vertical_type, name: org.name };
      // Apply org branding colors on login
      loadAndApplyBranding(org as any);
    }
  }

  // Fetch user's groups
  const { data: userGroups } = await supabase
    .from('user_groups')
    .select('group_id, groups(id, slug, nume, tip)')
    .eq('user_id', authUser.id);

  // If no user_groups, fetch all groups as fallback
  let grupe_disponibile: GroupInfo[] = [];
  if (userGroups && userGroups.length > 0) {
    grupe_disponibile = userGroups
      .filter(ug => ug.groups)
      .map(ug => {
        const g = ug.groups as any;
        return { id: g.slug || g.id, nume: g.nume, tip: g.tip as 'gradinita' | 'scoala' };
      });
  } else {
    // Fallback: get all groups
    const { data: allGroups } = await supabase.from('groups').select('*');
    grupe_disponibile = (allGroups || []).map(g => ({
      id: g.slug || g.id,
      nume: g.nume,
      tip: g.tip as 'gradinita' | 'scoala',
    }));
  }

  return {
    id: authUser.id,
    nume_prenume: profile?.nume_prenume || authUser.user_metadata?.full_name || authUser.email || '',
    telefon: profile?.telefon || '',
    email: profile?.email || authUser.email || '',
    status,
    avatar_url: profile?.avatar_url || '',
    grupa_clasa_copil: grupe_disponibile[0]?.id || '',
    numar_grupe_clase_utilizator: grupe_disponibile.length,
    index_grupa_clasa_curenta: 0,
    grupe_disponibile,
    organization_id: profile?.organization_id || undefined,
    vertical_type: orgInfo?.vertical_type || 'kids',
    org_name: orgInfo?.name || '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const setDemoUser = useCallback(() => {
    const demoSession: UserSession = {
      id: 'demo-user-00000000',
      nume_prenume: 'Admin Demo',
      telefon: '',
      email: 'demo@infodisplay.ro',
      status: 'administrator,inky',
      avatar_url: '',
      grupa_clasa_copil: 'fluturasi',
      numar_grupe_clase_utilizator: 2,
      index_grupa_clasa_curenta: 0,
      grupe_disponibile: [
        { id: 'fluturasi', nume: 'Grupa Fluturași', tip: 'gradinita' },
        { id: 'albinute', nume: 'Grupa Albinuțe', tip: 'gradinita' },
      ],
      organization_id: undefined,
      vertical_type: 'kids',
      org_name: 'Grădinița Demo',
    };
    setUser(demoSession);
    setIsDemo(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase client deadlock
        setTimeout(async () => {
          try {
            const userSession = await buildUserSession(session.user);
            setUser(userSession);
          } catch (err) {
            console.error('Error building user session:', err);
          }
          setIsLoading(false);
        }, 0);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const userSession = await buildUserSession(session.user);
          setUser(userSession);
        } catch (err) {
          console.error('Error building user session:', err);
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  }, []);

  const qrLogin = useCallback(async (_sessionId: string) => {
    // QR login not supported with Supabase Auth — placeholder
    console.warn('QR login not yet implemented with Supabase Auth');
  }, []);

  const logoutFn = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signUp, loginWithGoogle, qrLogin, logout: logoutFn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
