// CharacterProfile — bio, appearances, connections. Route: /books/:slug/characters/:id
//
// Data deficits (flagged, null-safe fallbacks applied):
// - No prose-extracted character descriptions exist in content/[slug].json yet, so the
//   description section renders the Claude annotation when available, or an atmospheric
//   sim-mode placeholder styled to match the dark aesthetic.
// - No faction-membership field exists per character, so the faction section is omitted
//   entirely rather than rendering an empty/TBC badge.

import * as EntityBadge from '../components/EntityBadge.js'

const AVATAR_PLACEHOLDER = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-24 h-24 rounded-full flex-shrink-0">
    <rect width="100" height="100" fill="#1A1A24" />
    <circle cx="50" cy="38" r="18" fill="none" stroke="#3A3A4A" stroke-width="2" />
    <path d="M18 88 a32 32 0 0 1 64 0" fill="none" stroke="#3A3A4A" stroke-width="2" />
  </svg>
`

function bucketRole(character) {
  return character.povChapters?.length ? 'POV Character' : 'Supporting'
}

function chapterChip(book, slug, chapterId, highlighted) {
  const chapter = book.chapters.find((ch) => ch.id === chapterId)
  const title = chapter?.title ?? `Chapter ${chapterId}`
  const cls = highlighted
    ? 'bg-dv-crimson text-dv-ghost'
    : 'bg-dv-surface text-dv-ash'

  return `
    <a href="/books/${slug}/chapters/${chapterId}" data-link class="inline-flex items-center min-h-[48px] px-3 rounded-md font-mono text-sm ${cls} hover:opacity-80 transition-opacity">
      Ch.${chapterId} &middot; ${title}
    </a>
  `
}

function connectionLink(book, character) {
  return `
    <a href="/books/${book.slug}/characters/${character.id}" data-link class="inline-flex items-center min-h-[48px] px-3 rounded-md font-body text-sm bg-dv-obsidian border border-dv-rune text-dv-ghost hover:border-dv-gold-dim transition-colors">
      ${character.name}
    </a>
  `
}

/**
 * Co-occurrence connections: other characters sharing the most chapters with this one.
 */
function findConnections(book, character) {
  const myChapters = new Set(character.appearances ?? [])

  return (book.characters ?? [])
    .filter((c) => c.id !== character.id)
    .map((c) => ({
      character: c,
      shared: (c.appearances ?? []).filter((ch) => myChapters.has(ch)).length,
    }))
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 5)
}

function annotationSection(character) {
  if (character.annotation?.description) {
    return `
      <section class="mt-8">
        <h2 class="font-display text-xl text-dv-gold">Lore</h2>
        <p class="mt-2 text-dv-ghost leading-relaxed">${character.annotation.description}</p>
      </section>
    `
  }

  return `
    <section class="mt-8">
      <h2 class="font-display text-xl text-dv-gold">Lore</h2>
      <p class="mt-2 text-dv-fog italic">
        The chronicles have not yet been transcribed for ${character.name}. This entry awaits
        annotation by the mythology engine.
      </p>
    </section>
  `
}

export function render(book, character) {
  const role = bucketRole(character)
  const povChapters = character.povChapters ?? []
  const appearances = character.appearances ?? []
  const connections = findConnections(book, character)

  return `
    <section class="max-w-3xl mx-auto px-4 py-12">
      <a href="/books/${book.slug}/characters" data-link class="text-sm text-dv-ash hover:text-dv-gold transition-colors">&larr; Characters</a>

      <header class="flex items-center gap-4 mt-4">
        ${AVATAR_PLACEHOLDER}
        <div class="min-w-0">
          <h1 class="font-display text-3xl md:text-4xl text-dv-gold truncate">${character.name}</h1>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            ${EntityBadge.render('character', role, 'md')}
            ${character.aliases?.length ? `<span class="text-sm text-dv-ash">aka ${character.aliases.join(', ')}</span>` : ''}
          </div>
        </div>
      </header>

      ${annotationSection(character)}

      ${povChapters.length ? `
        <section class="mt-8">
          <h2 class="font-display text-xl text-dv-gold">POV Chapters</h2>
          <div class="flex flex-wrap gap-2 mt-3">
            ${povChapters.map((id) => chapterChip(book, book.slug, id, true)).join('')}
          </div>
        </section>
      ` : ''}

      ${appearances.length ? `
        <section class="mt-8">
          <h2 class="font-display text-xl text-dv-gold">Appearances</h2>
          <div class="flex flex-wrap gap-2 mt-3">
            ${appearances.map((id) => chapterChip(book, book.slug, id, povChapters.includes(id))).join('')}
          </div>
        </section>
      ` : ''}

      ${connections.length ? `
        <section class="mt-8">
          <h2 class="font-display text-xl text-dv-gold">Connections</h2>
          <div class="flex flex-wrap gap-2 mt-3">
            ${connections.map((entry) => connectionLink(book, entry.character)).join('')}
          </div>
        </section>
      ` : ''}
    </section>
  `
}

export function init() {}
