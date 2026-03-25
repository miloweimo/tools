<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)

const stream = ref<MediaStream | null>(null)
const uploadedUrl = ref<string | null>(null)
const imageReady = ref(false)

const errorMessage = ref('')
const isStartingCamera = ref(false)

const progress = ref(72)
const ringThicknessPct = ref(18)
const mirror = ref(true)
const autoDemo = ref(false)

const autoProgress = ref(0)
let autoStartTime = 0

const displayProgress = computed(() => (autoDemo.value ? autoProgress.value : progress.value))

let rafId = 0
let alive = false
let resizeObserver: ResizeObserver | null = null

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  let sw: number
  let sh: number
  if (source instanceof HTMLVideoElement) {
    sw = source.videoWidth
    sh = source.videoHeight
  } else {
    const img = source as HTMLImageElement
    sw = img.naturalWidth
    sh = img.naturalHeight
  }
  if (!sw || !sh) return

  const scale = Math.max(dw / sw, dh / sh)
  const cw = dw / scale
  const ch = dh / scale
  const sx = (sw - cw) / 2
  const sy = (sh - ch) / 2
  ctx.drawImage(source, sx, sy, cw, ch, dx, dy, dw, dh)
}

function readCssColor(varName: string, fallback: string) {
  if (typeof document === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  return v || fallback
}

/** 仅在实际尺寸变化时改 buffer，避免每帧设 width/height 导致画布被清空、闪烁。 */
function syncCanvasSize(): number {
  const wrap = stageRef.value
  const canvas = canvasRef.value
  if (!wrap || !canvas) return 360

  const w = Math.min(420, Math.max(240, wrap.clientWidth || 360))
  const dpr = window.devicePixelRatio || 1
  const bw = Math.round(w * dpr)
  const bh = Math.round(w * dpr)
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw
    canvas.height = bh
  }
  canvas.style.width = `${w}px`
  canvas.style.height = `${w}px`
  return w
}

function getSource(): CanvasImageSource | null {
  const video = videoRef.value
  if (stream.value && video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return video
  }
  const img = imageRef.value
  if (uploadedUrl.value && imageReady.value && img && img.naturalWidth > 0) {
    return img
  }
  return null
}

function drawFrame(now?: number) {
  const canvas = canvasRef.value
  if (!canvas || !alive) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const logicalW = syncCanvasSize()
  const logicalH = logicalW
  const dpr = window.devicePixelRatio || 1
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  if (autoDemo.value) {
    const t = now ?? performance.now()
    if (!autoStartTime) autoStartTime = t
    const elapsed = (t - autoStartTime) / 1000
    autoProgress.value = (Math.sin(elapsed * 1.1) * 0.5 + 0.5) * 100
  } else {
    autoStartTime = 0
  }

  const cx = logicalW / 2
  const cy = logicalH / 2
  const rOuter = Math.min(logicalW, logicalH) * 0.46
  const tRatio = ringThicknessPct.value / 100
  const rInner = rOuter * (1 - Math.min(0.45, Math.max(0.08, tRatio)))

  const trackColor = readCssColor('--color-border', 'rgba(120,120,120,0.35)')
  const centerBg = readCssColor('--color-background-mute', '#e8e8e8')
  const textColor = readCssColor('--color-heading', '#2c3e50')

  ctx.clearRect(0, 0, logicalW, logicalH)

  const midR = (rOuter + rInner) / 2
  ctx.strokeStyle = trackColor
  ctx.lineWidth = rOuter - rInner
  ctx.lineCap = 'butt'
  ctx.beginPath()
  ctx.arc(cx, cy, midR, 0, Math.PI * 2)
  ctx.stroke()

  const p = displayProgress.value
  const source = getSource()

  if (source && p > 0.5) {
    const start = -Math.PI / 2
    const end = start + (Math.min(100, p) / 100) * 2 * Math.PI

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, rOuter, start, end, false)
    ctx.arc(cx, cy, rInner, end, start, true)
    ctx.closePath()
    ctx.clip()

    if (mirror.value) {
      ctx.translate(cx, cy)
      ctx.scale(-1, 1)
      ctx.translate(-cx, -cy)
    }

    drawImageCover(ctx, source, 0, 0, logicalW, logicalH)
    ctx.restore()
  }

  ctx.fillStyle = centerBg
  ctx.beginPath()
  ctx.arc(cx, cy, Math.max(0, rInner - 1), 0, Math.PI * 2)
  ctx.fill()

  const label =
    source || stream.value || uploadedUrl.value
      ? `${Math.round(Math.min(100, Math.max(0, p)))}%`
      : '—'
  const fontSize = Math.max(14, Math.min(42, rInner * 0.38))
  ctx.font = `600 ${fontSize}px system-ui, sans-serif`
  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)
}

function loop(t: number) {
  if (!alive) return
  drawFrame(t)
  rafId = requestAnimationFrame(loop)
}

