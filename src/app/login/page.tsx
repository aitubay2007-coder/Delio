import { Suspense } from "react"
import { LoginScreen } from "@/components/auth/auth-screens"
import { ru } from "@/i18n/ru"

export const metadata = { title: ru.auth.loginTitle }

export default function Page({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-sm">{ru.auth.loginTitle}</p>}>
      <LoginBody searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginBody({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams
  return <LoginScreen error={query.error} />
}
