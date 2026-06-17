import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'

// 優雅襯線：僅用於 section 標題與少數英文點綴（modern-minimal 的對比角色）
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
})

// 主要字型：品牌字 / 標語 / 內文 / UI 一律 Inter，靠字重與字距做層次
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '彈塗魚・tattoo 魚',
  description:
    '彈塗魚・tattoo 魚 — 居家工作室刺青師。寵物肖像、動漫人物、線條文字、客製化小圖。把它變成專屬於你的作品。',
  openGraph: {
    title: '彈塗魚・tattoo 魚',
    description: '把它變成專屬於你的作品。',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-Hant">
      <body className={`${cormorant.variable} ${inter.variable}`}>
        {children}
      </body>
    </html>
  )
}
