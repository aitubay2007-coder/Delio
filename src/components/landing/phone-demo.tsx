"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { formatMoney } from "@/lib/format"

type Phase = "browse" | "scroll" | "add" | "cart" | "form" | "send" | "switch" | "compose" | "sent"

const ORDER = ["browse", "scroll", "add", "cart", "form", "send", "switch", "compose", "sent"] as const
const MS: Record<Phase, number> = {
  browse: 1100,
  scroll: 1300,
  add: 700,
  cart: 1400,
  form: 2800,
  send: 700,
  switch: 700,
  compose: 1600,
  sent: 2800,
}

export function PhoneDemo({ shop, image, product, price }: { shop: string; image: string; product: string; price: number }) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduce ? "sent" : "browse")
  const [typed, setTyped] = useState("")

  useEffect(() => {
    if (reduce) return
    let stop = false
    let timer = 0
    const sleep = (ms: number) => new Promise((resolve) => {
      timer = window.setTimeout(resolve, ms)
    })
    async function loop() {
      while (!stop) {
        for (const step of ORDER) {
          if (stop) return
          setPhase(step)
          if (step === "form") {
            const address = "ул. Абая 10"
            for (let i = 1; i <= address.length; i += 1) {
              if (stop) return
              setTyped(address.slice(0, i))
              await sleep(70)
            }
          }
          await sleep(MS[step])
        }
      }
    }
    void loop()
    return () => {
      stop = true
      window.clearTimeout(timer)
    }
  }, [reduce])

  const showStore = phase === "browse" || phase === "scroll" || phase === "add" || phase === "cart" || phase === "form" || phase === "send"
  const showWa = phase === "switch" || phase === "compose" || phase === "sent"
  const message = `Заказ №A7K2QM · ${shop}\n${product} × 1 — ${formatMoney(price)}\n\nИтого: ${formatMoney(price + 2000)}\nИмя: Алия\nАдрес: ул. Абая 10`

  return (
    <div className="device relative mx-auto w-[340px] rounded-[3.1rem] p-[11px]">
      <div className="relative h-[700px] overflow-hidden rounded-[2.45rem] bg-black text-[#14120f]">
        <div className="absolute top-[10px] left-1/2 z-30 h-[28px] w-[108px] -translate-x-1/2 rounded-full bg-black" />
        <div className="absolute inset-x-0 top-0 z-20 flex h-12 items-end justify-between px-6 pb-1 text-[12px] font-semibold text-[#14120f]">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-3 rounded-sm border border-current" />
          </span>
        </div>
        <div
          className="absolute inset-0 bg-[#f8f4ef] pt-12 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: showStore ? "translateX(0)" : "translateX(-18%)", opacity: showStore ? 1 : 0 }}
        >
          <div className="px-4 pt-2 text-center">
            <img src="/demo/logo.jpg" alt="" className="mx-auto h-8 w-8 rounded-full object-cover" />
            <p className="mt-2 text-[15px] tracking-[-0.03em]">{shop}</p>
            <p className="text-[11px] text-[#6f675e]">Сегодня 10:00–20:00 · Открыто</p>
          </div>
          <div className="mt-3 transition-transform duration-700" style={{ transform: phase === "browse" ? "translateY(0)" : "translateY(-36px)" }}>
            <img src={image} alt="" className="h-44 w-full object-cover" />
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-[17px] tracking-[-0.03em]">{product}</p>
                <p className="text-sm text-[#9A4D55]">{formatMoney(price)}</p>
              </div>
              <span className={`rounded-full px-3 py-2 text-xs text-white ${phase === "add" ? "scale-95 bg-[#7d3c46]" : "bg-[#9A4D55]"}`}>
                В корзину
              </span>
            </div>
          </div>
          {(phase === "cart" || phase === "form" || phase === "send") && (
            <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-[#fffcf8] px-4 pt-4 pb-5 shadow-[0_-20px_50px_rgba(20,18,15,0.16)]">
              <p className="text-sm">{phase === "cart" ? "Корзина" : "Оформление"}</p>
              <p className="mt-2 text-sm">{product} × 1</p>
              {phase !== "cart" && (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="rounded-lg border border-[#14120f]/10 px-3 py-2">Алия</p>
                  <p className="rounded-lg border border-[#14120f]/10 px-3 py-2">{typed || "Адрес"}</p>
                </div>
              )}
              <div className={`mt-3 rounded-full py-3 text-center text-sm text-white ${phase === "send" ? "scale-[0.98] bg-[#7d3c46]" : "bg-[#9A4D55]"}`}>
                {phase === "cart" ? "Оформить" : "Отправить в WhatsApp"}
              </div>
            </div>
          )}
          {phase === "add" && <Tap left="78%" top="58%" />}
          {phase === "send" && <Tap left="50%" top="86%" />}
        </div>
        <div
          className="absolute inset-0 bg-[#efeae2] pt-12 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: showWa ? "translateX(0)" : "translateX(100%)" }}
        >
          <div className="flex items-center gap-3 bg-[#075E54] px-3 py-3 text-white">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm">{shop.slice(0, 1)}</span>
            <div>
              <p className="text-sm">{shop}</p>
              <p className="text-[11px] text-white/80">в сети</p>
            </div>
          </div>
          <div className="h-[calc(100%-7.5rem)] bg-[#efe7dc] px-3 py-4">
            {(phase === "sent" || reduce) && (
              <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[13px] leading-5 whitespace-pre-wrap text-[#111b21] shadow-sm">
                {message}
                <p className="mt-1 text-right text-[10px] text-[#667781]">9:41 ✓✓</p>
              </div>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 bg-[#f0f2f5] px-2 py-2">
            <div className="min-h-10 flex-1 rounded-2xl bg-white px-3 py-2 text-[12px] leading-5 whitespace-pre-wrap text-[#111b21]">
              {phase === "sent" || reduce ? "" : message}
            </div>
            <span className={`grid h-10 w-10 place-items-center rounded-full text-white ${phase === "compose" ? "scale-95 bg-[#00a884]" : "bg-[#00a884]"}`}>↑</span>
          </div>
          {phase === "compose" && <Tap left="88%" top="92%" />}
        </div>
      </div>
    </div>
  )
}

function Tap({ left, top }: { left: string; top: string }) {
  return (
    <span
      className="pointer-events-none absolute z-40 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white/40 shadow"
      style={{ left, top, animation: "phone-stage 0.7s ease-out" }}
    />
  )
}
