/**
 * Hook care incarca numarul de elemente pentru fiecare modul din dashboard.
 * Apeleaza endpoint-urile PHP existente si extrage count-ul din raspuns.
 */
import { useState, useEffect, useCallback } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { tid4kApi } from '@/api/tid4kClient';
import { useGroupAttendance } from './useGroupAttendance';
import { getExternalWorkshops } from '@/api/externalWorkshops';

export interface ModuleCounts {
  prezenta: number;
  imagini: number;
  documente: number;
  povesti: number;
  ateliere: number;
  meniu: number;
  mesaje: number;
}

const EMPTY_COUNTS: ModuleCounts = {
  prezenta: 0,
  imagini: 0,
  documente: 0,
  povesti: 0,
  ateliere: 0,
  meniu: 0,
  mesaje: 0,
};

export function useModuleCounts(): ModuleCounts {
  const { currentGroup } = useGroup();
  const groupAttendance = useGroupAttendance();
  const [counts, setCounts] = useState<ModuleCounts>(EMPTY_COUNTS);

  const loadCounts = useCallback(async () => {
    if (!currentGroup) return;

    // Incarcam toate count-urile in paralel (PHP + Supabase)
    const [imagini, documente, povesti, meniuri, mesaje, anunturi, workshops] = await Promise.all([
      tid4kApi.call<any>('fetch_images', { grupa: currentGroup.id }).catch(() => null),
      tid4kApi.call<any>('fetch_iframes', { grupa: currentGroup.id }).catch(() => null),
      tid4kApi.call<any>('fetch_povesti', { grupa: currentGroup.id }).catch(() => null),
      tid4kApi.call<any>('fetch_meniuri', { grupa: currentGroup.id }).catch(() => null),
      tid4kApi.call<any>('fetch_mesaje', { grupa: currentGroup.id }).catch(() => null),
      tid4kApi.call<any>('fetch_anunturi', { grupa: currentGroup.id }).catch(() => null),
      getExternalWorkshops().catch(() => []),
    ]);

    // fetch_images.php returneaza {files_utilizator: [...], files_profesor: [...]}
    const nrImagini = Array.isArray(imagini)
      ? imagini.length
      : ((imagini?.files_utilizator?.length ?? 0) + (imagini?.files_profesor?.length ?? 0));

    // fetch_iframes.php returneaza {fisiere_utilizator: [...], fisiere_profesor: [...]}
    const nrDocumente = Array.isArray(documente)
      ? documente.length
      : ((documente?.fisiere_utilizator?.length ?? 0) + (documente?.fisiere_profesor?.length ?? 0));

    // fetch_povesti.php returneaza {success, povesti: [...]}
    const nrPovesti = Array.isArray(povesti)
      ? povesti.length
      : (povesti?.povesti?.length ?? 0);

    // fetch_meniuri.php returneaza array flat [...]
    const nrMeniu = Array.isArray(meniuri) ? meniuri.length : 0;

    // fetch_mesaje.php returneaza {mesaje_utilizator: [...], numar_mesaje_nou: N}
    const nrMesaje = mesaje?.numar_mesaje_nou ?? 0;

    // Ateliere vine din Supabase (external_workshops)
    const nrAteliere = Array.isArray(workshops) ? workshops.length : 0;

    setCounts(prev => ({
      ...prev,
      imagini: nrImagini,
      documente: nrDocumente,
      povesti: nrPovesti,
      ateliere: nrAteliere,
      meniu: nrMeniu,
      mesaje: nrMesaje,
    }));
  }, [currentGroup]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  // Prezenta vine din hook-ul dedicat (care se actualizeaza in timp real)
  const att = currentGroup ? groupAttendance[currentGroup.id] : null;

  return {
    ...counts,
    prezenta: att?.prezenti ?? 0,
  };
}
