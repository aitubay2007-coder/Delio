import type { Metadata, Viewport } from "next"
import { Manrope, Onest } from "next/font/google"
import { ru } from "@/i18n/ru"
import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-manrope",
  display: "swap",
})

const onest = Onest({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-onest",
  display: "swap",
})

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43123"

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: ru.meta.title, template: "%s · Витрина" },
  description: ru.meta.description,
  applicationName: ru.brand,
  appleWebApp: { capable: true, title: ru.brand, statusBarStyle: "default" },
}

export const viewport: Viewport = {
  themeColor: "#f3efe8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${onest.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f3efe8] text-[#1c1915]">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[#1c1915] focus:px-3 focus:py-2 focus:text-[#f6f3ee]"
        >
          {ru.a11y.skip}
        </a>
        {children}
        <PwaRegister />
      </body>
    </html>
  )
}
