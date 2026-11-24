"use client"

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"
import { useReducedMotion } from "@/lib/motion"
import { addDaysIso, formatMoney, todayIso } from "@/lib/format"
import { buildWhatsappMessage } from "@/lib/whatsapp"
import type { ExampleProduct } from "@/lib/examples"
import { ru } from "@/i18n/ru"
import { CartDock, Choice, ProductCard, QtyControl, ShopBar, Totals } from "@/components/storefront/pieces"

export type PhonePhase = "browse" | "pick" | "dock" | "cart" | "form" | "draft" | "sent" | "reply" | "hold"

const ORDER: PhonePhase[] = ["browse", "pick", "dock", "cart", "form", "draft", "sent", "reply", "hold"]
const BEAT: Record<PhonePhase, number> = {
  browse: 2500,
  pick: 1500,
  dock: 1300,
  cart: 2400,
  form: 4800,
  draft: 2200,
  sent: 1400,
  reply: 2600,
  hold: 1500,
}

const screenVars = {
  "--sf-bg": "#FAF7F2",
  "--sf-ink": "#292524",
  "--sf-muted": "#5E5752",
  "--sf-accent": "#B78268",
  "--sf-on-accent": "#292524",
  "--sf-button-bg": "#292524",
  "--sf-button-text": "#FAF7F2",
  "--sf-line": "rgba(41,37,36,0.12)",
  "--sf-soft": "rgba(183,130,104,0.12)",
  "--sf-text": "#292524",
  background: "#FAF7F2",
  color: "#292524",
} as CSSProperties

