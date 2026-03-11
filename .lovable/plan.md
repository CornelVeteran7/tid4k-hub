

# Plan: Guest & Parent Access Restrictions

## Summary

Three areas of change: (1) restrict which modules guests see on the main dashboard, (2) restrict image/document download behavior for guests, (3) prevent uploads for guests and parents. Plus: allow guests to see/book workshops.

## Current Architecture

- **Guests** access via `/qr/:orgSlug` (QRCancelarie) — this is a standalone page, NOT the main Dashboard. Guests never see the main Dashboard or ModuleHub.
- **Authenticated users** (parents, teachers, directors) access the main Dashboard with ModuleHub.
- The `QuickUpload` component is in `AppLayout.tsx` — only rendered for authenticated users (AppLayout is only used in authenticated routes).
- Documents page (`Documents.tsx`) shows upload button + delete button to everyone currently.

## Changes Needed

### 1. QRCancelarie — Add Workshops Section for Guests (kids vertical)

**File: `src/pages/QRCancelarie.tsx`**

Currently guests on kids vertical see: Announcements, Schedule. Need to add:
- **Ateliere (Workshops)** section: Load external workshops from DB, display cards, allow booking via ExternalLinkContext link
- Remove the generic "mesaje, documente" text from the guest bottom section — guests don't get those

Add a new section after schedule for `kids` vertical:
```tsx
{org?.vertical_type === 'kids' && (
  <Section icon={<Paintbrush />} title="Ateliere Educative">
    {/* Workshop of the month card + link to all */}
  </Section>
)}
```

Load workshops in the `loadContent` effect using `getExternalWorkshops()`.

### 2. Documents Page — Role-Based Restrictions

**File: `src/pages/Documents.tsx`**

- Add `user` from `useAuth()` and check role
- **Parents**: Hide upload button, hide delete button. Show download only for documents (PDF), not for images.
- **Guests**: Won't access this page directly (they're on QRCancelarie), but if embedded, same as parents but stricter — images: view only (no download), documents: download allowed.

Actually, guests don't access the main app at all. The restriction is:
- **Parents (authenticated)**: Can view images and documents, can download documents (PDF), can view images (no download), cannot upload, cannot delete
- **Staff/Admin**: Full access (upload, download, delete)

Changes:
- Import `useAuth` and `areRol` 
- Conditionally hide upload button: only show for staff/admin
- Conditionally hide delete button: only show for staff/admin
- For images: conditionally hide download button for parents (they can only view)
- Documents (PDF): download allowed for everyone

### 3. Dashboard ModuleHub — No Changes Needed

Guests don't see the Dashboard (they're on QRCancelarie). For authenticated parents, they should see: imagini, documente, ateliere, meniu, mesaje — but NOT povesti and NOT prezenta.

Wait — re-reading the request: "guests do not see povesti, prezenta si contributie". This refers to the modules visible. But guests are on QRCancelarie, not Dashboard. For the main Dashboard, the user wants parents to not see certain modules either? Let me re-read...

"guests do not see povesti, prezenta si contributie and can only see imagini and documente that are displayed on the screen"

This means on the guest QR page, they should see:
- Images and documents (displayed, not downloadable for images)
- Workshops (can book and see)
- NOT: povesti, prezenta, contributie

Since QRCancelarie doesn't show povesti/prezenta/contributie to guests anyway (those are in AuthenticatedSection), this is already working. The new addition is: show documents/images + workshops on the guest QR page.

### 4. QRCancelarie — Add Documents/Images Display for Guests

Load public documents for the org and display them. Images: view-only. Documents: downloadable.

### 5. QuickUpload — Disable for Parents

**File: `src/components/QuickUpload.tsx`**

Add role check — only allow for staff/admin, not parents.

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/QRCancelarie.tsx` | Add workshops section + documents/images display for kids guests |
| `src/pages/Documents.tsx` | Hide upload/delete for parents, hide image download for parents |
| `src/components/QuickUpload.tsx` | Disable for parents (only staff/admin) |

## Implementation Order
1. Documents.tsx — role-based upload/delete/download restrictions
2. QuickUpload.tsx — parent restriction
3. QRCancelarie.tsx — add workshops + documents sections for guests

