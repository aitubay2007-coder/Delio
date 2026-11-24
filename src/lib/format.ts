import type { DayKey } from "@/lib/types"

const DAY_INDEX: Record<string, DayKey> = {
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
  Sun: "sun",
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateIso(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return iso
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

export function formatWhen(iso: string | null | undefined): string {
  if (!iso) return ""
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function todayIso(timeZone = "Asia/Almaty", now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
  return parts
}

export function addDaysIso(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + days, 12))
  return date.toISOString().slice(0, 10)
}

export function weekdayKey(timeZone: string, now = new Date()): DayKey {
  const weekday = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
  }).format(now)
  return DAY_INDEX[weekday] ?? "mon"
}

export function clockInZone(timeZone: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00"
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00"
  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`
}

const CYRILLIC: Record<string, string> = {
  а: "a",
  ә: "a",
  б: "b",
  в: "v",
  г: "g",
  ғ: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  і: "i",
  к: "k",
  қ: "q",
  л: "l",
  м: "m",
  н: "n",
  ң: "n",
  о: "o",
  ө: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ұ: "u",
  ү: "u",
  ф: "f",
  х: "h",
  һ: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sh",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
}

export function slugify(input: string): string {
  const transliterated = input
    .trim()
    .toLowerCase()
    .split("")
    .map((char) => CYRILLIC[char] ?? char)
    .join("")
  return transliterated
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "")
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)
}

const RESERVED = new Set([
  "primer",
  "api",
  "auth",
  "cabinet",
  "login",
  "signup",
  "preview",
  "admin",
  "www",
  "onboarding",
])

export function isReservedSlug(slug: string): boolean {
  return RESERVED.has(slug)
}

export function isE164(value: string): boolean {
  return /^\+[1-9][0-9]{7,14}$/.test(value)
}

export function toE164(prefix: string, national: string): string {
  const digits = national.replace(/\D/g, "")
  const cleanPrefix = prefix.startsWith("+") ? prefix : `+${prefix}`
  return `${cleanPrefix}${digits}`
}

export function orderNumber(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("")
}

export function deriveSource(search: string, referrer: string, host: string): string {
  const params = new URLSearchParams(search)
  const utm = params.get("utm_source")?.trim()
  if (utm) return utm.slice(0, 120)
  if (!referrer) return "прямой"
  try {
    const referrerHost = new URL(referrer).host
    if (!referrerHost || referrerHost === host) return "прямой"
    return referrerHost.slice(0, 120)
  } catch {
    return "прямой"
  }
}

export function utmPayload(search: string): Record<string, string> | null {
  const params = new URLSearchParams(search)
  const payload: Record<string, string> = {}
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const value = params.get(key)?.trim()
    if (value) payload[key] = value.slice(0, 120)
  }
  return Object.keys(payload).length ? payload : null
}
