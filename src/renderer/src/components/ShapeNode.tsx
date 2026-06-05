import { memo } from 'react'
import { Handle, Position, NodeResizer, type NodeProps } from '@xyflow/react'
import type { ShapeKind, ShapeNodeData } from '../types'

/**
 * CSS clip-path for each shape. The element itself is a sized box; the clip-path
 * carves it into the desired silhouette. `rectangle`/`rounded`/`ellipse`/
 * `cylinder`/`cloud` are handled separately because they need border-radius or
 * extra structure rather than a polygon clip.
 */
const CLIP_PATHS: Partial<Record<ShapeKind, string>> = {
  diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
  parallelogram: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
}

function borderRadiusFor(shape: ShapeKind): string {
  if (shape === 'ellipse') return '50%'
  if (shape === 'rounded') return '14px'
  if (shape === 'cylinder') return '50% / 16px'
  return '0'
}

const HANDLE_STYLE = {
  width: 9,
  height: 9,
  background: '#38bdf8',
  border: '1px solid #0f1117'
}

function ShapeNodeComponent({ data, selected }: NodeProps): JSX.Element {
  const d = data as ShapeNodeData
  const clip = CLIP_PATHS[d.shape]
  const isCloud = d.shape === 'cloud'

  const shapeStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: d.fill,
    border: `${d.strokeWidth}px solid ${d.stroke}`,
    borderRadius: borderRadiusFor(d.shape),
    clipPath: clip,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden'
  }

  // Clouds: simulate with a rounded blob + pseudo bumps via radial layering.
  if (isCloud) {
    shapeStyle.borderRadius = '50%'
    shapeStyle.boxShadow = `inset 0 0 0 ${d.strokeWidth}px ${d.stroke}`
    shapeStyle.border = 'none'
  }

  return (
    <div style={{ width: d.width, height: d.height, position: 'relative' }}>
      <NodeResizer
        isVisible={selected}
        minWidth={48}
        minHeight={36}
        lineStyle={{ borderColor: '#38bdf8' }}
        handleStyle={{ width: 8, height: 8, background: '#38bdf8' }}
      />

      {/* Four connection handles, each acting as both source and target so the
          user can connect nodes in any direction they like. */}
      <Handle id="t" type="source" position={Position.Top} style={HANDLE_STYLE} />
      <Handle id="r" type="source" position={Position.Right} style={HANDLE_STYLE} />
      <Handle id="b" type="source" position={Position.Bottom} style={HANDLE_STYLE} />
      <Handle id="l" type="source" position={Position.Left} style={HANDLE_STYLE} />
      <Handle id="tt" type="target" position={Position.Top} style={{ ...HANDLE_STYLE, opacity: 0 }} />
      <Handle id="rt" type="target" position={Position.Right} style={{ ...HANDLE_STYLE, opacity: 0 }} />
      <Handle id="bt" type="target" position={Position.Bottom} style={{ ...HANDLE_STYLE, opacity: 0 }} />
      <Handle id="lt" type="target" position={Position.Left} style={{ ...HANDLE_STYLE, opacity: 0 }} />

      <div style={shapeStyle}>
        {d.icon ? (
          <span style={{ fontSize: Math.max(16, d.fontSize + 6), lineHeight: 1 }}>{d.icon}</span>
        ) : null}
        {d.label ? (
          <span
            className="shape-label"
            style={{
              color: d.textColor,
              fontSize: d.fontSize,
              padding: '0 6px',
              textAlign: 'center',
              maxWidth: '100%',
              wordBreak: 'break-word'
            }}
          >
            {d.label}
          </span>
        ) : null}
      </div>
    </div>
  )
}

export default memo(ShapeNodeComponent)
