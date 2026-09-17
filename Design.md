# TransitClear Driver UI — Design System & Screen Specifications

> **Source of Truth**: Google Stitch Project `TransitClear Driver` (`projects/13846017220461017586`)  
> **Target Device**: Desktop (Fluid down to Tablet & Mobile)  
> **Design Theme**: Light Mode, Inter Typography, Roundness `ROUND_FOUR` / `ROUND_EIGHT`, Primary Brand `#0F2942`  

---

## 1. Overall Visual Style

The TransitClear Driver interface is built for high-consequence civic and commercial road transport. Its visual design language blends **Modern Civic Utility** with **Strict High-Contrast Functionalism**.

- **Atmosphere & Aesthetic**: Unshakeable, hyper-legible, civic-minded, and urgent without inducing panic. Interfaces are designed for rapid 5-second cognitive acquisition under high ambient light, direct sunlight, in-cab vibration, and long-haul fatigue.
- **Surface Strategy**: Replaces blinding pure white backgrounds with a glare-resistant, soft tinted canvas (`#F8FAFC` to `#F9F9FF`). Cards are crisp pure white (`#FFFFFF`) with thin structural perimeter borders (`#E2E8F0` / `#C3C6CE`) rather than soft decorative drop shadows.
- **Informational Hierarchy**: Information is structured in bold visual slabs, high-contrast metric tiles, and unmistakable color-coded semantic rails (crimson, amber, emerald).
- **Physical Touch Target Ergonomics**: All interactive elements strictly follow commercial driver touch ergonomics—primary action buttons maintain a minimum 56px height, inputs 56px, and secondary buttons 48px.

---

## 2. Color Palette

The color system directly models highway signage and municipal transport regulations, adhering strictly to WCAG AAA contrast standards.

### 2.1 Brand & Core Tokens
| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `primary` | `#001428` / `#0F2942` | Deep National Transport Navy. Anchors structural chrome, sidebar, headers, and primary CTA buttons. |
| `primary-container` | `#0F2942` | Deep navy container used for sidebar active elements and branding badges. |
| `on-primary` | `#FFFFFF` | High-contrast text on navy backgrounds. |
| `on-primary-container` | `#7991AF` / `#A5B4FC` | Muted supporting text within navy modules. |
| `secondary` | `#904D00` / `#D97706` | Warning Amber. Reserved for restrictions, advisory alerts, cautions, and time windows. |
| `secondary-container` | `#FE932C` / `#F97316` | Bright warning orange/amber for high-visibility accent rails, alert dots, and emergency icons. |
| `secondary-fixed` | `#FFDCC3` / `#FEF3C7` | Soft tinted amber background for warning alert slabs and ETA callout boxes. |
| `on-secondary-fixed` | `#2F1500` / `#78350F` | Deep contrast text over amber tints. |
| `tertiary` | `#00170D` / `#059669` | Route Emerald. Clear corridor indicators, verified passes, and positive statuses. |
| `tertiary-container` | `#002E1D` / `#059669` | Deep emerald fill for clearance badges and success cards. |
| `tertiary-fixed` | `#85F8C4` / `#D1FAE5` | Soft green tint for clear route cards and resolved timeline steps. |
| `on-tertiary-container`| `#21A173` / `#047857` | Accent text on clearance containers. |
| `error` | `#BA1A1A` / `#DC2626` | Emergency Crimson. Critical route blockage, red alerts, and live pulse indicators. |
| `error-container` | `#FFDAD6` / `#FEE2E2` | Light red tint for immediate action badges and emergency tags. |
| `on-error-container` | `#93000A` / `#991B1B` | High-contrast red text on error tint containers. |

### 2.2 Surface & Neutral Tokens
| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `background` / `surface` | `#F9F9FF` / `#F8FAFC` | Non-reflective neutral canvas background. |
| `surface-container-lowest`| `#FFFFFF` | Card surfaces, modal dialogues, input fields, white action buttons. |
| `surface-container-low` | `#F0F3FF` / `#F1F5F9` | Metric stat tiles, input field backgrounds, form controls. |
| `surface-container` | `#E7EEFF` / `#E2E8F0` | Button hover states, secondary chips, dividers. |
| `surface-container-high`| `#DEE8FF` / `#CBD5E1` | Interactive control hover, subtle border states. |
| `on-surface` / Text Primary| `#111C2D` / `#0F172A` | Primary body, titles, and high-emphasis textual content. |
| `on-surface-variant` / Text Muted | `#43474D` / `#64748B` | Secondary descriptions, timestamps, metric labels, subtitles. |
| `outline` / `outline-variant` | `#74777E` / `#E2E8F0` | Structural borders on cards, form fields, and dividers. |

---

## 3. Typography & Hierarchy

The interface utilizes **Inter** (with standard system font fallbacks: `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`) across all display, narrative, and tabular surfaces.

