# 哈希路由与移动端布局

**日期**：2026-03-25  
**类型**：修复 / 配置

## 改动说明

- **路由**：[`src/router/index.ts`](../../src/router/index.ts) 由 `createWebHistory` 改为 `createWebHashHistory`，与 `base: '/tools/'` 配合后，线上 URL 形如 `https://miloweimo.github.io/tools/#/camera-mirror`。
- **布局**：重写 [`src/assets/main.css`](../../src/assets/main.css)，移除原 Vue 模板在 `min-width: 1024px` 下对 `body` / `#app` 的 flex 居中与双栏 `grid`，改为以 **640px**、**1024px** 递增的 `#app` 内边距；各视图减少水平 `padding`，避免与 `#app` 叠加。
- **顶栏**：[`src/App.vue`](../../src/App.vue) 顶栏水平内边距改为 0，与 `#app` 对齐。
- **E2E**：[`cypress.config.ts`](../../cypress.config.ts) 的 `baseUrl` 与 [`package.json`](../../package.json) 中 `test:e2e` / `test:e2e:dev` 的等待 URL 改为 `http://localhost:4173/tools`，与 Vite `base` 一致。

## 任务记录

见 [guides/dev-tasks.md](../guides/dev-tasks.md) 中「里程碑：哈希路由与移动端布局」。
