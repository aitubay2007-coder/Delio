import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { isTemplate } from "@/lib/catalog"
import { normalizeHex } from "@/lib/color"
import { loadStore } from "@/lib/data"
import { Storefront } from "@/components/storefront/storefront"
import { ru } from "@/i18n/ru"
import type { TemplateId } from "@/lib/types"

export const instant = false

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ template?: string; color?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bundle = await loadStore(slug)
  if (!bundle) return { title: ru.store.notFoundTitle }
  const description = `${bundle.store.name}. ${ru.hero.subtitle}`
  return {
    title: bundle.store.name,
    description,
    openGraph: { title: bundle.store.name, description, type: "website" },
  }
}

export default function Page({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<StoreSkeleton />}>
      <StoreBody params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function StoreBody({ params, searchParams }: Props) {
  const { slug } = await params
  const query = await searchParams
  const bundle = await loadStore(slug)
  if (!bundle) notFound()
  const demo = bundle.source === "fixture" || bundle.store.is_demo
  const template = demo && query.template && isTemplate(query.template) ? (query.template as TemplateId) : undefined
  const accent = demo && query.color ? normalizeHex(`#${query.color.replace("#", "")}`) ?? undefined : undefined
  return (
    <main id="content">
      <Storefront bundle={bundle} template={template} accent={accent ?? undefined} />
    </main>
  )
}

function StoreSkeleton() {
  return (
    <div className="min-h-dvh bg-[#FAF7F2] px-4 pt-8">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-4 h-8 w-48" />
      <div className="mt-8 grid gap-4">
        <div className="skeleton aspect-[4/5]" />
        <div className="skeleton h-6 w-40" />
        <div className="skeleton aspect-[4/5]" />
      </div>
    </div>
  )
}