### 3.1 Type Scale & Specifications
| Style Role | Font Size | Line Height | Weight | Letter Spacing | Context in UI |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 36px | 44px | 800 (Extrabold) | -0.02em | Main page greetings, city names on route banners |
| `display-lg-mobile` | 28px | 36px | 800 (Extrabold) | -0.01em | Responsive mobile headline scaling |
| `headline-lg` | 28px | 36px | 700 (Bold) | -0.01em | Primary alert titles, modal headers, major metric numbers |
| `headline-md` | 22px | 30px | 700 (Bold) | 0em | Section titles, key metrics (ETA, hours, location) |
| `headline-sm` | 20px | 28px | 600 (Semibold) | 0em | Subheadings, card titles, callout text |
| `body-lg` | 18px | 28px | 500 (Medium) | 0em | Supporting page subtitles, large input text |
| `body-md` | 16px | 24px | 400 (Regular) | 0em | Standard body text, descriptions, guidance paragraphs |
| `label-lg` | 16px | 24px | 700 (Bold) | 0.02em | Primary button labels (56px buttons), brand text |
| `label-md` | 14px | 20px | 700 (Bold) | 0.04em | Form field labels, secondary buttons, status badges |
| `label-sm` | 13px | 18px | 700 (Bold) | 0.05em | Metric tags, category chips, breadcrumbs, helpline labels |
| `caption / micro` | 10px – 11px | 14px | 600 / Mono | 0.05em | Vehicle plate pills, timestamps, fine metadata |

### 3.2 Typography Rules
- **Minimum Font Floor**: Body text never drops below 16px; descriptive metadata never drops below 13px bold.
- **Bilingual Stacking**: Line-height is constrained to 1.5x minimum to ensure regional Indian script diacritics (matras) never clip when switching to Hindi or Marathi.
- **Numerals**: Numerical metrics, chainage (KM), speeds, and times utilize tabular numerals (`tabular-nums`) for column alignment.

---

## 4. Spacing & Sizing Scale

Built on a strict **8pt structural rhythm**:

- `space-xs`: `0.25rem` (4px) — Internal icon-to-text spacing, compact badges
- `space-sm`: `0.5rem` (8px) — Button padding, chip spacing, tight form groups
- `space-md`: `1rem` (16px) — Standard card padding, grid gutters, section gaps
- `space-lg`: `1.5rem` (24px) — Large card padding, module separation
- `space-xl`: `2rem` (32px) — Primary container padding, modal content padding
- `gutter`: `1rem` (16px mobile), `1.5rem` (24px desktop)
- `margin`: `1rem` (16px mobile), `1.5rem` (24px tablet), `2.5rem` (40px desktop)
- `max-width`: Centered container max-width ranges between `1024px` (`max-w-5xl`), `1152px` (`max-w-6xl`), and `1280px` (`max-w-7xl`).

---

## 5. Border Radius & Shapes

The corner geometry uses **controlled soft rounding**:

- `sm`: `0.125rem` (2px) / `0.25rem` (4px) — Inline code tags, minor system badges
- `md`: `0.375rem` (6px) — Standard tags, language selector pill buttons
- `lg`: `0.5rem` (8px) — Buttons, form inputs, stat cards
- `xl`: `0.75rem` (12px) — Main content cards, route alert cards, action tiles
- `2xl`: `1rem` (16px) — Large modals, report problem container card
- `full`: `9999px` — Concentric status pills, driver avatar circle, radio checkmark dots, notification pings

---

## 6. Shadows & Elevation

Instead of blurry decorative shadows, elevation is achieved through **Tonal Layering** and **Crisp Outlines**:

- **Elevation 0 (Canvas)**: Tinted neutral `#F8FAFC` / `#F9F9FF`.
- **Elevation 1 (Cards & Modules)**: Pure white `#FFFFFF` bounded by `1px solid #E2E8F0` or `border-outline-variant/40`, paired with `shadow-[0_1px_4px_rgba(0,0,0,0.02)]` or `shadow-sm`.
- **Elevation 2 (Elevated Sheets & Route Alert Cards)**: Pure white with `shadow-md` and 1px border.
- **Elevation 3 (Modals & Overlays)**: Floated over an 80% opacity dark navy/slate scrim (`bg-primary/80` or `bg-slate-900/60`) with `backdrop-blur-sm`, elevated with `shadow-2xl`.

---

## 7. Cards

### 7.1 Status Alert Card with Semantic Left Rail
- **Structure**: White card background (`#FFFFFF`), `rounded-xl`, `shadow-md`, containing an assertive **10px–12px vertical rail** docked to the left edge:
  - **Emergency / Closed**: Crimson rail (`#DC2626`)
  - **Restriction / Advisory**: Amber rail (`#D97706` / `#FE932C`)
  - **Clear / Operational**: Emerald rail (`#059669` / `#002E1D`)
- **Content Hierarchy**:
  1. Top badge row (Category badge + Status pulse badge)
  2. Plain-language bold headline (24px–28px font size)
  3. Contextual description paragraph
  4. 3 Key metric blocks (Location, Restriction Hours, ETA)
  5. High-visibility warning slab (`bg-secondary-fixed`)
  6. Action CTA row (Primary button + option counter text)

### 7.2 Metric & Stat Tile
- Background: `bg-surface-container-low` (`#F0F3FF` or `#F8FAFC`) with optional 1px border.
- Geometry: `rounded-xl` or `rounded-lg`, 16px padding.
- Structure: Icon in rounded container + uppercase small label (`label-sm`) + prominent metric value (`headline-md`).

### 7.3 Touch Action Card
- Large driver-friendly card with 56x56px icon block, large title, descriptive text, and a right chevron circle button. Hover elevates slightly (`group-hover:scale-105`, `hover:shadow-md`).

---

## 8. Buttons

