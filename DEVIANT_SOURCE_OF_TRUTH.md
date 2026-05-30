# DEVIANT — The Mythology Engine
## Strategic Vision, Architectural Blueprint, and Platform Design Specification

> This document is the intelligence source for the Deviant platform.
> When you need to know what the platform does, how it thinks, and why it is built
> the way it is — you read this. It is not a build checklist. It is the reasoning
> behind every architectural decision that follows.

---

## 1. The Core Problem

Stories are consumed linearly and then abandoned.

A reader finishes a novel and has no infrastructure for the world they just experienced.
Characters disappear. Locations dissolve. Factions, relationships, timelines, and
thematic threads that took an author years to construct are flattened into a sequence
of pages — experienced once, then closed.

This is not how mythology works. Greek myths were not read linearly. Norse sagas were not
consumed once and shelved. Great fictional universes survive because they have an ecosystem
infrastructure — wikis, forums, encyclopedias, fan maps — that lets readers move sideways
through the world, not just forward through the plot.

Building that infrastructure by hand requires resources that independent authors do not have.
**Deviant solves this.** It takes a PDF novel and constructs the complete lore ecosystem
automatically — chapter by chapter, character by character, location by location — producing
the kind of interconnected, cross-linked, atmospheric experience that a major publisher would
commission a dedicated team to build.

---

## 2. What Deviant Is

**Deviant is a mythology engine.**

It reads fiction from a local PDF source, extracts the universe embedded inside the prose,
and renders it as an immersive, interconnected lore ecosystem — a living web of characters,
chapters, locations, factions, and themes that a reader can explore in any direction.

The metaphor is not a bookshelf. It is an **anthology atlas** — a map of a fictional universe
where every entry point leads deeper, every name is a door, and the world the author built
becomes as navigable as the internet itself.

---

## 3. The Six Entity Types

The engine recognizes and indexes six entity types from any novel. Every feature of the
platform is built around these six types and their relationships to each other.

### 3.1 Books

The top-level container. A book is the entry point into a universe. It carries:
- Title, author, synopsis, cover art
- Word count, chapter count, publication date
- Themes extracted from content
- Relationship to other books (series, shared universe, standalone)

The platform supports multiple books simultaneously. In a shared universe, characters and
locations can appear across books — the cross-link engine resolves these connections.

### 3.2 Chapters

The atomic unit of narrative. Each chapter carries:
- POV character (who is the narrator or focus)
- All entity mentions (which characters, locations, factions appear)
- Word count and reading time
- Position in the narrative arc
- Cross-references to chapters in other books (for series)

The chapter is the primary navigation unit. Readers filter by character, jump by chapter,
and the reader view is where the cross-link engine does its most visible work.

### 3.3 Characters

The relational core of every story. Character entries carry:
- All chapters in which they appear (POV and mention)
- Description extracted from prose (appearance, behavior, role)
- Relationships to other characters (inferred from co-occurrence patterns)
- Faction membership
- First and last appearance in the book
- Annotation layer: bio, arc summary, thematic role (when Claude API is active)

Characters are the most navigated entity type. A reader finishing Chapter 3 who wants to
understand more about a secondary character introduced in that chapter is the primary user
of the character encyclopedia.

### 3.4 Locations

The spatial architecture of the fictional world. Location entries carry:
- Type (city, building, institution, region, conceptual space)
- First appearance chapter
- All chapters in which they appear
- Description extracted from prose
- Relationships to factions that control or occupy them

Locations give the world its geography. In a prison novel like *The Deviants*, SunCity is
not just a setting — it is a character in its own right, with its own rules, history, and
atmosphere. The location entry makes this explicit.

### 3.5 Factions

The organizational layer of the world. Factions carry:
- Type (organization, cult, institution, gang, government)
- Member characters
- All chapters in which they appear or are referenced
- Opposition/alliance relationships to other factions
- Goals and ideology extracted from prose

Factions are how readers understand power in a fictional world. In *The Deviants*, the
opposition between The Deviants (the cult) and Defiance (the counter-organization) is the
spine of the plot — making this explicit in the entity layer gives the reader a structural
view of the conflict.

### 3.6 Themes

The thematic index. Themes are not extracted by keyword — they are inferred from entity
co-occurrence and prose analysis. Themes carry:
- Representative chapters (highest density of thematic signals)
- Associated characters and locations
- Narrative arc position (does this theme peak early, late, throughout?)

