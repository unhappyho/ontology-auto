<template>
  <aside class="sidebar">
    <div class="menu-item" :class="{ active: activeMenu === 'overview' }" @click="activeMenu = 'overview'">
      <HomeOutlined />
      概览
    </div>
    <div class="menu-group-title">
      <span>
        <LayerOutlined style="margin-right: 8px;" />
        语义建模
      </span>
      <DownOutlined style="font-size: 11px; color: #86909C;" />
    </div>
    <ul class="submenu">
      <li class="menu-item" :class="{ active: activeMenu === 'concept' }" @click="activeMenu = 'concept'">
        <PartitionOutlined />
        概念管理
      </li>
      <li class="menu-item" :class="{ active: activeMenu === 'entity' }" @click="activeMenu = 'entity'">
        <AppstoreOutlined />
        实体管理
      </li>
      <li class="menu-item" :class="{ active: activeMenu === 'event' }" @click="activeMenu = 'event'">
        <CalendarOutlined />
        事件管理
      </li>
      <li class="menu-item" :class="{ active: activeMenu === 'relation' }" @click="activeMenu = 'relation'">
        <BranchesOutlined />
        关系管理
      </li>
      <li class="menu-item active" :class="{ active: activeMenu === 'ontology' }" @click="activeMenu = 'ontology'">
        <DatabaseOutlined />
        本体构建
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { HomeOutlined, PartitionOutlined, AppstoreOutlined, CalendarOutlined, BranchesOutlined, DatabaseOutlined } from '@ant-design/icons-vue'

const activeMenu = ref('ontology')
</script>

<style scoped>
.sidebar {
  width: 220px;
  background-color: var(--bg-white);
  border-right: 1px solid var(--border-color);
  padding: 12px 8px;
  overflow-y: auto;
  flex-shrink: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 9px 14px;
  margin-bottom: 2px;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-regular);
  transition: all 0.2s;
  font-size: 14px;
}

.menu-item:hover {
  background-color: #f2f3f5;
}

.menu-item.active {
  background-color: var(--primary-light);
  color: var(--primary-color);
  font-weight: 500;
}

.menu-item :deep(.anticon) {
  width: 18px;
  margin-right: 10px;
  font-size: 15px;
  text-align: center;
}

.submenu {
  padding-left: 16px;
}

.submenu .menu-item {
  padding: 9px 14px 9px 22px;
}

.menu-group-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px;
  color: var(--text-main);
  font-size: 14px;
  cursor: pointer;
}
</style>
