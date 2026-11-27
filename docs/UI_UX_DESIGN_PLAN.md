# JaniduDev — Admin Dashboard UI/UX Design Plan (`UI_UX_DESIGN_PLAN.md`)

## 1. Core UX Philosophy — Built for a Non-Technical Business Owner

The dashboard is designed so that anyone — even a fifth-grade student — can manage the entire website and client list without touching code, seeing developer jargon, or worrying about breaking anything.

### Plain-English Vocabulary Standard
Every label, tooltip, toast notification, and error message follows this strict dictionary:

| Never Write | Always Write |
|---|---|
| CRUD / Mutate | Add, Edit, Delete |
| Slug | Page link (e.g., `janidudev.com/categories/restaurants`) |
| Boolean / Active | Show on website / Hidden |
| Session token | Signed-in device |
| Revalidate cache | Update website |
| Upload blob / Asset | Upload image |
| 500 Internal Server Error / Stack trace | "Could not save your changes. Please try again." |
| Soft delete | Move to Trash (with 30-day restore) |
| Seed / Migrate | Import existing content |

---

## 2. Visual Design System

- **Brand Alignment:** Inherits JaniduDev's clean **Inter** typography, crisp off-white canvas (`#FAF9F6`), pure white content surfaces (`#FFFFFF`), neutral borders (`#E5E4DF`), near-black text (`#111827`), and deep midnight blue primary buttons (`#091C44`, hover `#112D66`).
- **Status Colors (WCAG 2.2 AA Compliant):**
  - **Published / Paid / Active:** Soft emerald tint + dark emerald text (`#065F46`)
  - **Awaiting Approval / Draft / Proposal Sent:** Soft amber tint + dark amber text (`#92400E`)
  - **Hidden / Archived:** Soft neutral gray (`#4B5563`)
  - **Delete / Danger:** Crimson (`#B91C1C`) — always paired with a clear confirmation dialog.
- **Appearance Support:** Light mode (default), Dark mode, and Follow Device Settings in `Settings → Appearance`.
- **Responsive Layout:**
  - Desktop (`>=1024px`): Fixed `256px` left sidebar + spacious max-`1200px` main workspace.
  - Tablet & Mobile (`<1024px`): Clean top header with menu button opening a slide-over sidebar, large `44px+` touch targets, stacked cards instead of horizontal-scroll tables.

---

## 3. Page-by-Page Layouts & Wireframes

### 3.1 Login & Security Verification (`/login`)
```text
+-------------------------------------------------------+
|              [JaniduDev Ribbon Logo]                  |
|                 Sign in to Dashboard                  |
|                                                       |
|  Email address                                        |
|  [ hello@janidudev.com                            ]   |
|                                                       |
|  Password                                             |
|  [ ••••••••••••••••                               ]   |
|                                                       |
|  [                 Sign In                        ]   |
|                                                       |
|  Forgot your password?                                |
+-------------------------------------------------------+
```
- Step 2 (automatic after password): **"Enter the 6-digit code from your authenticator app"** (with `"Use a recovery code"` or `"Send code by email"` fallback).
- Zero public sign-up button.

---

### 3.2 Overview (`/admin`)
```text
+---------------+---------------------------------------------------------------+
| [Logo] Admin  |  Good morning, Janidu          [ + Add Project ] [ View Site ]|
|               |                                                               |
| > Overview    |  +-------------+ +-------------+ +-------------+ +----------+ |
|   Enquiries 2 |  | Projects    | | Active      | | Reviews     | | New      | |
|   Clients   3 |  | 11 Live     | | Clients: 3  | | 2 Waiting   | | Enquiries| |
|   ----------  |  | 2 Drafts    | | 1 Preview   | | 46 Live     | | 2 Unread | |
|   Projects    |  +-------------+ +-------------+ +-------------+ +----------+ |
|   Categories  |                                                               |
|   Reviews   2 |  Quick Actions                                                |
|   Content     |  [+ Add a project] [+ Create category] [+ Add a client]       |
|   Services    |  [Review waiting feedback] [Edit website text] [View inbox]   |
|   Media       |                                                               |
|   ----------  |  Needs Your Attention           |  Recent Activity            |
|   Analytics   |  • 2 enquiries waiting reply    |  • Published Milan Marble   |
|   Settings    |  • 2 reviews awaiting approval  |  • Updated Hero headline    |
|               |  • 1 client launch due Friday   |  • Approved review (USA)    |
| [View Site]   |                                                               |
| [Log Out]     |                                                               |
+---------------+---------------------------------------------------------------+
```

