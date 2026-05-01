# Design Brief

**Aesthetic:** Professional, data-centric HR dashboard. Teal-slate palette, clean typography hierarchy, minimal decoration.

**Tone:** Efficient, trustworthy, accessible. Visual clarity prioritizes data legibility over decoration. Desktop-first layout with high information density.

**Differentiation:** Refined productivity UI eschewing corporate grey monotony. Teal primary actions contrast elegantly against slate neutrals. Accessible typography with generous spacing. Clear surface hierarchy through cards, borders, and muted backgrounds.

## Color Palette

| Role | Light | Dark |
|------|-------|------|
| Primary (Teal) | `0.6 0.12 220` | `0.68 0.15 215` |
| Secondary (Slate) | `0.45 0.02 265` | `0.35 0.03 258` |
| Accent (Emerald) | `0.65 0.15 160` | `0.72 0.18 155` |
| Destructive (Red) | `0.58 0.24 18` | `0.62 0.22 16` |
| Background | `0.98 0.01 250` | `0.12 0.01 260` |
| Foreground | `0.18 0.02 265` | `0.92 0 0` |
| Muted | `0.92 0.01 250` | `0.2 0.01 260` |
| Border | `0.88 0.01 255` | `0.24 0.02 260` |

## Typography

| Tier | Font | Weight | Use |
|------|------|--------|-----|
| Display | General Sans | 600–700 | Page titles, section headers |
| Body | DM Sans | 400–600 | Form labels, table data, prose |
| Mono | Geist Mono | 400 | Numeric values, code, IDs |

**Line height:** 1.6 (body), 1.3 (display). **Letter spacing:** -0.01em (display).

## Structural Zones

| Zone | Treatment |
|------|-----------|
| Header/Nav | `bg-sidebar border-b`, elevated, clear tab hierarchy |
| Primary Content | `bg-background`, grid/flex layout for forms + data tables |
| Cards/Sections | `surface-elevated` (card + border + shadow-sm) |
| Data Tables | High density, monospace numerics, alternating row backgrounds |
| Form Areas | `surface-elevated`, compact label–input pairs |
| Status/Meta | `bg-muted/40`, subtle, secondary hierarchy |
| Buttons | Primary: `bg-primary text-primary-foreground`, Secondary: `bg-secondary text-secondary-foreground` |

## Spacing & Rhythm

- **Base unit:** 0.5rem (8px per default)
- **Container padding:** 2rem
- **Card padding:** 1.5rem
- **Form field gap:** 0.5rem
- **Section gap:** 2rem
- **Table row height:** 2.75rem (text-sm + 0.75rem v-padding)

## Component Patterns

- **Input fields:** `bg-input border border-border rounded-md`, focus ring on primary
- **Data tables:** Striped rows, sticky headers, responsive horizontal scroll
- **Tabs:** Underline style (active primary color), no background fill
- **Combobox/Select:** Compact dropdown, teal highlight on hover
- **Buttons:** Solid background for primary actions, ghost/outline for secondary
- **Alerts/Status:** Green (success), Red (error), Yellow (warning), Blue (info)

## Motion

- **Transitions:** 300ms smooth (buttons, hovers, state changes)
- **Interactions:** 150ms fast (input focus, dropdown open)
- **No animations on load** (users value speed over decoration)

## Constraints

- No gradients, no blur effects, no excessive shadows
- Avoid emoji icons (use SVG or Radix icons)
- Maximum 3 column tables per breakpoint
- Form labels always above inputs (vertical stack)
- Desktop-first: never force mobile stacking on HR dashboard

## Signature Detail

Tabular data rendered in `font-mono` with tight letter-spacing, creating visual rhythm that emphasizes numeric precision. Muted backgrounds + primary accents distinguish actionable areas from passive display zones.
