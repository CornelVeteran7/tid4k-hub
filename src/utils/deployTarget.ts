/**
 * Detecteaza mediul de deploy.
 *
 * - "development" (default): Lovable, localhost → totul vizibil, demo complet
 * - "production": tid4kdemo.ro si alte servere → restrictii active
 *
 * Setat la build time prin: VITE_DEPLOY_TARGET=production npm run build
 */
export const isProduction = import.meta.env.VITE_DEPLOY_TARGET === 'production';
export const isDevelopment = !isProduction;
