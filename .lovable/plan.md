

# Plan: Prezența și Contribuția — Vizualizare completă per rol

## Obiectiv
Transformarea modulului Prezență & Contribuție într-un sistem complet care acoperă toate rolurile: **părinte** (switch între copii, vizualizare prezență, plată online/cash), **profesor** (prezență la grupa proprie), **admin/secretară/contabil** (vizualizare cross-grupă, confirmare plăți, export Excel, istoric complet), cu Stripe Connect placeholder pentru conectarea contului bancar.

---

## Ce există deja
- Tabelul `children` cu `parinte_id` (FK la `profiles`) și `group_id`
- Tabelul `attendance` cu `child_id`, `data`, `prezent`, `observatii`
- Tabelele `contributions_config` și `contributions_monthly` cu `amount_paid`, `status`, `notes`
- Funcționalitate existentă: profesorii fac prezența săptămânal, admini exportă CSV/PDF, părinții văd contribuțiile
- Edge function `create-contribution-checkout` cu Stripe (mock mode activ)

## Ce lipsește
- Switch între copii pentru părinți (copii în grupe diferite)
- Calendar vizualizare prezență per copil cu filtrare lună/săptămână
- Declarare plată cash de către părinte (cu confirmare staff)
- Vizualizare cross-grupă "Toate grupele" pentru admin
- Interfață Stripe Connect placeholder (burger menu)
- Istoric contribuții cu export Excel (.xlsx-like CSV)

---

## Modificări planificate

### 1. Baza de date — migrare nouă

**Tabel nou: `contribution_cash_declarations`**
```sql
CREATE TABLE contribution_cash_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  child_id UUID NOT NULL REFERENCES children(id),
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  notes TEXT,
  declared_by UUID REFERENCES profiles(id),  -- părintele
  confirmed_by UUID REFERENCES profiles(id), -- staff
  status TEXT DEFAULT 'declared', -- 'declared', 'confirmed', 'rejected'
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);
```

**Coloană nouă pe `contributions_monthly`:**
```sql
ALTER TABLE contributions_monthly ADD COLUMN payment_method TEXT DEFAULT 'pending';
-- Values: 'pending', 'cash', 'online', 'cash_declared'
```

**Tabel nou: `stripe_connect_accounts`** (placeholder)
```sql
CREATE TABLE stripe_connect_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id),
  stripe_account_id TEXT,
  status TEXT DEFAULT 'not_connected', -- 'not_connected', 'pending', 'active'
  bank_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

RLS pe toate tabelele noi cu `user_org_match()`.

### 2. Vizualizare Părinte — Pagina Prezență refactorizată

**Fișier: `src/pages/Attendance.tsx`** — secțiunea părinte

- **Child Switcher**: selector dropdown/tabs în header cu toți copiii părintelui (query `children WHERE parinte_id = user.id`). Fiecare copil afișat cu grup aferentă.
- **Calendar prezență per copil selectat**: vizualizare calendar lunar cu zile colorate (verde = prezent, gri = absent, alb = fără date). Filtre: lună, săptămână.
- **Card contribuție**: afișează suma de plătit luna curentă, cu badge "Neachitat"/"Plătit"/"Declarat cash".
- **Buton "Plătește online"**: existent, cu toast despre comision suplimentar (~3.5% Stripe + 2.5% platformă). Text: "Plata online include un comision de procesare de X lei."
- **Buton "Declară plată cash"**: dialog cu câmp sumă, notițe, confirmare. Salvează în `contribution_cash_declarations` cu `status: 'declared'`. Badge devine "Așteptare confirmare".

### 3. Vizualizare Admin/Secretară — Tab "Toate grupele"

**Fișier: `src/pages/Attendance.tsx`** — tab-ul Contribuții

- **Tab nou "Toate grupele"** lângă tab-ul per-grupă existent (vizibil doar pentru admin/secretară/director).
- Tabel: grupă, copil, zile prezent, total, status, metoda plată, acțiuni.
- Filtrare: lună, an, grupă specifică (dropdown), status plată.
- **Declarații cash pending**: secțiune cu notificări pentru declarațiile neconfirmate. Buton "Confirmă" / "Respinge" per declarație.
- **Export Excel**: CSV cu BOM UTF-8 (existent), extins cu coloanele: grupa, metoda_plata, note, data_plata.

### 4. Interfață Stripe Connect — Burger Menu

**Fișier nou: `src/components/settings/SettingsPayments.tsx`**

- Accesibil doar admin/director din pagina Settings sau din burger menu.
- Card placeholder: "Conectează contul bancar al instituției"
- Status: Nu conectat / În curs / Activ
- Buton "Conectează cu Stripe" — afișează toast/dialog explicativ (placeholder, fără integrare reală).
- Info text despre comisionul platformei (2.5%) și ce primește instituția.

**Adăugare rută în burger menu** (`AppLayout.tsx`): item "Plăți & Cont bancar" vizibil doar admin/director.

### 5. API Layer

**Fișier: `src/api/attendance.ts`** — funcții noi:
- `getParentChildren(parentId)` — returnează copiii cu grupa aferentă
- `getChildMonthlyCalendar(childId, month, year)` — zile cu status prezent/absent
- `declareCashPayment(childId, month, year, amount, notes)` — insert în `contribution_cash_declarations`
- `getCashDeclarations(month, year, groupId?)` — pentru admin
- `confirmCashDeclaration(declarationId, confirmed)` — admin action
- `getAllGroupsContributions(month, year)` — cross-grupă query
- `getContributionHistory(filters)` — istoric cu paginare

### 6. Demo data updates

**Fișier: `src/config/demoEnvironments.ts`**
- Contul Părinte Kids: adăugare al doilea copil într-o grupă diferită (`albinute`).

---

## Arhitectura per rol (rezumat)

```text
┌─────────────┬──────────────────────────────────────────────────────┐
│ Rol         │ Ce vede în tab-ul Prezență & Contribuție            │
├─────────────┼──────────────────────────────────────────────────────┤
│ Părinte     │ Switch copii → Calendar prezență → Contribuție cu   │
│             │ plată online / declarare cash                       │
├─────────────┼──────────────────────────────────────────────────────┤
│ Profesor    │ Prezență săptămânală (edit) + Statistici + Contrib. │
│             │ doar pentru grupa proprie                           │
├─────────────┼──────────────────────────────────────────────────────┤
│ Admin/      │ Tot ce vede profesorul + tab "Toate grupele" +      │
│ Secretară/  │ confirmare declarații cash + export extins +        │
│ Director    │ Settings → Stripe Connect placeholder               │
└─────────────┴──────────────────────────────────────────────────────┘
```

## Ordine implementare
1. Migrare DB (3 operații)
2. API functions noi
3. Parent child-switcher + calendar prezență
4. Declarare cash + confirmare admin
5. Tab cross-grupă admin
6. Settings Payments placeholder
7. Demo data update

