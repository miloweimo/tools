<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

/** 朝上的一面：阴=平面，阳=凸弧面 */
type Face = 'yin' | 'yang'

const leftUp = ref<Face>('yin')
const rightUp = ref<Face>('yang')
const tossing = ref(false)
const shakeEnabled = ref(false)
const motionHint = ref('')

let lastTossAt = 0
const TOSS_DEBOUNCE_MS = 900

const result = computed(() => {
  const l = leftUp.value
  const r = rightUp.value
  if (l !== r) {
    return {
      title: '圣杯',
      desc: '一阴一阳，神明示意可行、吉利。',
      tone: 'sheng' as const
    }
  }
  if (l === 'yang') {
    return {
      title: '笑杯',
      desc: '两凸面朝上，神明笑而不答；可再问一卦或把问题说得更具体。',
      tone: 'xiao' as const
    }
  }
  return {
    title: '阴杯',
    desc: '两平面朝上，示意否定或时机未到。',
    tone: 'yin' as const
  }
})

function randomFace(): Face {
  return Math.random() < 0.5 ? 'yin' : 'yang'
}

async function toss() {
  if (tossing.value) return
  const now = Date.now()
  if (now - lastTossAt < TOSS_DEBOUNCE_MS) return

  tossing.value = true
  lastTossAt = now
  await new Promise((r) => setTimeout(r, 550))
  leftUp.value = randomFace()
  rightUp.value = randomFace()
  tossing.value = false
}

function shakeStrength(e: DeviceMotionEvent): number {
  const a = e.acceleration
  if (a?.x != null && a.y != null && a.z != null) {
    return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z)
  }
  const g = e.accelerationIncludingGravity
  if (g?.x == null || g.y == null || g.z == null) return 0
  const mag = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z)
  return Math.abs(mag - 9.8)
}

function onDeviceMotion(e: DeviceMotionEvent) {
  if (!shakeEnabled.value || tossing.value) return
  const now = Date.now()
  if (now - lastTossAt < TOSS_DEBOUNCE_MS) return

  const s = shakeStrength(e)
  // 用户主动摇晃时，线加速度或重力偏差会明显增大
  if (s > 14) {
    void toss()
  }
}

