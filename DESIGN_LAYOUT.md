# ELCS Landing Page Technical Design & Animation Specification

This document outlines the complete architectural, visual, and behavioral specifications for the ELCS single-page landing application. Built using Next.js (App Router), Tailwind CSS, TypeScript, and Framer Motion.

---

## 1. Global Visual Identity & Token System

### 1.1 Color Palette Tokens
* **Canvas Background (Anthracite):** `#2D302F` (Deep matte metallic base).
* **Contrast Content (Timberwolf):** `#D7D0C7` (Raw stone off-white for structural typography and light panels).
* **Brand Primary (Raw Umber):** `#7A5938` (Deep technical bronze).
* **Brand Accent (Circuit Gold):** `#D4AF37` or `#E5C158` (Metallic gold matching the brand logo artwork).
* **System Muted:** Slate variant at 40% opacity for tracking labels and metadata grids.

### 1.2 Structural Typography Map
* **About Section Prose Context:** `Caudex` (Serif layout variant for editorial readability).
* **Hero Interactive Text Overlays:** `Sofia Pro` (Perfectly geometric, high-visibility sans-serif).
* **Fullscreen Menu Main Links:** `Abolition` (Aggressive, ultra-condensed industrial uppercase typeface).
* **Global Body & Standard Copy System:** `Avenir` (Humanistic sans-serif for clean, responsive interfaces).
* **UI Metrics, Numbers, & Badges:** `Geist Mono` or `JetBrains Mono` (Technical monospaced variant).

---

## 2. Component Pipeline & Structural Layout Mechanics

### 2.1 The Technical Preloader Sequence & State Hand-off
* **Inspiration Style:** Cynx.io (Progressive numerical preloader matching an SVG line-draw system).
* **Behavior Stack:**
    1. Lock page accessibility completely on entry via global layout viewport constraints (`overflow: hidden`).
    2. Render a solid, opaque canvas layer utilizing **Anthracite (`#2D302F`)**.
    3. Position a minimal `Geist Mono` numeric element precisely at viewport center. Execute an accelerated counter loop tracking smoothly from `0` to `100` asynchronously while page asset components compile in the background.
    4. Upon hitting `100`, fade out the numeric characters instantly over `150ms`.
    5. In its exact center coordinate, trigger an inner SVG path stroke animation to trace the outline of the circular ELCS gold logo (`strokeDasharray` configuration mapping to a `pathLength: 1` interpolation curve over `1200ms`).
    6. Once the path drawing locks, execute a split-second structural split or vertical curtain shift (`translateY: "-100%"`) with a sharp cubic-bezier anchor (`[0.76, 0, 0.24, 1]`) to reveal the landing platform. Unclip page overflow limits.
* **The Hero Entrance Hand-off:** To prevent the main site from snapping into view statically after the curtain lifts, the completion of the preloader must immediately dispatch a state trigger to the Hero Vertical Accordion. The 5 vertical columns must stagger-fade into place from `opacity: 0` and `scaleY: 0.95` over `800ms` using a controlled orchestrator element (`staggerChildren: 0.1`).

### 2.2 The Global Navigation Header Bar
* **Visual Structure:** Absolute edge-to-edge full width navbar frame with zero initial background surface opacity. 
* **Left Anchor:** The isolated circular ELCS gold icon logo, rendering cleanly with zero secondary text clutter.
* **Right Anchor:** A minimalist, premium three-bar interactive toggle button (Hamburger) utilizing fine, lightweight layout strokes colored in **Timberwolf (`#D7D0C7`)**.
* **Micro-Interaction Mechanics:** On interaction click, the navigation drawer mounts while the toggle button executes a spring physics transformation (`type: "spring", stiffness: 220, damping: 14`):
    * The center horizontal line scales down cleanly to zero (`scaleX: 0`, `opacity: 0`).
    * The top and bottom horizontal lines execute symmetric rotations of exactly `45°` and `-45°` respectively, shifting their shared Y-axis offsets to form a perfect `✕` icon element.
    * The font profile used inside the menu layer switches seamlessly to massive uppercase tracking using the **Abolition** font system.

