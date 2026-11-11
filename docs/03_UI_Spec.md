# 03 — UI Specification (design system)

> Tokens are defined in `Client/styles/globals.css` (Tailwind CSS v4 `@theme`).
> **Never hard-code a hex value in a component** — use the token class
> (`bg-ink-950`, `text-stone-600`, `bg-accent` …). Admin (antd) maps the same
> values in `Client/components/features/Admin/AdminProviders.tsx`.

## 1. Color palette

### Ink — dark neutrals
| Token | Hex | Use |
| --- | --- | --- |
| `ink-950` | `#0A0B0D` | Dark section background, primary button, header pill |
| `ink-900` | `#111316` | Body text on light, admin primary |
| `ink-850` | `#15181B` | Raised dark surfaces |
| `ink-800` | `#1B1E22` | Dark cards, admin selected menu item |
| `ink-700` | `#24282D` | Primary button hover |
| `ink-600` | `#33383F` | Dark borders |
| `ink-500` | `#4B5159` | Muted icons on dark |
| `ink-400` | `#6C727B` | Meta text on dark |
| `ink-300` | `#9BA1A9` | Secondary text on dark |
| `ink-200` | `#C4C8CD` | Primary-ish text on dark (links) |

### Paper — warm light neutrals
| Token | Hex | Use |
| --- | --- | --- |
| `paper-50` | `#FBFAF6` | Cards, inputs, "white" sections, text on dark |
| `paper-100` | `#F4F1EA` | **Page background** (`body`) |
| `paper-200` | `#EBE6DB` | Alt sections, secondary button |
| `paper-300` | `#DDD6C7` | Borders/rings on light |
| `paper-400` | `#C7BFAD` | Strong borders |

### Stone — warm grey text on paper
| Token | Hex | Use |
| --- | --- | --- |
| `stone-500` | `#807B73` | Placeholders, tertiary |
| `stone-600` | `#69655E` | Secondary text (4.8:1 on paper-100) |
| `stone-700` | `#4F4C46` | Emphasised secondary text |

### Accent (single, restrained)
| Token | Default | Rule |
| --- | --- | --- |
| `accent` | `#C8F25C` (electric lime) | Editable in Admin → Site settings → Branding (6-digit hex only). Set at runtime as `--accent` on `<html>` |
| `accent-contrast` | `#0A0B0D` | Computed by `lib/color.ts → contrastTextFor()` (ink or `#FFFFFF`, whichever has higher WCAG contrast) |

Use the accent sparingly: CTAs, active nav dot, highlights, focus ring on dark surfaces, `::selection`. Never use accent for body text on light backgrounds.

### Semantic
| Token | Hex |
| --- | --- |
| `success` | `#2F9E6B` |
| `warning` | `#D99A1E` |
| `error` | `#E5484D` |
| `info` | `#3D7CF5` |

## 2. Typography

Fonts load via `next/font/google` (self-hosted at build, `display: swap`):

| Token | Family | Role |
| --- | --- | --- |
| `font-sans` | **Geist** | Body, UI, admin (antd `fontFamily`) |
| `font-display` | **Bricolage Grotesque** | Headings (weight 600) |
| `font-serif` | **Instrument Serif** (400, italic) | Highlighted words in headlines (e.g. *built to perform.*) |
| `font-mono` | System mono stack | Eyebrows, indices, labels |

### Fluid scale (custom utilities)
| Utility | Size (clamp) | Line-height | Tracking |
| --- | --- | --- | --- |
| `text-display-2xl` | 2.75rem → 8.25rem | 0.94 | −0.045em |
| `text-display-xl` | 2.5rem → 6rem | 0.98 | −0.04em |
| `text-display-lg` | 2.1rem → 4.25rem | 1.02 | −0.035em |
| `text-display-md` | 1.65rem → 2.6rem | 1.08 | −0.03em |
| `text-display-sm` | 1.3rem → 1.65rem | 1.2 | −0.02em |
| `text-lead` | 1.06rem → 1.3rem | 1.6 | — |
| `text-eyebrow` | 0.72rem, mono, uppercase | 1.2 | 0.14em |
| body | 16px base (Tailwind) | default | `font-feature-settings: "ss01","cv11"` |

Rules: one `h1` per page; headings use `text-wrap: balance`, paragraphs `pretty`; long copy max width `measure` (68ch).

## 3. Spacing & layout

| Rule | Value |
| --- | --- |
| Spacing unit | Tailwind 4px scale (`p-4` = 16px). No arbitrary pixel values when a scale step exists |
| Container widths | `narrow` 880px · `default` 1360px · `wide` 1600px (`components/ui/Container.tsx`) |
| Side gutters | 16px (<640) · 24px (sm) · 40px (lg) · 48px (xl) |
| Section vertical padding | `clamp(4.5rem, 9vw, 8.5rem)` (`components/ui/Section.tsx`) |
| Breakpoints | Tailwind defaults: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 |
| Header height | 72px (`--header-height`); anchors use `scroll-padding-top: 88px` |
| Radii | `rounded-xl` 14px · `2xl` 18px · `3xl` 24px · `4xl` 32px · buttons `rounded-full` |
| Shadows | `shadow-card` (light cards), `shadow-frame` (device/browser frames on dark) |
| Grids | Hairline dividers = `gap-px` over a tinted background; an incomplete last row must be filled (last card spans remaining columns) |
| Minimum width | Every page works at 390px with **no horizontal scroll** |

## 4. Theme rules (light / dark)

