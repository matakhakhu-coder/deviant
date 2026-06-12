// BookshelfView — all books registered in DEVIANT.books. Route: / and /books

const PLACEHOLDER_COVER = `
  <svg viewBox="0 0 240 360" xmlns="http://www.w3.org/2000/svg" class="w-full h-64 object-cover rounded-t-lg">
    <rect width="240" height="360" fill="#1A1A24" />
    <rect x="0.5" y="0.5" width="239" height="359" fill="none" stroke="#3A3A4A" />
    <circle cx="120" cy="150" r="36" fill="none" stroke="#3A3A4A" stroke-width="2" />
    <path d="M120 114 L120 186 M88 150 L152 150" stroke="#3A3A4A" stroke-width="2" />
  </svg>
`

function renderCard(book) {
  const cover = book.coverImage
    ? `<img src="${book.coverImage}" alt="${book.title} cover" class="w-full h-64 object-cover rounded-t-lg" />`
    : PLACEHOLDER_COVER

  const synopsis = book.synopsis ?? 'TBC'

  return `
    <article class="bg-dv-obsidian border border-dv-rune rounded-lg overflow-hidden flex flex-col">
      ${cover}
      <div class="p-5 flex flex-col gap-2 flex-1">
        <h2 class="font-display text-xl text-dv-ghost">${book.title}</h2>
        <p class="text-sm text-dv-ash">by ${book.author}</p>
        <p class="text-sm text-dv-fog line-clamp-3">${synopsis}</p>
        <div class="flex gap-2 mt-1">
          <span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-gold">${book.totalChapters ?? book.chapters?.length ?? 0} chapters</span>
          <span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-faction">${book.knownCharacters?.length ?? book.characters?.length ?? 0} characters</span>
        </div>
        <div class="mt-auto pt-4">
          <a href="/books/${book.slug}" data-link class="inline-flex items-center justify-center w-full min-h-[48px] rounded-md bg-dv-crimson hover:bg-dv-crimson-lit text-dv-ghost font-body font-medium transition-colors">
            Enter
          </a>
        </div>
      </div>
    </article>
  `
}

export function render(books) {
  return `
    <section class="max-w-5xl mx-auto px-4 py-12">
      <h1 class="font-display text-4xl md:text-6xl text-dv-gold tracking-wide text-center">DEVIANT</h1>
      <p class="mt-2 text-center text-dv-ash font-body">The Mythology Engine</p>

      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${books.map(renderCard).join('')}
      </div>
    </section>
  `
}

export function init() {}
