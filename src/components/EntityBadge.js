// EntityBadge — inline colored badge for entity type. Pure render, no init needed.

const COLORS = {
  character: 'bg-dv-surface text-dv-crimson',
  location: 'bg-dv-surface text-dv-gold',
  faction: 'bg-dv-surface text-dv-faction',
}

const SIZES = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
}

/**
 * @param {string} type - 'character' | 'location' | 'faction'
 * @param {string} label - badge text
 * @param {'sm'|'md'|'lg'} [size]
 */
export function render(type, label, size = 'md') {
  const color = COLORS[type] ?? COLORS.character
  const sizing = SIZES[size] ?? SIZES.md

  return `<span class="inline-flex items-center font-mono rounded ${color} ${sizing}">${label}</span>`
}
