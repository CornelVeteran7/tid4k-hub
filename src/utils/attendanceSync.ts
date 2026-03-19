/**
 * Event bus minimal pentru sincronizarea prezentei intre componente.
 * Cand o componenta salveaza prezenta, emite 'attendance-updated'.
 * Celelalte componente asculta si isi reincarc datele.
 */

type Listener = (grupa: string, data: string) => void;

const listeners = new Set<Listener>();

export function onAttendanceUpdated(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitAttendanceUpdated(grupa: string, data: string) {
  listeners.forEach((fn) => fn(grupa, data));
}
