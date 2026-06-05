import { SHAPE_PRESETS, ICON_PRESETS } from '../presets'
import type { ShapeKind } from '../types'

interface PaletteProps {
  onAddShape: (kind: ShapeKind) => void
  onAddIcon: (glyph: string) => void
}

/**
 * Left-hand palette. Items can be clicked (drop at canvas center) or dragged
 * onto the canvas. Drag data is read back in App's onDrop handler.
 */
export default function Palette({ onAddShape, onAddIcon }: PaletteProps): JSX.Element {
  return (
    <aside className="palette">
      <h2 className="palette-title">Shapes</h2>
      <div className="palette-grid">
        {SHAPE_PRESETS.map((s) => (
          <button
            key={s.kind}
            className="palette-item"
            title={`Add ${s.label}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/storycraft-shape', s.kind)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onAddShape(s.kind)}
          >
            <ShapeGlyph kind={s.kind} />
            <span className="palette-item-label">{s.label}</span>
          </button>
        ))}
      </div>

      <h2 className="palette-title">Icons</h2>
      <div className="palette-icons">
        {ICON_PRESETS.map((i) => (
          <button
            key={i.name}
            className="palette-icon"
            title={`Add ${i.name}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/storycraft-icon', i.glyph)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onClick={() => onAddIcon(i.glyph)}
          >
            {i.glyph}
          </button>
        ))}
      </div>

      <p className="palette-hint">Tip: drag items onto the canvas, or click to drop at center.</p>
    </aside>
  )
}

/** Tiny preview of each shape for the palette buttons. */
function ShapeGlyph({ kind }: { kind: ShapeKind }): JSX.Element {
  const base: React.CSSProperties = {
    width: 26,
    height: 20,
    background: 'linear-gradient(135deg,#38bdf8,#6366f1)',
    border: '1px solid #93c5fd'
  }
  const clip: Partial<Record<ShapeKind, string>> = {
    diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    parallelogram: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
  }
  const style: React.CSSProperties = { ...base }
  if (clip[kind]) style.clipPath = clip[kind]
  if (kind === 'ellipse') style.borderRadius = '50%'
  if (kind === 'rounded') style.borderRadius = '6px'
  if (kind === 'cylinder') style.borderRadius = '50% / 5px'
  if (kind === 'cloud') style.borderRadius = '50%'
  return <span style={style} />
}
