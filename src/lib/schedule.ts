import { addDaysIso, todayIso } from "@/lib/format"
import type { DayKey, WorkingHours } from "@/lib/types"
import { DAY_KEYS } from "@/lib/types"

const WEEKDAY: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

export function weekdayFromIso(iso: string): DayKey {
  const [year, month, day] = iso.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return WEEKDAY[date.getUTCDay()] ?? "mon"
}

function minutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0
  return hour * 60 + minute
}

function labelFromMinutes(value: number): string {
  const hour = Math.floor(value / 60)
  const minute = value % 60
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function timeOptions(hours: WorkingHours, iso: string, now: Date): string[] {
  const key = weekdayFromIso(iso)
  if (!(DAY_KEYS as readonly string[]).includes(key)) return []
  const day = hours.days[key]
  if (!day || day.closed) return []
  const step = hours.slot_minutes >= 30 ? hours.slot_minutes : 120
  const start = minutes(day.open)
  const end = minutes(day.close)
  const slots: string[] = []
  for (let cursor = start; cursor < end; cursor += step) {
    slots.push(labelFromMinutes(cursor))
  }
  if (iso !== todayIso(hours.timezone || "Asia/Almaty", now)) return slots
  const clock = new Intl.DateTimeFormat("en-GB", {
    timeZone: hours.timezone || "Asia/Almaty",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now)
  return slots.filter((slot) => slot > clock)
}

export type DateOption = { iso: string; label: string }

export function dateOptions(hours: WorkingHours, now: Date): DateOption[] {
  const zone = hours.timezone || "Asia/Almaty"
  const today = todayIso(zone, now)
  const tomorrow = addDaysIso(today, 1)
  const horizon = hours.horizon_days >= 1 ? hours.horizon_days : 6
  const options: DateOption[] = []
  for (let offset = 0; offset < 28 && options.length < horizon; offset += 1) {
    const iso = addDaysIso(today, offset)
    const times = timeOptions(hours, iso, now)
    if (!times.length) continue
    const [, month, day] = iso.split("-")
    const short = `${day}.${month}`
    const label = iso === today ? `Сегодня ${short}` : iso === tomorrow ? `Завтра ${short}` : short
    options.push({ iso, label })
  }
  return options
}
