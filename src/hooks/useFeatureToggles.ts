import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrgConfigByKey, upsertOrgConfig } from '@/api/orgConfig';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';

export interface FeatureToggles {
  [key: string]: boolean;
}

export function useFeatureToggles() {
  const { user, isDemo } = useAuth();
  const [toggles, setToggles] = useState<FeatureToggles>({});
  const [loading, setLoading] = useState(true);

  const verticalType = (user?.vertical_type || 'kids') as VerticalType;
  const defaultModules = VERTICAL_DEFINITIONS[verticalType]?.defaultModules || [];

  useEffect(() => {
    async function load() {
      // In demo mode, use vertical defaults
      if (isDemo || !user?.organization_id) {
        const defaults: FeatureToggles = {};
        defaultModules.forEach(m => { defaults[m] = true; });
        setToggles(defaults);
        setLoading(false);
        return;
      }

      try {
        const config = await getOrgConfigByKey(user.organization_id, 'feature_toggles');
        if (config) {
          setToggles(config as FeatureToggles);
        } else {
          // Initialize from vertical defaults
          const defaults: FeatureToggles = {};
          defaultModules.forEach(m => { defaults[m] = true; });
          setToggles(defaults);
        }
      } catch (err) {
        console.error('Failed to load feature toggles:', err);
        const defaults: FeatureToggles = {};
        defaultModules.forEach(m => { defaults[m] = true; });
        setToggles(defaults);
      }
      setLoading(false);
    }
    load();
  }, [user?.organization_id, isDemo, verticalType]);

  const isEnabled = useCallback((featureKey: string): boolean => {
    return toggles[featureKey] ?? defaultModules.includes(featureKey);
  }, [toggles, defaultModules]);

  const setToggle = useCallback(async (featureKey: string, enabled: boolean) => {
    const updated = { ...toggles, [featureKey]: enabled };
    setToggles(updated);

    if (!isDemo && user?.organization_id) {
      try {
        await upsertOrgConfig(user.organization_id, 'feature_toggles', updated);
      } catch (err) {
        console.error('Failed to save feature toggle:', err);
      }
    }
  }, [toggles, isDemo, user?.organization_id]);

  return { toggles, loading, isEnabled, setToggle };
}
