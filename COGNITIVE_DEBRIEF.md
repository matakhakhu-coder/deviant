# COGNITIVE_DEBRIEF.md
## Collaborative Intelligence Transfer Document — DEVIANT

> **Purpose:** Context injector for a new Claude instance entering the DEVIANT project.
> Read this in full before touching a single file. This document is the working mental model.

---

## 1. THE COGNITIVE SYNCHRONIZATION

### Who This Operator Is

This operator functions as a **systems orchestrator and product architect**. They think
in delivery phases, not features. They have already solved the business problem before
issuing a directive — they are not exploring; they are executing a known plan through
Claude as the implementation layer.

They do not need to be taught web development, Tailwind, or JavaScript patterns. They
know what they want. The value Claude adds is precision translation from spec to working
code, with zero drift.

The operator builds complete, staging-live platforms before connecting any real external
service. This is called the SVVP pattern — System Viable Viable Product. Every integration
starts as a simulation. Real credentials arrive later and flip a single boolean to go live.

### The Communication Protocol

**Directive format:** Structured implementation prompts broken into numbered sections,
each with explicit sub-requirements. These are contracts, not suggestions. Every specified
element must appear in the output exactly as described unless a genuine architectural
blocker exists.

**What "Audit" means in practice:**
- Read every file that will be touched or imported before writing a single line
- Confirm that `DEVIANT.books['the-deviants'].knownCharacters` exists in `manifest.js`
  before any module that reads from it is written
- If a specified function name doesn't exist in a module, add it there first — do not
  silently swap names
- Confirm the parser/frontend boundary is respected: `scripts/` is Node.js only,
  `src/` is browser only

**What "Flag deficits" means in practice:**
- If the operator asks to import `DEVIANT.integrations.anthropic.apiKey` and it is null
  in `manifest.js`, implement the sim adapter path and note it in the commit message
- Never block execution on missing client data

**Pacing:** One phase = one complete commit + push. Phases are atomic, verifiable, and
immediately staged. Do not split phases across commits. Do not batch phases together.

**Friction threshold:** Essentially zero. Execute completely once the path is confirmed.
Do not ask clarifying questions mid-implementation.

**The operator's shorthand you will encounter:**
- "SVVP" = System Viable Viable Product — complete platform in simulation before real credentials
- "Switch flip" = setting one boolean in `flags.js` from `true` to `false`
- "Sim mode" = `FLAGS.xyzSimulated: true`, fake responses, `[SIM]` console tags
- "The contract" = the render()/init() two-function rule — violated only when architecturally forced
- "Single-pass hydration" = all `render()` calls concatenated to one `app.innerHTML` write before any `init()` fires
- "Parser boundary" = the hard wall between `scripts/` (Node.js) and `src/` (browser)
- "Content JSON" = the parsed book output in `content/[slug].json` — the single truth for frontend

### Decision-Making Alignment

When the spec and the codebase conflict, **the codebase wins**. Read the existing
implementation patterns and extend them — do not introduce a new pattern unless the spec
explicitly requires it.

When two approaches satisfy the spec equally, choose the one that:
1. Requires the fewest new dependencies
2. Maintains the existing module boundary structure
3. Is the most reversible when the client provides real data

Never introduce: React, Vue, Alpine, jQuery, Lodash, or any runtime dependency that
is not already in `package.json`. The stack is intentionally minimal — it is a feature.

---

## 2. ARCHITECTURAL DNA

### The SVVP Model

```
1. Build the complete platform against static JSON data (content/*.json)
2. Every external service has a boolean flag in src/core/flags.js
3. Every external service has an adapter in src/core/integrations/
4. When a credential is confirmed, flip one flag — zero component-level code changes
5. Platform goes to staging on Phase 0 completion and stays staged throughout
```

### The Parser / Frontend Boundary (DEVIANT-specific)

This project has an additional boundary not present in DREAMPRINT or C.R.A.T.E.:

```
PARSER LAYER (Node.js — scripts/ directory):
  - Has file system access (fs.readFileSync, fs.writeFileSync)
  - Can require/import npm packages not in the browser bundle
  - Never imported by src/ modules
  - Runs once per book: npm run parse → content/[slug].json
  - Runs once per annotation pass: npm run annotate → content/[slug]-annotations.json

FRONTEND LAYER (Browser — src/ directory):
  - No file system access
  - Reads ONLY from content/*.json (statically imported via Vite)
  - bookLoader.js is the only module that imports content files
  - All other modules receive data as function arguments
```

Violating this boundary (importing a Node.js module into src/, or calling fs.* in a
browser module) will cause the Vite build to fail or produce runtime errors. This is
the most DEVIANT-specific audit check.

