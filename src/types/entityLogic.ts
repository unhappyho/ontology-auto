export interface Param {
  id: string
  name: string
  description: string
  type: string
  passMethod?: string   // Body | Path | Query | Header
  defaultValue?: string
  required: boolean
  associatedTermId?: string
}

export interface HeaderItem {
  id: string
  key: string
  value: string
  description: string
}

export interface FunctionDef {
  id: string
  code: string
  name: string
  description: string
  documentName: string
  fileName: string
  serverUrl: string
  path: string
  method: string       // GET | POST | PUT | DELETE | PATCH
  bodyType: string     // raw | form-data
  headers: HeaderItem[]
  inputParams: Param[]
  outputParams: Param[]
}

export interface ActionDef {
  id: string
  code: string
  name: string
  description: string
  type: '原子动作' | '复合动作'
  targetFunctionId: string
  category?: string
}

export interface OntologyAttr {
  id: string
  name: string
  description: string
  type: string
}

export interface OntologyItem {
  id: string
  name: string
  description: string
  category: string
  subCategory?: string
  attributes: OntologyAttr[]
}

export interface OntologyAssociation {
  id: string
  actionId: string
  ontologyId: string
  confidence: number   // 0 ~ 1
}

export const PARAM_TYPES = [
  'String', 'Integer', 'Boolean', 'Number', 'Object',
  'Array<String>', 'Array<Integer>', 'Array<Boolean>', 'Array<Object>', 'Array<Number>'
]

export const PASS_METHODS = ['Body', 'Path', 'Query', 'Header']
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
export const BODY_TYPES = ['raw', 'form-data']

// HTTP 方法颜色映射（用于 Badge）
export const HTTP_METHOD_COLORS: Record<string, string> = {
  GET: '#52c41a',
  POST: '#1677ff',
  PUT: '#fa8c16',
  DELETE: '#ff4d4f',
  PATCH: '#722ed1'
}
