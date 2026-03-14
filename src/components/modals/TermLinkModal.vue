<template>
  <a-modal
    v-model:open="visible"
    title="术语关联"
    :width="520"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="term-select-content">
      <div class="term-search">
        <a-input
          v-model:value="searchText"
          placeholder="搜索术语..."
          allow-clear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
      </div>
      <div class="term-categories">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="term-category"
        >
          <div class="category-header">{{ category.name }}</div>
          <div class="term-list">
            <div
              v-for="term in category.terms"
              :key="term.id"
              :class="['term-item', { selected: selectedTermId === term.id }]"
              @click="selectedTermId = term.id"
            >
              <span class="term-name">{{ term.name }}</span>
              <span class="term-desc">{{ term.desc }}</span>
            </div>
          </div>
        </div>
        <a-empty v-if="filteredCategories.length === 0" description="未找到匹配的术语" />
      </div>
    </div>
    <template #footer>
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" @click="handleConfirm" :disabled="!selectedTermId">
        <CheckOutlined />
        确认
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SearchOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'
import { useUIStore } from '@/stores'

const uiStore = useUIStore()

const visible = computed({
  get: () => uiStore.termLinkModalVisible,
  set: (val) => {
    if (!val) uiStore.closeTermLinkModal()
  }
})

const modalData = computed(() => uiStore.termLinkModalData)

const searchText = ref('')
const selectedTermId = ref('')

// 模拟术语库数据
const termCategories = ref([
  {
    id: 'user',
    name: '用户相关',
    terms: [
      { id: 'term_001', name: '标准用户ID', desc: '用户唯一标识符' },
      { id: 'term_002', name: '联系电话', desc: '用户手机或固定电话' },
      { id: 'term_003', name: '身份证号', desc: '公民身份号码' },
      { id: 'term_004', name: '行政区划', desc: '省市区等行政区域' }
    ]
  },
  {
    id: 'order',
    name: '订单相关',
    terms: [
      { id: 'term_010', name: '订单编号', desc: '订单唯一标识' },
      { id: 'term_011', name: '订单金额', desc: '订单应付金额' },
      { id: 'term_012', name: '支付状态', desc: '订单支付状态' }
    ]
  },
  {
    id: 'product',
    name: '产品相关',
    terms: [
      { id: 'term_020', name: '产品编号', desc: '产品唯一标识' },
      { id: 'term_021', name: '产品规格', desc: '产品具体规格参数' },
      { id: 'term_022', name: '产品价格', desc: '产品销售价格' }
    ]
  }
])

const filteredCategories = computed(() => {
  if (!searchText.value) return termCategories.value
  const search = searchText.value.toLowerCase()
  return termCategories.value
    .map(cat => ({
      ...cat,
      terms: cat.terms.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.desc.toLowerCase().includes(search)
      )
    }))
    .filter(cat => cat.terms.length > 0)
})

function handleCancel() {
  searchText.value = ''
  selectedTermId.value = ''
  uiStore.closeTermLinkModal()
}

function handleConfirm() {
  if (!selectedTermId.value) return

  // 找到选中的术语
  let selectedTerm: { id: string; name: string } | undefined
  for (const cat of termCategories.value) {
    const term = cat.terms.find(t => t.id === selectedTermId.value)
    if (term) {
      selectedTerm = term
      break
    }
  }

  // 更新属性的术语关联
  if (modalData.value?.attrName) {
    // 这里需要调用 ontologyStore 更新
    // 暂时通过事件或直接修改实现
    console.log('Selected term:', selectedTerm)
  }

  handleCancel()
}
</script>

<style scoped>
.term-select-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.term-search {
  flex-shrink: 0;
}

.term-categories {
  max-height: 360px;
  overflow-y: auto;
}

.term-category {
  margin-bottom: 12px;
}

.category-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
  padding-left: 4px;
}

.term-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.term-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.term-item:hover {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.term-item.selected {
  border-color: var(--primary-color);
  background: var(--primary-light);
}

.term-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
}

.term-desc {
  font-size: 11px;
  color: var(--text-secondary);
}
</style>
