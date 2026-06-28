# UI/UX Rules — Skillplace Academy

## Design System: Academic Precision

Based on the reference design in `design/home/DESIGN.md` and `design/home/screen.png`.

**Brand Identity:** Corporate Modernism for high-stakes technical engineering education.
**Emotional Response:** Competence (structured layouts), Ambition (vibrant blue accents), Trust (deep navy palette).

---

## Colors

### Primary Palette (Deep Navy)
```css
--primary: #000000;              /* Black — ultimate sophistication */
--on-primary: #ffffff;
--primary-container: #131b2e;    /* Deep navy shell */
--on-primary-container: #7c839b;
--inverse-primary: #bec6e0;
--primary-fixed: #dae2fd;
--primary-fixed-dim: #bec6e0;
--on-primary-fixed: #131b2e;
--on-primary-fixed-variant: #3f465c;
```

### Secondary Palette (Accent Blue)
```css
--secondary: #0058be;            /* Vibrant accent blue — CTA, focus */
--on-secondary: #ffffff;
--secondary-container: #2170e4;
--on-secondary-container: #fefcff;
--secondary-fixed: #d8e2ff;
--secondary-fixed-dim: #adc6ff;
--on-secondary-fixed: #001a42;
--on-secondary-fixed-variant: #004395;
```

### Surface Palette
```css
--surface: #f8f9ff;              /* Page background */
--surface-dim: #cbdbf5;
--surface-bright: #f8f9ff;
--surface-container-lowest: #ffffff;
--surface-container-low: #eff4ff;
--surface-container: #e5eeff;
--surface-container-high: #dce9ff;
--surface-container-highest: #d3e4fe;
--on-surface: #0b1c30;           /* Primary text */
--on-surface-variant: #45464d;   /* Secondary text */
--inverse-surface: #213145;
--inverse-on-surface: #eaf1ff;
--outline: #76767d;
--outline-variant: #c6c6cd;
```

### Semantic Colors
```css
--success-green: #22c55e;
--navy-muted: #1e293b;
--surface-light: #f8fafc;
--border-subtle: #e2e8f0;
--error: #ba1a1a;
--on-error: #ffffff;
--error-container: #ffdad6;
--on-error-container: #93000a;
```