| Button Variant | Height | Background | Text Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Action** | 56px (`h-14`) | `#001428` / `#0F2942` / `slate-950` | `#FFFFFF` | None | "WHAT SHOULD I DO?", "Check My Route", "SUBMIT REPORT", "START NAVIGATION" |
| **Secondary Action** | 48px (`h-12`) | `#E7EEFF` / `#FFFFFF` | `#001428` / `slate-800` | 1px `#CBD5E1` or None | "View Journey", "Share Status with Transporter", "EDIT DETAILS", "EDIT VEHICLE" |
| **Modal Action / Outline**| 40px–48px | Transparent / `#FFFFFF` | `#001428` / `slate-800` | 1px `#CBD5E1` | "Dismiss", "Close", "Preview Bypass Route" |
| **Destructive Action** | 40px–48px | `#FEE2E2` (`red-50`) | `#DC2626` (`red-700`)| 1px `#FECACA` | "LOG OUT / SWITCH VEHICLE" |
| **Option Selector CTA** | 40px–48px | Emerald `#047857` / Navy `#0F2942` | `#FFFFFF` | None | "Select Option 1 (Navigate to Yard)", "Switch to Bypass Route" |

- Typography: Uppercase tracking (`tracking-wider`), `font-label-lg` (16px bold) or `font-label-md` (14px bold).
- Feedback: `hover:translate-y-[-1px]`, `active:scale-[0.99]`, smooth color transitions.

---

## 9. Inputs, Selectors & Form Controls

- **Text Inputs**: Height 56px (`h-14`), background `#F0F3FF` or `#FFFFFF`, border 1px `#CBD5E1`, text size 18px (`body-lg`), focus ring 2px Primary Navy.
- **Select Dropdowns**: Height 56px (`h-14`), appearance none with custom absolute right arrow chevron (`expand_more`), background `#F0F3FF`.
- **Problem Type Selector Tiles**:
  - 2x3 responsive grid of touch tiles, minimum height 105px.
  - Inactive State: 1px border `#E2E8F0`, white background.
  - Active / Selected State: 2px border `#0284C7` (Sky Blue), light blue background (`#F0F9FF`), absolute top-right circular checkmark badge (`✓`).
- **Toggle Switches**: Pill track (44px x 24px), sliding white knob (20px), active green fill (`bg-emerald-600`), accompanied by explicit text badge ("ON" in bold emerald).
- **Textarea**: 3 rows, border `#CBD5E1`, rounded-xl, 14px text.

---

## 10. Sidebar Navigation

- **Dimensions**: Fixed on left, width `w-72` (288px) or `w-64` (256px), full height (`h-full` / `min-h-screen`).
- **Background**: Deep National Transport Navy (`#001428` / `#0B192C` / `#0D1B2A` / `bg-primary-container`).
- **Brand Header**:
  - App icon: Truck/traffic light symbol in rounded square (`bg-white/10` or `bg-surface`).
  - Text: "TRANSITCLEAR" (14px bold uppercase tracking-wider) + "Travel & Safety Portal" (11px muted slate).
- **5 Navigation Links**:
  1. `Home` (Icon: `home`)
  2. `My Journey` (Icon: `route` / `map`)
  3. `Alerts` (Icon: `notifications` / `notifications_active` — with unread red badge)
  4. `Report Problem` (Icon: `warning` / `report`)
  5. `Profile` (Icon: `person`)
- **Active Nav Item Style**: Pure white or surface background with dark navy text (`bg-white text-slate-900` or `bg-surface text-primary font-bold shadow-sm`), height 48px, rounded-lg.
- **Inactive Nav Item Style**: Muted slate (`text-slate-300` / `text-on-primary-container`), hover: `bg-white/10 hover:text-white`.
- **Sidebar Footer — Emergency Helpline**:
  - Contained module at bottom with pulsing warning icon.
  - Label: "EMERGENCY HELPLINE" (10px uppercase amber).
  - Prominent phone numbers: **1033 / 112** (Headline bold, white).
  - Sub-label: "NHAI • POLICE — 24x7 Roadside Hazard & Medical Assistance".

---

## 11. Top Header Bar

- **Dimensions**: Fixed top bar, height 64px (`h-16`) to 80px (`h-20`), aligned to content area (offset left by sidebar width).
- **Background**: `bg-surface-container-lowest/90` or pure white with backdrop blur (`backdrop-blur-xl`), bottom border `1px solid #E2E8F0`.
- **Left Content**:
  - Brand mark image / icon + "TransitClear" title (16px bold navy) + vertical divider + "Road Restriction & Travel Safety" subtitle (13px muted).
- **Right Controls**:
  - **Language Selector**: Segmented pill container (`English` [Active / Bold] | `हिंदी` | `मराठी`).
  - **Notification Bell**: 40x40px icon button with absolute red/amber unread dot badge (`w-2.5 h-2.5`).
  - **Driver Profile Pill**: Circle avatar ("RK" initials or person icon) + Driver Name ("Rajesh K.") + Vehicle Registration ("MH-04-AB-1234").

---

## 12. Icons

- **Standard Library**: Google Material Symbols Outlined (`local_shipping`, `warning`, `error`, `check_circle`, `pin_drop`, `schedule`, `timelapse`, `verified`, `alt_route`, `navigation`, `report`, `person`, `notifications`, `help`, `call`, `share`, etc.) with SVG fallbacks.
- **Sizing**: 18px (badges/chips), 20px–24px (buttons, headers), 28px–32px (stat blocks and action cards).

---

## 13. Alerts & Status Indicators

- **Closed / Emergency**: Crimson Red (`#DC2626`), `🚨` emoji or `error` symbol, pulsing live ping dot, "IMMEDIATE ACTION REQUIRED".
- **Restricted / Advisory**: Warning Amber (`#D97706` / `#FE932C`), `⚠️` emoji or `warning` symbol, "ROUTE ALERT • RESTRICTION ON YOUR WAY".
- **Clear / Operational**: Route Emerald (`#059669` / `#21A173`), `✅` emoji or `verified` symbol, "YOUR ROUTE IS CLEAR", "Real-Time Clearance Confirmed".
- **Badges**: Rounded pill tags with 15% opacity background tint paired with 7:1 contrast text.

