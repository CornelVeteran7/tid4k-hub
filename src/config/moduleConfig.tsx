import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ModuleKey = 'prezenta' | 'imagini' | 'documente' | 'povesti' | 'ateliere' | 'meniu' | 'mesaje';

export interface ModuleSettings {
  color: string;
  title: string;
  subtitle: string;
}

export type ModuleConfig = Record<ModuleKey, ModuleSettings>;

export const DEFAULT_MODULE_CONFIG: ModuleConfig = {
  prezenta: { color: '#FF69B4', title: 'PREZENȚA', subtitle: 'Cine a venit azi la grupă' },
  imagini: { color: '#2ECC71', title: 'IMAGINI', subtitle: 'Fotografii din activități' },
  documente: { color: '#3498DB', title: 'DOCUMENTE', subtitle: 'Fișiere PDF partajate' },
  povesti: { color: '#9B59B6', title: 'POVEȘTI', subtitle: 'Povești pentru copii' },
  ateliere: { color: '#FFC107', title: 'ATELIERE', subtitle: 'Activități creative pentru copii' },
  meniu: { color: '#E67E22', title: 'MENIUL SĂPTĂMÂNII', subtitle: 'Meniul zilnic pentru copii' },
  mesaje: { color: '#E91E63', title: 'MESAJE', subtitle: 'Comunicare cu părinții' },
};

const STORAGE_KEY = 'tid4k_module_config';

function loadOverrides(): Partial<Record<ModuleKey, Partial<ModuleSettings>>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function mergeConfig(overrides: Partial<Record<ModuleKey, Partial<ModuleSettings>>>): ModuleConfig {
  const result = { ...DEFAULT_MODULE_CONFIG };
  for (const key of Object.keys(overrides) as ModuleKey[]) {
    if (result[key]) {
      result[key] = { ...result[key], ...overrides[key] };
    }
  }
  return result;
}

interface ModuleConfigContextValue {
  config: ModuleConfig;
  updateModule: (key: ModuleKey, partial: Partial<ModuleSettings>) => void;
  resetConfig: () => void;
}

const ModuleConfigContext = createContext<ModuleConfigContextValue | null>(null);

export function ModuleConfigProvider({ children }: { children: React.ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<Record<ModuleKey, Partial<ModuleSettings>>>>(loadOverrides);

  const config = React.useMemo(() => mergeConfig(overrides), [overrides]);

  const updateModule = useCallback((key: ModuleKey, partial: Partial<ModuleSettings>) => {
    setOverrides(prev => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), ...partial } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetConfig = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOverrides({});
  }, []);

  // Listen for changes from other tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOverrides(loadOverrides());
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ModuleConfigContext.Provider value={{ config, updateModule, resetConfig }}>
      {children}
    </ModuleConfigContext.Provider>
  );
}

export function useModuleConfig() {
  const ctx = useContext(ModuleConfigContext);
  if (!ctx) throw new Error('useModuleConfig must be used within ModuleConfigProvider');
  return ctx;
}
