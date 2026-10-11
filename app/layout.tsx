export const runtime = 'edge'

import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import './globals.css'
import { getAnnouncement } from '@/lib/queries'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const announcement = await getAnnouncement()
  const iconUrl = announcement?.favicon_url || '/favicon-default.jpg'
  return {
    title: '彈塗魚・tattoo 魚',
    description:
      '彈塗魚・tattoo 魚 — 居家工作室刺青師。寵物肖像、動漫人物、線條文字、客製化小圖。把它變成專屬於你的作品。',
    icons: { icon: iconUrl, apple: iconUrl },
    openGraph: {
      title: '彈塗魚・tattoo 魚',
      description: '把它變成專屬於你的作品。',
      type: 'website',
    },
  }
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
