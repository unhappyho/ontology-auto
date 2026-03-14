// 画布相关类型

export interface Step {
  id: number
  name: string
  color: string
  icon: string
}

export interface Operator {
  type: string
  step: number
  name: string
  icon: string
}

export interface CanvasNode {
  id: string
  type: string
  step: number
  name: string
  icon: string
  color: string
  x: number
  y: number
}

export interface CanvasEdge {
  id: string
  sourceNode: string
  targetNode: string
}
