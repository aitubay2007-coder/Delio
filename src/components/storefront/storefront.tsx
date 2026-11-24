"use client"

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TEMPLATE_THEME, isOpenNow, storeAcceptsOrders, todayHours } from "@/lib/catalog"
import { deriveAccent } from "@/lib/color"
import { deriveSource, formatMoney, orderNumber, todayIso, utmPayload } from "@/lib/format"
import { createClient } from "@/lib/supabase/client"
import type { Fulfillment, Product, StoreBundle, TemplateId } from "@/lib/types"
import { ru } from "@/i18n/ru"
import { buildWhatsappMessage, whatsappHref } from "@/lib/whatsapp"
import { Frame } from "@/components/storefront/frame"
import { Catalog } from "@/components/storefront/layouts"

type Line = { productId: string; qty: number }
type Step = "cart" | "form" | "review"

export function Storefront({
  bundle,
  template,
  accent,
  embedded = false,
  demo = false,
}: {
  bundle: StoreBundle
  template?: TemplateId
  accent?: string
  embedded?: boolean
  demo?: boolean
}) {
  const reduce = useReducedMotion()
  const activeTemplate = template ?? bundle.store.template
  const theme = TEMPLATE_THEME[activeTemplate]
  const tokens = deriveAccent(accent ?? bundle.store.accent_color, theme.bg)
  const rawCart = useSyncExternalStore(subscribeCart, () => readCart(bundle.store.slug), () => "[]")
  const storedLines = useMemo(() => parseCart(rawCart), [rawCart])
  const [demoLines, setDemoLines] = useState<Line[]>([])
  const lines = demo ? demoLines : storedLines
  const setLines = (update: (current: Line[]) => Line[]) => {
    if (demo) {
      setDemoLines((current) => update(current))
      return
    }
    writeCart(bundle.store.slug, update(parseCart(readCart(bundle.store.slug))))
  }
  const scroller = useRef<HTMLDivElement>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [step, setStep] = useState<Step>("cart")
  const [category, setCategory] = useState<string>("all")
  const [occasion, setOccasion] = useState<string | null>(null)
  const [pulse, setPulse] = useState(0)
  const openState = useSyncExternalStore(
    () => () => {},
    () => (isOpenNow(bundle.store.working_hours) ? "open" : "closed"),
    () => "pending",
  )
  const openNow = openState === "pending" ? null : openState === "open"
  const vars = {
    "--sf-bg": theme.bg,
    "--sf-ink": theme.ink,
    "--sf-muted": theme.muted,
    "--sf-accent": tokens.accent,
    "--sf-button-bg": tokens.buttonBg,
    "--sf-button-text": tokens.buttonText,
    "--sf-text": tokens.text,
    "--sf-soft": tokens.soft,
    "--sf-line": tokens.line,
    "--sf-radius": theme.radius,
    background: theme.bg,
    color: theme.ink,
  } as CSSProperties

  const products = bundle.products
  const byId = useMemo(() => new Map(products.map((item) => [item.id, item])), [products])
  const detailed = lines
    .map((line) => {
      const item = byId.get(line.productId)
      return item ? { ...line, product: item } : null
    })
    .filter((line): line is Line & { product: Product } => Boolean(line))
  const subtotal = detailed.reduce((sum, line) => sum + line.product.price * line.qty, 0)
  const count = detailed.reduce((sum, line) => sum + line.qty, 0)

  useEffect(() => {
    if (!demo || reduce) return
    let stop = false
    const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))
    async function play() {
      while (!stop) {
        await wait(500)
        if (stop) return
        setDemoLines([])
        setCartOpen(false)
        setStep("cart")
        scroller.current?.scrollTo({ top: 0, behavior: "smooth" })
        await wait(1000)
        if (stop) return
        scroller.current?.scrollTo({ top: 320, behavior: "smooth" })
        await wait(1200)
        if (stop) return
        const first = bundle.products.find((item) => item.available)
        if (first) {
          setDemoLines([{ productId: first.id, qty: 1 }])
          setPulse((value) => value + 1)
        }
        await wait(800)
        if (stop) return
        setStep("cart")
        setCartOpen(true)
        await wait(1200)
        if (stop) return
        setStep("form")
        await wait(3400)
        if (stop) return
        setStep("review")
        await wait(2600)
      }
    }
    void play()
    return () => {
      stop = true
    }
  }, [demo, reduce, bundle.products])

  useEffect(() => {
    if (bundle.source !== "database" || demo) return
    const day = todayIso(bundle.store.working_hours.timezone)
    const key = `vitrina-view-${bundle.store.id}-${day}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, "1")
    void logEvent(bundle, "store_view", null, null)
  }, [bundle, demo])

  function add(item: Product) {
    if (!item.available) return
    setLines((current) => {
      const found = current.find((line) => line.productId === item.id)
      if (found) {
        return current.map((line) =>
          line.productId === item.id ? { ...line, qty: Math.min(99, line.qty + 1) } : line,
        )
      }
      return [...current, { productId: item.id, qty: 1 }]
    })
    setPulse((value) => value + 1)
    if (bundle.source === "database") void logEvent(bundle, "add_to_cart", item.id, null)
  }

  function setQty(productId: string, qty: number) {
    setLines((current) =>
      qty <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) => (line.productId === productId ? { ...line, qty } : line)),
    )
  }

  const visible =
    category === "all" ? products : products.filter((item) => item.category_id === category)
  const dayLabel = useSyncExternalStore(
    () => () => {},
    () => {
      const day = todayHours(bundle.store.working_hours)
      return day?.closed ? ru.store.dayOff : day ? `${day.open}–${day.close}` : ""
    },
    () => "",
  )
  const live = storeAcceptsOrders(bundle.store)

  if (!live) {
    return (
      <main className="grid min-h-dvh place-items-center px-6" style={vars}>
        <div className="max-w-md text-center">
          <p className="text-xs tracking-[0.18em] uppercase" style={{ color: "var(--sf-muted)" }}>
            {bundle.store.name}
          </p>
          <h1 className="mt-4 font-serif text-4xl">{ru.store.pausedTitle}</h1>
          <p className="mt-4 text-sm leading-6" style={{ color: "var(--sf-muted)" }}>
            {ru.store.pausedText}
          </p>
        </div>
      </main>
    )
  }

  return (
    <div className={demo ? "relative h-full" : undefined} style={demo ? vars : undefined}>
    <div
      ref={demo ? scroller : undefined}
      data-template={activeTemplate}
      className={demo ? "h-full overflow-y-auto pb-24" : embedded ? "relative min-h-full pb-24" : "min-h-dvh pb-28"}
      style={demo ? undefined : vars}
    >
      <Catalog
        template={activeTemplate}
        bundle={bundle}
        products={visible}
        category={category}
        onCategory={setCategory}
        onOpen={(item) => {
          setProduct(item)
          if (bundle.source === "database") {
            const key = `vitrina-product-${item.id}`
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1")
              void logEvent(bundle, "product_view", item.id, null)
            }
          }
        }}
        onAdd={add}
        openNow={openNow}
        dayLabel={dayLabel}
        occasion={occasion}
        onOccasion={setOccasion}
      />

      {count > 0 && !demo && (
        <div className={embedded ? "sticky bottom-0 z-30 px-4 pb-4" : "fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"}>
          <motion.button
            type="button"
            onClick={() => {
              setStep("cart")
              setCartOpen(true)
            }}
            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
            key={pulse}
            className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-3 text-sm shadow-lg"
            style={{
              background: "var(--sf-button-bg)",
              color: "var(--sf-button-text)",
              borderRadius: activeTemplate === "vivid" ? "999px" : "var(--sf-radius)",
            }}
          >
            <span>
              {count} · {formatMoney(subtotal)}
            </span>
            <span>{ru.store.cart}</span>
          </motion.button>
        </div>
      )}

      </div>
      {demo && count > 0 && !cartOpen && (
        <div className="absolute inset-x-0 bottom-0 z-30 px-3 pb-3">
          <div className="flex items-center justify-between rounded-full px-4 py-3 text-sm shadow-[0_10px_30px_rgba(20,18,15,0.18)]" style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}>
            <span>{count} · {formatMoney(subtotal)}</span>
            <span>{ru.store.cart}</span>
          </div>
        </div>
      )}
      {demo && cartOpen && (
        <div className="absolute inset-x-0 bottom-0 z-40 max-h-[78%] overflow-y-auto rounded-t-[28px] shadow-[0_-24px_60px_rgba(20,18,15,0.2)]" style={vars}>
          <Checkout
            bundle={bundle}
            lines={detailed}
            subtotal={subtotal}
            step={step}
            setStep={setStep}
            setQty={setQty}
            occasion={occasion}
            onClose={() => setCartOpen(false)}
            scripted={step === "form" || step === "review"}
          />
        </div>
      )}

      {!demo && (
      <>
      <Sheet open={Boolean(product)} onOpenChange={(open) => !open && setProduct(null)}>
        <SheetContent side="bottom" showCloseButton className="sf-sheet sf-sheet-fill overflow-y-auto" style={vars}>
          {product && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>{product.name}</SheetTitle>
                <SheetDescription>{product.description}</SheetDescription>
              </SheetHeader>
              <Gallery photos={product.photos.map((photo) => photo.storage_path)} alt={product.name} />
              <div className="mt-5 flex items-end justify-between gap-4">
                <h2 className="text-3xl leading-none">{product.name}</h2>
                <p style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
              </div>
              <p className="mt-4 max-w-prose text-sm leading-6" style={{ color: "var(--sf-muted)" }}>
                {product.description}
              </p>
              <button
                type="button"
                disabled={!product.available}
                onClick={() => add(product)}
                className="mt-6 h-12 w-full text-sm disabled:opacity-40"
                style={{
                  background: "var(--sf-button-bg)",
                  color: "var(--sf-button-text)",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                {product.available ? ru.store.add : ru.store.unavailable}
              </button>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Sheet
        open={cartOpen}
        onOpenChange={(open) => {
          setCartOpen(open)
          if (!open) setStep("cart")
        }}
      >
        <SheetContent side="bottom" className="sf-sheet overflow-y-auto" style={vars}>
          <SheetHeader>
            <SheetTitle>{step === "review" ? ru.store.messageTitle : ru.store.cart}</SheetTitle>
            <SheetDescription className="sr-only">{bundle.store.name}</SheetDescription>
          </SheetHeader>
          <Checkout
            bundle={bundle}
            lines={detailed}
            subtotal={subtotal}
            step={step}
            setStep={setStep}
            setQty={setQty}
            occasion={occasion}
            onClose={() => setCartOpen(false)}
          />
        </SheetContent>
      </Sheet>
      </>
      )}
    </div>
  )
}

function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const sources = photos.length ? photos : [null]
  return (
    <div>
      <div
        ref={ref}
        onScroll={(event) => {
          const el = event.currentTarget
          setIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)))
        }}
        className="sf-scroll flex aspect-[4/5] overflow-x-auto"
      >
        {sources.map((path, photoIndex) => (
          <div key={path ?? photoIndex} className="h-full w-full shrink-0">
            <Frame path={path} alt={alt} className="h-full w-full" />
          </div>
        ))}
      </div>
      {sources.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {sources.map((path, dot) => (
            <span
              key={path ?? dot}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: dot === index ? "var(--sf-ink)" : "var(--sf-line)" }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Checkout({
  bundle,
  lines,
  subtotal,
  step,
  setStep,
  setQty,
  occasion,
  onClose,
  scripted = false,
}: {
  bundle: StoreBundle
  lines: (Line & { product: Product })[]
  subtotal: number
  step: Step
  setStep: (step: Step) => void
  setQty: (id: string, qty: number) => void
  occasion: string | null
  onClose: () => void
  scripted?: boolean
}) {
  const store = bundle.store
  const [fulfillment, setFulfillment] = useState<Fulfillment>(store.delivery_enabled ? "delivery" : "pickup")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+7")
  const [address, setAddress] = useState("")
  const [zoneId, setZoneId] = useState(store.delivery_zones[0]?.id ?? "")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [comment, setComment] = useState("")
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [number, setNumber] = useState("")
  const zone = store.delivery_zones.find((item) => item.id === zoneId) ?? null
  const deliveryPrice = fulfillment === "delivery" ? (zone?.price ?? 0) : 0
  const total = subtotal + deliveryPrice
  const belowMin = store.min_order > 0 && subtotal < store.min_order

  useEffect(() => {
    if (!scripted) return
    if (step === "review") {
      const id = window.setTimeout(() => {
        setName("Алия")
        setPhone("+77010000001")
        setAddress("ул. Абая 10")
        setDate("2026-11-25")
        setTime("14:00")
        setNumber("A7K2QM")
        setExtras((current) => ({ ...current, card_text: "С днём рождения" }))
      }, 0)
      return () => window.clearTimeout(id)
    }
    if (step !== "form") return
    let cancelled = false
    const typeInto = async (setter: (value: string) => void, text: string) => {
      for (let index = 1; index <= text.length; index += 1) {
        if (cancelled) return
        setter(text.slice(0, index))
        await new Promise((resolve) => window.setTimeout(resolve, 48))
      }
    }
    void (async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 0))
      if (cancelled) return
      await typeInto(setName, "Алия")
      await typeInto(setPhone, "+77010000001")
      await typeInto(setAddress, "ул. Абая 10")
      if (cancelled) return
      setDate("2026-11-25")
      setTime("14:00")
    })()
    return () => {
      cancelled = true
    }
  }, [scripted, step])

  const message = buildWhatsappMessage({
    shopName: store.name,
    orderNumber: number || "······",
    items: lines.map((line) => ({ name: line.product.name, qty: line.qty, price: line.product.price })),
    subtotal,
    fulfillment,
    deliveryPrice,
    zoneName: fulfillment === "delivery" ? zone?.name : null,
    total,
    customerName: name.trim(),
    customerPhone: phone.trim(),
    address,
    date,
    time,
    comment: [occasion, comment.trim()].filter(Boolean).join(". "),
    extras: store.order_form.fields
      .filter((field) => field.type !== "checkbox" || extras[field.key] === "да")
      .map((field) => ({
        label: field.label,
        value: field.type === "checkbox" ? "да" : (extras[field.key] ?? ""),
      })),
  })

  function validate() {
    if (!name.trim()) return ru.store.required
    if (phone.replace(/\D/g, "").length < 10) return ru.store.required
    if (fulfillment === "delivery" && address.trim().length < 3) return ru.store.required
    if (fulfillment === "delivery" && store.delivery_zones.length > 0 && !zone) return ru.store.required
    if (!date || !time) return ru.store.required
    for (const field of store.order_form.fields) {
      if (!field.required) continue
      if (field.type === "checkbox" && extras[field.key] !== "да") return ru.store.required
      if (field.type !== "checkbox" && !extras[field.key]?.trim()) return ru.store.required
    }
    if (belowMin) return `${ru.store.minOrder}: ${formatMoney(store.min_order)}`
    return ""
  }

  async function send() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError("")
    let code = number || orderNumber()
    const payload = {
      store_id: store.id,
      order_number: code,
      status: "new",
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      fulfillment,
      address: fulfillment === "delivery" ? address.trim() : "",
      delivery_zone_id: fulfillment === "delivery" ? zone?.id ?? null : null,
      delivery_zone_name: fulfillment === "delivery" ? zone?.name ?? null : null,
      delivery_price: deliveryPrice,
      scheduled_date: date,
      scheduled_time: time,
      comment: [occasion, comment.trim()].filter(Boolean).join(". "),
      extra_fields: Object.fromEntries(
        store.order_form.fields
          .map((field) => [field.key, field.type === "checkbox" ? (extras[field.key] === "да" ? "да" : "") : extras[field.key] ?? ""])
          .filter(([, value]) => String(value).trim()),
      ),
      items: lines.map((line) => ({
        product_id: line.product.id,
        name: line.product.name,
        qty: line.qty,
        price: line.product.price,
      })),
      subtotal,
      total,
      currency: "KZT",
    }
    const href = whatsappHref(
      store.whatsapp_e164,
      buildWhatsappMessage({ ...messageInput(code) }),
    )

    if (bundle.source !== "database") {
      setNumber(code)
      setSaving(false)
      window.location.assign(href)
      return
    }

    try {
      const supabase = createClient()
      let saved = false
      for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
        payload.order_number = code
        const { error: insertError } = await supabase.from("orders").insert(payload)
        if (!insertError) {
          saved = true
          break
        }
        if (!insertError.message.toLowerCase().includes("duplicate") && insertError.code !== "23505") {
          throw insertError
        }
        code = orderNumber()
      }
      if (!saved) throw new Error("duplicate")
      setNumber(code)
      await logEvent(bundle, "whatsapp_click", null, total)
      window.location.assign(whatsappHref(store.whatsapp_e164, buildWhatsappMessage(messageInput(code))))
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : ""
      setError(humanError(text))
      setSaving(false)
    }

    function messageInput(code: string) {
      return {
        shopName: store.name,
        orderNumber: code,
        items: lines.map((line) => ({ name: line.product.name, qty: line.qty, price: line.product.price })),
        subtotal,
        fulfillment,
        deliveryPrice,
        zoneName: fulfillment === "delivery" ? zone?.name : null,
        total,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        address,
        date,
        time,
        comment: [occasion, comment.trim()].filter(Boolean).join(". "),
        extras: store.order_form.fields
          .filter((field) => (field.type === "checkbox" ? extras[field.key] === "да" : extras[field.key]?.trim()))
          .map((field) => ({ label: field.label, value: field.type === "checkbox" ? "да" : extras[field.key] })),
      }
    }
  }

  if (!lines.length) {
    return <p className="px-4 text-sm" style={{ color: "var(--sf-muted)" }}>{ru.store.emptyCart}</p>
  }

  if (step === "cart") {
    return (
      <div className="space-y-4 px-4 pb-6">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center gap-3">
            <Frame path={line.product.photos[0]?.storage_path} alt="" className="h-16 w-14" />
            <div className="min-w-0 flex-1">
              <p className="truncate">{line.product.name}</p>
              <p className="text-sm" style={{ color: "var(--sf-text)" }}>
                {formatMoney(line.product.price)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label={ru.a11y.decrease} onClick={() => setQty(line.productId, line.qty - 1)} className="h-8 w-8 border" style={{ borderColor: "var(--sf-line)" }}>–</button>
              <span className="w-4 text-center text-sm">{line.qty}</span>
              <button type="button" aria-label={ru.a11y.increase} onClick={() => setQty(line.productId, line.qty + 1)} className="h-8 w-8 border" style={{ borderColor: "var(--sf-line)" }}>+</button>
            </div>
          </div>
        ))}
        <Row label={ru.store.goods} value={formatMoney(subtotal)} />
        {belowMin && (
          <p className="text-sm" style={{ color: "var(--sf-text)" }}>
            {ru.store.minOrder}: {formatMoney(store.min_order)}
          </p>
        )}
        <button
          type="button"
          disabled={belowMin}
          onClick={() => {
            setStep("form")
            if (bundle.source === "database") void logEvent(bundle, "checkout_start", null, null)
          }}
          className="h-12 w-full text-sm disabled:opacity-40"
          style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)", borderRadius: "var(--sf-radius)" }}
        >
          {ru.store.checkout}
        </button>
      </div>
    )
  }

  if (step === "form") {
    return (
      <form
        className="space-y-3 px-4 pb-8"
        onSubmit={(event) => {
          event.preventDefault()
          const problem = validate()
          if (problem) {
            setError(problem)
            return
          }
          if (!number) setNumber(orderNumber())
          setError("")
          setStep("review")
        }}
      >
        {store.delivery_enabled && store.pickup_enabled && (
          <div className="grid grid-cols-2 gap-2">
            {(["delivery", "pickup"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFulfillment(option)}
                className="h-10 border text-sm"
                style={{
                  borderColor: fulfillment === option ? "var(--sf-ink)" : "var(--sf-line)",
                  background: fulfillment === option ? "var(--sf-soft)" : "transparent",
                  borderRadius: "var(--sf-radius)",
                }}
              >
                {option === "delivery" ? ru.store.delivery : ru.store.pickup}
              </button>
            ))}
          </div>
        )}
        <Field label={ru.store.name} value={name} onChange={setName} />
        <Field label={ru.store.phone} value={phone} onChange={setPhone} inputMode="tel" />
        {fulfillment === "delivery" && <Field label={ru.store.address} value={address} onChange={setAddress} />}
        {fulfillment === "delivery" && store.delivery_zones.length > 0 && (
          <label className="block text-sm">
            <span style={{ color: "var(--sf-muted)" }}>{ru.store.zone}</span>
            <select
              value={zoneId}
              onChange={(event) => setZoneId(event.target.value)}
              className="mt-1 h-11 w-full border bg-transparent px-3"
              style={{ borderColor: "var(--sf-line)", borderRadius: "var(--sf-radius)" }}
            >
              {store.delivery_zones.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {formatMoney(item.price)}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm">
            <span style={{ color: "var(--sf-muted)" }}>{ru.store.date}</span>
            <input type="date" required value={date} min={todayIso(store.working_hours.timezone)} onChange={(event) => setDate(event.target.value)} className="mt-1 h-11 w-full border bg-transparent px-3" style={{ borderColor: "var(--sf-line)", borderRadius: "var(--sf-radius)" }} />
          </label>
          <label className="block text-sm">
            <span style={{ color: "var(--sf-muted)" }}>{ru.store.time}</span>
            <input type="time" required value={time} onChange={(event) => setTime(event.target.value)} className="mt-1 h-11 w-full border bg-transparent px-3" style={{ borderColor: "var(--sf-line)", borderRadius: "var(--sf-radius)" }} />
          </label>
        </div>
        {store.order_form.fields.map((field) =>
          field.type === "checkbox" ? (
            <label key={field.key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={extras[field.key] === "да"}
                onChange={(event) => setExtras((current) => ({ ...current, [field.key]: event.target.checked ? "да" : "" }))}
              />
              {field.label}
            </label>
          ) : (
            <Field
              key={field.key}
              label={field.label}
              value={extras[field.key] ?? ""}
              onChange={(value) => setExtras((current) => ({ ...current, [field.key]: value }))}
              multiline={field.type === "textarea"}
            />
          ),
        )}
        <Field label={ru.store.comment} value={comment} onChange={setComment} multiline />
        <Row label={ru.store.goods} value={formatMoney(subtotal)} />
        {fulfillment === "delivery" && <Row label={ru.store.delivery} value={formatMoney(deliveryPrice)} />}
        <Row label={ru.store.total} value={formatMoney(total)} />
        {error && <p className="text-sm" style={{ color: "var(--sf-text)" }}>{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={() => setStep("cart")} className="h-12 flex-1 border text-sm" style={{ borderColor: "var(--sf-line)", borderRadius: "var(--sf-radius)" }}>{ru.store.back}</button>
          <button type="submit" className="h-12 flex-[2] text-sm" style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)", borderRadius: "var(--sf-radius)" }}>{ru.store.messageTitle}</button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-4 px-4 pb-8">
      {bundle.source === "fixture" && (
        <p className="text-sm leading-6" style={{ color: "var(--sf-muted)" }}>{ru.store.fixtureNote}</p>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-6 whitespace-pre-wrap" style={{ background: "#e7f6df", color: "#17301c", borderRadius: "18px" }}>
        {message}
      </pre>
      {error && <p className="text-sm">{error}</p>}
      <button
        type="button"
        disabled={saving}
        onClick={() => void send()}
        className="h-12 w-full text-sm disabled:opacity-50"
        style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)", borderRadius: "var(--sf-radius)" }}
      >
        {saving ? ru.store.sending : ru.store.send}
      </button>
      <button type="button" onClick={onClose} className="w-full text-sm" style={{ color: "var(--sf-muted)" }}>{ru.nav.close}</button>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline,
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  inputMode?: "tel" | "text"
}) {
  const className = "mt-1 w-full border bg-transparent px-3 text-base"
  const style = { borderColor: "var(--sf-line)", borderRadius: "var(--sf-radius)" }
  return (
    <label className="block text-sm">
      <span style={{ color: "var(--sf-muted)" }}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${className} min-h-20 py-2`} style={style} />
      ) : (
        <input value={value} inputMode={inputMode} onChange={(event) => onChange(event.target.value)} className={`${className} h-11`} style={style} />
      )}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "var(--sf-muted)" }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

