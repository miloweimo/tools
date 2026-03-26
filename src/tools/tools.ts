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
    name: 'three-body',
    path: '/three-body',
    title: '三体模拟',
    description: 'Canvas 上三个质点的万有引力运动，每次进入随机初动量。',
    tags: ['三体', '物理', 'Canvas', '模拟', '引力'],
    component: () => import('../views/tools/ThreeBodyView.vue')
  },
  {
    name: 'face-loading-ring',
    path: '/face-loading-ring',
    title: '人形进度环',
    description: '摄像头或上传照片，把脸部画面裁成环形进度扇区；可调环厚度与镜像。',
    tags: ['摄像头', '进度条', 'Canvas', '上传', '加载'],
    component: () => import('../views/tools/FaceLoadingRingView.vue')
  },
  {
    name: 'browser-fingerprint',
    path: '/browser-fingerprint',
    title: '浏览器指纹查看',
    description: '展示 Navigator、屏幕、时区、特性探测与 WebGL 等可读指纹信息，便于自查与调试。',
    tags: ['指纹', 'User-Agent', 'WebGL', '屏幕', '隐私', 'Navigator', 'UA-CH'],
    component: () => import('../views/tools/BrowserFingerprintView.vue')
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
