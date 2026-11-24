import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"
import { ru } from "@/i18n/ru"
import { PwaRegister } from "@/components/pwa-register"
import "./globals.css"

const geist = Geist({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-geist",
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
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAF7F2] text-[#292524]">
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
