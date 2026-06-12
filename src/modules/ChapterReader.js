// ChapterReader — full chapter text in a centered reading column. Route: /books/:slug/chapters/:id
// Cross-link engine (Phase 6) will pass chapter text through linker.linkChapterText() —
// for now the text is rendered as plain escaped paragraphs.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function renderParagraphs(text) {
  return text
    .split(/\n\n+/)
    .map((para) => para.trim())
    .filter(Boolean)
    .map((para) => `<p class="mb-4 leading-relaxed">${escapeHtml(para.replace(/\n/g, ' '))}</p>`)
    .join('')
}

function povBadge(book, chapter) {
  if (chapter.ensemble) {
    return `<span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-gold">Ensemble</span>`
  }

  const character = book.characters?.find((c) => c.id === chapter.pov)
  const name = character?.name ?? 'TBC'
  return `<span class="text-xs font-mono px-2 py-1 rounded bg-dv-surface text-dv-crimson">${name}</span>`
}

function navLink(book, chapter, label) {
  if (!chapter) {
    return `<span class="min-h-[48px] inline-flex items-center px-4 text-dv-fog font-mono text-sm">${label}</span>`
  }

  return `
    <a href="/books/${book.slug}/chapters/${chapter.id}" data-link class="min-h-[48px] inline-flex items-center px-4 text-dv-ash hover:text-dv-gold transition-colors font-mono text-sm">
      ${label}
    </a>
  `
}

export function render(book, chapter) {
  const index = book.chapters.findIndex((ch) => ch.id === chapter.id)
  const prev = index > 0 ? book.chapters[index - 1] : null
  const next = index < book.chapters.length - 1 ? book.chapters[index + 1] : null

  const body = chapter.contentMissing
    ? `<p class="text-dv-fog italic">This chapter's text is not yet available in the source manuscript.</p>`
    : renderParagraphs(chapter.text)

  return `
    <section class="max-w-[680px] mx-auto px-4 py-12">
      <a href="/books/${book.slug}/chapters" data-link class="text-sm text-dv-ash hover:text-dv-gold transition-colors">&larr; All chapters</a>

      <header class="mt-4">
        <p class="font-mono text-dv-fog text-sm">Chapter ${chapter.id}</p>
        <h1 class="font-display text-3xl md:text-4xl text-dv-gold mt-1">${chapter.title}</h1>
        <div class="mt-3">${povBadge(book, chapter)}</div>
      </header>

      <article class="mt-8 font-body text-dv-ghost">
        ${body}
      </article>

      <nav class="flex items-center justify-between mt-12 border-t border-dv-rune pt-4">
        ${navLink(book, prev, '&larr; Previous')}
        ${navLink(book, next, 'Next &rarr;')}
      </nav>
    </section>
  `
}

export function init(slug, chapterId) {
  const key = `dv_progress_${slug}`
  const id = String(chapterId)

  let progress = {}
  try {
    progress = JSON.parse(localStorage.getItem(key)) ?? {}
  } catch {
    progress = {}
  }

  progress[id] = { ...progress[id], read: true, position: 0 }
  localStorage.setItem(key, JSON.stringify(progress))

  document.dispatchEvent(new CustomEvent('dv:chapterLoaded', { detail: { slug, chapterId: Number(chapterId) } }))
}
