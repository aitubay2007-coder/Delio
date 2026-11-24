"use client"

import { formatMoney } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import type { Product, StoreBundle, TemplateId } from "@/lib/types"
import { ru } from "@/i18n/ru"
import { Frame } from "@/components/storefront/frame"

const OCCASIONS = ru.store.occasions

export function Catalog(props: {
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
  const { template, products, bundle } = props
  if (!products.length && !bundle.products.length) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-16">
        <Header {...props} />
        <p className="py-10 text-base" style={{ color: "var(--sf-muted)" }}>{ru.store.emptyCatalog}</p>
      </main>
    )
  }
  if (template === "boutique") return <Boutique {...props} />
  if (template === "by_date") return <ByDate {...props} />
  if (template === "editorial") return <Editorial {...props} />
  if (template === "vivid") return <Vivid {...props} />
  if (template === "cinematic") return <Cinematic {...props} />
  return <Minimal {...props} />
}

function ShopAvatar({ name, logoPath, onAccent = false }: { name: string; logoPath: string | null; onAccent?: boolean }) {
  const placeholder = !logoPath || logoPath.includes("/demo/logo.")
  const logo = placeholder ? null : mediaUrl(logoPath)
  const letter = name.trim().slice(0, 1).toUpperCase()
  if (logo) {
    return <img src={logo} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover ring-4 ring-white" />
  }
  return (
    <span
      aria-hidden
      className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-xl font-medium ring-4 ring-white"
      style={onAccent
        ? { background: "#fff", color: "var(--sf-button-bg)" }
        : { background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
    >
      {letter}
    </span>
  )
}

function Header({ bundle, openNow, dayLabel, align = "left" }: {
  bundle: StoreBundle
  openNow: boolean | null
  dayLabel: string
  align?: "left" | "center"
}) {
  return (
    <header className={`flex flex-col gap-3 py-6 ${align === "center" ? "items-center text-center" : ""}`}>
      <div className={`flex items-center gap-3 ${align === "center" ? "flex-col" : ""}`}>
        <ShopAvatar name={bundle.store.name} logoPath={bundle.store.logo_path} />
        <div>
          <p className="text-xs tracking-[0.14em] uppercase" style={{ color: "var(--sf-muted)" }}>
            {ru.niches[bundle.store.niche]}
            {bundle.store.is_demo ? ` · ${ru.store.exampleMark}` : ""}
          </p>
          <h1 className="text-[1.75rem] leading-none tracking-[-0.04em]">{bundle.store.name}</h1>
        </div>
      </div>
      <p className="text-base" style={{ color: "var(--sf-muted)" }}>
        {ru.store.hours} {dayLabel}
        {openNow !== null && (
          <span className="ml-2 inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: openNow ? "#2f6b4f" : "var(--sf-muted)" }} />
            {openNow ? ru.store.open : ru.store.closed}
          </span>
        )}
      </p>
      {bundle.store.address && <p className="text-base" style={{ color: "var(--sf-muted)" }}>{bundle.store.address}</p>}
    </header>
  )
}

function Categories({ bundle, category, onCategory }: {
  bundle: StoreBundle
  category: string
  onCategory: (id: string) => void
}) {
  if (!bundle.categories.length) return null
  const items = [{ id: "all", name: ru.store.all }, ...bundle.categories]
  return (
    <div className="sf-scroll -mx-5 flex gap-2 overflow-x-auto px-5 pb-4">
      {items.map((item) => {
        const active = category === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategory(item.id)}
            className="shrink-0 rounded-full px-4 py-2 text-base"
            style={{
              background: active ? "var(--sf-button-bg)" : "transparent",
              color: active ? "var(--sf-button-text)" : "var(--sf-muted)",
              border: active ? "none" : "1px solid var(--sf-line)",
            }}
          >
            {item.name}
          </button>
        )
      })}
    </div>
  )
}

