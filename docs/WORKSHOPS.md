# Workshop (Ateliere) Management System

## For Admins

### Creating a Workshop
1. Go to **Panou Admin → Ateliere** tab
2. Click **Atelier nou**
3. Fill in: title, description, category, month, instructor, duration, materials
4. Choose target: **Toate unitățile** or a specific school
5. Click **Creează** — workshop is saved as Draft

### Publishing a Workshop
1. Find the draft workshop card
2. Click **Publică**
3. Select target schools in the confirmation dialog
4. Click **Publică și notifică**
5. The workshop becomes visible on teacher dashboards and a push notification is sent

### Editing After Publish
You can edit a published workshop. Changes are reflected immediately on all dashboards.

---

## For Developers / AI

### Architecture

| Component | Path | Purpose |
|-----------|------|---------|
| API layer | `src/api/workshops.ts` | Types, mock data, CRUD functions |
| Admin tab | `src/components/admin/WorkshopsTab.tsx` | Full CRUD UI + publish flow |
| Dashboard preview | `src/components/dashboard/ModuleHub.tsx` | Shows workshop-of-month on ATELIERE card |
| Module card | `src/components/dashboard/ModuleCard.tsx` | Accepts `preview` prop for inline content |
| Notifications | `src/contexts/NotificationContext.tsx` | `workshop` notification type |

### TypeScript Interfaces

```typescript
interface Workshop {
  id_atelier: number;
  titlu: string;
  descriere: string;
  luna: string;          // YYYY-MM format
  imagine_url: string;
  categorie: 'arta' | 'stiinta' | 'muzica' | 'sport' | 'natura';
  materiale: string[];
  instructor: string;
  durata_minute: number;
  scoli_target: string[];  // ['all'] or specific school IDs
  publicat: boolean;
  data_creare: string;
  data_publicare?: string;
}
```

### Notification Integration

Workshop notifications use type `'workshop'` with icon `'paintbrush'`. They are generated when a published workshop exists for the current month that hasn't been seen (tracked via `localStorage` key `tid4k_seen_workshop_[id]`).

---

## API Reference (Backend Implementation)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ateliere.php?action=list&school_id=X&luna=YYYY-MM` | List workshops, optional filters |
| `GET` | `/ateliere.php?action=current&school_id=X` | Get this month's published workshop |
| `POST` | `/ateliere.php?action=create` | Create new workshop (body: WorkshopCreate) |
| `POST` | `/ateliere.php?action=update` | Update workshop (body: `{ id, ...fields }`) |
| `POST` | `/ateliere.php?action=publish` | Publish + push (body: `{ id, scoli_target }`) |
| `POST` | `/ateliere.php?action=delete` | Delete workshop (body: `{ id }`) |
| `POST` | `/ateliere.php?action=notify` | Trigger push notifications for a workshop |

### Database Table: `ateliere`

```sql
CREATE TABLE ateliere (
  id_atelier INT AUTO_INCREMENT PRIMARY KEY,
  titlu VARCHAR(255) NOT NULL,
  descriere TEXT,
  luna VARCHAR(7) NOT NULL,
  imagine_url VARCHAR(500),
  categorie ENUM('arta','stiinta','muzica','sport','natura') NOT NULL,
  materiale JSON,
  instructor VARCHAR(255),
  durata_minute INT DEFAULT 45,
  scoli_target JSON NOT NULL DEFAULT '["all"]',
  publicat TINYINT(1) DEFAULT 0,
  data_creare DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_publicare DATETIME NULL
);
```