### 2.3 Hero Layout: The Vertical Expanding Accordion Slider
* **Layout Architecture:** A horizontal row container layout composed of 5 vertical column blocks filling exactly `85vh` of viewport room.
* **Asset Allocation & Text Mapping:** Load the specific high-resolution images provided. The `Sofia Pro` typography text and technical subtext layout for each specific column block must map as follows:

1. **Column 1: Custom PCBs**
   * **Image Filename:** `Custom PCBs.png`
   * **Heading (Sofia Pro):** CUSTOM PCB FABRICATION
   * **Subtext (Avenir):** High-density multi-layer routing, precision impedance control, and rapid manufacturing prototyping rules.
   * **Mono Tag (Geist Mono):** `[IPC-CLASS-3]`

2. **Column 2: Embedded Modules**
   * **Image Filename:** `Embedded Modules.png`
   * **Heading (Sofia Pro):** CORE SYSTEM MODULES
   * **Subtext (Avenir):** Compact processing solutions and plug-and-play architecture for faster device scaling.
   * **Mono Tag (Geist Mono):** `[ARM-ARCHITECTURE]`

3. **Column 3: Connectivity Devices**
   * **Image Filename:** `Connectivity Devices.png`
   * **Heading (Sofia Pro):** IOT CONNECTIVITY
   * **Subtext (Avenir):** Secure, low-latency communication frameworks bridging hardware interfaces and networks.
   * **Mono Tag (Geist Mono):** `[WIRELESS-PROTOCOLS]`

4. **Column 4: Control Hardware**
   * **Image Filename:** `Control Hardware.png`
   * **Heading (Sofia Pro):** AUTOMATION CONTROL
   * **Subtext (Avenir):** Industrial-grade execution environments designed for mission-critical deterministic systems.
   * **Mono Tag (Geist Mono):** `[DETERMINISTIC-IO]`

5. **Column 5: Firmware Architecture**
   * **Image Filename:** `Firmware Architectur.png`
   * **Heading (Sofia Pro):** FIRMWARE ENGINEERING
   * **Subtext (Avenir):** Bare-metal optimization and clean real-time operational device orchestration.
   * **Mono Tag (Geist Mono):** `[RTOS-KERNELS]`

* **Default State:** All columns share exactly equal initial layout dimensions (`width: 20%`), framed by razor-thin vertical divider tracks (`border-white/5`). Internal structural photography cards sit in desaturated, darker states.
* **Interaction Mechanics (On-Hover):**
    * When the cursor enters a specific vertical asset column section, it springs outward to capture a dominant frame width layout configuration, smoothly compressing the remaining four un-hovered slices evenly to the side rails.
    * The hovered slice transitions cleanly from low-opacity grayscale into full chromatic depth, gracefully fading the overlay heading text, subtext description, and structural mono tag neatly into focus.
* **Interaction Mechanics (On-Click Full Takeover):**
    * Upon explicit cursor click interaction, the selected panel expands instantly to claim a full `100%` viewport width setting. The remaining four tracking panels slide entirely out of bounds (`width: 0%`).
    * A clean back arrow element slides into view from the structural border grid to enable smooth reversal and reset back to the 5-column idle layout frame.
* **Mobile Adaptivity Directive:** If the responsive viewport boundary screens track lower than `768px`, the horizontal grid mechanics will break. The agent must automatically transform this component into a **Vertical Stack Accordion**, where the items expand dynamically in height (`height: 50vh` for active, compressed options scaling smaller) instead of altering horizontal width.

### 2.4 Section 1: About Us Bento Grid & The PCB Cursor Track
* **Layout Grid Mapping:** A responsive Bento block array containing three asymmetrical layout components configured across a dark, matte canvas matrix.
    * **Block 1 (Span 2 Columns):** Houses primary mission prose using the elegant **Caudex** font system for an editorial, high-end engineering journal finish.
    * **Block 2 (Span 1 Column):** A monospace operational grid tracking strict quality and certification compliance indicators (`[IPC-DESIGN-RULES]`, `[ROHS-COMPLIANT]`, `[ESD-SAFE]`).
    * **Block 3 (Span 3 Columns):** Full width lower horizontal bar illustrating open engineering developer asset support files and ecosystem access metrics.
