---
name: Warm Bento Brutalism
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#444748'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#586400'
  on-secondary: '#ffffff'
  secondary-container: '#d5eb45'
  on-secondary-container: '#5c6900'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410000'
  on-tertiary-container: '#de5848'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#d8ee48'
  secondary-fixed-dim: '#bcd12b'
  on-secondary-fixed: '#191e00'
  on-secondary-fixed-variant: '#424b00'
  tertiary-fixed: '#ffdad5'
  tertiary-fixed-dim: '#ffb4a9'
  on-tertiary-fixed: '#410000'
  on-tertiary-fixed-variant: '#8a1a12'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.06em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
---

## Brand & Style

This design system blends refined neo-brutalism with contemporary bento architecture. It replaces harsh raw brutality with an editorial, tactfully crafted warmth. The visual posture is precise, confident, and delightfully structured—characterized by generous radiuses, crisp dark hairline framing, paper-like warmth, and electric bursts of focal color.

Target audience spans design-literate digital natives, creators, and high-velocity product users who appreciate structural clarity without corporate sterility.

Key style pillars:
- **Warm Canvas & Paper Texture:** Evokes physical tactile paper, notebooks, and architectural sketchbooks rather than stark digital white.
- **Architectural Framing:** Solid 1.5px ink outlines enforce strict modular division, separating content into tactile bento blocks.
- **Controlled Pop Signals:** High-saturation citron-lime and warm coral-orange are strictly reserved for calls to action, badges, and focal state indicators.
- **Tactile Modernity:** Pill-shaped capsules, barcode tags, circular badges, and clean geometric typography deliver a balance of editorial polish and utilitarian precision.

## Colors

The palette balances warm neutral foundational surfaces with stark ink-black lines and energetic accent punches:

- **Canvas & Surface System:** 
  - Canvas Base: `#FAF7F2` (soft warm cream).
  - Primary Bento Fill: `#FFFFFF` (clean white) and `#EFECE6` (muted oat neutral) used to create structural modular contrast.
  - Secondary Inset Container: `#F4EFEA`.
- **Ink & Structural Strokes:**
  - Ink Solid: `#111111` for high-impact display typography, borders, and dark hero pills.
  - Ink Subdued: `#55524E` for secondary body copy and metadata.
  - Hairline Stroke: `#1A1A1A` at 1.5px width for card boundaries and internal divider rules.
- **Chromatic Accents:**
  - Citron Lime: `#E2F952` (with soft variant `#D9F99D`) serves as the dominant high-conversion accent for interactive pills, badges, and active state highlights.
  - Coral / Burnt Orange: `#EE6352` (with `#F97316`) serves as the dynamic secondary accent for badges, discount pills, media player backdrops, and spark indicators.

## Typography

The typographic hierarchy juxtaposes geometric clarity with utilitarian monospace detailing:

- **Display & Body (Plus Jakarta Sans):** Delivers clean humanist geometry with friendly, open apertures. Large display headings carry tighter negative letter-spacing (`-0.02em` to `-0.03em`) for a punchy editorial presence.
- **Labels, Keys & Metrics (JetBrains Mono):** Reserved for technical metadata, barcodes, timestamps, counters, and status badges, grounding the neo-brutalist bento framework in functional precision.
- **Hierarchy Rules:** Large stat numbers (e.g. `174+`, `12k+`) are rendered in `Plus Jakarta Sans` Medium/SemiBold with tight tracking, anchored by small `label-mono` or `body-sm` descriptors beneath.

## Layout & Spacing

The layout is built upon a modular bento grid structure:

- **Grid Framework:** 12-column adaptive grid on desktop, 6-column on tablet, and single-column stacked layout on mobile. Bento containers span varying proportions (e.g., 3-col, 4-col, 6-col, 8-col) to create rhythm.
- **Card Padding Consistency:** Inner bento modules maintain uniform `1.5rem` (`space-lg`) internal padding, scaling down to `1rem` (`space-md`) on mobile viewports.
- **Horizontal Dividers:** Internal card compartmentalization uses edge-to-edge 1.5px solid borders with vertical spacing of `1rem` (`space-md`), keeping data clean and segmented.

