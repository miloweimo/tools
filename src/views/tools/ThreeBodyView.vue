<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0

const N = 3
/** 像素坐标下需放大 G，否则 r³ 很大时加速度过小、轨迹几乎不动 */
const G = 6500
const MASS = 1
/** 距离软化，避免 r→0 发散 */
const SOFT = 22
/** 初速度相对原尺度的放大，使每帧位移约 1～2px 量级可见 */
const SPEED_MULT = 88

const colors = ['#e57373', '#64b5f6', '#81c784']

type Vec2 = { x: number; y: number }

let pos: Vec2[] = []
let vel: Vec2[] = []
let acc: Vec2[] = []

function randRange(a: number, b: number): number {
  return a + Math.random() * (b - a)
}

/** 每次进入或点击「重新随机」时生成随机初动量（总动量为 0，质心近似不动） */
function randomizeState(cx: number, cy: number, radius: number) {
  const angles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
  pos = angles.map((a) => ({
    x: cx + radius * Math.cos(a),
    y: cy + radius * Math.sin(a)
  }))
  const speedScale = randRange(0.55, 1.15) * (radius * 0.018) * SPEED_MULT
  const v: Vec2[] = []
  for (let i = 0; i < N; i++) {
    v.push({
      x: randRange(-1, 1) * speedScale,
      y: randRange(-1, 1) * speedScale
    })
  }
  let sx = 0
  let sy = 0
  for (let i = 0; i < N; i++) {
    sx += v[i].x
    sy += v[i].y
  }
  const invN = 1 / N
  for (let i = 0; i < N; i++) {
    v[i].x -= sx * invN
    v[i].y -= sy * invN
  }
  vel = v
  acc = computeAcc(pos)
}

function computeAcc(p: Vec2[]): Vec2[] {
  const a: Vec2[] = Array.from({ length: N }, () => ({ x: 0, y: 0 }))
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = p[j].x - p[i].x
      const dy = p[j].y - p[i].y
      const r2 = dx * dx + dy * dy + SOFT * SOFT
      const invR = 1 / Math.sqrt(r2)
      const invR3 = invR * invR * invR
      const s = G * MASS * invR3
      const fx = s * dx
      const fy = s * dy
      a[i].x += fx
      a[i].y += fy
      a[j].x -= fx
      a[j].y -= fy
    }
  }
  return a
}

/** 蛙跳：位置/速度较稳定，适合长时间积分 */
function step(dt: number) {
  for (let i = 0; i < N; i++) {
    vel[i].x += 0.5 * dt * acc[i].x
    vel[i].y += 0.5 * dt * acc[i].y
    pos[i].x += dt * vel[i].x
    pos[i].y += dt * vel[i].y
  }
  acc = computeAcc(pos)
  for (let i = 0; i < N; i++) {
    vel[i].x += 0.5 * dt * acc[i].x
    vel[i].y += 0.5 * dt * acc[i].y
  }
}

function drawFrame(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
  ctx.fillRect(0, 0, w, h)

  const substeps = 32
  const dt = 0.012 / substeps
  for (let s = 0; s < substeps; s++) step(dt)

  for (let i = 0; i < N; i++) {
    ctx.beginPath()
    ctx.arc(pos[i].x, pos[i].y, 7, 0, Math.PI * 2)
    ctx.fillStyle = colors[i]
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function loop() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const w = canvas.width
  const h = canvas.height
  drawFrame(ctx, w, h)
  rafId = requestAnimationFrame(loop)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
  const w = Math.max(1, Math.round(rect.width * dpr))
  const h = Math.max(1, Math.round(rect.height * dpr))
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w
    canvas.height = h
    const cx = w / 2
    const cy = h / 2
    const radius = Math.min(w, h) * 0.14
    randomizeState(cx, cy, radius)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#0d1117'
      ctx.fillRect(0, 0, w, h)
    }
  }
}

function reshuffle() {
  const canvas = canvasRef.value
  if (!canvas) return
  const w = canvas.width
  const h = canvas.height
  const cx = w / 2
  const cy = h / 2
  const radius = Math.min(w, h) * 0.14
  randomizeState(cx, cy, radius)
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = '#0d1117'
    ctx.fillRect(0, 0, w, h)
  }
}

let ro: ResizeObserver | null = null

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas?.parentElement) {
    ro = new ResizeObserver(() => resizeCanvas())
    ro.observe(canvas.parentElement)
  }
  resizeCanvas()
  rafId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  ro?.disconnect()
  ro = null
})
</script>

<template>
  <div class="three-body">
    <header class="toolbar">
      <h1>三体模拟</h1>
      <div class="actions">
        <button type="button" class="btn" @click="reshuffle">重新随机初速度</button>
      </div>
    </header>
    <p class="lead">
      画布上三个等质量质点在万有引力（带距离软化）下的运动；每次进入本页会随机初动量（总动量为零）。轨迹由拖尾显示。
    </p>
    <div class="stage">
      <canvas ref="canvasRef" class="sim-canvas" aria-label="三体运动模拟画布" />
    </div>
  </div>
</template>

<style scoped>
.three-body {
  max-width: 52rem;
  margin: 0 auto;
  padding: 0.75rem 0 2rem;
}

@media (min-width: 640px) {
  .three-body {
    padding-top: 1rem;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.toolbar h1 {
  font-size: 1.35rem;
  color: var(--color-heading);
  margin: 0;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.btn:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.lead {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.88;
}

.stage {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: min(72vh, 36rem);
  margin: 0 auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  background: #0d1117;
}

.sim-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
