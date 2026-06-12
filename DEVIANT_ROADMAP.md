# DEVIANT_ROADMAP.md — The Log
## DEVIANT · The Mythology Engine

> This document is the build execution checklist. A `[x]` is earned only by
> verified functional delivery — not file existence, not partial implementation,
> not a passing review. Items move in one direction only: from `[ ]` to `[x]`.
> Gate criteria are observable conditions, not intentions. If the gate has not
> been witnessed to pass, the phase is not complete.

---

## Phase 0 — Substrate

**Delivers:** The technical skeleton. No user-visible UI. Working tooling,
directory structure, configuration architecture, and a live staging URL.

- [x] `git init` — repository initialized
- [x] `npm create vite@latest` — Vite scaffolded (vanilla JS template)
- [x] Tailwind CSS 3.x installed and configured (`tailwind.config.js`, `postcss.config.js`)
- [x] Custom design tokens registered: `dv-*` palette, Cinzel + Inter + JetBrains Mono
- [x] `src/core/manifest.js` created — `DEVIANT` object with all known fields, nulls for TBC
  - [x] `DEVIANT.platform` — name, slug, staging URL (null), production URL (null)
  - [x] `DEVIANT.books['the-deviants']` — full book seed data (confirmed fields only)
  - [x] `DEVIANT.books['the-deviants'].knownCharacters` — 6 POV + Loki, with IDs and aliases
  - [x] `DEVIANT.books['the-deviants'].knownLocations` — SunCity, Gen Pop, R&D
  - [x] `DEVIANT.books['the-deviants'].knownFactions` — The Deviants, Defiance
  - [x] `DEVIANT.integrations` — all credentials null (TBC)
- [x] `src/core/flags.js` created — `FLAGS` object (annotationsSimulated: true, searchExternal: false — client-side simulation defaults)
- [x] Integration adapter stubs created (simulation path only):
  - [x] `src/core/integrations/annotations.js`
  - [x] `src/core/integrations/search.js`
- [x] `src/core/bookLoader.js` created — stub that imports `content/the-deviants.json` (null-safe on missing file)
- [x] `src/core/linker.js` created — stub (identity function: returns text unchanged)
- [x] `src/core/router.js` created — three render paths scaffolded
- [x] `src/main.js` created — `mountCustomer`, `mountAdmin`, `mountReader` scaffolded
- [x] `index.html` created — Google Fonts loaded (Cinzel, Inter, JetBrains Mono), app div, toast div, single script entry
- [x] `style.css` created — 48px tap target rule, base layer resets, dark background on html/body
- [x] `vercel.json` created — SPA catch-all rewrite + staging noindex headers
- [x] `public/robots.txt` created — `Disallow: /` (staging mode)
- [x] `sources/` directory created — `.gitkeep` + `sources/.gitignore` (ignores *.pdf to avoid committing large binaries)
- [x] `content/` directory created — `.gitkeep` (JSON files will live here)
- [x] `scripts/launch.js` created — scans nulls in manifest, scans `true` flags, rewrites robots.txt
- [x] Vercel project connected to GitHub repo — push triggers auto-deploy
- [x] Staging URL live and returning 200

**Gate:** `npm run dev` runs clean. `npm run build` exits 0. Staging URL accessible.
Dark background (`#0A0A0F`) renders in browser. No console errors.

---

## Phase 1 — Parser Engine

**Delivers:** A Node.js script that reads any PDF from `sources/` and produces a
structured JSON file in `content/` — the single source of truth for all frontend rendering.
Running `npm run parse the-deviants` produces `content/the-deviants.json`.

