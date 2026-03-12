import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { UserSession, GroupInfo } from '@/types';
import { toast } from 'sonner';

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

const DEMO_SESSION: UserSession = {
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

function buildDemoSession(config: DemoConfig): UserSession {
  return {
    id: 'demo-user-00000000',
    nume_prenume: config.userName,
    telefon: '',
    email: 'demo@infodisplay.ro',
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

function getInitialDemoState(): { user: UserSession; isDemo: true } {
  try {
    const savedConfig = sessionStorage.getItem('demo_config');
    // Re-apply branding colors + vertical theme on reload
    try {
      const brandingStr = sessionStorage.getItem('demo_branding');
      if (brandingStr) {
        const { primary, secondary } = JSON.parse(brandingStr);
        if (primary && secondary) {
          setTimeout(() => {
            import('@/utils/branding').then(({ applyBrandingColors, applyVerticalTheme }) => {
              applyBrandingColors(primary, secondary);
              // Also restore vertical theme from demo_config
              try {
                const cfg = sessionStorage.getItem('demo_config');
                if (cfg) {
                  const parsed = JSON.parse(cfg);
                  if (parsed.vertical) applyVerticalTheme(parsed.vertical);
                }
              } catch {}
            });
          }, 0);
        }
      }
    } catch {}
    if (savedConfig) {
      const config: DemoConfig = JSON.parse(savedConfig);
      return { user: buildDemoSession(config), isDemo: true };
    }
  } catch {}
  return { user: DEMO_SESSION, isDemo: true };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialDemo = getInitialDemoState();
  const [user, setUser] = useState<UserSession | null>(initialDemo.user);
  const [isLoading] = useState(false);
  const [isDemo] = useState(true);
  const isDemoRef = useRef(true);

  const setDemoUser = useCallback((config?: DemoConfig) => {
    if (config) {
      const session = buildDemoSession(config);
      setUser(session);
      try { sessionStorage.setItem('demo_config', JSON.stringify(config)); } catch {}
    } else {
      setUser(DEMO_SESSION);
      try { sessionStorage.removeItem('demo_config'); } catch {}
    }
    try { sessionStorage.setItem('demo_mode', '1'); } catch {}
  }, []);

  // No-op auth functions — demo mode only for now
  // TID4K real auth will be activated when backend endpoints are tested
  const login = useCallback(async (_email: string, _password: string) => {
    toast.info('Funcție disponibilă în producție');
  }, []);

  const signUp = useCallback(async (_email: string, _password: string, _fullName: string) => {
    toast.info('Funcție disponibilă în producție');
  }, []);

  const loginWithGoogle = useCallback(async () => {
    toast.info('Funcție disponibilă în producție');
  }, []);

  const qrLogin = useCallback(async (_sessionId: string) => {
    console.warn('QR login — demo mode');
  }, []);

  const logoutFn = useCallback(async () => {
    // In demo-only mode, reset to default demo session
    setUser(DEMO_SESSION);
    try { sessionStorage.removeItem('demo_config'); } catch {}
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
