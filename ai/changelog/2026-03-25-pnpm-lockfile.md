# 统一包管理器为 pnpm

**日期**：2026-03-25  
**类型**：工具 / 编辑器

## 改动说明

- 删除与 pnpm 并存的 `package-lock.json`，避免 VS Code / Cursor 在 `npm.packageManager: auto` 下检测到多个锁文件并告警。
- 新增 [`.vscode/settings.json`](../../.vscode/settings.json)，设置 `"npm.packageManager": "pnpm"`，与工作区实际用法一致。

后续请只用 `pnpm install` / `pnpm add` 维护依赖，勿再生成 `package-lock.json`。
