"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { formatMoney } from "@/lib/format"
import type { ExampleProduct } from "@/lib/examples"

type Phase = "browse" | "scroll" | "add" | "cart" | "form" | "confirm" | "switch" | "chat"

const ORDER: Phase[] = ["browse", "scroll", "add", "cart", "form", "confirm", "switch", "chat"]
const MS: Record<Phase, number> = {
  browse: 3000,
  scroll: 2800,
  add: 2800,
  cart: 3200,
  form: 3400,
  confirm: 2800,
  switch: 2800,
  chat: 3400,
}

export function PhoneDemo({ shop, products }: { shop: string; products: ExampleProduct[] }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduce ? "chat" : "browse")
  const [typed, setTyped] = useState("")
  const catalog = (products.length ? products : [{ name: "Пионовый сад", price: 28000, tone: "", image: "/demo/peony.jpg" }]).slice(0, 4)
  const extra = catalog.length < 4
    ? [...catalog, { name: "Сухоцветы", price: 14000, tone: "", image: "/demo/dried.jpg" }].slice(0, 4)
    : catalog
  const first = extra[0]

  useEffect(() => {
    if (reduce) return
    let stop = false
    let timer = 0
    const sleep = (ms: number) => new Promise((resolve) => {
      timer = window.setTimeout(resolve, ms)
    })
    async function loop() {
      const address = "ул. Абая 10"
      while (!stop) {
        for (const step of ORDER) {
          if (stop) return
          setPhase(step)
          if (step === "form") {
            setTyped("")
            for (let i = 1; i <= address.length; i += 1) {
              if (stop) return
              setTyped(address.slice(0, i))
              await sleep(90)
            }
            await sleep(Math.max(400, MS.form - address.length * 90))
          } else {
            await sleep(MS[step])
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

  const onChat = phase === "switch" || phase === "chat" || reduce
  const sheet = phase === "cart" || phase === "form" || phase === "confirm"
  const message = `Заказ №A7K2QM\n${first.name} × 1 — ${formatMoney(first.price)}\nАдрес: ул. Абая 10\nИтого: ${formatMoney(first.price + 2000)}`

  return (
    <div className="device relative mx-auto w-full max-w-[390px] rounded-[2.7rem] p-[11px]">
      <div className="relative h-[600px] overflow-hidden rounded-[2.15rem] bg-[#f6f3ee] text-[#14120f] lg:h-[640px]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[62px]">
          <div className="absolute top-1.5 left-1/2 h-6 w-[108px] -translate-x-1/2 rounded-full bg-black" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-1 text-[13px] font-semibold">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="h-[9px] w-[14px] rounded-[2px] border border-current" />
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 bg-[#f6f3ee] pt-[62px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: onChat ? "translateX(-100%)" : "translateX(0)" }}
        >
          <div className="flex items-center gap-3 px-4 pt-2">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#9A4D55] text-base text-white">{shop.slice(0, 1)}</span>
            <div>
              <p className="text-[17px] leading-tight tracking-[-0.03em]">{shop}</p>
              <p className="text-[13px] text-[#5c564e]">Сегодня 10:00–20:00 · Открыто</p>
            </div>
          </div>
          <div
            className="mt-3 space-y-3 px-4 transition-transform duration-700"
            style={{ transform: phase === "browse" ? "translateY(0)" : "translateY(-28px)" }}
          >
            {extra.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-2xl bg-white p-2 shadow-[0_8px_24px_rgba(20,18,15,0.05)]">
                <img src={item.image} alt="" className="h-[72px] w-[64px] rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">{item.name}</p>
                  <p className="text-[14px] text-[#9A4D55]">{formatMoney(item.price)}</p>
                </div>
                <span className="rounded-full bg-[#9A4D55] px-3 py-2 text-[13px] text-white">В корзину</span>
              </div>
            ))}
          </div>
          {phase === "add" && (
            <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-full bg-[#9A4D55] px-4 py-3 text-[15px] text-white shadow-lg">
              <span>1 · {formatMoney(first.price)}</span>
              <span>Корзина</span>
            </div>
          )}
          {phase === "add" && <Tap left="84%" top="31%" />}
          {sheet && (
            <div className="absolute inset-x-0 bottom-0 z-20 rounded-t-[28px] bg-[#fffcf8] px-4 pt-4 pb-5 shadow-[0_-24px_50px_rgba(20,18,15,0.18)]">
              <p className="text-[16px]">{phase === "cart" ? "Корзина" : "Оформление"}</p>
              <div className="mt-3 flex items-center gap-3">
                <img src={first.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px]">{first.name}</p>
                  <p className="text-[14px] text-[#5c564e]">{formatMoney(first.price)}</p>
                </div>
                <span className="text-[15px]">1</span>
              </div>
              {phase !== "cart" && (
                <div className="mt-3 space-y-2 text-[15px]">
                  <p className="rounded-xl border border-[#14120f]/15 px-3 py-2">Алия</p>
                  <p className="rounded-xl border border-[#14120f]/15 px-3 py-2">{typed || "Адрес"}</p>
                  <p className="inline-flex rounded-full bg-[#9A4D55] px-3 py-1.5 text-[13px] text-white">Завтра 25.11 · 14:00</p>
                </div>
              )}
              <div className={`mt-3 rounded-full py-3 text-center text-[15px] text-white ${phase === "confirm" ? "bg-[#7d3c46]" : "bg-[#9A4D55]"}`}>
                {phase === "cart" ? "Оформить" : "Отправить в WhatsApp"}
              </div>
            </div>
          )}
          {phase === "confirm" && <Tap left="50%" top="88%" />}
        </div>

        <div
          className="absolute inset-0 bg-[#efeae2] pt-[62px] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: onChat ? "translateX(0)" : "translateX(100%)" }}
        >
          <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-[16px]">{shop.slice(0, 1)}</span>
            <div>
              <p className="text-[16px] leading-tight">{shop}</p>
              <p className="text-[13px] text-white/80">в сети</p>
            </div>
          </div>
          <div className="space-y-3 bg-[#efe7dc] px-3 py-4" style={{ minHeight: "calc(100% - 118px)" }}>
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[14px] leading-5 text-[#111b21] shadow-sm">
              Здравствуйте! Это {shop}. Заказ получили, подтвердим время доставки.
              <p className="mt-1 text-right text-[12px] text-[#667781]">9:41</p>
            </div>
            {(phase === "chat" || reduce) && (
              <>
                <div className="ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[14px] leading-5 whitespace-pre-wrap text-[#111b21] shadow-sm">
                  {message}
                  <p className="mt-1 text-right text-[12px] text-[#667781]">9:41 ✓✓</p>
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-[14px] leading-5 text-[#111b21] shadow-sm">
                  Привезём завтра в 14:00. Если адрес верный, ничего больше писать не нужно.
                  <p className="mt-1 text-right text-[12px] text-[#667781]">9:42</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Tap({ left, top }: { left: string; top: string }) {
  return (
    <span
      className="pointer-events-none absolute z-40 h-8 w-8 rounded-full bg-white/70"
      style={{ left, top, animation: "tap-ripple 700ms ease-out forwards" }}
    />
  )
}
