# API Layer Reference

> Last updated: 2026-03-10

All API functions are in `src/api/`. They wrap Supabase client calls and return typed data.

## Core APIs

### `auth.ts` — Authentication
- `login(email, password)` — Supabase signInWithPassword
- `signUp(email, password, fullName)` — Supabase signUp + profile creation
- `loginWithGoogle()` — Supabase signInWithOAuth (Google)
- `logout()` — Supabase signOut
- `getProfile(userId)` — Fetch profile + organization data

### `orgConfig.ts` — Organization Config (Key-Value Store)
- `getOrgConfig(orgId)` — All config rows for org
- `getOrgConfigByKey(orgId, key)` — Single config value
- `upsertOrgConfig(orgId, key, value)` — Upsert with conflict on `(organization_id, config_key)`
- `updateOrganization(id, data)` — Update org table
- `getOrganization(id)` — Fetch single org

### `config.ts` — App Configuration
- API base URL and common config constants

## Content APIs

### `announcements.ts`
- `getAnnouncements(groupId?)` — Fetch with optional group filter
- `createAnnouncement(data)` — Insert new announcement
- `hideFromTicker(id)` / `restoreToTicker(id)` — Toggle ticker visibility
- `markAsRead(id)` — Insert into `announcement_reads`

### `attendance.ts`
- `getWeeklyAttendance(groupId, weekStart)` — Weekly attendance grid data
- `saveWeeklyAttendance(groupId, data)` — Upsert attendance records
- `getParentChildAttendance(parentId, month, year)` — Parent view
- `getAttendanceStats(groupId, month, year)` — Monthly statistics
- `getContributions(groupId, month, year)` — Monthly contribution calculations
- `getContributionConfig(orgId)` — Daily rate config
- `saveContributionConfig(orgId, rate)` — Update daily rate
- `saveMonthlyContributions(data)` — Bulk upsert contributions
- `updateContributionPayment(id, amount, status)` — Mark as paid

### `children.ts`
- `getChildrenByGroup(groupId)` — List children in group
- `addChild(data)` / `updateChild(id, data)` / `deleteChild(id)`

### `documents.ts`
- `getDocuments(groupId, category?)` — List with optional filter
- `uploadDocument(file, groupId, category)` — Upload to Supabase Storage + insert record
- `deleteDocument(id)` — Delete from storage + table

### `menu.ts` — Legacy Menu
- `getMenu(week)` — Weekly menu items
- `saveMenu(week, items)` — Save menu items

### `menuOms.ts` — OMS-Compliant Menu System
- `getMenuWeek(orgId, weekStart)` — Full week with meals, dishes, ingredients
- `ensureMenuWeek(orgId, weekStart, ageGroup?)` — Create week if not exists
- `addDish(mealId, name)` / `deleteDish(dishId)` / `updateDishName(dishId, name)`
- `addIngredient(dishId, name, grams, refId?)` / `updateIngredient()` / `deleteIngredient()`
- `getNutritionalReference()` — Reference ingredient database
- `computeDayNutrition(meals)` — Calculate daily nutritional values
- `getCalorieStatus(kcal, ageGroup)` — Green/yellow/red status
- `checkBannedIngredients(ingredients)` — Check against banned list
- `publishMenu(weekId)` / `unpublishMenu(weekId)`
- `updateAgeGroup(weekId, ageGroup)` — Set target age group

### `messages.ts`
- `getConversations(userId)` — List conversations with last message
- `getMessages(conversationId)` — Messages in conversation
- `sendMessage(conversationId, senderId, text)` — Insert + realtime

### `schedule.ts`
- `getSchedule(groupId)` — Schedule cells for group
- `saveSchedule(groupId, cells)` — Upsert all cells

### `schools.ts`
- `getSchools()` — All schools/entities for org
- `createSchool(data)` / `updateSchool(id, data)` / `deleteSchool(id)`

### `stories.ts`
- `getStories()` — All stories
- `createStory(data)` — Insert new story