function AddButton({ product, onAdd, quiet }: { product: Product; onAdd: (product: Product) => void; quiet?: boolean }) {
  if (!product.available) return <span className="text-sm" style={{ color: "var(--sf-muted)" }}>{ru.store.unavailable}</span>
  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className={quiet ? "text-base underline-offset-4 hover:underline" : "h-11 rounded-full px-4 text-base"}
      style={quiet ? { color: "var(--sf-text)" } : { background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
    >
      {ru.store.add}
    </button>
  )
}

function Minimal(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="mx-auto w-full max-w-xl px-5 pb-28 sm:px-6">
      <Header bundle={props.bundle} openNow={props.openNow} dayLabel={props.dayLabel} />
      <Categories bundle={props.bundle} category={props.category} onCategory={props.onCategory} />
      <ul className="space-y-3">
        {props.products.map((product) => (
          <li key={product.id} className="flex items-center gap-4 rounded-2xl border bg-white/70 p-3" style={{ borderColor: "var(--sf-line)" }}>
            <button type="button" onClick={() => props.onOpen(product)} className="h-24 w-20 shrink-0 overflow-hidden rounded-xl">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="h-24 w-20" />
            </button>
            <button type="button" onClick={() => props.onOpen(product)} className="min-w-0 flex-1 text-left">
              <span className="block text-[17px] leading-snug">{product.name}</span>
              <span className="mt-1 block text-base" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</span>
            </button>
            <AddButton product={product} onAdd={props.onAdd} />
          </li>
        ))}
      </ul>
    </main>
  )
}

function Boutique(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
      <Header bundle={props.bundle} openNow={props.openNow} dayLabel={props.dayLabel} align="center" />
      <Categories bundle={props.bundle} category={props.category} onCategory={props.onCategory} />
      {props.bundle.covers[0] && (
        <Frame path={props.bundle.covers[0].storage_path} alt="" priority className="mb-8 aspect-[16/7] w-full rounded-2xl" />
      )}
      <div className="grid gap-10 sm:grid-cols-2">
        {props.products.map((product) => (
          <article key={product.id}>
            <button type="button" onClick={() => props.onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[5/4] w-full sm:aspect-[4/5]" />
              <h2 className="mt-4 text-[1.65rem] leading-none tracking-[-0.03em]">{product.name}</h2>
              <p className="mt-2 max-w-sm text-base leading-6" style={{ color: "var(--sf-muted)" }}>{product.description}</p>
              <p className="mt-3 text-base" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
            </button>
            <div className="mt-4"><AddButton product={product} onAdd={props.onAdd} /></div>
          </article>
        ))}
      </div>
    </main>
  )
}

