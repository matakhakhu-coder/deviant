// ChapterBrowser — chapter list with POV filter pills. Route: /books/:slug/chapters

function povBadge(book, chapter) {
  if (chapter.ensemble) {
    return `<span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-gold">Ensemble</span>`
  }

  const character = book.characters?.find((c) => c.id === chapter.pov)
  const name = character?.name ?? 'TBC'
  return `<span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-crimson">${name}</span>`
}

function chapterRow(book, chapter) {
  const pov = chapter.ensemble ? 'ensemble' : (chapter.pov ?? 'none')
  const meta = chapter.contentMissing
    ? `<span class="text-dv-fog">Content pending</span>`
    : `${chapter.wordCount} words &middot; ${chapter.readingTime} min read`

  return `
    <a
      href="/books/${book.slug}/chapters/${chapter.id}"
      data-link
      data-pov="${pov}"
      class="dv-chapter-row flex items-center justify-between gap-4 bg-dv-obsidian border border-dv-rune rounded-lg px-4 py-3 min-h-[48px] hover:border-dv-gold-dim transition-colors"
    >
      <div class="flex items-center gap-3 min-w-0">
        <span class="font-mono text-dv-fog text-sm w-8 flex-shrink-0">${String(chapter.id).padStart(2, '0')}</span>
        <span class="font-display text-dv-ghost truncate">${chapter.title}</span>
      </div>
      <div class="flex items-center gap-3 flex-shrink-0">
        <span class="text-xs text-dv-ash hidden sm:inline">${meta}</span>
        ${povBadge(book, chapter)}
      </div>
    </a>
  `
}

function filterPill(id, label) {
  return `
    <button
      type="button"
      data-pov-filter="${id}"
      class="dv-pov-pill inline-flex items-center justify-center min-h-[48px] px-4 rounded-md border border-dv-rune text-sm font-body text-dv-ash hover:text-dv-ghost hover:border-dv-gold-dim transition-colors"
    >
      ${label}
    </button>
  `
}

export function render(book) {
  const povCharacters = (book.characters ?? []).filter((c) => c.povChapters?.length)

  return `
    <section class="max-w-3xl mx-auto px-4 py-12">
      <a href="/books/${book.slug}" data-link class="text-sm text-dv-ash hover:text-dv-gold transition-colors">&larr; ${book.title}</a>

      <h1 class="font-display text-3xl md:text-4xl text-dv-gold mt-4">Chapters</h1>

      <div class="flex flex-wrap gap-2 mt-6">
        ${filterPill('all', 'All')}
        ${povCharacters.map((c) => filterPill(c.id, c.name)).join('')}
        ${filterPill('ensemble', 'Ensemble')}
      </div>

      <div class="flex flex-col gap-2 mt-6">
        ${book.chapters.map((ch) => chapterRow(book, ch)).join('')}
      </div>
    </section>
  `
}

export function init() {
  const pills = document.querySelectorAll('.dv-pov-pill')
  const rows = document.querySelectorAll('.dv-chapter-row')

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const target = pill.dataset.povFilter

      pills.forEach((p) => p.classList.toggle('border-dv-gold-dim', p === pill))
      pills.forEach((p) => p.classList.toggle('text-dv-ghost', p === pill))

      rows.forEach((row) => {
        const show = target === 'all' || row.dataset.pov === target
        row.classList.toggle('hidden', !show)
      })
    })
  })
}
