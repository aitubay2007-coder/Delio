"use client"

import { addDaysIso, formatMoney, todayIso } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import type { Product, StoreBundle, TemplateId } from "@/lib/types"
import type { ReactNode } from "react"
import { ru } from "@/i18n/ru"
import { Frame } from "@/components/storefront/frame"

export function Catalog({
  template,
  bundle,
  products,
  category,
  onCategory,
  onOpen,
  onAdd,
  openNow,
  dayLabel,
  occasion,
  onOccasion,
}: {
  template: TemplateId
  bundle: StoreBundle
  products: Product[]
  category: string
  onCategory: (id: string) => void
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
  openNow: boolean | null
  dayLabel: string
  occasion: string | null
  onOccasion: (value: string) => void
}) {
  const header = (
    <StoreHeader bundle={bundle} openNow={openNow} dayLabel={dayLabel} template={template} />
  )
  const cats = (
    <Categories
      bundle={bundle}
      category={category}
      onCategory={onCategory}
      template={template}
    />
  )
  if (!products.length && !bundle.products.length) {
    return (
      <main>
        {header}
        <p className="px-5 py-16 text-sm" style={{ color: "var(--sf-muted)" }}>{ru.store.emptyCatalog}</p>
      </main>
    )
  }

  if (template === "boutique") return <Boutique header={header} cats={cats} products={products} bundle={bundle} onOpen={onOpen} onAdd={onAdd} />
  if (template === "by_date") {
    return (
      <ByDate
        header={header}
        cats={cats}
        products={products}
        bundle={bundle}
        onOpen={onOpen}
        onAdd={onAdd}
        occasion={occasion}
        onOccasion={onOccasion}
      />
    )
  }
  if (template === "editorial") return <Editorial header={header} cats={cats} products={products} onOpen={onOpen} onAdd={onAdd} />
  if (template === "vivid") return <Vivid header={header} cats={cats} products={products} onOpen={onOpen} onAdd={onAdd} />
  if (template === "cinematic") return <Cinematic bundle={bundle} products={products} openNow={openNow} dayLabel={dayLabel} onOpen={onOpen} onAdd={onAdd} category={category} onCategory={onCategory} />
  return <Minimal header={header} cats={cats} products={products} onOpen={onOpen} onAdd={onAdd} />
}

function StoreHeader({
  bundle,
  openNow,
  dayLabel,
  template,
}: {
  bundle: StoreBundle
  openNow: boolean | null
  dayLabel: string
  template: TemplateId
}) {
  const logo = mediaUrl(bundle.store.logo_path)
  const centered = template === "boutique" || template === "by_date"
  return (
    <header className={`px-5 pt-6 pb-4 ${centered ? "text-center" : ""}`}>
      <div className={`flex items-center gap-3 ${centered ? "justify-center" : ""}`}>
        {logo && <img src={logo} alt="" className="h-11 w-11 rounded-full object-cover" />}
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase" style={{ color: "var(--sf-muted)" }}>
            {ru.niches[bundle.store.niche]}
            {bundle.store.is_demo ? ` · ${ru.store.exampleMark}` : ""}
          </p>
          <h1 className={`text-2xl ${template === "minimal" ? "font-normal tracking-tight" : ""}`}>{bundle.store.name}</h1>
        </div>
      </div>
      <p className={`mt-3 text-sm ${centered ? "" : ""}`} style={{ color: "var(--sf-muted)" }}>
        {ru.store.hours} {dayLabel}
        {openNow !== null && (
          <span className="ml-2 inline-flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: openNow ? "#2f6b4f" : "var(--sf-muted)" }} />
            {openNow ? ru.store.open : ru.store.closed}
          </span>
        )}
      </p>
      {bundle.store.address && (
        <p className="mt-1 text-sm" style={{ color: "var(--sf-muted)" }}>{bundle.store.address}</p>
      )}
    </header>
  )
}