function ByDate(props: Parameters<typeof Catalog>[0]) {
  const indexed = props.products.map((product, index) => ({
    product,
    occasion: OCCASIONS[index % OCCASIONS.length],
  }))
  const shown = props.occasion ? indexed.filter((item) => item.occasion === props.occasion) : indexed
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
      <Header bundle={props.bundle} openNow={props.openNow} dayLabel={props.dayLabel} />
      <section className="rounded-3xl p-5" style={{ background: "var(--sf-soft)" }}>
        <h2 className="text-2xl tracking-[-0.03em]">{ru.store.occasion}</h2>
        <p className="mt-1 text-base" style={{ color: "var(--sf-muted)" }}>Выбор повода оставляет только подходящие товары.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {OCCASIONS.map((label) => {
            const active = props.occasion === label
            return (
              <button
                key={label}
                type="button"
                onClick={() => props.onOccasion(active ? "" : label)}
                className="rounded-full px-4 py-2 text-base"
                style={{
                  background: active ? "var(--sf-button-bg)" : "white",
                  color: active ? "var(--sf-button-text)" : "var(--sf-ink)",
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>
      <div className={shown.length > 1 ? "mt-8 grid gap-6 sm:grid-cols-2" : "mt-8 grid max-w-xl gap-6"}>
        {shown.map(({ product, occasion }) => (
          <article key={product.id} className="overflow-hidden rounded-3xl border bg-white" style={{ borderColor: "var(--sf-line)" }}>
            <button type="button" onClick={() => props.onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[4/3] w-full" />
              <div className="p-4">
                <p className="text-sm" style={{ color: "var(--sf-text)" }}>{occasion}</p>
                <h2 className="mt-1 text-xl">{product.name}</h2>
                <p className="mt-1 text-base">{formatMoney(product.price)}</p>
              </div>
            </button>
            <div className="px-4 pb-4"><AddButton product={product} onAdd={props.onAdd} /></div>
          </article>
        ))}
      </div>
      {shown.length === 0 && <p className="mt-8 text-base" style={{ color: "var(--sf-muted)" }}>Для этого повода товаров нет. Выберите другой.</p>}
    </main>
  )
}

function Editorial(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-28 sm:px-8">
      <Header bundle={props.bundle} openNow={props.openNow} dayLabel={props.dayLabel} />
      <Categories bundle={props.bundle} category={props.category} onCategory={props.onCategory} />
      <div className="space-y-12">
        {props.products.map((product, index) => {
          const flip = index % 2 === 1
          return (
            <article key={product.id} className="grid items-center gap-6 lg:grid-cols-2">
              <button type="button" onClick={() => props.onOpen(product)} className={flip ? "lg:order-2" : ""}>
                <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[4/3] w-full" />
              </button>
              <div className={flip ? "lg:order-1 lg:pr-6" : "lg:pl-6"}>
                <p className="text-sm tracking-[0.16em]" style={{ color: "var(--sf-muted)" }}>{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 text-4xl leading-none tracking-[-0.04em]">{product.name}</h2>
                <p className="mt-4 text-base leading-7" style={{ color: "var(--sf-muted)" }}>{product.description}</p>
                <p className="mt-4 text-lg" style={{ color: "var(--sf-text)" }}>{formatMoney(product.price)}</p>
                <div className="mt-5"><AddButton product={product} onAdd={props.onAdd} /></div>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  )
}

function Vivid(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="min-h-dvh pb-28" style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
        <header className="flex items-center gap-3 py-4">
          <ShopAvatar name={props.bundle.store.name} logoPath={props.bundle.store.logo_path} onAccent />
          <div>
            <p className="text-sm uppercase tracking-[0.16em] opacity-80">{ru.niches[props.bundle.store.niche]}</p>
            <h1 className="text-4xl leading-none">{props.bundle.store.name}</h1>
          </div>
        </header>
        <div className="mb-5 flex flex-wrap gap-2">
          {[{ id: "all", name: ru.store.all }, ...props.bundle.categories].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => props.onCategory(item.id)}
              className="rounded-full px-4 py-2 text-base"
              style={{
                background: props.category === item.id ? "white" : "transparent",
                color: props.category === item.id ? "var(--sf-button-bg)" : "var(--sf-button-text)",
                border: "2px solid white",
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {props.products.map((product) => (
            <article key={product.id} className="rounded-[28px] bg-white p-3 text-[#14120f]">
              <button type="button" onClick={() => props.onOpen(product)} className="block w-full text-left">
                <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[5/4] w-full rounded-[20px]" />
                <h2 className="mt-3 px-1 text-3xl leading-none">{product.name}</h2>
              </button>
              <div className="mt-3 flex items-center justify-between px-1 pb-1">
                <span className="text-lg">{formatMoney(product.price)}</span>
                <AddButton product={product} onAdd={props.onAdd} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
}

function Cinematic(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="mx-auto w-full max-w-5xl pb-28">
      <header className="sticky top-0 z-20 flex items-center gap-3 px-5 py-4" style={{ background: "color-mix(in srgb, var(--sf-bg) 88%, transparent)" }}>
        <ShopAvatar name={props.bundle.store.name} logoPath={props.bundle.store.logo_path} />
        <div className="min-w-0">
          <h1 className="truncate text-lg tracking-[0.12em] uppercase">{props.bundle.store.name}</h1>
          <p className="text-sm" style={{ color: "var(--sf-muted)" }}>
            {props.dayLabel}
            {props.openNow !== null ? ` · ${props.openNow ? ru.store.open : ru.store.closed}` : ""}
          </p>
        </div>
      </header>
      <div className="px-5"><Categories bundle={props.bundle} category={props.category} onCategory={props.onCategory} /></div>
      <div className="space-y-6 px-4 sm:px-5">
        {props.products.map((product) => (
          <article key={product.id} className="relative overflow-hidden rounded-3xl">
            <button type="button" onClick={() => props.onOpen(product)} className="block w-full text-left">
              <Frame path={product.photos[0]?.storage_path} alt={product.name} className="aspect-[4/5] w-full sm:aspect-[16/9]" />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5 pr-36 pt-28">
              <h2 className="text-3xl leading-none tracking-[-0.04em] text-white sm:text-4xl">{product.name}</h2>
              <p className="mt-2 text-lg text-white">{formatMoney(product.price)}</p>
            </div>
            <div className="absolute right-4 bottom-5">
              <AddButton product={product} onAdd={props.onAdd} />
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}
