"use client"

import type { ReactNode } from "react"
import { formatMoney, itemCount } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import { ru } from "@/i18n/ru"
import { Frame } from "@/components/storefront/frame"

export function Monogram({ name, logoPath }: { name: string; logoPath?: string | null }) {
  const placeholder = !logoPath || logoPath.includes("/demo/logo.")
  const logo = placeholder ? null : mediaUrl(logoPath)
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join("")
    .toUpperCase()
  if (logo) {
    return <img src={logo} alt="" className="h-10 w-10 shrink-0 rounded-[12px] object-cover" />
  }
  return (
    <span
      aria-hidden
      className="grid h-10 w-12 shrink-0 place-items-center rounded-[12px] border px-1 text-[12px] font-medium tracking-[0.04em]"
      style={{
        borderColor: "var(--sf-accent)",
        color: "var(--sf-ink)",
        background: "color-mix(in srgb, var(--sf-accent) 14%, var(--sf-bg))",
      }}
    >
      {initials || "·"}
    </span>
  )
}

export function ShopBar({
  name,
  meta,
  logoPath,
  heading = "h1",
}: {
  name: string
  meta: string
  logoPath?: string | null
  heading?: "h1" | "p"
}) {
  const Title = heading
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-[color-mix(in_srgb,var(--sf-bg)_92%,transparent)] px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3 py-3">
        <Monogram name={name} logoPath={logoPath} />
        <div className="min-w-0 flex-1">
          <Title className="truncate text-base leading-tight font-medium">{name}</Title>
          <p className="truncate text-[13px] leading-5" style={{ color: "var(--sf-muted)" }}>
            {meta}
          </p>
        </div>
      </div>
    </div>
  )
}

export function ProductCard({
  name,
  price,
  image,
  qty,
  unavailable,
  onOpen,
  onAdd,
  onQty,
  priority = false,
}: {
  name: string
  price: number
  image?: string | null
  qty: number
  unavailable?: boolean
  onOpen: () => void
  onAdd: () => void
  onQty: (qty: number) => void
  priority?: boolean
}) {
  return (
    <article data-slot="product-card" className="min-w-0">
      <button type="button" onClick={onOpen} className="block w-full text-left">
        <Frame
          path={image}
          alt={name}
          priority={priority}
          fit="contain"
          className="aspect-[4/5] w-full rounded-[14px]"
        />
        <span className="mt-2 block line-clamp-2 text-base leading-snug">{name}</span>
        <span className="mt-1 block text-base tabular-nums" style={{ color: "var(--sf-ink)" }}>
          {formatMoney(price)}
        </span>
      </button>
      <div className="mt-2">
        {unavailable ? (
          <span className="text-[13px]" style={{ color: "var(--sf-muted)" }}>{ru.store.unavailable}</span>
        ) : qty > 0 ? (
          <QtyControl qty={qty} onChange={onQty} />
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="h-11 w-full rounded-[14px] text-base"
            style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
          >
            {ru.store.add}
          </button>
        )}
      </div>
    </article>
  )
}

export function QtyControl({ qty, onChange }: { qty: number; onChange: (qty: number) => void }) {
  return (
    <div
      role="group"
      aria-label={`${ru.store.qty}: ${qty}`}
      className="sf-ack flex h-11 items-center justify-between rounded-[14px] border"
      style={{ borderColor: "var(--sf-line)" }}
    >
      <button
        type="button"
        aria-label={ru.a11y.decrease}
        onClick={() => onChange(qty - 1)}
        className="grid h-11 w-11 place-items-center text-base"
      >
        −
      </button>
      <span className="min-w-4 text-center text-base tabular-nums">{qty}</span>
      <button
        type="button"
        aria-label={ru.a11y.increase}
        onClick={() => onChange(Math.min(99, qty + 1))}
        className="grid h-11 w-11 place-items-center text-base"
      >
        +
      </button>
    </div>
  )
}

export function CartDock({
  count,
  amount,
  onOpen,
}: {
  count: number
  amount: number
  onOpen: () => void
}) {
  return (
    <div
      className="sf-dock flex items-center gap-3 rounded-[16px] border px-3 py-2"
      style={{
        background: "color-mix(in srgb, var(--sf-bg) 94%, white)",
        borderColor: "var(--sf-line)",
        boxShadow: "0 12px 32px rgba(41, 37, 36, 0.12)",
      }}
    >
      <p className="min-w-0 flex-1 text-base leading-tight">
        {itemCount(count)} · {formatMoney(amount)}
      </p>
      <button
        type="button"
        onClick={onOpen}
        className="h-11 shrink-0 rounded-[14px] px-4 text-base"
        style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
      >
        {ru.store.openCart}
      </button>
    </div>
  )
}

export function Totals({
  subtotal,
  fulfillment,
  delivery,
  quoted,
}: {
  subtotal: number
  fulfillment: "delivery" | "pickup"
  delivery: number
  quoted: boolean
}) {
  const total = fulfillment === "delivery" && !quoted ? subtotal + delivery : subtotal
  return (
    <div className="space-y-2 text-base">
      <div className="flex items-center justify-between gap-3">
        <span style={{ color: "var(--sf-muted)" }}>{ru.store.goods}</span>
        <span className="tabular-nums">{formatMoney(subtotal)}</span>
      </div>
      {fulfillment === "delivery" && quoted && (
        <p className="text-[13px] leading-5" style={{ color: "var(--sf-ink)" }}>
          {ru.store.deliveryQuote} {ru.store.goodsSum}: {formatMoney(subtotal)}
        </p>
      )}
      {fulfillment === "delivery" && !quoted && (
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: "var(--sf-muted)" }}>{ru.store.delivery}</span>
          <span className="tabular-nums">{formatMoney(delivery)}</span>
        </div>
      )}
      {fulfillment === "pickup" && (
        <div className="flex items-center justify-between gap-3">
          <span style={{ color: "var(--sf-muted)" }}>{ru.store.pickup}</span>
          <span>{ru.store.free}</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3 font-medium">
        <span>{ru.store.total}</span>
        <span className="tabular-nums">{formatMoney(total)}</span>
      </div>
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  error,
  inputMode,
  multiline,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  inputMode?: "tel" | "text"
  multiline?: boolean
}) {
  const className = "mt-1 w-full rounded-[14px] border bg-transparent px-3 text-base"
  const style = { borderColor: "var(--sf-line)", color: "var(--sf-ink)" }
  const describedBy = error ? `${label}-error` : undefined
  return (
    <div>
      <label className="block">
        <span className="text-[13px] leading-5" style={{ color: "var(--sf-muted)" }}>{label}</span>
        {multiline ? (
          <textarea
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            className={`${className} min-h-20 py-2`}
            style={style}
          />
        ) : (
          <input
            value={value}
            inputMode={inputMode}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            onChange={(event) => onChange(event.target.value)}
            className={`${className} h-11`}
            style={style}
          />
        )}
      </label>
      {error && (
        <p id={describedBy} role="alert" className="mt-1 text-[13px] leading-5" style={{ color: "var(--sf-ink)" }}>
          {error}
        </p>
      )}
    </div>
  )
}

export function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="h-11 rounded-[14px] px-3 text-base"
      style={{
        background: active ? "var(--sf-accent)" : "transparent",
        color: active ? "var(--sf-on-accent)" : "var(--sf-ink)",
        border: active ? "1px solid transparent" : "1px solid var(--sf-line)",
      }}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="h-11 w-full rounded-[14px] text-base disabled:opacity-40"
      style={{ background: "var(--sf-button-bg)", color: "var(--sf-button-text)" }}
    >
      {children}
    </button>
  )
}
