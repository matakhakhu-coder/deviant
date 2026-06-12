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
