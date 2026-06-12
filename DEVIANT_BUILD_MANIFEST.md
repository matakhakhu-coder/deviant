# DEVIANT_BUILD_MANIFEST.md — The Ledger
## DEVIANT · The Mythology Engine

> This document records confirmed external reality only.
> It changes when a fact is operationally confirmed — a credential arrives,
> a decision is made, a book is parsed, an asset is delivered.
> Unconfirmed facts are marked `TBC — [what is needed]`.
> This document and `DEVIANT_ROADMAP.md` must remain in sync on phase status.

---

## Phase Status Table

| Phase | Name | Status |
|-------|------|--------|
| 0 | Substrate | In Progress — code complete, Vercel connection TBC |
| 1 | Parser Engine | Complete — content/the-deviants.json generated (28 chapters; 3 synthesized — see deficits) |
| 2 | Book Shell & Navigation | Complete — Navbar, Footer, BookshelfView, BookDetailView wired into mountCustomer(); SPA routing for /, /books, /books/:slug + pending/404 placeholders |
| 3 | Chapter Browser & Reader | Complete — ChapterBrowser (POV filter pills) + ChapterReader (reading column, prev/next, progress tracking) wired into mountCustomer() |
| 4 | Character Encyclopedia | Pending |
| 5 | World Atlas | Pending |
| 6 | Cross-Link Engine | Pending |
| 7 | Search & Discovery | Pending |
| 8 | Multi-Book Support | Pending |
| 9 | Annotation Layer (Claude API) | Pending |
| 10 | SEO & Launch Gate | Pending |

---

## Platform Identity

| Field | Value | Status |
|-------|-------|--------|
| Platform Name | DEVIANT | Confirmed |
| Full Name | The Mythology Engine | Confirmed |
| Staging Domain | https://deviant-one.vercel.app | Confirmed |
| Production Domain | TBC — domain registration required | TBC |
| Vercel Account | matakhakhu-coder | Confirmed |
| Repository | https://github.com/matakhakhu-coder/deviant | Confirmed |
| Platform Tagline | TBC — copy decision required | TBC |
| Legal Entity | TBC | TBC |
| Contact Email | matamelaramovha8@gmail.com | Confirmed (operator email) |

---

## Book Registry

### Book 001 — *The Deviants*

| Field | Value | Status |
|-------|-------|--------|
| Title | The Deviants | Confirmed |
| Author | Riley Bishop | Confirmed |
| Slug | `the-deviants` | Confirmed |
| Source File | `sources/the-deviants.pdf` | Confirmed — file exists |
| Total Pages | 269 | Confirmed |
| Total Chapters | 28 | Confirmed |
| Genre | Psychological thriller / cult crime fiction | Confirmed |
| Setting | SunCity (maximum security prison) | Confirmed |
| Cover Art | TBC — extract from PDF or source separately | TBC |
| Synopsis | "A malevolent organisation and cult exists in this world. Their influence is felt at virtually every level of society. They worship an entity of great evil. Dr Andrew Reed is a criminal profiler who founded an organisation to fight this cult. He called it Defiance. Together with his agents they attempt to fight this force of evil." | Confirmed |
| Parsed JSON | `content/the-deviants.json` — 28 chapters, 7 characters, 3 locations, 2 factions | Confirmed |
| Candidates JSON | `content/the-deviants-candidates.json` — Pass 2 entity candidates for manual review | Confirmed |
| Annotations JSON | TBC — generated in Phase 9 | Pending |

#### Confirmed POV Characters — *The Deviants*

| Character Name | Chapters (POV) | Role | Status |
|---------------|----------------|------|--------|
| Miles Kelly | 1, 5, 15, 20 | Protagonist | Confirmed — appears in ToC |
| Jonathan Reed | 2, 8, 14, 21, 24 | Protagonist | Confirmed — appears in ToC |
| Dr Avery Melblac | 3, 9, 17, 22, 25 | Protagonist | Confirmed — appears in ToC |
| Dr Andrew Reed | 4, 10, 12, 16 | Protagonist | Confirmed — appears in ToC |
| Sarah May | 6, 11, 18, 19, 26 | Protagonist | Confirmed — appears in ToC |
| Atticus Finch | 7, 13, 23 | Protagonist | Confirmed — appears in ToC |

Note: Chapter 27 is titled "The Deviants part I" and Chapter 28 is "The Deviants part II" —
these appear to have no single POV character. Parser will handle as ensemble chapters.

#### Confirmed Supporting Characters — *The Deviants*

| Character Name | Role | Status |
|---------------|------|--------|
| Loki | Miles Kelly's cellmate, SunCity | Confirmed — appears in Chapter 1 prose |

#### Confirmed Locations — *The Deviants*

| Location Name | Type | Status |
|--------------|------|--------|
| SunCity | Maximum security prison | Confirmed |
| Receiving and Discharging | Prison processing area | Confirmed |
| General Population | Prison wing | Confirmed |

#### Confirmed Factions — *The Deviants*

