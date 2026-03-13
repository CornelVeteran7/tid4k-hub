# Pages Reference

> Last updated: 2026-03-13

## Public Routes (No Auth)

### `/login` — Login Page
**File**: `src/pages/Login.tsx`
**Purpose**: Autentificare cu telefon (principal), email/parolă, Google OAuth, cont nou
**Features**:
- Tab principal: login cu **număr de telefon** (caută în BD TID4K via `api_gateway.php`)
- Tab email/parolă (viitor)
- Tab înregistrare cont nou (viitor)
- Buton **"Intră în modul DEMO"** (vizibil doar pe `tid4kdemo.ro`) — logare ca Părinte demo
- Org-branded login when accessed via `/login/:orgSlug`
- Redirects to `/` on successful auth
- Superuserul Inky se autentifică cu telefonul 1313131313

### `/demo` — Demo Redirect
**Route**: Redirects to `/` via `<Navigate to="/" replace />`
**Note**: Funcționalitatea demo se accesează prin butonul de pe Login (doar tid4kdemo.ro) sau prin WhiteLabelSwitcher

### `/display/:orgSlug` — Public Display
**File**: `src/pages/PublicDisplay.tsx` (1348 lines)  
**Purpose**: Full-screen digital signage for TVs/monitors  
**Features**:
- Rotates through content panels (announcements, menu, schedule, timetable, magazine, queue, sponsors)
- Daily-rotating QR code for guest access (`/qr/:orgSlug?t=<token>`)
- Auto-refreshes token at midnight
- Vertical-aware: shows different content types per vertical
- Weather widget, clock, org branding
- Sponsor panel integration via `useSponsorRotation`

### `/qr/:orgSlug` — QR Portal (Guest Access)
**File**: `src/pages/QRCancelarie.tsx` (781 lines)  
**Purpose**: Mobile-first portal accessed by scanning QR from display  
**Access Levels**:
- **No access**: Shows landing screen with "Continuă ca vizitator" + "Autentificare" buttons
- **Guest**: Token-validated session, shows public content
- **Authenticated**: Shows personal data (own children, own apartment, etc.)
**Content per vertical**:
- Kids: announcements, menu, schedule, photos, documents, sponsors
- Schools: announcements, timetable, magazine, documents, sponsors
- Medicine: announcements, queue ticket, doctors, services, sponsors
- Construction: announcements, SSM status, active tasks, site info
- Culture: announcements, show program, surtitle links, sponsors

### `/queue/:orgSlug` — Queue Ticket (Public)
**File**: `src/pages/QueueTicket.tsx` (472 lines)  
**Purpose**: Public queue system — visitors take a ticket and wait  
**Features**:
- Shows current queue status + estimated wait time
- Take-a-ticket button with service type selection
- Realtime updates via polling
- Doctor/service profiles for medicine vertical
- Ticket history and status tracking

### `/site/:orgSlug` — Public Website
**File**: `src/pages/PublicWebsite.tsx` (319 lines)  
**Purpose**: Auto-generated public website for each organization  
**Features**:
- Configurable sections: Home, About, Announcements, Documents, Contact
- Org branding applied dynamically
- Responsive landing page template

### `/surtitle/:orgSlug` — Surtitle Audience Landing
**File**: `src/pages/SurtitleAudience.tsx`  
**Purpose**: Audience selects their show to view live surtitles

### `/surtitle/view/:showId` — Surtitle Audience View
**File**: `src/pages/SurtitleAudienceView.tsx`  
**Purpose**: Real-time surtitle display for audience members  
**Features**: Language selection, large text display, auto-scrolling

### `/surtitle/operate/:showId` — Surtitle Operator
**File**: `src/pages/SurtitleOperator.tsx` (202 lines)  
**Purpose**: Backstage operator console for advancing surtitle blocks  
**Features**: Previous/current/next block preview, keyboard shortcuts, blackout toggle

### `/program/:showId` — Digital Program
**File**: `src/pages/DigitalProgram.tsx` (221 lines)  
**Purpose**: Digital show program for theater audiences  
**Features**: Cast bios, sponsors, synopsis, show details

---

## Protected Routes (Auth Required)

### `/` — Dashboard
**File**: `src/pages/Dashboard.tsx` (504 lines)  
**Purpose**: Main dashboard with vertical-aware modules  
**Features**:
- Current meal display (auto-detects time of day)
- Children scroller (kids/schools vertical)
- Module hub with reorderable cards
- Announcements ticker
- Quick stats and charts
- Sponsor integration
- Group switcher

