"use client"

import { useMemo, useState, type PointerEvent as ReactPointerEvent } from "react"
import { COLOR_SWATCHES, deriveAccent, hexToHsv, hsvToHex, normalizeHex } from "@/lib/color"
import { TEMPLATE_THEME } from "@/lib/catalog"
import { ru } from "@/i18n/ru"
import type { TemplateId } from "@/lib/types"

export function ColorField({
  value,
  onChange,
  template,
}: {
  value: string
  onChange: (hex: string) => void
  template: TemplateId
}) {
  const background = TEMPLATE_THEME[template].bg
  const hsv = hexToHsv(value)
  const [draft, setDraft] = useState(value)
  const tokens = useMemo(() => deriveAccent(value, background), [value, background])

  function setHex(next: string) {
    const normal = normalizeHex(next)
    setDraft(next)
    if (normal) onChange(normal)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2.5">
        {COLOR_SWATCHES.map((swatch) => {
          const selected = normalizeHex(value) === swatch.hex
          return (
            <button
              key={swatch.id}
              type="button"
              aria-label={ru.colors[swatch.id]}
              onClick={() => setHex(swatch.hex)}
              className="h-9 w-9 rounded-full"
              style={{
                background: swatch.hex,
                boxShadow: selected ? "0 0 0 2px #f6f4ef, 0 0 0 4px #14120f" : "inset 0 0 0 1px rgba(20,18,15,0.12)",
              }}
            />
          )
        })}
      </div>
      <div
        className="relative aspect-square w-full max-w-[220px] cursor-crosshair rounded-2xl"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h} 100% 50%))` }}
        onPointerDown={(event) => {
          const move = (point: PointerEvent | ReactPointerEvent<HTMLDivElement>) => {
            const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect()
            const s = Math.min(1, Math.max(0, (point.clientX - rect.left) / rect.width))
            const v = 1 - Math.min(1, Math.max(0, (point.clientY - rect.top) / rect.height))
            setHex(hsvToHex(hsv.h, s, v))
          }
          move(event)
          const up = (point: PointerEvent) => move(point)
          window.addEventListener("pointermove", up)
          window.addEventListener(
            "pointerup",
            () => {
              window.removeEventListener("pointermove", up)
            },
            { once: true },
          )
        }}
      />
      <label className="block text-sm">
        <span className="text-[#6b645c]">{ru.branding.color}</span>
        <input
          type="range"
          min={0}
          max={360}
          value={Math.round(hsv.h)}
          onChange={(event) => setHex(hsvToHex(Number(event.target.value), hsv.s || 1, hsv.v || 1))}
          className="mt-2 w-full"
          style={{ accentColor: `hsl(${hsv.h} 80% 45%)` }}
        />
      </label>
      <label className="block text-sm">
        <span className="text-[#6b645c]">{ru.branding.hex}</span>
        <input
          value={draft}
          onChange={(event) => setHex(event.target.value)}
          className="mt-1 h-11 w-full border border-[#1c1915]/15 bg-transparent px-3 font-mono uppercase"
        />
      </label>
      <p className="text-sm text-[#5f584f]">
        {ru.branding.contrast}: {ru.branding.button} {tokens.buttonContrast.toFixed(1)}:1 · {ru.branding.text}{" "}
        {tokens.textContrast.toFixed(1)}:1
      </p>
      <div className="flex gap-2">
        <span className="inline-flex h-11 items-center px-4 text-sm" style={{ background: tokens.buttonBg, color: tokens.buttonText }}>
          {ru.store.add}
        </span>
        <span className="inline-flex h-11 items-center px-4 text-sm" style={{ color: tokens.text }}>
          {ru.branding.text}
        </span>
      </div>
    </div>
  )
}
