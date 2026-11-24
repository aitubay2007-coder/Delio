import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { Onboarding } from "@/components/auth/onboarding"
import { createClient } from "@/lib/supabase/server"
import { ru } from "@/i18n/ru"

export const instant = false
export const metadata = { title: ru.onboard.title, robots: { index: false, follow: false } }

export default function Page() {
  return (
    <Suspense fallback={<p className="p-8 text-sm">{ru.onboard.saving}</p>}>
      <Gate />
    </Suspense>
  )
}

async function Gate() {
  await connection()
  const supabase = await createClient()
  if (!supabase) return <p className="p-8 text-sm">{ru.cabinet.setupText}</p>
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) redirect("/login")
  const { data: store, error } = await supabase.from("stores").select("id").eq("owner_id", data.claims.sub).maybeSingle()
  if (error) return <p className="p-8 text-sm">{ru.cabinet.setupText}</p>
  if (store) redirect("/cabinet")
  return <Onboarding />
}
