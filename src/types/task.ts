// 任务相关类型

export interface Task {
  id: string
  name: string
  dataSourceType: string
  dataSourceIcon: string
  dataSourceColor: string
  collectMode: string
  status: 'success' | 'processing' | 'error' | 'pending' | 'listening'
  statusText: string
  lastCollectTime: string
}

export interface WorkspaceConfig {
  name: string
  model: string
  vectorDb: string
  graphDb: string
  members: string
  graphStorage: string
  entityCount: number
  relationCount: number
  connected: boolean
}
