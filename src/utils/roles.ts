/**
 * Checks if a CSV status string contains a given role.
 * Example: areRol("profesor,director", "profesor") → true
 */
export function areRol(status: string, rol: string): boolean {
  if (!status) return false;
  if (status === rol) return true;
  const roluri = status.split(',').map((r) => r.trim().toLowerCase());
  return roluri.includes(rol.toLowerCase());
}

/**
 * Checks if user is the Inky superuser.
 */
export function isInky(status: string, numePrenume: string): boolean {
  return (
    areRol(status, 'inky') ||
    numePrenume.toLowerCase().includes('inky') ||
    numePrenume.toLowerCase().includes('infodisplay')
  );
}

/**
 * Get all roles from a CSV status string.
 */
export function getRoles(status: string): string[] {
  if (!status) return [];
  return status.split(',').map((r) => r.trim().toLowerCase()).filter(Boolean);
}

/**
 * Get display label for a role.
 */
export function getRoleLabel(rol: string): string {
  const labels: Record<string, string> = {
    parinte: 'Părinte',
    profesor: 'Profesor',
    director: 'Director',
    administrator: 'Administrator',
    secretara: 'Secretară',
    inky: 'Superuser',
  };
  return labels[rol.toLowerCase()] || rol;
}