async function enableShake() {
  motionHint.value = ''
  const DM = DeviceMotionEvent as typeof DeviceMotionEvent & {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  if (typeof DM.requestPermission === 'function') {
    try {
      const status = await DM.requestPermission()
      if (status !== 'granted') {
        motionHint.value = '未授权运动传感器，可继续使用按钮掷筊。'
        return
      }
    } catch {
      motionHint.value = '无法请求传感器权限。'
      return
    }
  }
  shakeEnabled.value = true
  window.addEventListener('devicemotion', onDeviceMotion, true)
}

function disableShake() {
  shakeEnabled.value = false
  window.removeEventListener('devicemotion', onDeviceMotion, true)
  motionHint.value = ''
}

onBeforeUnmount(() => {
  window.removeEventListener('devicemotion', onDeviceMotion, true)
})
</script>

<template>
  <div class="jiaobei">
    <header class="head">
      <h1>掷筊</h1>
      <p class="sub">
        模拟庙口擲筊：两片筊杯落地后，以平面或凸面朝上组合成圣杯、笑杯或阴杯。纯属娱乐。
      </p>
    </header>

    <div class="stage" :class="{ tossing }" aria-live="polite">
      <div class="bei-pair">
        <div class="bei-wrap">
          <span class="bei-label">左筊</span>
          <div class="bei" :class="[leftUp, { wobble: tossing }]">
            <span class="face-name">{{ leftUp === 'yin' ? '平面' : '凸面' }}</span>
            <span class="face-hint">朝上</span>
          </div>
        </div>
        <div class="bei-wrap">
          <span class="bei-label">右筊</span>
          <div class="bei" :class="[rightUp, { wobble: tossing }]">
            <span class="face-name">{{ rightUp === 'yin' ? '平面' : '凸面' }}</span>
            <span class="face-hint">朝上</span>
          </div>
        </div>
      </div>
    </div>

    <section class="result" :class="result.tone">
      <h2>{{ result.title }}</h2>
      <p>{{ result.desc }}</p>
    </section>

    <div class="actions">
      <button type="button" class="btn primary" :disabled="tossing" @click="toss">
        {{ tossing ? '掷出中…' : '掷筊' }}
      </button>
    </div>

    <section class="shake-section">
      <h3 class="shake-title">摇一摇</h3>
      <p class="shake-desc">
        在手机或平板上可开启运动检测，用力摇晃设备即可掷筊（与按钮共用冷却）。桌面浏览器通常无此传感器。
      </p>
      <div class="shake-actions">
        <button v-if="!shakeEnabled" type="button" class="btn" @click="enableShake">
          启用摇一摇
        </button>
        <button v-else type="button" class="btn" @click="disableShake">关闭摇一摇</button>
      </div>
      <p v-if="motionHint" class="motion-hint" role="status">{{ motionHint }}</p>
    </section>

    <p class="disclaimer">
      本页为文化趣味模拟，不构成任何迷信或决策建议；传感器行为因设备与浏览器而异。
    </p>
  </div>
</template>

<style scoped>
.jiaobei {
  max-width: 36rem;
  margin: 0 auto;
  padding: 0.75rem 0 2rem;
}

@media (min-width: 640px) {
  .jiaobei {
    padding-top: 1rem;
  }
}

.head {
  margin-bottom: 1.25rem;
}

.head h1 {
  font-size: 1.35rem;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
}

.sub {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
  opacity: 0.9;
}

.stage {
  margin-bottom: 1rem;
  padding: 1.25rem 0;
  border-radius: 12px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
}

.stage.tossing {
  opacity: 0.92;
}

.bei-pair {
  display: flex;
  justify-content: center;
  gap: clamp(1.5rem, 8vw, 2.5rem);
  align-items: flex-end;
}

.bei-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.bei-label {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.75;
}

.bei {
  width: 4.5rem;
  height: 6.5rem;
  border-radius: 50% 50% 45% 45% / 55% 55% 42% 42%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0.35rem;
  box-shadow: inset 0 -6px 12px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease, background 0.2s ease;
  border: 2px solid rgba(0, 0, 0, 0.12);
}

.bei.yin {
  background: linear-gradient(180deg, #c4a574 0%, #8b6914 55%, #6b4f0a 100%);
  color: #fff8e8;
}

.bei.yang {
  background: linear-gradient(180deg, #e8d4a8 0%, #c9a227 45%, #a67c00 100%);
  color: #2a2210;
  box-shadow:
    inset 0 4px 10px rgba(255, 255, 255, 0.35),
    inset 0 -8px 14px rgba(0, 0, 0, 0.18);
}

.face-name {
  font-size: 0.95rem;
  font-weight: 700;
}

.face-hint {
  font-size: 0.65rem;
  opacity: 0.85;
  margin-top: 0.15rem;
}

.bei.wobble {
  animation: wobble 0.55s ease-in-out;
}

@keyframes wobble {
  0%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
  20% {
    transform: rotate(-18deg) translateY(-4px);
  }
  50% {
    transform: rotate(14deg) translateY(-8px);
  }
  75% {
    transform: rotate(-10deg) translateY(-3px);
  }
}

.result {
  padding: 1rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  margin-bottom: 1.25rem;
}

.result h2 {
  margin: 0 0 0.4rem;
  font-size: 1.15rem;
  color: var(--color-heading);
}

.result p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--color-text);
}

.result.sheng {
  background: rgba(34, 139, 34, 0.08);
  border-color: rgba(34, 139, 34, 0.25);
}

.result.xiao {
  background: rgba(218, 165, 32, 0.1);
  border-color: rgba(184, 134, 11, 0.35);
}

.result.yin {
  background: rgba(70, 70, 90, 0.08);
  border-color: var(--color-border);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  border-radius: 8px;
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
  font-weight: 600;
  border-color: var(--color-border-hover);
}

.shake-section {
  padding: 1rem 0 0;
  border-top: 1px solid var(--color-border);
}

.shake-title {
  font-size: 1rem;
  margin: 0 0 0.35rem;
  color: var(--color-heading);
}

.shake-desc {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.9;
}

.shake-actions {
  display: flex;
  gap: 0.5rem;
}

.motion-hint {
  margin: 0.65rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text);
  opacity: 0.85;
}

.disclaimer {
  margin: 1.5rem 0 0;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.65;
}
</style>