### `/prezenta` — Attendance
**File**: `src/pages/Attendance.tsx` (810 lines)  
**Purpose**: Weekly attendance tracking + monthly contributions  
**Features**:
- Weekly grid view with checkboxes per child per day
- Per-child observations
- Monthly contribution calculator (attendance × daily rate)
- Payment tracking (plătit/neplătit)
- Stats tab with charts
- Print/export functionality
- Parent view: sees only own children's attendance

### `/documente` — Documents
**File**: `src/pages/Documents.tsx` (224 lines)  
**Purpose**: File sharing per group  
**Features**:
- Upload via PHP backend (fetch_iframes/fetch_images endpoints)
- Categories: Activități, Administrativ, Teme, Fotografii
- Grid/list view toggle
- Thumbnail previews for images
- Download and delete

### `/mesaje` — Messages
**File**: `src/pages/Messages.tsx` (461 lines)  
**Purpose**: Real-time messaging between users  
**Features**:
- Conversation list with search
- Message delivery via PHP backend
- Read receipts (single/double check)
- Mobile-responsive: conversation list ↔ chat toggle
- Avatar colors based on name hash
- Date grouping (Azi, Ieri, date)

### `/anunturi` — Announcements
**File**: `src/pages/Announcements.tsx` (213 lines)  
**Purpose**: Organization-wide announcements  
**Features**:
- Create announcements with priority (normal/urgent)
- Expiry dates
- Hide/show from ticker
- Mark as read
- Cross-post to WhatsApp/Facebook (toggles)
- Admin toggle for viewing all vs public only

### `/orar` — Schedule
**File**: `src/pages/Schedule.tsx` (402 lines)  
**Purpose**: Weekly class/group schedule grid  
**Features**:
- 5-day × 9-hour grid with color-coded cells
- Edit mode for staff (add subject, teacher, room, color)
- QR code per class for quick sharing
- Room-based QR codes
- Print functionality
- Save via PHP backend (salveaza_orar.php)

### `/orar-cancelarie` — Cancelarie Schedule
**File**: `src/pages/ScheduleCancelarie.tsx`  
**Purpose**: Teacher-centric schedule view with QR attendance

### `/orar-avansat` — Advanced Timetable
**File**: `src/pages/AdvancedTimetable.tsx`  
**Purpose**: Multi-class timetable management for schools

### `/meniu` — Weekly Menu (OMS-Compliant)
**File**: `src/pages/WeeklyMenu.tsx` (561 lines)  
**Purpose**: Nutritionally-tracked weekly menu system  
**Features**:
- 5-day × 4-meal grid (mic dejun, gustare 1, prânz, gustare 2)
- Per-dish ingredient tracking with nutritional values
- Age group calorie targets (1-3, 3-7 years)
- Banned ingredient detection
- Nutritional reference database autocomplete
- Publish/unpublish workflow
- Week navigation with date picker

### `/povesti` — Stories
**File**: `src/pages/Stories.tsx` (523 lines)  
**Purpose**: Interactive story library for children  
**Features**:
- Three modes: Read (text), Listen (audio), Watch (video)
- Story characters with avatars
- Categories: educative, morale, distractive
- Age group filtering
- Favorites system
- Audio player with progress
- Create stories (staff only)

### `/rapoarte` — Reports
**File**: `src/pages/Reports.tsx` (114 lines)  
**Purpose**: Analytics and statistics  
**Features**:
- Attendance trends (line chart)
- User activity (bar chart)
- Documents by category (pie chart)
- Date range filter
- Export to PDF/Excel

### `/admin` — Admin Panel
**File**: `src/pages/AdminPanel.tsx` (119 lines)  
**Purpose**: Organization administration hub  
**Access**: Admin/Director/Inky only  
**Tabs** (vertical-filtered):
| Tab | Component | Purpose |
|-----|-----------|---------|
| Scoli | SchoolsTab | Manage schools/entities |
| Utilizatori | UsersTab | User management |
| Orar | ScheduleTab | Schedule management |
| Meniu | MenuTab | Menu management |
| Ateliere | WorkshopsTab | Workshop management |
| Sponsori | SponsorsTab | Sponsor management |
| Politica | SponsorPolicyTab | Sponsor policies |
| Display | DisplayPreviewTab | Display preview & config |
| Website | WebsiteTab | Public website config |
| Module | ModuleTogglesTab | Enable/disable modules |
| Setări | SettingsTab | General settings |
| Ghid | UserGuideTab | User guide |
| Docs | DocsTab | API documentation |
| Branding | BrandingTab | Logo & colors |
| BI | BusinessIntelligenceTab | Business intelligence |
| Teme | ThemeEditorTab | Theme editor per vertical/org |

### `/configurari` or `/settings` — Settings
**File**: `src/pages/Settings.tsx` (89 lines)  
**Purpose**: Organization settings page  
**Tabs**: General, Branding, Vertical, Modules, Users, Display, Integrations

