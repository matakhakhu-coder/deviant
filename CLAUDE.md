# CLAUDE.md — Working Protocol for DEVIANT
## The Mythology Engine

> Read this document completely at the start of every session.
> It governs how this project is built. It is not a summary of what has been built.
> Every architectural decision flows from this file.

---

## Collaboration Protocol

The four pre-execution invariants — applied to every directive, every session:

**1. AUDIT**
Read every file you will touch. Read every file you will import from. Confirm that
every referenced function name, data field path, and module export actually exists on
disk as it currently stands. Do not work from session memory. Specific audit failures
most probable for this project:
- Entity ID mismatches between `content/[slug].json` and frontend entity-link attributes
- `DEVIANT.books[slug]` path accessed before the book is registered in `manifest.js`
- Cross-link engine processing chapter text before `bookLoader.js` has resolved the entity index
- Admin modules accidentally imported into customer-facing render paths
- Parser script using `import` syntax instead of `require` in a CommonJS context

**2. WEIGH**
Identify the cleanest isolation path. For this project the most common isolation question
is: does this belong in the parser layer (Node.js, build-time) or the render layer (browser,
runtime)? These are entirely separate concerns. Parser scripts run in Node.js with file system
access. Render modules run in the browser with no file system access. Never conflate them.

**3. FLAG DEFICITS**
If a spec references a null field (e.g., `DEVIANT.integrations.anthropicKey`), implement
a null-safe fallback using the simulation adapter pattern. Document the deficit in your
delivery summary — never block execution on missing credentials.

**4. PROCEED**
Execute completely. Do not ask clarifying questions mid-implementation. Make
the defensible architectural call, document it in a comment, and deliver.

---

## Project Identity

| Key | Value |
|-----|-------|
| **Name** | DEVIANT |
| **Full Name** | The Mythology Engine |
| **Concept** | PDF novels parsed into living, cross-linked lore ecosystems |
| **First Book** | *The Deviants* by Riley Bishop |
| **Stack** | Vite · Vanilla JS ESM · Tailwind CSS 3.x · PostCSS · Autoprefixer |
| **Parser Layer** | Node.js ESM · pdf-parse · fuse.js (client-side search) |
| **Annotation Layer** | Claude API (claude-sonnet-4-6) · offline-first, cached to content/ |
| **Storage** | Static JSON files in `content/` · localStorage for reading progress |
| **Backend** | None — pure static site |
| **Deployment** | Vercel (auto-deploy on push to main) |
| **Anchor documents** | `CLAUDE.md` · `DEVIANT_BUILD_MANIFEST.md` · `DEVIANT_ROADMAP.md` |

---

## SVVP Definition

**System Viable Viable Product.** The complete Deviant platform, built in full,
deployed to a Vercel staging URL, operating with the local-JSON content source.

In SVVP state: an operator drops a PDF into `sources/`, runs `npm run parse`, and
`content/the-deviants.json` is produced. The platform renders the full ecosystem:
the chapter browser (28 chapters, filterable by POV character), the character encyclopedia
(6 profiles with extracted descriptions), the world atlas (SunCity, The Deviants faction,
Defiance faction), and the cross-link reader (entity mentions hyperlinked throughout every
chapter). The Claude API annotation layer is in simulation mode — placeholder lore entries
styled to match the dark aesthetic are shown where real annotations would appear.
The staging URL is live throughout all phases. Graduating to live Claude API annotations
requires flipping one boolean in `flags.js`.

---

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 0 | Substrate (Project Init, Tooling, Manifest, Flags) | In Progress — code complete, Vercel connection TBC |
| 1 | Parser Engine (PDF → structured JSON) | Complete — content/the-deviants.json generated |
| 2 | Book Shell & Navigation | Complete |
| 3 | Chapter Browser & Reader | Complete |
| 4 | Character Encyclopedia | Pending |
| 5 | World Atlas (Locations + Factions) | Pending |
| 6 | Cross-Link Engine | Pending |
| 7 | Search & Discovery | Pending |
| 8 | Multi-Book Support | Pending |
| 9 | Annotation Layer (Claude API enrichment) | Pending |
| 10 | SEO & Launch Gate | Pending |