async function startCamera() {
  errorMessage.value = ''
  isStartingCamera.value = true
  clearUpload()
  try {
    const media = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    })
    stream.value = media
    const el = videoRef.value
    if (el) {
      el.srcObject = media
      await el.play()
    }
    mirror.value = true
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
      errorMessage.value = '无法访问摄像头：已拒绝权限。请在浏览器设置中允许本站使用摄像头。'
    } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
      errorMessage.value = '未检测到可用摄像头。'
    } else {
      errorMessage.value = `无法打开摄像头：${msg}`
    }
    stream.value = null
  } finally {
    isStartingCamera.value = false
  }
}

function stopCamera() {
  stream.value?.getTracks().forEach((tr) => tr.stop())
  stream.value = null
  const el = videoRef.value
  if (el) {
    el.srcObject = null
  }
}

function clearUpload() {
  if (uploadedUrl.value) {
    URL.revokeObjectURL(uploadedUrl.value)
    uploadedUrl.value = null
  }
  imageReady.value = false
  const img = imageRef.value
  if (img) img.removeAttribute('src')
}

function onPickFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !file.type.startsWith('image/')) return

  errorMessage.value = ''
  stopCamera()
  clearUpload()

  uploadedUrl.value = URL.createObjectURL(file)
  const img = imageRef.value
  if (img) {
    img.src = uploadedUrl.value
  }
}

function onImageLoad() {
  imageReady.value = true
}

function onImageError() {
  imageReady.value = false
  errorMessage.value = '图片无法加载，请换一张试试。'
  clearUpload()
}

onMounted(() => {
  alive = true
  rafId = requestAnimationFrame(loop)

  resizeObserver = new ResizeObserver(() => {
    drawFrame()
  })
  if (stageRef.value) resizeObserver.observe(stageRef.value)
})

onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  resizeObserver = null
  stopCamera()
  clearUpload()
})
</script>

<template>
  <div class="face-ring">
    <header class="toolbar">
      <h1>人形进度环</h1>
      <div class="actions">
        <label class="file-btn">
          <input type="file" accept="image/*" class="visually-hidden" @change="onPickFile" />
          上传照片
        </label>
        <button
          v-if="!stream"
          type="button"
          class="btn primary"
          :disabled="isStartingCamera"
          @click="startCamera"
        >
          {{ isStartingCamera ? '正在开启…' : '开启摄像头' }}
        </button>
        <button v-else type="button" class="btn" @click="stopCamera">关闭摄像头</button>
      </div>
    </header>

    <p class="intro">
      将脸部画面通过 Canvas
      裁剪为环形扇区，模拟「人形加载条」。画面仅在本机处理，不会上传。需
      <strong>HTTPS</strong> 或 <strong>localhost</strong> 才能稳定使用摄像头。
    </p>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <div ref="stageRef" class="stage">
      <canvas ref="canvasRef" class="ring-canvas" aria-label="人形进度环画布" />
      <video
        ref="videoRef"
        class="hidden-source"
        playsinline
        muted
        aria-hidden="true"
      />
      <img
        ref="imageRef"
        alt=""
        class="hidden-source"
        decoding="async"
        @load="onImageLoad"
        @error="onImageError"
      />
    </div>

    <div class="controls">
      <label class="field">
        <span class="field-label">进度 {{ Math.round(displayProgress) }}%</span>
        <input
          v-model.number="progress"
          type="range"
          min="0"
          max="100"
          step="1"
          :disabled="autoDemo"
        />
      </label>

      <label class="field">
        <span class="field-label">环厚度 {{ ringThicknessPct }}%</span>
        <input v-model.number="ringThicknessPct" type="range" min="10" max="32" step="1" />
      </label>

      <label class="check">
        <input v-model="mirror" type="checkbox" />
        水平镜像（自拍方向）
      </label>

      <label class="check">
        <input v-model="autoDemo" type="checkbox" />
        自动演示进度（正弦摆动）
      </label>
    </div>
  </div>
</template>

<style scoped>
.face-ring {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0.75rem 0 2rem;
}

@media (min-width: 640px) {
  .face-ring {
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
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
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

.btn:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn.primary {
  border-color: var(--color-border-hover);
  font-weight: 500;
}

.file-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
}

.file-btn:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.intro {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.88;
  margin: 0 0 1rem;
}

.error {
  color: var(--color-text);
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.65rem 0.85rem;
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.stage {
  position: relative;
  width: 100%;
  max-width: 420px;
  margin: 0 auto 1.25rem;
  aspect-ratio: 1;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.hidden-source {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
  left: 0;
  top: 0;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 420px;
  margin: 0 auto;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.88rem;
  color: var(--color-text);
}

.field input[type='range'] {
  width: 100%;
}

.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  color: var(--color-text);
  cursor: pointer;
}

.check input {
  width: 1rem;
  height: 1rem;
}
</style>
