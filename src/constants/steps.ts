import type { Step } from '@/types'

export const STEPS: Step[] = [
  { id: 1, name: '本体数据采集', color: 'var(--color-step1)', icon: 'DatabaseOutlined' },
  { id: 2, name: '实体数据提取', color: 'var(--color-step2)', icon: 'AppstoreOutlined' },
  { id: 3, name: '关联构建', color: 'var(--color-step3)', icon: 'ApartmentOutlined' },
  { id: 4, name: '规则识别', color: 'var(--color-step4)', icon: 'SolutionOutlined' },
  { id: 5, name: '动作识别', color: 'var(--color-step5)', icon: 'ThunderboltOutlined' }
]