* **The Interactive Background Canvas:**
    * Behind the structural text elements, implement an inline tileable background layer loading a clean, geometric vector graphic (`/images/pcb-schematic-grid.svg`) rendered in highly subtle, low-opacity **Raw Umber (`#7A5938`)**.
    * The AI agent must initialize a lightweight mouse coordinate tracking hook monitoring pointer variables (`--mouse-x` and `--mouse-y`) over the container layout box.
    * Apply a real-time mask overlay property across this tracking layer (`mask-image: radial-gradient(circle 180px at var(--mouse-x) var(--mouse-y), black 30%, transparent 100%)`). As the user moves across the text block regions, the golden background schematic pathways dynamically illuminate to full brilliance only directly under the proximity radius of the active cursor path.

### 2.5 Section 2: The 3Cs Split Viewport Scroll Engine (#ConnectTogether)
* **Layout Framework:** A continuous block area defined across an absolute height metric of `300vh`, executing a split 50/50 structural column block arrangement on desktop.
* **The Left Column (Sticky Visual Core):** Locked rigidly in place using sticky parameters (`position: sticky; top: 0; height: 100vh;`). 
    * Centrally mounted inside this visual hub is an abstract, geometric vector wireframe 3D model framework representing a pyramid or multi-faceted crystal element on an engineering grid blueprint background.
    * A permanent, low-opacity monospace structural text anchor reads `#ConnectTogether` at the boundary baseline.
* **The Right Column (Scroll Text Rail):** Contains three discrete text blocks mapping out **Connect**, **Control**, and **CareSure** respectively. Each text segment takes up exactly `100vh` of space to track user traversal progress natively.
* **Scroll Interlocking Logic via Framer Motion:**
    * Tie continuous vertical scrolling movement progress variables directly into reactive parameters using `useScroll` tracking hooks over this layout boundary.
    * Map scrolling milestones to structural rotation values: `scrollYProgress [0 -> 0.5 -> 1.0]` transforms geometric visual rotation coordinates cleanly across fixed intervals `[0° -> 120° -> 240°]`.
    * As each content block on the right rails passes into focus, individual internal nodes or faces of the sticky left-side pyramid model automatically animate their line stroke fills, shifting from deep raw umber accents into rich, glowing circuit gold points to match the active topic block.
* **Mobile Adaptivity Directive:** On mobile screens, the sticky 50/50 layout locks comfortably into a standard linear scrolling layout. The sticky container disables, and the corresponding geometric facet visual stacks directly on top of its respective text card, rendering sequentially as a unified technical block.

### 2.6 Fullscreen Overlay Navigation Drawer System
* **Reveal Style:** Staggered Slat Panel Curtain Wipe.
* **Prioritization Architecture:** Because the site is built around a comprehensive set of calculators (`iT Talk`) and a database store structure (`Products`), the menu layout must explicitly stack these conversion paths first.
* **Execution Behavior:**
    * When the navbar menu icon is triggered, the fullscreen navigation framework splits visually into three or four independent column strips (slats) that slide or wipe rapidly from the right edge with a clean staggered delay setting (`i * 0.1s`).
    * The background surface panel color transitions entirely to solid **Timberwolf (`#D7D0C7`)**, while the font color controls flip to high-contrast **Anthracite (`#2D302F`)**.
    * The primary focus tracking links (`iT TALK`, `PRODUCTS`, `PROGRESS`, `HOME`) layer vertically in heavy, massive uppercase expressions using the industrial display typeface **Abolition**.
* **Link Micro-Interactions on Hover:**
    * When a user moves over a link element, it smoothly translates sideways (`translateX: 16px`).
    * A small, secondary monospace description string appears immediately underneath the hovered category item in **Raw Umber (`#7A5938`)** to present a clean technical summary of the page context.
    * An ultra-thin gold tracking bar dynamically animates outward from center alignment boundaries right underneath the characters to frame the active text selection path.

