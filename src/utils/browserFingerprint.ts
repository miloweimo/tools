/** 将任意值格式化为展示用字符串（导出供单测） */
export function formatDisplayValue(value: unknown): string {
  if (value === undefined) return '不可用'
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? '是' : '否'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '不可用'
    return String(value)
  }
  if (typeof value === 'string') return value.length ? value : '（空字符串）'
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export interface FingerprintRow {
  label: string
  value: string
}

export interface FingerprintSection {
  title: string
  rows: FingerprintRow[]
}

function row(label: string, value: unknown): FingerprintRow {
  return { label, value: formatDisplayValue(value) }
}

function testStorage(name: 'localStorage' | 'sessionStorage'): string {
  try {
    const s = window[name]
    const k = '__fp_test__'
    s.setItem(k, '1')
    s.removeItem(k)
    return '可用'
  } catch {
    return '不可用'
  }
}

function testIndexedDb(): string {
  try {
    return window.indexedDB ? '可用' : '不可用'
  } catch {
    return '不可用'
  }
}

function readWebGlRows(): FingerprintRow[] {
  const canvas = document.createElement('canvas')
  const gl: WebGLRenderingContext | WebGL2RenderingContext | null =
    canvas.getContext('webgl2') || canvas.getContext('webgl')
  if (!gl) {
    return [row('WebGL', '无法创建 WebGL 上下文')]
  }
  const dbg = gl.getExtension('WEBGL_debug_renderer_info')
  const vendor = dbg
    ? gl.getParameter((dbg as WebGLDebugRendererInfo).UNMASKED_VENDOR_WEBGL)
    : gl.getParameter(gl.VENDOR)
  const renderer = dbg
    ? gl.getParameter((dbg as WebGLDebugRendererInfo).UNMASKED_RENDERER_WEBGL)
    : gl.getParameter(gl.RENDERER)
  const version = gl.getParameter(gl.VERSION)
  const shading = gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
  return [
    row('版本', version),
    row('着色语言', shading),
    row('供应商（UNMASKED_VENDOR_WEBGL 或 VENDOR）', vendor),
    row('渲染器（UNMASKED_RENDERER_WEBGL 或 RENDERER）', renderer)
  ]
}

interface WebGLDebugRendererInfo {
  UNMASKED_VENDOR_WEBGL: number
  UNMASKED_RENDERER_WEBGL: number
}

/** Chromium UA-CH；旧版 lib.dom 可能无 NavigatorUAData */
interface UserAgentDataLike {
  brands?: { brand: string; version: string }[]
  mobile?: boolean
  platform?: string
  getHighEntropyValues?: (hints: string[]) => Promise<Record<string, unknown>>
}

function navigatorSection(): FingerprintSection {
  const n = navigator
  const rows: FingerprintRow[] = [
    row('userAgent', n.userAgent),
    row('language', n.language),
    row('languages', n.languages ? [...n.languages] : undefined),
    row('platform', n.platform),
    row('cookieEnabled', n.cookieEnabled),
    row('hardwareConcurrency', n.hardwareConcurrency),
    row('deviceMemory (GB)', (n as Navigator & { deviceMemory?: number }).deviceMemory),
    row('maxTouchPoints', n.maxTouchPoints),
    row('webdriver', (n as Navigator & { webdriver?: boolean }).webdriver)
  ]

  const uaData = (n as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData
  if (uaData) {
    rows.push(row('userAgentData.brands', uaData.brands))
    rows.push(row('userAgentData.mobile', uaData.mobile))
    rows.push(row('userAgentData.platform', uaData.platform))
  } else {
    rows.push(row('userAgentData', '不可用'))
  }

  return { title: 'Navigator', rows }
}

function screenSection(): FingerprintSection {
  const s = window.screen
  const rows: FingerprintRow[] = [
    row('screen.width', s.width),
    row('screen.height', s.height),
    row('screen.availWidth', s.availWidth),
    row('screen.availHeight', s.availHeight),
    row('screen.colorDepth', s.colorDepth),
    row('screen.pixelDepth', s.pixelDepth),
    row('devicePixelRatio', window.devicePixelRatio),
    row('window.innerWidth', window.innerWidth),
    row('window.innerHeight', window.innerHeight)
  ]
  const vv = window.visualViewport
  if (vv) {
    rows.push(row('visualViewport.width', vv.width))
    rows.push(row('visualViewport.height', vv.height))
    rows.push(row('visualViewport.scale', vv.scale))
    rows.push(row('visualViewport.offsetTop', vv.offsetTop))
    rows.push(row('visualViewport.offsetLeft', vv.offsetLeft))
  } else {
    rows.push(row('visualViewport', '不可用'))
  }
  return { title: '屏幕与视口', rows }
}

function timezoneSection(): FingerprintSection {
  const dtf = Intl.DateTimeFormat()
  const opts = dtf.resolvedOptions()
  return {
    title: '时区与区域',
    rows: [
      row('Intl 时区', opts.timeZone),
      row('Intl locale', opts.locale),
      row('calendar', opts.calendar),
      row('numberingSystem', opts.numberingSystem),
      row('getTimezoneOffset (分钟)', new Date().getTimezoneOffset()),
      row('toLocaleString 示例', new Date().toLocaleString())
    ]
  }
}

function featuresSection(): FingerprintSection {
  const rows: FingerprintRow[] = [
    row('localStorage', testStorage('localStorage')),
    row('sessionStorage', testStorage('sessionStorage')),
    row('indexedDB', testIndexedDb()),
    row('matchMedia prefers-color-scheme: dark', window.matchMedia('(prefers-color-scheme: dark)').matches),
    row('matchMedia prefers-reduced-motion', window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  ]
  return { title: '特性探测', rows }
}

async function userAgentHighEntropySection(): Promise<FingerprintSection> {
  const uaData = (navigator as Navigator & { userAgentData?: UserAgentDataLike }).userAgentData
  if (!uaData?.getHighEntropyValues) {
    return {
      title: 'User-Agent Client Hints（高熵）',
      rows: [row('getHighEntropyValues', '不可用')]
    }
  }
  const hints = [
    'architecture',
    'bitness',
    'model',
    'platformVersion',
    'uaFullVersion',
    'fullVersionList',
    'wow64'
  ] as const
  try {
    const values = await uaData.getHighEntropyValues([...hints])
    const rows = hints.map((h) => row(h, values[h]))
    return { title: 'User-Agent Client Hints（高熵）', rows }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return {
      title: 'User-Agent Client Hints（高熵）',
      rows: [row('getHighEntropyValues', `失败：${msg}`)]
    }
  }
}

/**
 * 采集当前环境下的指纹相关展示数据（仅用于本页展示，不上传）。
 */
export async function collectBrowserFingerprint(): Promise<FingerprintSection[]> {
  const webgl = { title: 'WebGL', rows: readWebGlRows() }
  const highEntropy = await userAgentHighEntropySection()
  return [
    navigatorSection(),
    highEntropy,
    screenSection(),
    timezoneSection(),
    featuresSection(),
    webgl
  ]
}
