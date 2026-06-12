// Cross-link engine — Phase 6 will replace entity name mentions in chapter text
// with <a data-entity-id="..." data-entity-type="..."> tags for hover cards.
// Phase 0 stub: identity function. Returns chapter text unchanged.

/**
 * @param {string} text - raw chapter prose
 * @param {object} entityIndex - reverse-indexed entities for the book (unused in Phase 0)
 * @returns {string} HTML-safe text with entity mentions linked (identity for now)
 */
export function linkEntities(text, entityIndex = {}) {
  return text
}