### The Two-Function Contract (non-negotiable)

```js
export function render(data) {
  // Returns a pure HTML template literal string.
  // No document.querySelector() — it returns null before innerHTML is written.
  // No addEventListener() — the DOM element doesn't exist yet.
  // No fetch() or async operations.
  return `<div>...</div>`
}

export function init(data) {
  // All DOM queries happen here, after app.innerHTML has been written.
  // All event listeners are attached here.
  // All adapter calls happen here.
}
```

**The hydration sequence in main.js:**
```js
app.innerHTML = [
  renderNavbar(),
  renderBookshelf(),
  renderFooter(),
].join('')   // ONE write. All strings concatenated first.

initNavbar()
initBookshelf()
initFooter()
```

### Module Placement Rules

```
src/components/     Pure UI. No business logic. No external adapters.
                    Navbar, Footer, HoverCard, EntityBadge

src/modules/        Feature modules with state and logic.
                    BookshelfView, BookDetailView, ChapterBrowser, ChapterReader,
                    CharacterEncyclopedia, CharacterProfile, WorldAtlas, SearchEngine

src/admin/          Admin-only. Never imported into customer paths.
                    AdminShell, AnnotationEditor, EntityEditor

src/core/           Utilities, data, adapters. No UI.
                    manifest.js, flags.js, bookLoader.js, linker.js, router.js, SEOEngine.js
                    integrations/annotations.js, integrations/search.js

scripts/            Node.js only. Never imported into src/. Not bundled.
                    parse.js, annotate.js, launch.js

sources/            Raw PDF files. .gitignored to avoid large binary commits.

content/            Parsed JSON output. Consumed by bookLoader.js.
                    the-deviants.json, the-deviants-annotations.json
```

### Routing Architecture

Three exclusive render paths:

```
/admin              → mountAdmin()      → AdminShell only
?book=slug&ch=N     → mountReader()     → Navbar + ChapterReader + Footer
everything else     → mountCustomer()   → Full landing sequence
```

SPA routing via `window.location.pathname` and `URLSearchParams`. No router library.
`vercel.json` catch-all rewrite serves `index.html` for all non-asset paths.
Client-side `router.js` handles path parsing and dispatches `dv:navigate` events.

### Simulation / Live Switch Architecture

```js
// src/core/integrations/annotations.js
import { FLAGS } from '@/core/flags.js'
import { DEVIANT } from '@/core/manifest.js'

export async function getAnnotations(slug) {
  if (FLAGS.annotationsSimulated) {
    console.log('[SIM] annotations.js — getAnnotations called', slug)
    await new Promise(r => setTimeout(r, 600))
    return null   // ChapterReader, CharacterProfile render placeholder text when null
  }
  // Live path — reads from content/[slug]-annotations.json
  const res = await fetch(`/content/${slug}-annotations.json`)
  if (!res.ok) throw new Error(`annotations: ${res.status}`)
  return res.json()
}
```

The `[SIM]` console tag is mandatory. The delay is mandatory (makes loading states testable).

### Design Token System

Dark mythology palette:

```
dv-void         #0A0A0F   deepest background, main canvas
dv-obsidian     #111118   card backgrounds, elevated surfaces
dv-surface      #1A1A24   secondary surfaces, hover states
dv-crimson      #8B1A1A   character entity links, CTA, danger
dv-crimson-lit  #C0392B   hover on crimson
dv-gold         #D4AF37   chapter headings, location entity links, lore accents
dv-gold-dim     #A08826   hover on gold
dv-rune         #3A3A4A   borders, dividers, structural lines
dv-ash          #9CA3AF   secondary text, metadata
dv-ghost        #E8E8F0   primary reading text, headings
dv-faction      #4B6FA8   faction entity links

font-display    Cinzel 700/900       chapter titles, character names — mythic weight
font-body       Inter 400/500/600    body prose, UI labels, metadata
font-mono       JetBrains Mono 400   entity IDs, technical labels, admin
```

48px minimum tap targets on all interactive elements.
Reading column maximum 680px, always centered. Never full-width prose.
Entity hover cards: max-width 320px, positioned relative to anchor, viewport-safe.

### The Cross-Link Engine (DEVIANT-specific core)

The linker is the most distinctive feature of this platform. Its behavior:

```js
// src/core/linker.js
export function buildEntityRegistry(book) {
  // Returns Map<nameVariant, { entityId, entityType, slug }>
  // Sorted: longest name variants first (prevents partial matches)
}

export function linkChapterText(text, registry, chapterMentions) {
  // Processes text character-by-character (or token-by-token)
  // Replaces known entity name occurrences with <a class="dv-entity-link"> tags
  // Uses chapterMentions to disambiguate overlapping entity names
  // Does NOT process text inside existing HTML tags
  // Returns HTML string
}
```

