import { useCallback, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type OnSelectionChangeParams
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ShapeNode from './components/ShapeNode'
import Palette from './components/Palette'
import Inspector from './components/Inspector'
import type { ShapeKind, ShapeNode as TShapeNode, ShapeNodeData, WorldFile } from './types'

let idCounter = 1
const nextId = (): string => `n${idCounter++}`

const DEFAULT_BG = '#0f1117'

function makeShape(kind: ShapeKind, x: number, y: number, icon = ''): TShapeNode {
  const data: ShapeNodeData = {
    label: '',
    shape: kind,
    icon,
    fill: '#1e293b',
    stroke: '#38bdf8',
    strokeWidth: 2,
    textColor: '#e2e8f0',
    fontSize: 14,
    width: 140,
    height: 90
  }
  return {
    id: nextId(),
    type: 'shape',
    position: { x, y },
    data,
    width: data.width,
    height: data.height
  }
}

export default function App(): JSX.Element {
  const nodeTypes = useMemo<NodeTypes>(() => ({ shape: ShapeNode }), [])
  const [nodes, setNodes, onNodesChange] = useNodesState<TShapeNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [background, setBackground] = useState<string>(DEFAULT_BG)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition } = useReactFlow()

  const flash = useCallback((msg: string) => {
    setStatus(msg)
    window.setTimeout(() => setStatus(''), 2600)
  }, [])

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
            style: { stroke: '#94a3b8', strokeWidth: 2 }
          },
          eds
        )
      )
    },
    [setEdges]
  )

  const centerOfView = useCallback(() => {
    const el = wrapperRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }, [screenToFlowPosition])

  const addShape = useCallback(
    (kind: ShapeKind) => {
      const p = centerOfView()
      setNodes((nds) => nds.concat(makeShape(kind, p.x - 70, p.y - 45)))
    },
    [centerOfView, setNodes]
  )

  const addIcon = useCallback(
    (glyph: string) => {
      const p = centerOfView()
      setNodes((nds) => nds.concat(makeShape('rounded', p.x - 70, p.y - 45, glyph)))
    },
    [centerOfView, setNodes]
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const shape = event.dataTransfer.getData('application/storycraft-shape')
      const icon = event.dataTransfer.getData('application/storycraft-icon')
      if (!shape && !icon) return
      const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY })
      const node = icon
        ? makeShape('rounded', pos.x - 70, pos.y - 45, icon)
        : makeShape(shape as ShapeKind, pos.x - 70, pos.y - 45)
      setNodes((nds) => nds.concat(node))
    },
    [screenToFlowPosition, setNodes]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeId(params.nodes[0]?.id ?? null)
    setSelectedEdgeId(params.edges[0]?.id ?? null)
  }, [])

  const updateNode = useCallback(
    (id: string, patch: Partial<ShapeNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== id) return n
          const data = { ...n.data, ...patch }
          const next: TShapeNode = { ...n, data }
          if (patch.width) next.width = patch.width
          if (patch.height) next.height = patch.height
          return next
        })
      )
    },
    [setNodes]
  )

  const updateEdge = useCallback(
    (id: string, patch: Partial<Edge>) => {
      setEdges((eds) => eds.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    },
    [setEdges]
  )

  const deleteSelection = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId))
    setEdges((eds) =>
      eds.filter(
        (e) =>
          e.id !== selectedEdgeId &&
          e.source !== selectedNodeId &&
          e.target !== selectedNodeId
      )
    )
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [selectedNodeId, selectedEdgeId, setNodes, setEdges])

  const newWorld = useCallback(() => {
    if (nodes.length && !window.confirm('Start a new world? Unsaved changes will be lost.')) return
    setNodes([])
    setEdges([])
    setBackground(DEFAULT_BG)
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [nodes.length, setNodes, setEdges])

  const saveWorld = useCallback(async () => {
    const payload: WorldFile = { version: 1, app: 'storycraft', background, nodes, edges }
    const res = await window.storycraft.saveProject(JSON.stringify(payload, null, 2))
    if (res.ok) flash('World saved.')
    else if (!res.canceled) flash(`Save failed: ${res.error ?? 'unknown error'}`)
  }, [background, nodes, edges, flash])

  const loadWorld = useCallback(async () => {
    const res = await window.storycraft.loadProject()
    if (!res.ok) {
      if (!res.canceled) flash(`Load failed: ${res.error ?? 'unknown error'}`)
      return
    }
    try {
      const parsed = JSON.parse(res.data ?? '') as WorldFile
      if (parsed.app !== 'storycraft' || !Array.isArray(parsed.nodes)) {
        flash('Not a valid StoryCraft world file.')
        return
      }
      // Keep id counter ahead of any restored ids to avoid collisions.
      parsed.nodes.forEach((n) => {
        const num = Number(String(n.id).replace(/\D/g, ''))
        if (Number.isFinite(num) && num >= idCounter) idCounter = num + 1
      })
      setNodes(parsed.nodes ?? [])
      setEdges(parsed.edges ?? [])
      setBackground(parsed.background ?? DEFAULT_BG)
      flash('World loaded.')
    } catch {
      flash('Could not read that file.')
    }
  }, [flash, setNodes, setEdges])

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId]
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span> StoryCraft
        </div>
        <div className="topbar-actions">
          <button className="btn" onClick={newWorld}>New</button>
          <button className="btn" onClick={saveWorld}>Save</button>
          <button className="btn" onClick={loadWorld}>Open</button>
          <label className="bg-picker" title="Canvas background color">
            <span>Background</span>
            <input
              type="color"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </label>
        </div>
        {status && <div className="status">{status}</div>}
      </header>

      <div className="body">
        <Palette onAddShape={addShape} onAddIcon={addIcon} />

        <div className="canvas-wrap" ref={wrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onSelectionChange={onSelectionChange}
            style={{ background }}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#33415588" />
            <MiniMap pannable zoomable nodeColor={(n) => (n.data as ShapeNodeData).fill} />
            <Controls />
          </ReactFlow>
        </div>

        <Inspector
          node={selectedNode}
          edge={selectedEdge}
          onUpdateNode={updateNode}
          onUpdateEdge={updateEdge}
          onDeleteSelection={deleteSelection}
        />
      </div>
    </div>
  )
}
