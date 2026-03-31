// 本体相关类型

// 实体概念类型
export type EntityConceptType = '业务实体' | '活动实体'
export type BusinessEntitySubClass = '人' | '财' | '物' | '信息' | '技术' | '数据'
export type ActivityEntitySubClass = '领域活动实体' | '领域分析实体'
export type EntitySubClass = BusinessEntitySubClass | ActivityEntitySubClass
export type DomainView = '市场营销' | '销售领域' | '研发领域' | '交付领域' | '人力资源' | '财务领域' | '平台能力.工具能力' | '平台能力.引擎能力'

// L3 分组类型
export type L3GroupType = 'business' | 'activity'

export interface OntologyLeaf {
  id: string
  label: string
  color: string
  total: number
  newCnt: number
  existCnt: number
  // L3 分组类型信息
  l3GroupType?: L3GroupType
  entitySubClass?: EntitySubClass
  domainView?: DomainView
}

export interface OntologyL2 {
  id: string
  label: string
  color: string
  icon: string
  children: OntologyLeaf[]
}

export interface OntologyL1 {
  id: string
  label: string
  color: string
  icon: string
  children: OntologyL2[]
}

export interface DataSourceBinding {
  id?: string
  dataSource: string
  database: string
  table: string
}

export interface EntityTableGraphNode {
  id: string
  source: DataSourceBinding
}

export interface EntityTableGraphEdge {
  id: string
  sourceNodeId: string
  targetNodeId: string
  relationType?: RelationType
  joinKey?: string
  leftField?: string
  rightField?: string
  note?: string
}

export interface EntityTableGraph {
  nodes: EntityTableGraphNode[]
  edges: EntityTableGraphEdge[]
}

export interface EntityAttr {
  en: string
  cn: string
  termId?: string
  termName?: string
  isNew?: boolean
  mappedField?: string
  mappedFieldSource?: DataSourceBinding
}

export interface Entity {
  id: string
  name: string
  nameCn: string
  isNew: boolean
  // legacy single-table field, used as fallback
  tableName?: string
  sourceBindings?: DataSourceBinding[]
  tableGraph?: EntityTableGraph
  attrs: EntityAttr[]
  // 实体概念类型分类
  entity_concept_type?: EntityConceptType
  entity_sub_class?: EntitySubClass
  domain_view?: DomainView | null
  // 实体级别术语关联
  termId?: string
  termName?: string
  // 实体标识字段映射
  keyField?: string
  keyFieldSource?: DataSourceBinding
}

export interface MappingField {
  name: string
  type: string
  dataSource?: string
  database?: string
  table?: string
}

export interface MappingAttr {
  name: string
  entity: string
}

export type ConfidenceLevel = 'high' | 'mid' | 'low'

export type RelationCategory = 'entity' | 'event'  // 实体类型关系 | 事件类型关系
export type RelationType = '1:1' | '1:N' | 'N:1' | 'N:N'  // 一对一、一对多、多对一、多对多

export interface MappingLink {
  fieldIndex: number
  attrIndex: number
  confidence: ConfidenceLevel
}

export interface MappingData {
  fields: MappingField[]
  attrs: MappingAttr[]
  links: MappingLink[]
}

// 活动实体树专用类型
export type ActivityLeafType = 'activity' | 'analysis'

export interface ActivityLeaf {
  id: string
  label: string
  type: ActivityLeafType   // activity => 实心圆；analysis => 菱形
  total: number
  newCnt: number
  existCnt: number
  domainView: DomainView
}

export interface ActivityDomainNode {
  domain: DomainView
  label: string
  color: string
  children: ActivityLeaf[]
}

export interface EntityRelation {
  id: string
  relationCategory: RelationCategory  // 关系分类：实体类型/事件类型
  sourceEntityId: string    // 源实体ID
  sourceEntityName: string   // 源实体名称
  targetEntityId: string     // 目标实体ID
  targetEntityName: string   // 目标实体名称
  relationName: string       // 关系英文名
  relationNameCn: string     // 关系中文名
  relationType?: RelationType  // 关系类型：一对一、一对多、多对多
  isRequired?: boolean      // 是否必填
  termId?: string           // 术语ID
  termName?: string         // 术语名称
  isNew?: boolean          // 是否新发现
  confidence?: ConfidenceLevel  // AI推断置信度
}