- [x] `scripts/parse.js` created — full pipeline
  - [x] CLI: `node scripts/parse.js [book-slug]` — reads `sources/[slug].pdf`
  - [x] `pdf-parse` integration — extracts full text from PDF
  - [x] Segmenter — splits text into chapters using heading detection pattern
    - [x] Primary pattern (revised): `/^CHAPTER\s+(\d+)\s*\n(.+)$/gm` on normalized text — the
      `THE DEVIENTS` book-title line precedes only Chapter 1's heading on the title page and is
      not part of the recurring per-chapter pattern, so the regex matches on `CHAPTER N` + title
      line alone (TOC entries use `CHAPTER N: Title` on one line and are excluded by this).
    - [x] Fallback (revised): chapters 10, 16, 25 have no heading marker in the source PDF body
      at all (confirmed: 9→11, 15→17, 24→26 transition directly with no gap). Rather than
      double-newline density analysis, missing chapter ids are synthesized from
      `knownCharacters.povChapters` (title/POV from the manifest TOC), flagged
      `contentMissing: true` for null-safe placeholder rendering. **Deficit flagged** — source
      manuscript is missing ~3 chapters' content; needs author follow-up.
  - [x] Entity extractor — Pass 1 (seed list from `DEVIANT.books[slug].knownCharacters` etc.)
    - [x] Name normalization: honorifics ("Dr "/"Mr "/etc.) stripped before matching
    - [x] Alias detection: longest-alias-first word-boundary matching (e.g. "Andrew Reed" before "Andrew")
  - [x] Entity extractor — Pass 2 (capitalized noun phrase discovery)
    - [x] Frequency filter: candidate must appear ≥3 times in a chapter
    - [x] Stoplist applied: common English words, month names, day names excluded
    - [x] Candidates written to `content/[slug]-candidates.json` for manual review
  - [x] Mention indexer — for each chapter, lists entity IDs that appear in text
  - [x] Reverse indexer — for each entity, lists chapter numbers it appears in (`entityIndex`)
  - [x] Word count and reading time calculator (200 wpm baseline)
  - [x] Output serializer — writes valid `content/[slug].json`
  - [x] Console progress: `[PARSE] Chapter 1/28 — Miles Kelly (2954 words)` per chapter
- [x] `npm run parse` script added to `package.json`
- [x] `package.json` devDependency: `pdf-parse`

**Gate:** `npm run parse the-deviants` completes without errors.
`content/the-deviants.json` exists and is valid JSON.
`JSON.parse(fs.readFileSync('content/the-deviants.json'))` succeeds.
File contains 28 chapter objects, 6+ character objects, 2+ faction objects, 2+ location objects.
Chapter 1 `mentions.characters` includes `miles-kelly` and `loki`.

---

## Phase 2 — Book Shell & Navigation

**Delivers:** The public-facing shell. A visitor can land on the platform,
see the book, and understand what they're exploring — before entering any chapter.

- [x] `src/components/Navbar.js`
  - [x] Logo (text fallback: "DEVIANT" in Cinzel — SVG remains TBC asset)
  - [x] Nav links: Books, Search (Characters/World live on BookDetailView per-book, not global nav — navbar must not hard-code a book slug)
  - [x] Mobile hamburger (390px)
  - [x] Dark background, ghost text
- [x] `src/modules/BookshelfView.js`
  - [x] Renders all books registered in `DEVIANT.books`
  - [x] Each book card: cover (placeholder if TBC), title, author, chapter count, character count badges
  - [x] "Enter" CTA navigates to `/books/:slug`
  - [x] Null-safe: missing cover renders atmospheric dark placeholder SVG
- [x] `src/modules/BookDetailView.js`
  - [x] Book hero: cover art, title, author, synopsis
  - [x] Quick stats: chapters, characters, locations, factions
  - [x] Navigation grid: Read Chapters / Characters / World Atlas
  - [x] Route: `/books/:slug`
- [x] `src/components/Footer.js`
  - [x] Platform credit, author attribution for each loaded book
  - [x] "A DEVIANT Platform" attribution
- [x] All modules wired into `mountCustomer()` render/init sequence
- [x] SPA routing active: `/`, `/books`, `/books/:slug` all render correctly (plus `resolveCustomerView()` placeholders for Phase 3-7 routes and 404 for unmatched paths)
- [x] 390px mobile fully functional — verified via dev server screenshots (bookshelf, book detail, mobile nav toggle, pending placeholder, 404)

**Gate:** Staging URL shows dark landing page. Book card for *The Deviants* renders with
synopsis, chapter count (28), and character count. Clicking "Enter" navigates to book detail.
All breakpoints (390px, 768px, 1440px) render without horizontal scroll.

---

## Phase 3 — Chapter Browser & Reader

**Delivers:** Readers can browse all chapters, filter by POV character, and read
individual chapters in an atmospheric dark reader view.

- [x] `src/modules/ChapterBrowser.js`
  - [x] Chapter list: number, title, POV character badge, word count, reading time
  - [x] POV filter pills: one per character with POV chapters (All / Miles Kelly / .../ Ensemble)
  - [x] Filter updates list without page reload (client-side `classList.toggle('hidden')` in
    `init()` — a custom event was unnecessary since the filter is purely local DOM state)
  - [x] Clicking chapter navigates to reader
  - [x] Route: `/books/:slug/chapters`