The linker runs at render time, not at parse time. Chapter text in `content/[slug].json`
is always stored as plain text. The linker transforms it to HTML in `ChapterReader.render()`.

### Cross-Module Communication

```js
// Navigation
document.dispatchEvent(new CustomEvent('dv:navigate', {
  detail: { route: '/books/the-deviants/characters/miles-kelly' }
}))

// Entity hover card
document.dispatchEvent(new CustomEvent('dv:entityHover', {
  detail: { entityId: 'miles-kelly', entityType: 'character', anchorEl: linkElement }
}))

// Search
document.dispatchEvent(new CustomEvent('dv:searchOpen', { detail: {} }))
```

### localStorage Conventions

```
dv_progress_[slug]    Object — { [chapterId]: { read: bool, position: number } }
dv_bookmarks_[slug]   Array  — bookmarked chapter IDs
dv_consent_accepted   'true' — consent banner flag
dv_admin_auth         'true' — admin session (sim mode)
dv_last_book          string — slug of last viewed book
```

### UI/UX Patterns

**Reading column:** max-w-[680px] mx-auto px-4. Never wider. Never full bleed.

**Entity link styles:**
```css
.dv-entity-link[data-entity-type="character"]  { color: dv-crimson; border-bottom: 1px solid; }
.dv-entity-link[data-entity-type="location"]   { color: dv-gold;    border-bottom: 1px solid; }
.dv-entity-link[data-entity-type="faction"]    { color: dv-faction; border-bottom: 1px solid; }
```

**Hover card positioning:** attach to anchor element's bounding rect, clamp to viewport
with a 16px margin. On mobile (< 768px), hover cards are disabled — tap navigates directly.

**Double requestAnimationFrame** when CSS transitions fire after `classList.remove('hidden')`.

**Toast pattern:** `let toastTimer = null`, `clearTimeout(toastTimer)` before setting,
4000ms auto-hide, class rebuild not classList.add.

---

## 3. THE EXECUTION ENGINE

### Pre-Build Audit (always first)

1. Read every file that will be modified
2. Confirm `DEVIANT.books[slug]` path exists in `manifest.js` before any module reads it
3. Confirm parser/frontend boundary — no `fs`, `path`, `pdf-parse` imports in `src/`
4. Trace the import chain for circular dependency risk:
   `main.js → modules → core`. `bookLoader.js → content/*.json` (static import). Never reverse.
5. Check `main.js` for current render/init sequence and where new modules slot in

### The Build Verification Loop

```bash
npm run build   # Must exit 0. Document any new warnings in commit message.
```

Then commit:
```bash
git add <specific files>   # Never git add -A or git add .
git commit -m "feat: Phase N — ..."
git push origin main
```

### What Clean Means

- Exit code 0 from `npm run build`
- Zero new warnings beyond any pre-existing Vite dynamic import warnings
- Bundle size documented if it's a milestone phase

### Deployment Architecture

- Vercel auto-deploys on every push to `main`
- `vercel.json` SPA rewrite: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- Staging headers: `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`
- `scripts/launch.js` toggles `robots.txt` for production promotion

---

## 4. THE COMPILATION PROMPT

*Paste this verbatim as the opening message when initializing a new Claude instance
for the DEVIANT project. Edit bracketed values for the current session.*

```
You are the implementation layer of a two-agent development system.

The operator is the systems architect. You are the execution engine.
Your function is to translate structured technical directives into working,
committed code with zero friction.

WORKING PROTOCOL:
1. AUDIT — Read every file you will touch. Confirm imports exist. Trace dependency chains.
   Critical for this project: confirm the parser/frontend boundary is respected —
   scripts/ is Node.js only, src/ is browser only. Never mix these layers.
2. WEIGH — Identify the cleanest isolation path. Never entangle modules.
3. FLAG DEFICITS — Surface missing data before building against it. Build null-safe.
4. PROCEED — Execute completely without interruption once the path is confirmed.

ARCHITECTURAL FOUNDATIONS for DEVIANT:
- Stack: Vite · Vanilla JS ESM · Tailwind CSS 3.x · PostCSS · Autoprefixer
- Parser layer: Node.js scripts (scripts/) — never imported into src/
- Data source: content/[slug].json — parsed book JSON, the single source of truth
- Pattern: SVVP. Complete platform in local-JSON mode before any live credentials.
- Contract: Every module exports render() [pure HTML string] and init() [DOM + events].
  Single-pass hydration: all render()s concatenated to one innerHTML write, then all init()s.
- Truth: All config in src/core/manifest.js (DEVIANT object). All switches in src/core/flags.js.
- Placement: src/components/ (pure UI), src/modules/ (feature logic), src/admin/ (admin only),
  src/core/ (utilities, data, adapters), scripts/ (Node.js parser tools only).
- The cross-link engine (src/core/linker.js) transforms plain chapter text to HTML with
  entity hyperlinks at render time — not at parse time.

EXECUTION LOOP:
1. Read all relevant files before writing code
2. Implement the spec exactly
3. Run npm run build — must exit 0 before committing
4. git add [specific files], git commit, git push origin main
5. Vercel auto-deploys — every push is immediately staged

ANCHOR DOCUMENTS (read in this order at session start):
1. CLAUDE.md — project law, architecture constraints, module map
2. DEVIANT_BUILD_MANIFEST.md — confirmed data, book registry, phase status
3. DEVIANT_ROADMAP.md — build checklist, gate criteria

Bootstrap complete. Operational mode: HANDS. Awaiting directive.
```

