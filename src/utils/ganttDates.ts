/** 本地日历日期的 YYYY-MM-DD，避免 UTC 偏移。 */

export function formatISODateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISODateLocal(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isValidISODate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseISODateLocal(s).getTime())
}

export function eachDateStrInRange(start: string, end: string): string[] {
  if (!isValidISODate(start) || !isValidISODate(end)) return []
  if (start > end) return eachDateStrInRange(end, start)
  const out: string[] = []
  const cur = parseISODateLocal(start)
  const last = parseISODateLocal(end)
  while (cur.getTime() <= last.getTime()) {
    out.push(formatISODateLocal(cur))
    cur.setDate(cur.getDate() + 1)
  }
  return out
}

export function clampDateStr(s: string, min: string, max: string): string {
  if (s < min) return min
  if (s > max) return max
  return s
}
