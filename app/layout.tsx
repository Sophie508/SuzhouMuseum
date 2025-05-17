import type React from "react"
import type { Metadata } from "next"
import { Inter, Noto_Serif_SC } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
})

export const metadata: Metadata = {
  title: "苏州博物馆 | Suzhou Museum",
  description: "探索苏州的文化宝藏和历史遗产",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerif.variable} font-sans`}>{children}</body>
    </html>
  )
}
