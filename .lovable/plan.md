
Obiectiv: rezolv definitiv 2 probleme pe mobil: (1) reorder cu touchscreen încă produce scroll/select text, (2) fundalul meniului lateral mobil nu are aceeași nuanță ca banda de anunțuri.

Ce am verificat în cod și de ce apare problema:

1) Reorder touch nu e “capturat” complet
- În `useTouchReorder.ts`, `touchmove` e atașat pe fiecare card.
- Când degetul iese din card (foarte des pe mobil), evenimentul nu mai este prins local și pagina începe să facă scroll (`main` are `overflow-y-auto`).
- `onTouchEnd` e pe card; dacă touch-ul se termină în afara cardului, finalizează inconsistent.
- Long-press poate activa selecția de text deoarece în edit mode nu există blocare explicită de `user-select`.

2) Culoare meniu lateral mobil
- Bara de anunțuri folosește `bg-accent/90` (`AnnouncementsTicker.tsx`).
- Meniul lateral mobil (Sheet) folosește `bg-sidebar` în `AppLayout.tsx`, iar `--sidebar-background` este navy în `index.css`.
- Deci nu poate ieși aceeași nuanță ca banda, mai ales pe mobil.

Plan de implementare (în ordinea corectă):

A. Fix robust pentru drag & drop touch
1. În `useTouchReorder.ts`:
   - Activez listener-e native pe `document/window` DOAR pe durata drag-ului:
     - `touchmove` cu `{ passive: false }` + `preventDefault()`
     - `touchend` și `touchcancel` pentru cleanup sigur
   - Păstrez refs (`dragIdxRef`, `overIdxRef`, `itemsRef`) și mut toată logica de finalizare în handlerul nativ de end/cancel, ca să nu depind de terminarea touch-ului pe card.
   - Cleanup garantat la unmount și după drop (fără listener leaks).

2. În `ModuleCard.tsx`:
   - În edit mode adaug stiluri anti-selecție: `select-none`, plus blocare touch-callout/context menu pentru long-press.
   - Mențin comportamentul desktop (mouse drag) neschimbat.

3. În `index.css`:
   - Adaug clasă utilitară dedicată pentru starea de reorder (ex. fără selecție text pe toată interacțiunea), activată/dezactivată din hook pe durata drag-ului.

B. Aliniere culoare meniu lateral mobil cu banda de anunțuri
1. În `AppLayout.tsx` (doar pe meniul mobil din `SheetContent`):
   - schimb fundalul din `bg-sidebar` la aceeași bază ca ticker-ul (`bg-accent/90`, cu același feeling vizual).
   - păstrez desktop sidebar neschimbat (ca să nu reapară problema “prea light” pe desktop).

2. Ajustez doar elementele mobile afectate de contrast:
   - separatoare/border-e/hover states din meniul mobil pentru lizibilitate pe noul fundal.
   - textul rămâne clar și consistent.

Validare după implementare (obligatoriu):
1. Test end-to-end pe telefon real (sau emulator touch):
   - intru în edit mode, trag carduri lung/scurt, rapid/lent.
   - confirm: fără scroll de pagină în timpul drag-ului.
   - confirm: fără selecție de text la long-press.
   - confirm: drop finalizează corect și ordinea se salvează.

2. Test vizual pe mobil:
   - deschid meniul lateral și compar direct cu banda de anunțuri.
   - confirm că fundalul meniului are aceeași nuanță percepută ca banda.
   - verific contrastul pentru item activ/hover + iconițe/text.

Riscuri anticipate și prevenție:
- Risc: blocare accidentală scroll după drag.
  - Prevenție: cleanup strict pe `touchend/touchcancel/unmount`.
- Risc: conflict cu alte gesturi în edit mode.
  - Prevenție: activare listener global doar când drag-ul este activ.
- Risc: contrast insuficient în meniul mobil.
  - Prevenție: ajustări locale pe hover/border/text fără a modifica paleta desktop.
