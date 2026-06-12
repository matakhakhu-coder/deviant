// Navbar — logo + primary nav (Books, Search). Dark theme, mobile hamburger.
// Book-specific links (Characters, World) live on BookDetailView, not here —
// the navbar must not hard-code a book slug.

export function render() {
  return `
    <header class="sticky top-0 z-40 bg-dv-obsidian border-b border-dv-rune">
      <nav class="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        <a href="/" data-link class="font-display text-xl text-dv-gold tracking-widest">DEVIANT</a>

        <div class="hidden md:flex items-center gap-6 font-body text-dv-ash">
          <a href="/books" data-link class="hover:text-dv-ghost transition-colors">Books</a>
          <a href="/search" data-link class="hover:text-dv-ghost transition-colors">Search</a>
        </div>

        <button
          id="dv-nav-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded="false"
          class="md:hidden inline-flex items-center justify-center w-12 h-12 text-dv-ghost"
        >
          <span class="font-mono text-2xl">&#9776;</span>
        </button>
      </nav>

      <div id="dv-nav-mobile" class="hidden md:hidden border-t border-dv-rune px-4 py-2 flex flex-col font-body text-dv-ash">
        <a href="/books" data-link class="min-h-[48px] flex items-center hover:text-dv-ghost transition-colors">Books</a>
        <a href="/search" data-link class="min-h-[48px] flex items-center hover:text-dv-ghost transition-colors">Search</a>
      </div>
    </header>
  `
}

export function init() {
  const toggle = document.getElementById('dv-nav-toggle')
  const mobile = document.getElementById('dv-nav-mobile')

  toggle?.addEventListener('click', () => {
    const isHidden = mobile.classList.toggle('hidden')
    toggle.setAttribute('aria-expanded', String(!isHidden))
  })
}
