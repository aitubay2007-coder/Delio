"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { defaultHours, defaultOrderForm, defaultZones } from "@/lib/catalog"
import { EXAMPLE_SHOPS } from "@/lib/examples"
import { formatMoney } from "@/lib/format"
import { ru } from "@/i18n/ru"
import { Storefront } from "@/components/storefront/storefront"
import type { NicheId, StoreBundle, TemplateId } from "@/lib/types"
import { TEMPLATES } from "@/lib/types"

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
      <header className="sticky top-0 z-40 border-b border-[#1c1915]/10 bg-[#f3efe8]/90 backdrop-blur">
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
            <Link href="/signup" className="inline-flex h-10 items-center bg-[#1c1915] px-4 text-sm text-[#f6f3ee]">{ru.nav.create}</Link>
          </div>
          <button type="button" className="text-sm md:hidden" onClick={() => setMenu((value) => !value)}>{menu ? ru.nav.close : ru.nav.menu}</button>
        </div>
        {menu && (
          <div className="grid gap-3 border-t border-[#1c1915]/10 px-5 py-4 text-sm md:hidden">
            <a href="#templates" onClick={() => setMenu(false)}>{ru.nav.templates}</a>
            <a href="#how" onClick={() => setMenu(false)}>{ru.nav.how}</a>
            <a href="#stats" onClick={() => setMenu(false)}>{ru.nav.stats}</a>
            <a href="#pricing" onClick={() => setMenu(false)}>{ru.nav.pricing}</a>
            <Link href="/login">{ru.nav.login}</Link>
            <Link href="/signup" className="inline-flex h-11 items-center justify-center bg-[#1c1915] text-[#f6f3ee]">{ru.nav.create}</Link>
          </div>
        )}
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <h1 className="max-w-xl font-serif text-[2.6rem] leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            {ru.hero.title}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#5f584f]">{ru.hero.subtitle}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/signup" className="inline-flex h-12 items-center justify-center bg-[#1c1915] px-6 text-sm text-[#f6f3ee]">{ru.hero.cta}</Link>
            <Link href="/s/primer" className="inline-flex h-12 items-center justify-center border border-[#1c1915]/20 px-6 text-sm">{ru.hero.example}</Link>
          </div>
          <p className="mt-3 text-sm text-[#6b645c]">{ru.hero.trial}</p>
          <label className="mt-10 block max-w-md">
            <span className="text-sm">{ru.hero.tryOn}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={ru.hero.placeholder}
              className="mt-2 h-12 w-full border border-[#1c1915]/15 bg-[#faf8f5] px-4 outline-none focus:border-[#1c1915]"
            />
          </label>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {NICHE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setNiche(id)}
                className="shrink-0 border px-3 py-1.5 text-sm"
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
        </div>
        <Phone shop={shop} products={products} />
      </section>

      <section id="templates" className="mx-auto max-w-6xl px-5 py-16">
        <Reveal>
          <h2 className="font-serif text-4xl tracking-tight">{ru.landing.templatesTitle}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f584f]">{ru.landing.templatesText}</p>
        </Reveal>
        <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
          {TEMPLATES.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setOpen(id)}
              className="w-[78%] shrink-0 snap-center border border-[#1c1915]/10 bg-[#faf8f5] p-4 text-left md:w-auto"
            >
              <Miniature template={id} shop={shop} products={products} color={TEMPLATE_COLORS[id]} />
              <h3 className="mt-4 text-lg">{ru.templates[id].name}</h3>
              <p className="mt-1 text-sm leading-6 text-[#6b645c]">{ru.templates[id].text}</p>
              <span className="mt-3 inline-block text-sm underline underline-offset-4">{ru.landing.enlarge}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-2">
        <Reveal>
          <Compare title={ru.landing.without} messy />
        </Reveal>
        <Reveal>
          <Compare title={ru.landing.with} shop={shop} product={products[0]?.name ?? ru.store.cart} />
        </Reveal>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-4xl">{ru.landing.howTitle}</h2>
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
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            [ru.landing.visits, "128"],
            [ru.landing.sources, "4"],
            [ru.landing.toWhatsapp, "19"],
            [ru.landing.conversion, "15%"],
          ].map(([label, value]) => (
            <div key={label} className="border border-[#1c1915]/10 bg-[#faf8f5] p-4">
              <p className="text-xs text-[#6b645c]">{label}</p>
              <p className="mt-2 font-serif text-3xl">{value}</p>
              <p className="mt-2 text-[11px] uppercase tracking-wide text-[#8a8175]">{ru.landing.sample}</p>
            </div>
          ))}
        </div>
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
          <Link href="/signup" className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#1c1915] text-sm text-[#f6f3ee]">{ru.landing.priceCta}</Link>
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
            <Link href="/signup" className="inline-flex h-12 items-center bg-[#f6f3ee] px-6 text-sm text-[#1c1915]">{ru.landing.finalCta}</Link>
            <p className="mt-3 text-sm text-[#d9d0c5]">{ru.hero.trial}</p>
          </div>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 overflow-auto bg-[#f3efe8]" role="dialog" aria-modal="true" aria-label={ru.templates[open].name}>
          <button type="button" onClick={() => setOpen(null)} className="fixed top-4 right-4 z-10 bg-[#1c1915] px-3 py-2 text-sm text-[#f6f3ee]">
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
          storage_path: niche === "flowers" ? ["/demo/peony.svg", "/demo/ranunculus.svg", "/demo/roses.svg"][index] ?? "/demo/peony.svg" : panel(product.tone),
          sort_order: 0,
        },
      ],
    })),
  }
}