### Usage Rules
- **Navy (#131b2e / primary-container)** — Hero sections, dark sections, footer, anchors
- **Accent Blue (#0058be / secondary)** — CTAs, focus states, progress indicators, links
- **Surface (#f8f9ff)** — Page background
- **White** — Cards, content areas
- **On-surface (#0b1c30)** — Body text
- **On-surface-variant (#45464d)** — Muted/secondary text
- **Success green** — Completed states, active badges, checkmarks
- **Never use pure black (#000) for large areas** — Use primary-container (#131b2e)
- **Never use pure white (#FFF) for dark sections** — Use surface-container-lowest

---

## Typography

### Font Families
```css
--font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
```

### Type Scale
| Token | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|------|--------|-------------|----------------|-------|
| display-lg | Plus Jakarta Sans | 48px (32px mobile) | 800 | 1.1 (1.2 mobile) | -0.02em | Hero headlines |
| headline-lg | Plus Jakarta Sans | 32px | 700 | 1.2 | normal | Section titles |
| headline-md | Plus Jakarta Sans | 24px | 600 | 1.3 | normal | Sub-section titles |
| body-lg | Inter | 18px | 400 | 1.6 | normal | Lead paragraphs |
| body-md | Inter | 16px | 400 | 1.5 | normal | Body text |
| label-md | Inter | 14px | 600 | 1 | 0.05em | Labels, badges, uppercase |
| caption | Inter | 12px | 500 | 1.4 | normal | Captions, meta info |

### Typography Rules
- **All headings use Plus Jakarta Sans** — Never Inter for headings
- **Display styles: tight letter-spacing (-0.02em)** — Editorial, punchy look
- **Labels: uppercase with wide letter-spacing (0.05em)** — "COURSE DURATION", "HYBRID"
- **Minimum body text: 16px** — Never smaller
- **Maximum line length: 70 characters** — Use max-w-prose for content
- **Font loading: @import url() in globals.css** — Plus Jakarta Sans + Inter

---

## Spacing System

### Base Unit: 8px

### Spacing Scale
```
4px (0.5rem)   — xs  — Tight gaps
8px (0.5rem)   — sm  — Icon gaps, inline spacing
16px (1rem)    — md  — Component padding
24px (1.5rem)  — lg  — Card padding, element gaps
32px (2rem)    — xl  — Section internal padding
48px (3rem)    — 2xl — Section gaps (mobile)
80px (5rem)    — 3xl — Section gaps (desktop)
120px (7.5rem) — 4xl — Major section breaks
```

### Layout
```
--container-max: 1280px
--margin-desktop: 80px
--margin-mobile: 20px
--gutter: 24px
--section-gap: 120px (desktop), 80px (mobile)
```

### Usage Rules
- **8px grid only** — All spacing, padding, margins must be multiples of 8
- **Generous whitespace** — Let elements breathe
- **Section gaps: 80px mobile, 120px desktop**
- **Card internal padding: 24px**
- **Compact mode for tables: 16px**

---

## Elevation & Depth

### Tonal Layering (not heavy shadows)
```
Level 0 (Base):     White or #f8f9ff page background
Level 1 (Cards):    White bg + 1px #e2e8f0 border + soft shadow
Level 2 (Hover):    Shadow deepens + border shifts to accent blue
Level 3 (Dark):     Navy (#131b2e) sections for anchors
```

### Shadow Tokens
```
--shadow-soft:       0px 4px 20px rgba(15, 23, 42, 0.05)
--shadow-card:      0 1px 3px rgba(11, 28, 48, 0.06), 0 1px 2px rgba(11, 28, 48, 0.04)
--shadow-card-hover: 0 4px 20px rgba(11, 28, 48, 0.1)
--shadow-elevated:  0 10px 40px rgba(11, 28, 48, 0.12)
```

### Surface Differentiation
- **Light sections:** White (#ffffff) or surface (#f8f9ff)
- **Dark sections:** primary-container (#131b2e) — footer, "Why Choose Us", CTA
- **Subtle sections:** surface-container-low (#eff4ff) — alternate content blocks

---

## Shape & Radius

```
--radius-sm:    0.25rem (4px)   — Small elements, badges
--radius:       0.5rem (8px)   — Buttons, inputs, standard cards
--radius-md:     0.75rem (12px) — Medium cards
--radius-lg:     1rem (16px)    — Large cards, hero sections
--radius-xl:     1.5rem (24px)  — Promotional sections, hero images
--radius-full:   9999px         — Pills, avatars
```

### Usage Rules
- **8px base radius** — Softens industrial navy without being "bubbly"
- **Buttons: 8px radius**
- **Large containers: 24px radius** — Contemporary, framed appearance
- **Badges: pill (full radius)**
- **Never use 9999px on cards** — Only pills and avatars

---

## Components

### Buttons

#### Primary Button (Deep Navy CTA)
```html
<Button className="bg-primary-container text-white hover:bg-primary-container/90 font-semibold px-6 h-12 rounded-lg">
  Enroll Now
</Button>
```
- Background: primary-container (#131b2e)
- Text: white, font-semibold (600)
- Hover: slightly lighter/darker
- Radius: 8px
- Padding: 24px x 12px

#### Secondary Button (Accent Blue outline)
```html
<Button className="border-2 border-secondary text-secondary hover:bg-secondary/5 px-6 h-12 rounded-lg">
  Learn More
</Button>
```
- Border: 2px solid accent blue (#0058be)
- Text: accent blue
- Background: transparent
- Hover: subtle blue tint

#### Accent CTA Button (Blue background)
```html
<Button className="bg-secondary text-white hover:bg-secondary/90 font-semibold px-8 h-12 rounded-lg shadow-lg">
  Enroll Now — ₹4,999
</Button>
```
- Background: secondary (#0058be)
- Text: white, bold
- Used ONLY for conversion CTAs

#### Button Sizes
```
sm: 8px 16px, label-md
md: 12px 24px, body-md (default)
lg: 16px 32px, body-lg
xl: 20px 40px, body-lg (hero CTAs)
```

---

### Cards

#### Standard Card
```html
<div className="bg-white border border-border-subtle rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
  ...
</div>
```
- Background: white
- Border: 1px solid #e2e8f0
- Radius: 8px
- Shadow: card
- Hover: shadow-card-hover

#### Course Card
```html
<div className="bg-white border border-border-subtle rounded-lg overflow-hidden shadow-card hover:shadow-card-hover hover:border-secondary/30 transition-all group">
  <div className="aspect-video bg-gradient-to-br from-surface-container to-surface-container-high relative">
    {/* Thumbnail or gradient */}
    <Badge className="absolute top-3 left-3">Beginner</Badge>
  </div>
  <div className="p-6">
    <h3 className="headline-md text-on-surface">{title}</h3>
    <p className="body-md text-on-surface-variant mt-2">{description}</p>
    <div className="flex items-center justify-between mt-4">
      <span className="text-xl font-bold text-primary-container">₹{price}</span>
      <Link href={`/courses/${slug}`} className="text-secondary font-semibold">View →</Link>
    </div>
  </div>
</div>
```

#### Dark Section Card (Navy background)
```html
<div className="bg-primary-container text-white rounded-xl p-8">
  <h3 className="text-xl font-bold">Why SkillPlace?</h3>
  <p className="text-on-primary-container mt-2">...</p>
</div>
```

---

### Badges

#### Status Badge (pill)
```html
<Badge className="bg-secondary/10 text-secondary px-3 py-1 rounded-full label-md">
  100% Job Assistance
</Badge>
```
- Background: 10% opacity of the color
- Text: Full color
- Radius: full (pill)
- Padding: 4px 12px
- Font: label-md (14px, 600, uppercase with letter-spacing)

#### Level Badge
```html
<Badge className="bg-success-green/10 text-success-green px-3 py-1 rounded-full">
  Beginner
</Badge>
```

#### Branch Badge
```html
<Badge className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full">
  Civil
</Badge>
```

---

### Forms

#### Input Field
```html
<Input className="border-border-subtle h-12 rounded-lg focus:border-secondary focus:ring-2 focus:ring-secondary/20" />
```
- Border: 1px solid #e2e8f0
- Focus: border accent blue + 2px ring at 20% opacity
- Radius: 8px
- Height: 48px

#### Labels
```html
<Label className="label-md text-on-surface">{label}</Label>
```
- Font: 14px, weight 600, uppercase, letter-spacing 0.05em

---

### Navigation

#### Public Navbar
```
┌─────────────────────────────────────────────────────────────┐
│ 🎓 SkillPlace   Programs Courses Placements About Contact    │
│                                                    [Login] [Sign Up] │
└─────────────────────────────────────────────────────────────┘
```
- Sticky, backdrop-blur, bg-white/90
- Height: 64px
- Logo: Plus Jakarta Sans, bold, primary-container color
- Active link: secondary (#0058be)
- CTA: Login (outline) + Sign Up (primary-container bg)

#### Dark Section Footer
```
┌─────────────────────────────────────────────────────────────┐
│ [Navy background]                                           │
│ 🎓 SkillPlace                                               │
│ Programs | Courses | About | Contact                        │
│ social icons: linkedin | youtube | instagram | twitter       │
│ © 2026 SkillPlace Academy. All rights reserved.              │
└─────────────────────────────────────────────────────────────┘
```
- Background: primary-container (#131b2e)
- Text: white / on-primary-container
- Border-top: secondary accent line

---

### Modals (Div-based, NOT Radix Dialog)

```html
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm" onClick={onClose} />
  <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-elevated">
    <div className="flex items-center justify-between p-6 border-b border-border-subtle">
      <h2 className="headline-md">Title</h2>
      <button onClick={onClose} className="p-2 hover:bg-surface-light rounded-lg">
        <X className="h-5 w-5" />
      </button>
    </div>
    <div className="p-6">{children}</div>
  </div>
</div>
```

---

### Loading States

#### Skeleton
```html
<div className="animate-pulse">
  <div className="h-48 bg-surface-container rounded-lg" />
  <div className="h-4 bg-surface-container rounded mt-4 w-3/4" />
  <div className="h-4 bg-surface-container rounded mt-2 w-1/2" />
</div>
```

#### Spinner
```html
<Loader2 className="h-8 w-8 animate-spin text-secondary" />
```

---

## Section Patterns

### Hero Section (Dark Navy)
```html
<section className="relative bg-primary-container text-white py-20 md:py-28 overflow-hidden">
  {/* Subtle pattern */}
  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: '...' }} />
  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="display-lg text-white">Master Engineering Skills.<br/>Launch Your Career.</h1>
    <p className="body-lg text-on-primary-container mt-6 max-w-2xl">...</p>
    <div className="mt-10 flex gap-4">
      <Button className="bg-secondary text-white">Explore Programs →</Button>
      <Button className="border border-on-primary-container/30 text-white">View Courses</Button>
    </div>
  </div>
</section>
```

### Light Content Section
```html
<section className="py-16 md:py-24 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="headline-lg text-on-surface text-center">Section Title</h2>
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Dark Anchor Section
```html
<section className="py-16 md:py-24 bg-primary-container text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="headline-lg text-white text-center">Why Choose SkillPlace?</h2>
    {/* Cards with inverse colors */}
  </div>
</section>
```

### CTA Section
```html
<section className="py-16 md:py-20 bg-secondary text-white">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h2 className="headline-lg">Ready to Start Your Career?</h2>
    <p className="body-lg mt-4 text-white/80">Join 2000+ students...</p>
    <Button className="mt-8 bg-white text-secondary hover:bg-white/90 px-8 h-12">
      Enroll Now — It's Free to Start
    </Button>
  </div>
</section>
```

---

## Responsive Breakpoints

```
sm: 640px   — Large phones
md: 768px   — Tablets
lg: 1024px  — Small laptops
xl: 1280px  — Desktops
```

### Grid Patterns
```
Stats:     1 col → 2 col (md) → 4 col (lg)
Courses:   1 col → 2 col (md) → 3 col (lg)
Programs:  1 col → 2 col (md) → 3 col (lg)
Features:  1 col → 2 col (md) → 4 col (lg)
```

### Section Spacing
```
Mobile: py-16 (64px)
Desktop: py-24 (96px) or py-32 (120px) for major sections
```

---

## Accessibility

- **Color contrast: 4.5:1 minimum** for normal text, 3:1 for large text
- **Focus-visible: 2px secondary blue outline + 2px offset**
- **All images: alt text**
- **All buttons: visible focus state**
- **Skip to main content link**
- **Semantic HTML: nav, main, section, article, footer**
- **aria-label on icon-only buttons**
- **prefers-reduced-motion: reduce** — disables animations

---

## Anti-Patterns (NEVER)

1. **No @/components/ui/dialog** — Turbopack key bug
2. **No Inter for headings** — Use Plus Jakarta Sans
3. **No heavy box-shadows** — Use tonal layering
4. **No pure #000 for backgrounds** — Use primary-container (#131b2e)
5. **No arbitrary spacing** — 8px grid only
6. **No console.log** in production
7. **No `!important`** — Fix specificity instead
8. **No `any` type** — Use proper interfaces
9. **No `onClick` on `<div>`** — Use `<button>`
10. **No Radix components in app code** — Dialog, Popover, etc. cause Turbopack issues
