// CharacterEncyclopedia — grid of all characters. Route: /books/:slug/characters
//
// Data deficit: parsed character entries have no canonical "protagonist/antagonist/
// supporting" category (the `role` field is freeform prose for some entries, e.g. Loki).
// Bucketing is derived instead from `povChapters.length`: any character with POV
// chapters is "POV Character", everything else is "Supporting".

import * as EntityBadge from '../components/EntityBadge.js'

const AVATAR_PLACEHOLDER = `
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 rounded-full">
    <rect width="100" height="100" fill="#1A1A24" />
    <circle cx="50" cy="38" r="18" fill="none" stroke="#3A3A4A" stroke-width="2" />
    <path d="M18 88 a32 32 0 0 1 64 0" fill="none" stroke="#3A3A4A" stroke-width="2" />
  </svg>
`

function bucketFor(character) {
  return character.povChapters?.length ? 'pov' : 'supporting'
}

function characterCard(book, character) {
  const bucket = bucketFor(character)
  const roleLabel = bucket === 'pov' ? 'POV Character' : 'Supporting'
  const povCount = character.povChapters?.length ?? 0

  return `
    <a
      href="/books/${book.slug}/characters/${character.id}"
      data-link
      data-role="${bucket}"
      class="dv-character-card flex items-center gap-4 bg-dv-obsidian border border-dv-rune rounded-lg p-4 min-h-[48px] hover:border-dv-gold-dim transition-colors"
    >
      ${AVATAR_PLACEHOLDER}
      <div class="min-w-0">
        <h3 class="font-display text-lg text-dv-ghost truncate">${character.name}</h3>
        <div class="flex flex-wrap items-center gap-2 mt-1">
          ${EntityBadge.render('character', roleLabel, 'sm')}
          ${povCount ? `<span class="text-xs text-dv-ash">${povCount} POV chapter${povCount === 1 ? '' : 's'}</span>` : ''}
        </div>
      </div>
    </a>
  `
}

function filterPill(id, label) {
  return `
    <button
      type="button"
      data-role-filter="${id}"
      class="dv-role-pill inline-flex items-center justify-center min-h-[48px] px-4 rounded-md border border-dv-rune text-sm font-body text-dv-ash hover:text-dv-ghost hover:border-dv-gold-dim transition-colors"
    >
      ${label}
    </button>
  `
}

export function render(book) {
  const characters = book.characters ?? []

  return `
    <section class="max-w-3xl mx-auto px-4 py-12">
      <a href="/books/${book.slug}" data-link class="text-sm text-dv-ash hover:text-dv-gold transition-colors">&larr; ${book.title}</a>

      <h1 class="font-display text-3xl md:text-4xl text-dv-gold mt-4">Characters</h1>

      <div class="flex flex-wrap gap-2 mt-6">
        ${filterPill('all', 'All')}
        ${filterPill('pov', 'POV Characters')}
        ${filterPill('supporting', 'Supporting')}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        ${characters.map((c) => characterCard(book, c)).join('')}
      </div>
    </section>
  `
}

export function init() {
  const pills = document.querySelectorAll('.dv-role-pill')
  const cards = document.querySelectorAll('.dv-character-card')

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const target = pill.dataset.roleFilter

      pills.forEach((p) => p.classList.toggle('border-dv-gold-dim', p === pill))
      pills.forEach((p) => p.classList.toggle('text-dv-ghost', p === pill))

      cards.forEach((card) => {
        const show = target === 'all' || card.dataset.role === target
        card.classList.toggle('hidden', !show)
      })
    })
  })
}
