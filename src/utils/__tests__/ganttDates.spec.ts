import { describe, it, expect } from 'vitest'
import {
  eachDateStrInRange,
  clampDateStr,
  formatISODateLocal,
  parseISODateLocal
} from '../ganttDates'

describe('ganttDates', () => {
  it('eachDateStrInRange returns inclusive days', () => {
    expect(eachDateStrInRange('2026-01-01', '2026-01-01')).toEqual(['2026-01-01'])
    expect(eachDateStrInRange('2026-01-01', '2026-01-03')).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03'
    ])
  })

  it('eachDateStrInRange swaps reversed range', () => {
    expect(eachDateStrInRange('2026-01-03', '2026-01-01')).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03'
    ])
  })

  it('eachDateStrInRange returns empty for invalid input', () => {
    expect(eachDateStrInRange('', '')).toEqual([])
    expect(eachDateStrInRange('bad', '2026-01-01')).toEqual([])
  })

  it('clampDateStr', () => {
    expect(clampDateStr('2026-06-15', '2026-06-01', '2026-06-30')).toBe('2026-06-15')
    expect(clampDateStr('2026-05-01', '2026-06-01', '2026-06-30')).toBe('2026-06-01')
    expect(clampDateStr('2026-07-01', '2026-06-01', '2026-06-30')).toBe('2026-06-30')
  })

  it('format and parse round-trip local date', () => {
    const d = new Date(2026, 2, 25)
    expect(formatISODateLocal(d)).toBe('2026-03-25')
    expect(formatISODateLocal(parseISODateLocal('2026-03-25'))).toBe('2026-03-25')
  })
})
