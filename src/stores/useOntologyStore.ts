import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  OntologyL1,
  OntologyL2,
  OntologyLeaf,
  Entity,
  MappingData,
  MappingField,
  EntityRelation,
  RelationCategory,
  DataSourceBinding,
  EntityTableGraph
} from '@/types'
import {
  ONTOLOGY_TREE,
  ACTIVITY_DOMAIN_TREE,
  ENTITY_DATA,
  MAPPING_DATA,
  ENTITY_COLORS,
  getDefaultMapping,
  generateDefaultEntities
} from '@/constants'

// 实体树视图模式：business = 业务实体树，activity = 活动实体树
export type EntityTreeMode = 'business' | 'activity'

export const useOntologyStore = defineStore('ontology', () => {
  // 展开的 L1 节点
  const openL1 = ref<Set<string>>(new Set(['l1_crm']))
  // 展开的 L2 节点
  const openL2 = ref<Set<string>>(new Set(['l2_crm_user']))

  // 实体树视图模式（业务实体 / 活动实体）
  const entityTreeMode = ref<EntityTreeMode>('business')

  // 活动实体树：展开的领域节点
  const openActivityDomain = ref<Set<string>>(new Set(['销售领域']))

  // 内部存储：当前选中的本体叶节点 ID
  const _currentOntologyId = ref('onto_crm_user_person')

  // 对外暴露为 computed，保持向下兼容（EntityList/RelationList 只读取，不直接写入）
  const currentOntologyId = computed(() => _currentOntologyId.value)

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

  // 当前正在刷新的实体ID
  const reextractingEntityId = ref<string | null>(null)

  // 当前本体信息
  const currentOntology = computed((): OntologyLeaf | null => {
    for (const l1 of ONTOLOGY_TREE) {
      for (const l2 of l1.children) {
        for (const leaf of l2.children) {
          if (leaf.id === _currentOntologyId.value) {
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
          if (leaf.id === _currentOntologyId.value) {
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
          if (leaf.id === _currentOntologyId.value) {
            return l2
          }
        }
      }
    }
    return null
  })

  // 当前实体列表
  const currentEntities = computed<Entity[]>(() => {
    return ENTITY_DATA[_currentOntologyId.value] || generateDefaultEntities(_currentOntologyId.value)
  })

  // 当前映射数据
  const currentMapping = computed<MappingData>(() => {
    return MAPPING_DATA[_currentOntologyId.value] || getDefaultMapping(_currentOntologyId.value)
  })

  function normalizeBinding(binding: Partial<DataSourceBinding>): DataSourceBinding {
    return {
      id: binding.id || `${binding.dataSource || 'default_source'}.${binding.database || 'default_db'}.${binding.table || 'unknown_table'}`,
      dataSource: binding.dataSource || 'default_source',
      database: binding.database || 'default_db',
      table: binding.table || 'unknown_table'
    }
  }

  function bindingKey(binding: Partial<DataSourceBinding>): string {
    return `${binding.dataSource || 'default_source'}|${binding.database || 'default_db'}|${binding.table || 'unknown_table'}`
  }

  function findEntity(entityId: string): Entity | undefined {
    return currentEntities.value.find(e => e.id === entityId)
  }

  function getEntitySources(entityId: string): DataSourceBinding[] {
    const entity = findEntity(entityId)
    if (!entity) return []

    if (entity.sourceBindings && entity.sourceBindings.length > 0) {
      return entity.sourceBindings.map(normalizeBinding)
    }

    const sourceMap = new Map<string, DataSourceBinding>()
    const mapping = currentMapping.value
    if (mapping?.links?.length) {
      for (const link of mapping.links) {
        const mappingAttr = mapping.attrs[link.attrIndex]
        if (!mappingAttr || mappingAttr.entity !== entity.name) continue
        const field = mapping.fields[link.fieldIndex]
        if (!field) continue
        const source = normalizeBinding({
          dataSource: field.dataSource,
          database: field.database,
          table: field.table || entity.tableName
        })
        sourceMap.set(bindingKey(source), source)
      }
    }

    if (sourceMap.size === 0 && entity.tableName) {
      const source = normalizeBinding({ table: entity.tableName })
      sourceMap.set(bindingKey(source), source)
    }

    if (sourceMap.size === 0) {
      const source = normalizeBinding({ table: `${entity.name.toLowerCase()}_table` })
      sourceMap.set(bindingKey(source), source)
    }

    const sources = Array.from(sourceMap.values())
    entity.sourceBindings = sources
    if (!entity.tableName && sources[0]) {
      entity.tableName = sources[0].table
    }
    return sources
  }

  function getMappedFieldForAttr(entityId: string, attrName: string): MappingField | null {
    const entity = findEntity(entityId)
    if (!entity) return null

    const attr = entity.attrs.find(a => a.en === attrName)
    if (attr?.mappedField) {
      return {
        name: attr.mappedField,
        type: 'CUSTOM',
        dataSource: attr.mappedFieldSource?.dataSource,
        database: attr.mappedFieldSource?.database,
        table: attr.mappedFieldSource?.table
      }
    }

    const mapping = currentMapping.value
    for (const link of mapping.links) {
      const mappingAttr = mapping.attrs[link.attrIndex]
      if (!mappingAttr) continue
      if (mappingAttr.entity !== entity.name || mappingAttr.name !== attrName) continue
      return mapping.fields[link.fieldIndex] || null
    }

    return null
  }

  function getEntityTableGraph(entityId: string): EntityTableGraph {
    const entity = findEntity(entityId)
    if (!entity) return { nodes: [], edges: [] }
    if (entity.tableGraph) return entity.tableGraph

    const sources = getEntitySources(entityId)
    const nodes = sources.map(source => ({
      id: source.id || `${source.dataSource}.${source.database}.${source.table}`,
      source
    }))

    const edges: EntityTableGraph['edges'] = []
    for (let i = 0; i < nodes.length - 1; i += 1) {
      edges.push({
        id: `e-${nodes[i].id}-${nodes[i + 1].id}`,
        sourceNodeId: nodes[i].id,
        targetNodeId: nodes[i + 1].id,
        note: 'auto'
      })
    }
    return { nodes, edges }
  }

  // 关联数据
  const relations = ref<EntityRelation[]>([
    { id: 'r1', relationCategory: 'entity', sourceEntityId: 'e2', sourceEntityName: '认证信息', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'belongs_to', relationNameCn: '属于', relationType: '1:1', isRequired: true, termId: 'term_101', termName: '归属关系', confidence: 'high', isNew: false },
    { id: 'r2', relationCategory: 'entity', sourceEntityId: 'e3', sourceEntityName: '联系方式', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'links_to', relationNameCn: '关联', relationType: '1:N', isRequired: false, termId: 'term_102', termName: '关联关系', confidence: 'high', isNew: true },
    { id: 'r3', relationCategory: 'entity', sourceEntityId: 'e4', sourceEntityName: '用户地址', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'has', relationNameCn: '拥有', relationType: '1:N', isRequired: false, confidence: 'mid', isNew: false },
    { id: 'r4', relationCategory: 'entity', sourceEntityId: 'e5', sourceEntityName: '账户信息', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'owns', relationNameCn: '持有', relationType: '1:1', isRequired: true, confidence: 'high', isNew: false },
    { id: 'r5', relationCategory: 'entity', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'refers_to', relationNameCn: '引用', relationType: 'N:N', isRequired: false, confidence: 'mid', isNew: true },
    // 事件类型关系示例
    { id: 'r6', relationCategory: 'event', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'purchased', relationNameCn: '购买', relationType: '1:N', isRequired: false, termId: 'term_103', termName: '购买关系', confidence: 'low', isNew: true },
    { id: 'r7', relationCategory: 'event', sourceEntityId: 'e1', sourceEntityName: '用户', targetEntityId: 'e1', targetEntityName: '用户', relationName: 'clicked', relationNameCn: '点击', relationType: '1:N', isRequired: false, confidence: 'low', isNew: false }
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

  // 切换本体（业务实体树叶节点）
  function switchOntology(leafId: string, l2Id: string, l1Id: string) {
    _currentOntologyId.value = leafId
    openL1.value.add(l1Id)
    openL2.value.add(l2Id)
  }

  // 切换本体（活动实体树叶节点，无 L1/L2 层级）
  function switchActivityOntology(leafId: string) {
    _currentOntologyId.value = leafId
  }

  // 切换实体树视图模式
  function switchEntityTreeMode(mode: EntityTreeMode) {
    entityTreeMode.value = mode
  }

  // 切换活动领域节点展开/收起
  function toggleActivityDomain(domain: string) {
    if (openActivityDomain.value.has(domain)) {
      openActivityDomain.value.delete(domain)
    } else {
      openActivityDomain.value.add(domain)
    }
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

  // 触发单个实体刷新（弹窗确认后调用）
  function triggerEntityReextract(entityId: string) {
    reextractingEntityId.value = entityId
    // 模拟刷新完成
    setTimeout(() => {
      reextractingEntityId.value = null
    }, 1500)
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

  // 获取叶节点标签（同时搜索业务实体树和活动实体树）
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
    if (!label) {
      ACTIVITY_DOMAIN_TREE.forEach(domain => {
        domain.children.forEach(leaf => {
          if (leaf.id === leafId) {
            label = leaf.label
          }
        })
      })
    }
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
    const entity = findEntity(entityId)
    if (entity) {
      entity.tableName = tableName
      const source = normalizeBinding({ table: tableName })
      entity.sourceBindings = [source]
      entity.tableGraph = {
        nodes: [{ id: source.id || tableName, source }],
        edges: []
      }
    }
  }

  function updateEntitySources(entityId: string, sources: DataSourceBinding[]) {
    const entity = findEntity(entityId)
    if (!entity) return
    const normalized = sources.map(normalizeBinding)
    entity.sourceBindings = normalized
    if (normalized[0]) {
      entity.tableName = normalized[0].table
    }
  }

  function updateEntityTableGraph(entityId: string, graph: EntityTableGraph) {
    const entity = findEntity(entityId)
    if (!entity) return
    entity.tableGraph = graph
  }

  function updateEntityAttrMappedField(entityId: string, attrEn: string, field: MappingField) {
    const entity = findEntity(entityId)
    if (!entity) return
    const attr = entity.attrs.find(a => a.en === attrEn)
    if (!attr) return
    attr.mappedField = field.name
    attr.mappedFieldSource = normalizeBinding({
      dataSource: field.dataSource,
      database: field.database,
      table: field.table
    })
  }

  function formatSourcePath(source?: Partial<DataSourceBinding> | null): string {
    if (!source) return '-'
    const normalized = normalizeBinding(source)
    return `${normalized.dataSource}.${normalized.database}.${normalized.table}`
  }

  function formatFieldPath(field?: MappingField | null): string {
    if (!field) return '-'
    return `${field.name} (${formatSourcePath(field)})`
  }

  function buildBindingKey(source: Partial<DataSourceBinding>): string {
    return bindingKey(source)
  }

  function parseBindingKey(key: string): DataSourceBinding {
    const [dataSource = 'default_source', database = 'default_db', table = 'unknown_table'] = key.split('|')
    return normalizeBinding({ dataSource, database, table })
  }

  // 删除实体的单个属性
  function deleteEntityAttr(entityId: string, attrEn: string) {
    const entities = ENTITY_DATA[_currentOntologyId.value]
    if (!entities) return
    const entity = entities.find(e => e.id === entityId)
    if (entity) {
      const attrIndex = entity.attrs.findIndex(a => a.en === attrEn)
      if (attrIndex !== -1) {
        entity.attrs.splice(attrIndex, 1)
      }
    }
  }

  // 批量删除实体属性
  function batchDeleteEntityAttrs(entityId: string, attrEns: string[]) {
    const entities = ENTITY_DATA[_currentOntologyId.value]
    if (!entities) return
    const entity = entities.find(e => e.id === entityId)
    if (entity) {
      entity.attrs = entity.attrs.filter(a => !attrEns.includes(a.en))
    }
  }

  // 删除实体
  function deleteEntity(entityId: string) {
    const entities = ENTITY_DATA[_currentOntologyId.value]
    if (!entities) return
    const index = entities.findIndex(e => e.id === entityId)
    if (index !== -1) {
      entities.splice(index, 1)
    }
  }

  // 更新实体级别术语
  function updateEntityTerm(entityId: string, termId: string, termName: string) {
    const entity = findEntity(entityId)
    if (entity) {
      entity.termId = termId
      entity.termName = termName
    }
  }

  // 更新实体标识字段
  function updateEntityKeyField(entityId: string, field: MappingField) {
    const entity = findEntity(entityId)
    if (!entity) return
    entity.keyField = field.name
    entity.keyFieldSource = normalizeBinding({
      dataSource: field.dataSource,
      database: field.database,
      table: field.table
    })
  }

  // 获取实体标识字段（用于 FieldMappingModal 预选回显）
  function getEntityKeyField(entityId: string): MappingField | null {
    const entity = findEntity(entityId)
    if (!entity?.keyField) return null
    return {
      name: entity.keyField,
      type: 'KEY',
      dataSource: entity.keyFieldSource?.dataSource,
      database: entity.keyFieldSource?.database,
      table: entity.keyFieldSource?.table
    }
  }

  // 批量删除实体
  function batchDeleteEntities(entityIds: string[]) {
    const entities = ENTITY_DATA[_currentOntologyId.value]
    if (!entities) return
    // 使用 filter 保留不在删除列表中的实体
    const remaining = entities.filter(e => !entityIds.includes(e.id))
    // 替换原数组
    entities.length = 0
    entities.push(...remaining)
  }

  return {
    openL1,
    openL2,
    entityTreeMode,
    openActivityDomain,
    currentOntologyId,
    mappingViewMode,
    relationCategory,
    relationViewMode,
    isRecognizing,
    isMappingRecognizing,
    showReextractAnimation,
    reextractingEntityId,
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
    toggleActivityDomain,
    switchOntology,
    switchActivityOntology,
    switchEntityTreeMode,
    switchMappingView,
    switchRelationCategory,
    switchRelationViewMode,
    startRecognition,
    stopRecognition,
    startMappingRecognition,
    stopMappingRecognition,
    triggerReextractAnimation,
    clearReextractAnimation,
    triggerEntityReextract,
    getEntityColor,
    getLeafLabel,
    getEntitySources,
    getEntityTableGraph,
    getMappedFieldForAttr,
    formatSourcePath,
    formatFieldPath,
    buildBindingKey,
    parseBindingKey,
    updateEntityTableName,
    updateEntitySources,
    updateEntityTableGraph,
    updateEntityAttrMappedField,
    deleteEntityAttr,
    batchDeleteEntityAttrs,
    deleteEntity,
    batchDeleteEntities,
    addRelation,
    updateRelation,
    deleteRelation,
    updateEntityTerm,
    updateEntityKeyField,
    getEntityKeyField
  }
})
