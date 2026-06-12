// Search adapter — client-side fuse.js (sim) -> Algolia/Typesense (live).
// Live path graduation: set FLAGS.searchExternal = true and implement the
// remote query branch below against DEVIANT.integrations.search.

import Fuse from 'fuse.js'
import { FLAGS } from '../flags.js'

const FUSE_OPTIONS = {
  keys: ['name', 'title', 'text'],
  threshold: 0.35,
  ignoreLocation: true,
}

/**
 * @param {Array<object>} items - searchable records (chapters, characters, locations, factions)
 * @param {string} query
 * @returns {Array<object>}
 */
export function search(items, query) {
  if (!query) return []

  if (FLAGS.searchExternal) {
    // TBC — external search provider not yet configured (DEVIANT.integrations.search).
    // Falls through to client-side search until graduated.
  }

  const fuse = new Fuse(items, FUSE_OPTIONS)
  return fuse.search(query).map((result) => result.item)
}