---

## 14. Modals & Overlays

### "What Should I Do?" Driver Guidance Modal
- **Trigger**: Click on primary CTA "WHAT SHOULD I DO?" on Home, My Journey, or Alerts screens.
- **Layout**: Centered modal dialog, `max-w-2xl`, rounded-xl / rounded-2xl, elevated with `shadow-2xl`.
- **Scrim / Backdrop**: Dark navy / slate backdrop (`bg-primary/80` or `bg-slate-900/60`) with `backdrop-blur-sm`.
- **Header**: Category tag ("Driver Guidance" / "Action Plan Required"), title "What Should I Do?", subtitle specifying the restriction ("Khambatki Pass restriction window: 4:00 PM – 10:00 PM"), and close "X" icon button.
- **Body**: 3 structured, numbered options:
  1. **Option 1 (Recommended)**: "Stop safely & wait at approved holding yard"
     - Details: Park at approved truck yard (KM 54), 8 km before restriction. Amenities: Clean Drinking Water, 24hr Canteen, Secure Truck Parking.
     - Action: Primary action button "Select Option 1 (Navigate to Yard)" or "Navigate to Holding Yard →".
  2. **Option 2**: "Leave earlier to cross before 4:00 PM cutoff"
     - Details: Cross before 4:00 PM; requires continuous driving; not recommended if toll/loading delays occur.
     - Action: "Check Speed Timeline" button.
  3. **Option 3**: "Use another suitable road / alternate bypass corridor"
     - Details: Divert via Bhor-Wai / Wai-Surur bypass (+22 km to +32 km, ~45 min additional time). No commercial bans today.
     - Action: "Preview Bypass Route" / "Switch to Bypass Route" button.
- **Footer**: Dismiss button + dispatcher phone assistance ("+91 98200 12345").

---

## 15. Navigation Architecture

```
[ TransitClear Driver Console ]
  ├── 1. Home (Dashboard: greeting, primary route alert card, plan journey, current journey, quick actions)
  ├── 2. My Journey (Active route console: alert card, current journey metrics, 4-step progress timeline, clear baseline comparison, guidance modal)
  ├── 3. Alerts (Highway advisories: active critical alert, road work advisory, recent updates history feed, guidance modal)
  ├── 4. Report Problem (Hazard reporting: 4-step form [problem type grid, GPS location, photo, description], verification banner, emergency helpline)
  └── 5. Profile (Account console: driver hero card, personal details, vehicle & FASTag details, notification preferences, support & logout)
```

---

## 16. Responsive & Layout Behavior

- **Desktop (≥ 1024px)**: Fixed left sidebar (256px–288px), sticky top header, content in 12-column grid or centered container (`max-w-5xl` to `max-w-7xl`), 40px horizontal padding.
- **Tablet (640px – 1023px)**: Reflows 3-column metric grids into 2 columns; journey timeline switches to stacked or 2x2 cards; 24px outer margins.
- **Mobile (< 640px)**: All grids reflow to single-column card stacks; header buttons simplify; primary buttons span full width (`w-full`); touch targets enforce 56px height.

---

## 17. Detailed Screen Specifications

### 17.1 Screen 1: Home (`TransitClear — Driver Home Dashboard`)

#### Layout
- Fixed left sidebar (`w-72`), fixed top header (`h-20`, `left-72`), scrollable main body with `pt-20`, `px-margin-desktop` (40px).

#### Sections & Components
1. **Driver Greeting & Identity Strip**:
   - Vehicle Chip: Concentric pill (`bg-surface-container-high`, truck icon, "HEAVY TRUCK • MH-04-AB-1234" in 13px bold uppercase).
   - Display Heading: `Good morning, Rajesh 👋` (`display-lg`, 36px font, bold).
   - Subtitle: `Where are you going today?` (`body-lg`, 18px text).
2. **Main Focal Area: Primary Route Alert**:
   - **Visible State 1: Active Critical Route Alert Card** (`#card-alert-state`):
     - 12px vertical warning rail (`bg-secondary-container`) on left.
     - Dominant Title: `🚨 Heavy trucks are restricted ahead` (`display-lg`, 36px).
     - Subtitle: "A timed restriction is in effect along your planned travel corridor. Immediate action recommended to avoid roadblock delays."
     - 3 Metric Blocks (1-col mobile, 3-col desktop):
       - Location: `Khambatki Pass` (Pin drop icon, Navy background).
       - Restriction Period: `4:00 PM – 10:00 PM` (Schedule icon, Amber background).
       - Your ETA: `5:20 PM` (Timelapse icon, Navy container background).
     - Warning Slab: `bg-secondary-fixed`, error icon, `⚠️ Your truck will reach during the restriction.` (`headline-sm`, 20px).
     - CTA Row: "2 suitable options available" text with route icon + Primary button "WHAT SHOULD I DO? →" (56px height, opens guidance modal).
   - **Visible State 2: Clear Route Card** (`#card-clear-state`, toggleable):
     - 12px vertical emerald rail (`bg-tertiary-container`).
     - Badge: `Your Route Is Clear` (Emerald pill) + "Real-Time Clearance Confirmed".
     - Dominant Title: `No current restriction is affecting your journey`.
     - Description: "All passes, flyovers, and heavy commercial vehicle entry points along NH 48 are currently open."
     - Clearance Block: Assigned Corridor (`Mumbai → Goa via Pune Bypass`), Estimated Arrival (`7:45 PM`), Status (`● Unimpeded`).
     - CTA Row: "Opens seamless navigation via Google Maps or Mappls" + Primary button "START NAVIGATION" (Navigation icon).
