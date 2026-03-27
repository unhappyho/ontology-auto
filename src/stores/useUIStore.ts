import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  // 当前视图模式: 'form' | 'canvas'
  const viewMode = ref<'form' | 'canvas'>('form')

  // 模态框状态
  const ideModalVisible = ref(false)
  const ideModalMode = ref<'script' | 'offline'>('script') // IDE模式：脚本或离线开发
  const sqlModalVisible = ref(false)
  const fieldModalVisible = ref(false)
  const renameModalVisible = ref(false)
  const reextractConfirmModalVisible = ref(false)
  const reextractProgressModalVisible = ref(false)
  const isReextract = ref(false) // 标识是否为重新识别
  const moveDomainModalVisible = ref(false)
  const entityTableModalVisible = ref(false)
  const termLinkModalVisible = ref(false)
  const fieldMappingModalVisible = ref(false)
  const relationModalVisible = ref(false)

  // 模态框数据
  const sqlTableName = ref('')
  const fieldTableName = ref('')
  const renameNodeId = ref('')
  const movingEntityData = ref<{ id: string; name: string; nameCn: string; domain: string } | null>(null)
  const entityTableModalData = ref<{ entityId: string; entityName: string } | null>(null)
  const termLinkModalData = ref<{ entityId: string; attrName: string; isEntityLevel?: boolean } | null>(null)
  const fieldMappingModalData = ref<{ entityId: string; attrName: string; isEntityLevel?: boolean } | null>(null)
  const relationModalData = ref<{
    id?: string
    mode: 'add' | 'edit'
    sourceEntityId: string
    sourceEntityName: string
    targetEntityId: string
    targetEntityName: string
    relationName: string
    relationNameCn: string
    relationType?: '1:1' | '1:N' | 'N:N'
    isRequired?: boolean
    termId?: string
    termName?: string
  } | null>(null)

  // 配置抽屉
  const configDrawerVisible = ref(false)
  const configNodeId = ref('')

  // 切换视图模式
  function switchViewMode(mode: 'form' | 'canvas') {
    viewMode.value = mode
  }

  // 打开/关闭模态框
  function openIdeModal(mode: 'script' | 'offline' = 'script') {
    ideModalMode.value = mode
    ideModalVisible.value = true
  }
  function closeIdeModal() {
    ideModalVisible.value = false
  }

  function openSqlModal(tableName: string) {
    sqlTableName.value = tableName
    sqlModalVisible.value = true
  }
  function closeSqlModal() {
    sqlModalVisible.value = false
  }

  function openFieldModal(tableName: string) {
    fieldTableName.value = tableName
    fieldModalVisible.value = true
  }
  function closeFieldModal() {
    fieldModalVisible.value = false
  }

  function openRenameModal(nodeId: string) {
    renameNodeId.value = nodeId
    renameModalVisible.value = true
  }
  function closeRenameModal() {
    renameModalVisible.value = false
  }

  function openReextractConfirmModal() {
    reextractConfirmModalVisible.value = true
  }
  function closeReextractConfirmModal() {
    reextractConfirmModalVisible.value = false
  }

  function openReextractProgressModal(isReRecognize: boolean = false) {
    isReextract.value = isReRecognize
    reextractProgressModalVisible.value = true
  }
  function closeReextractProgressModal() {
    reextractProgressModalVisible.value = false
  }

  function openMoveDomainModal(data: { id: string; name: string; nameCn: string; domain: string }) {
    movingEntityData.value = data
    moveDomainModalVisible.value = true
  }
  function closeMoveDomainModal() {
    moveDomainModalVisible.value = false
    movingEntityData.value = null
  }

  function openEntityTableModal(data: { entityId: string; entityName: string }) {
    entityTableModalData.value = data
    entityTableModalVisible.value = true
  }
  function closeEntityTableModal() {
    entityTableModalVisible.value = false
    entityTableModalData.value = null
  }

  function openTermLinkModal(data: { entityId: string; attrName: string; isEntityLevel?: boolean }) {
    termLinkModalData.value = data
    termLinkModalVisible.value = true
  }
  function closeTermLinkModal() {
    termLinkModalVisible.value = false
    termLinkModalData.value = null
  }

  function openFieldMappingModal(data: { entityId: string; attrName: string; isEntityLevel?: boolean }) {
    fieldMappingModalData.value = data
    fieldMappingModalVisible.value = true
  }
  function closeFieldMappingModal() {
    fieldMappingModalVisible.value = false
    fieldMappingModalData.value = null
  }

  function openRelationModal(data: {
    id?: string
    mode: 'add' | 'edit'
    sourceEntityId: string
    sourceEntityName: string
    targetEntityId: string
    targetEntityName: string
    relationName: string
    relationNameCn: string
    relationType?: '1:1' | '1:N' | 'N:N'
    isRequired?: boolean
    termId?: string
    termName?: string
  }) {
    relationModalData.value = data
    relationModalVisible.value = true
  }
  function closeRelationModal() {
    relationModalVisible.value = false
    relationModalData.value = null
  }

  function openConfigDrawer(nodeId: string) {
    configNodeId.value = nodeId
    configDrawerVisible.value = true
  }
  function closeConfigDrawer() {
    configDrawerVisible.value = false
    configNodeId.value = ''
  }

  return {
    viewMode,
    ideModalVisible,
    ideModalMode,
    sqlModalVisible,
    fieldModalVisible,
    renameModalVisible,
    reextractConfirmModalVisible,
    reextractProgressModalVisible,
    isReextract,
    moveDomainModalVisible,
    entityTableModalVisible,
    termLinkModalVisible,
    fieldMappingModalVisible,
    relationModalVisible,
    sqlTableName,
    fieldTableName,
    renameNodeId,
    movingEntityData,
    entityTableModalData,
    termLinkModalData,
    fieldMappingModalData,
    relationModalData,
    configDrawerVisible,
    configNodeId,
    switchViewMode,
    openIdeModal,
    closeIdeModal,
    openSqlModal,
    closeSqlModal,
    openFieldModal,
    closeFieldModal,
    openRenameModal,
    closeRenameModal,
    openReextractConfirmModal,
    closeReextractConfirmModal,
    openReextractProgressModal,
    closeReextractProgressModal,
    openMoveDomainModal,
    closeMoveDomainModal,
    openEntityTableModal,
    closeEntityTableModal,
    openTermLinkModal,
    closeTermLinkModal,
    openFieldMappingModal,
    closeFieldMappingModal,
    openRelationModal,
    closeRelationModal,
    openConfigDrawer,
    closeConfigDrawer
  }
})