---

## Deployment State

| Key | Value |
|-----|-------|
| **Staging URL** | https://deviant-one.vercel.app |
| **Production domain** | TBC |
| **Vercel account** | matakhakhu-coder |
| **CI/CD** | Vercel auto-deploy on push to `main` |
| **X-Robots-Tag** | `noindex, nofollow, noarchive, nosnippet` (staging) |
| **robots.txt** | Staging mode — `Disallow: /` |
| **sitemap.xml** | Not yet generated |
| **Annotations** | Simulation mode — `FLAGS.annotationsSimulated: true` |
| **Search** | Client-side mode — `FLAGS.searchExternal: false` |

---

## Architecture Constraints — Read Before Touching Any File

### Render / Init Lifecycle (non-negotiable)

Every module follows a strict two-function contract:
- `render()` — returns a pure HTML string. No side effects. No DOM access. No event binding.
- `init()` — called after `app.innerHTML` is written. Queries the DOM, attaches listeners,
  calls integration adapters.

`main.js` executes a **single-pass string hydration**: all `render()` calls concatenated
into one `app.innerHTML` assignment, then all `init()` calls fire in sequence. Breaking this
pattern (calling `document.querySelector` inside `render()`) returns `null` and silently
breaks interactivity.

### The Three Exclusive Render Paths

```
/admin              → mountAdmin()        → AdminShell only. No customer modules.
?book=slug&ch=N     → mountReader()       → Navbar + ChapterReader + Footer
everything else     → mountCustomer()     → Full landing + encyclopedia + atlas
```

URL routing via `window.location.pathname` and `URLSearchParams` only.
`vercel.json` catch-all rewrite handles SPA paths.

### Single Source of Truth

All platform configuration lives in `src/core/manifest.js` as the exported `DEVIANT` object.
All simulation/live switches live in `src/core/flags.js` as the exported `FLAGS` object.

**Never hard-code book data in components.** Every book title, character name, chapter count,
integration credential, and copy string must be imported from `DEVIANT`.
Every conditional behaviour based on environment must be imported from `FLAGS`.

### Parser / Frontend Boundary (non-negotiable)

The parser scripts (`scripts/parse.js`, `scripts/annotate.js`) run in Node.js with
file system access. They must never be imported into any `src/` module.

The frontend reads only from:
- `content/[slug].json` (parsed book data — imported statically at build time via Vite)
- `content/[slug]-annotations.json` (Claude API enrichment — merged at load time)
- `localStorage` (reading progress, bookmarks)

The `src/core/bookLoader.js` module is the only file that imports from `content/`.
All other modules receive book data as function arguments from `bookLoader.js`.

### Simulation / Live Switch Architecture

Every external dependency has an adapter in `src/core/integrations/`.

```
src/core/integrations/
  annotations.js   — Claude API annotation fetch (sim → live)
  search.js        — client-side fuse.js (sim) → Algolia (live)
```

Flipping a switch in `flags.js` is the only code change needed to graduate a dependency.

---

## Module Placement Rules

| Type | Directory | Examples |
|------|-----------|---------|
| Pure UI components | `src/components/` | `Navbar.js`, `Footer.js`, `HoverCard.js`, `EntityBadge.js` |
| Feature modules with logic | `src/modules/` | `ChapterBrowser.js`, `ChapterReader.js`, `CharacterEncyclopedia.js`, `CharacterProfile.js`, `WorldAtlas.js`, `SearchEngine.js`, `BookshelfView.js` |
| Admin modules | `src/admin/` | `AdminShell.js`, `AnnotationEditor.js`, `EntityEditor.js` |
| Core utilities, data, adapters | `src/core/` | `manifest.js`, `flags.js`, `bookLoader.js`, `linker.js`, `SEOEngine.js`, `router.js` |
| Integration adapters | `src/core/integrations/` | `annotations.js`, `search.js` |
| Parser + tooling scripts | `scripts/` | `parse.js`, `annotate.js`, `launch.js` |
| Raw PDF source files | `sources/` | `the-deviants.pdf` |
| Parsed book JSON | `content/` | `the-deviants.json`, `the-deviants-annotations.json` |
| Static assets | `public/assets/` | `books/the-deviants/cover.jpg`, `entities/` |