async function logEvent(
  bundle: StoreBundle,
  eventType: "store_view" | "product_view" | "add_to_cart" | "checkout_start" | "whatsapp_click",
  productId: string | null,
  amount: number | null,
) {
  try {
    const key = "vitrina-sid"
    let sessionId = localStorage.getItem(key)
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem(key, sessionId)
    }
    const supabase = createClient()
    await supabase.from("analytics_events").insert({
      store_id: bundle.store.id,
      event_type: eventType,
      product_id: productId,
      amount,
      source: deriveSource(window.location.search, document.referrer, window.location.host),
      utm: utmPayload(window.location.search),
      referrer: document.referrer.slice(0, 500) || null,
      session_id: sessionId,
    })
  } catch {
    // Analytics must not block the shopper.
  }
}

const cartListeners = new Set<() => void>()

function subscribeCart(callback: () => void) {
  cartListeners.add(callback)
  return () => {
    cartListeners.delete(callback)
  }
}

function readCart(slug: string) {
  try {
    return localStorage.getItem(`vitrina-cart-${slug}`) ?? "[]"
  } catch {
    return "[]"
  }
}

function writeCart(slug: string, next: Line[]) {
  localStorage.setItem(`vitrina-cart-${slug}`, JSON.stringify(next))
  cartListeners.forEach((listener) => listener())
}

function parseCart(raw: string): Line[] {
  try {
    const parsed = JSON.parse(raw) as Line[]
    return Array.isArray(parsed) ? parsed.filter((line) => line.qty > 0 && line.productId) : []
  } catch {
    return []
  }
}

function humanError(message: string) {
  const text = message.toLowerCase()
  if (text.includes("rate limit")) return ru.errors.rate
  if (text.includes("price") || text.includes("mismatch")) return ru.errors.price
  if (text.includes("unavailable")) return ru.errors.unavailable
  if (text.includes("minimum")) return ru.errors.minimum
  return ru.store.orderFailed
}