---

## APPENDIX — Recurring Patterns Reference

### Null-safe entity access
```js
const title = DEVIANT.books['the-deviants']?.meta?.title || 'Untitled'
const cover = DEVIANT.books['the-deviants']?.cover
  ? `<img src="${cover}" alt="${title}">`
  : `<div class="dv-cover-placeholder bg-dv-obsidian border border-dv-rune rounded-lg"></div>`
```

### bookLoader pattern
```js
// src/core/bookLoader.js
import bookData from '../../content/the-deviants.json'  // Vite static import

let annotationData = null

export async function loadAnnotations(slug) {
  if (annotationData) return annotationData
  try {
    const res = await fetch(`/content/${slug}-annotations.json`)
    annotationData = res.ok ? await res.json() : null
  } catch { annotationData = null }
  return annotationData
}

export function getBook(slug) {
  if (slug === 'the-deviants') return bookData
  return null
}

export function getChapter(slug, id) {
  const book = getBook(slug)
  return book?.chapters?.find(c => c.id === Number(id)) || null
}
```

### Linker usage in ChapterReader.render()
```js
import { linkChapterText, buildEntityRegistry } from '@/core/linker.js'

export function render({ book, chapter }) {
  const registry = buildEntityRegistry(book)
  const linkedText = linkChapterText(chapter.text, registry, chapter.mentions)
  return `
    <article class="max-w-[680px] mx-auto px-4 py-12">
      <header class="mb-10">
        <p class="font-mono text-dv-ash text-sm">CHAPTER ${chapter.number}</p>
        <h1 class="font-display text-3xl text-dv-ghost mt-2">${chapter.title}</h1>
      </header>
      <div class="dv-prose font-body text-dv-ghost leading-relaxed">${linkedText}</div>
    </article>
  `
}
```

### Entity hover card event binding in init()
```js
export function init({ slug }) {
  document.querySelectorAll('.dv-entity-link').forEach(link => {
    link.addEventListener('mouseenter', (e) => {
      document.dispatchEvent(new CustomEvent('dv:entityHover', {
        detail: {
          entityId:   link.dataset.entityId,
          entityType: link.dataset.entityType,
          anchorEl:   link,
        }
      }))
    })
    link.addEventListener('mouseleave', () => {
      document.dispatchEvent(new CustomEvent('dv:entityHoverEnd', {
        detail: { entityId: link.dataset.entityId }
      }))
    })
  })
}
```

### localStorage reading progress
```js
const key = `dv_progress_${slug}`
const progress = JSON.parse(localStorage.getItem(key) || '{}')
progress[chapterId] = { read: true, position: window.scrollY }
localStorage.setItem(key, JSON.stringify(progress))
```

### CSS transition on entity hover card reveal
```js
card.classList.remove('hidden')
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    card.classList.remove('opacity-0', 'pointer-events-none')
    card.classList.add('opacity-100')
  })
})
```

### Toast closure
```js
let toastTimer = null
function showToast(message, isError = false) {
  const toast = document.getElementById('dv-toast')
  if (!toast) return
  clearTimeout(toastTimer)
  toast.textContent = message
  toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3
    rounded-lg font-body text-sm text-dv-ghost pointer-events-none
    transition-all duration-300
    ${isError ? 'bg-dv-crimson' : 'bg-dv-surface border border-dv-rune'}`
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4000)
}
```

---

*This document was synthesized specifically for the DEVIANT project.
It contains the complete working mental model for a new Claude instance entering
the project cold. Read it before reading CLAUDE.md. Read CLAUDE.md before
touching any file.*
