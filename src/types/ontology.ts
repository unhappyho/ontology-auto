// 本体相关类型

export interface OntologyLeaf {
  id: string
  label: string
  color: string
  total: number
  newCnt: number
  existCnt: number
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

export interface EntityAttr {
  en: string
  cn: string
  termId?: string
  termName?: string
  isNew?: boolean
}

export interface Entity {
  id: string
  name: string
  nameCn: string
  isNew: boolean
  tableName?: string
  attrs: EntityAttr[]
}

export interface MappingField {
  name: string
  type: string
}

export interface MappingAttr {
  name: string
  entity: string
}

export type ConfidenceLevel = 'high' | 'mid' | 'low'

export type RelationCategory = 'entity' | 'event'  // 实体类型关系 | 事件类型关系
export type RelationType = '1:1' | '1:N' | 'N:N'  // 一对一、一对多、多对多

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
