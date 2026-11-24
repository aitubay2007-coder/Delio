export const NICHES = [
  "flowers",
  "bakery",
  "gifts",
  "clothing",
  "cosmetics",
  "coffee_food",
  "services",
] as const

export const TEMPLATES = [
  "minimal",
  "boutique",
  "by_date",
  "editorial",
  "vivid",
  "cinematic",
] as const

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

export type NicheId = (typeof NICHES)[number]
export type TemplateId = (typeof TEMPLATES)[number]
export type DayKey = (typeof DAY_KEYS)[number]
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "expired"
export type OrderStatus = "new" | "confirmed" | "cancelled"
export type Fulfillment = "delivery" | "pickup"
export type EventType =
  | "store_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_start"
  | "whatsapp_click"
export type FieldType = "text" | "textarea" | "phone" | "checkbox"

export type DayHours = { closed: boolean; open: string; close: string }

export type WorkingHours = {
  timezone: string
  days: Record<DayKey, DayHours>
}

export type DeliveryZone = { id: string; name: string; price: number }

export type FormField = {
  id: string
  key: string
  label: string
  type: FieldType
  required: boolean
}

export type OrderFormConfig = { fields: FormField[] }

export type Store = {
  id: string
  owner_id: string | null
  name: string
  slug: string
  niche: NicheId
  whatsapp_e164: string
  logo_path: string | null
  address: string
  working_hours: WorkingHours
  delivery_enabled: boolean
  pickup_enabled: boolean
  delivery_zones: DeliveryZone[]
  min_order: number
  template: TemplateId
  accent_color: string
  order_form: OrderFormConfig
  trial_ends_at: string
  subscription_status: SubscriptionStatus
  whop_customer_id: string | null
  whop_membership_id: string | null
  is_demo: boolean
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  store_id: string
  name: string
  sort_order: number
}

export type ProductPhoto = {
  id: string
  store_id: string
  product_id: string
  storage_path: string
  sort_order: number
}

export type Product = {
  id: string
  store_id: string
  category_id: string | null
  name: string
  description: string
  price: number
  available: boolean
  sort_order: number
  photos: ProductPhoto[]
}

export type StoreCover = {
  id: string
  store_id: string
  storage_path: string
  sort_order: number
}

export type OrderItem = {
  product_id: string
  name: string
  qty: number
  price: number
}

export type ShopOrder = {
  id: string
  store_id: string
  order_number: string
  status: OrderStatus
  customer_name: string
  customer_phone: string
  fulfillment: Fulfillment
  address: string
  delivery_zone_id: string | null
  delivery_zone_name: string | null
  delivery_price: number
  scheduled_date: string | null
  scheduled_time: string | null
  comment: string
  extra_fields: Record<string, string>
  items: OrderItem[]
  subtotal: number
  total: number
  created_at: string
}

export type AnalyticsEvent = {
  id: string
  store_id: string
  event_type: EventType
  product_id: string | null
  amount: number | null
  source: string | null
  created_at: string
}

export type StoreBundle = {
  store: Store
  categories: Category[]
  products: Product[]
  covers: StoreCover[]
  source: "database" | "fixture"
}
