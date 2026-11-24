import { formatDateIso, formatMoney } from "@/lib/format"

export type MessageInput = {
  shopName: string
  orderNumber: string
  items: { name: string; qty: number; price: number }[]
  subtotal: number
  fulfillment: "delivery" | "pickup"
  deliveryPrice: number
  deliveryQuoted?: boolean
  zoneName?: string | null
  total: number
  customerName: string
  customerPhone: string
  address?: string
  date?: string
  time?: string
  comment?: string
  extras: { label: string; value: string }[]
}

export function buildWhatsappMessage(input: MessageInput): string {
  const lines: string[] = [`Заказ №${input.orderNumber} · ${input.shopName}`, ""]
  for (const item of input.items) {
    lines.push(`${item.name} × ${item.qty} — ${formatMoney(item.price * item.qty)}`)
  }
  lines.push("", `Товары: ${formatMoney(input.subtotal)}`)
  if (input.fulfillment === "delivery") {
    if (input.deliveryQuoted) {
      lines.push("Доставка: стоимость уточним")
    } else {
      const zone = input.zoneName ? ` (${input.zoneName})` : ""
      lines.push(`Доставка${zone}: ${formatMoney(input.deliveryPrice)}`)
    }
  } else {
    lines.push("Самовывоз")
  }
  lines.push(`Итого: ${formatMoney(input.total)}`, "")
  lines.push(`Имя: ${input.customerName}`)
  lines.push(`Телефон: ${input.customerPhone}`)
  if (input.fulfillment === "delivery" && input.address) lines.push(`Адрес: ${input.address}`)
  if (input.date || input.time) {
    const when = [input.date ? formatDateIso(input.date) : "", input.time ?? ""]
      .filter(Boolean)
      .join(", ")
    lines.push(`Когда: ${when}`)
  }
  if (input.comment?.trim()) lines.push(`Комментарий: ${input.comment.trim()}`)
  for (const extra of input.extras) {
    if (extra.value.trim()) lines.push(`${extra.label}: ${extra.value.trim()}`)
  }
  return lines.join("\n")
}

export function whatsappHref(e164: string, message: string): string {
  const digits = e164.replace(/\D/g, "")
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
