import type { Metadata } from "next"
import { Fraunces, Source_Sans_3 } from "next/font/google"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { brand } from "@/lib/brand"
import "./globals.css"

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
})

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-face",
})

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.support,
  keywords: ["Lightning", "Swahili", "African languages", "Bitcoin", "Nostr Wallet Connect"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
