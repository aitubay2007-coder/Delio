"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useReducedMotion } from "@/lib/motion"
import { defaultHours, defaultOrderForm, defaultZones } from "@/lib/catalog"
import { EXAMPLE_SHOPS } from "@/lib/examples"
import { ru } from "@/i18n/ru"
import { PhoneDemo, type PhonePhase } from "@/components/landing/phone-demo"
import type { NicheId, StoreBundle, TemplateId } from "@/lib/types"
import { TEMPLATES } from "@/lib/types"

const Storefront = dynamic(() => import("@/components/storefront/storefront").then((mod) => mod.Storefront), {
  loading: () => <p className="p-8 text-base">Открываем пример…</p>,
})

const NICHE_ORDER: NicheId[] = ["flowers", "bakery", "gifts", "clothing", "cosmetics", "coffee_food", "services"]

const TEMPLATE_COLORS: Record<TemplateId, string> = {
  minimal: "#1A1814",
  boutique: "#9A4D55",
  by_date: "#C45B78",
  editorial: "#2A5F9E",
  vivid: "#D86A2A",
  cinematic: "#E4D3C4",
}

export function Landing() {
  const [niche, setNiche] = useState<NicheId>("flowers")
  const [name, setName] = useState("")
  const [open, setOpen] = useState<TemplateId | null>(null)
  const [menu, setMenu] = useState(false)
  const [phase, setPhase] = useState<PhonePhase>("browse")
  const shop = name.trim() || EXAMPLE_SHOPS[niche].fallbackName
  const products = EXAMPLE_SHOPS[niche].products

  return (
    <div className="bg-[#f3efe8] text-[#1c1915]">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-[#f6f4ef]/70 shadow-[0_10px_40px_rgba(20,18,15,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="font-serif text-xl tracking-tight" aria-label={ru.a11y.logo}>
            {ru.brand}
          </Link>
          <nav className="hidden items-center gap-7 text-sm md:flex">
            <a href="#templates">{ru.nav.templates}</a>
            <a href="#how">{ru.nav.how}</a>
            <a href="#stats">{ru.nav.stats}</a>
            <a href="#pricing">{ru.nav.pricing}</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm">{ru.nav.login}</Link>
            <Link href="/signup" className="btn btn-dark h-10 px-4 text-sm">{ru.nav.create}</Link>
          </div>
          <button type="button" className="text-sm md:hidden" aria-expanded={menu} aria-controls="mobile-nav" onClick={() => setMenu((value) => !value)}>{menu ? ru.nav.close : ru.nav.menu}</button>
        </div>
        {menu && (
          <div id="mobile-nav" className="grid gap-3 border-t border-[#1c1915]/10 px-5 py-4 text-sm md:hidden">
            <a href="#templates" onClick={() => setMenu(false)}>{ru.nav.templates}</a>
            <a href="#how" onClick={() => setMenu(false)}>{ru.nav.how}</a>
            <a href="#stats" onClick={() => setMenu(false)}>{ru.nav.stats}</a>
            <a href="#pricing" onClick={() => setMenu(false)}>{ru.nav.pricing}</a>
            <Link href="/login">{ru.nav.login}</Link>
            <Link href="/signup" className="btn btn-dark">{ru.nav.create}</Link>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(720px_420px_at_88%_12%,rgba(183,130,104,0.22),transparent_58%),radial-gradient(640px_380px_at_0%_90%,rgba(250,247,242,0.9),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-20">
          <div>
            <p className="text-[13px] tracking-[0.18em] text-[#292524] uppercase">Ссылка вместо переписки</p>
            <h1 className="mt-4 max-w-xl font-serif text-[2.55rem] leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[4.25rem]">
              {ru.hero.title}
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-8 text-[#4e4840]">{ru.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup" className="btn btn-dark">{ru.hero.cta}</Link>
              <Link href="/s/primer" className="btn btn-line">{ru.hero.example}</Link>
            </div>
            <ul className="mt-6 flex flex-wrap gap-2">
              {ru.landing.promises.map((item) => (
                <li key={item} className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-sm text-[#3f3a34] shadow-[0_8px_24px_rgba(20,18,15,0.04)]">{item}</li>
              ))}
            </ul>
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[390px]">
            <PhoneDemo shop={shop} products={products} onPhase={setPhase} />
            <p className="mt-3 text-center text-[13px] text-[#5E5752]">{ru.store.exampleOrder}</p>
          </div>
        </div>
      </section>

      <section id="try" className="mx-auto max-w-6xl px-5 pb-4">
        <div className="rounded-3xl bg-white p-5 shadow-[0_18px_50px_rgba(20,18,15,0.05)] sm:p-6">
          <label className="block max-w-md">
            <span className="text-base">{ru.hero.tryOn}</span>
            <span className="mt-1 block text-sm leading-6 text-[#5c564e]">{ru.hero.tryOnHint}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={ru.hero.placeholder}
              className="mt-3 h-12 w-full rounded-2xl border border-[#1c1915]/15 bg-[#faf8f5] px-4"
            />
          </label>
          <p className="mt-5 text-sm text-[#5c564e]">{ru.hero.nicheHint}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {NICHE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={niche === id}
                onClick={() => setNiche(id)}
                className="shrink-0 rounded-full border px-3 py-1.5 text-sm"
                style={{
                  borderColor: niche === id ? "#1c1915" : "rgba(28,25,21,0.15)",
                  background: niche === id ? "#1c1915" : "transparent",
                  color: niche === id ? "#f6f3ee" : "#1c1915",
                }}
              >
                {ru.niches[id]}
              </button>
            ))}
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#5c564e]">{ru.hero.ctaNext} {ru.hero.trial}</p>
        </div>
      </section>

      <section className="bg-white/70 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal>
            <h2 className="max-w-xl font-serif text-4xl tracking-[-0.045em]">{ru.landing.bentoTitle}</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-12">
            <article className="card-hover relative min-h-[420px] overflow-hidden rounded-[28px] lg:col-span-7">
              <Image src="/demo/peony.jpg" alt="Букет пионов, пример товара" fill sizes="(max-width: 1024px) 100vw, 640px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                <h3 className="text-3xl tracking-[-0.04em]">{ru.landing.bento[0].title}</h3>
                <p className="mt-2 max-w-md text-base leading-7 text-white/90">{ru.landing.bento[0].text}</p>
              </div>
            </article>
            <div className="grid gap-4 lg:col-span-5">
              <article className="card-hover rounded-[28px] bg-[#f6f1ea] p-7">
                <h3 className="text-2xl tracking-[-0.04em]">{ru.landing.bento[1].title}</h3>
                <p className="mt-3 text-base leading-7 text-[#4e4840]">{ru.landing.bento[1].text}</p>
              </article>
              <article className="card-hover relative min-h-[210px] overflow-hidden rounded-[28px]">
                <Image src="/demo/ranunculus.jpg" alt="Букет ранункулюсов, пример товара" fill sizes="480px" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <h3 className="text-2xl tracking-[-0.04em]">{ru.landing.bento[2].title}</h3>
                  <p className="mt-2 text-base leading-7 text-white/90">{ru.landing.bento[2].text}</p>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <h2 className="font-serif text-4xl tracking-tight">{ru.landing.templatesTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f584f]">{ru.landing.templatesText}</p>
        </Reveal>
        <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {TEMPLATES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setOpen(id)}
              className="card-hover w-[82%] shrink-0 snap-center rounded-[28px] border border-[#14120f]/8 bg-[#fffcf8] p-3 text-left shadow-[0_18px_50px_rgba(20,18,15,0.05)] md:w-auto"
            >
              <Miniature template={id} shop={shop} products={products} color={TEMPLATE_COLORS[id]} />
              <h3 className="mt-4 text-lg">{ru.templates[id].name}</h3>
              <p className="mt-1 text-sm leading-6 text-[#6b645c]">{ru.templates[id].text}</p>
              <span className="mt-3 inline-block text-sm underline underline-offset-4">{ru.landing.enlarge}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <h2 className="font-serif text-3xl tracking-[-0.04em]">{ru.landing.compareTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#5c564e]">{ru.landing.compareText}</p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Reveal>
          <Compare title={ru.landing.without} messy />
        </Reveal>
        <Reveal>
          <Compare title={ru.landing.with} shop={shop} product={products[0]?.name ?? ru.store.cart} />
        </Reveal>
      </div>
      </section>

      <section id="how" className="bg-[#efe8df] py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 className="font-serif text-4xl tracking-[-0.045em]">{ru.landing.howTitle}</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#4e4840]">{ru.landing.howText}</p>
            <ol className="mt-8 space-y-3">
              {ru.landing.shopperSteps.map((step, index) => {
                const active = shopperStep(phase) === index
                return (
                  <li key={step} className={`grid grid-cols-[2.5rem_1fr] items-center gap-3 rounded-2xl px-3 py-3 text-base transition-all duration-500 ${active ? "bg-white shadow-[0_12px_30px_rgba(20,18,15,0.08)]" : ""}`}>
                    <span className={`grid h-9 w-9 place-items-center rounded-full text-sm ${active ? "bg-[#14120f] text-white" : "bg-white/70 text-[#6b645c]"}`}>0{index + 1}</span>
                    <span>{step}</span>
                  </li>
                )
              })}
            </ol>
            <p className="mt-6 max-w-xl text-sm leading-6 text-[#5c564e]">{ru.landing.confirmHint}</p>
          </div>
          <OrderDesk arrived={phase === "sent" || phase === "reply" || phase === "hold"} />
        </div>
      </section>

      <section id="stats" className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-serif text-4xl">{ru.landing.statsTitle}</h2>
          <span className="border border-[#1c1915]/20 px-2 py-1 text-xs tracking-wide uppercase">{ru.landing.sample}</span>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f584f]">{ru.landing.sampleNote}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {ru.landing.statsItems.map((item) => (
            <li key={item} className="lift rounded-2xl border border-white/80 bg-[#fffcf8] px-4 py-4 text-sm leading-6">{item}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="border border-dashed border-[#1c1915]/25 p-6 md:p-10">
          <p className="text-xs tracking-[0.18em] uppercase text-[#6b645c]">{ru.landing.caseKicker}</p>
          <div className="mt-3 flex items-center gap-3">
            <h2 className="font-serif text-3xl">{ru.landing.caseTitle}</h2>
            <span className="border px-2 py-0.5 text-xs uppercase">{ru.landing.caseSoon}</span>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#5f584f]">{ru.landing.caseText}</p>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-xl px-5 py-8">
        <article className="border border-[#1c1915] bg-[#faf8f5] p-6 md:p-8">
          <h2 className="font-serif text-3xl">{ru.landing.priceTitle}</h2>
          <p className="mt-2 text-sm text-[#6b645c]">{ru.landing.priceIncluded}</p>
          <ul className="mt-5 space-y-2 text-sm leading-6">
            {ru.landing.priceItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 text-lg">{ru.landing.priceFree}</p>
          <p className="text-sm text-[#6b645c]">{ru.landing.priceAfter}</p>
          <Link href="/signup" className="btn btn-dark mt-6 w-full">{ru.landing.priceCta}</Link>
          <p className="mt-4 text-sm leading-6 text-[#5f584f]">{ru.landing.pricePay}</p>
          <p className="mt-4 text-sm text-[#6b645c]">
            {ru.landing.domain} — {ru.landing.soon}. {ru.landing.video} — {ru.landing.soon}.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <h2 className="font-serif text-4xl">{ru.landing.faqTitle}</h2>
        <div className="mt-6 divide-y divide-[#1c1915]/10 border-y border-[#1c1915]/10">
          {ru.landing.faq.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none text-base">{item.q}</summary>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5f584f]">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-[#1c1915] px-5 py-16 text-[#f6f3ee]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-xl font-serif text-4xl leading-tight">{ru.landing.finalTitle}</h2>
          <div>
            <Link href="/signup" className="btn btn-light">{ru.landing.finalCta}</Link>
            <p className="mt-3 text-sm text-[#d9d0c5]">{ru.hero.trial}</p>
          </div>
        </div>
      </section>

      {open && (
        <div className="dialog-in fixed inset-0 z-50 overflow-auto bg-[#f3efe8]" role="dialog" aria-modal="true" aria-label={ru.templates[open].name}>
          <button type="button" onClick={() => setOpen(null)} className="fixed top-4 right-4 z-[80] rounded-full bg-white px-4 py-2 text-base text-[#14120f] shadow-lg">
            {ru.nav.close}
          </button>
          <Storefront bundle={previewBundle(shop, niche, open)} template={open} accent={TEMPLATE_COLORS[open]} />
        </div>
      )}
    </div>
  )
}

function previewBundle(name: string, niche: NicheId, template: TemplateId): StoreBundle {
  const examples = EXAMPLE_SHOPS[niche]
  return {
    source: "fixture",
    covers: [],
    categories: [],
    store: {
      id: "preview-store",
      owner_id: null,
      name,
      slug: "preview",
      niche,
      whatsapp_e164: "+77000000000",
      logo_path: niche === "flowers" ? "/demo/logo.svg" : null,
      address: "",
      working_hours: defaultHours(),
      delivery_enabled: true,
      pickup_enabled: true,
      delivery_zones: defaultZones(),
      min_order: 0,
      template,
      accent_color: TEMPLATE_COLORS[template],
      order_form: defaultOrderForm(niche),
      trial_ends_at: "2099-01-01T00:00:00.000Z",
      subscription_status: "active",
      whop_customer_id: null,
      whop_membership_id: null,
      is_demo: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    products: examples.products.map((product, index) => ({
      id: `preview-${niche}-${index}`,
      store_id: "preview-store",
      category_id: null,
      name: product.name,
      description: ru.store.exampleMark,
      price: product.price,
      available: true,
      sort_order: index,
      photos: [
        {
          id: `preview-photo-${index}`,
          store_id: "preview-store",
          product_id: `preview-${niche}-${index}`,
          storage_path: product.image,
          sort_order: 0,
        },
      ],
    })),
  }
}

function Miniature({
  template,
  shop,
  products,
  color,
}: {
  template: TemplateId
  shop: string
  products: { name: string; price: number; tone: string; image: string }[]
  color: string
}) {
  const dark = template === "cinematic"
  const lead = products[0]
  return (
    <div className="aspect-[4/5] overflow-hidden rounded-xl" style={{ background: dark ? "#100f0e" : "#f6f3ee", color: dark ? "#f4f0e8" : "#14120f" }}>
      <div className="relative h-[72%]">
        <img src={lead?.image} alt="" className="h-full w-full object-cover" />
        {dark && <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />}
        <p className={`absolute top-3 left-3 text-[10px] tracking-[0.16em] uppercase ${dark ? "text-white" : "rounded-full bg-white/85 px-2 py-1 text-[#14120f]"}`}>{shop}</p>
      </div>
      <div className="flex items-end justify-between gap-3 px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm">{lead?.name}</p>
          <p className="text-[11px] opacity-60">{ru.templates[template].name}</p>
        </div>
        <span className="h-2.5 w-8 shrink-0" style={{ background: color }} />
      </div>
    </div>
  )
}

function Compare({ title, messy, shop, product }: { title: string; messy?: boolean; shop?: string; product?: string }) {
  return (
    <article className="border border-[#1c1915]/10 bg-[#faf8f5] p-5">
      <h3 className="text-sm tracking-[0.14em] uppercase text-[#6b645c]">{title}</h3>
      {messy ? (
        <div className="mt-4 space-y-2">
          {ru.landing.messy.map((line, index) => (
            <p key={line} className="max-w-[80%] bg-[#efe8df] px-3 py-2 text-sm" style={{ marginLeft: index % 2 ? "18%" : 0 }}>
              {line}
            </p>
          ))}
        </div>
      ) : (
        <pre className="mt-4 bg-[#e7f6df] p-4 text-sm leading-6 whitespace-pre-wrap text-[#17301c]">
          {`Заказ №A7K2QM · ${shop}\n${product} × 1 — 28 000 ₸\n\nТовары: 28 000 ₸\nДоставка (город): 2 000 ₸\nИтого: 30 000 ₸\nИмя: Алия`}
        </pre>
      )}
    </article>
  )
}

function shopperStep(phase: PhonePhase) {
  if (phase === "dock" || phase === "cart") return 1
  if (phase === "form") return 2
  if (phase === "draft" || phase === "sent" || phase === "reply" || phase === "hold") return 3
  return 0
}

function OrderDesk({ arrived }: { arrived: boolean }) {
  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(20,18,15,0.08)]">
      <p className="text-xs tracking-[0.16em] text-[#6b645c] uppercase">Кабинет · пример</p>
      <h3 className="mt-2 text-2xl tracking-[-0.04em]">Цветочная лавка</h3>
      <p className="mt-1 text-sm text-[#5c564e]">Не живой заказ. Строка появляется вместе с чатом в телефоне.</p>
      <ul className="mt-5 divide-y divide-[#14120f]/8">
        <li className="flex items-center justify-between py-3 text-base">
          <span>Данияр · Красные розы</span>
          <span className="text-sm text-[#5c564e]">подтверждён</span>
        </li>
        <li className={`flex items-center justify-between gap-3 py-3 text-base transition-all duration-700 ${arrived ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
          <span>
            <span className="mr-2 rounded-full bg-[#9A4D55] px-2 py-0.5 text-xs text-white">новый</span>
            Алия · Пионовый сад
          </span>
          <span>30 000 ₸</span>
        </li>
      </ul>
    </div>
  )
}

function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(reduce)
  useEffect(() => {
    if (reduce) return
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return
      setShown(true)
      observer.disconnect()
    }, { rootMargin: "0px 0px -10% 0px" })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduce])
  return <div ref={ref} className={shown ? "rise-in" : "rise-wait"}>{children}</div>
}
