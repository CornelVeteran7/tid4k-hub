

# Simplify Navigation for Teachers

## The Problem

Right now, teachers see the same modules (Prezenta, Documente, Mesaje, Povesti, Meniu) in **three places**: the burger sidebar, the dashboard cards, and the config sidebar. This creates cognitive overload and makes the app feel complex rather than simple.

## The Philosophy

**The dashboard IS the app.** Teachers should tap a card and get their work done. The burger menu should only contain things that are NOT on the dashboard — account settings, admin tools, and the module configurator.

## What Changes

### Mobile (burger menu becomes a slim "More" menu)

The full sidebar with 12+ nav items gets replaced by a **compact bottom-sheet-style menu** with only secondary items:

```text
+---------------------------+
|  Maria Popescu            |
|  Profesor · Director      |
+---------------------------+
|  Configurare module    >  |  (opens existing ConfigSidebar)
|  Orar                  >  |  (not on dashboard)
|  Anunturi              >  |  (not on dashboard)
|  Profilul meu          >  |  (coming soon)
+---------------------------+
|  ADMIN                    |
|  Rapoarte              >  |
|  Utilizatori           >  |
|  Configurari           >  |
|  Infodisplay           >  |
+---------------------------+
|  Deconectare              |
+---------------------------+
```

Items like Prezenta, Documente, Mesaje, Povesti, Meniu are **removed** from this menu — they live on the dashboard cards exclusively.

### Desktop (sidebar becomes minimal)

The persistent left sidebar keeps only:
- **Acasa** (dashboard link)
- **Orar** (schedule — not a dashboard module)
- **Anunturi** (announcements — not a dashboard module)
- A separator
- **Admin section** (Rapoarte, Utilizatori, Configurari, Infodisplay) — role-gated
- **User info + logout** at the bottom

The dashboard module cards are the primary navigation for daily tasks.

### The "Configurare" button

Currently it lives as a standalone button above the module cards. It stays there — but also becomes accessible from the burger/more menu. This gives teachers two natural discovery paths.

## Technical Plan

### 1. Refactor `AppLayout.tsx` — Slim down sidebar nav items

- Create two arrays: `SECONDARY_NAV` (Orar, Anunturi) and `ADMIN_NAV` (Rapoarte, Utilizatori, Configurari, Infodisplay)
- Remove all module-duplicating items (Prezenta, Documente, Mesaje, Povesti, Meniu) from the sidebar
- Keep Acasa as the only primary link
- On mobile, convert the sidebar from a full sliding drawer to a Sheet (bottom or side) with the compact layout described above
- Add a "Configurare module" button that dispatches an event to open the ConfigSidebar from Dashboard

### 2. Update `Dashboard.tsx` — Listen for config open event

- Add a listener for a `open-config-sidebar` custom event so the burger menu can trigger it
- No other changes needed — the dashboard cards already work as the primary nav

### 3. Keep `ConfigSidebar.tsx` unchanged

- It already handles module visibility toggles and secondary nav links perfectly

### 4. Desktop sidebar cleanup

- The persistent sidebar shows: Acasa, Orar, Anunturi, separator, admin items, user card
- Much cleaner — teachers see 3-4 items instead of 12

## What Teachers Get

- **One place for daily work**: the dashboard cards
- **A tiny "more" menu** for everything else (settings, schedule, admin)
- **No duplicate navigation** — less confusion, faster muscle memory
- **Fewer taps** to do the things they do 50 times a day

