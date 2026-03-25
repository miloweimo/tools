# 手动浅色 / 深色模式

**日期**：2026-03-25  
**类型**：功能

## 改动说明

- [`src/assets/base.css`](../../src/assets/base.css)：语义色在 `prefers-color-scheme: dark` 下仅当 **未** 设置 `html[data-theme]` 时生效；新增 `data-theme="dark"` / `data-theme="light"` 覆盖系统；补充 `--gantt-bar-text` / `--gantt-bar-text-shadow` 供甘特条文字随主题变化。
- [`src/utils/theme.ts`](../../src/utils/theme.ts)：`localStorage` 键 `tools-theme`（`light` | `dark`），`applyThemeToDocument` / `isEffectiveDark` 等。
- [`src/main.ts`](../../src/main.ts)：首屏前同步应用已存主题，减轻闪烁。
- [`src/App.vue`](../../src/App.vue)：顶栏右侧「深色 / 浅色」切换按钮；未保存偏好时仍跟随系统，并监听 `prefers-color-scheme` 变化。
- [`src/views/tools/GanttChartView.vue`](../../src/views/tools/GanttChartView.vue)：任务条文字改用上述 CSS 变量。
- [`src/utils/__tests__/theme.spec.ts`](../../src/utils/__tests__/theme.spec.ts)：基础单测。
