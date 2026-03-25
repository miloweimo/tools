<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { filterTools } from '@/tools/filterTools'
import { tools } from '@/tools/tools'

const query = ref('')

const filteredTools = computed(() => filterTools(query.value, tools))
</script>

<template>
  <main class="home">
    <header class="hero">
      <h1>小工具集</h1>
      <p class="lead">导航与搜索站内小工具</p>
      <label class="search-label">
        <span class="visually-hidden">搜索工具</span>
        <input
          v-model="query"
          type="search"
          class="search-input"
          placeholder="按名称、描述或标签搜索…"
          autocomplete="off"
        />
      </label>
    </header>

    <section v-if="filteredTools.length" class="grid" aria-label="工具列表">
      <RouterLink
        v-for="tool in filteredTools"
        :key="tool.name"
        :to="tool.path"
        class="card"
      >
        <h2 class="card-title">{{ tool.title }}</h2>
        <p class="card-desc">{{ tool.description }}</p>
        <ul class="tags" aria-label="标签">
          <li v-for="tag in tool.tags" :key="tag" class="tag">{{ tag }}</li>
        </ul>
      </RouterLink>
    </section>

    <p v-else class="empty">没有匹配的工具，试试其他关键词。</p>
  </main>
</template>

<style scoped>
.home {
  max-width: 56rem;
  margin: 0 auto;
  padding: 1rem 1rem 2rem;
}

.hero {
  margin-bottom: 1.75rem;
}

.hero h1 {
  font-size: 1.75rem;
  color: var(--color-heading);
  margin: 0 0 0.35rem;
}

.lead {
  color: var(--color-text);
  opacity: 0.85;
  margin: 0 0 1rem;
  font-size: 0.95rem;
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

.search-label {
  display: block;
}

.search-input {
  width: 100%;
  max-width: 28rem;
  box-sizing: border-box;
  padding: 0.55rem 0.75rem;
  font-size: 1rem;
  color: var(--color-text);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.search-input:focus {
  outline: 2px solid var(--color-border-hover);
  outline-offset: 1px;
}

.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
}

.card {
  display: block;
  padding: 1rem 1.1rem;
  text-decoration: none;
  color: inherit;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.card:hover {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
}

.card-title {
  font-size: 1.1rem;
  color: var(--color-heading);
  margin: 0 0 0.4rem;
}

.card-desc {
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text);
  opacity: 0.9;
  margin: 0 0 0.65rem;
}

.tags {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border);
  color: var(--color-text);
  opacity: 0.85;
}

.empty {
  color: var(--color-text);
  opacity: 0.8;
  margin: 2rem 0 0;
}
</style>
