"use client"

import { useState } from "react"
import { formatMoney } from "@/lib/format"
import { cityLine } from "@/lib/format"
import type { NicheId, Product, StoreBundle, TemplateId } from "@/lib/types"
import { ru } from "@/i18n/ru"
import { ProductCard, ShopBar } from "@/components/storefront/pieces"

const OCCASIONS = ru.store.occasions

export function catalogHeading(niche: NicheId): string {
  return niche === "flowers" ? ru.store.bouquets : ru.store.goods
}

export function Catalog(props: {
  template: TemplateId
  bundle: StoreBundle
  products: Product[]
  category: string
  onCategory: (id: string) => void
  onOpen: (product: Product) => void
  onAdd: (product: Product) => void
  onQty: (product: Product, qty: number) => void
  qtyFor: (id: string) => number
  openNow: boolean | null
  dayLabel: string
  occasion: string | null
  onOccasion: (value: string) => void
}) {
  const { template, products, bundle } = props
  if (!products.length && !bundle.products.length) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <LightHeader {...props} />
        <p className="py-8 text-base" style={{ color: "var(--sf-muted)" }}>{ru.store.emptyCatalog}</p>
      </main>
    )
  }
  if (template === "cinematic") return <Cinematic {...props} />
  return <Light {...props} />
}

function metaLine(bundle: StoreBundle, dayLabel: string, openNow: boolean | null) {
  const city = cityLine(bundle.store.address)
  const state = openNow === null ? "" : openNow ? ru.store.open : ru.store.closed
  return [city, dayLabel, state].filter(Boolean).join(" · ")
}

function LightHeader(props: Parameters<typeof Catalog>[0]) {
  const { bundle, openNow, dayLabel } = props
  const [open, setOpen] = useState(false)
  return (
    <>
      <ShopBar
        name={bundle.store.name}
        logoPath={bundle.store.logo_path}
        meta={`${metaLine(bundle, dayLabel, openNow)}${bundle.store.is_demo ? ` · ${ru.store.exampleMark}` : ""}`}
      />
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="mt-1 flex h-11 items-center gap-2 text-left text-[13px]"
        style={{ color: "var(--sf-ink)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sf-accent)" }} />
        {ru.store.contacts}
      </button>
      {open && <Contacts bundle={bundle} dayLabel={dayLabel} />}
      <h2 id="catalog" className="mt-4 scroll-mt-16 text-[30px] leading-none tracking-[-0.03em]">
        {catalogHeading(bundle.store.niche)}
      </h2>
    </>
  )
}

function Contacts({ bundle, dayLabel }: { bundle: StoreBundle; dayLabel: string }) {
  return (
    <div
      className="sf-step mt-1 space-y-2 rounded-[16px] border p-4 text-base"
      style={{
        borderColor: "var(--sf-line)",
        background: "color-mix(in srgb, var(--sf-ink) 4%, var(--sf-bg))",
      }}
    >
      {bundle.store.address && <p>{bundle.store.address}</p>}
      {dayLabel && (
        <p style={{ color: "var(--sf-muted)" }}>
          {ru.store.hours} {dayLabel}
        </p>
      )}
      {bundle.store.delivery_enabled && (
        <div>
          <p className="text-[13px]" style={{ color: "var(--sf-muted)" }}>{ru.store.delivery}</p>
          {bundle.store.delivery_zones.length ? (
            bundle.store.delivery_zones.map((zone) => (
              <p key={zone.id}>
                {zone.name}
                {" · "}
                {zone.quoted ? ru.store.deliveryQuote : formatMoney(zone.price)}
              </p>
            ))
          ) : (
            <p>{ru.store.deliveryQuote}</p>
          )}
        </div>
      )}
      {bundle.store.pickup_enabled && bundle.store.address && (
        <p>
          {ru.store.pickup}: {bundle.store.address}
        </p>
      )}
    </div>
  )
}

function Categories(props: Parameters<typeof Catalog>[0]) {
  if (!props.bundle.categories.length) return null
  const items = [{ id: "all", name: ru.store.all }, ...props.bundle.categories]
  return (
    <div className="sf-scroll -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {items.map((item) => {
        const active = props.category === item.id
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => props.onCategory(item.id)}
            className="h-11 shrink-0 rounded-[14px] px-3 text-base"
            style={{
              background: active ? "var(--sf-accent)" : "transparent",
              color: active ? "var(--sf-on-accent)" : "var(--sf-ink)",
              border: active ? "1px solid transparent" : "1px solid var(--sf-line)",
            }}
          >
            {item.name}
          </button>
        )
      })}
    </div>
  )
}

function Grid(props: Parameters<typeof Catalog>[0]) {
  return (
    <ul className="sf-rise mt-4 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
      {props.products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            name={product.name}
            price={product.price}
            image={product.photos[0]?.storage_path}
            qty={props.qtyFor(product.id)}
            unavailable={!product.available}
            priority={index < 2}
            onOpen={() => props.onOpen(product)}
            onAdd={() => props.onAdd(product)}
            onQty={(qty) => props.onQty(product, qty)}
          />
        </li>
      ))}
    </ul>
  )
}

function Light(props: Parameters<typeof Catalog>[0]) {
  const indexed = props.products.map((product, index) => ({
    product,
    occasion: OCCASIONS[index % OCCASIONS.length],
  }))
  const shown = props.template === "by_date" && props.occasion
    ? indexed.filter((item) => item.occasion === props.occasion)
    : indexed
  const products = props.template === "by_date" ? shown.map((item) => item.product) : props.products
  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 pb-32 sm:px-5"
      style={props.template === "vivid" ? { background: "color-mix(in srgb, var(--sf-accent) 10%, var(--sf-bg))" } : undefined}
    >
      <LightHeader {...props} />
      {props.template === "by_date" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {OCCASIONS.map((label) => {
            const active = props.occasion === label
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() => props.onOccasion(active ? "" : label)}
                className="h-11 rounded-[14px] px-3 text-[13px]"
                style={{
                  background: active ? "var(--sf-accent)" : "transparent",
                  color: active ? "var(--sf-on-accent)" : "var(--sf-ink)",
                  border: "1px solid var(--sf-line)",
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
      <Categories {...props} />
      <Grid {...props} products={products} />
      {props.template === "by_date" && shown.length === 0 && (
        <p className="mt-6 text-base" style={{ color: "var(--sf-muted)" }}>{ru.store.occasionEmpty}</p>
      )}
    </main>
  )
}

function Cinematic(props: Parameters<typeof Catalog>[0]) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-32 sm:px-5">
      <ShopBar
        name={props.bundle.store.name}
        logoPath={props.bundle.store.logo_path}
        meta={metaLine(props.bundle, props.dayLabel, props.openNow)}
      />
      <h2 id="catalog" className="mt-4 scroll-mt-16 text-[30px] leading-none tracking-[-0.03em]">
        {catalogHeading(props.bundle.store.niche)}
      </h2>
      <Categories {...props} />
      <ul className="sf-rise mt-4 grid grid-cols-1 gap-4 min-[360px]:grid-cols-2">
        {props.products.map((product) => (
          <li key={product.id} className="relative overflow-hidden rounded-[16px]">
            <ProductCard
              name={product.name}
              price={product.price}
              image={product.photos[0]?.storage_path}
              qty={props.qtyFor(product.id)}
              unavailable={!product.available}
              onOpen={() => props.onOpen(product)}
              onAdd={() => props.onAdd(product)}
              onQty={(qty) => props.onQty(product, qty)}
            />
          </li>
        ))}
      </ul>
    </main>
  )
}
