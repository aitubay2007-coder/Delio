import { Suspense } from "react"
import { redirect } from "next/navigation"
import { CabinetApp } from "@/components/cabinet/cabinet-app"
import { loadOwnerCabinet } from "@/lib/data"
import { ru } from "@/i18n/ru"

export const instant = false
export const metadata = { title: ru.cabinet.overview, robots: { index: false, follow: false } }

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-sm">{ru.cabinet.saving}</p>}>
      <Loader />
    </Suspense>
  )
}

async function Loader() {
  const result = await loadOwnerCabinet()
  if (result.kind === "anonymous") redirect("/login")
  if (result.kind === "needs-onboarding") redirect("/onboarding")
  if (result.kind === "unconfigured" || result.kind === "error") {
    return (
      <main className="mx-auto max-w-lg px-5 py-16">
        <h1 className="font-serif text-3xl">{ru.cabinet.setupTitle}</h1>
        <p className="mt-3 text-sm leading-6">{ru.cabinet.setupText}</p>
        {result.kind === "error" && <p className="mt-3 text-xs text-[#6b645c]">{result.message}</p>}
      </main>
    )
  }
  return (
    <CabinetApp
      mode="live"
      base="/cabinet"
      email={result.email}
      store={result.store}
      categories={result.categories}
      products={result.products}
      covers={result.covers}
      orders={result.orders}
      events={result.events}
      eventsCapped={result.eventsCapped}
    />
  )
}
