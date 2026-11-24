"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { ru } from "@/i18n/ru"

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="content" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-16">
      <Link href="/" className="text-sm text-[#6b645c]">{ru.auth.back}</Link>
      <h1 className="mt-6 font-serif text-4xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </main>
  )
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function LoginScreen({ error }: { error?: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState(error ? ru.auth.authError : "")
  const [pending, setPending] = useState(false)

  return (
    <Shell title={ru.auth.loginTitle}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!emailOk(email)) return setMessage(ru.auth.invalidEmail)
          setPending(true)
          setMessage("")
          const { error: authError } = await createClient().auth.signInWithPassword({ email, password })
          setPending(false)
          if (authError) return setMessage(ru.auth.authError)
          router.push("/cabinet")
          router.refresh()
        }}
      >
        <Label htmlFor="email">{ru.auth.email}</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" />
        <Label htmlFor="password">{ru.auth.password}</Label>
        <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
        {message && <p className="text-sm text-[#9d3b32]">{message}</p>}
        <Button type="submit" disabled={pending} className="h-11 w-full">{ru.auth.submitLogin}</Button>
      </form>
      <div className="mt-6 flex justify-between text-sm">
        <Link href="/reset">{ru.auth.forgot}</Link>
        <Link href="/signup">{ru.auth.noAccount}</Link>
      </div>
    </Shell>
  )
}

export function SignupScreen() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [again, setAgain] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <Shell title={ru.auth.signupTitle}>
        <p className="text-sm leading-6">{ru.auth.checkEmail}</p>
      </Shell>
    )
  }

  return (
    <Shell title={ru.auth.signupTitle}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!emailOk(email)) return setMessage(ru.auth.invalidEmail)
          if (password.length < 8) return setMessage(ru.auth.passwordHint)
          if (password !== again) return setMessage(ru.auth.mismatch)
          setPending(true)
          setMessage("")
          const origin = window.location.origin
          const { data, error } = await createClient().auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
          })
          setPending(false)
          if (error) return setMessage(ru.auth.authError)
          if (data.session) {
            router.push("/onboarding")
            router.refresh()
            return
          }
          setSent(true)
        }}
      >
        <Label htmlFor="email">{ru.auth.email}</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" />
        <Label htmlFor="password">{ru.auth.password}</Label>
        <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
        <p className="text-xs text-[#6b645c]">{ru.auth.passwordHint}</p>
        <Label htmlFor="again">{ru.auth.passwordAgain}</Label>
        <Input id="again" type="password" autoComplete="new-password" value={again} onChange={(event) => setAgain(event.target.value)} className="h-11" />
        {message && <p className="text-sm text-[#9d3b32]">{message}</p>}
        <Button type="submit" disabled={pending} className="h-11 w-full">{ru.auth.submitSignup}</Button>
      </form>
      <p className="mt-6 text-sm">
        <Link href="/login">{ru.auth.haveAccount}</Link>
      </p>
    </Shell>
  )
}

export function ResetScreen() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  return (
    <Shell title={ru.auth.resetTitle}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (!emailOk(email)) return setMessage(ru.auth.invalidEmail)
          setPending(true)
          await createClient().auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
          })
          setPending(false)
          setMessage(ru.auth.resetSent)
        }}
      >
        <Label htmlFor="email">{ru.auth.email}</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11" />
        {message && <p className="text-sm leading-6">{message}</p>}
        <Button type="submit" disabled={pending} className="h-11 w-full">{ru.auth.submitReset}</Button>
      </form>
    </Shell>
  )
}

export function UpdatePasswordScreen() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)

  return (
    <Shell title={ru.auth.resetTitle}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          if (password.length < 8) return setMessage(ru.auth.passwordHint)
          setPending(true)
          const { error } = await createClient().auth.updateUser({ password })
          setPending(false)
          if (error) return setMessage(ru.auth.authError)
          router.push("/cabinet")
          router.refresh()
        }}
      >
        <Label htmlFor="password">{ru.auth.password}</Label>
        <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11" />
        {message && <p className="text-sm text-[#9d3b32]">{message}</p>}
        <Button type="submit" disabled={pending} className="h-11 w-full">{ru.auth.submitPassword}</Button>
      </form>
    </Shell>
  )
}