- [x] `src/modules/ChapterReader.js`
  - [x] Full chapter text rendered in reading column (max 680px, centered)
  - [x] Chapter header: number, title, POV character badge (or "Ensemble")
  - [x] Prev / Next chapter navigation
  - [x] Reading progress tracked in `dv_progress_[slug]` localStorage
  - [x] Route: `/books/:slug/chapters/:id`
  - [x] Placeholder for entity cross-links (Phase 6 activates linker — plain escaped text for now)
  - [x] `contentMissing` chapters (10, 16, 25) render an italic "text not yet available" notice
    instead of empty body
- [x] `src/core/bookLoader.js` — already fully implemented in Phase 0/1 scaffold
  - [x] Imports `content/[slug].json` statically via `import.meta.glob` (Vite static asset)
  - [x] Exports `getBook(slug)`, `getChapter(slug, id)`, `getCharacter(slug, id)`, etc.
  - [x] Null-safe: if book JSON missing, returns empty structure with TBC placeholders

**Gate:** Chapter browser renders all 28 chapters. POV filter for "Miles Kelly" shows exactly
chapters 1, 5, 15, 20. Clicking Chapter 1 renders full text in reader. Prev/Next navigation
works correctly. Reading progress persists through browser refresh.

---

## Phase 4 — Character Encyclopedia

**Delivers:** A complete character reference. Every character that appears in
the book has a profile page with bio, appearances, and connections.

- [ ] `src/modules/CharacterEncyclopedia.js`
  - [ ] Grid of all characters: avatar placeholder, name, role badge, POV chapter count
  - [ ] Filter by role (protagonist / antagonist / supporting)
  - [ ] Route: `/books/:slug/characters`
- [ ] `src/modules/CharacterProfile.js`
  - [ ] Character header: avatar, name, role, faction badge
  - [ ] Description section: prose-extracted description (or annotation if available)
  - [ ] Appearances section: chapters where character has POV (highlighted) and mention
  - [ ] Connections section: other characters co-occurring most frequently
  - [ ] Faction membership: badge linking to faction entry in World Atlas
  - [ ] Annotation section: Claude API bio (null-safe placeholder in sim mode)
  - [ ] Route: `/books/:slug/characters/:id`
- [ ] `src/components/EntityBadge.js`
  - [ ] Colored badge: `character` (crimson), `location` (gold), `faction` (faction blue)
  - [ ] Size variants: `sm`, `md`, `lg`

**Gate:** Character encyclopedia shows 7 character cards (6 POV + Loki).
Clicking "Miles Kelly" renders his profile with his description from Chapter 1 prose,
chapters [1, 5, 15, 20] highlighted as POV, Loki listed as a connection.
All profiles render null-safe when annotation data is absent.

---

## Phase 5 — World Atlas

**Delivers:** The spatial and organizational layer of the world. Readers can
explore locations and factions as structured lore entries.

- [ ] `src/modules/WorldAtlas.js`
  - [ ] Two tabs: Locations | Factions
  - [ ] Route: `/books/:slug/world`
- [ ] Locations tab
  - [ ] Card per location: name, type badge, first appearance chapter, chapter count
  - [ ] Expanding detail: description (prose-extracted), annotation (sim placeholder)
  - [ ] List of chapters in which it appears
- [ ] Factions tab
  - [ ] Card per faction: name, type badge, member characters, chapter count
  - [ ] Expanding detail: description, ideology, opposition/alliance links
  - [ ] Member character list links to individual character profiles
  - [ ] Annotation section: Claude API lore entry (null-safe sim placeholder)
- [ ] Navigation: clicking a chapter reference in any atlas entry opens that chapter in reader

**Gate:** World Atlas renders with Locations tab (SunCity, General Population, R&D)
and Factions tab (The Deviants, Defiance). The Deviants faction card shows 0 named members
initially (to be populated by parser), Defiance shows Dr Andrew Reed as founder.
Sim-mode placeholder lore text renders in annotation sections without breaking layout.

---

## Phase 6 — Cross-Link Engine

**Delivers:** Every entity mention in every chapter becomes a hyperlink.
The platform becomes a living, navigable mythology ecosystem.

- [ ] `src/core/linker.js` — full implementation
  - [ ] Builds entity registry from resolved book JSON at load time
  - [ ] Registry: Map of name variants → { entityId, entityType, slug }
  - [ ] Processes aliases longest-first to prevent partial matches
  - [ ] `linkChapterText(text, bookSlug)` — returns HTML string with entity anchors
  - [ ] Entity anchor format: `<a class="dv-entity-link" data-entity-id="X" data-entity-type="Y" href="/books/[slug]/[type]/[id]">Name</a>`
  - [ ] Disambiguation: prefers character over faction if character is in chapter's mention list
  - [ ] Does not link inside existing HTML tags (safe regex handling)