### Admin Isolation

The admin shell lives under `/admin`. It is auth-gated. In simulation mode,
auth is a hardcoded password checked against `localStorage`. Admin modules must
never be imported into customer-facing render paths.

---

## Component & Module Map

### Customer-Facing

| File | Route/Section | Description |
|------|--------------|-------------|
| `src/components/Navbar.js` | — | Logo, nav links (Books, Characters, World, Search), dark theme |
| `src/components/Footer.js` | — | Book credits, platform attribution, legal |
| `src/components/HoverCard.js` | — | Entity preview overlay — name, type badge, description excerpt |
| `src/components/EntityBadge.js` | — | Inline colored badge for entity type (character/location/faction) |
| `src/modules/BookshelfView.js` | `/` | All loaded books — cover, title, author, stats grid |
| `src/modules/ChapterBrowser.js` | `/books/:slug` | Chapter list, POV filter pills, word count, reading time |
| `src/modules/ChapterReader.js` | `/books/:slug/chapters/:id` | Full chapter text, cross-linked entity mentions, progress tracker |
| `src/modules/CharacterEncyclopedia.js` | `/books/:slug/characters` | All characters grid — avatar placeholder, name, role badge, POV count |
| `src/modules/CharacterProfile.js` | `/books/:slug/characters/:id` | Bio, appearances, relationships, faction membership, linked chapters |
| `src/modules/WorldAtlas.js` | `/books/:slug/world` | Locations tab + Factions tab, each with lore entry cards |
| `src/modules/SearchEngine.js` | `/search` | Full-text search — results grouped by entity type |

### Admin

| File | Route | Description |
|------|-------|-------------|
| `src/admin/AdminShell.js` | `/admin` | Auth gate, sidebar nav |
| `src/admin/AnnotationEditor.js` | `/admin/annotate` | Review and edit Claude API annotation drafts |
| `src/admin/EntityEditor.js` | `/admin/entities` | Manually correct entity extractions, add aliases |

### Core

| File | Description |
|------|-------------|
| `src/core/manifest.js` | `DEVIANT` object — all platform config, book registry, integration stubs |
| `src/core/flags.js` | `FLAGS` object — all simulation/live switches |
| `src/core/bookLoader.js` | Imports `content/*.json`, merges annotations, exports resolved book objects |
| `src/core/linker.js` | Cross-link engine — processes chapter text, replaces entity strings with `<a>` tags |
| `src/core/router.js` | URL parsing, render path selection, pushState navigation |
| `src/core/SEOEngine.js` | Meta tags, OG tags, structured data per page |
| `src/core/integrations/annotations.js` | Claude API annotation adapter |
| `src/core/integrations/search.js` | Search adapter (fuse.js → Algolia) |

### Parser (Node.js — never imported by src/)

| File | Description |
|------|-------------|
| `scripts/parse.js` | PDF → `content/[slug].json` — full pipeline |
| `scripts/annotate.js` | `content/[slug].json` → `content/[slug]-annotations.json` via Claude API |
| `scripts/launch.js` | Pre-production validation gate |

---

## CSS Architecture

Tailwind CSS v3 with custom design tokens in `tailwind.config.js`.

Custom tokens:

