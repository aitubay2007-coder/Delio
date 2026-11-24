"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import QRCode from "qrcode"
import { ClipboardList, LayoutDashboard, Menu, Package, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ColorField } from "@/components/color/color-field"
import { Storefront } from "@/components/storefront/storefront"
import { storeAcceptsOrders, trialDaysLeft } from "@/lib/catalog"
import { fileExtension, mediaUrl } from "@/lib/media"
import { createClient } from "@/lib/supabase/client"
import { formatMoney, formatWhen, isE164, isReservedSlug, isValidSlug } from "@/lib/format"
import { daysLeft, ru } from "@/i18n/ru"
import { DAY_KEYS, TEMPLATES, type AnalyticsEvent, type Category, type FormField, type Product, type ShopOrder, type Store, type StoreCover } from "@/lib/types"

type Props = {
  mode: "live" | "preview"
  base: string
  email: string
  store: Store
  categories: Category[]
  products: Product[]
  covers: StoreCover[]
  orders: ShopOrder[]
  events: AnalyticsEvent[]
  eventsCapped: boolean
}

const NAV = [
  ["overview", ru.cabinet.overview, LayoutDashboard],
  ["orders", ru.cabinet.orders, ClipboardList],
  ["products", ru.cabinet.products, Package],
  ["branding", ru.cabinet.branding, Palette],
  ["more", ru.cabinet.more, Menu],
] as const