function panel(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000"><rect width="800" height="1000" fill="${color}"/><circle cx="400" cy="470" r="140" fill="white" opacity="0.35"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function Phone({ shop, products }: { shop: string; products: { name: string; price: number; tone: string }[] }) {
  const lines = useMemo(
    () => products.slice(0, 2).map((item) => `${item.name} × 1 — ${formatMoney(item.price)}`).join("\n"),
    [products],
  )
  return (
    <div className="mx-auto w-[280px] rounded-[2.2rem] border border-[#1c1915]/15 bg-[#1c1915] p-2 shadow-[0_30px_80px_rgba(28,25,21,0.12)]">
      <div className="relative h-[560px] overflow-hidden rounded-[1.8rem] bg-[#f7f4ef]">
        <div className="phone-loop grid h-full">
          <div className="p-5">
            <p className="text-xs tracking-[0.16em] uppercase text-[#6b645c]">{shop}</p>
            <p className="mt-6 text-sm text-[#6b645c]">{ru.store.cart}</p>
            <ul className="mt-3 space-y-3">
              {products.slice(0, 2).map((item) => (
                <li key={item.name} className="flex items-center gap-3 text-sm">
                  <span className="h-10 w-10" style={{ background: item.tone }} />
                  <span className="flex-1">{item.name}</span>
                  <span>{formatMoney(item.price)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex h-full flex-col justify-end p-5">
            <p className="text-center text-sm">{shop}</p>
            <div className="mt-auto bg-[#1c1915] py-3 text-center text-sm text-[#f6f3ee]">{ru.store.send}</div>
          </div>
          <div className="flex h-full items-end p-4">
            <div className="w-full rounded-2xl bg-[#e7f6df] p-4 text-xs leading-5 text-[#17301c]">
              <p className="mb-2 text-[11px] text-[#3d6b4a]">{shop}</p>
              {lines}
              {"\n"}Итого: {formatMoney(products.slice(0, 2).reduce((sum, item) => sum + item.price, 0))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Miniature({
  template,
  shop,
  products,
  color,
}: {
  template: TemplateId
  shop: string
  products: { name: string; price: number; tone: string }[]
  color: string
}) {
  const dark = template === "cinematic"
  return (
    <div className="aspect-[4/5] overflow-hidden p-3" style={{ background: dark ? "#100f0e" : "#f7f4ef", color: dark ? "#f4f0e8" : "#1c1915" }}>
      <p className="truncate text-[10px] tracking-[0.14em] uppercase opacity-60">{shop}</p>
      <div className={`mt-3 ${template === "minimal" ? "space-y-2" : "grid grid-cols-2 gap-2"}`}>
        {products.slice(0, template === "minimal" ? 3 : 2).map((item) => (
          <div key={item.name}>
            <div className={template === "minimal" ? "h-6" : "aspect-[3/4]"} style={{ background: item.tone, borderRadius: template === "vivid" ? 12 : 0 }} />
            {template !== "minimal" && <p className="mt-1 truncate text-[10px]">{item.name}</p>}
          </div>
        ))}
      </div>
      <div className="mt-3 h-6" style={{ background: color, width: "40%" }} />
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
  if (reduce) return <div>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
