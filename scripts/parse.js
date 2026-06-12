// scripts/parse.js — PDF -> structured JSON pipeline.
// Run with: node scripts/parse.js [book-slug]   (defaults to 'the-deviants')
//
// Reads sources/[slug].pdf, segments into chapters, indexes entity mentions
// against the seed list in src/core/manifest.js, and writes content/[slug].json.
// Also writes content/[slug]-candidates.json — capitalized noun phrases that
// appear frequently but aren't in the seed list, for manual review.
//
// This script runs in Node.js only and must never be imported by src/.

import { PDFParse } from 'pdf-parse'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const WPM = 200

// Common words excluded from Pass 2 capitalized-phrase discovery — sentence-initial
// capitals, days, months, pronouns, etc.
const STOPLIST = new Set([
  'the', 'a', 'an', 'he', 'she', 'they', 'it', 'i', 'we', 'you', 'his', 'her', 'their',
  'this', 'that', 'these', 'those', 'and', 'but', 'or', 'so', 'if', 'as', 'is', 'was',
  'were', 'are', 'be', 'been', 'has', 'have', 'had', 'not', 'no', 'yes', 'what', 'who',
  'when', 'where', 'why', 'how', 'there', 'here', 'then', 'now', 'still', 'just', 'one',
  'two', 'three', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december', 'mr', 'mrs', 'ms', 'dr', 'ok', 'oh',
])

function normalizeText(raw) {
  return raw
    // strip page-break markers: "-- N of M --"
    .replace(/^--\s*\d+\s*of\s*\d+\s*--$/gm, '')
    // strip standalone page-number lines
    .replace(/^\s*\d+\s*$/gm, '')
    // pdf-parse emits tab-separated words; collapse to single spaces
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function findCharacterByName(knownCharacters, name) {
  const normalized = name.trim().toLowerCase().replace(/^(dr|mr|mrs|ms)\s+/, '')

  return knownCharacters.find((c) => {
    const candidates = [c.name, ...(c.aliases ?? [])]
    return candidates.some((candidate) => candidate.toLowerCase().replace(/^(dr|mr|mrs|ms)\s+/, '') === normalized)
  }) ?? null
}

/**
 * @returns {Array<{ id: number, title: string, pov: string|null, ensemble: boolean, text: string }>}
 */
function segmentChapters(text, knownCharacters) {
  const headingRegex = /^CHAPTER\s+(\d+)\s*\n(.+)$/gm
  const matches = [...text.matchAll(headingRegex)]
  const chapters = []

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const id = Number(match[1])
    const title = match[2].trim()
    const startBody = match.index + match[0].length
    const endBody = i + 1 < matches.length ? matches[i + 1].index : text.length
    const body = text.slice(startBody, endBody).trim()

    const character = findCharacterByName(knownCharacters, title)

    chapters.push({
      id,
      title,
      pov: character ? character.id : null,
      ensemble: !character,
      text: body,
    })
  }

  return chapters
}

/**
 * The source PDF's table of contents lists 28 chapters, but chapters 10, 16
 * and 25 have no heading marker in the body — their content appears to have
 * been merged into the preceding chapter without a page break. This is a gap
 * in the source manuscript, not a parser bug (confirmed: chapter 9 -> 11,
 * 15 -> 17, 24 -> 26 transition directly).
 *
 * Null-safe fallback: synthesize placeholder chapter entries from the TOC
 * (title/POV via knownCharacters.povChapters) so every chapter id 1..N
 * resolves to a chapter object. Flagged with `contentMissing: true` so the
 * reader can render a "content unavailable" placeholder instead of breaking.
 */
function fillMissingChapters(chapters, knownCharacters, totalChapters) {
  const present = new Set(chapters.map((ch) => ch.id))
  const missing = []

  for (let id = 1; id <= totalChapters; id++) {
    if (present.has(id)) continue

    const character = knownCharacters.find((c) => (c.povChapters ?? []).includes(id))

    missing.push({
      id,
      title: character ? character.name : `Chapter ${id}`,
      pov: character ? character.id : null,
      ensemble: !character,
      text: '',
      contentMissing: true,
    })
  }

  if (missing.length > 0) {
    console.warn(`[PARSE] Source PDF missing chapter heading(s): ${missing.map((m) => m.id).join(', ')} — synthesized placeholders from manifest TOC`)
  }

  return [...chapters, ...missing].sort((a, b) => a.id - b.id)
}

/**
 * Builds case-sensitive, word-boundary alias matchers, longest alias first
 * so "Andrew Reed" is matched before "Andrew".
 */
function buildEntityMatchers(entities) {
  return entities
    .map((entity) => ({
      id: entity.id,
      patterns: [entity.name, ...(entity.aliases ?? [])]
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
        .map((alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)),
    }))
}

function findMentions(chapterText, matchers) {
  return matchers
    .filter(({ patterns }) => patterns.some((re) => re.test(chapterText)))
    .map(({ id }) => id)
}

/**
 * Pass 2 — capitalized noun phrase discovery (1-3 Title Case words), frequency >= 3,
 * excluding known entity names/aliases and the stoplist.
 */
