import Link from "next/link"
import { ru } from "@/i18n/ru"

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-[#6b645c]">{ru.brand}</p>
        <h1 className="mt-3 font-serif text-4xl">{ru.store.notFoundTitle}</h1>
        <Link href="/" className="mt-6 inline-flex h-11 items-center bg-[#1c1915] px-5 text-sm text-[#f6f3ee]">
          {ru.store.home}
        </Link>
      </div>
    </main>
  )
}
