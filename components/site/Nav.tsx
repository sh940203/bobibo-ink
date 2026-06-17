'use client'
import { useEffect, useState } from 'react'

const LINKS = [
  { label: '關於', href: '/#about' },
  { label: '作品集', href: '/gallery' },
  { label: '預約須知', href: '/#booking' },
  { label: '詢價', href: '/#inquiry' },
]

function NavLink({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} className="nav-link-wrap font-body text-sm tracking-wider">
      <span className="first">{label}</span>
      <span className="second">{label}</span>
    </a>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-[background,backdrop-filter] duration-[400ms]"
      style={
        scrolled
          ? { background: 'rgba(17,17,16,0.85)', backdropFilter: 'blur(12px)' }
          : { background: 'transparent' }
      }
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          className="font-body font-semibold text-xl tracking-[-0.02em] text-cream leading-none"
        >
          彈塗魚•tattoo魚
        </a>

        {/* 桌機連結 */}
        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </div>

        {/* 漢堡 */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="選單"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="block w-6 h-px bg-cream transition-transform"
            style={open ? { transform: 'translateY(6px) rotate(45deg)' } : undefined}
          />
          <span
            className="block w-6 h-px bg-cream transition-opacity"
            style={open ? { opacity: 0 } : undefined}
          />
          <span
            className="block w-6 h-px bg-cream transition-transform"
            style={open ? { transform: 'translateY(-6px) rotate(-45deg)' } : undefined}
          />
        </button>
      </nav>

      {/* 手機選單 */}
      {open && (
        <div className="md:hidden bg-ink/95 backdrop-blur-md border-t border-white/10">
          <div className="flex flex-col px-6 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="font-body text-base tracking-wider py-3 border-b border-white/5 last:border-0"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
