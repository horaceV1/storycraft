import { COLOR_SWATCHES, SHAPE_PRESETS } from '../presets'
import type { Edge } from '@xyflow/react'
import type { ShapeKind, ShapeNode, ShapeNodeData } from '../types'

interface InspectorProps {
  node: ShapeNode | null
  edge: Edge | null
  onUpdateNode: (id: string, patch: Partial<ShapeNodeData>) => void
  onUpdateEdge: (id: string, patch: Partial<Edge>) => void
  onDeleteSelection: () => void
}

const EDGE_TYPES = ['default', 'straight', 'step', 'smoothstep'] as const

export default function Inspector({
  node,
  edge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteSelection
}: InspectorProps): JSX.Element {
  if (!node && !edge) {
    return (
      <aside className="inspector">
        <div className="inspector-empty">
          <h2>Inspector</h2>
          <p>Select a shape or a connection to customize its appearance.</p>
        </div>
      </aside>
    )
  }

  return (
    <aside className="inspector">
      {node && <NodeInspector node={node} onUpdate={onUpdateNode} />}
      {edge && <EdgeInspector edge={edge} onUpdate={onUpdateEdge} />}
      <button className="btn btn-danger inspector-delete" onClick={onDeleteSelection}>
        Delete selection
      </button>
    </aside>
  )
}

function NodeInspector({
  node,
  onUpdate
}: {
  node: ShapeNode
  onUpdate: (id: string, patch: Partial<ShapeNodeData>) => void
}): JSX.Element {
  const d = node.data
  const set = (patch: Partial<ShapeNodeData>): void => onUpdate(node.id, patch)

  return (
    <div className="inspector-section">
      <h2>Shape</h2>

      <label className="field">
        <span>Label</span>
        <input
          type="text"
          value={d.label}
          onChange={(e) => set({ label: e.target.value })}
          placeholder="Name…"
        />
      </label>

      <label className="field">
        <span>Shape type</span>
        <select
          value={d.shape}
          onChange={(e) => set({ shape: e.target.value as ShapeKind })}
        >
          {SHAPE_PRESETS.map((s) => (
            <option key={s.kind} value={s.kind}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Icon</span>
        <input
          type="text"
          value={d.icon}
          maxLength={4}
          onChange={(e) => set({ icon: e.target.value })}
          placeholder="emoji…"
        />
      </label>

      <ColorField label="Fill" value={d.fill} onChange={(v) => set({ fill: v })} />
      <ColorField label="Border" value={d.stroke} onChange={(v) => set({ stroke: v })} />
      <ColorField label="Text" value={d.textColor} onChange={(v) => set({ textColor: v })} />

      <label className="field">
        <span>Border width: {d.strokeWidth}px</span>
        <input
          type="range"
          min={0}
          max={12}
          value={d.strokeWidth}
          onChange={(e) => set({ strokeWidth: Number(e.target.value) })}
        />
      </label>

      <label className="field">
        <span>Font size: {d.fontSize}px</span>
        <input
          type="range"
          min={8}
          max={36}
          value={d.fontSize}
          onChange={(e) => set({ fontSize: Number(e.target.value) })}
        />
      </label>
    </div>
  )
}

function EdgeInspector({
  edge,
  onUpdate
}: {
  edge: Edge
  onUpdate: (id: string, patch: Partial<Edge>) => void
}): JSX.Element {
  const color = (edge.style?.stroke as string) ?? '#94a3b8'
  const width = (edge.style?.strokeWidth as number) ?? 2

  return (
    <div className="inspector-section">
      <h2>Connection</h2>

      <label className="field">
        <span>Label</span>
        <input
          type="text"
          value={(edge.label as string) ?? ''}
          onChange={(e) => onUpdate(edge.id, { label: e.target.value })}
          placeholder="relationship…"
        />
      </label>

      <label className="field">
        <span>Line style</span>
        <select
          value={edge.type ?? 'default'}
          onChange={(e) => onUpdate(edge.id, { type: e.target.value })}
        >
          {EDGE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <ColorField
        label="Color"
        value={color}
        onChange={(v) => onUpdate(edge.id, { style: { ...edge.style, stroke: v } })}
      />

      <label className="field">
        <span>Thickness: {width}px</span>
        <input
          type="range"
          min={1}
          max={10}
          value={width}
          onChange={(e) =>
            onUpdate(edge.id, { style: { ...edge.style, strokeWidth: Number(e.target.value) } })
          }
        />
      </label>

      <label className="field field-row">
        <span>Animated</span>
        <input
          type="checkbox"
          checked={Boolean(edge.animated)}
          onChange={(e) => onUpdate(edge.id, { animated: e.target.checked })}
        />
      </label>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <div className="swatches">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              className="swatch"
              style={{ background: c }}
              title={c}
              onClick={() => onChange(c)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