---

### 3.3 Customer Enquiries (`/admin/enquiries`)
- Split inbox layout (like a clean email client):
  - **Left column:** Search bar + status filter tabs (`All`, `New`, `Discussing`, `Confirmed`, `Archived`). Each row shows unread dot, client name, business name, country flag, selected design (if any), and relative date.
  - **Right column:** Full enquiry message, contact details, status dropdown, private notes box, and clear action buttons:
    - **Reply by Email** (opens mail app pre-addressed)
    - **Message on WhatsApp** (if phone/WhatsApp present)
    - **Convert to Client** (one click creates a new Client + Client Project pre-filled with their name, business, email, country, and selected design!)
    - **Archive** / **Delete**

---

### 3.4 Clients & Client Projects (`/admin/clients`) — *New Module*
```text
+-----------------------------------------------------------------------------+
| Clients & Active Projects                       [ + Add Client ]            |
|                                                                             |
| Tabs: [ Active Projects (3) ]  [ All Clients (8) ]  [ Completed (5) ]       |
|                                                                             |
| +-------------------------------------------------------------------------+ |
| | Bella Nails Studio (Sarah Miller · 🇺🇸 USA)        Stage: [Preview Ready]| |
| | Website Redesign & Online Booking                 Launch: Dec 12, 2026  | |
| | Proposal: $1,200 USD   [✓ 50% Deposit Paid]  [ ] Final 50% Pending      | |
| | Preview: preview.bellanails.example  |  Checklist: 4 of 6 steps done    | |
| | [ Open Project ]  [ Open Preview ↗ ]  [ Publish to Portfolio ]          | |
| +-------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------+
```
- **Client Project Detail Drawer/Page (`/admin/clients/[id]`):**
  - Clear visual stage bar matching your real 4-step workflow:
    `Proposal Sent` → `50% Deposit Paid` → `In Development` → `Private Preview Ready` → `Revisions` → `Final 50% Paid` → `Launched`.
  - Simple milestone checklist (add/check off items like *"Logo received"*, *"Service menu added"*, *"Client approved preview"*).
  - Private preview link & live domain fields.
  - Private notes box.
  - **One-click "Copy to Portfolio Showcase"**: creates a draft portfolio project pre-filled with the client's title, industry category, country, and live website link so you can add screenshots and publish it when ready.

---

### 3.5 Dynamic Project Categories (`/admin/categories`)
- Reorderable list with drag handle **plus** accessible `Move Up` / `Move Down` buttons.
- Each row shows cover thumbnail, category name (`Salons`, `Restaurants`, `Hotels`), project count, status pill (`Published` / `Draft`), visibility toggle (`Show` / `Hide`), and `Edit` / `Delete`.
- **Create / Edit Category Form:**
  - Category Name → auto-fills editable **Page link** (`janidudev.com/categories/restaurants`)
  - Section Title, Subtitle, Short Description
  - Cover Image (pick from Media Library or drag-and-drop upload)
  - Optional Search Engine Preview (title & description)
  - Bottom sticky action bar: **Cancel** | **Save Draft** | **Preview** | **Publish Changes**
- **Safe Delete Modal:** Explains *"This category has 4 projects. Deleting it will NOT delete your projects. Choose what to do with them:"* → radio choice: **Move them to another category** or **Keep them without a category**.

---

