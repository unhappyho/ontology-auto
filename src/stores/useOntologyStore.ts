import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OntologyL1, OntologyL2, OntologyLeaf, Entity, MappingData, EntityRelation, RelationCategory } from '@/types'
import {
  ONTOLOGY_TREE,
  ENTITY_DATA,
  MAPPING_DATA,
  ENTITY_COLORS,
  getDefaultMapping,
  generateDefaultEntities
} from '@/constants'

export const useOntologyStore = defineStore('ontology', () => {
  // 展开的 L1 节点
  const openL1 = ref<Set<string>>(new Set(['l1_crm']))
  // 展开的 L2 节点
  const openL2 = ref<Set<string>>(new Set(['l2_crm_user']))

  // 当前选中的本体（叶节点）
  const currentOntologyId = ref('onto_crm_user_base')

  // 映射视图模式
  const mappingViewMode = ref<'line' | 'table'>('line')

  // 关联视图模式
  const relationCategory = ref<RelationCategory>('entity')
  const relationViewMode = ref<'canvas' | 'table'>('canvas')

  // AI 识别状态
  const isRecognizing = ref(false)
  const isMappingRecognizing = ref(false)

  // 重新抽取动画状态
  const showReextractAnimation = ref(false)

  // 当前本体信息
  const currentOntology = computed((): OntologyLeaf | null => {
    for (const l1 of ONTOLOGY_TREE) {
      for (const l2 of l1.children) {
        for (const leaf of l2.children) {
          if (leaf.id === currentOntologyId.value) {
            return leaf
          }
        }
      }
    }
    return null
  })

  // 当前 L1 和 L2 信息
  const currentL1 = computed((): OntologyL1 | null => {
    for (const l1 of ONTOLOGY_TREE) {
      for (const l2 of l1.children) {
        for (const leaf of l2.children) {
          if (leaf.id === currentOntologyId.value) {
            return l1
          }
        }
      }
    }
    return null
  })

  const currentL2 = computed((): OntologyL2 | null => {
    for (const l1 of ONTOLOGY_TREE) {
      for (const l2 of l1.children) {
        for (const leaf of l2.children) {
          if (leaf.id === currentOntologyId.value) {
            return l2
          }
        }
      }
    }
    return null
  })

  // 当前实体列表
  const currentEntities = computed<Entity[]>(() => {
    return ENTITY_DATA[currentOntologyId.value] || generateDefaultEntities(currentOntologyId.value)
  })

  // 当前映射数据
  const currentMapping = computed<MappingData>(() => {
    return MAPPING_DATA[currentOntologyId.value] || getDefaultMapping(currentOntologyId.value)
  })

  // 关联数据
  const relations = ref<EntityRelation[]>([
    { id: 'r1', relationCategory: 'entity', sourceEntityId: 'e2', sourceEntityName: '认证信息', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'belongs_to', relationNameCn: '属于', relationType: '1:1', isRequired: true, termId: 'term_101', termName: '归属关系', isNew: false },
    { id: 'r2', relationCategory: 'entity', sourceEntityId: 'e3', sourceEntityName: '联系方式', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'links_to', relationNameCn: '关联', relationType: '1:N', isRequired: false, termId: 'term_102', termName: '关联关系', isNew: true },
    { id: 'r3', relationCategory: 'entity', sourceEntityId: 'e4', sourceEntityName: '用户地址', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'has', relationNameCn: '拥有', relationType: '1:N', isRequired: false, isNew: false },
    { id: 'r4', relationCategory: 'entity', sourceEntityId: 'e5', sourceEntityName: '账户信息', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'owns', relationNameCn: '持有', relationType: '1:1', isRequired: true, isNew: false },
    { id: 'r5', relationCategory: 'entity', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'refers_to', relationNameCn: '引用', relationType: 'N:N', isRequired: false, confidence: 'mid', isNew: true },
    // 事件类型关系示例
    { id: 'r6', relationCategory: 'event', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'purchased', relationNameCn: '购买', relationType: '1:N', isRequired: false, termId: 'term_103', termName: '购买关系', isNew: true },
    { id: 'r7', relationCategory: 'event', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'clicked', relationNameCn: '点击', relationType: '1:N', isRequired: false, isNew: true }
  ])

  // 当前本体的关联列表（根据分类过滤）
  const currentRelations = computed<EntityRelation[]>(() => {
    return relations.value.filter(r => r.relationCategory === relationCategory.value)
  })

  // 有关联的实体数量
  const linkedEntityCount = computed(() => {
    const entityIds = new Set<string>()
    currentRelations.value.forEach(r => {
      entityIds.add(r.sourceEntityId)
      entityIds.add(r.targetEntityId)
    })
    return entityIds.size
  })

  // 无关联的实体数量
  const unlinkedEntityCount = computed(() => {
    return currentEntities.value.length - linkedEntityCount.value
  })

  // 切换 L1 展开
  function toggleL1(id: string) {
    if (openL1.value.has(id)) {
      openL1.value.delete(id)
    } else {
      openL1.value.add(id)
    }
  }

  // 切换 L2 展开
  function toggleL2(id: string) {
    if (openL2.value.has(id)) {
      openL2.value.delete(id)
    } else {
      openL2.value.add(id)
    }
  }

  // 切换本体
  function switchOntology(leafId: string, l2Id: string, l1Id: string) {
    currentOntologyId.value = leafId
    openL1.value.add(l1Id)
    openL2.value.add(l2Id)
  }

  // 切换映射视图
  function switchMappingView(mode: 'line' | 'table') {
    mappingViewMode.value = mode
  }

  // 切换关系分类
  function switchRelationCategory(category: RelationCategory) {
    relationCategory.value = category
  }

  // 切换关联视图模式
  function switchRelationViewMode(mode: 'canvas' | 'table') {
    relationViewMode.value = mode
  }

  // 开始 AI 识别
  function startRecognition() {
    isRecognizing.value = true
  }

  // 结束 AI 识别
  function stopRecognition() {
    isRecognizing.value = false
  }

  // 触发重新抽取动画
  function triggerReextractAnimation() {
    showReextractAnimation.value = true
    // 动画结束后重置状态
    setTimeout(() => {
      showReextractAnimation.value = false
    }, 2000)
  }

  // 清除重新抽取动画
  function clearReextractAnimation() {
    showReextractAnimation.value = false
  }

  // 开始映射识别
  function startMappingRecognition() {
    isMappingRecognizing.value = true
  }

  // 结束映射识别
  function stopMappingRecognition() {
    isMappingRecognizing.value = false
  }

  // 获取实体颜色
  function getEntityColor(index: number): string {
    return ENTITY_COLORS[index % ENTITY_COLORS.length]
  }

  // 获取叶节点标签
  function getLeafLabel(leafId: string): string {
    let label = ''
    ONTOLOGY_TREE.forEach(l1 => {
      l1.children.forEach(l2 => {
        l2.children.forEach(leaf => {
          if (leaf.id === leafId) {
            label = leaf.label
          }
        })
      })
    })
    return label
  }

  // 添加关联
  function addRelation(relation: Omit<EntityRelation, 'id'>) {
    const newRelation: EntityRelation = {
      ...relation,
      id: 'r' + Date.now()
    }
    relations.value.push(newRelation)
    return newRelation
  }

  // 更新关联
  function updateRelation(id: string, data: Partial<EntityRelation>) {
    const index = relations.value.findIndex(r => r.id === id)
    if (index !== -1) {
      relations.value[index] = { ...relations.value[index], ...data }
    }
  }

  // 删除关联
  function deleteRelation(id: string) {
    const index = relations.value.findIndex(r => r.id === id)
    if (index !== -1) {
      relations.value.splice(index, 1)
    }
  }

  // 更新实体的库表名
  function updateEntityTableName(entityId: string, tableName: string) {
    const entities = currentEntities.value
    const entity = entities.find(e => e.id === entityId)
    if (entity) {
      entity.tableName = tableName
    }
  }

  return {
    openL1,
    openL2,
    currentOntologyId,
    mappingViewMode,
    relationCategory,
    relationViewMode,
    isRecognizing,
    isMappingRecognizing,
    showReextractAnimation,
    currentOntology,
    currentL1,
    currentL2,
    currentEntities,
    currentMapping,
    currentRelations,
    linkedEntityCount,
    unlinkedEntityCount,
    toggleL1,
    toggleL2,
    switchOntology,
    switchMappingView,
    switchRelationCategory,
    switchRelationViewMode,
    startRecognition,
    stopRecognition,
    startMappingRecognition,
    stopMappingRecognition,
    triggerReextractAnimation,
    clearReextractAnimation,
    getEntityColor,
    getLeafLabel,
    updateEntityTableName,
    addRelation,
    updateRelation,
    deleteRelation
  }
})
