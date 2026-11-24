"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ColorField } from "@/components/color/color-field"
import { defaultHours, defaultOrderForm, defaultZones } from "@/lib/catalog"
import { isE164, isReservedSlug, isValidSlug, slugify, toE164 } from "@/lib/format"
import { fileExtension } from "@/lib/media"
import { createClient } from "@/lib/supabase/client"
import { ru } from "@/i18n/ru"
import { NICHES, TEMPLATES, type NicheId, type TemplateId } from "@/lib/types"

export function Onboarding() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [niche, setNiche] = useState<NicheId>("flowers")
  const [prefix, setPrefix] = useState("+7")
  const [national, setNational] = useState("")
  const [logo, setLogo] = useState<File | null>(null)
  const [template, setTemplate] = useState<TemplateId>("minimal")
  const [color, setColor] = useState("#B78268")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const phone = toE164(prefix, national)
  const link = useMemo(() => `/s/${slug || "…"}`, [slug])

  async function slugFree(value: string) {
    const { data, error } = await createClient().from("stores").select("id").eq("slug", value).maybeSingle()
    if (error) throw error
    return !data
  }

  async function next() {
    setMessage("")
    if (step === 0) {
      if (name.trim().length < 2) return setMessage(ru.onboard.name)
      if (!isValidSlug(slug)) return setMessage(ru.onboard.slugInvalid)
      if (isReservedSlug(slug)) return setMessage(ru.onboard.slugReserved)
      setPending(true)
      try {
        if (!(await slugFree(slug))) return setMessage(ru.onboard.slugTaken)
      } catch {
        return setMessage(ru.onboard.error)
      } finally {
        setPending(false)
      }
    }
    if (step === 2 && !isE164(phone)) return setMessage(ru.onboard.phoneInvalid)
    setStep((value) => Math.min(5, value + 1))
  }

  async function finish() {
    setPending(true)
    setMessage("")
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("stores")
        .insert({
          name: name.trim(),
          slug,
          niche,
          whatsapp_e164: phone,
          address: "",
          working_hours: defaultHours(),
          delivery_enabled: true,
          pickup_enabled: true,
          delivery_zones: defaultZones(),
          min_order: 0,
          template,
          accent_color: color,
          order_form: defaultOrderForm(niche),
        })
        .select("id")
        .single()
      if (error || !data) throw error ?? new Error("insert")
      if (logo) {
        const ext = fileExtension(logo)
        if (ext) {
          const path = `${data.id}/logo/${crypto.randomUUID()}.${ext}`
          const uploaded = await supabase.storage.from("store-media").upload(path, logo, { contentType: logo.type })
          if (!uploaded.error) {
            await supabase.from("stores").update({ logo_path: path }).eq("id", data.id)
          }
        }
      }
      router.push("/cabinet")
      router.refresh()
    } catch {
      setMessage(ru.onboard.error)
      setPending(false)
    }
  }

  return (
    <main id="content" className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-10">
      <p className="text-xs tracking-[0.16em] uppercase text-[#6b645c]">{ru.brand}</p>
      <h1 className="mt-3 font-serif text-4xl">{ru.onboard.title}</h1>
      <p className="mt-2 text-sm text-[#6b645c]">
        {step + 1} / {ru.onboard.steps.length} · {ru.onboard.steps[step]}
      </p>
      <div className="mt-8 flex-1">
        {step === 0 && (
          <div className="space-y-4">
            <Label htmlFor="name">{ru.onboard.name}</Label>
            <Input
              id="name"
              value={name}
              className="h-11"
              onChange={(event) => {
                setName(event.target.value)
                if (!slugTouched) setSlug(slugify(event.target.value))
              }}
            />
            <Label htmlFor="slug">{ru.onboard.slug}</Label>
            <Input
              id="slug"
              value={slug}
              className="h-11"
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(slugify(event.target.value))
              }}
            />
            <p className="text-sm text-[#6b645c]">{link}</p>
            <p className="text-xs leading-5 text-[#6b645c]">{ru.onboard.slugHint}</p>
          </div>
        )}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {NICHES.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setNiche(id)}
                className="h-12 border text-sm"
                style={{ borderColor: niche === id ? "#1c1915" : "rgba(28,25,21,0.15)", background: niche === id ? "#1c1915" : "transparent", color: niche === id ? "#f6f3ee" : "#1c1915" }}
              >
                {ru.niches[id]}
              </button>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Label>{ru.onboard.whatsapp}</Label>
            <div className="flex gap-2">
              <Input value={prefix} onChange={(event) => setPrefix(event.target.value)} className="h-11 w-24" />
              <Input value={national} inputMode="numeric" onChange={(event) => setNational(event.target.value)} className="h-11" placeholder="700 000 00 00" />
            </div>
            <p className="text-sm text-[#6b645c]">{phone}</p>
            <p className="text-xs leading-5 text-[#6b645c]">{ru.onboard.whatsappHint}</p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <Label htmlFor="logo">{ru.onboard.logo}</Label>
            <Input id="logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setLogo(event.target.files?.[0] ?? null)} />
            <p className="text-sm text-[#6b645c]">{ru.onboard.logoSkip}</p>
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-2">
            {TEMPLATES.map((id) => (
              <button key={id} type="button" onClick={() => setTemplate(id)} className="border px-4 py-3 text-left" style={{ borderColor: template === id ? "#1c1915" : "rgba(28,25,21,0.15)" }}>
                <span className="block">{ru.templates[id].name}</span>
                <span className="text-sm text-[#6b645c]">{ru.templates[id].text}</span>
              </button>
            ))}
          </div>
        )}
        {step === 5 && <ColorField value={color} onChange={setColor} template={template} />}
      </div>
      {message && <p className="mt-4 text-sm text-[#9d3b32]">{message}</p>}
      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <Button type="button" variant="outline" className="h-11" onClick={() => setStep((value) => value - 1)}>
            {ru.onboard.back}
          </Button>
        )}
        {step < 5 ? (
          <Button type="button" className="h-11 flex-1" disabled={pending} onClick={() => void next()}>{ru.onboard.next}</Button>
        ) : (
          <Button type="button" className="h-11 flex-1" disabled={pending} onClick={() => void finish()}>
            {pending ? ru.onboard.saving : ru.onboard.finish}
          </Button>
        )}
      </div>
    </main>
  )
}
