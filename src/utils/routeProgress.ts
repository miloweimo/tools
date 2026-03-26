import { ref } from 'vue'

/** 0–100，用于进度条宽度 */
export const routeProgress = ref(0)
/** 是否显示进度条容器（结束前短暂保持以播放完成动画） */
export const routeProgressActive = ref(false)

let bumpTimer: ReturnType<typeof setInterval> | null = null
let finishTimer: ReturnType<typeof setTimeout> | null = null

function clearTimers() {
  if (bumpTimer) {
    clearInterval(bumpTimer)
    bumpTimer = null
  }
  if (finishTimer) {
    clearTimeout(finishTimer)
    finishTimer = null
  }
}

export function startRouteProgress() {
  clearTimers()
  routeProgress.value = 0
  routeProgressActive.value = true
  requestAnimationFrame(() => {
    routeProgress.value = 12
  })
  bumpTimer = setInterval(() => {
    if (routeProgress.value < 90) {
      routeProgress.value += Math.random() * 9 + 3
      if (routeProgress.value > 90) routeProgress.value = 90
    }
  }, 350)
}

export function finishRouteProgress() {
  if (!routeProgressActive.value) return
  clearTimers()
  routeProgress.value = 100
  finishTimer = setTimeout(() => {
    routeProgressActive.value = false
    routeProgress.value = 0
  }, 320)
}
