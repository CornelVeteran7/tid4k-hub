import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { UserSession, GroupInfo } from '@/types';
import { toast } from 'sonner';
import { tid4kApi } from '@/api/tid4kClient';

export interface DemoConfig {
  vertical: string;
  status: string;
  orgName: string;
  groups: GroupInfo[];
  userName: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setDemoUser: (config?: DemoConfig) => void;
  qrLogin: (sessionId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserSession(config: DemoConfig): UserSession {
  return {
    id: 'tid4k-user',
    nume_prenume: config.userName,
    telefon: '',
    email: '',
    status: config.status,
    avatar_url: '',
    grupa_clasa_copil: config.groups[0]?.id || '',
    numar_grupe_clase_utilizator: config.groups.length,
    index_grupa_clasa_curenta: 0,
    grupe_disponibile: config.groups,
    organization_id: undefined,
    vertical_type: config.vertical,
    org_name: config.orgName,
  };
}

/**
 * Verifica daca exista o sesiune salvata (din login anterior).
 * Returneaza UserSession daca da, null daca nu.
 */
function getRestoredSession(): UserSession | null {
  try {
    // 1. Verificam daca exista config salvat in sessionStorage (de la login)
    const savedConfig = sessionStorage.getItem('demo_config');
    if (savedConfig) {
      const config: DemoConfig = JSON.parse(savedConfig);
      // Restauram si branding-ul
      try {
        const brandingStr = sessionStorage.getItem('demo_branding');
        if (brandingStr) {
          const { primary, secondary } = JSON.parse(brandingStr);
          if (primary && secondary) {
            setTimeout(() => {
              import('@/utils/branding').then(({ applyBrandingColors, applyVerticalTheme }) => {
                applyBrandingColors(primary, secondary);
                if (config.vertical) applyVerticalTheme(config.vertical);
              });
            }, 0);
          }
        }
      } catch {}
      return buildUserSession(config);
    }
  } catch {}
  // Nicio sesiune salvata - utilizatorul trebuie sa se logheze
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(getRestoredSession);
  const [isLoading, setIsLoading] = useState(() => {
    // Daca avem tid4k_session dar nu avem demo_config, trebuie sa verificam sesiunea
    const hasTid4kSession = !!localStorage.getItem('tid4k_session');
    const hasDemoConfig = !!sessionStorage.getItem('demo_config');
    return hasTid4kSession && !hasDemoConfig;
  });
  const [isDemo] = useState(false);

  // La mount: daca avem tid4k_session in localStorage dar nu avem demo_config,
  // verificam sesiunea pe server si restauram userul
  useEffect(() => {
    const tid4kSession = localStorage.getItem('tid4k_session');
    const hasDemoConfig = sessionStorage.getItem('demo_config');

    if (tid4kSession && !hasDemoConfig) {
      // Avem cookie de sesiune dar nu avem datele userului - verificam pe server
      tid4kApi.verificaSesiune().then((sesiune) => {
        if (sesiune) {
          const grupe = (sesiune.toate_grupele_clase || [sesiune.grupa_clasa_copil]).map((g) => ({
            id: g,
            nume: g.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            tip: 'gradinita' as const,
          }));

          const esteInky = sesiune.telefon && sesiune.telefon.replace(/\D/g, '').includes('1313131313');
          const numeAfisat = esteInky ? 'Inky' : sesiune.nume_prenume;

          const config: DemoConfig = {
            vertical: 'kids',
            status: sesiune.status,
            orgName: '',
            groups: grupe,
            userName: numeAfisat,
          };

          setUser(buildUserSession(config));
          try { sessionStorage.setItem('demo_config', JSON.stringify(config)); } catch {}
        } else {
          // Sesiunea e invalida - stergem
          localStorage.removeItem('tid4k_session');
        }
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    }
  }, []);

  const setDemoUser = useCallback((config?: DemoConfig) => {
    if (config) {
      const session = buildUserSession(config);
      setUser(session);
      try { sessionStorage.setItem('demo_config', JSON.stringify(config)); } catch {}
    } else {
      setUser(null);
      try { sessionStorage.removeItem('demo_config'); } catch {}
    }
  }, []);

  const login = useCallback(async (_email: string, _password: string) => {
    toast.info('Folosește autentificarea prin număr de telefon');
  }, []);

  const signUp = useCallback(async (_email: string, _password: string, _fullName: string) => {
    toast.info('Înregistrare disponibilă în curând');
  }, []);

  const loginWithGoogle = useCallback(async () => {
    toast.info('Google login disponibil în curând');
  }, []);

  const qrLogin = useCallback(async (_sessionId: string) => {
    console.warn('QR login — de implementat');
  }, []);

  const logoutFn = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('tid4k_session');
    try {
      sessionStorage.removeItem('demo_config');
      sessionStorage.removeItem('demo_branding');
      sessionStorage.removeItem('demo_mode');
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isDemo, login, signUp, loginWithGoogle, qrLogin, logout: logoutFn, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
