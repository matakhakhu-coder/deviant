// bookLoader — the only module that imports from content/.
// Provides null-safe accessors over parsed book JSON + annotation JSON.
// All other modules receive book data as arguments from here.

import { DEVIANT } from './manifest.js'
import { getAnnotation } from './integrations/annotations.js'

// Eagerly globbed so missing content/ files do not break the build (Phase 0/1 boundary).
const bookModules = import.meta.glob('../../content/*.json', { eager: true })

function findContentFile(slug, suffix = '') {
  const target = `/content/${slug}${suffix}.json`
  for (const path in bookModules) {
    if (path.endsWith(target)) return bookModules[path].default ?? bookModules[path]
  }
  return null
}

const EMPTY_BOOK = {
  slug: null,
  title: 'TBC',
  author: 'TBC',
  chapters: [],
  characters: [],
  locations: [],
  factions: [],
}

/**
 * @param {string} slug
 * @returns {object} resolved book data merged with manifest seed + annotations
 */
export function getBook(slug) {
  const seed = DEVIANT.books[slug]
  const parsed = findContentFile(slug)

  if (!seed && !parsed) return { ...EMPTY_BOOK, slug }

  return {
    ...EMPTY_BOOK,
    ...seed,
    ...parsed,
    slug,
  }
}

export function getAllBooks() {
  return Object.keys(DEVIANT.books).map((slug) => getBook(slug))
}

export function getChapter(slug, chapterId) {
  const book = getBook(slug)
  const id = Number(chapterId)
  return book.chapters.find((ch) => ch.id === id) ?? null
}

export function getCharacter(slug, characterId) {
  const book = getBook(slug)
  const character = book.characters.find((c) => c.id === characterId)
    ?? book.knownCharacters?.find((c) => c.id === characterId)
    ?? null

  if (!character) return null

  const annotations = findContentFile(slug, '-annotations')
  const annotation = getAnnotation(slug, 'character', characterId, annotations)

  return { ...character, annotation }
}

export function getLocation(slug, locationId) {
  const book = getBook(slug)
  return book.locations.find((l) => l.id === locationId)
    ?? book.knownLocations?.find((l) => l.id === locationId)
    ?? null
}

export function getFaction(slug, factionId) {
  const book = getBook(slug)
  return book.factions.find((f) => f.id === factionId)
    ?? book.knownFactions?.find((f) => f.id === factionId)
    ?? null
}
