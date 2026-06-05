import type { ShapeKind } from './types'

export interface ShapePreset {
  kind: ShapeKind
  label: string
}

/** The palette of shapes the user can drop onto the canvas. */
export const SHAPE_PRESETS: ShapePreset[] = [
  { kind: 'rectangle', label: 'Rectangle' },
  { kind: 'rounded', label: 'Rounded' },
  { kind: 'ellipse', label: 'Ellipse' },
  { kind: 'diamond', label: 'Diamond' },
  { kind: 'triangle', label: 'Triangle' },
  { kind: 'hexagon', label: 'Hexagon' },
  { kind: 'parallelogram', label: 'Parallelogram' },
  { kind: 'star', label: 'Star' },
  { kind: 'cylinder', label: 'Cylinder' },
  { kind: 'cloud', label: 'Cloud' }
]

/** Worldbuilding-themed icons (emoji glyphs render without any assets/fonts). */
export const ICON_PRESETS: { glyph: string; name: string }[] = [
  { glyph: '🏰', name: 'Castle' },
  { glyph: '🗺️', name: 'Map' },
  { glyph: '⚔️', name: 'War' },
  { glyph: '👑', name: 'Crown' },
  { glyph: '🐉', name: 'Dragon' },
  { glyph: '🧙', name: 'Mage' },
  { glyph: '🛡️', name: 'Shield' },
  { glyph: '🏔️', name: 'Mountain' },
  { glyph: '🌋', name: 'Volcano' },
  { glyph: '🌲', name: 'Forest' },
  { glyph: '🏝️', name: 'Island' },
  { glyph: '⚓', name: 'Harbor' },
  { glyph: '🏘️', name: 'Village' },
  { glyph: '⛪', name: 'Temple' },
  { glyph: '💰', name: 'Treasure' },
  { glyph: '📜', name: 'Lore' },
  { glyph: '🔮', name: 'Magic' },
  { glyph: '⭐', name: 'Star' },
  { glyph: '🗝️', name: 'Key' },
  { glyph: '☠️', name: 'Danger' }
]

/** A pleasant default color palette for quick fills/strokes. */
export const COLOR_SWATCHES: string[] = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
  '#f43f5e',
  '#ffffff',
  '#94a3b8',
  '#475569',
  '#0f172a'
]
