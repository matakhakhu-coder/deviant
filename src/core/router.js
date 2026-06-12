// router — URL parsing and render path selection.
// Three exclusive render paths:
//   /admin              -> 'admin'    (mountAdmin)
//   ?book=slug&ch=N     -> 'reader'   (mountReader)
//   everything else     -> 'customer' (mountCustomer)

/**
 * @param {Location} location - window.location
 * @returns {{ path: 'admin' | 'reader' | 'customer', params: object }}
 */
export function resolveRoute(location = window.location) {
  const pathname = location.pathname
  const search = new URLSearchParams(location.search)

  if (pathname.startsWith('/admin')) {
    return { path: 'admin', params: {} }
  }

  if (search.has('book')) {
    return {
      path: 'reader',
      params: {
        book: search.get('book'),
        chapter: search.get('ch'),
      },
    }
  }

  return { path: 'customer', params: { pathname, search } }
}

/**
 * Pushes a new URL onto the history stack and dispatches dv:navigate.
 * @param {string} url
 * @param {object} [detail]
 */
export function navigate(url, detail = {}) {
  window.history.pushState({}, '', url)
  document.dispatchEvent(new CustomEvent('dv:navigate', { detail: { url, ...detail } }))
}

/**
 * Resolves a pathname within the customer render path into a view + params.
 * Routes implemented so far: bookshelf (/, /books), book-detail (/books/:slug).
 * Deeper routes (/books/:slug/chapters|characters|world, /search) are
 * recognized but rendered as "pending phase" placeholders until their
 * modules land in later phases.
 *
 * @param {string} pathname
 * @returns {{ view: string, params: object }}
 */
export function resolveCustomerView(pathname) {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0 || (segments.length === 1 && segments[0] === 'books')) {
    return { view: 'bookshelf', params: {} }
  }

  if (segments[0] === 'search') {
    return { view: 'pending', params: { label: 'Search', phase: 7 } }
  }

  if (segments[0] === 'books' && segments.length === 2) {
    return { view: 'book-detail', params: { slug: segments[1] } }
  }

  if (segments[0] === 'books' && segments.length >= 3) {
    const slug = segments[1]
    const section = segments[2]

    if (section === 'chapters') {
      if (segments.length === 3) {
        return { view: 'chapter-browser', params: { slug } }
      }
      if (segments.length === 4) {
        return { view: 'chapter-reader', params: { slug, chapterId: segments[3] } }
      }
    }

    if (section === 'characters') {
      if (segments.length === 3) {
        return { view: 'character-encyclopedia', params: { slug } }
      }
      if (segments.length === 4) {
        return { view: 'character-profile', params: { slug, characterId: segments[3] } }
      }
    }

    const phaseBySection = { world: 5 }
    const label = { world: 'World Atlas' }[section] ?? 'Page'
    return { view: 'pending', params: { label, phase: phaseBySection[section] ?? null, slug } }
  }

  return { view: 'not-found', params: {} }
}
