# Deployment & Structura Server

> Last updated: 2026-03-13

## Structura URL pe server

```
tid4kdemo.ro/              → index.html (redirect la /app/)
tid4kdemo.ro/app/          → React SPA (tid4k-hub build)
tid4kdemo.ro/pages/        → PHP backend (TID4K clasic)
tid4kdemo.ro/avizier/      → Afișaj static HTML
```

## Fișiere pe server

### Root (`/public_html/`)
| Fișier | Scop |
|--------|------|
| `index.html` | Redirect la `/app/`, dezînregistrare SW vechi de pe root |
| `manifest.json` | PWA manifest la root (scope `/app/`) |
| `sw.js` | Cleanup service worker — șterge cache-uri vechi și se dezînregistrează |

### App (`/public_html/app/`)
| Fișier | Scop |
|--------|------|
| `index.html` | Entry point React SPA |
| `manifest.json` | PWA manifest (start_url `/app/`, scope `/app/`) |
| `.htaccess` | SPA fallback routing (RewriteRule → index.html) |
| `sw.js` | Workbox service worker generat de vite-plugin-pwa |
| `assets/` | JS/CSS cu hash în nume (cache-busting) |
| `favicon.png`, `favicon-192.png`, `favicon-512.png` | Icoane PWA |

## Build & Deploy

### Build local
```bash
cd tid4k-hub
npm run build    # Output în dist/
```

### Deploy pe server via FTP
```bash
FTP_CRED="tid4kdem:PAROLA"
FTP_BASE="ftp://ftp.tid4kdemo.ro/public_html/app"

# Upload fișiere root din dist/
for f in index.html manifest.json sw.js registerSW.js workbox-*.js; do
  curl -s -T "dist/$f" "$FTP_BASE/$f" --user "$FTP_CRED"
done

# Upload assets (JS/CSS cu hash)
for f in dist/assets/*; do
  curl -s --ftp-create-dirs -T "$f" "$FTP_BASE/assets/$(basename $f)" --user "$FTP_CRED"
done
```

### Push la GitHub (pentru Lovable)
```bash
git add src/
git commit -m "descriere modificare"
git push origin main
```

## PWA

- **Vite config**: `base: '/app/'` în `vite.config.ts`
- **BrowserRouter**: `basename="/app"` în `App.tsx`
- **Manifest scope**: `/app/`
- **Service worker**: generat de `vite-plugin-pwa` cu Workbox, precache la build
- **Instalare**: vizitează `tid4kdemo.ro` → redirect `/app/` → browser oferă install prompt

## Protecție fișiere API

- **`.github/workflows/protectie-api.yml`**: GitHub Action care creează Issue alert când `src/api/` este modificat
- **`.github/CODEOWNERS`**: `src/api/` și `AuthContext.tsx` owned by @CornelVeteran7

## Propagare pe alte servere

Când interfața este gata pentru producție:
1. Build cu `npm run build`
2. Upload `dist/` pe fiecare server (tid4kg65.ro, etc.)
3. Pe alte servere: **WhiteLabelSwitcher și butonul Demo NU apar** (verificare hostname `tid4kdemo`)
4. Doar autentificarea cu telefon este disponibilă pe serverele reale
