# 小工具：摄像头镜子

**日期**：2026-03-25  
**类型**：功能

## 改动说明

- 新增工具页 [`src/views/tools/CameraMirrorView.vue`](../../src/views/tools/CameraMirrorView.vue)：通过 `navigator.mediaDevices.getUserMedia` 获取视频流（`facingMode: 'user'`），在 `<video>` 中播放；使用 CSS `transform: scaleX(-1)` 做左右镜像；提供「开启摄像头」「关闭」按钮；`onBeforeUnmount` 与关闭时停止所有轨道并清空 `srcObject`。
- 在 [`src/tools/tools.ts`](../../src/tools/tools.ts) 注册路由 `/camera-mirror`，标题「摄像头镜子」，标签含摄像头、镜子、视频、前置，供首页导航与搜索。

## 任务与计划记录

详见 [guides/dev-tasks.md](../guides/dev-tasks.md) 中「里程碑：摄像头镜子」。
