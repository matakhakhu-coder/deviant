import './style.css'
import { resolveRoute, resolveCustomerView, navigate } from './core/router.js'
import { getAllBooks, getBook } from './core/bookLoader.js'
import { DEVIANT } from './core/manifest.js'
import * as Navbar from './components/Navbar.js'
import * as Footer from './components/Footer.js'
import * as BookshelfView from './modules/BookshelfView.js'
import * as BookDetailView from './modules/BookDetailView.js'

const app = document.getElementById('app')

function pendingView({ label, phase }) {
  return `
    <main class="max-w-5xl mx-auto px-4 py-24 text-center">
      <h1 class="font-display text-3xl text-dv-gold">${label ?? 'Page'}</h1>
      <p class="mt-2 text-dv-ash font-mono">TBC &mdash; arrives in Phase ${phase ?? '?'}</p>
      <a href="/" data-link class="inline-flex items-center justify-center mt-6 min-h-[48px] px-4 text-dv-ash hover:text-dv-gold transition-colors">&larr; Back to bookshelf</a>
    </main>
  `
}

function notFoundView() {
  return `
    <main class="max-w-5xl mx-auto px-4 py-24 text-center">
      <h1 class="font-display text-3xl text-dv-crimson">404</h1>
      <p class="mt-2 text-dv-ash">This page doesn't exist.</p>
      <a href="/" data-link class="inline-flex items-center justify-center mt-6 min-h-[48px] px-4 text-dv-ash hover:text-dv-gold transition-colors">&larr; Back to bookshelf</a>
    </main>
  `
}

/**
 * Customer-facing render path: Navbar + page content + Footer.
 * Sub-routes: bookshelf (/, /books), book-detail (/books/:slug),
 * pending placeholders for Phases 3-7, 404 for anything else.
 */
function mountCustomer(params) {
  const books = getAllBooks()
  const { view, params: viewParams } = resolveCustomerView(params.pathname)

  let content
  switch (view) {
    case 'bookshelf':
      content = BookshelfView.render(books)
      break
    case 'book-detail': {
      content = DEVIANT.books[viewParams.slug]
        ? BookDetailView.render(getBook(viewParams.slug))
        : notFoundView()
      break
    }
    case 'pending':
      content = pendingView(viewParams)
      break
    default:
      content = notFoundView()
  }

  app.innerHTML = Navbar.render() + content + Footer.render(books)

  Navbar.init()
  Footer.init()
  if (view === 'bookshelf') BookshelfView.init()
  if (view === 'book-detail') BookDetailView.init()
}

/**
 * Reader render path: ?book=slug&ch=N
 * Phase 0: minimal scaffold — ChapterReader arrives in Phase 3.
 */
function mountReader(params) {
  const html = `
    <main class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 class="font-display text-3xl text-dv-gold">Reader</h1>
      <p class="mt-2 text-dv-ash">book: ${params.book ?? 'TBC'} — chapter: ${params.chapter ?? 'TBC'}</p>
    </main>
  `

  app.innerHTML = html
}

/**
 * Admin render path: /admin
 * Phase 0: minimal scaffold — AdminShell arrives in later phase.
 * Admin modules must never be imported into customer/reader paths.
 */
function mountAdmin() {
  const html = `
    <main class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 class="font-display text-3xl text-dv-crimson">DEVIANT Admin</h1>
      <p class="mt-2 text-dv-ash font-mono">TBC — AdminShell</p>
    </main>
  `

  app.innerHTML = html
}

function render() {
  const route = resolveRoute(window.location)

  switch (route.path) {
    case 'admin':
      mountAdmin()
      break
    case 'reader':
      mountReader(route.params)
      break
    default:
      mountCustomer(route.params)
  }

  window.scrollTo(0, 0)
}

// Delegated click handler for internal links — keeps SPA navigation working
// without binding per-render listeners on every <a data-link>.
app.addEventListener('click', (event) => {
  const link = event.target.closest('a[data-link]')
  if (!link) return

  event.preventDefault()
  navigate(link.getAttribute('href'))
})

document.addEventListener('dv:navigate', render)
window.addEventListener('popstate', render)

render()
