# 工具导航主页与开发任务记录

**日期**：2026-03-25  
**类型**：功能

## 改动说明

- 将首页改为「小工具集」导航页：支持按标题、描述、标签搜索，卡片进入各工具路由。
- 引入单一数据源 [`src/tools/tools.ts`](../../src/tools/tools.ts)，[`src/router/index.ts`](../../src/router/index.ts) 据此注册子路由。
- 精简 [`src/App.vue`](../../src/App.vue) 顶栏，品牌链回首页。
- 新增占位工具页 [`src/views/tools/PlaceholderToolView.vue`](../../src/views/tools/PlaceholderToolView.vue)；更新关于页文案与样式。
- 新增 [`src/tools/filterTools.ts`](../../src/tools/filterTools.ts) 及对应 Vitest 用例。

## 文档

- 开发任务计划：[guides/dev-tasks.md](../guides/dev-tasks.md)
