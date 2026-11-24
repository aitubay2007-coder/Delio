import { Suspense } from "react"
import { CabinetApp } from "@/components/cabinet/cabinet-app"
import { fixtureBundle, previewEvents, previewOrders } from "@/lib/fixtures"
import { ru } from "@/i18n/ru"

export const instant = false
export const metadata = { title: ru.cabinet.overview, robots: { index: false, follow: false } }

export default function Page() {
  const bundle = fixtureBundle()
  return (
    <Suspense fallback={<p className="p-8 text-sm">{ru.cabinet.saving}</p>}>
    <CabinetApp
      mode="preview"
      base="/preview/cabinet"
      email=""
      store={bundle.store}
      categories={bundle.categories}
      products={bundle.products}
      covers={bundle.covers}
      orders={previewOrders()}
      events={previewEvents()}
      eventsCapped={false}
    />
    </Suspense>
  )
}
