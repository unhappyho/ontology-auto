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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
