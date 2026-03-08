

## Plan: Add App Documentation Area to Admin Panel

### What exists now
The admin panel already has a **Docs** tab (`DocsTab.tsx`, 743 lines) with comprehensive **technical** documentation: architecture, API endpoints, file structure, component descriptions. It also has a **Branding** tab for visual identity.

What's **missing** is **user-facing documentation** — a practical guide that explains how to actually use each feature of the app, organized by role (parent, teacher, director, admin). This is what we'll build.

### What we'll build
A new **"Ghid Utilizare"** (User Guide) tab in the Admin Panel, with:

1. **Quick Start guides per role** — step-by-step onboarding for Părinte, Profesor, Director, Administrator
2. **Module-by-module usage guides** — how to use Prezența, Mesaje, Documente, Meniu, Orar, Povești, Ateliere, Anunțuri, Rapoarte
3. **Admin operations guide** — managing schools, users, settings, sponsors
4. **FAQ / Troubleshooting** — common questions and solutions
5. **Feature overview** — high-level summary of what the app does

### Technical approach

**New file:** `src/components/admin/UserGuideTab.tsx`
- Same collapsible `DocGroup` pattern as the existing `DocsTab.tsx` for visual consistency
- Organized into 4 main collapsible sections: Quick Start, Modules, Administration, FAQ
- Each section contains practical, non-technical instructions with role badges showing who can access what
- Icons from lucide-react to match existing style

**Modified file:** `src/pages/AdminPanel.tsx`
- Add new tab `{ value: 'ghid', label: 'Ghid', icon: HelpCircle }` to the TABS array
- Import and render `<UserGuideTab />` in a new `TabsContent`
- Position it before or after the existing Docs tab

### Content structure

```text
Ghid Utilizare
├── Prezentare generală
│   └── Ce este TID4K, ce rol are fiecare tip de utilizator
├── Ghid rapid per rol
│   ├── Părinte — vezi prezența, mesaje, documente, meniu
│   ├── Profesor — marchează prezența, trimite mesaje, upload docs
│   ├── Director — rapoarte, orar cancelarie, supervizare
│   └── Administrator — școli, utilizatori, setări, sponsori
├── Ghiduri pe module
│   ├── Prezența — cum marchezi, vizualizare săptămânală/lunară
│   ├── Mesaje — conversații, trimitere, notificări
│   ├── Documente — upload, categorii, ștergere
│   ├── Meniul Săptămânii — editare, date nutriționale
│   ├── Orar — vizualizare, editare celule
│   ├── Povești — navigare, TTS, categorii
│   ├── Ateliere — creare, publicare, categorii
│   ├── Anunțuri — creare, ticker, urgențe
│   ├── Rapoarte — grafice, filtrare, export
│   ├── InfoDisplay — configurare ecrane TV
│   └── Social Media — Facebook & WhatsApp sync
├── Administrare
│   ├── Gestionare școli
│   ├── Gestionare utilizatori și roluri
│   ├── Setări sistem
│   └── Gestionare sponsori
└── Întrebări frecvente (FAQ)
    ├── Cum îmi schimb PIN-ul?
    ├── De ce nu văd un modul?
    ├── Cum adaug un copil nou?
    ├── Cum funcționează notificările?
    └── Cum contactez suportul?
```

### Scope
- 1 new file, 1 modified file
- Content is in Romanian (matching the rest of the app)
- No new dependencies needed