export function CabinetApp(props: Props) {
  const path = usePathname()
  const section = path === props.base ? "overview" : path.slice(props.base.length + 1)
  const [store, setStore] = useState(props.store)
  const [categories, setCategories] = useState(props.categories)
  const [products, setProducts] = useState(props.products)
  const [covers, setCovers] = useState(props.covers)
  const [orders, setOrders] = useState(props.orders)
  const [note, setNote] = useState("")
  const router = useRouter()

  function href(id: string) {
    return id === "overview" ? props.base : `${props.base}/${id}`
  }

  async function saveStore(next: Store) {
    setStore(next)
    if (props.mode !== "live") {
      setNote(ru.cabinet.saved)
      return
    }
    const { error } = await createClient()
      .from("stores")
      .update({
        name: next.name,
        slug: next.slug,
        niche: next.niche,
        whatsapp_e164: next.whatsapp_e164,
        logo_path: next.logo_path,
        address: next.address,
        working_hours: next.working_hours,
        delivery_enabled: next.delivery_enabled,
        pickup_enabled: next.pickup_enabled,
        delivery_zones: next.delivery_zones,
        min_order: next.min_order,
        template: next.template,
        accent_color: next.accent_color,
        order_form: next.order_form,
      })
      .eq("id", next.id)
    if (error) {
      setNote(ru.cabinet.saveError)
      return
    }
    setNote(ru.cabinet.saved)
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-[#f4f1eb] pb-28 md:pb-10">
      <div className="mx-auto grid max-w-6xl md:grid-cols-[232px_1fr]">
        <aside className="hidden border-r border-[#14120f]/8 px-4 py-8 md:block">
          <Link href="/" className="font-serif text-2xl tracking-tight">{ru.brand}</Link>
          {props.email && <p className="mt-2 truncate text-xs text-[#6f675e]">{props.email}</p>}
          <nav className="mt-8 grid gap-1 text-sm">
            {NAV.map(([id, label]) => (
              <Link key={id} href={href(id)} className={`rounded-xl px-3 py-2.5 ${section === id ? "bg-[#14120f] text-[#f6f3ee]" : "hover:bg-[#14120f]/5"}`}>{label}</Link>
            ))}
            <Link href={href("settings")} className={`rounded-xl px-3 py-2.5 ${section === "settings" ? "bg-[#14120f] text-[#f6f3ee]" : "hover:bg-[#14120f]/5"}`}>{ru.cabinet.settings}</Link>
            <Link href={href("stats")} className={`rounded-xl px-3 py-2.5 ${section === "stats" ? "bg-[#14120f] text-[#f6f3ee]" : "hover:bg-[#14120f]/5"}`}>{ru.cabinet.stats}</Link>
          </nav>
        </aside>
        <div className="px-4 py-6 md:px-10">
          {props.mode === "preview" && <p className="mb-4 border border-dashed border-[#1c1915]/30 px-3 py-2 text-sm">{ru.cabinet.previewBanner}</p>}
          <header className="flex flex-col gap-4 border-b border-[#14120f]/8 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] tracking-[0.16em] uppercase text-[#6f675e]">{ru.brand}</p>
              <h1 className="mt-1 font-serif text-[2rem] leading-none tracking-tight">{store.name}</h1>
              <p className="mt-2 text-sm text-[#6f675e]">{statusLine(store)}</p>
            </div>
            <Link href={`/s/${store.slug}`} className="inline-flex h-11 items-center justify-center rounded-full border border-[#14120f]/15 px-4 text-sm">{ru.cabinet.openStore}</Link>
          </header>
          {note && <p className="mt-3 text-sm text-[#3e4c3a]">{note}</p>}
          <div className="mt-6">
            {section === "orders" && <Orders orders={orders} mode={props.mode} onChange={setOrders} />}
            {section === "products" && (
              <Products
                mode={props.mode}
                storeId={store.id}
                categories={categories}
                products={products}
                onCategories={setCategories}
                onProducts={setProducts}
              />
            )}
            {section === "branding" && (
              <Branding store={store} categories={categories} products={products} covers={covers} onSave={saveStore} />
            )}
            {section === "settings" && (
              <Settings store={store} covers={covers} onCovers={setCovers} onSave={saveStore} mode={props.mode} />
            )}
            {section === "stats" && <Stats events={props.events} orders={orders} products={products} capped={props.eventsCapped} />}
            {section === "more" && <More base={props.base} mode={props.mode} />}
            {(section === "overview" || section === "") && (
              <Overview store={store} orders={orders} />
            )}
          </div>
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[#14120f]/10 bg-[#fffcf8]/95 pb-[env(safe-area-inset-bottom)] text-center backdrop-blur md:hidden">
        {NAV.map(([id, label, Icon]) => (
          <Link key={id} href={href(id)} className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] ${section === id ? "text-[#14120f]" : "text-[#8a8175]"}`}>
            <Icon className="size-4" strokeWidth={section === id ? 2.25 : 1.75} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

function statusLine(store: Store) {
  if (store.subscription_status === "active" || store.is_demo) return ru.cabinet.active
  if (!storeAcceptsOrders(store)) return ru.cabinet.trialEnded
  return `${ru.cabinet.trial} · ${daysLeft(trialDaysLeft(store))}`
}

function Overview({ store, orders }: { store: Store; orders: ShopOrder[] }) {
  const [link, setLink] = useState("")
  const [qr, setQr] = useState("")
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const url = `${window.location.origin}/s/${store.slug}`
    QRCode.toDataURL(url, { margin: 1, width: 280, color: { dark: "#1c1915", light: "#faf8f5" } })
      .then((value) => {
        setLink(url)
        setQr(value)
      })
      .catch(() => undefined)
  }, [store.slug])
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {!storeAcceptsOrders(store) && <p className="md:col-span-2 text-sm leading-6">{ru.cabinet.trialEnded}</p>}
      <section className="rounded-2xl border border-[#14120f]/8 bg-[#fffcf8] p-5 shadow-[0_10px_30px_rgba(20,18,15,0.04)]">
        <h2 className="text-sm tracking-[0.14em] uppercase text-[#6b645c]">{ru.share.title}</h2>
        <p className="mt-3 break-all text-sm">{link}</p>
        <Button type="button" variant="outline" className="mt-3 h-10" onClick={() => { void navigator.clipboard.writeText(link); setCopied(true) }}>
          {copied ? ru.share.copied : ru.share.copy}
        </Button>
      </section>
      <section className="rounded-2xl border border-[#14120f]/8 bg-[#fffcf8] p-5 shadow-[0_10px_30px_rgba(20,18,15,0.04)]">
        <h2 className="text-sm tracking-[0.14em] uppercase text-[#6b645c]">{ru.share.qr}</h2>
        {qr && <img src={qr} alt={ru.share.qr} className="mt-3 h-40 w-40" />}
      </section>
      <section className="border border-[#1c1915]/10 bg-[#faf8f5] p-4 md:col-span-2">
        <h2 className="text-sm tracking-[0.14em] uppercase text-[#6b645c]">{ru.cabinet.orders}</h2>
        <p className="mt-2 font-serif text-3xl">{orders.length}</p>
        <p className="mt-2 text-sm text-[#6b645c]">{ru.orders.honest}</p>
      </section>
    </div>
  )
}

function Orders({ orders, mode, onChange }: { orders: ShopOrder[]; mode: "live" | "preview"; onChange: (orders: ShopOrder[]) => void }) {
  async function setStatus(id: string, status: ShopOrder["status"]) {
    if (mode === "live") {
      const { error } = await createClient().from("orders").update({ status }).eq("id", id)
      if (error) return
    }
    onChange(orders.map((order) => (order.id === id ? { ...order, status } : order)))
  }
  if (!orders.length) return <p className="max-w-md text-sm leading-6 text-[#5f584f]">{ru.orders.empty}</p>
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#6b645c]">{ru.orders.honest}</p>
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-[#14120f]/8 bg-[#fffcf8] p-4 shadow-[0_10px_30px_rgba(20,18,15,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm">№{order.order_number}</p>
              <h3 className="text-lg">{order.customer_name}</h3>
              <p className="text-sm text-[#6b645c]">{order.customer_phone} · {formatWhen(order.created_at)}</p>
            </div>
            <span className="text-xs uppercase tracking-wide">{ru.orders.status[order.status]}</span>
          </div>
          <ul className="mt-3 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={`${order.id}-${item.product_id}`}>{item.name} × {item.qty} — {formatMoney(item.price * item.qty)}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm">{ru.orders.total}: {formatMoney(order.total)}</p>
          <div className="mt-3 flex gap-2">
            <Button type="button" className="h-10" onClick={() => void setStatus(order.id, "confirmed")}>{ru.orders.confirm}</Button>
            <Button type="button" variant="outline" className="h-10" onClick={() => void setStatus(order.id, "cancelled")}>{ru.orders.cancel}</Button>
          </div>
        </article>
      ))}
    </div>
  )
}

function Products({
  mode,
  storeId,
  categories,
  products,
  onCategories,
  onProducts,
}: {
  mode: "live" | "preview"
  storeId: string
  categories: Category[]
  products: Product[]
  onCategories: (categories: Category[]) => void
  onProducts: (products: Product[]) => void
}) {
  const [draft, setDraft] = useState<Product | null>(null)
  const [categoryName, setCategoryName] = useState("")

  async function addCategory() {
    const name = categoryName.trim()
    if (!name) return
    if (mode === "preview") {
      onCategories([...categories, { id: crypto.randomUUID(), store_id: storeId, name, sort_order: categories.length }])
      setCategoryName("")
      return
    }
    const { data, error } = await createClient().from("categories").insert({ store_id: storeId, name, sort_order: categories.length }).select("*").single()
    if (!error && data) onCategories([...categories, data as Category])
    setCategoryName("")
  }

  function blank(): Product {
    return {
      id: `new-${crypto.randomUUID()}`,
      store_id: storeId,
      category_id: categories[0]?.id ?? null,
      name: "",
      description: "",
      price: 0,
      available: true,
      sort_order: products.length,
      photos: [],
    }
  }

  async function save(product: Product) {
    if (mode === "preview") {
      onProducts(product.id.startsWith("new-") ? [...products, { ...product, id: crypto.randomUUID() }] : products.map((item) => (item.id === product.id ? product : item)))
      setDraft(null)
      return
    }
    const supabase = createClient()
    const payload = {
      store_id: storeId,
      category_id: product.category_id,
      name: product.name.trim(),
      description: product.description,
      price: product.price,
      available: product.available,
      sort_order: product.sort_order,
    }
    if (product.id.startsWith("new-")) {
      const { data, error } = await supabase.from("products").insert(payload).select("*").single()
      if (error || !data) return
      onProducts([...products, { ...(data as Product), photos: [] }])
    } else {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id)
      if (error) return
      onProducts(products.map((item) => (item.id === product.id ? product : item)))
    }
    setDraft(null)
  }

  async function remove(product: Product) {
    if (!window.confirm(ru.products.confirmDelete)) return
    if (mode === "live" && !product.id.startsWith("new-")) {
      const { error } = await createClient().from("products").delete().eq("id", product.id)
      if (error) return
    }
    onProducts(products.filter((item) => item.id !== product.id))
  }

  async function move(product: Product, direction: -1 | 1) {
    const ordered = [...products].sort((a, b) => a.sort_order - b.sort_order)
    const index = ordered.findIndex((item) => item.id === product.id)
    const swap = ordered[index + direction]
    if (!swap) return
    const next = products.map((item) => {
      if (item.id === product.id) return { ...item, sort_order: swap.sort_order }
      if (item.id === swap.id) return { ...item, sort_order: product.sort_order }
      return item
    })
    onProducts(next)
    if (mode === "live") {
      const supabase = createClient()
      await supabase.from("products").update({ sort_order: swap.sort_order }).eq("id", product.id)
      await supabase.from("products").update({ sort_order: product.sort_order }).eq("id", swap.id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm tracking-[0.14em] uppercase text-[#6b645c]">{ru.products.categories}</h2>
        <div className="mt-2 flex gap-2">
          <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder={ru.products.name} className="h-12 rounded-xl" />
          <Button type="button" className="h-11" onClick={() => void addCategory()}>{ru.products.addCategory}</Button>
        </div>
        <p className="mt-2 text-sm text-[#6b645c]">{categories.map((item) => item.name).join(" · ")}</p>
      </div>
      <Button type="button" className="h-11" onClick={() => setDraft(blank())}>{ru.products.add}</Button>
      {products.length === 0 && <p className="text-sm leading-6">{ru.products.empty}</p>}
      <ul className="space-y-2">
        {[...products].sort((a, b) => a.sort_order - b.sort_order).map((product) => (
          <li key={product.id} className="flex items-center gap-3 rounded-2xl border border-[#14120f]/8 bg-[#fffcf8] p-3">
            <img src={mediaUrl(product.photos[0]?.storage_path) ?? ""} alt="" className="h-16 w-14 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px]">{product.name}</p>
              <p className="text-sm text-[#6f675e]">{formatMoney(product.price)}{product.available ? "" : ` · ${ru.products.unavailable}`}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <button type="button" className="h-7 rounded-md border border-[#14120f]/10 px-2 text-xs" onClick={() => void move(product, -1)}>{ru.products.up}</button>
              <button type="button" className="h-7 rounded-md border border-[#14120f]/10 px-2 text-xs" onClick={() => void move(product, 1)}>{ru.products.down}</button>
            </div>
            <button type="button" className="shrink-0 text-sm underline underline-offset-4" onClick={() => setDraft(product)}>{ru.products.edit}</button>
          </li>
        ))}
      </ul>
      {draft && (
        <ProductEditor
          draft={draft}
          categories={categories}
          mode={mode}
          onChange={setDraft}
          onSave={() => void save(draft)}
          onDelete={() => void remove(draft)}
          onPhotos={(photos) => setDraft({ ...draft, photos })}
        />
      )}
    </div>
  )
}

function ProductEditor({
  draft,
  categories,
  mode,
  onChange,
  onSave,
  onDelete,
  onPhotos,
}: {
  draft: Product
  categories: Category[]
  mode: "live" | "preview"
  onChange: (product: Product) => void
  onSave: () => void
  onDelete: () => void
  onPhotos: (photos: Product["photos"]) => void
}) {
  async function upload(files: FileList) {
    const additions: Product["photos"] = []
    for (const file of Array.from(files)) {
      const ext = fileExtension(file)
      if (!ext) continue
      if (mode === "preview" || draft.id.startsWith("new-")) {
        additions.push({
          id: crypto.randomUUID(),
          store_id: draft.store_id,
          product_id: draft.id,
          storage_path: URL.createObjectURL(file),
          sort_order: draft.photos.length + additions.length,
        })
        continue
      }
      const path = `${draft.store_id}/products/${crypto.randomUUID()}.${ext}`
      const uploaded = await createClient().storage.from("store-media").upload(path, file, { contentType: file.type })
      if (uploaded.error) continue
      const { data } = await createClient().from("product_photos").insert({
        store_id: draft.store_id,
        product_id: draft.id,
        storage_path: path,
        sort_order: draft.photos.length + additions.length,
      }).select("*").single()
      if (data) additions.push(data as Product["photos"][number])
    }
    onPhotos([...draft.photos, ...additions])
  }

  return (
    <div className="space-y-3 border border-[#1c1915] bg-[#faf8f5] p-4">
      <Label>{ru.products.name}</Label>
      <Input value={draft.name} onChange={(event) => onChange({ ...draft, name: event.target.value })} className="h-11" />
      <Label>{ru.products.description}</Label>
      <textarea value={draft.description} onChange={(event) => onChange({ ...draft, description: event.target.value })} className="min-h-24 w-full border border-[#1c1915]/15 bg-transparent px-3 py-2" />
      <Label>{ru.products.price}</Label>
      <Input type="number" min={0} value={draft.price} onChange={(event) => onChange({ ...draft, price: Number(event.target.value) })} className="h-11" />
      <Label>{ru.products.category}</Label>
      <select value={draft.category_id ?? ""} onChange={(event) => onChange({ ...draft, category_id: event.target.value || null })} className="h-11 w-full border border-[#1c1915]/15 bg-transparent px-3">
        <option value="">{ru.products.none}</option>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <div className="flex items-center justify-between">
        <span className="text-sm">{ru.products.available}</span>
        <Switch checked={draft.available} onCheckedChange={(checked) => onChange({ ...draft, available: checked })} />
      </div>
      <Label>{ru.products.photos}</Label>
      <p className="text-xs text-[#6b645c]">{ru.products.photoHint}</p>
      <Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => event.target.files && void upload(event.target.files)} />
      <div className="flex gap-2 overflow-x-auto">
        {draft.photos.map((photo, index) => (
          <div key={photo.id} className="w-20 shrink-0">
            <img src={mediaUrl(photo.storage_path) ?? ""} alt="" className="h-24 w-20 object-cover" />
            <button type="button" className="text-xs" onClick={() => onPhotos(swapPhoto(draft.photos, index, -1))}>{ru.products.up}</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button type="button" className="h-11" onClick={onSave} disabled={!draft.name.trim()}>{ru.cabinet.save}</Button>
        {!draft.id.startsWith("new-") && <Button type="button" variant="outline" className="h-11" onClick={onDelete}>{ru.products.delete}</Button>}
      </div>
    </div>
  )
}

function swapPhoto(photos: Product["photos"], index: number, direction: -1 | 1) {
  const next = [...photos]
  const target = index + direction
  if (!next[target]) return photos
  const current = next[index]
  next[index] = { ...next[target], sort_order: current.sort_order }
  next[target] = { ...current, sort_order: next[target].sort_order }
  return next.sort((a, b) => a.sort_order - b.sort_order)
}

function Branding({
  store,
  categories,
  products,
  covers,
  onSave,
}: {
  store: Store
  categories: Category[]
  products: Product[]
  covers: StoreCover[]
  onSave: (store: Store) => Promise<void>
}) {
  const [draft, setDraft] = useState(store)
  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      <div>
        <h2 className="font-serif text-2xl">{ru.branding.title}</h2>
        <div className="mt-4 grid gap-2">
          {TEMPLATES.map((id) => (
            <button key={id} type="button" onClick={() => setDraft({ ...draft, template: id })} className="border px-3 py-2 text-left text-sm" style={{ borderColor: draft.template === id ? "#1c1915" : "rgba(28,25,21,0.15)" }}>
              {ru.templates[id].name}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <ColorField value={draft.accent_color} template={draft.template} onChange={(hex) => setDraft({ ...draft, accent_color: hex })} />
        </div>
        <p className="mt-3 text-sm leading-6 text-[#5f584f]">{ru.branding.any}</p>
        <Button type="button" className="mt-4 h-11" onClick={() => void onSave(draft)}>{ru.cabinet.save}</Button>
      </div>
      <div className="mx-auto h-[760px] w-full max-w-[400px] overflow-hidden rounded-[32px] border border-[#14120f]/10 bg-white shadow-[0_30px_80px_rgba(20,18,15,0.12)]">
        <div className="h-full overflow-y-auto">
          <Storefront embedded bundle={{ source: "fixture", store: draft, categories, products, covers }} />
        </div>
      </div>
    </div>
  )
}

function Settings({
  store,
  covers,
  onCovers,
  onSave,
  mode,
}: {
  store: Store
  covers: StoreCover[]
  onCovers: (covers: StoreCover[]) => void
  onSave: (store: Store) => Promise<void>
  mode: "live" | "preview"
}) {
  const [draft, setDraft] = useState(store)
  const [message, setMessage] = useState("")

  async function upload(file: File, kind: "logo" | "cover") {
    const ext = fileExtension(file)
    if (!ext) return
    if (mode === "preview") {
      const path = URL.createObjectURL(file)
      if (kind === "logo") setDraft({ ...draft, logo_path: path })
      else onCovers([...covers, { id: crypto.randomUUID(), store_id: store.id, storage_path: path, sort_order: covers.length }])
      return
    }
    const path = `${store.id}/${kind}/${crypto.randomUUID()}.${ext}`
    const uploaded = await createClient().storage.from("store-media").upload(path, file, { contentType: file.type })
    if (uploaded.error) return
    if (kind === "logo") setDraft({ ...draft, logo_path: path })
    else {
      const { data } = await createClient().from("store_covers").insert({ store_id: store.id, storage_path: path, sort_order: covers.length }).select("*").single()
      if (data) onCovers([...covers, data as StoreCover])
    }
  }

  function addField() {
    const key = `field_${draft.order_form.fields.length + 1}`
    const field: FormField = { id: key, key, label: ru.settings.fieldLabel, type: "text", required: false }
    setDraft({ ...draft, order_form: { fields: [...draft.order_form.fields, field] } })
  }

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!isValidSlug(draft.slug) || isReservedSlug(draft.slug)) return setMessage(ru.onboard.slugInvalid)
        if (!isE164(draft.whatsapp_e164)) return setMessage(ru.onboard.phoneInvalid)
        setMessage("")
        void onSave(draft)
      }}
    >
      <Label>{ru.settings.name}</Label>
      <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="h-11" />
      <Label>{ru.settings.slug}</Label>
      <Input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value.toLowerCase() })} className="h-11" />
      <Label>{ru.settings.whatsapp}</Label>
      <Input value={draft.whatsapp_e164} onChange={(event) => setDraft({ ...draft, whatsapp_e164: event.target.value })} className="h-11" />
      <Label>{ru.settings.address}</Label>
      <Input value={draft.address} onChange={(event) => setDraft({ ...draft, address: event.target.value })} className="h-11" />
      <Label>{ru.settings.logo}</Label>
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0], "logo")} />
      {draft.logo_path && <img src={mediaUrl(draft.logo_path) ?? ""} alt="" className="h-16 w-16 object-cover" />}
      <Label>{ru.settings.covers}</Label>
      <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => event.target.files?.[0] && void upload(event.target.files[0], "cover")} />
      <div className="flex gap-2 overflow-x-auto">
        {covers.map((cover) => <img key={cover.id} src={mediaUrl(cover.storage_path) ?? ""} alt="" className="h-20 w-32 object-cover" />)}
      </div>
      <h2 className="pt-4 font-serif text-2xl">{ru.settings.hours}</h2>
      {DAY_KEYS.map((day) => (
        <div key={day} className="grid grid-cols-[3rem_1fr_1fr_auto] items-center gap-2 text-sm">
          <span>{ru.days[day]}</span>
          <Input type="time" value={draft.working_hours.days[day].open} disabled={draft.working_hours.days[day].closed} onChange={(event) => setDraft({ ...draft, working_hours: { ...draft.working_hours, days: { ...draft.working_hours.days, [day]: { ...draft.working_hours.days[day], open: event.target.value } } } })} className="h-10" />
          <Input type="time" value={draft.working_hours.days[day].close} disabled={draft.working_hours.days[day].closed} onChange={(event) => setDraft({ ...draft, working_hours: { ...draft.working_hours, days: { ...draft.working_hours.days, [day]: { ...draft.working_hours.days[day], close: event.target.value } } } })} className="h-10" />
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={draft.working_hours.days[day].closed} onChange={(event) => setDraft({ ...draft, working_hours: { ...draft.working_hours, days: { ...draft.working_hours.days, [day]: { ...draft.working_hours.days[day], closed: event.target.checked } } } })} />{ru.settings.closed}</label>
        </div>
      ))}
      <h2 className="pt-4 font-serif text-2xl">{ru.settings.delivery}</h2>
      <div className="flex items-center justify-between"><span>{ru.settings.deliveryOn}</span><Switch checked={draft.delivery_enabled} onCheckedChange={(checked) => setDraft({ ...draft, delivery_enabled: checked })} /></div>
      <div className="flex items-center justify-between"><span>{ru.settings.pickupOn}</span><Switch checked={draft.pickup_enabled} onCheckedChange={(checked) => setDraft({ ...draft, pickup_enabled: checked })} /></div>
      <Label>{ru.settings.minOrder}</Label>
      <Input type="number" min={0} value={draft.min_order} onChange={(event) => setDraft({ ...draft, min_order: Number(event.target.value) })} className="h-11" />
      {draft.delivery_zones.map((zone, index) => (
        <div key={zone.id} className="grid grid-cols-[1fr_8rem_auto] gap-2">
          <Input value={zone.name} onChange={(event) => {
            const zones = draft.delivery_zones.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item)
            setDraft({ ...draft, delivery_zones: zones })
          }} className="h-11" />
          <Input type="number" min={0} value={zone.price} onChange={(event) => {
            const zones = draft.delivery_zones.map((item, itemIndex) => itemIndex === index ? { ...item, price: Number(event.target.value) } : item)
            setDraft({ ...draft, delivery_zones: zones })
          }} className="h-11" />
          <Button type="button" variant="outline" className="h-11" onClick={() => setDraft({ ...draft, delivery_zones: draft.delivery_zones.filter((item) => item.id !== zone.id) })}>{ru.settings.remove}</Button>
        </div>
      ))}
      <Button type="button" variant="outline" className="h-11" onClick={() => setDraft({ ...draft, delivery_zones: [...draft.delivery_zones, { id: crypto.randomUUID(), name: ru.settings.zoneName, price: 0 }] })}>{ru.settings.addZone}</Button>
      <h2 className="pt-4 font-serif text-2xl">{ru.settings.form}</h2>
      <p className="text-sm leading-6 text-[#5f584f]">{ru.settings.formHint}</p>
      {draft.order_form.fields.map((field, index) => (
        <div key={field.id} className="grid gap-2 border border-[#1c1915]/10 p-3">
          <Input value={field.label} onChange={(event) => {
            const fields = draft.order_form.fields.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item)
            setDraft({ ...draft, order_form: { fields } })
          }} className="h-11" />
          <div className="flex items-center justify-between text-sm">
            <span>{ru.settings.required}</span>
            <Switch checked={field.required} onCheckedChange={(checked) => {
              const fields = draft.order_form.fields.map((item, itemIndex) => itemIndex === index ? { ...item, required: checked } : item)
              setDraft({ ...draft, order_form: { fields } })
            }} />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" className="h-11" onClick={addField}>{ru.settings.addField}</Button>
      {message && <p className="text-sm text-[#9d3b32]">{message}</p>}
      <Button type="submit" className="h-11">{ru.cabinet.save}</Button>
    </form>
  )
}

function Stats({
  events,
  orders,
  products,
  capped,
}: {
  events: AnalyticsEvent[]
  orders: ShopOrder[]
  products: Product[]
  capped: boolean
}) {
  const [days, setDays] = useState<7 | 30 | 90>(7)
  const [now] = useState(() => Date.now())
  const filtered = useMemo(() => {
    const cutoff = now - days * 86_400_000
    return events.filter((event) => new Date(event.created_at).getTime() >= cutoff)
  }, [events, days, now])
  const count = (type: AnalyticsEvent["event_type"]) => filtered.filter((event) => event.event_type === type).length
  const visits = count("store_view")
  const taps = filtered.filter((event) => event.event_type === "whatsapp_click")
  const sum = taps.reduce((total, event) => total + (event.amount ?? 0), 0)
  const confirmed = orders.filter((order) => order.status === "confirmed").length
  const sources = new Map<string, number>()
  for (const event of filtered.filter((item) => item.event_type === "store_view")) {
    const key = event.source || ru.stats.direct
    sources.set(key, (sources.get(key) ?? 0) + 1)
  }
  const top = new Map<string, number>()
  for (const event of filtered.filter((item) => item.event_type === "add_to_cart" && item.product_id)) {
    top.set(event.product_id as string, (top.get(event.product_id as string) ?? 0) + 1)
  }
  const series = Array.from({ length: days }, (_, index) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (days - 1 - index))
    const key = date.toLocaleDateString("en-CA")
    return {
      key,
      views: filtered.filter((event) => event.event_type === "store_view" && new Date(event.created_at).toLocaleDateString("en-CA") === key).length,
    }
  })
  const max = Math.max(1, ...series.map((item) => item.views))
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm leading-6 text-[#5f584f]">{ru.stats.honest}</p>
      <div className="flex gap-2">
        {([7, 30, 90] as const).map((value) => (
          <button key={value} type="button" onClick={() => setDays(value)} className="h-9 border px-3 text-sm" style={{ borderColor: days === value ? "#1c1915" : "rgba(28,25,21,0.15)", background: days === value ? "#1c1915" : "transparent", color: days === value ? "#f6f3ee" : "#1c1915" }}>
            {value === 7 ? ru.stats.period.d7 : value === 30 ? ru.stats.period.d30 : ru.stats.period.d90}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-sm">{ru.stats.empty}</p> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label={ru.stats.visits} value={String(visits)} />
        <Metric label={ru.stats.productViews} value={String(count("product_view"))} />
        <Metric label={ru.stats.carts} value={String(count("add_to_cart"))} />
        <Metric label={ru.stats.taps} value={String(taps.length)} />
        <Metric label={ru.stats.sum} value={formatMoney(sum)} />
        <Metric label={ru.stats.conversion} value={visits ? `${Math.round((taps.length / visits) * 100)}%` : ru.stats.noVisits} />
        <Metric label={ru.stats.confirmed} value={String(confirmed)} />
        <Metric label={ru.stats.cancelled} value={String(orders.filter((order) => order.status === "cancelled").length)} />
      </div>
      <div>
        <h2 className="text-sm text-[#6b645c]">{ru.stats.chart}</h2>
        <div className="mt-3 flex h-32 items-end gap-1">
          {series.map((item) => (
            <div key={item.key} className="flex-1 bg-[#1c1915]" style={{ height: `${(item.views / max) * 100}%`, minHeight: item.views ? 4 : 1 }} title={`${item.key}: ${item.views}`} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section>
          <h2 className="text-sm text-[#6b645c]">{ru.stats.sources}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {[...sources.entries()].map(([source, value]) => <li key={source} className="flex justify-between"><span>{source}</span><span>{value}</span></li>)}
          </ul>
        </section>
        <section>
          <h2 className="text-sm text-[#6b645c]">{ru.stats.top}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {[...top.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, value]) => (
              <li key={id} className="flex justify-between"><span>{products.find((product) => product.id === id)?.name ?? id}</span><span>{value}</span></li>
            ))}
          </ul>
        </section>
      </div>
      {capped && <p className="text-sm text-[#6b645c]">{ru.stats.capped}</p>}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#14120f]/8 bg-[#fffcf8] p-4">
      <p className="text-xs text-[#6b645c]">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  )
}

function More({ base, mode }: { base: string; mode: "live" | "preview" }) {
  const router = useRouter()
  return (
    <div className="grid max-w-sm gap-2">
      <Link href={`${base}/settings`} className="border border-[#1c1915]/10 px-4 py-3">{ru.cabinet.settings}</Link>
      <Link href={`${base}/stats`} className="border border-[#1c1915]/10 px-4 py-3">{ru.cabinet.stats}</Link>
      <button
        type="button"
        className="border border-[#1c1915]/10 px-4 py-3 text-left"
        onClick={async () => {
          if (mode === "live") await createClient().auth.signOut()
          router.push("/")
          router.refresh()
        }}
      >
        {ru.cabinet.logout}
      </button>
    </div>
  )
}
