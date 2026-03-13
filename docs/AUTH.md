# Autentificare & Sesiuni

> Last updated: 2026-03-13

## Arhitectura

React app (tid4k-hub) comunică cu backend-ul PHP TID4K prin `api_gateway.php`.
Autentificarea se face cu **număr de telefon** — fără email/parolă, fără Supabase.

## Flux de autentificare

```
User deschide tid4kdemo.ro
  → redirect /app/ → AuthContext verifică sesiune
  → Dacă user=null → redirect /app/login
  → Pagina Login: tab Telefon (principal), Email (viitor), Cont nou (viitor)
  → User introduce telefon → tid4kApi.autentificareTelefon(telefon)
    → api_gateway.php?endpoint=autentificare_telefon
    → Caută în BD: SELECT * FROM utilizatori WHERE telefon LIKE '%telefon%'
    → Returnează: { id_cookie, nume_prenume, status, telefon, grupa_clasa_copil, toate_grupele_clase }
  → Login.tsx salvează sesiunea via setDemoUser() + localStorage('tid4k_session')
  → Redirect la /
```

## Restaurare sesiune (la refresh/revenire)

```
AuthContext mount
  → Verifică sessionStorage('demo_config')
    → Dacă există → buildUserSession(config) → user setat instant
  → Dacă nu, verifică localStorage('tid4k_session')
    → Dacă există → tid4kApi.verificaSesiune()
      → api_gateway.php?endpoint=verifica_sesiune (X-TID4K-Session header)
      → Server caută utilizator după id_cookie
      → Dacă valid → setUser + salvare demo_config în sessionStorage
      → Dacă invalid → ștergere tid4k_session
```

## Sesiune gateway (PHP)

Fiecare request API din React trimite header-ul `X-TID4K-Session` cu valoarea `id_cookie`.
`api_gateway.php` face bridge-ul:

1. Citește `X-TID4K-Session` header
2. Caută utilizatorul în BD: `SELECT * FROM utilizatori WHERE id_cookie = ?`
3. Setează `$_SESSION` vars: `id_utilizator`, `id_cookie`, `status`, `nume_prenume_curent`
4. Normalizează status compozit (ex: "profesor,director,administrator" → prioritizează "director")
5. Include endpoint-ul PHP cerut cu `TID4K_GATEWAY_MODE` constant definit

## Superuser Inky

- Telefon: `1313131313`
- Detectat în Login.tsx: `telefon.replace(/\D/g, '').includes('1313131313')`
- Primește `userName: 'Inky'` și acces complet la toate modulele
- În AppLayout: `isInky()` verifică status='inky' SAU nume conține 'inky'/'infodisplay'

## Demo mode (doar tid4kdemo.ro)

- **Buton "Intră în modul DEMO"** pe pagina Login (vizibil doar pe `tid4kdemo.ro`)
- **WhiteLabelSwitcher** (butonul floating din stânga-jos) — vizibil doar pe `tid4kdemo.ro`
- Conturi demo disponibile per vertical (configurate în `src/config/demoEnvironments.ts`):
  - **Kids**: Părinte, Educatoare, Director (3 conturi)
  - **Alte verticale** (Schools, Medicine, Construction, etc.): conturi specifice fiecărui domeniu

### Restricție pe alte servere

WhiteLabelSwitcher verifică `window.location.hostname.includes('tid4kdemo')`.
Pe serverele reale (tid4kg65.ro, etc.):
- WhiteLabelSwitcher **nu apare**
- Butonul Demo **nu apare** pe Login
- Doar autentificarea cu telefon este disponibilă

## Logout

```ts
setUser(null);
localStorage.removeItem('tid4k_session');
sessionStorage.removeItem('demo_config');
sessionStorage.removeItem('demo_branding');
sessionStorage.removeItem('demo_mode');
```

## Fișiere cheie

| Fișier | Rol |
|--------|-----|
| `src/contexts/AuthContext.tsx` | Provider central, restaurare sesiune, login/logout |
| `src/pages/Login.tsx` | UI autentificare cu telefon + buton demo |
| `src/api/tid4kClient.ts` | API client cu `autentificareTelefon()` și `verificaSesiune()` |
| `src/config/demoEnvironments.ts` | Conturi demo per vertical |
| `src/components/WhiteLabelSwitcher.tsx` | Comutator demo (doar tid4kdemo.ro) |
| `pages/api_gateway.php` (server) | Gateway PHP cu session bridge |