### `reports.ts`
- `getAttendanceReport(groupId?, startDate, endDate)` — Aggregate report data

### `users.ts`
- `getUsers(groupId?)` — Profiles with optional group filter
- `updateUser(id, data)` — Update profile
- `deleteUser(id)` — Delete profile

## Domain-Specific APIs

### `construction.ts`
- Sites: `getSites()`, `upsertSite()`, `deleteSite()`
- Teams: `getTeams()`, `upsertTeam()`, `deleteTeam()`
- Tasks: `getTasks()`, `createTask()`, `updateTask()`
- Costs: `getCosts()`, `createCost()`, `deleteCost()`
- Assignments: `getAssignments()`, `upsertAssignment()`, `deleteAssignment()`

### `culture.ts`
- Shows: `getShows()`, `createShow()`, `updateShow()`, `deleteShow()`, `getShowById()`
- Cast: `getCast()`, `upsertCast()`, `deleteCast()`
- Sponsors: `getShowSponsors()`, `upsertShowSponsor()`, `deleteShowSponsor()`
- Surtitles: `getSurtitleBlocks()`, `upsertSurtitleBlock()`, `deleteSurtitleBlock()`
- Live: `getLiveState()`, `setLiveState()` (realtime surtitle control)

### `surtitles.ts`
- Shows: `getShows()`, `createShow()`, `updateShow()`, `deleteShow()`
- Blocks: `getBlocks()`, `upsertBlock()`, `deleteBlock()`
- Realtime: `subscribeToShow()` — Listen for live surtitle updates

### `inventory.ts`
- `getInventoryItems(orgId)` / `createInventoryItem()` / `updateInventoryItem()` / `deleteInventoryItem()`
- `getMovements(itemId)` / `recordMovement()` — Stock in/out

### `ssm.ts`
- `getTemplates(orgId)` / `createTemplate()` / `deleteTemplate()`
- `getChecklists(orgId)` / `createChecklist()` / `updateChecklist()`

### `workshops.ts`
- `getVehicles()` / `createVehicle()` / `updateVehicle()` / `deleteVehicle()`
- `getAppointments()` / `createAppointment()` / `updateAppointment()` / `deleteAppointment()`

### `living.ts`
- `getApartments()` / `createApartment()` / `updateApartment()` / `deleteApartment()`
- `getExpenses()` / `createExpense()` / `deleteExpense()`
- `getExternalAdmins()` / `createExternalAdmin()` / `deleteExternalAdmin()`

### `magazine.ts`
- `getArticles(orgId)` / `createArticle()` / `updateArticle()` — School magazine

### `clubs.ts`
- `getClubs(orgId)` / `createClub()` / `deleteClub()`
- `getMyMemberships(userId)` / `joinClub()` / `leaveClub()`

## Integration APIs

### `sponsors.ts`
- `getSponsors()` — All sponsors
- `getActivePromos(location)` — Active promos by display location
- `getSponsorPlans()` — Available sponsor plans
- `getAllCampaigns()` / `createCampaign()` / `updateCampaign()` / `updateCampaignStatus()`
- `getSponsorStats(sponsorId)` — Impressions, clicks, CTR
- `logImpression(promoId)` / `logClick(promoId)` — Analytics

### `sponsorPolicies.ts`
- Organization-level sponsor placement policies

### `facebook.ts`
- `getFacebookSettings()` / `postToFacebook(content)` / `getPostLog()`

### `whatsapp.ts`
- `getWhatsappMappings()` / `createMapping()` / `syncStatus()`

### `websiteConfig.ts`
- `getWebsiteConfig(orgId)` / `saveWebsiteConfig(orgId, config)`

### `infodisplay.ts`
- `getInfodisplayContent()` — Panels, ticker, QR codes, settings
- `generateVideo(type)` — Video generation (edge function stub)

### `guestTokens.ts`
- `getDailyToken(orgId)` — Get or create today's guest QR token
- `validateGuestToken(orgId, token)` — Validate via edge function
