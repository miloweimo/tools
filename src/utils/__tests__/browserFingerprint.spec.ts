import { describe, it, expect } from 'vitest'
import { formatDisplayValue } from '../browserFingerprint'

describe('formatDisplayValue', () => {
  it('formats primitives', () => {
    expect(formatDisplayValue(undefined)).toBe('不可用')
    expect(formatDisplayValue(null)).toBe('null')
    expect(formatDisplayValue(true)).toBe('是')
    expect(formatDisplayValue(false)).toBe('否')
    expect(formatDisplayValue(42)).toBe('42')
    expect(formatDisplayValue('')).toBe('（空字符串）')
    expect(formatDisplayValue('hello')).toBe('hello')
  })

  it('formats NaN and Infinity as 不可用', () => {
    expect(formatDisplayValue(NaN)).toBe('不可用')
    expect(formatDisplayValue(Infinity)).toBe('不可用')
  })

  it('stringifies objects', () => {
    expect(formatDisplayValue({ a: 1 })).toBe('{"a":1}')
    expect(formatDisplayValue([1, 2])).toBe('[1,2]')
  })
})
