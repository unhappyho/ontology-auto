<template>
  <div class="ontology-panel">
    <div class="ontology-panel-header">
      <span class="ontology-panel-title">本体列表</span>
      <InfoCircleOutlined class="info-icon" />
    </div>
    <div class="ontology-panel-body">
      <div v-for="l1 in ontologyTree" :key="l1.id" :class="['onto-l1', { open: openL1.has(l1.id) }]">
        <div class="onto-l1-header" @click="toggleL1(l1.id)">
          <div class="onto-l1-icon" :style="{ background: l1.color }">
            <component :is="getIcon(l1.icon)" />
          </div>
          <span class="onto-l1-label">{{ l1.label }}</span>
          <span class="onto-l1-count">{{ getL1Total(l1) }}·{{ getL1New(l1) }}新</span>
          <RightOutlined class="onto-chevron" />
        </div>
        <div class="onto-l1-children">
          <div
            v-for="l2 in l1.children"
            :key="l2.id"
            :class="['onto-l2', { open: openL2.has(l2.id) }]"
          >
            <div class="onto-l2-header" @click="toggleL2(l2.id)">
              <div class="onto-l2-dot" :style="{ background: l2.color }">
                <component :is="getIcon(l2.icon)" />
              </div>
              <span class="onto-l2-label">{{ l2.label }}</span>
              <span class="onto-l2-count">{{ getL2Total(l2) }}·{{ getL2New(l2) }}新</span>
              <RightOutlined class="onto-chevron" />
            </div>
            <div class="onto-l2-children">
              <div
                v-for="leaf in l2.children"
                :key="leaf.id"
                :class="['onto-leaf', { active: currentOntologyId === leaf.id }]"
                @click="handleSelectLeaf(leaf.id, l2.id, l1.id)"
              >
                <div class="onto-leaf-dot" :style="{ background: leaf.color }"></div>
                <span class="onto-leaf-name">{{ leaf.label }}</span>
                <span class="onto-leaf-cnt">{{ leaf.total }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RightOutlined, InfoCircleOutlined } from '@ant-design/icons-vue'
import {
  UsergroupAddOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  TagOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  ControlOutlined,
  WifiOutlined,
  AudioOutlined,
  CloudServerOutlined,
  ConsoleSqlOutlined,
  AccountBookOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  StarOutlined
} from '@ant-design/icons-vue'
import { useOntologyStore } from '@/stores'
import { ONTOLOGY_TREE } from '@/constants'
import type { OntologyL1, OntologyL2 } from '@/types'

const ontologyStore = useOntologyStore()

const ontologyTree = ONTOLOGY_TREE
const openL1 = computed(() => ontologyStore.openL1)
const openL2 = computed(() => ontologyStore.openL2)
const currentOntologyId = computed(() => ontologyStore.currentOntologyId)

const iconMap: Record<string, any> = {
  UsergroupAddOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  ProfileOutlined,
  TagOutlined,
  AppstoreAddOutlined,
  UnorderedListOutlined,
  ControlOutlined,
  WifiOutlined,
  AudioOutlined,
  CloudServerOutlined,
  ConsoleSqlOutlined,
  AccountBookOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  SolutionOutlined,
  StarOutlined
}

function getIcon(iconName: string) {
  return iconMap[iconName] || UsergroupAddOutlined
}

function getL1Total(l1: OntologyL1): number {
  return l1.children.reduce((s, l2) => s + l2.children.reduce((ss, leaf) => ss + leaf.total, 0), 0)
}

function getL1New(l1: OntologyL1): number {
  return l1.children.reduce((s, l2) => s + l2.children.reduce((ss, leaf) => ss + leaf.newCnt, 0), 0)
}

function getL2Total(l2: OntologyL2): number {
  return l2.children.reduce((s, leaf) => s + leaf.total, 0)
}

function getL2New(l2: OntologyL2): number {
  return l2.children.reduce((s, leaf) => s + leaf.newCnt, 0)
}

function toggleL1(id: string) {
  ontologyStore.toggleL1(id)
}

function toggleL2(id: string) {
  ontologyStore.toggleL2(id)
}

function handleSelectLeaf(leafId: string, l2Id: string, l1Id: string) {
  ontologyStore.switchOntology(leafId, l2Id, l1Id)
}
</script>

<style scoped>
.ontology-panel {
  width: 260px;
  background: var(--bg-white);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.ontology-panel-header {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.ontology-panel-title {
  font-weight: 600;
  font-size: 13px;
}

.info-icon {
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
}

.ontology-panel-body {
  flex: 1;
  overflow-y: auto;
}

.onto-l1-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  cursor: pointer;
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  transition: background 0.15s;
  user-select: none;
}

.onto-l1-header:hover {
  background: #F2F3F5;
}

.onto-l1-icon {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

.onto-l1-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.onto-l1-count {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: normal;
  flex-shrink: 0;
}

.onto-chevron {
  font-size: 9px;
  color: var(--text-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.onto-l1.open > .onto-l1-header .onto-chevron {
  transform: rotate(90deg);
}

.onto-l1-children {
  display: none;
}

.onto-l1.open > .onto-l1-children {
  display: block;
}

.onto-l2-header {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px 6px 26px;
  cursor: pointer;
  color: var(--text-regular);
  font-size: 12px;
  font-weight: 500;
  transition: background 0.15s;
  user-select: none;
}

.onto-l2-header:hover {
  background: #F2F3F5;
}

.onto-l2-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: white;
  flex-shrink: 0;
}

.onto-l2-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.onto-l2-count {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: normal;
  flex-shrink: 0;
}

.onto-l2.open > .onto-l2-header .onto-chevron {
  transform: rotate(90deg);
}

.onto-l2-children {
  display: none;
}

.onto-l2.open > .onto-l2-children {
  display: block;
}

.onto-leaf {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px 5px 40px;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 12px;
  transition: all 0.15s;
  user-select: none;
}

.onto-leaf:hover {
  background: #F2F3F5;
  color: var(--text-main);
}

.onto-leaf.active {
  background: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.onto-leaf-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.onto-leaf-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.onto-leaf-cnt {
  font-size: 10px;
  flex-shrink: 0;
}

.onto-leaf.active .onto-leaf-cnt {
  color: var(--primary-color);
  opacity: 0.7;
}
</style>
