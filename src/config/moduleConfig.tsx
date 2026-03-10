import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { VERTICAL_DEFINITIONS, type VerticalType } from './verticalConfig';

export type ModuleKey = 'prezenta' | 'imagini' | 'documente' | 'povesti' | 'ateliere' | 'meniu' | 'mesaje';

export interface ModuleSettings {
  color: string;
  textColor?: string;
  title: string;
  subtitle: string;
}

export type ModuleConfig = Record<ModuleKey, ModuleSettings>;

const BASE_COLORS: Record<ModuleKey, { color: string; textColor?: string }> = {
  prezenta: { color: '#E8829A' },
  imagini: { color: '#2ECC71' },
  documente: { color: '#3498DB' },
  povesti: { color: '#9B59B6' },
  ateliere: { color: '#FFC107', textColor: '#1a1a1a' },
  meniu: { color: '#FF8C42' },
  mesaje: { color: '#a19afe' },
};

/** Build default config for a given vertical */
export function buildDefaultConfig(vertical: VerticalType): ModuleConfig {
  const def = VERTICAL_DEFINITIONS[vertical];
  const keys: ModuleKey[] = ['prezenta', 'imagini', 'documente', 'povesti', 'ateliere', 'meniu', 'mesaje'];
  const result = {} as ModuleConfig;
  for (const key of keys) {
    const labels = def.moduleLabels[key];
    result[key] = {
      ...BASE_COLORS[key],
      title: labels.title,
      subtitle: labels.subtitle,
    };
  }
  return result;
}

// Fallback for backward compat
export const DEFAULT_MODULE_CONFIG: ModuleConfig = buildDefaultConfig('kids');

const STORAGE_KEY = 'tid4k_module_config';

function loadOverrides(): Partial<Record<ModuleKey, Partial<ModuleSettings>>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function mergeConfig(base: ModuleConfig, overrides: Partial<Record<ModuleKey, Partial<ModuleSettings>>>): ModuleConfig {
  const result = { ...base };
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

export function ModuleConfigProvider({ children, vertical }: { children: React.ReactNode; vertical?: VerticalType }) {
  const [overrides, setOverrides] = useState<Partial<Record<ModuleKey, Partial<ModuleSettings>>>>(loadOverrides);

  const baseConfig = React.useMemo(() => buildDefaultConfig(vertical || 'kids'), [vertical]);
  const config = React.useMemo(() => mergeConfig(baseConfig, overrides), [baseConfig, overrides]);

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