function findCandidates(chapterText, knownPhrases) {
  const phraseRegex = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/g
  const counts = new Map()

  for (const match of chapterText.matchAll(phraseRegex)) {
    const phrase = match[1]
    const firstWord = phrase.split(' ')[0].toLowerCase()
    if (STOPLIST.has(firstWord)) continue
    if (knownPhrases.has(phrase)) continue
    counts.set(phrase, (counts.get(phrase) ?? 0) + 1)
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(([phrase, count]) => ({ phrase, count }))
}

function buildEntityIndex(chapters, entities, type, matchers) {
  const index = {}
  for (const entity of entities) {
    const matcher = matchers.find((m) => m.id === entity.id)
    const chapterIds = chapters
      .filter((ch) => matcher.patterns.some((re) => re.test(ch.text)))
      .map((ch) => ch.id)
    index[entity.id] = { type, chapters: chapterIds }
  }
  return index
}

async function main() {
  const slug = process.argv[2] ?? 'the-deviants'

  const { DEVIANT } = await import(pathToFileURL(path.join(root, 'src/core/manifest.js')))
  const book = DEVIANT.books[slug]

  if (!book) {
    console.error(`[PARSE] No book registered for slug "${slug}" in manifest.js`)
    process.exit(1)
  }

  const pdfPath = path.join(root, 'sources', `${slug}.pdf`)
  if (!existsSync(pdfPath)) {
    console.error(`[PARSE] Source PDF not found: sources/${slug}.pdf`)
    process.exit(1)
  }

  console.log(`[PARSE] Reading sources/${slug}.pdf`)
  const buffer = readFileSync(pdfPath)
  const parser = new PDFParse({ data: buffer })
  const result = await parser.getText()
  const text = normalizeText(result.text)

  const chapters = fillMissingChapters(
    segmentChapters(text, book.knownCharacters),
    book.knownCharacters,
    book.totalChapters,
  )

  const characterMatchers = buildEntityMatchers(book.knownCharacters)
  const locationMatchers = buildEntityMatchers(book.knownLocations)
  const factionMatchers = buildEntityMatchers(book.knownFactions)

  for (const chapter of chapters) {
    chapter.wordCount = chapter.text ? chapter.text.split(/\s+/).filter(Boolean).length : 0
    chapter.readingTime = chapter.wordCount > 0 ? Math.ceil(chapter.wordCount / WPM) : 0
    chapter.mentions = {
      characters: findMentions(chapter.text, characterMatchers),
      locations: findMentions(chapter.text, locationMatchers),
      factions: findMentions(chapter.text, factionMatchers),
    }
    if (chapter.pov && !chapter.mentions.characters.includes(chapter.pov)) {
      chapter.mentions.characters.push(chapter.pov)
    }

    const povLabel = chapter.ensemble
      ? 'ensemble'
      : book.knownCharacters.find((c) => c.id === chapter.pov)?.name ?? 'unknown'
    const suffix = chapter.contentMissing ? ' [CONTENT MISSING FROM SOURCE]' : ''
    console.log(`[PARSE] Chapter ${chapter.id}/${book.totalChapters} — ${povLabel} (${chapter.wordCount} words)${suffix}`)
  }

  const entityIndex = {
    ...buildEntityIndex(chapters, book.knownCharacters, 'character', characterMatchers),
    ...buildEntityIndex(chapters, book.knownLocations, 'location', locationMatchers),
    ...buildEntityIndex(chapters, book.knownFactions, 'faction', factionMatchers),
  }

  const characters = book.knownCharacters.map((c) => ({
    ...c,
    appearances: entityIndex[c.id].chapters,
  }))
  const locations = book.knownLocations.map((l) => ({
    ...l,
    appearances: entityIndex[l.id].chapters,
  }))
  const factions = book.knownFactions.map((f) => ({
    ...f,
    appearances: entityIndex[f.id].chapters,
  }))

  // Pass 2 — candidate entity discovery for manual review
  const knownPhrases = new Set([
    ...book.knownCharacters.flatMap((c) => [c.name, ...(c.aliases ?? [])]),
    ...book.knownLocations.flatMap((l) => [l.name, ...(l.aliases ?? [])]),
    ...book.knownFactions.flatMap((f) => [f.name, ...(f.aliases ?? [])]),
  ])

  const candidates = chapters.map((chapter) => ({
    chapter: chapter.id,
    candidates: findCandidates(chapter.text, knownPhrases),
  })).filter((entry) => entry.candidates.length > 0)

  const output = {
    slug,
    title: book.title,
    author: book.author,
    totalChapters: book.totalChapters,
    chapters,
    characters,
    locations,
    factions,
    entityIndex,
  }

  const contentDir = path.join(root, 'content')
  writeFileSync(path.join(contentDir, `${slug}.json`), JSON.stringify(output, null, 2))
  writeFileSync(path.join(contentDir, `${slug}-candidates.json`), JSON.stringify(candidates, null, 2))

  console.log(`[PARSE] Wrote content/${slug}.json (${chapters.length} chapters)`)
  console.log(`[PARSE] Wrote content/${slug}-candidates.json (${candidates.length} chapters with candidates)`)
}

main()