3. **Two-Column Mid Section**:
   - **Left Column (7 cols): Check My Journey Form**:
     - Header: "Check My Journey" with search icon + "Check if your route is affected."
     - Fields:
       - `From`: Input prefilled with "Mumbai" (`h-14`, origin icon).
       - `To`: Input prefilled with "Goa" (`h-14`, location icon).
       - `Vehicle`: Dropdown prefilled with "Heavy Truck" (Options: Heavy Truck, Bus, Delivery Vehicle, Car).
     - Submit Button: "CHECK MY ROUTE" (56px primary navy button).
   - **Right Column (5 cols): Current Journey Overview**:
     - Header: "YOUR JOURNEY" with pulsing amber live dot.
     - Route Tile: `Mumbai → Goa` with navigation icon.
     - Metrics Grid: Estimated Arrival (`7:45 PM`) and Remaining Distance (`420 km`).
     - Status Pill: `bg-secondary-fixed`, warning icon, "Status: Restriction ahead" + "At KM 78" badge.
     - Action Button: "View Journey →" (`h-12` surface-container button).
4. **Quick Actions Section**:
   - 3 large touch-friendly cards in a 3-column grid:
     1. `My Journey`: Map icon, "View active route & stops", chevron circle button.
     2. `Alerts`: Amber icon, "1 active restriction", live dot, chevron circle button.
     3. `Report Problem`: Red warning icon, "Block, accident, or hazard", chevron circle button.
5. **Guidance Modal ("What Should I Do?")**:
   - Centered slide-over dialog containing 2 recommended actions (Stop safely & wait at Shirwal truck bay KM 64; Use Bhor-Wai bypass route), Dismiss button, and "Switch to Bypass Route" CTA.

#### Important Interactions
- Clicking "What Should I Do?" displays the guidance modal.
- Submitting the "Check My Journey" form validates corridor regulations.
- Switching states toggles between the Active Route Alert Card and Clear Route Card.

---

### 17.2 Screen 2: My Journey (`TransitClear — My Journey`)

#### Layout
- Fixed left sidebar (`w-72`), sticky header (`h-20`), main scrollable container constrained to `max-w-7xl mx-auto px-6 py-8`.

#### Sections & Components
1. **Page Header**:
   - Label: `DRIVER CONSOLE • ACTIVE ROUTE` (`label-sm` in bold amber).
   - Title: `My Journey` (`display-lg`, 36px navy).
   - Subtitle: `View your current journey and route status.`
2. **Top Prominent Journey Alert Card**:
   - 10px vertical amber rail (`bg-secondary-container`) on left.
   - Badges: `ROUTE ALERT • RESTRICTION ON YOUR WAY` (Amber pill) and `IMMEDIATE ACTION REQUIRED` (Red pill with pulsing dot).
   - Headline: `🚨 YOUR JOURNEY IS AFFECTED` (28px error red).
   - Plain-language explanation: `Heavy trucks are restricted at Khambatki Pass from 4:00 PM – 10:00 PM.`
   - 3 Timings Blocks:
     - Restriction Location: `Khambatki Pass` (NH-48 Ghat Section).
     - Restriction Hours: `4:00 PM – 10:00 PM` (6 Hour No-Entry Window).
     - Your Expected Arrival (ETA): `5:20 PM` (Arriving right in restriction).
   - Callout Box: `⚠️ Your truck will reach during the restriction.` (15% amber background).
   - CTA Row: Primary button `WHAT SHOULD I DO? →` (56px) + `2 suitable options available` text.
3. **Current Journey Assignment Card**:
   - Header Strip: Active Assignment icon + `CURRENT JOURNEY` + Vehicle Badge: `Vehicle: Heavy Truck • MH-04-AB-1234`.
   - Big Route Display: `Mumbai → Goa` (`display-lg`, 36px) + `National Highway 48 / 66` badge.
   - 4 Driver Metric Blocks (Grid 1x4):
     - Departure: `11:00 AM` (JNPT Terminal, Mumbai).
     - Estimated Arrival (ETA): `7:45 PM` (Calculated at current speed).
     - Distance Remaining: `420 km` (Total route length: 580 km).
     - Journey Status: `⚠️ Restriction Ahead at Khambatki Pass` (`bg-secondary-fixed`).
   - Action Buttons:
     - Primary: `VIEW ROUTE STATUS` (Scrolls smoothly to timeline).
     - Secondary: `Share Status with Transporter` (Shares status via SMS & WhatsApp to Fleet Manager).
4. **Journey Route Progress Timeline**:
   - Title: `Journey Route Progress` ("Key checkpoints along your route").
   - Horizontal desktop track / vertical mobile steps:
     - Checkpoint 01: `Journey Started` (Mumbai, Departed 11:00 AM) — Green checkmark.
     - Checkpoint 02: `Pune Bypass` (Pune, Passed at 2:15 PM) — Green checkmark.
     - Checkpoint 03: `Khambatki Pass` (Restriction Point, Restriction: 4:00 PM – 10:00 PM, ETA: 5:20 PM) — Amber/Red warning circle.
     - Checkpoint 04: `Goa` (Margao Logistics Hub, Final Destination, Estimated 7:45 PM) — Location pin.
   - Holding Yard Advisory Strip: "Safe holding yard available 8 km before Khambatki Pass. KM 54 • Rest stop & security" (`bg-surface-container`).
