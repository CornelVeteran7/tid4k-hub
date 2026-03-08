import { useState, useEffect, useRef } from 'react';
import { getRotationConfig, logImpression } from '@/api/sponsors';
import type { SponsorPromo } from '@/types/sponsor';
import type { RotationConfig } from '@/types/sponsor';

interface UseSponsorRotationReturn {
  currentPromo: SponsorPromo | null;
  allPromos: SponsorPromo[];
  isTransitioning: boolean;
  timeRemaining: number;
}

export function useSponsorRotation(
  tip: SponsorPromo['tip'],
  schoolId?: number
): UseSponsorRotationReturn {
  const [config, setConfig] = useState<RotationConfig | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const impressionLogged = useRef<string | null>(null);

  useEffect(() => {
    getRotationConfig(tip, schoolId?.toString()).then(cfg => {
      setConfig(cfg);
      setCurrentIndex(0);
    });
  }, [tip, schoolId]);

  const currentSlot = config?.sloturi?.[currentIndex] ?? null;

  useEffect(() => {
    if (!currentSlot) return;
    if (impressionLogged.current === currentSlot.id_promo) return;
    impressionLogged.current = currentSlot.id_promo;
    logImpression({ id_promo: currentSlot.id_promo, tip, school_id: schoolId });
  }, [currentSlot, tip, schoolId]);

  useEffect(() => {
    if (!config || config.sloturi.length <= 1) return;

    const slot = config.sloturi[currentIndex];
    if (!slot) return;

    const durationMs = slot.durata_secunde * 1000;
    setTimeRemaining(slot.durata_secunde);

    countdownRef.current = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    const transitionTimeout = setTimeout(() => {
      setIsTransitioning(true);
    }, Math.max(0, durationMs - 300));

    timerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      impressionLogged.current = null;
      setCurrentIndex(prev => (prev + 1) % config.sloturi.length);
    }, durationMs) as unknown as ReturnType<typeof setInterval>;

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      clearTimeout(transitionTimeout);
      if (timerRef.current) clearTimeout(timerRef.current as unknown as ReturnType<typeof setTimeout>);
    };
  }, [config, currentIndex]);

  return {
    currentPromo: currentSlot?.promo ?? null,
    allPromos: config?.sloturi.map(s => s.promo) ?? [],
    isTransitioning,
    timeRemaining,
  };
}
