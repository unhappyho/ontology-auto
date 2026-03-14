<template>
  <a-modal
    v-model:open="visible"
    :title="'调整实体所属域'"
    :width="520"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <p class="move-domain-desc">
      实体 <strong class="entity-name">{{ entityName }}</strong> 当前在
      <strong class="current-domain">{{ currentDomain }}</strong>，请选择目标域：
    </p>
    <div class="domain-tree">
      <div
        v-for="l1 in ontologyTree"
        :key="l1.id"
        class="domain-l1"
      >
        <div
          :class="['domain-l1-header', { selected: selectedL1Id === l1.id, expanded: expandedL1Ids.has(l1.id) }]"
          @click="toggleL1(l1.id)"
        >
          <RightOutlined class="expand-icon" />
          <div class="domain-l1-icon" :style="{ background: l1.color }">
            <component :is="getIcon(l1.icon)" />
          </div>
          <span class="domain-l1-label">{{ l1.label }}</span>
        </div>
        <div v-if="expandedL1Ids.has(l1.id)" class="domain-l2-list">
          <div
            v-for="l2 in l1.children"
            :key="l2.id"
            :class="['domain-l2-item', { selected: selectedL2Id === l2.id }]"
            @click="selectedL2Id = l2.id; selectedL1Id = l1.id"
          >
            <div class="domain-l2-icon" :style="{ background: l2.color }">
              <component :is="getIcon(l2.icon)" />
            </div>
            <span class="domain-l2-label">{{ l2.label }}</span>
            <CheckOutlined v-if="selectedL2Id === l2.id" class="check-icon" />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm" :disabled="!selectedL2Id">
        <CheckOutlined />
        确认调整
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckOutlined, RightOutlined } from '@ant-design/icons-vue'
import { useUIStore } from '@/stores'
import { ONTOLOGY_TREE } from '@/constants'
import {
  UsergroupAddOutlined,
  ShoppingCartOutlined,
  AppstoreAddOutlined,
  WifiOutlined,
  AccountBookOutlined,
  CustomerServiceOutlined,
  TeamOutlined,
  FileTextOutlined,
  ProfileOutlined,
  TagOutlined,
  UnorderedListOutlined,
  ControlOutlined,
  CloudServerOutlined,
  ConsoleSqlOutlined,
  CalendarOutlined,
  SolutionOutlined,
  StarOutlined
} from '@ant-design/icons-vue'

const uiStore = useUIStore()

const visible = computed(() => uiStore.moveDomainModalVisible)
const movingEntityData = computed(() => uiStore.movingEntityData)

const entityName = computed(() => {
  if (movingEntityData.value) {
    return `${movingEntityData.value.name}（${movingEntityData.value.nameCn}）`
  }
  return ''
})

const currentDomain = computed(() => movingEntityData.value?.domain || '')

const ontologyTree = ONTOLOGY_TREE
const selectedL1Id = ref<string | null>(null)
const selectedL2Id = ref<string | null>(null)
const expandedL1Ids = ref<Set<string>>(new Set())

function getIcon(iconName: string) {
  const iconMap: Record<string, any> = {
    UsergroupAddOutlined,
    ShoppingCartOutlined,
    AppstoreAddOutlined,
    WifiOutlined,
    AccountBookOutlined,
    CustomerServiceOutlined,
    TeamOutlined,
    FileTextOutlined,
    ProfileOutlined,
    TagOutlined,
    UnorderedListOutlined,
    ControlOutlined,
    CloudServerOutlined,
    ConsoleSqlOutlined,
    CalendarOutlined,
    SolutionOutlined,
    StarOutlined
  }
  return iconMap[iconName] || TeamOutlined
}

function toggleL1(l1Id: string) {
  if (expandedL1Ids.value.has(l1Id)) {
    expandedL1Ids.value.delete(l1Id)
  } else {
    expandedL1Ids.value.add(l1Id)
  }
  expandedL1Ids.value = new Set(expandedL1Ids.value)
}

function handleCancel() {
  selectedL1Id.value = null
  selectedL2Id.value = null
  uiStore.closeMoveDomainModal()
}

function handleConfirm() {
  if (!selectedL2Id.value) return

  const targetL2 = ontologyTree
    .find(l1 => l1.id === selectedL1Id.value)
    ?.children.find(l2 => l2.id === selectedL2Id.value)

  handleCancel()

  // 显示成功提示
  if (targetL2) {
    showSuccessToast(targetL2.label)
  }
}

function showSuccessToast(domainName: string) {
  const tip = document.createElement('div')
  tip.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1D2129;
    color: #fff;
    padding: 9px 18px;
    border-radius: 6px;
    font-size: 13px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 7px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `
  tip.innerHTML = `<span style="color: var(--success-color);">✓</span> 已成功调整至「${domainName}」`
  document.body.appendChild(tip)
  setTimeout(() => tip.remove(), 2500)
}
</script>

<style scoped>
.move-domain-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: 14px;
}

.entity-name {
  color: var(--text-main);
}

.current-domain {
  color: #722ED1;
}

.domain-tree {
  max-height: 400px;
  overflow-y: auto;
}

.domain-l1 {
  margin-bottom: 4px;
}

.domain-l1-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.domain-l1-header:hover {
  background: var(--primary-light);
}

.domain-l1-header.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.expand-icon {
  font-size: 10px;
  color: var(--text-secondary);
  transition: transform 0.2s;
}

.domain-l1-header.expanded .expand-icon {
  transform: rotate(90deg);
}

.domain-l1-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

.domain-l1-label {
  font-size: 13px;
  font-weight: 500;
}

.domain-l2-list {
  margin-left: 24px;
  margin-top: 4px;
}

.domain-l2-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}

.domain-l2-item:hover {
  background: #F2F3F5;
}

.domain-l2-item.selected {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.domain-l2-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  flex-shrink: 0;
}

.domain-l2-label {
  flex: 1;
  font-size: 12px;
  color: var(--text-regular);
}

.check-icon {
  color: var(--primary-color);
  font-size: 12px;
}
</style>
