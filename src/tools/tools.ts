import type { ToolDefinition } from './types'

export const tools: ToolDefinition[] = [
  {
    name: 'about',
    path: '/about',
    title: '关于',
    description: '项目说明与相关信息。',
    tags: ['关于', '信息'],
    component: () => import('../views/AboutView.vue')
  },
  {
    name: 'placeholder',
    path: '/placeholder',
    title: '更多工具',
    description: '占位页面，后续可替换为具体小工具。',
    tags: ['占位', '即将上线'],
    component: () => import('../views/tools/PlaceholderToolView.vue')
  }
]
