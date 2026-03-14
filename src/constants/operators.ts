import type { Operator } from '@/types'

export const OPERATORS: Operator[] = [
  { type: 'op1-1', step: 1, name: '数据采集(DB)', icon: 'TableOutlined' },
  { type: 'op1-2', step: 1, name: '数据采集(PDF)', icon: 'FilePdfOutlined' },
  { type: 'op1-3', step: 1, name: '数据采集(脚本)', icon: 'CodeOutlined' },
  { type: 'op2-1', step: 2, name: '实体提取+映射', icon: 'BulbOutlined' },
  { type: 'op3-1', step: 3, name: '关联构建', icon: 'LinkOutlined' },
  { type: 'op4-1', step: 4, name: '知识融合入库', icon: 'DatabaseOutlined' }
]