### 2.7 Section 3: The Functional Minimalist Engineering Footer
* **Layout Architecture:** A structural 2-tier design canvas capping the base of the page platform using dark Anthracite parameters.
* **Top Tier (Brand vs Quick Message Input Interface):** Split cleanly across a 50/50 horizontal boundary block layout.
    * *Left Element Group:* Displays the gold circular brand logo graphic resting directly above the `#ConnectTogether` token text.
    * *Right Element Group:* The Quick Message contact input fields form. Inputs remain completely borderless, loading zero background surface colors. They display only a clean bottom line divider. When focused, this line divider animates smoothly from muted grey into full Circuit Gold brilliance. The "Send Message" action button is an open border loop capsule; on cursor hover, a solid block of Timberwolf slides horizontally from left to right to invert color contrast layouts dynamically.
* **Bottom Tier (Directory Matrix & Legal Compliance Block):**
    * Divided neatly from the top tier by an ultra-thin line at `10% opacity`.
    * Organizes technical typography blocks mapping address data, active WhatsApp routing paths, and social infrastructure links (`LinkedIn` / `Instagram`) cleanly across four symmetrical monospace columns using the **Geist Mono** engine framework.
    * Features a minimal click interaction node on the right boundary corner to enable smooth structural scroll reset back to the absolute top of the viewport engine (`Scroll To Top`).

---

## 3. Typography Reference — Original Spec vs. Free Alternatives vs. Live Site

The original design spec used commercially licensed typefaces. The table below maps each to its free Google Fonts alternative and documents what is currently loaded in the production site.

| Role in Design | Original (Licensed) | Free Alternative | Source | Currently in Site (`layout.tsx`) |
|---|---|---|---|---|
| Display / Headings / Menu | **Abolition** | **Bebas Neue** | Google Fonts — same ultra-condensed industrial uppercase DNA | `Oswald` via `--ff-display` |
| Hero Text Overlays / Sub-headings | **Sofia Pro** | **Outfit** | Google Fonts — geometric, same clean proportions | `Inter` via `--ff-sans` |
| About Section / Editorial Serif | **Caudex** | **Caudex** ✅ | Google Fonts — exact same, available natively | `Caudex` via `--ff-serif` ✅ |
| Global Body Copy | **Avenir** | **Nunito** / **Nunito Sans** | Google Fonts — humanist, confirmed match | `Nunito Sans` via `--ff-body` ✅ |
| UI Metrics / Mono Labels / Badges | **Geist Mono** | **Geist Mono** / **JetBrains Mono** | Vercel (free) / Google Fonts | `JetBrains Mono` via `--ff-mono` ✅ |
| Product Names / Detail Views | *(not in original spec)* | **DM Sans** | Google Fonts — humanist, highly legible | `DM Sans` via `--ff-product` |

### Notes on Current Divergence

- **Display (`--ff-display`):** Site currently uses `Oswald` — a valid condensed industrial font but not as extreme as Bebas Neue. To match the design spec closer, swap `Oswald` → `Bebas Neue` in `app/layout.tsx`.
- **Sans (`--ff-sans`):** Site uses `Inter` as a general fallback sans. `Outfit` (the Sofia Pro alternative) would better match the original design intent for hero overlays.
- **Body, Serif, Mono:** All three are on-spec or exact matches — no changes needed.

### To Align Site Fully with Swap Map

In `app/layout.tsx`, replace:
```ts
// Current
import { Oswald, Caudex, Nunito_Sans, JetBrains_Mono, Inter, DM_Sans } from 'next/font/google'

// Target (fully spec-aligned)
import { Bebas_Neue, Outfit, Caudex, Nunito_Sans, JetBrains_Mono, DM_Sans } from 'next/font/google'
```
And rename `oswald` → `bebasNeue`, `inter` → `outfit` with their respective configs. The CSS variable names (`--ff-display`, `--ff-sans`) stay unchanged — no Tailwind or component edits required.