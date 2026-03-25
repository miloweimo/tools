import * as XLSX from 'xlsx'
import { formatISODateLocal, isValidISODate } from './ganttDates'

export interface GanttExportTask {
  title: string
  start: string
  end: string
  color: string
}

export interface GanttImportMeta {
  rangeStart?: string
  rangeEnd?: string
  showWeekday?: boolean
}

export interface GanttImportRow {
  title: string
  start: string
  end: string
  color: string
}

const HEADER_ZH = ['任务名', '开始日期', '结束日期', '颜色'] as const

/** CSV 单元格转义 */
export function csvEscapeCell(s: string): string {
  const t = String(s)
  if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`
  return t
}

/** 简易 CSV 行解析（支持引号内逗号） */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  const t = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < t.length; i++) {
    const c = t[i]!
    if (inQuotes) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\r') {
      continue
    } else if (c === '\n') {
      row.push(field)
      if (row.some((x) => x.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += c
    }
  }
  row.push(field)
  if (row.some((x) => x.trim() !== '')) rows.push(row)
  return rows
}

/** Excel 序列日 → 本地 YYYY-MM-DD（1900 日期系） */
export function excelSerialToLocalDateStr(n: number): string {
  const ms = (n - 25569) * 86400 * 1000
  return formatISODateLocal(new Date(ms))
}

export function normalizeDateCell(v: unknown): string {
  if (v == null || v === '') return ''
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return formatISODateLocal(v)
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    if (v > 20000 && v < 120000) return excelSerialToLocalDateStr(v)
  }
  const s = String(v).trim()
  const iso = s.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso) && isValidISODate(iso)) return iso
  const m = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/)
  if (m) {
    const y = m[1]!
    const mo = m[2]!.padStart(2, '0')
    const d = m[3]!.padStart(2, '0')
    const out = `${y}-${mo}-${d}`
    if (isValidISODate(out)) return out
  }
  return ''
}

export function buildCsv(
  rangeStart: string,
  rangeEnd: string,
  showWeekday: boolean,
  tasks: GanttExportTask[]
): string {
  const lines: string[] = [
    '#GANTT-V1',
    `#rangeStart,${csvEscapeCell(rangeStart)}`,
    `#rangeEnd,${csvEscapeCell(rangeEnd)}`,
    `#showWeekday,${showWeekday ? 1 : 0}`,
    HEADER_ZH.join(',')
  ]
  for (const t of tasks) {
    lines.push(
      [t.title, t.start, t.end, t.color].map(csvEscapeCell).join(',')
    )
  }
  return `\uFEFF${lines.join('\r\n')}`
}

export function parseImportTable(rows: unknown[][]): {
  meta: GanttImportMeta
  rows: GanttImportRow[]
} {
  const meta: GanttImportMeta = {}
  let i = 0

  for (; i < rows.length; i++) {
    const r = rows[i]
    if (!r || r.length === 0) continue
    const c0 = String(r[0] ?? '').trim()
    if (c0.startsWith('#')) {
      const key = c0.slice(1)
      const val = String(r[1] ?? '').trim()
      if (key === 'GANTT-V1') continue
      if (key === 'rangeStart' && val) meta.rangeStart = val.slice(0, 10)
      else if (key === 'rangeEnd' && val) meta.rangeEnd = val.slice(0, 10)
      else if (key === 'showWeekday') {
        const v = val.toLowerCase()
        if (v === '1' || v === 'true' || v === 'yes') meta.showWeekday = true
        else if (v === '0' || v === 'false' || v === 'no') meta.showWeekday = false
      }
      continue
    }
    if (c0 === 'rangeStart' && r[1] != null) {
      meta.rangeStart = String(r[1]).trim().slice(0, 10)
      continue
    }
    if (c0 === 'rangeEnd' && r[1] != null) {
      meta.rangeEnd = String(r[1]).trim().slice(0, 10)
      continue
    }
    if (c0 === 'showWeekday' && r[1] != null) {
      const v = String(r[1]).trim().toLowerCase()
      if (v === '1' || v === 'true' || v === 'yes') meta.showWeekday = true
      else if (v === '0' || v === 'false' || v === 'no') meta.showWeekday = false
      continue
    }
    const lc = c0.toLowerCase()
    if (c0 === '任务名' || lc === 'title') {
      break
    }
  }

  const headerIdx = i
  if (headerIdx >= rows.length) return { meta, rows: [] }

  const header = rows[headerIdx]!.map((c) => String(c ?? '').trim())
  const col: { title?: number; start?: number; end?: number; color?: number } = {}
  for (let j = 0; j < header.length; j++) {
    const h = header[j]!
    const hl = h.toLowerCase()
    if (h === '任务名' || hl === 'title') col.title = j
    else if (h === '开始日期' || hl === 'start') col.start = j
    else if (h === '结束日期' || hl === 'end') col.end = j
    else if (h === '颜色' || hl === 'color') col.color = j
  }

  const ti = col.title ?? 0
  const si = col.start ?? 1
  const ei = col.end ?? 2
  const ci = col.color ?? 3

  const out: GanttImportRow[] = []
  for (let r = headerIdx + 1; r < rows.length; r++) {
    const row = rows[r]
    if (!row || row.every((c) => c === '' || c == null)) continue
    const title = String(row[ti] ?? '').trim()
    let start = normalizeDateCell(row[si])
    let end = normalizeDateCell(row[ei])
    const colorRaw = row[ci]
    const color =
      colorRaw != null && String(colorRaw).trim() !== ''
        ? String(colorRaw).trim()
        : 'hsl(200 52% 62% / 0.88)'
    if (!title || !start || !end) continue
    if (!isValidISODate(start) || !isValidISODate(end)) continue
    if (start > end) [start, end] = [end, start]
    out.push({ title, start, end, color })
  }

  return { meta, rows: out }
}

export function parseCsvGantt(text: string): {
  meta: GanttImportMeta
  rows: GanttImportRow[]
} {
  const matrix = parseCsvText(text).map((row) => row.map((c) => c) as unknown[])
  return parseImportTable(matrix)
}

export function buildXlsxBuffer(
  rangeStart: string,
  rangeEnd: string,
  showWeekday: boolean,
  tasks: GanttExportTask[]
): ArrayBuffer {
  const aoa: unknown[][] = [
    ['rangeStart', rangeStart],
    ['rangeEnd', rangeEnd],
    ['showWeekday', showWeekday ? 1 : 0],
    [],
    [...HEADER_ZH],
    ...tasks.map((t) => [t.title, t.start, t.end, t.color])
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '甘特')
  const raw = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer | Uint8Array
  if (raw instanceof ArrayBuffer) return raw.slice(0)
  return raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength)
}

export function parseXlsxGantt(buf: ArrayBuffer): {
  meta: GanttImportMeta
  rows: GanttImportRow[]
} {
  const wb = XLSX.read(buf, { type: 'array' })
  const name = wb.SheetNames[0]
  if (!name) return { meta: {}, rows: [] }
  const ws = wb.Sheets[name]
  if (!ws) return { meta: {}, rows: [] }
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: true
  }) as unknown[][]
  return parseImportTable(rows)
}

export function downloadBlob(filename: string, blob: Blob): void {
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
