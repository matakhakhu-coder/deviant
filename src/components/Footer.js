// Footer — platform attribution + per-book author credits.

export function render(books = []) {
  const credits = books.map((b) => `${b.title} by ${b.author}`).join(' &middot; ')

  return `
    <footer class="border-t border-dv-rune mt-16">
      <div class="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-dv-fog font-body">
        <p>A DEVIANT Platform &mdash; The Mythology Engine</p>
        <p>${credits}</p>
      </div>
    </footer>
  `
}

export function init() {}
