import './style.css'
import { resolveRoute, navigate } from './core/router.js'
import { getAllBooks } from './core/bookLoader.js'
import { DEVIANT } from './core/manifest.js'

const app = document.getElementById('app')

/**
 * Customer-facing render path: full landing + encyclopedia + atlas.
 * Phase 0: minimal landing scaffold only — full modules arrive in Phase 2+.
 */
function mountCustomer(params) {
  const books = getAllBooks()

  const html = `
    <main class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 class="font-display text-4xl md:text-6xl text-dv-gold tracking-wide">${DEVIANT.platform.name}</h1>
      <p class="mt-2 text-dv-ash font-body">${DEVIANT.platform.fullName}</p>
      <p class="mt-8 text-dv-ghost max-w-xl">
        ${books.length} book${books.length === 1 ? '' : 's'} loaded.
        ${books.map((b) => b.title).join(', ')}
      </p>
    </main>
  `

  app.innerHTML = html
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
}

document.addEventListener('dv:navigate', render)
window.addEventListener('popstate', render)

render()
