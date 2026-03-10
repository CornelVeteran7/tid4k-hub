# Database Schema Reference

> Last updated: 2026-03-10

All tables are in Supabase PostgreSQL. Full types in `src/integrations/supabase/types.ts`.

## Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `organizations` | Multi-tenant orgs | `name, slug, vertical_type, primary_color, secondary_color, logo_url, nfc_enabled` |
| `profiles` | User profiles (linked to auth.users) | `id (=auth.users.id), nume_prenume, email, status (CSV roles), organization_id` |
| `groups` | Classes/rooms/departments | `nume, slug, tip, organization_id, school_id` |
| `schools` | Schools/entities per org | `nume, adresa, tip, nr_copii, nr_profesori, activ, sponsori_activi[]` |
| `org_config` | Key-value org settings | `organization_id, config_key, config_value (JSON)` |
| `modules_config` | Module enable/disable per org | `organization_id, module_key, is_active, config (JSON)` |

## Content Tables

| Table | Purpose |
|-------|---------|
| `announcements` | Org announcements |
| `announcement_reads` | Read tracking per user |
| `children` | Children/students/patients per group |
| `attendance` | Daily attendance records per child |
| `documents` | Uploaded files metadata |
| `schedule` | Weekly schedule cells |
| `menu_items` | Legacy menu items |
| `menu_weeks` / `menu_meals` / `menu_dishes` / `menu_dish_ingredients` | OMS menu system |
| `nutritional_data` | Legacy nutritional data |
| `nutritional_reference` | Ingredient nutritional database |
| `menu_metadata` | Menu signatures and allergens |
| `conversations` / `messages` | Messaging system |

## Domain Tables

| Table | Vertical | Purpose |
|-------|----------|---------|
| `construction_sites` | construction | Building sites |
| `construction_teams` | construction | Work teams |
| `construction_tasks` | construction | Tasks per site |
| `construction_costs` | construction | Cost tracking |
| `construction_team_assignments` | construction | Weekly team-site assignments |
| `culture_shows` | culture | Theater shows |
| `show_cast` | culture | Cast per show |
| `show_sponsors` | culture | Sponsors per show |
| `culture_surtitle_blocks` | culture | Surtitle text blocks |
| `doctor_profiles` | medicine | Doctor profiles |
| `medicine_services` | medicine | Medical services |
| `queue_config` / `queue_entries` | medicine/students | Queue system |
| `inventory_items` / `inventory_movements` | all | Inventory tracking |
| `living_apartments` / `living_expenses` | living | Residential management |
| `magazine_articles` | schools | School magazine |
| `school_clubs` / `club_memberships` | schools | Student clubs |
| `cancelarie_teachers` / `cancelarie_activities` | kids/schools | Teacher management |
| `contributions_config` / `contributions_monthly` | kids | Monthly contribution tracking |
| `guest_tokens` | all | Daily QR access tokens |
| `external_admins` | living | External entity admin access |

## Integration Tables

| Table | Purpose |
|-------|---------|
| `facebook_settings` / `facebook_posts` | Facebook integration |
| `infodisplay_panels` / `infodisplay_ticker` / `infodisplay_qr` / `infodisplay_settings` | Display content |

## Enums

```sql
vertical_type: 'kids' | 'schools' | 'medicine' | 'living' | 'culture' | 'students' | 'construction' | 'workshops'
```
