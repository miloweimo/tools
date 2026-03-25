import type { ToolDefinition } from './types'

export function filterTools(query: string, list: readonly ToolDefinition[]): ToolDefinition[] {
  const q = query.trim().toLowerCase()
  if (!q) return [...list]
  return list.filter((t) => {
    if (t.title.toLowerCase().includes(q)) return true
    if (t.description.toLowerCase().includes(q)) return true
    return t.tags.some((tag) => tag.toLowerCase().includes(q))
  })
}
