import { clockInZone, weekdayKey } from "@/lib/format"
import type {
  DayKey,
  DeliveryZone,
  FormField,
  NicheId,
  OrderFormConfig,
  Store,
  TemplateId,
  WorkingHours,
} from "@/lib/types"
import { DAY_KEYS, NICHES, TEMPLATES } from "@/lib/types"

export const TEMPLATE_THEME: Record<
  TemplateId,
  { bg: string; ink: string; muted: string; radius: string }
> = {
  minimal: { bg: "#F6F5F2", ink: "#1C1915", muted: "#6F6A63", radius: "0px" },
  boutique: { bg: "#F8F4EF", ink: "#241C16", muted: "#7A6D62", radius: "0px" },
  by_date: { bg: "#F4F0E8", ink: "#2A241C", muted: "#74695C", radius: "18px" },
  editorial: { bg: "#F3F1EC", ink: "#161513", muted: "#5E5A54", radius: "0px" },
  vivid: { bg: "#FFFDF8", ink: "#1B1916", muted: "#5C564E", radius: "28px" },
  cinematic: { bg: "#100F0E", ink: "#F4F0E8", muted: "#B7AEA2", radius: "2px" },
}

export function defaultHours(): WorkingHours {
  const open = { closed: false, open: "10:00", close: "20:00" }
  return {
    timezone: "Asia/Almaty",
    days: {
      mon: { ...open },
      tue: { ...open },
      wed: { ...open },
      thu: { ...open },
      fri: { ...open },
      sat: { closed: false, open: "11:00", close: "19:00" },
      sun: { closed: true, open: "11:00", close: "19:00" },
    },
  }
}

export function defaultFields(niche: NicheId): FormField[] {
  const field = (
    key: string,
    label: string,
    type: FormField["type"],
    required = false,
  ): FormField => ({ id: key, key, label, type, required })

  switch (niche) {
    case "flowers":
      return [
        field("card_text", "Текст открытки", "textarea"),
        field("recipient_name", "Имя получателя", "text"),
        field("recipient_phone", "Телефон получателя", "phone"),
        field("surprise", "Сюрприз: не говорить, кто отправитель", "checkbox"),
      ]
    case "bakery":
      return [
        field("inscription", "Надпись", "text"),
        field("filling", "Начинка", "text"),
      ]
    case "gifts":
      return [field("gift_note", "Пожелание к подарку", "textarea")]
    case "clothing":
      return [field("size", "Размер", "text")]
    case "cosmetics":
      return [field("note", "Пожелание по уходу", "textarea")]
    case "coffee_food":
      return [field("allergies", "Аллергии", "text")]
    case "services":
      return [field("master", "Предпочтительный мастер", "text")]
    default:
      return []
  }
}

export function defaultOrderForm(niche: NicheId): OrderFormConfig {
  return { fields: defaultFields(niche) }
}

export function defaultZones(): DeliveryZone[] {
  return [
    { id: "center", name: "В пределах города", price: 2000 },
    { id: "outside", name: "За городом", price: 4000 },
  ]
}

export function isNiche(value: string): value is NicheId {
  return (NICHES as readonly string[]).includes(value)
}

export function isTemplate(value: string): value is TemplateId {
  return (TEMPLATES as readonly string[]).includes(value)
}

function isDayKey(value: string): value is DayKey {
  return (DAY_KEYS as readonly string[]).includes(value)
}

export function parseHours(value: unknown): WorkingHours {
  const fallback = defaultHours()
  if (!value || typeof value !== "object") return fallback
  const record = value as { timezone?: unknown; days?: unknown }
  const timezone = typeof record.timezone === "string" ? record.timezone : fallback.timezone
  const days = { ...fallback.days }
  if (record.days && typeof record.days === "object") {
    for (const key of DAY_KEYS) {
      const day = (record.days as Record<string, unknown>)[key]
      if (!day || typeof day !== "object") continue
      const row = day as Record<string, unknown>
      days[key] = {
        closed: Boolean(row.closed),
        open: typeof row.open === "string" ? row.open : fallback.days[key].open,
        close: typeof row.close === "string" ? row.close : fallback.days[key].close,
      }
    }
  }
  return { timezone, days }
}

