import type { ToolDefinition } from './types'

export const tools: ToolDefinition[] = [
  {
    name: 'gantt',
    path: '/gantt',
    title: '甘特图',
    description: '按日期排任务条，可拖拽调整工期；支持自定义范围与星期显示。',
    tags: ['甘特图', '项目', '任务', '日期', '拖拽'],
    component: () => import('../views/tools/GanttChartView.vue')
  },
  {
    name: 'jiaobei',
    path: '/jiaobei',
    title: '掷筊',
    description: '模拟圣杯、笑杯、阴杯；支持摇一摇掷筊。',
    tags: ['掷筊', '圣杯', '算命', '摇一摇', 'DeviceMotion'],
    component: () => import('../views/tools/JiaobeiView.vue')
  },
  {
    name: 'camera-mirror',
    path: '/camera-mirror',
    title: '摄像头镜子',
    description: '调用前置摄像头，镜像显示，当作镜子使用。',
    tags: ['摄像头', '镜子', '视频', '前置'],
    component: () => import('../views/tools/CameraMirrorView.vue')
  },
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
