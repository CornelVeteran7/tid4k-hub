import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';

/**
 * Hook that loads active modules from modules_config table.
 * Falls back to vertical defaults if no DB config exists.
 */
export function useActiveModules(orgId: string | undefined, verticalType: VerticalType) {
  const [activeModules, setActiveModules] = useState<Set<string>>(
    new Set(VERTICAL_DEFINITIONS[verticalType]?.defaultModules || [])
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!orgId) return;

    const load = async () => {
      const { data } = await supabase
        .from('modules_config')
        .select('module_key, is_active')
        .eq('organization_id', orgId);

      if (data && data.length > 0) {
        // Start with defaults, override with DB values
        const defaults = new Set(VERTICAL_DEFINITIONS[verticalType]?.defaultModules || []);
        const result = new Set(defaults);
        
        data.forEach(row => {
          if (row.is_active) {
            result.add(row.module_key);
          } else {
            result.delete(row.module_key);
          }
        });
        
        setActiveModules(result);
      }
      setLoaded(true);
    };

    load();

    // Listen for realtime changes
    const channel = supabase
      .channel('modules-config-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'modules_config',
        filter: `organization_id=eq.${orgId}`,
      }, () => load())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orgId, verticalType]);

  return { activeModules, loaded };
}