Themes are the most abstract entity type and require the Claude API annotation layer
for full richness. In simulation mode, themes are extracted from a static keyword list
and manually curated.

---

## 4. The Parser Engine

The parser is a Node.js script that runs once per book, on the operator's local machine.
It takes a PDF file and produces a structured JSON file that becomes the single source of
truth for all frontend rendering.

### 4.1 Parser Architecture

```
INPUT:  sources/[book-slug].pdf
OUTPUT: content/[book-slug].json
         content/[book-slug]-annotations.json  (optional — requires Claude API)

PIPELINE:
  1. pdf-parse   → raw text extraction (full book as string)
  2. Segmenter   → splits text into chapters using heading detection regex
  3. Extractor   → identifies entity mentions in each chapter segment
  4. Resolver    → normalizes entity names (aliases, variations, honorifics)
  5. Indexer     → builds reverse index: entity → [chapters it appears in]
  6. Serializer  → writes final JSON to content/
```

### 4.2 Chapter Detection

The parser detects chapter boundaries using a pattern engine tuned to common
fiction formatting conventions:

```
Primary pattern:   /^CHAPTER\s+(\d+)\n+([A-Z][^a-z\n]{2,40})/m
Secondary pattern: /^Chapter\s+(\d+)[:\s]+([A-Z][^\n]{2,40})/m
Fallback:          Blank-line density analysis (≥3 consecutive blank lines = boundary candidate)
```

For *The Deviants* specifically, chapters follow the format:
`CHAPTER N\n\nCharacter Name` — the primary pattern captures this exactly.

### 4.3 Entity Extraction Strategy

Entity extraction operates in two passes:

**Pass 1 — Seed extraction:** The manifest carries a pre-loaded entity seed list
(`DEVIANT.books['the-deviants'].knownCharacters`, etc.) populated from the table of
contents and any pre-read analysis. Seed entities are extracted by exact name match
and common alias patterns (first name only, honorific + surname, nickname).

**Pass 2 — Discovery extraction:** Capitalized noun phrases that appear ≥3 times in a
chapter and are not in a stoplist (common words, place names outside the fiction) are
flagged as candidate new entities. These are surfaced for manual review via the
annotation interface.

### 4.4 JSON Output Schema

```json
{
  "meta": {
    "title": "string",
    "author": "string",
    "slug": "string",
    "synopsis": "string",
    "cover": "string — path to public/assets/books/[slug]/cover.jpg",
    "parsedAt": "ISO 8601 timestamp",
    "wordCount": "number",
    "chapterCount": "number",
    "themes": ["string"]
  },
  "characters": [
    {
      "id": "kebab-case-slug",
      "name": "Full Name",
      "aliases": ["array of name variants"],
      "role": "protagonist | antagonist | supporting | minor",
      "povChapters": [1, 5, 15],
      "mentionChapters": [1, 2, 3, 5],
      "firstAppearance": 1,
      "lastAppearance": 28,
      "factions": ["faction-id"],
      "description": "string — extracted from prose",
      "annotation": "string — Claude API bio (null if annotationsSimulated)"
    }
  ],
  "chapters": [
    {
      "id": 1,
      "number": 1,
      "title": "string",
      "pov": "character-id | null",
      "text": "string — full chapter text",
      "wordCount": "number",
      "readingTimeMinutes": "number",
      "mentions": {
        "characters": ["character-id"],
        "locations": ["location-id"],
        "factions": ["faction-id"]
      },
      "annotation": {
        "summary": "string — Claude API chapter summary (null if simulated)",
        "themes": ["string"],
        "tension": "number 0-10 — narrative tension rating"
      }
    }
  ],
  "locations": [
    {
      "id": "kebab-case-slug",
      "name": "string",
      "type": "city | building | institution | region | vehicle | conceptual",
      "controlledBy": "faction-id | null",
      "firstAppearance": 1,
      "chapters": [1, 2, 3],
      "description": "string — extracted from prose",
      "annotation": "string — Claude API entry (null if simulated)"
    }
  ],
  "factions": [
    {
      "id": "kebab-case-slug",
      "name": "string",
      "type": "organization | cult | institution | gang | government",
      "members": ["character-id"],
      "opposedTo": ["faction-id"],
      "alliedWith": ["faction-id"],
      "chapters": [1, 2, 3],
      "description": "string — extracted from prose",
      "annotation": "string — Claude API entry (null if simulated)"
    }
  ]
}
```