- [ ] `src/components/HoverCard.js`
  - [ ] Renders entity preview on `dv:entityHover` event
  - [ ] Content: entity type badge, name (Cinzel), 2-line description excerpt
  - [ ] Positions relative to anchor element — viewport-safe (no overflow)
  - [ ] Hides on `dv:entityHoverEnd` with 150ms delay (prevents flicker)
  - [ ] 390px: hover cards disabled — tap navigates directly
- [ ] `ChapterReader.js` updated: chapter text passes through `linker.linkChapterText()` before rendering
- [ ] Entity links wired to hover card system in `ChapterReader.init()`

**Gate:** Open Chapter 1. "Miles" in the first sentence is underlined crimson and triggers
a hover card showing Miles Kelly's role badge and description excerpt. "SunCity" is
underlined gold and links to the location entry. "Loki" links to Loki's character profile.
Clicking any link navigates to the correct entity profile. No double-linking (a name that
appears inside another link is not re-linked).

---

## Phase 7 — Search & Discovery

**Delivers:** Full-text search across all chapter content, filterable by entity type.
Readers can find any name, phrase, or theme across the entire book.

- [ ] `src/modules/SearchEngine.js`
  - [ ] Search input (triggered by nav icon or keyboard shortcut `/`)
  - [ ] fuse.js index built from all chapter text + entity descriptions at load time
  - [ ] Results grouped by type: Chapters | Characters | Locations | Factions
  - [ ] Chapter results: chapter number, POV, matching excerpt with query highlighted
  - [ ] Entity results: entity name, type badge, description excerpt
  - [ ] Clicking result navigates: chapter → reader, entity → profile
  - [ ] Route: `/search?q=query`
- [ ] `src/core/integrations/search.js` — fully wired
  - [ ] Simulation path: fuse.js client-side index (always active by default)
  - [ ] Live path: Algolia API (activates when `FLAGS.searchExternal: false` and credentials set)
- [ ] Keyboard: `/` opens search, `Escape` closes, arrow keys navigate results
- [ ] Search state persists in URL (`?q=miles`) — shareable search links

**Gate:** Searching "miles" returns Chapter 1 (Miles Kelly POV) in results plus the
Miles Kelly character entry. Searching "suncity" returns all chapters that mention SunCity
and the SunCity location entry. Searching "defiance" returns the Defiance faction entry
and all chapters mentioning the organization.

---

## Phase 8 — Multi-Book Support

**Delivers:** The platform can host multiple books simultaneously. The bookshelf
shows all parsed books. Characters and locations that appear across books are linked.

- [ ] `src/core/manifest.js` updated — `DEVIANT.books` is a registry keyed by slug
- [ ] `src/core/bookLoader.js` updated — loads all registered book JSONs dynamically
- [ ] `src/modules/BookshelfView.js` updated — renders all books in registry
- [ ] Universe view: if two books share a character ID, a "Shared Universe" badge appears
- [ ] `FLAGS.multiBookMode` — set to `true` (activated) in this phase
- [ ] `npm run parse [slug]` works for any new PDF in `sources/`
- [ ] Second book integration test: parse a test PDF, confirm it renders without breaking
  existing book routes

**Gate:** Bookshelf renders two book cards. Navigating to each book's chapters,
characters, and world atlas works independently. No cross-book data bleeds into
the wrong book's routes.

---

## Phase 9 — Annotation Layer (Claude API)

**Delivers:** Every character, chapter, location, and faction has a rich lore entry
generated by Claude — automatically, from the source text.

- [ ] `scripts/annotate.js` created — full pipeline
  - [ ] CLI: `node scripts/annotate.js [book-slug]`
  - [ ] Reads `content/[slug].json` as input
  - [ ] Anthropic SDK integration — `import Anthropic from '@anthropic-ai/sdk'`
  - [ ] Character annotation pass:
    - [ ] For each character: sends extracted description + all POV chapter prose
    - [ ] Prompt: "Write a lore encyclopaedia entry for this character. Include: background,
      personality, role in the story, key relationships. Style: atmospheric, third-person,
      mythological register. Max 200 words."
    - [ ] Response stored in annotations object
  - [ ] Chapter annotation pass:
    - [ ] For each chapter: sends full text
    - [ ] Prompt: "Provide: (1) A 2-sentence spoiler-free summary. (2) Three thematic tags
      from this list: [crime, cult, identity, survival, power, loyalty, betrayal, truth].
      (3) A narrative tension rating 1-10. JSON response only."
  - [ ] Location and faction annotation pass:
    - [ ] All prose excerpts for entity → lore entry in mythological register
  - [ ] Output: `content/[slug]-annotations.json`
  - [ ] Incremental: skips entities already annotated (checks annotation file before calling API)
  - [ ] Console: `[ANNOTATE] character: miles-kelly — 148 words generated`
  - [ ] `npm run annotate` script added to `package.json`
  - [ ] devDependency: `@anthropic-ai/sdk`