```js
colors: {
  'dv-void':        '#0A0A0F',   // deepest background — main page canvas
  'dv-obsidian':    '#111118',   // card backgrounds, elevated surfaces
  'dv-surface':     '#1A1A24',   // secondary surfaces, hover states on cards
  'dv-crimson':     '#8B1A1A',   // character entity links, primary CTA, danger
  'dv-crimson-lit': '#C0392B',   // hover on crimson, active CTA
  'dv-gold':        '#D4AF37',   // lore/chapter headings, location entity links
  'dv-gold-dim':    '#A08826',   // hover on gold, secondary accent
  'dv-rune':        '#3A3A4A',   // borders, dividers, subtle structure
  'dv-ash':         '#9CA3AF',   // secondary text, metadata, timestamps
  'dv-ghost':       '#E8E8F0',   // primary reading text, headings
  'dv-fog':         '#6B7280',   // placeholder text, disabled states
  'dv-faction':     '#4B6FA8',   // faction entity links
}

fontFamily: {
  display: ['Cinzel', 'Georgia', 'serif'],    // chapter titles, character names — mythic weight
  body:    ['Inter', 'sans-serif'],           // body prose, metadata, UI labels
  mono:    ['JetBrains Mono', 'monospace'],   // entity IDs, technical labels, admin
}
```

**Design principle:** Every section must work on a 390px mobile viewport.
Entity hover cards must not overflow viewport at any breakpoint.
Minimum tap target 48px on all interactive elements.
The reading column maxes out at 680px and is always centered.

---

## localStorage Conventions

```
dv_progress_[slug]      Object — chapter progress per book { [chapterId]: { read: bool, position: number } }
dv_bookmarks_[slug]     Array  — bookmarked chapter IDs
dv_consent_accepted     'true' — cookie/consent banner suppression
dv_admin_auth           'true' — admin session flag (simulation mode only)
dv_last_book            string — slug of last viewed book (bookshelf sort hint)
```

---

## Custom Event Namespace

All cross-module events use the `dv:` prefix:

```js
document.dispatchEvent(new CustomEvent('dv:navigate',       { detail: { route, params } }))
document.dispatchEvent(new CustomEvent('dv:entityHover',    { detail: { entityId, entityType, anchorEl } }))
document.dispatchEvent(new CustomEvent('dv:entityHoverEnd', { detail: { entityId } }))
document.dispatchEvent(new CustomEvent('dv:chapterLoaded',  { detail: { slug, chapterId } }))
document.dispatchEvent(new CustomEvent('dv:searchOpen',     { detail: {} }))
document.dispatchEvent(new CustomEvent('dv:searchClose',    { detail: {} }))
```

---

## Standby Protocol

When awaiting new books, credentials, or client direction, the project is in
**parser-standby**. The SVVP is staging-live and fully functional with *The Deviants*.

On re-entry, the agent must:
1. Read this file (`CLAUDE.md`) first.
2. Read `DEVIANT_BUILD_MANIFEST.md` — check phase status and confirmed vs TBC fields.
3. Read `DEVIANT_ROADMAP.md` — identify the next pending deliverable.
4. Read `package.json` — confirm stack and scripts (once created in Phase 0).
5. Read `src/main.js` — understand current render/init sequence.
6. Read `src/core/flags.js` — see which integrations are currently simulated.
7. Read `src/core/manifest.js` — confirm which DEVIANT fields are resolved.

Then report:
```
PROJECT: DEVIANT — The Mythology Engine
PHASES COMPLETE: [list]
PHASES PENDING: [list]
SIMULATION FLAGS ACTIVE: [list]
BOOKS LOADED: [slugs in content/]
UNRESOLVED NULLS: [count]
LAST COMMIT: [git log --oneline -1]
BUILD STATUS: [clean / unknown]
READY FOR: [next phase]

Bootstrap complete. Operational mode: HANDS.
Awaiting directive.
```

---

## Build Verification & Commit Standard

```bash
npm run build   # Must exit 0 before any commit.
```

```
feat: Phase N — Module1, Module2, brief summary

- Architectural decision made
- Parser/frontend boundary respected
- Sim/live path split implemented
- Any deficit flagged and handled with null-safe fallback
- Build size if milestone phase

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

**Never `git add -A` or `git add .`** — stage specific files only.
**Never amend.** Fix and create a new commit.
**Push immediately after commit** — every push triggers Vercel auto-deploy.
