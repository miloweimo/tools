import { describe, it, expect } from 'vitest'
import { filterTools } from '../filterTools'
import type { ToolDefinition } from '../types'

const sample: ToolDefinition[] = [
  {
    name: 'a',
    path: '/a',
    title: '编码',
    description: 'Base64 相关',
    tags: ['编码', 'base64'],
    component: async () => ({ template: '<div/>' })
  },
  {
    name: 'b',
    path: '/b',
    title: '关于',
    description: '说明文档',
    tags: ['信息'],
    component: async () => ({ template: '<div/>' })
  }
]

describe('filterTools', () => {
  it('returns full list when query is empty or whitespace', () => {
    expect(filterTools('', sample)).toEqual(sample)
    expect(filterTools('   ', sample)).toEqual(sample)
  })

  it('matches title case-insensitively', () => {
    expect(filterTools('编码', sample).map((t) => t.name)).toEqual(['a'])
    expect(filterTools('ABOUT', [])).toEqual([])
  })

  it('matches description', () => {
    expect(filterTools('base64', sample).map((t) => t.name)).toEqual(['a'])
    expect(filterTools('说明', sample).map((t) => t.name)).toEqual(['b'])
  })

  it('matches tag substring', () => {
    expect(filterTools('信息', sample).map((t) => t.name)).toEqual(['b'])
  })
})