### `/profil` — My Profile
**File**: `src/pages/MyProfile.tsx` (320 lines)  
**Purpose**: User profile with children list, roles, notification preferences

### `/sponsori` — Sponsor Admin
**File**: `src/pages/SponsorAdmin.tsx` (555 lines)  
**Purpose**: Manage sponsor campaigns  
**Features**:
- Campaign lifecycle: draft → active → paused → expired → archived
- 4 promo types: card_dashboard, infodisplay, ticker, inky_popup
- Campaign editor with preview
- Stats: impressions, clicks, CTR
- Per-school sponsor visibility

### `/infodisplay` — Infodisplay Manager
**File**: `src/pages/Infodisplay.tsx` (168 lines)  
**Purpose**: Manage infodisplay panel content  
**Features**: Panel rotation with configurable duration, ticker messages, QR codes

### `/santiere` — Construction Dashboard
**File**: `src/pages/ConstructionDashboard.tsx` (1273 lines)  
**Purpose**: Full construction site management  
**Features**:
- Sites: CRUD with progress tracking, budget, authorization number
- Teams: member management, specializations
- Tasks: kanban-style with assignment, priority, photos
- Costs: categorized expense tracking with charts
- Weekly team assignments calendar
- SSM checklist integration

### `/santiere/worker` — Construction Worker View
**File**: `src/pages/ConstructionWorker.tsx`  
**Purpose**: Simplified mobile view for construction workers

### `/inventar` — Inventory
**File**: `src/pages/Inventory.tsx` (269 lines)  
**Purpose**: Inventory management with QR codes  
**Features**: Items CRUD, categories, stock movements (in/out), QR per item, location tracking

### `/ssm` — SSM (Safety)
**File**: `src/pages/SSM.tsx` (394 lines)  
**Purpose**: Health & Safety checklist management  
**Features**: Template creation, daily checklists, signature canvas, PDF generation

### `/revista` — Magazine
**File**: `src/pages/Magazine.tsx` (383 lines)  
**Purpose**: School magazine + clubs  
**Features**: Article workflow (draft → review → published), club memberships, categories

### `/atelier` — Workshop Dashboard
**File**: `src/pages/WorkshopDashboard.tsx` (242 lines)  
**Purpose**: Auto service workshop management  
**Features**: Vehicle profiles, appointments (scheduled/in-progress/done), customer management

### `/bloc` — Living Dashboard
**File**: `src/pages/LivingDashboard.tsx` (293 lines)  
**Purpose**: Residential building management  
**Features**: Apartments, monthly expenses by category, external admin entities, payment tracking

### `/spectacole` — Culture Show Editor
**File**: `src/pages/CultureShowEditor.tsx` (365 lines)  
**Purpose**: Theater show management  
**Features**: Show CRUD, cast management, show sponsors, surtitle blocks editor

### `/supratitrare` — Surtitles Manager
**File**: `src/pages/Surtitles.tsx` (352 lines)  
**Purpose**: Manage surtitle shows and blocks  
**Features**: Show CRUD, block sequencing, operator mode, audience mode, multi-language

### `/coada` — Queue Admin
**File**: `src/pages/QueueAdmin.tsx` (505 lines)  
**Purpose**: Queue management for medicine/university  
**Features**: Call next, service points, daily reset, wait time estimation, statistics

### `/cabinet` — Medicine Admin
**File**: `src/pages/MedicineAdmin.tsx` (362 lines)  
**Purpose**: Manage doctors and medical services  
**Features**: Doctor profiles (photo, bio, specialization), services with pricing, ordering

### `/video` — Video Generation
**File**: `src/pages/VideoGeneration.tsx` (196 lines)  
**Purpose**: Generate video content from templates  
**Templates**: Slideshow, Weekly recap, Event, Promo

### `/social-facebook` — Facebook Integration
**File**: `src/pages/SocialMediaFacebook.tsx` (141 lines)  
**Purpose**: Post to Facebook page, view post history

### `/social-whatsapp` — WhatsApp Integration
**File**: `src/pages/SocialMediaWhatsapp.tsx` (145 lines)  
**Purpose**: WhatsApp group mappings per class/group, sync settings

### `/harta-locatii` — Sponsor Map
**File**: `src/pages/SponsorMap.tsx`  
**Purpose**: Leaflet map showing sponsor locations

### `/superadmin` — Super Admin
**File**: `src/pages/SuperAdmin.tsx` (89 lines)  
**Access**: Inky/Administrator only  
**Tabs**: Organizations, Module Matrix, BI, Display Monitor, Activity Feed, Docs, Clients, Templates, New Client