5. **Alternative Scenario: Baseline Route View (Clear State Comparison)**:
   - Preview card demonstrating interface appearance when no restrictions exist.
   - Banner: `✅ YOUR JOURNEY IS CLEAR - No current restriction is affecting your journey. All highway sectors are open for heavy commercial trucks.`
   - Corridor Summary: `Mumbai → Goa • ETA: 7:45 PM • 420 km`.
   - Action Button: `START NAVIGATION` (Opens Google Maps or Mappls).
6. **Driver Modal: What Should I Do?**:
   - 3 Options presented:
     - Option 1 (Recommended): `Stop Safely & Wait` at Khambatki Approved Truck Yard (KM 54). Amenity tags: Clean Drinking Water, 24hr Canteen, Secure Truck Parking. CTA: "Select Option 1 (Navigate to Yard)".
     - Option 2: `Leave Earlier` (Cross before 4:00 PM cutoff).
     - Option 3: `Use Another Suitable Road` (Bhor-Wai bypass road, +22 km, ~45 min). CTA: "Preview Bypass Route".

#### Important Interactions
- Clicking "WHAT SHOULD I DO?" opens the 3-option modal.
- Clicking "VIEW ROUTE STATUS" smoothly scrolls to the Journey Route Progress timeline.
- Clicking "Share Status with Transporter" triggers feedback message: "Status sent to Fleet Manager via SMS & WhatsApp!".

---

### 17.3 Screen 3: Alerts (`TransitClear — Alerts`)

#### Layout
- Fixed left sidebar (`w-64`), sticky header (`h-16`), main container `max-w-6xl mx-auto p-8 space-y-6`.

#### Sections & Components
1. **Page Title & Header Block**:
   - Label: `DRIVER CONSOLE • HIGHWAY ADVISORIES` (11px amber).
   - Title: `Alerts` (`text-3xl`, 30px bold).
   - Subtitle: `Important updates affecting your journey.`
   - Alert Count Badge: `2 IMPORTANT ALERTS` (Red tint pill with animated ping dot).
2. **Primary Alerts Stack**:
   - **Alert 1: Active Route Restriction (Highest Priority)**:
     - 6px solid red left border (`border-l-red-600`).
     - Badges: `🚨 ROUTE ALERT • AFFECTS YOUR JOURNEY` and `IMMEDIATE ACTION REQUIRED` (pulsing dot).
     - Title: `Heavy trucks are restricted ahead` (24px font-black).
     - Narrative: "Restriction enforced on NH-48 Ghat Section. Commercial vehicles exceeding 12T GVW cannot enter during peak evening window."
     - 3 Metric Tiles:
       - Restriction Location: `Khambatki Pass` (NH-48 Ghat Section, Pune → Satara).
       - Restriction Hours: `4:00 PM – 10:00 PM` (6 Hour No-Entry Window).
       - Your Expected Arrival (ETA): `5:20 PM` (Arriving right in restriction, amber block).
     - Warning Slab: `⚠️ Your truck will reach during the restriction.`
     - CTA Row: Primary button `WHAT SHOULD I DO? →` + `3 safe options available to avoid roadblock` text with green checkmark.
   - **Alert 2: Road Work Advisory (Medium Priority)**:
     - 6px solid amber left border (`border-l-amber-500`).
     - Badges: `⚠️ ROAD UPDATE • IMPORTANT UPDATE` + "Reported 25 mins ago".
     - Title: `Road work reported ahead` (20px bold).
     - Narrative: "Lane resurfacing and diversion active on northern carriageway. Movement slow but moving."
     - 2 Metric Tiles:
       - Location: `Pune–Satara Road` (Near Shirwal Junction KM 64).
       - Expected Delay: `20–30 min slow moving` (Single lane traffic operating).
     - CTA: Outline button `VIEW DETAILS`.
3. **Recent Highway Updates (Historical Feed)**:
   - Header: "Recent Highway Updates" + "Last updated: Today, 3:15 PM".
   - Structured list container with dividers (`divide-y divide-slate-100`):
     - Item 1: `🚨 Affects your journey • Passed section` — Bhor Ghat Lane Restriction - Ended at 1:00 PM (1:10 PM).
     - Item 2: `⚠️ Important update • Weather advisory` — Rain & Fog Advisory near Khandala - Caution advised (11:45 AM).
     - Item 3: `✅ Resolved • Normal flow` — NH 48 KM 42 Stalled Vehicle Cleared - Traffic moving normally (09:30 AM).
4. **Action Plan Modal ("What Should I Do?")**:
   - Triggered by button in Alert 1.
   - Header: "ACTION PLAN REQUIRED", "What Should I Do?", "Khambatki Pass restriction window: 4:00 PM – 10:00 PM".
   - 3 Options:
     1. Recommended: `Stop safely & wait at approved holding yard` (Shree Ganesh Logistics Park KM 54, 48 truck spaces left) + button "Navigate to Holding Yard →".
     2. `Leave earlier to cross before 4:00 PM` (Pass within 40 mins, 60 km/h truck limit) + button "Check Speed Timeline".
     3. `Use alternate bypass corridor (Wai – Surur)` (Adds +32 km, ~45 min extra time) + button "Switch to Bypass Route".
   - Footer: Dispatcher support call link (`+91 98200 12345`) + "Dismiss" button.

#### Important Interactions
- Clicking "WHAT SHOULD I DO?" triggers the recommendation modal.
- Clicking "VIEW DETAILS" on Alert 2 triggers detailed advisory information.
- Modal supports backdrop click and `Escape` key dismissal.

