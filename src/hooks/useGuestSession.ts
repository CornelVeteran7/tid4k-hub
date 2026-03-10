import { useState, useEffect, useCallback } from 'react';

const GUEST_SESSION_KEY = 'infodisplay_guest_session';

interface GuestSession {
  orgSlug: string;
  token: string;
  orgId: string;
  orgName: string;
  verticalType: string;
  /** ISO date string YYYY-MM-DD — session valid only on this date */
  validDate: string;
}

export function useGuestSession(orgSlug: string | undefined) {
  const [session, setSession] = useState<GuestSession | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    if (!orgSlug) return;
    const stored = localStorage.getItem(GUEST_SESSION_KEY);
    if (!stored) return;

    try {
      const parsed: GuestSession = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];

      // Hard expire at midnight
      if (parsed.validDate !== today || parsed.orgSlug !== orgSlug) {
        localStorage.removeItem(GUEST_SESSION_KEY);
        return;
      }
      setSession(parsed);
    } catch {
      localStorage.removeItem(GUEST_SESSION_KEY);
    }
  }, [orgSlug]);

  // Midnight expiry checker
  useEffect(() => {
    if (!session) return;

    const checkExpiry = () => {
      const today = new Date().toISOString().split('T')[0];
      if (session.validDate !== today) {
        localStorage.removeItem(GUEST_SESSION_KEY);
        setSession(null);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkExpiry, 30_000);
    return () => clearInterval(interval);
  }, [session]);

  const validateAndCreateSession = useCallback(
    async (token: string, turnstileToken?: string): Promise<{ success: boolean; error?: string }> => {
      if (!orgSlug) return { success: false, error: 'Organizație lipsă' };
      setIsValidating(true);

      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const resp = await fetch(
          `https://${projectId}.supabase.co/functions/v1/validate-guest-token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, orgSlug, turnstileToken }),
          }
        );

        const data = await resp.json();

        if (!resp.ok || !data.valid) {
          return { success: false, error: data.error || 'Token invalid' };
        }

        const today = new Date().toISOString().split('T')[0];
        const newSession: GuestSession = {
          orgSlug,
          token,
          orgId: data.orgId,
          orgName: data.orgName,
          verticalType: data.verticalType,
          validDate: today,
        };

        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        return { success: true };
      } catch {
        return { success: false, error: 'Eroare de rețea. Încercați din nou.' };
      } finally {
        setIsValidating(false);
      }
    },
    [orgSlug]
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem(GUEST_SESSION_KEY);
    setSession(null);
  }, []);

  return {
    guestSession: session,
    isGuest: !!session,
    isValidating,
    validateAndCreateSession,
    clearSession,
  };
}
