// Annotation adapter — Claude API enrichment (sim -> live).
// Live path (Phase 9): reads content/[slug]-annotations.json, produced offline by
// scripts/annotate.js, merged into the book object by bookLoader.js.
// Simulation path: returns null so callers render placeholder lore copy.

import { FLAGS } from '../flags.js'

/**
 * @param {string} slug - book slug
 * @param {string} entityType - 'character' | 'chapter' | 'location' | 'faction'
 * @param {string} entityId
 * @param {object} annotationsData - parsed content/[slug]-annotations.json, or null
 * @returns {object|null} annotation entry, or null if unavailable/simulated
 */
export function getAnnotation(slug, entityType, entityId, annotationsData) {
  if (FLAGS.annotationsSimulated) return null
  if (!annotationsData) return null

  const bucket = annotationsData[entityType]
  if (!bucket) return null

  return bucket[entityId] ?? null
}
