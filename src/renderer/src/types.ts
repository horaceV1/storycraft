import type { Node, Edge } from '@xyflow/react'

export type ShapeKind =
  | 'rectangle'
  | 'rounded'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'parallelogram'
  | 'star'
  | 'cylinder'
  | 'cloud'

export interface ShapeNodeData {
  label: string
  shape: ShapeKind
  /** Emoji / icon glyph shown inside the shape. Empty string = none. */
  icon: string
  fill: string
  stroke: string
  strokeWidth: number
  textColor: string
  fontSize: number
  width: number
  height: number
  [key: string]: unknown
}

export type ShapeNode = Node<ShapeNodeData, 'shape'>

export interface WorldFile {
  version: 1
  app: 'storycraft'
  background: string
  nodes: ShapeNode[]
  edges: Edge[]
}