- [ ] `src/core/integrations/annotations.js` live path implemented
  - [ ] `FLAGS.annotationsSimulated: false` activates live path
  - [ ] Reads from `content/[slug]-annotations.json` at load time
  - [ ] Merges into book object alongside base JSON data
- [ ] All annotation sections in CharacterProfile, WorldAtlas, ChapterReader updated:
  - [ ] Null-safe: if annotation is null, placeholder text renders
  - [ ] If annotation exists, full lore entry renders in Cinzel heading + body copy

**Gate:** Running `npm run annotate the-deviants` with valid API key produces
`content/the-deviants-annotations.json`. Miles Kelly's profile shows a 150+ word
atmospheric lore entry. Setting `FLAGS.annotationsSimulated: false` in `flags.js` and
rebuilding shows annotations throughout the platform. Setting it back to `true` reverts
to placeholders. No broken layouts in either state.

---

## Phase 10 — SEO & Launch Gate

**Delivers:** The production URL is indexable, structured data is in place,
and all pre-production validation checks pass with zero warnings.

- [ ] `src/core/SEOEngine.js` — dynamic head meta management
  - [ ] Title template: `[Entity Name] — [Book Title] | DEVIANT`
  - [ ] Open Graph tags per page (book cover as og:image)
  - [ ] Twitter card meta
  - [ ] Canonical URL
- [ ] Structured data (JSON-LD)
  - [ ] `Book` schema for each loaded book
  - [ ] `WebSite` schema with SearchAction
- [ ] `public/sitemap.xml` — all indexable routes (books, characters, chapters, world)
- [ ] `public/robots.txt` — toggled to `Allow: /` + Sitemap directive via `scripts/launch.js`
- [ ] `vercel.json` — staging noindex headers removed for production config
- [ ] `scripts/launch.js` — passes with zero warnings
  - [ ] Zero null fields in `manifest.js` that are marked required
  - [ ] Zero `true` flags that are blocking production
  - [ ] `content/the-deviants.json` validated (28 chapters, non-empty)
- [ ] `npm run build` exits 0 — production build clean
- [ ] Copyright check: confirm rights to publish full chapter text online

**Gate:** `npm run launch` exits with zero warnings. `npm run build` exits 0.
Production URL returns 200 with correct OG tags (book cover, book title in og:title).
Chapter reader pages have correct canonical URLs.

---

## SVVP Staging Checklist

All must pass before any external demonstration or reader access.

- [ ] Landing page renders at 390px, 768px, 1440px
- [ ] Book card for *The Deviants* renders with cover placeholder and synopsis
- [ ] Chapter browser shows all 28 chapters with POV filter working
- [ ] POV filter for each of 6 characters returns correct chapter subset
- [ ] Chapter 1 renders in reader — full prose, dark background, readable typography
- [ ] Character encyclopedia shows 7 characters with role badges
- [ ] Miles Kelly profile renders with description, POV chapters, Loki connection
- [ ] World Atlas shows SunCity location and both factions
- [ ] Search for "Miles" returns character + chapters
- [ ] Entity cross-links active in Chapter 1 — "Miles" is crimson-linked
- [ ] Hover card appears on entity link hover (desktop)
- [ ] Reading progress saves through browser refresh
- [ ] Admin panel accessible at `/admin` with sim password
- [ ] `npm run build` exits 0
- [ ] Zero unhandled null values reaching DOM as literal "null"

---

## Pre-Production Final Gate

All items must be `[x]` before `vercel --prod`:

- [ ] Production domain registered and DNS configured to Vercel
- [ ] `public/robots.txt` set to `Allow: /` + Sitemap
- [ ] `public/sitemap.xml` regenerated with production URL
- [ ] `vercel.json` staging headers removed
- [ ] `npm run launch` exits 0
- [ ] `npm run build` exits 0
- [ ] Copyright clearance confirmed for full-text publication
- [ ] `FLAGS.annotationsSimulated` resolved (either annotations generated or explicitly deferred)
- [ ] `vercel --prod` executed
- [ ] Production URL returns 200

---

## Switch Flip Log

| Date | Flag Key | Set to | Confirmed By |
|------|----------|--------|--------------|
| — | — | — | — |
