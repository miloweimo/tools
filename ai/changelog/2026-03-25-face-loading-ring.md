# 小工具：人形进度环

**日期**：2026-03-25  
**类型**：功能

## 改动说明

- 新增工具页 [`src/views/tools/FaceLoadingRingView.vue`](../../src/views/tools/FaceLoadingRingView.vue)：支持 **上传图片** 或 **前置摄像头**（`getUserMedia`）；隐藏 `<video>` / `<img>` 作为源，用 **Canvas** 将画面以 `object-fit: cover` 逻辑铺满后，按 **圆环扇区**（外弧 + 内弧）`clip` 绘制，形成「人形加载条」效果；中心圆显示进度百分比；提供进度滑杆、环厚度、水平镜像、自动演示（正弦摆动）；`ResizeObserver` 与画布尺寸变更时仅在宽高变化时重置 `canvas` 缓冲，避免每帧闪烁。
- 在 [`src/tools/tools.ts`](../../src/tools/tools.ts) 注册路由 `/face-loading-ring`，标题「人形进度环」，标签含摄像头、进度条、Canvas、上传、加载。

## 任务与计划记录

详见 [guides/dev-tasks.md](../guides/dev-tasks.md) 中「里程碑：人形进度环」。
