# Roles & Access Control

> Last updated: 2026-03-10

## Role System (`src/utils/roles.ts`)

Roles are stored as CSV in `profiles.status`: `"profesor,director"`, `"parinte"`, `"administrator"`.

### Utility Functions

| Function | Description |
|----------|-------------|
| `areRol(status, rol)` | Check if CSV contains role |
| `isInky(status, name)` | Check superuser (role=inky or name contains 'inky'/'infodisplay') |
| `getRoles(status)` | Parse CSV to array |
| `getRoleLabel(rol)` | Display label (Romanian) |
| `isAdmin(status, name)` | administrator OR director OR inky |
| `isStaff(status, name)` | profesor OR admin |

### Role Labels (Default)

| Role | Label | Access Level |
|------|-------|-------------|
| `inky` | Superuser | Everything + superadmin |
| `administrator` | Administrator | Full org admin |
| `director` | Director | Full org admin |
| `profesor` | Profesor | Content management |
| `secretara` | Secretară | Limited admin |
| `parinte` | Părinte | View-only for own children |
| `sponsor` | Sponsor | Sponsor dashboard only |

### Vertical-Aware Labels (`getVerticalRoleLabel()`)

| Role | Kids | Schools | Medicine | Construction | Workshops |
|------|------|---------|----------|-------------|-----------|
| parinte | Părinte | Părinte | Aparținător | Șef echipă | Client |
| profesor | Educatoare | Profesor | Medic | Inginer | Mecanic |

### Access Matrix

| Page | inky | admin/director | profesor | parinte |
|------|------|----------------|----------|---------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Admin Panel | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |
| SuperAdmin | ✅ | ❌ | ❌ | ❌ |
| Attendance (edit) | ✅ | ✅ | ✅ | ❌ |
| Attendance (view) | ✅ | ✅ | ✅ | ✅ (own children) |
| Announcements (create) | ✅ | ✅ | ✅ | ❌ |
| Schedule (edit) | ✅ | ✅ | ✅ | ❌ |
| Documents (upload) | ✅ | ✅ | ✅ | ❌ |
| Stories (create) | ✅ | ✅ | ✅ | ❌ |
