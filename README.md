# TID4K Hub — Interfata React pentru Talk to Infodisplay

## Despre proiect

Interfata moderna React/TypeScript care inlocuieste interfata PHP veche de pe tid4kdemo.ro.
Backend-ul PHP + MariaDB ramane acelasi, React-ul comunica prin `api_gateway.php`.

**Productie**: https://tid4kdemo.ro/app/
**Lovable**: Design si prototipare UI

## Arhitectura

```
React (tid4k-hub)  →  api_gateway.php  →  endpoint-uri PHP  →  MariaDB
     |                      |
 tid4kClient.ts      session bridge
 X-TID4K-Session     (id_cookie → $_SESSION)
```

## Fisiere protejate (NU modifica din Lovable!)

Aceste fisiere contin logica de conectare la backend-ul real:

| Fisier | Rol |
|--------|-----|
| `src/api/tid4kClient.ts` | Client HTTP central |
| `src/api/config.ts` | Configurare API, auto-detectie server |
| `src/api/documents.ts` | Documente + imagini din BD |
| `src/api/announcements.ts` | Anunturi |
| `src/api/attendance.ts` | Prezenta |
| `src/api/menu.ts` | Meniu saptamanal |
| `src/api/messages.ts` | Mesaje |
| `src/api/schedule.ts` | Orar |
| `src/api/stories.ts` | Povesti |
| `src/api/auth.ts` | Autentificare |
| `src/contexts/AuthContext.tsx` | Sesiune utilizator |

**GitHub Action**: Orice modificare a acestor fisiere creeaza automat un Issue de alerta.

## Zone libere pentru design (Lovable)

- `src/components/` — componente UI, design, layout
- `src/pages/` — partea de JSX/CSS (nu logica API)
- `src/styles/` — stiluri
- `public/` — assets, imagini

## Dezvoltare locala

```sh
git clone git@github.com:CornelVeteran7/tid4k-hub.git
cd tid4k-hub
npm install
npm run dev
```

## Deploy pe tid4kdemo.ro

```sh
npm run build
# Upload dist/ pe server via FTP la /public_html/app/
```

## Tehnologii

- Vite + React 18 + TypeScript
- shadcn/ui + Tailwind CSS
- PWA (vite-plugin-pwa)
- Backend: PHP 8.1 + MariaDB (existent)
