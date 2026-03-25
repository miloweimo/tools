<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app">
    <header class="top">
      <RouterLink to="/" class="brand">小工具集</RouterLink>
    </header>
    <RouterView />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.top {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  padding: 0.65rem 1rem;
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
</style>
