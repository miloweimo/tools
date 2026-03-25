import type { RouteComponent } from 'vue-router'

export interface ToolDefinition {
  name: string
  path: string
  title: string
  description: string
  tags: string[]
  component: () => Promise<RouteComponent>
}
