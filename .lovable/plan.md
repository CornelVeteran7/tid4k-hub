

# TID4K — Complete School Management App

## Brand Identity
- **Primary color:** #2b516a (deep teal-blue from brandbook)
- **Accent red:** #c32b28 (for urgent items, errors, destructive actions)
- **Secondary blues:** #003C64, #004AAC, #003F6A (for gradients, hover states, active elements)
- **Neutral:** #ffffff (cards, backgrounds), #000000 (text)
- **Typography:** Poppins Bold (headers), Lora (sub-headers), Poppins Regular (body), Space Mono (code/data)
- **Style:** Clean, card-based, 12px border-radius, subtle shadows, mobile-first

---

## Authentication (Login Page)
- Two-tab login: **QR Code scan** (auto-refreshing QR every 60s) and **Phone + PIN** form (Romanian format)
- After login, session stored in AuthContext with user data, roles (CSV), and group info
- Helper function `areRol()` used everywhere for permission checks
- Inky superuser auto-detected by name/status

## App Shell & Navigation
- **Top header:** InfoDisplay logo, school name, current user, group/class dropdown switcher
- **Left sidebar** (collapsible hamburger on mobile) with role-based menu items:
  - All: Acasă
  - Profesor: Prezența, Documente, Mesaje, Anunțuri, Orar, Meniul, Povești
  - Părinte: Documente, Mesaje, Anunțuri, Orar, Meniul, Povești
  - Director: + Rapoarte
  - Administrator: + Utilizatori, Configurări
  - Inky only: Orar CANCELARIE, Social Media (Facebook, WhatsApp)
- Unread message badge on Mesaje link

## Page 1: Dashboard (Acasă)
- Welcome card with name and role badges
- Quick stat cards: children count, today's attendance, unread messages, recent announcements
- Recent activity feed (last 5 items)
- Quick action buttons: Record Attendance, Send Message, Upload Document
- Group switcher for multi-group users

## Page 2: Attendance (Prezența)
- Date picker (defaults to today)
- Student list with checkboxes (present/absent) and notes field per child
- Save button
- Monthly stats table: days × children grid, color-coded cells (green/red)
- Summary row with attendance percentages
- Auto-calculated contributions
- Export to Excel/PDF

## Page 3: Documents (Documente)
- Category tabs: Activități, Administrativ, Teme, Fotografii
- Grid/list view toggle
- Drag-and-drop upload zone (PDF, JPG, PNG, GIF, WEBP)
- Document cards with thumbnails, filename, date, uploader
- Lightbox gallery for images, embedded PDF viewer for PDFs
- Download and delete actions (role-restricted)
- Optional WhatsApp/Facebook sync checkboxes on upload

## Page 4: Messaging (Mesaje)
- Split view: conversation list (left) + chat view (right)
- Chat bubbles (sent = right/blue, received = left/gray)
- 1-to-1 and group broadcast support
- Unread badges
- Mobile: full-screen list → tap to open chat → back button

## Page 5: Announcements (Anunțuri)
- Announcement cards sorted by date, with priority badges (normal=blue, urgent=red)
- "Citit" read confirmation per announcement
- Create announcement modal (title, rich text, priority, target class/school)
- News Ticker Banner management: status badges, show/hide controls, last 30 days max 10

## Page 6: Schedule (Orar)
- Weekly grid: Mon–Fri columns × hourly rows (8:00–16:00)
- Color-coded subject cells with teacher names
- Click-to-edit for profesor/administrator
- Print/export
- **CANCELARIE variant** (Inky only): teacher cells with avatars, QR codes, absence calendar, activity log, auto name propagation

## Page 7: Weekly Menu (Meniul Săptămânal)
- Week selector at top
- Table: meals (Mic dejun, Gustare 1, Prânz, Gustare 2) × days (Mon–Fri)
- Double-click to edit cells (administrator only)
- Three toggles (saved in localStorage): Emoji, Nutrienți, kcal/zi
- Nutritional section: per-day totals with color coding against Romanian Health Ministry standards
- 14 EU allergen badges
- Signature fields (Director, Asistent medical, Administrator)
- Floating save button on changes
- Print-friendly export

## Page 8: Stories Library (Biblioteca de Povești)
- Grid of story cards with title, category badge, age range badge (3-5, 5-7, 7-10)
- Category filter tabs: Educative, Morale, Distractive
- Story reader with audio player (play/pause/stop, progress bar, speed selector, MP3 download)
- TTS generation button
- Add story form for profesor
- Favorite/bookmark toggle

## Page 9: Reports (Rapoarte) — Director/Administrator
- Charts dashboard: attendance trends (line), user activity (bar), documents by category (pie)
- Filters: group/class, date range, user
- Export PDF/Excel
- Custom report generator

## Page 10: User Management (Utilizatori) — Administrator
- Users table with search/filter by role, group, name
- Add/edit user modals: name, phone, email, role (multi-select), group assignment
- Delete with confirmation
- Multi-role badge display

## Page 11: Settings (Configurări) — Administrator
- School info: name, address, logo upload
- API keys (masked): Cloudmersive, OpenAI, Twilio
- WhatsApp settings: group mappings, consent, sync type
- Facebook settings: page ID, token status, posting format
- Notification toggles (email, SMS)
- System maintenance: cache clear, backup trigger

## Infodisplay Preview
- Full-screen bulletin board preview (as shown on TV/Raspberry Pi)
- Slideshow of info panels with configurable timing
- QR codes for quick access
- Scrolling news ticker at bottom
- Fade/slide transitions

## API Service Layer
- `src/api/` folder with 14 service files (config, auth, users, children, attendance, messages, announcements, documents, schedule, menu, stories, reports, whatsapp, facebook, infodisplay)
- Configurable BASE_URL pointing to PHP backend
- All functions use fetch() with typed responses and graceful error handling
- Full mock data in each service for immediate UI testing

## State Management
- **AuthContext:** session data, roles, login/logout
- **GroupContext:** selected group, available groups, switcher
- **NotificationContext:** unread counts, new announcements

## Responsive Design
- Mobile-first with hamburger sidebar
- Tables → card lists on small screens
- Touch-friendly tap targets
- Full-screen chat on mobile