There is **no user-selectable dark mode** (non-goal). Instead:

- Pages are composed of **sections with fixed tones** via `<Section tone>`:
  `paper` (default, `bg-paper-100`), `paper-alt` (`bg-paper-200/70`), `white` (`bg-paper-50`), `dark` (`surface-dark bg-ink-950 text-paper-100`).
- `.surface-dark` sets `color-scheme: dark` and switches `--focus-ring` to the accent. Inside dark surfaces use `ink-200/300/400` for text, `white/10` borders, `outline-light` / `ghost-light` / `accent` button variants.
- Child components adapt with the `[.surface-dark_&]:` variant (e.g. SectionHeading intro).
- The header pill and closing CTA band are always dark; the admin is always light (antd `defaultAlgorithm`, sidebar `#0A0B0D`, layout background `#F4F1EA`).

## 5. Motion

| Rule | Value |
| --- | --- |
| Easing | `--ease-out-expo` `cubic-bezier(0.16,1,0.3,1)`; `--ease-in-out-quart` |
| Scroll reveal | `[data-reveal]` → opacity 0 + 28px translate until visible; 0.9s; stagger via `--reveal-delay` (ms). One shared IntersectionObserver (`components/shared/RevealObserver.tsx`); 6s failsafe shows content if JS never starts |
| Entrance | `.animate-rise` (1.1s, blur→sharp), `.animate-fade-in` |
| Ambient | `float-slow` 7s, `pulse-dot` 2.4s, `marquee` 40s, `scroll-cue` 2.2s |
| Reduced motion | `prefers-reduced-motion: reduce` → all durations 0.01ms, reveals shown immediately. **Mandatory** for any new animation |
| Performance | Animate only `opacity`/`transform`/`filter`; no JS animation libraries |

## 6. Core components & states

### Button (`components/ui/Button.tsx`, `ButtonLink.tsx`, styles in `buttonStyles.ts`)
Variants: `primary` · `accent` · `secondary` · `outline` · `outline-light` · `light` · `ghost` · `ghost-light` · `danger` · `success` · `warning` · `link`.
Sizes: `sm` h-36 · `md` h-44 (default) · `lg` h-52 · `xl` h-56 · `icon` 44×44.

| State | Style |
| --- | --- |
| Default | Per variant (e.g. primary `bg-ink-950 text-paper-50`) |
| Hover | Per variant (primary → `ink-700`; accent → `brightness .93`) |
| Active | `scale(0.98)` |
| Focus-visible | 2px outline `--focus-ring`, offset 3px |
| Disabled | `opacity .5`, no pointer events |
| Loading | Spinner replaces the icon, label kept, `disabled` + `aria-busy` |

Touch targets ≥ 44×44 px. Icon-only buttons need `aria-label`; decorative icons `aria-hidden`.

### Form fields (public contact form)
| State | Style |
| --- | --- |
| Default | `bg-paper-50`, `rounded-xl`, `ring-1 ring-ink-900/12`, `py-3.5 px-4` |
| Focus | `ring-2 ring-ink-900` |
| Invalid | `aria-invalid="true"` → `ring-error`; message below with `id` referenced by `aria-describedby` |
| Disabled/submitting | Inputs remain editable; submit button loading |
Labels are always visible (no placeholder-only labels). Optional fields marked "Optional".

### Cards
Project card: 16:10 screenshot (top-aligned), "Concept demo"/status badge, "Live demo" chip (external), eyebrow (industry), title, 2-line summary, arrow button. Hover: image scale 1.035 (1.4s ease-out-expo) + arrow nudge. Whole card is one link target plus the separate live-demo link.

### Skeleton (`components/ui/Skeleton.tsx`)
`Skeleton` (block), `SkeletonText` (lines sized by the real text class via `1lh`), `SkeletonInline`, `SkeletonStatus`/`SkeletonScreen` (one sr-only "Loading…"; blocks aria-hidden). Shimmer = transform only, off for reduced motion. Colours from `--skeleton-bg`/`--skeleton-shine` (switched by `.surface-dark`; `.surface-light` restores light on a dark parent). Page skeletons copy the real layout: `components/features/Skeletons/`; admin: `components/features/Admin/Skeletons.tsx`.

### Badge, Section, SectionHeading, PageHero, Breadcrumbs, FaqList (accordion with FAQPage JSON-LD), ShareActions, CopyButton (announces "Copied" via live region), DeviceFrames, Lightbox (Esc closes, focus trapped), SmartImage (`next/image` wrapper with placeholder), EmptyState, MediaPlaceholder.

### Admin (antd 6)
Theme tokens: `colorPrimary #111316`, `colorBgLayout #F4F1EA`, `colorBorder #DDD6C7`, `borderRadius 10`, `controlHeight 38`, `fontSize 14`, `cssVar.key "shds-admin"` (fixed key prevents hydration mismatch). Use antd v6 APIs only: `Alert title`, `Spin description`, `Space orientation`, `Space.Addon`, `Descriptions styles`, `Drawer size`, `App.useApp()` for modals/messages.

## 7. Accessibility checklist (every UI change)
- WCAG 2.1 AA contrast (stone-600 on paper-100 ≥ 4.5:1; never stone-500 for body text).
- Semantic landmarks, one `h1`, logical heading order, visible focus, skip link.
- All images have meaningful `alt` (or `alt=""` if decorative).
- Keyboard: every action reachable; dialogs/drawers trap and restore focus.
- Live regions for async results (form success/error, copy confirmation).
