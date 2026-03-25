import { describe, it, expect } from 'vitest'
import {
  buildCsv,
  csvEscapeCell,
  parseCsvGantt,
  parseCsvText,
  parseImportTable,
  normalizeDateCell
} from '../ganttIo'

describe('ganttIo', () => {
  it('csvEscapeCell quotes when needed', () => {
    expect(csvEscapeCell('a')).toBe('a')
    expect(csvEscapeCell('a,b')).toBe('"a,b"')
    expect(csvEscapeCell('say "hi"')).toBe('"say ""hi"""')
  })

  it('parseCsvText handles quoted commas', () => {
    expect(parseCsvText('a,"b,c",d')).toEqual([['a', 'b,c', 'd']])
  })

  it('buildCsv + parseCsvGantt roundtrip', () => {
    const csv = buildCsv('2026-01-01', '2026-01-10', false, [
      { title: 'T1', start: '2026-01-02', end: '2026-01-05', color: 'hsl(0 50% 50%)' }
    ])
    const { meta, rows } = parseCsvGantt(csv)
    expect(meta.rangeStart).toBe('2026-01-01')
    expect(meta.rangeEnd).toBe('2026-01-10')
    expect(meta.showWeekday).toBe(false)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      title: 'T1',
      start: '2026-01-02',
      end: '2026-01-05'
    })
  })

  it('parseImportTable reads excel-style meta + header', () => {
    const { meta, rows } = parseImportTable([
      ['rangeStart', '2026-02-01'],
      ['rangeEnd', '2026-02-28'],
      ['showWeekday', 1],
      [],
      ['任务名', '开始日期', '结束日期', '颜色'],
      ['A', '2026-02-05', '2026-02-07', '']
    ])
    expect(meta.rangeStart).toBe('2026-02-01')
    expect(meta.showWeekday).toBe(true)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.title).toBe('A')
  })

  it('normalizeDateCell accepts iso and slash dates', () => {
    expect(normalizeDateCell('2026-03-25')).toBe('2026-03-25')
    expect(normalizeDateCell('2026/3/5')).toBe('2026-03-05')
  })
})
