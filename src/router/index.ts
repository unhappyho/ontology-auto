import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'List',
    component: () => import('@/views/ListView.vue')
  },
  {
    path: '/task',
    name: 'Task',
    component: () => import('@/views/TaskView.vue')
  },
  {
    path: '/task/:id',
    name: 'TaskEdit',
    component: () => import('@/views/TaskView.vue')
  },
  {
    path: '/factory',
    name: 'Factory',
    component: () => import('@/views/FactoryView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
