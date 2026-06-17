'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { api } from '@/lib/api-client'

const NAV = [
  { href: '/admin/artworks', label: '作品集管理' },
  { href: '/admin/about', label: '關於我' },
  { href: '/admin/booking-rules', label: '預約須知' },
  { href: '/admin/announcements', label: '公告欄' },
  { href: '/admin/studio-photos', label: '工作室環境照' },
  { href: '/admin/pricing', label: '估價設定' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (pathname === '/admin/login') {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    )
  }

  const logout = async () => {
    await api('/api/auth', { method: 'DELETE' }).catch(() => {})
    router.push('/admin/login')
  }

  const NavLinks = () => (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = pathname.startsWith(n.href)
        return (
          <a
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`px-4 py-2.5 rounded-lg text-sm transition-colors ${
              active ? 'bg-cream text-ink' : 'text-cream/70 hover:bg-white/5'
            }`}
          >
            {n.label}
          </a>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-ink text-cream flex flex-col md:flex-row">
      {/* 手機頂列 */}
      <div className="md:hidden flex items-center justify-between px-5 h-14 border-b border-white/10">
        <span className="font-body font-semibold tracking-tight">彈塗魚 後台</span>
        <button onClick={() => setOpen((v) => !v)} className="text-cream/80 text-sm">
          {open ? '✕ 關閉' : '☰ 選單'}
        </button>
      </div>

      {/* 側邊欄 */}
      <aside
        className={`md:w-60 md:shrink-0 md:h-screen md:sticky md:top-0 border-r border-white/10 px-4 py-6 flex-col justify-between ${
          open ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div>
          <a href="/admin/artworks" className="hidden md:block font-body font-semibold text-lg tracking-tight px-4 mb-8">
            彈塗魚 後台
          </a>
          <NavLinks />
        </div>
        <div className="mt-8 flex flex-col gap-1 px-1">
          <a href="/" target="_blank" className="px-3 py-2 text-xs text-cream/50 hover:text-cream/80">
            ↗ 查看前台
          </a>
          <button
            onClick={logout}
            className="px-3 py-2 text-left text-xs text-cream/50 hover:text-cream/80"
          >
            登出
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-5xl">{children}</main>
      <Toaster position="top-center" />
    </div>
  )
}
