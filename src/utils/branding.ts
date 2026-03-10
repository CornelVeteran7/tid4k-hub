/**
 * Dynamically applies organization branding colors to CSS custom properties.
 * Converts hex to HSL for Tailwind/shadcn compatibility.
 * Also applies vertical-specific theme via data-vertical attribute.
 */

function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslString(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

export function applyBrandingColors(primaryHex: string, secondaryHex: string) {
  if (!primaryHex || !secondaryHex) return;

  const [ph, ps, pl] = hexToHsl(primaryHex);
  const [sh, ss, sl] = hexToHsl(secondaryHex);

  const root = document.documentElement;

  // Primary color family
  root.style.setProperty('--sidebar', hslString(ph, ps, pl));
  root.style.setProperty('--sidebar-foreground', hslString(ph, 10, 95));
  root.style.setProperty('--sidebar-accent', hslString(ph, ps, Math.min(pl + 12, 50)));
  root.style.setProperty('--sidebar-accent-foreground', hslString(ph, 10, 95));

  // Accent (used for mobile menu bg, ticker, etc.)
  root.style.setProperty('--accent', hslString(sh, ss, sl));
  root.style.setProperty('--accent-foreground', hslString(sh, 10, 95));

  // Primary button color
  root.style.setProperty('--primary', hslString(ph, ps, pl));
  root.style.setProperty('--primary-foreground', hslString(ph, 10, 98));

  // Ring
  root.style.setProperty('--ring', hslString(ph, ps, pl));
}

/** Apply vertical-specific theme class on <html> */
export function applyVerticalTheme(verticalType: string) {
  const root = document.documentElement;
  // Remove any existing vertical
  root.removeAttribute('data-vertical');
  // Apply new vertical theme
  if (verticalType && verticalType !== 'kids') {
    root.setAttribute('data-vertical', verticalType);
  }
}

/** Load branding from org data and apply */
export function loadAndApplyBranding(org: { primary_color?: string | null; secondary_color?: string | null; vertical_type?: string }) {
  if (org.primary_color && org.secondary_color) {
    applyBrandingColors(org.primary_color, org.secondary_color);
  }
  if (org.vertical_type) {
    applyVerticalTheme(org.vertical_type);
  }
}

/** Default Inky costume URLs per vertical */
export const INKY_COSTUMES: Record<string, string> = {
  kids: '', // default inky
  schools: '',
  medicine: '', // will be generated
  construction: '',
  workshops: '',
  living: '',
  culture: '',
  students: '',
};
