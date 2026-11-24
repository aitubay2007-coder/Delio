"use client"

import { useState, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useReducedMotion } from "@/lib/motion"
import { defaultHours, defaultOrderForm, defaultZones } from "@/lib/catalog"
import { EXAMPLE_SHOPS } from "@/lib/examples"
import { ru } from "@/i18n/ru"
import { PhoneDemo } from "@/components/landing/phone-demo"
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
            <Link href="/signup" className="inline-flex h-10 items-center rounded-full bg-[#1c1915] px-4 text-sm text-[#f6f3ee]">{ru.nav.create}</Link>
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
            <Link href="/signup" className="inline-flex h-11 items-center justify-center bg-[#1c1915] text-[#f6f3ee]">{ru.nav.create}</Link>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-16 lg:py-16">
        <div>
          <h1 className="max-w-xl font-serif text-[2.4rem] leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-[3.25rem]">
            {ru.hero.title}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#5f584f]">{ru.hero.subtitle}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center rounded-full bg-[#1c1915] px-6 text-sm text-[#f6f3ee]">{ru.hero.cta}</Link>
            <Link href="/s/primer" className="inline-flex h-12 items-center justify-center rounded-full border border-[#1c1915]/20 px-6 text-sm">{ru.hero.example}</Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {ru.landing.promises.map((item) => (
              <li key={item} className="rounded-full bg-white px-3 py-1.5 text-sm text-[#3f3a34] shadow-[0_1px_0_rgba(255,255,255,0.8)]">{item}</li>
            ))}
          </ul>
        </div>
        <div className="mx-auto w-full max-w-[390px]">
          <PhoneDemo shop={shop} products={products} />
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

      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-3xl tracking-[-0.04em]">{ru.landing.bentoTitle}</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-6">
          <article className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_50px_rgba(20,18,15,0.05)] md:col-span-3 md:row-span-2">
            <div className="relative h-52">
              <Image src="/demo/peony.jpg" alt="Букет пионов, пример товара" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl tracking-[-0.03em]">{ru.landing.bento[0].title}</h3>
              <p className="mt-2 text-base leading-7 text-[#5c564e]">{ru.landing.bento[0].text}</p>
            </div>
          </article>
          {ru.landing.bento.slice(1).map((item) => (
            <article key={item.title} className="rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(20,18,15,0.05)] md:col-span-3">
              <h3 className="text-2xl tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-2 text-base leading-7 text-[#5c564e]">{item.text}</p>
            </article>
          ))}
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
              className="w-[82%] shrink-0 snap-center rounded-2xl border border-[#14120f]/10 bg-[#fffcf8] p-3 text-left shadow-[0_18px_50px_rgba(20,18,15,0.05)] transition-transform duration-300 hover:-translate-y-0.5 md:w-auto"
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

      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-4xl">{ru.landing.howTitle}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#5c564e]">{ru.landing.howText}</p>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          <StepColumn title={ru.landing.owner} steps={ru.landing.ownerSteps} />
          <StepColumn title={ru.landing.shopper} steps={ru.landing.shopperSteps} />
        </div>
        <p className="mt-8 max-w-xl text-sm leading-6 text-[#5f584f]">{ru.landing.confirmHint}</p>
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
          <Link href="/signup" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1c1915] text-sm text-[#f6f3ee]">{ru.landing.priceCta}</Link>
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
            <Link href="/signup" className="inline-flex h-12 items-center rounded-full bg-[#f6f3ee] px-6 text-sm text-[#1c1915]">{ru.landing.finalCta}</Link>
            <p className="mt-3 text-sm text-[#d9d0c5]">{ru.hero.trial}</p>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#f3efe8]" role="dialog" aria-modal="true" aria-label={ru.templates[open].name}>
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

function StepColumn({ title, steps }: { title: string; steps: readonly string[] }) {
  return (
    <div>
      <h3 className="text-sm tracking-[0.16em] uppercase text-[#6b645c]">{title}</h3>
      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li key={step} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6">
            <span className="text-[#8a8175]">0{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Reveal({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return <div className={reduce ? undefined : "rise"}>{children}</div>
}
