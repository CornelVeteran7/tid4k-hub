

## Problema

Tooltip-urile pe `SelectItem`-uri din dropdown nu funcționează deoarece **Radix UI Select** controlează intern `pointer-events` și focusul pe item-uri — tooltip-urile wrappate în jurul `SelectItem` nu primesc evenimentele de hover necesare. Radix Tooltip + Radix Select nu sunt compatibile când sunt nested astfel.

## Soluția

Înlocuirea Tooltip-urilor cu un **HoverCard** sau, mai simplu, cu un **layout inline** care afișează info-ul de prezență direct sub numele grupei în dropdown, fără a depinde de hover. Alternativ, putem folosi un `title` attribute nativ pe `SelectItem` (cel mai simplu, dar cu styling browser default).

Cea mai bună abordare: **afișare inline a datelor de prezență în dropdown** (sub formă de subtext), combinat cu un **Popover/HoverCard pe triggerul Select-ului** (nu pe items) care arată info-ul grupei selectate.

### Modificări

**`src/components/layout/AppLayout.tsx`** (desktop + mobile, ~2 locuri):
1. **Scoatere `<Tooltip>` wrapper** de pe `SelectItem` — nu funcționează cu Radix Select
2. **Adăugare subtext inline** pe fiecare `SelectItem`: afișare `{present}/{total} prezenți` ca `<span className="text-[10px] text-muted-foreground">` sub numele grupei
3. **Opțional**: pe `SelectTrigger`, adăugare Tooltip care arată stats-urile grupei selectate la hover pe trigger (nu pe items)

Structura nouă per SelectItem:
```tsx
<SelectItem key={g.id} value={g.id}>
  <div className="flex flex-col items-start">
    <span>{g.nume}</span>
    <span className="text-[10px] text-muted-foreground">{present}/{total} prezenți azi</span>
  </div>
</SelectItem>
```

Aceeași modificare în ambele locuri (desktop linia ~198 și mobile linia ~515).

