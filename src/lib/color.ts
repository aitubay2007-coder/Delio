export type Rgb = { r: number; g: number; b: number }

export type AccentTokens = {
  accent: string
  buttonBg: string
  buttonText: string
  text: string
  soft: string
  line: string
  buttonContrast: number
  textContrast: number
}

export const COLOR_SWATCHES = [
  { id: "red", hex: "#C23B3B" },
  { id: "orange", hex: "#D86A2A" },
  { id: "yellow", hex: "#C9A227" },
  { id: "green", hex: "#2F6B4F" },
  { id: "teal", hex: "#1F7A72" },
  { id: "blue", hex: "#2A5F9E" },
  { id: "violet", hex: "#5B4B8A" },
  { id: "pink", hex: "#C45B78" },
  { id: "black", hex: "#1A1814" },
  { id: "neutral", hex: "#8A8175" },
] as const

const WHITE = "#FFFFFF"
const INK = "#1A1814"

export function normalizeHex(input: string): string | null {
  const raw = input.trim().replace(/^#/, "")
  if (/^[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw
      .split("")
      .map((char) => char + char)
      .join("")
      .toUpperCase()}`
  }
  if (/^[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.toUpperCase()}`
  return null
}

export function hexToRgb(hex: string): Rgb | null {
  const normal = normalizeHex(hex)
  if (!normal) return null
  return {
    r: Number.parseInt(normal.slice(1, 3), 16),
    g: Number.parseInt(normal.slice(3, 5), 16),
    b: Number.parseInt(normal.slice(5, 7), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0")
  return `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase()
}

function linearize(channel: number): number {
  const s = channel / 255
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return 0.2126 * linearize(rgb.r) + 0.7152 * linearize(rgb.g) + 0.0722 * linearize(rgb.b)
}

export function contrast(a: string, b: string): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function mixHex(from: string, to: string, amount: number): string {
  const a = hexToRgb(from)
  const b = hexToRgb(to)
  if (!a || !b) return normalizeHex(from) ?? INK
  const t = Math.max(0, Math.min(1, amount))
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  })
}

function mixUntil(from: string, toward: string, against: string, minimum: number): string {
  if (contrast(from, against) >= minimum) return from
  let low = 0
  let high = 1
  let best = toward
  for (let step = 0; step < 18; step += 1) {
    const mid = (low + high) / 2
    const mixed = mixHex(from, toward, mid)
    if (contrast(mixed, against) >= minimum) {
      best = mixed
      high = mid
    } else {
      low = mid
    }
  }
  return normalizeHex(best) ?? toward
}

export function pickText(background: string): string {
  return contrast(WHITE, background) >= contrast(INK, background) ? WHITE : INK
}

export function deriveAccent(input: string, pageBackground: string): AccentTokens {
  const accent = normalizeHex(input) ?? "#3E4C3A"
  const page = normalizeHex(pageBackground) ?? "#F6F5F2"
  let buttonBg = accent
  let buttonText = pickText(buttonBg)
  if (contrast(buttonText, buttonBg) < 4.5) {
    const push = buttonText === WHITE ? "#000000" : WHITE
    buttonBg = mixUntil(accent, push, buttonText, 4.5)
    buttonText = pickText(buttonBg)
    if (contrast(buttonText, buttonBg) < 4.5) {
      const pushAgain = buttonText === WHITE ? "#000000" : WHITE
      buttonBg = mixUntil(buttonBg, pushAgain, buttonText, 4.5)
    }
  }
  const toward = relativeLuminance(page) > 0.5 ? "#000000" : WHITE
  const text = mixUntil(accent, toward, page, 4.5)
  return {
    accent,
    buttonBg,
    buttonText,
    text,
    soft: mixHex(page, accent, 0.14),
    line: mixHex(page, accent, 0.38),
    buttonContrast: contrast(buttonText, buttonBg),
    textContrast: contrast(text, page),
  }
}

export function hsvToHex(h: number, s: number, v: number): string {
  const hue = ((h % 360) + 360) % 360
  const sat = Math.max(0, Math.min(1, s))
  const val = Math.max(0, Math.min(1, v))
  const c = val * sat
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = val - c
  let r = 0
  let g = 0
  let b = 0
  if (hue < 60) [r, g, b] = [c, x, 0]
  else if (hue < 120) [r, g, b] = [x, c, 0]
  else if (hue < 180) [r, g, b] = [0, c, x]
  else if (hue < 240) [r, g, b] = [0, x, c]
  else if (hue < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex({ r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 })
}

export function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const rgb = hexToRgb(hex) ?? { r: 62, g: 76, b: 58 }
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }
  if (h < 0) h += 360
  return { h, s: max === 0 ? 0 : delta / max, v: max }
}
