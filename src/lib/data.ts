import { connection } from "next/server"
import { parseOrderForm, parseStore, parseZones } from "@/lib/catalog"
import { fixtureBundle } from "@/lib/fixtures"
import { createPublicClient } from "@/lib/supabase/public"
import type { AnalyticsEvent, Category, Product, ShopOrder, StoreBundle, StoreCover } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

export async function loadStore(slug: string): Promise<StoreBundle | null> {
  const supabase = createPublicClient()
  if (!supabase) return slug === "primer" ? fixtureBundle() : null
  try {
    const { data: storeRow, error } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
    if (error) throw error
    const storeRecord = asRecord(storeRow)
    if (!storeRecord) return slug === "primer" ? fixtureBundle() : null
    const store = parseStore(storeRecord)
    const [categoriesRes, productsRes, photosRes, coversRes] = await Promise.all([
      supabase.from("categories").select("*").eq("store_id", store.id).order("sort_order"),
      supabase.from("products").select("*").eq("store_id", store.id).order("sort_order"),
      supabase.from("product_photos").select("*").eq("store_id", store.id).order("sort_order"),
      supabase.from("store_covers").select("*").eq("store_id", store.id).order("sort_order"),
    ])
    if (categoriesRes.error || productsRes.error || photosRes.error || coversRes.error) {
      throw categoriesRes.error ?? productsRes.error ?? photosRes.error ?? coversRes.error
    }
    const photos = (photosRes.data ?? []) as Product["photos"]
    const products: Product[] = ((productsRes.data ?? []) as Omit<Product, "photos">[]).map((product) => ({
      ...product,
      price: Number(product.price),
      photos: photos.filter((photo) => photo.product_id === product.id),
    }))
    return {
      source: "database",
      store,
      categories: (categoriesRes.data ?? []) as Category[],
      products,
      covers: (coversRes.data ?? []) as StoreCover[],
    }
  } catch {
    return slug === "primer" ? fixtureBundle() : null
  }
}

export async function loadOwnerCabinet() {
  await connection()
  const supabase = await createClient()
  if (!supabase) return { kind: "unconfigured" as const }
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) return { kind: "anonymous" as const }
  const userId = data.claims.sub
  const email = typeof data.claims.email === "string" ? data.claims.email : ""
  const { data: storeRow, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", userId)
    .maybeSingle()
  if (storeError) return { kind: "error" as const, message: storeError.message }
  const storeRecord = asRecord(storeRow)
  if (!storeRecord) return { kind: "needs-onboarding" as const, email }
  const store = parseStore(storeRecord)
  const since = new Date(Date.now() - 90 * 86_400_000).toISOString()
  const [categoriesRes, productsRes, photosRes, coversRes, ordersRes, eventsRes] = await Promise.all([
    supabase.from("categories").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("products").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("product_photos").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("store_covers").select("*").eq("store_id", store.id).order("sort_order"),
    supabase.from("orders").select("*").eq("store_id", store.id).order("created_at", { ascending: false }).limit(100),
    supabase
      .from("analytics_events")
      .select("id, store_id, event_type, product_id, amount, source, created_at")
      .eq("store_id", store.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000),
  ])
  const failure =
    categoriesRes.error ??
    productsRes.error ??
    photosRes.error ??
    coversRes.error ??
    ordersRes.error ??
    eventsRes.error
  if (failure) return { kind: "error" as const, message: failure.message }
  const photos = (photosRes.data ?? []) as Product["photos"]
  const products: Product[] = ((productsRes.data ?? []) as Omit<Product, "photos">[]).map((product) => ({
    ...product,
    price: Number(product.price),
    photos: photos.filter((photo) => photo.product_id === product.id),
  }))
  const orders = ((ordersRes.data ?? []) as ShopOrder[]).map((order) => ({
    ...order,
    delivery_price: Number(order.delivery_price),
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    extra_fields:
      order.extra_fields && typeof order.extra_fields === "object"
        ? Object.fromEntries(
            Object.entries(order.extra_fields).map(([key, value]) => [key, String(value ?? "")]),
          )
        : {},
  }))
  return {
    kind: "ready" as const,
    email,
    store: {
      ...store,
      delivery_zones: parseZones(store.delivery_zones),
      order_form: parseOrderForm(store.order_form),
    },
    categories: (categoriesRes.data ?? []) as Category[],
    products,
    covers: (coversRes.data ?? []) as StoreCover[],
    orders,
    events: (eventsRes.data ?? []) as AnalyticsEvent[],
    eventsCapped: (eventsRes.data ?? []).length >= 1000,
  }
}
