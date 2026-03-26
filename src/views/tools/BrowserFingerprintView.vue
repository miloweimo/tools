<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  collectBrowserFingerprint,
  type FingerprintSection
} from '@/utils/browserFingerprint'

const sections = ref<FingerprintSection[] | null>(null)
const loadError = ref('')
const copyHint = ref('')

onMounted(async () => {
  loadError.value = ''
  try {
    sections.value = await collectBrowserFingerprint()
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    loadError.value = `采集失败：${msg}`
    sections.value = []
  }
})

const jsonExport = computed(() => {
  if (!sections.value) return ''
  return JSON.stringify(sections.value, null, 2)
})

async function copyAll() {
  copyHint.value = ''
  const text = jsonExport.value
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copyHint.value = '已复制到剪贴板'
  } catch {
    copyHint.value = '复制失败，请手动选择内容复制'
  }
  setTimeout(() => {
    copyHint.value = ''
  }, 2500)
}
</script>

<template>
  <main class="fp">
    <header class="fp-header">
      <h1>浏览器指纹查看</h1>
      <p class="lead">
        以下信息由本页在浏览器内直接读取，用于自查与调试；本站为静态页面，不会将数据上传到服务器。
      </p>
      <div class="actions">
        <button
          type="button"
          class="copy-btn"
          :disabled="!sections || !sections.length"
          @click="copyAll"
        >
          复制全部（JSON）
        </button>
        <span v-if="copyHint" class="copy-hint" role="status">{{ copyHint }}</span>
      </div>
    </header>

    <p v-if="!sections && !loadError" class="loading">正在采集…</p>
    <p v-else-if="loadError" class="error">{{ loadError }}</p>

    <template v-else>
      <section
        v-for="(sec, i) in sections"
        :key="sec.title"
        class="block"
        :aria-labelledby="'fp-section-' + i"
      >
        <h2 :id="'fp-section-' + i" class="block-title">{{ sec.title }}</h2>
        <dl class="rows">
          <template v-for="(r, j) in sec.rows" :key="sec.title + '|' + j + '|' + r.label">
            <dt class="label">{{ r.label }}</dt>
            <dd class="value">{{ r.value }}</dd>
          </template>
        </dl>
      </section>
    </template>
  </main>
</template>

<style scoped>
.fp {
  max-width: 48rem;
  margin: 0 auto;
  padding: 1.25rem 0 2rem;
}

.fp-header {
  margin-bottom: 1.25rem;
}

.fp-header h1 {
  font-size: 1.5rem;
  color: var(--color-heading);
  margin: 0 0 0.5rem;
}

.lead {
  color: var(--color-text);
  line-height: 1.6;
  margin: 0 0 1rem;
  font-size: 0.95rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
}

.copy-btn {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.copy-btn:hover:not(:disabled) {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.copy-hint {
  font-size: 0.82rem;
  color: var(--color-text);
  opacity: 0.9;
}

.loading,
.error {
  color: var(--color-text);
  margin: 0 0 1rem;
}

.error {
  color: hsl(0, 65%, 45%);
}

.block {
  margin-bottom: 1.75rem;
}

.block-title {
  font-size: 1.1rem;
  color: var(--color-heading);
  margin: 0 0 0.65rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--color-border);
}

.rows {
  display: grid;
  grid-template-columns: minmax(7rem, 11rem) 1fr;
  gap: 0.35rem 1rem;
  margin: 0;
}

@media (max-width: 520px) {
  .rows {
    grid-template-columns: 1fr;
  }

  .label {
    margin-top: 0.5rem;
  }

  .label:first-of-type {
    margin-top: 0;
  }
}

.label {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text);
  opacity: 0.88;
}

.value {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
