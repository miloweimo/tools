# 路由切换顶部进度条

**日期**：2026-03-26  
**类型**：功能

## 改动说明

- [`src/utils/routeProgress.ts`](../../src/utils/routeProgress.ts)：路由进度状态、`startRouteProgress` / `finishRouteProgress`（导航中缓慢增至约 90%，结束后拉满并淡出）。
- [`src/components/RouteProgressBar.vue`](../../src/components/RouteProgressBar.vue)：固定于视口顶部的细条，与站点主色（青绿）一致，含无障碍 `role="progressbar"`。
- [`src/router/index.ts`](../../src/router/index.ts)：`fullPath` 变化时开始进度；`afterEach` 与 `onError` 结束进度。
- [`src/App.vue`](../../src/App.vue)：挂载 `RouteProgressBar`。