### 3.6 Portfolio Projects (`/admin/projects`) & Step-by-Step Wizard
- Filter bar: Search, Category dropdown, Project Type (`Real Client Project`, `Demo Website`, `Design Concept`, `Personal Project`), Status (`All`, `Published`, `Drafts`, `Trash`).
- **4-Step Project Wizard (`+ Add Project`):**
  1. **Step 1 — Basic Details:** Project name, Category (with inline `+ Create new category`), Project classification (`Real Client Project` vs `Demo Website` vs `Design Concept`), Short summary, Full description & Brief.
  2. **Step 2 — Images & Video:** Cover image, Desktop & Mobile screenshots with captions and alt text (drag-and-drop or Media Library picker), optional video.
  3. **Step 3 — Website Links:** Live website link, Demo link, optional custom buttons (e.g., `"View Menu"`), plus toggle *"Show in homepage interactive preview screen"*.
  4. **Step 4 — Preview & Publish:** Visibility toggles (`Featured on homepage`, `Show on website`), live preview button, and **Save Draft** or **Publish to Website**.

---

### 3.7 Customer Reviews (`/admin/reviews`)
- Tabs with live counts: **Awaiting Approval**, **Published**, **Hidden**, **Trash**.
- Filter by Country (with colored SVG flags), Star Rating, or Search.
- Each review card shows actual star rating, original comment (+ optional English translation), client name, country flag, project name, source, and clear one-click buttons:
  - **Approve & Publish** (for waiting reviews)
  - **Feature on Homepage** (star toggle, up to 3)
  - **Hide** / **Move to Trash** / **Restore**
- **`+ Add Review Manually`** button for verified testimonials received by email or WhatsApp (with explicit permission confirmation checkbox).

---

### 3.8 Website Content (`/admin/content`)
- Visual list of homepage sections in their exact top-to-bottom order (with drag-and-drop + Up/Down buttons and Show/Hide toggles):
  - Announcement Banner (optional, off by default)
  - Hero Section (headline, subheadline, buttons)
  - Interactive Live Preview Section
  - Featured Work Header
  - Project Categories Showcase
  - 4-Step Process & Payment Note
  - Reviews Preview
  - About Section
  - Contact Details & Footer
  - **+ Add New Section** (choose from predefined templates: *Text & Image*, *FAQ*, *Services*, *Gallery*, *Highlights / Stats*, *Call to Action*).
- Clicking any section opens a clean side-by-side form with **Save Draft**, **Preview**, **Version History (Undo)**, and **Publish Changes**.

---

### 3.9 Services (`/admin/services`), Media Library (`/admin/media`), Analytics (`/admin/analytics`), Settings (`/admin/settings`)
- **Services:** Clean list of services with optional price (`Leave blank for "Custom quote"`), currency selector (`USD`, `LKR`, `GBP`, `AUD`), delivery estimate, feature bullets, and a master toggle **"Show Services section on public website"**.
- **Media Library:** Visual grid of uploaded images & videos, drag-and-drop uploader, search by name/folder, edit alt text, and **"Used in 2 places"** indicator with protective warning before deletion.
- **Analytics:** Clean 4-card summary (`Website Visitors`, `Project Views`, `Enquiries Sent`, `WhatsApp & Email Clicks`) + top projects & visitor countries table for Last 7 / 30 / 90 days. Zero fake numbers — shows a friendly empty state until real visits arrive.
- **Settings:** 5 clear tabs — **My Account**, **Website**, **Security** (TOTP 2FA setup QR code + recovery codes + Signed-in Devices list with `"Sign out other devices"`), **Notifications**, and **Appearance** (Light / Dark / System).

---

## 4. Safety & Guardrails Built Into Every Screen
- **Unsaved changes warning** before navigating away from an edited form.
- **Confirmation dialogs** on every destructive action (Delete, Move to Trash, Sign Out Other Devices, Change Email).
- **Friendly toast feedback** (`"Your project has been published"`, `"Review hidden from website"`).
- **WCAG 2.2 AA:** Keyboard-focusable controls, labeled inputs, descriptive button text (no ambiguous icon-only buttons), and verified 4.5:1+ contrast ratios.
