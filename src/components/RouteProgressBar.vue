<script setup lang="ts">
import { routeProgress, routeProgressActive } from '@/utils/routeProgress'
</script>

<template>
  <div
    class="route-progress"
    :class="{ 'route-progress--visible': routeProgressActive }"
    role="progressbar"
    :aria-valuenow="Math.round(routeProgress)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="页面加载中"
  >
    <div
      class="route-progress__bar"
      :style="{ width: `${routeProgress}%` }"
    />
  </div>
</template>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  height: 3px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.route-progress--visible {
  opacity: 1;
}

.route-progress__bar {
  height: 100%;
  width: 0;
  background: linear-gradient(
    90deg,
    hsla(160, 84%, 32%, 1),
    hsla(160, 100%, 42%, 1)
  );
  box-shadow: 0 0 8px hsla(160, 100%, 37%, 0.45);
  transition: width 0.22s ease-out;
}
</style>