export function parseZones(value: unknown): DeliveryZone[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const row = item as Record<string, unknown>
    if (typeof row.id !== "string" || typeof row.name !== "string") return []
    const price = Number(row.price)
    if (!Number.isFinite(price) || price < 0) return []
    return [{ id: row.id, name: row.name, price }]
  })
}

export function parseOrderForm(value: unknown): OrderFormConfig {
  if (!value || typeof value !== "object") return { fields: [] }
  const fields = (value as { fields?: unknown }).fields
  if (!Array.isArray(fields)) return { fields: [] }
  return {
    fields: fields.flatMap((item) => {
      if (!item || typeof item !== "object") return []
      const row = item as Record<string, unknown>
      const type = row.type
      if (type !== "text" && type !== "textarea" && type !== "phone" && type !== "checkbox") {
        return []
      }
      if (typeof row.key !== "string" || typeof row.label !== "string") return []
      return [
        {
          id: typeof row.id === "string" ? row.id : row.key,
          key: row.key,
          label: row.label,
          type,
          required: Boolean(row.required),
        },
      ]
    }),
  }
}

export function parseStore(row: Record<string, unknown>): Store {
  const niche = typeof row.niche === "string" && isNiche(row.niche) ? row.niche : "flowers"
  const template =
    typeof row.template === "string" && isTemplate(row.template) ? row.template : "minimal"
  const status = row.subscription_status
  const subscription =
    status === "trialing" ||
    status === "active" ||
    status === "past_due" ||
    status === "canceled" ||
    status === "expired"
      ? status
      : "trialing"
  return {
    id: String(row.id),
    owner_id: row.owner_id ? String(row.owner_id) : null,
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    niche,
    whatsapp_e164: String(row.whatsapp_e164 ?? ""),
    logo_path: row.logo_path ? String(row.logo_path) : null,
    address: String(row.address ?? ""),
    working_hours: parseHours(row.working_hours),
    delivery_enabled: row.delivery_enabled !== false,
    pickup_enabled: row.pickup_enabled !== false,
    delivery_zones: parseZones(row.delivery_zones),
    min_order: Number(row.min_order ?? 0),
    template,
    accent_color: String(row.accent_color ?? "#3E4C3A"),
    order_form: parseOrderForm(row.order_form),
    trial_ends_at: String(row.trial_ends_at ?? "1970-01-01T00:00:00.000Z"),
    subscription_status: subscription,
    whop_customer_id: row.whop_customer_id ? String(row.whop_customer_id) : null,
    whop_membership_id: row.whop_membership_id ? String(row.whop_membership_id) : null,
    is_demo: Boolean(row.is_demo),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  }
}

export function storeAcceptsOrders(store: Store, now = new Date()): boolean {
  if (store.is_demo || store.subscription_status === "active") return true
  if (store.subscription_status === "trialing") {
    return new Date(store.trial_ends_at).getTime() > now.getTime()
  }
  return false
}

export function trialDaysLeft(store: Store, now = new Date()): number {
  const ms = new Date(store.trial_ends_at).getTime() - now.getTime()
  return Math.max(0, Math.ceil(ms / 86_400_000))
}

export function isOpenNow(hours: WorkingHours, now = new Date()): boolean {
  const key = weekdayKey(hours.timezone || "Asia/Almaty", now)
  if (!isDayKey(key)) return false
  const day = hours.days[key]
  if (!day || day.closed) return false
  const clock = clockInZone(hours.timezone || "Asia/Almaty", now)
  return clock >= day.open && clock < day.close
}

export function todayHours(hours: WorkingHours, now = new Date()) {
  const key = weekdayKey(hours.timezone || "Asia/Almaty", now)
  return hours.days[key]
}
