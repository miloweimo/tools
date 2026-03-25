<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const errorMessage = ref('')
const isStarting = ref(false)

async function startCamera() {
  errorMessage.value = ''
  isStarting.value = true
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
    isStarting.value = false
  }
}

function stopCamera() {
  stream.value?.getTracks().forEach((t) => t.stop())
  stream.value = null
  const el = videoRef.value
  if (el) {
    el.srcObject = null
  }
}

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <div class="camera-mirror">
    <header class="toolbar">
      <h1>摄像头镜子</h1>
      <div class="actions">
        <button
          v-if="!stream"
          type="button"
          class="btn primary"
          :disabled="isStarting"
          @click="startCamera"
        >
          {{ isStarting ? '正在开启…' : '开启摄像头' }}
        </button>
        <button v-else type="button" class="btn" @click="stopCamera">关闭</button>
      </div>
    </header>

    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <div class="stage" :class="{ empty: !stream }">
      <video
        v-show="stream"
        ref="videoRef"
        class="mirror-video"
        playsinline
        muted
        aria-label="摄像头画面（镜像）"
      />
      <p v-if="!stream && !errorMessage && !isStarting" class="hint">
        点击「开启摄像头」使用前置画面作为镜子（需浏览器授权）。画面仅在本机显示，不会上传。
      </p>
    </div>
  </div>
</template>

<style scoped>
.camera-mirror {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
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
  aspect-ratio: 4 / 3;
  max-height: min(70vh, 32rem);
  margin: 0 auto;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage.empty {
  min-height: 12rem;
}

.mirror-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scaleX(-1);
}

.hint {
  margin: 0 1.25rem;
  text-align: center;
  color: var(--color-text);
  opacity: 0.85;
  font-size: 0.9rem;
  line-height: 1.55;
}
</style>
