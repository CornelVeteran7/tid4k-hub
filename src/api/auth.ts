/**
 * API Auth - conectat la TID4K backend
 *
 * Autentificare prin numar de telefon (mecanismul actual TID4K)
 * + pregatire pentru email/parola in viitor
 */

import { tid4kApi } from './tid4kClient';

export async function logout(): Promise<void> {
  tid4kApi.delogare();
}

export async function validateSession() {
  const sesiune = await tid4kApi.verificaSesiune();
  return sesiune || null;
}
