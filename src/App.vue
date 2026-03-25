<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import {
  getStoredTheme,
  isEffectiveDark,
  setStoredTheme,
  type ThemePreference
} from '@/utils/theme'

const isDark = ref(false)

function syncFromDom() {
  isDark.value = isEffectiveDark(getStoredTheme())
}

function toggleColorMode() {
  const next: ThemePreference = isDark.value ? 'light' : 'dark'
  setStoredTheme(next)
  isDark.value = isEffectiveDark(getStoredTheme())
}

let mq: MediaQueryList | null = null
function onSystemThemeChange() {
  if (getStoredTheme() === null) syncFromDom()
}

onMounted(() => {
  syncFromDom()
  mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', onSystemThemeChange)
})

onUnmounted(() => {
  mq?.removeEventListener('change', onSystemThemeChange)
})
</script>

<template>
  <div class="app">
    <header class="top">
      <RouterLink to="/" class="brand">小工具集</RouterLink>
      <div class="top-actions">
        <button
          type="button"
          class="theme-btn"
          :aria-pressed="isDark"
          :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="toggleColorMode"
        >
          {{ isDark ? '浅色' : '深色' }}
        </button>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  padding: 0.65rem 0;
  margin-bottom: 0.25rem;
}

.brand {
  font-weight: 600;
  color: var(--color-heading);
  text-decoration: none;
  font-size: 1rem;
}

.brand:hover {
  color: var(--color-text);
}

.top-actions {
  flex-shrink: 0;
}

.theme-btn {
  padding: 0.35rem 0.65rem;
  font-size: 0.82rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.theme-btn:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.theme-btn[aria-pressed='true'] {
  border-color: var(--color-border-hover);
}
</style>