export function PhoneDemo({
  shop,
  products,
  onPhase,
}: {
  shop: string
  products: ExampleProduct[]
  onPhase?: (phase: PhonePhase) => void
}) {
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [held, setHeld] = useState(false)
  const [offscreen, setOffscreen] = useState(false)
  const [phase, setPhase] = useState<PhonePhase>(reduce ? "reply" : "browse")
  const [qty, setQty] = useState(reduce ? 1 : 0)
  const [name, setName] = useState(reduce ? "Алия" : "")
  const [address, setAddress] = useState(reduce ? "ул. Абая 10" : "")
  const [caret, setCaret] = useState<"name" | "address" | null>(null)
  const [whenOn, setWhenOn] = useState(reduce)
  const exampleDate = useExampleDate()
  const [whenIso, whenLabel] = exampleDate.split("|")
  const catalog = (products.length ? products : [{ name: "Пионовый сад", price: 28000, tone: "", image: "/demo/peony.jpg" }]).slice(0, 4)
  const first = catalog[0]
  const delivery = 2000

  useEffect(() => {
    onPhase?.(phase)
  }, [onPhase, phase])

  useEffect(() => {
    paused.current = held || offscreen
  }, [held, offscreen])

  useEffect(() => {
    const node = root.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.4 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (reduce) return
    let stop = false
    let timer = 0
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const tick = () => {
          if (stop) return resolve()
          if (paused.current) {
            timer = window.setTimeout(tick, 80)
            return
          }
          timer = window.setTimeout(resolve, ms)
        }
        tick()
      })
    const sleep = async (ms: number) => {
      let left = ms
      while (left > 0 && !stop) {
        if (paused.current) {
          await wait(80)
          continue
        }
        const step = Math.min(left, 80)
        await wait(step)
        left -= step
      }
    }
    const typeInto = async (setter: (value: string) => void, text: string, field: "name" | "address") => {
      setCaret(field)
      let built = ""
      for (const char of text) {
        if (stop) return
        built += char
        setter(built)
        await sleep(char === " " ? 90 : 55)
      }
    }
    const loop = async () => {
      while (!stop) {
        for (const step of ORDER) {
          if (stop) return
          setPhase(step)
          if (step === "browse") {
            setQty(0)
            setName("")
            setAddress("")
            setCaret(null)
            setWhenOn(false)
            await sleep(BEAT.browse)
          } else if (step === "pick") {
            await sleep(420)
            setQty(1)
            await sleep(BEAT.pick - 420)
          } else if (step === "form") {
            setName("")
            setAddress("")
            setWhenOn(false)
            await sleep(280)
            await typeInto(setName, "Алия", "name")
            await sleep(160)
            await typeInto(setAddress, "ул. Абая 10", "address")
            setCaret(null)
            setWhenOn(true)
            await sleep(2200)
          } else {
            await sleep(BEAT[step])
          }
        }
      }
    }
    void loop()
    return () => {
      stop = true
      window.clearTimeout(timer)
    }
  }, [reduce])

  const sheet = phase === "cart" || phase === "form"
  const chat = phase === "draft" || phase === "sent" || phase === "reply" || phase === "hold" || reduce
  const ticks = phase === "sent" || phase === "reply" || phase === "hold" || reduce
  const reply = phase === "reply" || phase === "hold" || reduce
  const message = buildWhatsappMessage({
    shopName: shop,
    orderNumber: "A7K2QM",
    items: [{ name: first.name, qty: 1, price: first.price }],
    subtotal: first.price,
    fulfillment: "delivery",
    deliveryPrice: delivery,
    zoneName: "В пределах города",
    total: first.price + delivery,
    customerName: name || "Алия",
    customerPhone: "+77010000001",
    address: address || "ул. Абая 10",
    date: whenIso,
    time: "14:00",
    extras: [],
  })

  return (
    <div ref={root} onPointerDown={() => setHeld(true)}>
      <div className="device relative mx-auto h-[662px] w-full max-w-[390px] rounded-[1.7rem] p-[6px]">
        <div className="relative h-full overflow-hidden rounded-[1.45rem]" style={screenVars}>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 h-12">
            <div className="absolute top-2 left-1/2 h-5 w-[92px] -translate-x-1/2 rounded-full bg-black" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 text-[13px] font-medium">
              <span>9:41</span>
              <span className="h-[9px] w-[14px] rounded-[2px] border border-current" />
            </div>
          </div>

          <div
            className="absolute inset-0 top-12 bg-[#FAF7F2] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: chat ? "translateX(-104%)" : "translateX(0)" }}
          >
            <div className="h-full overflow-hidden px-4">
              <ShopBar heading="p" name={shop} meta="Алматы · 10:00–20:00 · Открыто" />
              <p className="flex h-8 items-center gap-2 text-[13px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B78268]" />
                {ru.store.contacts}
              </p>
              <h2 className="mt-2 text-[28px] leading-none tracking-[-0.03em]">{ru.store.bouquets}</h2>
              <div className="mt-3 flex gap-2">
                {["Все", "Сезонные"].map((item, index) => (
                  <span
                    key={item}
                    className="inline-flex h-11 items-center rounded-[14px] px-3 text-base"
                    style={{
                      background: index === 0 ? "#B78268" : "transparent",
                      color: index === 0 ? "#292524" : "#292524",
                      border: index === 0 ? "1px solid transparent" : "1px solid rgba(41,37,36,0.12)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="sf-rise mt-3 grid grid-cols-2 gap-3">
                {catalog.map((item, index) => (
                  <ProductCard
                    key={item.name}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                    qty={index === 0 ? qty : 0}
                    priority={index === 0}
                    onOpen={() => undefined}
                    onAdd={() => undefined}
                    onQty={() => undefined}
                  />
                ))}
              </div>
            </div>
            {qty > 0 && !sheet && (
              <div className="absolute inset-x-3 bottom-3 z-20">
                <CartDock count={qty} amount={first.price} onOpen={() => undefined} />
              </div>
            )}
            {phase === "pick" && qty === 0 && <Tap left="28%" top="78%" />}
            <div
              className="absolute inset-0 z-20 bg-[#292524]/40 transition-opacity duration-300"
              style={{ opacity: sheet ? 1 : 0, pointerEvents: "none" }}
            />
            <div
              className="absolute inset-x-0 bottom-0 z-30 max-h-[78%] overflow-hidden rounded-t-[16px] border border-[#292524]/10 bg-[#FAF7F2] px-4 pt-3 pb-4 shadow-[0_-16px_40px_rgba(41,37,36,0.16)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: sheet ? "translateY(0)" : "translateY(105%)" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[22px] leading-tight">{phase === "cart" ? ru.store.cart : ru.store.checkoutTitle}</p>
                <button type="button" aria-label={ru.a11y.close} className="grid h-11 w-11 place-items-center rounded-[12px] border border-[#292524]/10 text-base">
                  ×
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <ProductThumb image={first.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base">{first.name}</p>
                  <p className="text-base tabular-nums">{formatMoney(first.price)}</p>
                </div>
                <div className="w-[7.5rem] shrink-0">
                  <QtyControl qty={1} onChange={() => undefined} />
                </div>
              </div>
              {phase === "form" ? (
                <div className="sf-step mt-3 space-y-2">
                  <FieldLine label={ru.store.yourName} value={name} caret={caret === "name"} />
                  <FieldLine label={ru.store.deliveryAddress} value={address} caret={caret === "address"} />
                  {whenOn && (
                    <div className="flex flex-wrap gap-2">
                      <Choice active onClick={() => undefined}>{whenLabel}</Choice>
                      <Choice active onClick={() => undefined}>14:00</Choice>
                    </div>
                  )}
                  {whenOn && <Totals subtotal={first.price} fulfillment="delivery" delivery={delivery} quoted={false} />}
                </div>
              ) : (
                <div className="mt-3 flex items-center justify-between text-base font-medium">
                  <span>{ru.store.total}</span>
                  <span className="tabular-nums">{formatMoney(first.price)}</span>
                </div>
              )}
              <div className="mt-3 flex h-11 items-center justify-center rounded-[14px] bg-[#292524] text-base text-[#FAF7F2]">
                {phase === "form" ? ru.store.continueWhatsapp : ru.store.checkout}
              </div>
            </div>
            {phase === "form" && whenOn && <Tap left="62%" top="88%" />}
          </div>

          <div
            className="absolute inset-0 top-12 bg-[#efe7dc] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: chat ? "translateX(0)" : "translateX(104%)" }}
          >
            <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-base">{shop.slice(0, 1)}</span>
              <div>
                <p className="text-base leading-tight">{shop}</p>
                <p className="text-[13px] text-white/80">в сети</p>
              </div>
            </div>
            <div className="space-y-3 px-3 py-4">
              {(phase === "draft" || ticks) && (
                <div className="sf-msg ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-base leading-6 whitespace-pre-wrap text-[#111b21]">
                  {message}
                  <p className="mt-1 text-right text-[13px] text-[#667781]">9:41 {ticks ? "✓✓" : ""}</p>
                </div>
              )}
              {reply && (
                <div className="sf-msg max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-base leading-6 text-[#111b21]">
                  {ru.store.managerReply}
                  <p className="mt-1 text-right text-[13px] text-[#667781]">9:42</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldLine({ label, value, caret }: { label: string; value: string; caret: boolean }) {
  return (
    <div>
      <p className="text-[13px] text-[#5E5752]">{label}</p>
      <p className="mt-1 flex h-11 items-center rounded-[14px] border border-[#292524]/12 px-3 text-base">
        {value}
        {caret && <span className="caret" />}
      </p>
    </div>
  )
}

function ProductThumb({ image }: { image: string }) {
  return (
    <span className="relative block h-16 w-14 overflow-hidden rounded-[12px] bg-[rgba(183,130,104,0.12)]">
      <img src={image} alt="" className="h-full w-full object-contain" />
    </span>
  )
}

function useExampleDate() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      const iso = addDaysIso(todayIso("Asia/Almaty"), 1)
      const [, month, day] = iso.split("-")
      return `${iso}|${day}.${month}`
    },
    () => "2026-11-25|25.11",
  )
}

function Tap({ left, top }: { left: string; top: string }) {
  return <span className="tap-dot pointer-events-none absolute z-40" style={{ left, top }} />
}