---

### 17.4 Screen 4: Report Problem (`TransitClear — Report Road Problem`)

#### Layout
- Fixed left sidebar (`w-64`), top header (`h-16`), main form container `max-w-5xl mx-auto p-8 space-y-6`.

#### Sections & Components
1. **Page Header**:
   - Label: `DRIVER CONSOLE • ROAD HAZARDS` (11px amber).
   - Title: `Report Road Problem` (24px bold).
   - Subtitle: `See a problem on the road? Report it so the concerned authority can verify it.`
2. **Feedback / Status Banner (Sent for Verification Confirmation Card)**:
   - Green banner (`bg-emerald-50`, border `emerald-200`) indicating report confirmation.
   - Left Checkmark badge + Title: `REPORT SUBMITTED & QUEUED` + Report ID: `Report ID: TC-10452`.
   - Body: "Thank you for helping improve road safety. Your report has been sent for verification."
   - Authority Disclaimer: "ℹ️ Your report is not an official restriction. It will be verified by the concerned highway authority."
   - Action: "Dismiss" text button.
3. **Multi-Step Report Form Card**:
   - Contained in a white card (`rounded-2xl`, border `slate-200`, 28px padding):
   - **Step 1: WHAT IS THE PROBLEM?**:
     - Badge: `STEP 1` (Navy pill) + Heading: `WHAT IS THE PROBLEM?`.
     - Subtitle: "Select the issue you observed on your route:".
     - 6 Problem Type Selection Cards in a 2x3 grid:
       1. `Road Blocked` (🚧 - Route completely impassable) [Active by default with checkmark badge]
       2. `Accident` (🚗 - Crash or overturned vehicle)
       3. `Flooding / Water` (🌊 - Waterlogging or submerged road)
       4. `Road Damage` (🛣️ - Potholes, cave-in or debris)
       5. `Vehicle Breakdown` (🚛 - Stationary vehicle in lane)
       6. `Other Hazard` (⚠️ - Fallen trees, livestock, etc.)
   - **Step 2: LOCATION**:
     - Badge: `STEP 2` + Heading: `LOCATION`.
     - Auto-detected location box:
       - Status badge: `📍 YOUR LOCATION` + `GPS Locked` (emerald ping dot).
       - Detected text: `Location detected automatically: NH 48, near Shirwal (KM 58 • Pune-Satara Section)`.
       - Accuracy note: "No manual latitude/longitude entry needed. Accurate to within 12 meters."
       - Action button: `📍 USE CURRENT LOCATION` (re-detects position).
   - **Step 3: PHOTO (Optional)**:
     - Badge: `STEP 3` + Heading: `PHOTO (Optional)`.
     - Guidance text: "A clear photo helps authorities verify the problem faster and dispatch highway patrol."
     - Actions: Two buttons `📷 TAKE PHOTO` and `📁 UPLOAD PHOTO` + status label `"No file selected yet"`.
   - **Step 4: DESCRIPTION (Optional)**:
     - Badge: `STEP 4` + Heading: `DESCRIPTION (Optional)`.
     - Guidance text: "Tell us briefly what happened or give details that could help other drivers:".
     - Textarea: 3 rows with placeholder: *"Example: Road is blocked by a broken-down truck near the bridge. Single lane open with slow movement."*
   - **Form Submission Footer**:
     - Attribution note: `🛡️ All reports are tagged with vehicle MH-04-AB-1234 & driver ID.`
     - Primary Submit Button: `🚀 SUBMIT REPORT` (Navy 56px button).
4. **Life-Threatening Emergency Helpline Bottom Banner**:
   - Amber alert strip (`bg-amber-50/80`, border `amber-200`):
   - Left: `⚠️ Life-threatening emergency on the highway? Call immediately for ambulance and emergency patrol service.`
   - Right: "NHAI Helpline — **1033 / 112**".

#### Important Interactions
- Clicking any problem type tile selects it, toggles the active sky-blue border and background, and applies the top-right checkmark.
- "USE CURRENT LOCATION" triggers geolocation re-detection.
- "SUBMIT REPORT" queues the problem report and displays the verified submission confirmation banner.

---

### 17.5 Screen 5: Profile (`TransitClear — Profile`)

#### Layout
- Fixed left sidebar (`w-64`), sticky header (`h-16`), main container `max-w-5xl mx-auto px-10 py-8 space-y-6`.

#### Sections & Components
1. **Page Header**:
   - Label: `DRIVER CONSOLE • ACCOUNT` (11px amber).
   - Title: `Profile` (30px bold).
   - Subtitle: `Manage your account and preferences.`
2. **Driver Information Hero Card**:
   - Large white card (`rounded-xl`, border `slate-200`, 24px padding):
   - Driver Avatar: 64x64px dark navy rounded square with initials `RK`.
   - Identity: `Rajesh Kumar` (20px bold) + role badge: `Commercial Heavy Driver` (Blue pill).
   - Contact & Vehicle sub-tags: Phone `+91 98765 43210` • Vehicle `Heavy Truck • MH-04-AB-1234`.
   - Fleet affiliation: `VRL Logistics Fleet • Mumbai Division` (with active green dot).
   - Verification Box: "Driver Status: Active & Verified" (Emerald badge).
