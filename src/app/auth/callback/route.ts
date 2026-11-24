import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = url.searchParams.get("next") || "/cabinet"
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/cabinet"
  const supabase = await createClient()
  if (!supabase) return NextResponse.redirect(new URL("/login?error=auth", url.origin))

  const code = url.searchParams.get("code")
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin))
  }

  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type")
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    })
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin))
  }

  return NextResponse.redirect(new URL("/login?error=auth", url.origin))
}