---

## 5. The Cross-Link Engine

The cross-link engine is what transforms the platform from a reading app into a
mythology ecosystem. It is the technical core of the Deviant experience.

### 5.1 What it does

After the parser produces `content/[slug].json`, the linker module processes all
chapter text at render time and replaces known entity name strings with interactive
anchor elements:

```
Input text:  "Miles walked to where Loki was sitting in the cafeteria at SunCity."

Output HTML: "
  <a class='dv-entity-link' data-entity-id='miles-kelly' data-entity-type='character'>
    Miles
  </a>
  walked to where 
  <a class='dv-entity-link' data-entity-id='loki' data-entity-type='character'>
    Loki
  </a>
  was sitting in the cafeteria at 
  <a class='dv-entity-link' data-entity-id='suncity' data-entity-type='location'>
    SunCity
  </a>.
"
```

Every entity link:
- Shows a hover card with the entity's photo placeholder, name, and description excerpt
- On click, navigates to the entity's full profile page
- Is visually distinct by entity type (character: crimson underline, location: gold underline,
  faction: rune-grey underline)

### 5.2 Alias Resolution

The linker engine uses the `aliases` array from each entity to resolve name variants.
It processes aliases longest-first to prevent partial matches (e.g., "Dr Andrew Reed"
is matched before "Andrew" and "Reed").

### 5.3 Conflict Resolution

When two entity names overlap (e.g., a character named "Defiance" in a world that
contains a faction also called "Defiance"), the linker applies contextual disambiguation
via the chapter's entity mentions index — if a chapter's `mentions.characters` array
does not contain the character ID, the faction ID takes precedence, and vice versa.

---

## 6. The Annotation Layer

The annotation layer is the intelligence upgrade. It is powered by the Claude API and
is activated by a single boolean flag in `flags.js`.

### 6.1 What it produces

When `FLAGS.annotationsSimulated` is `false` and `DEVIANT.integrations.anthropicKey`
is populated, the `scripts/annotate.js` script runs the following passes over each book:

**Character annotation pass:**
For each character, Claude receives the character's extracted description plus all prose
excerpts from chapters where the character has POV, and produces:
- A structured biography (background, personality, motivation, arc summary)
- A relationship profile (how they relate to other major characters)
- A thematic role summary (what this character represents in the larger narrative)

**Chapter annotation pass:**
For each chapter, Claude receives the full chapter text and produces:
- A 2-3 sentence spoiler-free chapter summary
- A thematic tag set (which themes are present and how strongly)
- A narrative tension rating (1-10)

**Location and faction annotation pass:**
For each location and faction, Claude receives all prose excerpts in which they appear
and produces a lore entry in the style of a mythology encyclopaedia — descriptive,
atmospheric, in-world voice.

### 6.2 Annotation output schema

Annotations are stored in `content/[slug]-annotations.json` as a supplemental file.
The frontend merges annotation data with the base book data at load time. If the
annotations file does not exist, the platform renders gracefully without it —
showing placeholder lore text styled to match the dark aesthetic.

### 6.3 Cost model

The annotation pass runs once per book. At Claude API rates, annotating a 100,000-word
novel across all entity types costs approximately $0.15–0.40 USD. The output is cached
permanently in `content/`. Re-running the annotate script only processes entities that
have changed or are missing annotation data.

---

## 7. The Reader Experience Design

### 7.1 Design Philosophy: Darkness as Aesthetic

The Deviant visual language is deliberate and unapologetic. It is dark — not dark as a
default fallback, but dark as an intentional statement about the kind of stories it tells
and the readers who read them.

Mythology, crime fiction, psychological thrillers, cult narratives — these are genres that
live in shadow. The platform's aesthetic must be in alignment with the content it serves.
Light mode is not offered. The darkness is the product.

**Design axioms:**
- Every surface is a canvas for atmospheric detail, not dead whitespace
- Typography is the primary design element — the prose carries the mood
- Navigation chrome is minimal so the content breathes
- Color is used sparingly as signal: crimson for danger/characters, gold for lore/chapters,
  ash for secondary text, ghost-white for primary reading surface

### 7.2 Reading as Exploration

The chapter reader is not a book page. It is an interactive artifact. The difference:

| Book Page | Deviant Chapter Reader |
|-----------|----------------------|
| Character name is text | Character name is a hyperlink |
| Footnotes are academic | Hover cards are atmospheric |
| Back of book has glossary | Profile pages have full lore entries |
| One reading direction | Navigate in any direction at any time |
| Finish, close | Finish one chapter, explore the world, return |

### 7.3 The Three Navigation Modes

Users approach the platform in three distinct modes:

**Reading Mode:** Enter at the first chapter, read sequentially. Cross-links are discoverable
but not mandatory. The experience degrades gracefully to a clean dark-mode reading interface.

**Exploration Mode:** Enter via the character encyclopedia, world atlas, or bookshelf. Navigate
by entity, not by chapter. Use the platform as a reference while reading a physical copy or
re-reading a favorite passage.

**Discovery Mode:** Enter via search. Look for a specific name, place, or theme. Find every
chapter that contains it, every character connected to it, every other entity in the same
orbit. This is the mode that makes the platform feel alive — the world responds to queries.

---

## 8. Competitive Differentiation

### 8.1 vs. mythosanthology.com

mythosanthology.com is an artisanal, manually-curated anthology experience. Each entry
is hand-edited, hand-categorized, hand-designed. This produces exceptional depth for the
books it covers — and structural impossibility for scaling to new books.

Deviant is the parser-first alternative: any PDF becomes a full lore ecosystem in minutes.
The trade-off is that the initial extraction is heuristic, not hand-crafted — but the
annotation layer (Claude API) closes this gap dramatically for any book the operator cares
about deeply.

### 8.2 vs. fan wikis (Fandom, Wikidot)

Fan wikis require a community of contributors. They are built by fans, not by the author.
Deviant is built from the source text — every entry is grounded in what the prose actually
says, not in fan interpretation. The author owns the ecosystem.

### 8.3 vs. generic reading apps (Kindle, Apple Books)

Generic reading apps are consumption tools. They have no lore layer, no cross-linking,
no character encyclopedia. They treat every word as equal. Deviant treats every entity
mention as a navigational opportunity.

### 8.4 The Deviant moat

The moat is the parser + annotation pipeline. Once a book is parsed and annotated, the
resulting `content/` files are a proprietary structured asset that no other tool can
produce from a raw PDF in a comparable workflow. The operator owns this asset.

---

## 9. Deployment Model

Deviant is a **static site** with a local preprocessing step.

```
Local machine (operator):
  PDF → scripts/parse.js → content/[slug].json
  (optional) scripts/annotate.js → content/[slug]-annotations.json

Vercel (or any static host):
  Vite build consumes content/ JSON files
  Outputs static HTML/CSS/JS bundle
  No server-side rendering
  No database
  No backend API
```

This means:
- **Zero infrastructure cost** beyond the Vercel free tier
- **Zero backend maintenance** — no servers to patch, no databases to back up
- **Maximum portability** — the site can run on any static host, including locally
- **Instant global CDN** via Vercel edge network

The only runtime requirement is a browser. The only operational requirement is running
the parser script when a new book is added.

---

## 10. The First Book — *The Deviants* by Riley Bishop

The platform ships with *The Deviants* as its inaugural entry.

**Structure:**
- 28 chapters, each named after a POV character
- 6 recurring POV characters: Miles Kelly, Jonathan Reed, Dr Avery Melblac,
  Dr Andrew Reed, Sarah May, Atticus Finch
- World: SunCity (maximum security prison)
- Central conflict: The Deviants (cult) vs. Defiance (counter-organization)
- Genre: Psychological thriller / cult crime fiction

**What makes it an ideal first book:**
- Multi-POV structure produces rich character profiles immediately
- Named factions create a clear world atlas from the first chapter
- Dark atmospheric tone aligns perfectly with the Deviant visual language
- 28-chapter structure is large enough to demonstrate the cross-link engine at scale

**Extracted entity seed list (pre-loaded in manifest):**

Characters: Miles Kelly, Jonathan Reed, Dr Avery Melblac, Dr Andrew Reed, Sarah May,
Atticus Finch, Loki

Locations: SunCity, General Population, Receiving and Discharging

Factions: The Deviants, Defiance

---

*This document is the strategic foundation of the Deviant platform.
Every architectural decision, every module name, every design token traces back to
the reasoning established here. Read this before reading CLAUDE.md.
Read CLAUDE.md before touching any file.*