| Faction Name | Type | Status |
|-------------|------|--------|
| The Deviants | Malevolent cult | Confirmed |
| Defiance | Counter-organization founded by Dr Andrew Reed | Confirmed |

---

## Integration Registry

### Annotation Engine — Claude API

| Field | Value |
|-------|-------|
| Service Purpose | Generate character bios, chapter summaries, lore entries for world atlas |
| Provider | Anthropic (Claude API) |
| Model | claude-sonnet-4-6 (or latest available at time of Phase 9) |
| Config Key Path | `DEVIANT.integrations.anthropic.apiKey` |
| Output Path | `content/[slug]-annotations.json` |
| Flag Key | `annotationsSimulated` |
| Status | `null` — TBC |

### Search Engine — External (Phase 2 upgrade path)

| Field | Value |
|-------|-------|
| Service Purpose | Full-text search across all chapter content (Phase 1: client-side fuse.js) |
| Provider | TBC — Algolia or Typesense for Phase 2 at scale |
| Config Key Path | `DEVIANT.integrations.search.appId`, `DEVIANT.integrations.search.apiKey` |
| Flag Key | `searchExternal` |
| Status | `false` — client-side fuse.js is the default and requires no credentials |

---

## Feature Flags

All flags default to `true` (simulation) at project start.
Flipping a flag to `false` is the only code change needed to go live for that dependency.

| Flag Key | Controls | Resolves to `false` When |
|----------|----------|--------------------------|
| `annotationsSimulated` | Claude API annotation fetching — shows placeholder lore text | Anthropic API key placed in `DEVIANT.integrations.anthropic.apiKey` |
| `searchExternal` | Full-text search — client-side fuse.js vs external Algolia | Algolia App ID + API key confirmed and set in manifest |
| `adminSimulated` | Admin authentication — `localStorage` password vs real auth | Auth provider credentials confirmed |
| `multiBookMode` | Single book display vs bookshelf (Phase 8) | Activated in Phase 8 when second book is parsed |

---

## npm Dependencies

| Package | Purpose | Status |
|---------|---------|--------|
| `vite` | Dev server, build tool | Confirmed — standard stack |
| `tailwindcss` | Utility CSS framework | Confirmed — standard stack |
| `postcss` | CSS processor | Confirmed — standard stack |
| `autoprefixer` | CSS vendor prefixes | Confirmed — standard stack |
| `pdf-parse` | Node.js PDF text extraction (parser script only) | Confirmed — required for Phase 1 |
| `fuse.js` | Client-side full-text fuzzy search | Confirmed — required for Phase 7 |

Note: `pdf-parse` is a dev/script dependency only — it is never bundled into the browser build.

---

## Asset Inventory

| Asset | Specification | Status |
|-------|--------------|--------|
| Platform Logo (SVG) | Primary, white variant, icon-only | TBC |
| Platform Logo (PNG) | 1x and 2x for email/social | TBC |
| Favicon | 32×32 and 180×180 (Apple touch) | TBC |
| OG / Social Share Image | 1200×630, dark atmospheric | TBC |
| Book Cover — The Deviants | Extracted from PDF cover page or sourced separately | TBC |
| Character Avatar Placeholders | 6 × abstract dark silhouette SVGs | TBC — generate in Phase 4 |
| Display Font — Cinzel | Via Google Fonts CDN | Confirmed approach |
| Body Font — Inter | Via Google Fonts CDN | Confirmed approach |
| Mono Font — JetBrains Mono | Via Google Fonts CDN | Confirmed approach |

---

## Outstanding Items Before Production

The following items must be resolved before any production deployment.

1. Platform production domain name (registration + DNS)
2. Anthropic API key for Claude annotation layer (Phase 9)
3. ~~GitHub repository creation and Vercel connection (Phase 0)~~ — done
4. ~~Staging Vercel URL (auto-generated Phase 0)~~ — done
13. **Source manuscript gap (Phase 1):** `sources/the-deviants.pdf` has no heading
    marker for Chapters 10, 16, and 25 — the body text transitions directly from
    Chapter 9→11, 15→17, and 24→26. These three chapters are present in
    `content/the-deviants.json` as placeholders (`contentMissing: true`, title/POV
    from manifest TOC, 0 words) so the reader and chapter browser don't break, but
    their prose is genuinely absent and needs to be resupplied by the author and
    re-parsed.
5. Platform logo and brand assets
6. Book cover art for *The Deviants* (clean extract or resupplied)
7. Platform tagline and marketing copy
8. Author bio for Riley Bishop (for book detail page)
9. Social media handles for platform (Instagram, X, TikTok — if applicable)
10. Decision: is this platform public (anyone can explore) or private (password-gated reader)?
11. Decision: will additional books beyond *The Deviants* be published at launch?
12. Legal / copyright clearance for publishing full chapter text publicly online

---

## Switch Flip Log

Record each credential confirmation and flag resolution here.

| Date | Flag Key | Set to | Confirmed By |
|------|----------|--------|--------------|
| — | — | — | — |
