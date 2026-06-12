// BookDetailView — book hero, quick stats, navigation grid. Route: /books/:slug

const PLACEHOLDER_COVER = `
  <svg viewBox="0 0 240 360" xmlns="http://www.w3.org/2000/svg" class="w-full rounded-lg">
    <rect width="240" height="360" fill="#1A1A24" />
    <rect x="0.5" y="0.5" width="239" height="359" fill="none" stroke="#3A3A4A" />
    <circle cx="120" cy="150" r="36" fill="none" stroke="#3A3A4A" stroke-width="2" />
    <path d="M120 114 L120 186 M88 150 L152 150" stroke="#3A3A4A" stroke-width="2" />
  </svg>
`

function statCard(label, value) {
  return `
    <div class="bg-dv-obsidian border border-dv-rune rounded-lg p-4 text-center">
      <p class="font-display text-2xl text-dv-gold">${value}</p>
      <p class="text-xs uppercase tracking-wide text-dv-fog mt-1">${label}</p>
    </div>
  `
}

function navCard(href, title, description) {
  return `
    <a href="${href}" data-link class="block bg-dv-obsidian border border-dv-rune rounded-lg p-5 hover:border-dv-gold-dim transition-colors min-h-[48px]">
      <h3 class="font-display text-lg text-dv-ghost">${title}</h3>
      <p class="text-sm text-dv-ash mt-1">${description}</p>
    </a>
  `
}

export function render(book) {
  const cover = book.coverImage
    ? `<img src="${book.coverImage}" alt="${book.title} cover" class="w-full rounded-lg" />`
    : PLACEHOLDER_COVER

  const chapterCount = book.chapters?.length ?? book.totalChapters ?? 0
  const characterCount = book.characters?.length ?? book.knownCharacters?.length ?? 0
  const locationCount = book.locations?.length ?? book.knownLocations?.length ?? 0
  const factionCount = book.factions?.length ?? book.knownFactions?.length ?? 0

  return `
    <section class="max-w-5xl mx-auto px-4 py-12">
      <a href="/books" data-link class="text-sm text-dv-ash hover:text-dv-gold transition-colors">&larr; All books</a>

      <div class="mt-6 flex flex-col md:flex-row gap-8 items-start">
        <div class="w-full md:w-64 flex-shrink-0">${cover}</div>
        <div class="flex-1">
          <h1 class="font-display text-3xl md:text-5xl text-dv-gold">${book.title}</h1>
          <p class="text-dv-ash mt-1">by ${book.author}</p>
          <p class="text-dv-ghost mt-4 max-w-2xl">${book.synopsis ?? 'TBC'}</p>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 max-w-md">
            ${statCard('Chapters', chapterCount)}
            ${statCard('Characters', characterCount)}
            ${statCard('Locations', locationCount)}
            ${statCard('Factions', factionCount)}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
        ${navCard(`/books/${book.slug}/chapters`, 'Read Chapters', `${chapterCount} chapters &mdash; browse by POV character`)}
        ${navCard(`/books/${book.slug}/characters`, 'Characters', `${characterCount} character profiles`)}
        ${navCard(`/books/${book.slug}/world`, 'World Atlas', `${locationCount} locations &middot; ${factionCount} factions`)}
      </div>
    </section>
  `
}

export function init() {}
