"use client"

import { useEffect, useMemo, useState, useSyncExternalStore, type CSSProperties } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { COPPER, GRAPHITE, IVORY, TEMPLATE_THEME, isOpenNow, storeAcceptsOrders, todayHours } from "@/lib/catalog"
import { contrast, deriveAccent, normalizeHex, pickText } from "@/lib/color"
import { deriveSource, formatMoney, orderNumber, todayIso, utmPayload } from "@/lib/format"
import { dateOptions, timeOptions } from "@/lib/schedule"
import { createClient } from "@/lib/supabase/client"
import type { Fulfillment, Product, StoreBundle, TemplateId } from "@/lib/types"
import { ru } from "@/i18n/ru"
import { buildWhatsappMessage, whatsappHref } from "@/lib/whatsapp"
import { Frame } from "@/components/storefront/frame"
import { Catalog } from "@/components/storefront/layouts"
import { CartDock, Choice, PrimaryButton, QtyControl, TextField, Totals } from "@/components/storefront/pieces"

type Line = { productId: string; qty: number }
type Step = "cart" | "form"

export function Storefront({
  bundle,
  template,
  accent,
  embedded = false,
}: {
  bundle: StoreBundle
  template?: TemplateId
  accent?: string
  embedded?: boolean
}) {
  const activeTemplate = template ?? bundle.store.template
  const theme = TEMPLATE_THEME[activeTemplate]
  const custom = normalizeHex(accent ?? bundle.store.accent_color) ?? COPPER
  const tokens = deriveAccent(custom, theme.bg)
  const cinematic = activeTemplate === "cinematic"
  const palette = !cinematic && custom === COPPER
  const buttonBg = palette ? GRAPHITE : tokens.buttonBg
  const buttonText = palette ? IVORY : tokens.buttonText
  const onAccent = contrast(GRAPHITE, tokens.accent) >= 4.5 ? GRAPHITE : pickText(tokens.accent)
  const rawCart = useSyncExternalStore(subscribeCart, () => readCart(bundle.store.slug), () => "[]")
  const lines = useMemo(() => parseCart(rawCart), [rawCart])
  const setLines = (update: (current: Line[]) => Line[]) => {
    writeCart(bundle.store.slug, update(parseCart(readCart(bundle.store.slug))))
  }
  const [product, setProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [step, setStep] = useState<Step>("cart")
  const [category, setCategory] = useState<string>("all")
  const [occasion, setOccasion] = useState<string | null>(null)
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
    "--sf-on-accent": onAccent,
    "--sf-button-bg": buttonBg,
    "--sf-button-text": buttonText,
    "--sf-text": theme.ink,
    "--sf-soft": cinematic ? "rgba(244,240,232,0.08)" : "rgba(183,130,104,0.12)",
    "--sf-line": cinematic ? "rgba(244,240,232,0.16)" : "rgba(41,37,36,0.12)",
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
    if (bundle.source === "database") void logEvent(bundle, "add_to_cart", item.id, null)
  }

  function setQty(productId: string, qty: number) {
    setLines((current) =>
      qty <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) => (line.productId === productId ? { ...line, qty } : line)),
    )
  }

  const visible = category === "all" ? products : products.filter((item) => item.category_id === category)
  const dayLabel = useSyncExternalStore(
    () => () => {},
    () => {
      const day = todayHours(bundle.store.working_hours)
      return day?.closed ? ru.store.dayOff : day ? `${day.open}–${day.close}` : ""
    },
    () => "",
  )
  useEffect(() => {
    if (bundle.source !== "database") return
    const day = todayIso(bundle.store.working_hours.timezone)
    const key = `vitrina-view-${bundle.store.id}-${day}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, "1")
    void logEvent(bundle, "store_view", null, null)
  }, [bundle])

  const live = storeAcceptsOrders(bundle.store)

  if (!live) {
    return (
      <main className="grid min-h-dvh place-items-center px-5" style={vars}>
        <div className="max-w-md text-center">
          <p className="text-[13px] tracking-[0.14em] uppercase" style={{ color: "var(--sf-muted)" }}>
            {bundle.store.name}
          </p>
          <h1 className="mt-4 text-[32px] leading-none">{ru.store.pausedTitle}</h1>
          <p className="mt-4 text-base leading-6" style={{ color: "var(--sf-muted)" }}>
            {ru.store.pausedText}
          </p>
        </div>
      </main>
    )
  }

  const dock = count > 0 && (
    <div
      className={
        embedded
          ? "absolute inset-x-0 bottom-0 z-30 px-4 pb-3"
          : "pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(12px,env(safe-area-inset-bottom))]"
      }
    >
      <div className={embedded ? undefined : "pointer-events-auto w-full max-w-xl"}>
        <CartDock
          count={count}
          amount={subtotal}
          onOpen={() => {
            setStep("cart")
            setCartOpen(true)
          }}
        />
      </div>
    </div>
  )

  return (
    <div className={embedded ? "relative h-full" : undefined} style={embedded ? vars : undefined}>
      <div
        className={embedded ? "absolute inset-0 overflow-y-auto" : "min-h-dvh"}
        style={embedded ? undefined : vars}
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
          onQty={(item, qty) => setQty(item.id, qty)}
          qtyFor={(id) => lines.find((line) => line.productId === id)?.qty ?? 0}
          openNow={openNow}
          dayLabel={dayLabel}
          occasion={occasion}
          onOccasion={setOccasion}
        />
      </div>
      {dock}

      <Sheet open={Boolean(product)} onOpenChange={(open) => !open && setProduct(null)}>
        <SheetContent side="bottom" showCloseButton className="sf-sheet sf-sheet-fill overflow-y-auto" style={vars}>
          {product && (
            <>
              <SheetHeader className="sr-only">
                <SheetTitle>{product.name}</SheetTitle>
                <SheetDescription>{product.description}</SheetDescription>
              </SheetHeader>
              <Gallery photos={product.photos.map((photo) => photo.storage_path)} alt={product.name} />
              <div className="mt-4 flex items-end justify-between gap-4">
                <h2 className="text-[22px] leading-tight">{product.name}</h2>
                <p className="shrink-0 text-base tabular-nums">{formatMoney(product.price)}</p>
              </div>
              <p className="mt-3 max-w-prose text-base leading-6" style={{ color: "var(--sf-muted)" }}>
                {product.description}
              </p>
              <div className="mt-4">
                {(lines.find((line) => line.productId === product.id)?.qty ?? 0) > 0 ? (
                  <QtyControl
                    qty={lines.find((line) => line.productId === product.id)?.qty ?? 0}
                    onChange={(qty) => setQty(product.id, qty)}
                  />
                ) : (
                  <PrimaryButton disabled={!product.available} onClick={() => add(product)}>
                    {product.available ? ru.store.add : ru.store.unavailable}
                  </PrimaryButton>
                )}
              </div>
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
          <SheetHeader className="pr-12">
            <SheetTitle className="text-[22px] leading-tight">
              {step === "form" ? ru.store.checkoutTitle : ru.store.cart}
            </SheetTitle>
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
            onClose={() => {
              setCartOpen(false)
              document.getElementById("catalog")?.scrollIntoView({ block: "start" })
            }}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function Gallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const sources = photos.length ? photos : [null]
  return (
    <div>
      <div
        onScroll={(event) => {
          const el = event.currentTarget
          setIndex(Math.round(el.scrollLeft / Math.max(el.clientWidth, 1)))
        }}
        className="sf-scroll flex aspect-[4/5] overflow-x-auto rounded-[14px]"
      >
        {sources.map((path, photoIndex) => (
          <div key={path ?? photoIndex} className="h-full w-full shrink-0">
            <Frame path={path} alt={alt} fit="contain" className="h-full w-full" />
          </div>
        ))}
      </div>
      {sources.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
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

let cachedNow = 0

function useNow() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      if (!cachedNow) cachedNow = Date.now()
      return cachedNow
    },
    () => 0,
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
}: {
  bundle: StoreBundle
  lines: (Line & { product: Product })[]
  subtotal: number
  step: Step
  setStep: (step: Step) => void
  setQty: (id: string, qty: number) => void
  occasion: string | null
  onClose: () => void
}) {
  const store = bundle.store
  const nowMs = useNow()
  const [fulfillment, setFulfillment] = useState<Fulfillment>(store.delivery_enabled ? "delivery" : "pickup")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+7")
  const [address, setAddress] = useState("")
  const [zoneId, setZoneId] = useState(store.delivery_zones.find((zone) => !zone.quoted)?.id ?? store.delivery_zones[0]?.id ?? "")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [comment, setComment] = useState("")
  const [extras, setExtras] = useState<Record<string, string>>({})
  const [part, setPart] = useState<"who" | "where" | "when">("who")
  const [giftOpen, setGiftOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [number, setNumber] = useState("")
  const zone = store.delivery_zones.find((item) => item.id === zoneId) ?? null
  const quoted = fulfillment === "delivery" && (store.delivery_zones.length === 0 || Boolean(zone?.quoted))
  const deliveryPrice = fulfillment === "delivery" && !quoted ? (zone?.price ?? 0) : 0
  const total = subtotal + deliveryPrice
  const belowMin = store.min_order > 0 && subtotal < store.min_order
  const days = useMemo(
    () => (nowMs ? dateOptions(store.working_hours, new Date(nowMs)) : []),
    [nowMs, store.working_hours],
  )
  const times = useMemo(
    () => (nowMs && date ? timeOptions(store.working_hours, date, new Date(nowMs)) : []),
    [nowMs, date, store.working_hours],
  )

  const messageInput = (code: string) => ({
    shopName: store.name,
    orderNumber: code,
    items: lines.map((line) => ({ name: line.product.name, qty: line.qty, price: line.product.price })),
    subtotal,
    fulfillment,
    deliveryPrice,
    deliveryQuoted: quoted,
    zoneName: fulfillment === "delivery" && !quoted ? zone?.name : null,
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
  })

  const message = buildWhatsappMessage(messageInput(number || "······"))

  function problems(scope: "who" | "where" | "when") {
    const next: Record<string, string> = {}
    if (scope === "who") {
      if (name.trim().length < 2) next.name = ru.store.nameError
      if (phone.replace(/\D/g, "").length < 10) next.phone = ru.store.phoneError
    }
    if (scope === "where" && fulfillment === "delivery" && address.trim().length < 4) {
      next.address = ru.store.addressError
    }
    if (scope === "when") {
      if (!date) next.date = ru.store.dateError
      if (!time) next.time = ru.store.timeError
      if (belowMin) next.min = `${ru.store.minOrder}: ${formatMoney(store.min_order)}`
    }
    return next
  }

  function backLabel() {
    return store.niche === "flowers" ? ru.store.backToBouquets : ru.store.backToGoods
  }

  async function send() {
    const problem = { ...problems("who"), ...problems("where"), ...problems("when") }
    if (Object.keys(problem).length) {
      setErrors(problem)
      if (problem.name || problem.phone) setPart("who")
      else if (problem.address) setPart("where")
      else setPart("when")
      return
    }
    setSaving(true)
    setErrors({})
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
    const hrefFor = (orderCode: string) => whatsappHref(store.whatsapp_e164, buildWhatsappMessage(messageInput(orderCode)))

    if (bundle.source !== "database") {
      setNumber(code)
      setSaving(false)
      window.location.assign(hrefFor(code))
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
      window.location.assign(hrefFor(code))
    } catch (caught) {
      const text = caught instanceof Error ? caught.message : ""
      setErrors({ form: humanError(text) })
      setSaving(false)
    }
  }

  if (!lines.length) {
    return (
      <div className="px-4 pb-8">
        <p className="text-base">{ru.store.emptyCart}</p>
        <div className="mt-4">
          <PrimaryButton onClick={onClose}>{backLabel()}</PrimaryButton>
        </div>
      </div>
    )
  }

  if (step === "cart") {
    return (
      <div className="sf-step space-y-4 px-4 pb-8">
        {lines.map((line) => (
          <div key={line.productId} className="flex items-center gap-3">
            <Frame path={line.product.photos[0]?.storage_path} alt="" fit="contain" className="h-16 w-14 shrink-0 rounded-[12px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base">{line.product.name}</p>
              <p className="text-base tabular-nums">{formatMoney(line.product.price)}</p>
              <button type="button" onClick={() => setQty(line.productId, 0)} className="mt-1 h-11 text-base" style={{ color: "var(--sf-muted)" }}>
                {ru.store.removeItem}
              </button>
            </div>
            <div className="w-28 shrink-0">
              <QtyControl qty={line.qty} onChange={(qty) => setQty(line.productId, qty)} />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-base font-medium">
          <span>{ru.store.total}</span>
          <span className="tabular-nums">{formatMoney(subtotal)}</span>
        </div>
        {belowMin && (
          <p className="text-base">
            {ru.store.minOrder}: {formatMoney(store.min_order)}
          </p>
        )}
        <PrimaryButton
          disabled={belowMin}
          onClick={() => {
            setStep("form")
            setPart("who")
            if (bundle.source === "database") void logEvent(bundle, "checkout_start", null, null)
          }}
        >
          {ru.store.checkout}
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div key={part} className="sf-step space-y-4 px-4 pb-8">
      {part === "who" && (
        <>
          <TextField label={ru.store.yourName} value={name} onChange={setName} error={errors.name} />
          <TextField label={ru.store.phone} value={phone} onChange={setPhone} error={errors.phone} inputMode="tel" />
        </>
      )}
      {part === "where" && (
        <>
          {store.delivery_enabled && store.pickup_enabled && (
            <div className="grid grid-cols-2 gap-2">
              <Choice active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")}>{ru.store.delivery}</Choice>
              <Choice active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")}>{ru.store.pickup}</Choice>
            </div>
          )}
          {fulfillment === "pickup" && store.address && (
            <p className="text-base">
              <span className="block text-[13px]" style={{ color: "var(--sf-muted)" }}>{ru.store.pickupHere}</span>
              {store.address}
            </p>
          )}
          {fulfillment === "delivery" && (
            <TextField label={ru.store.deliveryAddress} value={address} onChange={setAddress} error={errors.address} />
          )}
          {fulfillment === "delivery" && store.delivery_zones.length > 0 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label={ru.store.zone}>
              {store.delivery_zones.map((item) => (
                <Choice key={item.id} active={zoneId === item.id} onClick={() => setZoneId(item.id)}>
                  {item.name} · {item.quoted ? ru.store.deliveryQuote : formatMoney(item.price)}
                </Choice>
              ))}
            </div>
          )}
        </>
      )}
      {part === "when" && (
        <>
          <div role="group" aria-label={ru.store.date}>
            <p className="text-[13px]" style={{ color: "var(--sf-muted)" }}>{ru.store.date}</p>
            <div className="mt-2 flex w-full min-w-0 flex-wrap gap-2">
              {days.map((day) => (
                <Choice
                  key={day.iso}
                  active={date === day.iso}
                  onClick={() => {
                    setDate(day.iso)
                    setTime("")
                  }}
                >
                  {day.label}
                </Choice>
              ))}
            </div>
            {errors.date && <p role="alert" className="mt-2 text-[13px]">{errors.date}</p>}
          </div>
          <div role="group" aria-label={ru.store.time}>
            <p className="text-[13px]" style={{ color: "var(--sf-muted)" }}>{ru.store.time}</p>
            <div className="mt-2 flex w-full min-w-0 flex-wrap gap-2">
              {times.map((slot) => (
                <Choice key={slot} active={time === slot} onClick={() => setTime(slot)}>{slot}</Choice>
              ))}
            </div>
            {errors.time && <p role="alert" className="mt-2 text-[13px]">{errors.time}</p>}
          </div>
          {store.order_form.fields.length > 0 && (
            <div className="rounded-[14px] border" style={{ borderColor: "var(--sf-line)" }}>
              <button type="button" onClick={() => setGiftOpen((open) => !open)} className="flex h-11 w-full items-center justify-between px-3 text-left text-base">
                {ru.store.card}
                <span>{giftOpen ? "−" : "+"}</span>
              </button>
              {giftOpen && (
                <div className="space-y-3 px-3 pb-3">
                  {store.order_form.fields.map((field) =>
                    field.type === "checkbox" ? (
                      <label key={field.key} className="flex min-h-11 items-center gap-2 text-base">
                        <input
                          type="checkbox"
                          checked={extras[field.key] === "да"}
                          onChange={(event) => setExtras((current) => ({ ...current, [field.key]: event.target.checked ? "да" : "" }))}
                        />
                        {field.label}
                      </label>
                    ) : (
                      <TextField
                        key={field.key}
                        label={field.label}
                        value={extras[field.key] ?? ""}
                        onChange={(value) => setExtras((current) => ({ ...current, [field.key]: value }))}
                        multiline={field.type === "textarea"}
                      />
                    ),
                  )}
                </div>
              )}
            </div>
          )}
          <TextField label={ru.store.comment} value={comment} onChange={setComment} multiline />
          <Totals subtotal={subtotal} fulfillment={fulfillment} delivery={deliveryPrice} quoted={quoted} />
          {errors.min && <p className="text-base">{errors.min}</p>}
        </>
      )}
      {errors.form && <p role="alert" className="text-base">{errors.form}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            if (part === "who") setStep("cart")
            else setPart(part === "when" ? "where" : "who")
          }}
          className="h-11 flex-1 rounded-[14px] border text-base"
          style={{ borderColor: "var(--sf-line)" }}
        >
          {ru.store.back}
        </button>
        {part === "when" ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => void send()}
            className="h-11 flex-[2] rounded-[14px] text-base disabled:opacity-50"
            style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
          >
            {saving ? ru.store.sending : ru.store.continueWhatsapp}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              const next = problems(part)
              setErrors(next)
              if (Object.keys(next).length) return
              setPart(part === "who" ? "where" : "when")
            }}
            className="h-11 flex-[2] rounded-[14px] text-base"
            style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
          >
            {ru.store.more}
          </button>
        )}
      </div>
      {part === "when" && (
        <>
          <p className="text-center text-[13px] leading-5" style={{ color: "var(--sf-muted)" }}>{ru.store.sendHint}</p>
          {date && time && (
            <pre className="max-h-40 overflow-auto rounded-[14px] bg-[#efe7dc] p-4 text-base leading-6 whitespace-pre-wrap text-[#111b21]">
              {message}
            </pre>
          )}
          {bundle.source === "fixture" && (
            <p className="text-[13px] leading-5" style={{ color: "var(--sf-muted)" }}>{ru.store.fixtureNote}</p>
          )}
        </>
      )}
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
