# DEVIANT — The Mythology Engine
## Project Bootstrap Directory

This directory contains the complete foundational DNA for the DEVIANT project.
It lives temporarily inside the DreamPrint repository for authoring convenience.
It is fully self-contained and designed for zero-friction extraction.

---

## Document Map

| File | Purpose |
|------|---------|
| `DEVIANT_SOURCE_OF_TRUTH.md` | Strategic vision, platform architecture, entity model, parser design |
| `CLAUDE.md` | Project law — working protocol, architecture constraints, module map |
| `DEVIANT_BUILD_MANIFEST.md` | The Ledger — confirmed facts, book registry, phase status, integrations |
| `DEVIANT_ROADMAP.md` | The Log — build checklist with gate criteria per phase (Phases 0–10) |
| `COGNITIVE_DEBRIEF.md` | Context injector for new Claude instances — operational DNA |
| `GEMINI_SYSTEM_PROMPT.md` | Three-agent orchestration — Gemini system prompt for generating Claude directives |

Read order for a new Claude instance: `COGNITIVE_DEBRIEF.md` → `CLAUDE.md` → `DEVIANT_BUILD_MANIFEST.md` → `DEVIANT_ROADMAP.md`

---

## Extracting to Its Own Repository

When you are ready to begin building, extract this directory in three steps:

### Step 1 — Create the new repository

```bash
# From any directory on your machine
mkdir Deviant
cd Deviant
git init
git branch -M main
```

### Step 2 — Copy the documents

```bash
# From the DreamPrint directory
cp -r deviant/* C:\path\to\Deviant\
```

Or on Windows (PowerShell):
```powershell
Copy-Item -Path "deviant\*" -Destination "C:\path\to\Deviant\" -Recurse
```

### Step 3 — Push to GitHub and connect Vercel

```bash
cd C:\path\to\Deviant
git add CLAUDE.md DEVIANT_SOURCE_OF_TRUTH.md DEVIANT_BUILD_MANIFEST.md DEVIANT_ROADMAP.md COGNITIVE_DEBRIEF.md GEMINI_SYSTEM_PROMPT.md README.md
git commit -m "docs: initial project DNA — Deviant mythology engine"
git remote add origin https://github.com/matakhakhu-coder/deviant.git
git push -u origin main
```

Then connect the GitHub repository to Vercel. Phase 0 will scaffold the actual
Vite project on top of these documents.

---

## What Gets Built

The DEVIANT platform transforms PDF novels into living lore ecosystems:

```
sources/the-deviants.pdf
  ↓  npm run parse
content/the-deviants.json     ← 28 chapters, 7 characters, 3 locations, 2 factions
  ↓  (optional) npm run annotate
content/the-deviants-annotations.json   ← Claude API lore entries
  ↓  npm run build
dist/                         ← static site, deployable to Vercel
```

**Features (Phases 0–10):**
- Chapter browser with POV character filtering
- Cross-linked chapter reader (entity names are hyperlinks)
- Character encyclopedia with profiles
- World atlas (locations + factions)
- Full-text search
- Claude API annotation layer for rich lore entries
- Multi-book support

**Stack:** Vite · Vanilla JS ESM · Tailwind CSS 3.x

---

## First Book — *The Deviants* by Riley Bishop

- 28 chapters, 6 POV characters
- Setting: SunCity (maximum security prison)
- Factions: The Deviants (cult) vs. Defiance (counter-organization)
- Source PDF: drop into `sources/the-deviants.pdf` after extraction

---

## Removing from DreamPrint

Once extracted and pushed to its own GitHub repo, you can delete this directory
from DreamPrint entirely:

```bash
# From DreamPrint root
git rm -r deviant/
git commit -m "chore: remove Deviant bootstrap — moved to standalone repo"
git push origin main
```

Zero impact on DreamPrint. The `deviant/` directory has no imports into or from
any DreamPrint source file.