## Elevation & Depth

This design system avoids diffused ambient blur shadows and skeuomorphic gradients in favor of **tactile planar surfaces and crisp line borders**:

- **Borders over Shadows:** Depth is achieved via `1.5px solid #111111` framing against contrasting background planes (`#FFFFFF` vs. `#EFECE6` on `#FAF7F2`).
- **Surface Elevation Hierarchy:**
  - Base: Canvas `#FAF7F2`.
  - Level 1: Bento modules with `#FFFFFF` or `#EFECE6` fill bounded by `#111111` stroke.
  - Level 2: Inset nested capsules, image containers, or nested action zones with `#F4EFEA` or black pill fills.
- **Hard Offset Hover Shadows (Optional Accent):** Interactive cards or buttons may utilize zero-blur hard offset shadows (`box-shadow: 3px 3px 0px #111111`) on hover/focus states to deliver tactile mechanical feedback.

## Shapes

The design system embraces high-radius geometric softness framed by crisp ink outlines:

- **Bento Modules & Outer Cards:** Standardized on `rounded-2xl` (1.25rem) to `rounded-3xl` (1.75rem / 28px). Internal segmented sections share matching corner radii along their outer vertices.
- **Buttons & Pills:** Fully rounded pill-shapes (`border-radius: 9999px`) across primary action triggers, status chips, navigation bars, and icon indicators.
- **Media Insets:** Nested media, avatar cutouts, and preview windows use either perfect circles (`50%`) or `rounded-2xl` capsules inset by uniform `space-sm` or `space-md`.

## Components

### Buttons & Action Triggers
- **Primary Pill:** Background `#111111`, text `#FAF7F2`, pill radius (`9999px`), optional integrated inline icon with trailing directional arrow (`→`).
- **Accent Action Pill:** Background `#E2F952`, text `#111111`, border `1.5px solid #111111`.
- **Linked Pill Group:** Dual-segmented pill where a primary black button merges seamlessly into a secondary neutral pill (`#EFECE6`) containing an icon badge (e.g., play button inside circular black housing).
- **Circular Icon Button:** 44px circular trigger with `1.5px solid #111111`, background `#E2F952` or `#FAF7F2`, featuring a 45-degree arrow (`↗`).

### Cards & Bento Modules
- **Modular Cards:** Framed in `1.5px solid #111111`, `rounded-3xl` corner radius, overflow hidden.
- **Segmented Bento Card:** Horizontally divided by an interior `1.5px solid #111111` rule, separating headline/media above from metrics, barcode metadata, or date chips below.
- **Header Floating Bento Nav:** Pill-shaped navigation bar spanning the header with `1.5px solid #111111` stroke, soft beige `#EFECE6` fill, linked text items, and inset pill action triggers.

### Chips, Badges & Accents
- **Discount & Rating Chips:** Micro-pills with `1.5px solid #111111`, background `#E2F952` or `#EE6352`, text in `label-caps` or `label-mono`.
- **Barcode & Cryptographic Tags:** Clean vertical vector barcode pattern paired with timestamp and duration metrics in `JetBrains Mono`.
- **Geometric Star / Spark Accents:** Diamond-shaped spark motifs in coral (`#EE6352`) used as rating indicators and decorative section anchors.

### Inputs & Form Fields
- **Search & Text Input:** Pill-shaped or `rounded-2xl` container with `1.5px solid #111111`, `#FAF7F2` background, placeholder text in `body-md` muted ink, focus state shifting to `#FFFFFF` background with hard offset stroke indicator.

### Checkboxes & Radios
- **Checkboxes:** `rounded-md` (6px) with `1.5px solid #111111`. Selected state filled with `#E2F952` displaying a crisp `#111111` check mark.
- **Radio Buttons:** Circular with `1.5px solid #111111`. Selected state contains a solid `#111111` inner dot.