3. **Two-Column Grid Details Section**:
   - **Column 1: Personal Details Card**:
     - Header: `Personal Details` ("Primary info").
     - Field 1: Full Name — `Rajesh Kumar`.
     - Field 2: Mobile Number — `+91 98765 43210`.
     - Field 3: Display Language — Segmented control: `English` [Selected] | `हिंदी` | `मराठी`.
     - Action Button: `EDIT DETAILS` (Full-width outline button with pencil icon).
   - **Column 2: My Vehicle Card**:
     - Header: `My Vehicle` ("Active registration").
     - Field 1: Vehicle Type — `Heavy Truck (6-Axle Rigid Trailer)`.
     - Field 2: Vehicle Number — `MH-04-AB-1234` (Monospace styled badge).
     - Field 3: FASTag Status — `Active & Linked` (Emerald pill with green dot).
     - Action Button: `EDIT VEHICLE` (Full-width outline button with truck icon).
4. **Preferences Card**:
   - Header: `Preferences` ("Travel notification settings").
   - 4 Settings Controls in a 2x2 grid:
     1. `Preferred Language`: Dropdown (`English`, `हिंदी (Hindi)`, `मराठी (Marathi)`) — Subtext: "App alerts and voice output language".
     2. `Audio & Voice Alerts`: Toggle switch (`ON` / Emerald) — Subtext: "Spoken road warnings & ghat alerts".
     3. `SMS Route Notifications`: Toggle switch (`ON` / Emerald) — Subtext: "Critical blockages via text message".
     4. `WhatsApp Alerts`: Toggle switch (`ON` / Emerald) — Subtext: "Live timing advisory & diversion maps".
5. **Support and Account Actions Section**:
   - Card with horizontal split:
   - Left Support Links:
     - `Help & Support (National Highway Helpline 1033)`
     - `Privacy Policy`
     - `Terms of Service`
   - Right Destructive Action Button:
     - `LOG OUT / SWITCH VEHICLE` (Red tint outline button `bg-red-50 text-red-700 border-red-200`).

#### Important Interactions
- Toggling notification preference switches alters alerts delivery channels.
- Language selector changes interface language.
- "EDIT DETAILS" and "EDIT VEHICLE" trigger editing states.
- "LOG OUT / SWITCH VEHICLE" prompts session termination.

---

## 18. Reusable UI Components Matrix

The following components are shared across all five Driver UI screens:

| Component | Shared Across | Description & Key Specifications |
| :--- | :--- | :--- |
| **Global Left Sidebar** | All 5 Screens | Fixed 256px–288px navy sidebar with TransitClear logo, 5 navigation links with active state pill, and bottom Emergency Helpline box (`1033 / 112`). |
| **Global Top Header** | All 5 Screens | Fixed 64px–80px white bar with TransitClear sub-brand, language selector (`English \| हिंदी \| मराठी`), notification bell with unread dot, and driver profile pill (`Rajesh K. • MH-04-AB-1234`). |
| **Emergency Helpline Box / Banner** | All 5 Screens | Highway assistance callout emphasizing `1033 / 112` (`NHAI • POLICE`), styled in navy with amber icon in sidebar and full-width amber banner on content pages. |
| **Language Selector** | All 5 Screens | Segmented 3-way toggle button (`English \| हिंदी \| मराठी`) placed in top header and profile settings. |
| **Status Alert Card with Semantic Rail** | Home, My Journey, Alerts | High-visibility card with 6px–12px vertical color rail on left (Crimson for emergency, Amber for restrictions, Emerald for clear). |
| **Metric Stat Block** | Home, My Journey, Alerts | Rounded container with icon, uppercase label, prominent metric (ETA, Hours, Distance, Location), and subtext. |
| **What Should I Do? Modal** | Home, My Journey, Alerts | Centered modal with dark backdrop blur scrim and 3 structured driver options (Stop & Wait at Yard KM 54, Leave Earlier, Use Bypass Route). |
| **Driver Identity Chip** | Home, My Journey, Alerts, Profile | Standardized vehicle badge (`Heavy Truck • MH-04-AB-1234`) with truck icon. |
| **Primary Action Button (56px)** | All 5 Screens | High-contrast 56px height button (`bg-primary` / `#0F2942` / `slate-950`), white bold text, uppercase tracking, rounded-xl/lg. |
| **Secondary Outline Button (48px)**| All 5 Screens | 48px height button with 1px border `#CBD5E1` or `surface-container` fill. |
| **Pulsing Status Ping Dot** | All 5 Screens | Concentric pulsing ping circle (`animate-ping`) used for live GPS lock, immediate action alerts, and unread notifications. |

---

## 19. Design Completeness & "Not Specified in the Design" Notes

Per instructions, the following behaviors or configurations are **Not specified in the design** and must be decided during frontend integration or backend binding:

1. **Map Rendering Engine**: The designs specify route progress through structured visual timelines and checkpoint cards; interactive map rendering (e.g., Mapbox, Google Maps SDK, Leaflet) is not embedded directly in the canvas. The designs instead specify external launching via "START NAVIGATION (Opens Google Maps or Mappls)".
2. **Camera / Hardware Native Upload**: In "Report Problem" (Step 3), the camera integration (`TAKE PHOTO`) specifies UI triggers; native mobile WebRTC / device camera bridge permissions are not specified in the design.
3. **Form Error & Validation States**: Visual representations of form validation errors (e.g., submitting empty city inputs or network failure toast banners) are not present in the Stitch designs.
4. **Offline Caching UI**: UI indicators for intermittent highway connectivity or offline packet sync are not specified in the design.
5. **Multi-language Dynamic Font Swapping**: While the layout accommodates Hindi and Marathi via the language selector, regional font families (such as Noto Sans Devanagari) are not explicitly specified in the Stitch theme tokens (Inter is applied universally).
