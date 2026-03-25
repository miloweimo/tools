import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { tools } from '../tools/tools'

const toolRoutes: RouteRecordRaw[] = tools.map((t) => ({
  path: t.path,
  name: t.name,
  component: t.component
}))

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    ...toolRoutes
  ]
})

export default router
