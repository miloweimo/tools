# 开发任务计划

本文档记录与「小工具集」站点相关的里程碑与任务勾选，便于 AI 或人工迭代时对齐进度。

## 里程碑：工具导航主页（2026-03-25）

**目标**：首页提供工具导航与搜索；路由与展示数据来自同一注册表；顶栏简化为工具集品牌。

### 任务清单

- [x] 数据层：在 `src/tools/` 定义 `ToolDefinition`、工具列表 `tools.ts`、`filterTools` 筛选逻辑
- [x] 路由：`src/router/index.ts` 由 `tools` 数组展开子路由，避免重复维护
- [x] 首页 UI：`src/views/HomeView.vue` 搜索框、卡片网格、`RouterLink` 跳转
- [x] 应用壳：`src/App.vue` 精简为顶栏品牌 + `RouterView`
- [x] 示例工具：关于页、占位工具页（`src/views/tools/PlaceholderToolView.vue`）
- [x] 测试：`src/tools/__tests__/filterTools.spec.ts` 覆盖筛选行为
- [x] 验收：`pnpm run type-check`、`pnpm exec vitest run` 通过；本地可访问 `/`、`/about`、`/placeholder`

### 后续待办（接入新工具）

1. 在 `src/views/tools/`（或 `src/views/`）新增工具页面组件。
2. 在 [`src/tools/tools.ts`](../../src/tools/tools.ts) 中追加一项：`name`、`path`、`title`、`description`、`tags`、`component`（懒加载）。
3. 无需再改路由：子路由由注册表自动生成。
4. 可选：为复杂逻辑补充单元测试，并在此文档或 changelog 中记一笔。

---

## 里程碑：摄像头镜子（2026-03-25）

**目标**：调用设备摄像头（优先前置），在页面镜像显示，用作「镜子」；离开页面时释放摄像头。

### 任务清单

- [x] 新增页面 `src/views/tools/CameraMirrorView.vue`：`getUserMedia`、`<video>` 展示、`scaleX(-1)` 镜像、关闭/卸载时 `stop()` 轨道
- [x] 在 [`src/tools/tools.ts`](../../src/tools/tools.ts) 注册工具：`/camera-mirror`，标题、描述、标签便于首页搜索
- [x] 权限与错误提示：拒绝权限、无设备等文案
- [x] 记录：本文件 + [`changelog/2026-03-25-camera-mirror.md`](../changelog/2026-03-25-camera-mirror.md)

### 说明

- 需 **HTTPS** 或 `localhost` 下浏览器才允许摄像头（与站点部署环境一致）。
- 首次使用需用户点击「开启摄像头」以满足用户手势策略。