function Categories({
  bundle,
  category,
  onCategory,
  template,
}: {
  bundle: StoreBundle
  category: string
  onCategory: (id: string) => void
  template: TemplateId
}) {
  if (!bundle.categories.length) return null
  const items = [{ id: "all", name: ru.store.all }, ...bundle.categories]
  return (
    <div className={`sf-scroll flex gap-2 overflow-x-auto px-5 pr-10 pb-5 ${template === "boutique" ? "md:justify-center" : ""}`}>
      {items.map((item) => {
        const active = category === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategory(item.id)}
            className="shrink-0 px-3 py-1.5 text-sm"
            style={{
              borderRadius: template === "vivid" ? "999px" : "var(--sf-radius)",
              background: active ? (template === "vivid" ? "var(--sf-button-bg)" : "transparent") : "transparent",
              color: active ? (template === "vivid" ? "var(--sf-button-text)" : "var(--sf-ink)") : "var(--sf-muted)",
              borderBottom: active && template !== "vivid" ? "1px solid var(--sf-ink)" : "1px solid transparent",
            }}
          >
            {item.name}
          </button>
        )
      })}
    </div>
  )
}

function Minimal({
  header,
  cats,
  products,
  onOpen,
  onAdd,
}: {
  header: ReactNode
  cats: ReactNode
  products: Product[]
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
}) {
  return (
    <main>
      {header}
      {cats}
      <ul className="mx-auto max-w-3xl">
        {products.map((product) => (
          <li key={product.id} className="border-t px-5" style={{ borderColor: "var(--sf-line)" }}>
            <div className="flex items-center gap-4 py-5">
              <button type="button" onClick={() => onOpen(product)} className="h-20 w-16 shrink-0 overflow-hidden">
                <Frame path={product.photos[0]?.storage_path} alt={product.name} className="h-20 w-16" />
              </button>
              <button type="button" onClick={() => onOpen(product)} className="min-w-0 flex-1 text-left">
                <span className="block truncate text-[15px]">{product.name}</span>
                <span className="mt-1 block text-sm" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</span>
              </button>
              <Add product={product} onAdd={onAdd} quiet />
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

function Boutique({
  header,
  cats,
  products,
  bundle,
  onOpen,
  onAdd,
}: {
  header: ReactNode
  cats: ReactNode
  products: Product[]
  bundle: StoreBundle
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
}) {
  const cover = bundle.covers[0]?.storage_path
  return (
    <main>
      {cover && (
        <div className="px-4 pt-4">
          <Frame path={cover} alt="" className="aspect-[16/9] w-full" />
        </div>
      )}
      {header}
      {cats}
      <div className="grid gap-10 px-4 pb-8 sm:grid-cols-2">
        {products.map((product) => (
          <article key={product.id}>
            <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[4/5] w-full" />
              <h2 className="mt-4 text-3xl leading-none">{product.name}</h2>
              <p className="mt-2 text-sm tracking-wide" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
            </button>
            <div className="mt-3">
              <Add product={product} onAdd={onAdd} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function ByDate({
  header,
  cats,
  products,
  bundle,
  onOpen,
  onAdd,
  occasion,
  onOccasion,
}: {
  header: ReactNode
  cats: ReactNode
  products: Product[]
  bundle: StoreBundle
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
  occasion: string | null
  onOccasion: (value: string) => void
}) {
  const today = todayIso(bundle.store.working_hours.timezone)
  return (
    <main>
      {header}
      <section className="px-5 pb-6">
        <h2 className="text-3xl">{ru.store.occasion}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {ru.store.occasions.map((label, index) => {
            const active = occasion === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => onOccasion(label)}
                className="px-3 py-2 text-sm"
                style={{
                  borderRadius: "999px",
                  background: active ? "var(--sf-button-bg)" : "var(--sf-soft)",
                  color: active ? "var(--sf-button-text)" : "var(--sf-ink)",
                }}
              >
                {label}
                <span className="ml-2 opacity-70">{index === 0 ? "·" : index === 1 ? addDaysIso(today, 1).slice(8) : ""}</span>
              </button>
            )
          })}
        </div>
      </section>
      {cats}
      <div className="grid grid-cols-2 gap-3 px-4">
        {products.map((product) => (
          <article key={product.id} className="overflow-hidden" style={{ borderRadius: "var(--sf-radius)", background: "color-mix(in srgb, var(--sf-bg) 70%, white)" }}>
            <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-square w-full" />
              <div className="p-3">
                <h2 className="text-lg leading-tight">{product.name}</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
              </div>
            </button>
            <div className="px-3 pb-3">
              <Add product={product} onAdd={onAdd} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function Editorial({
  header,
  cats,
  products,
  onOpen,
  onAdd,
}: {
  header: ReactNode
  cats: ReactNode
  products: Product[]
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
}) {
  return (
    <main>
      {header}
      {cats}
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 px-4">
        {products.map((product, index) => {
          const wide = index % 5 === 0
          return (
            <article key={product.id} className={wide ? "col-span-2" : ""}>
              <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
                <p className="mb-2 text-[11px] tracking-[0.2em]" style={{ color: "var(--sf-muted)" }}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <Frame path={product.photos[0]?.storage_path} alt={product.name} className={wide ? "aspect-[16/10] w-full" : "aspect-[3/4] w-full"} />
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h2 className={wide ? "text-4xl leading-none" : "text-xl leading-tight"}>{product.name}</h2>
                  <span className="text-sm" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</span>
                </div>
              </button>
              {wide && product.description && (
                <p className="mt-2 max-w-md text-sm leading-6" style={{ color: "var(--sf-muted)" }}>{product.description}</p>
              )}
              <div className="mt-3">
                <Add product={product} onAdd={onAdd} quiet />
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

function Vivid({
  header,
  cats,
  products,
  onOpen,
  onAdd,
}: {
  header: ReactNode
  cats: ReactNode
  products: Product[]
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
}) {
  return (
    <main>
      {header}
      {cats}
      <div className="grid gap-4 px-4 sm:grid-cols-2">
        {products.map((product, index) => (
          <article
            key={product.id}
            className="overflow-hidden p-3"
            style={{
              borderRadius: "var(--sf-radius)",
              background: index % 2 === 0 ? "var(--sf-soft)" : "white",
            }}
          >
            <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[5/4] w-full" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold leading-tight">{product.name}</h2>
                <span className="shrink-0 px-2 py-1 text-sm" style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)", borderRadius: "999px" }}>
                  {formatMoney(product.price)}
                </span>
              </div>
            </button>
            <div className="mt-3">
              <Add product={product} onAdd={onAdd} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function Cinematic({
  bundle,
  products,
  openNow,
  dayLabel,
  onOpen,
  onAdd,
  category,
  onCategory,
}: {
  bundle: StoreBundle
  products: Product[]
  openNow: boolean | null
  dayLabel: string
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
  category: string
  onCategory: (id: string) => void
}) {
  const logo = mediaUrl(bundle.store.logo_path)
  return (
    <main>
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-4 backdrop-blur" style={{ background: "color-mix(in srgb, var(--sf-bg) 78%, transparent)" }}>
        <div className="flex items-center gap-3">
          {logo && <img src={logo} alt="" className="h-8 w-8 rounded-full object-cover" />}
          <div>
            <h1 className="text-sm tracking-[0.18em] uppercase">{bundle.store.name}</h1>
            <p className="text-xs" style={{ color: "var(--sf-muted)" }}>
              {dayLabel}
              {openNow !== null ? ` · ${openNow ? ru.store.open : ru.store.closed}` : ""}
            </p>
          </div>
        </div>
      </header>
      <Categories bundle={bundle} category={category} onCategory={onCategory} template="cinematic" />
      <div>
        {products.map((product) => (
          <article key={product.id} className="relative">
            <button type="button" onClick={() => onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[3/4] w-full sm:aspect-[16/9]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <h2 className="text-4xl font-light tracking-tight text-[#f4f0e8]">{product.name}</h2>
                <p className="mt-1 text-sm" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
              </div>
            </button>
            <div className="absolute right-4 bottom-24">
              <Add product={product} onAdd={onAdd} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

function Add({ product, onAdd, quiet }: { product: Product; onAdd: (product: Product) => void; quiet?: boolean }) {
  if (!product.available) {
    return <span className="text-xs" style={{ color: "var(--sf-muted)" }}>{ru.store.unavailable}</span>
  }
  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className={quiet ? "text-sm underline-offset-4 hover:underline" : "h-10 px-4 text-sm"}
      style={
        quiet
          ? { color: "var(--sf-text)" }
          : { background: "var(--sf-button-bg)", color: "var(--sf-button-text)", borderRadius: "var(--sf-radius)" }
      }
    >
      {ru.store.add}
    </button>
  )
}
