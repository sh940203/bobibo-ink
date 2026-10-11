import type { Announcement } from '@/lib/types'

export default function Footer({ announcement }: { announcement: Announcement | null }) {
  const year = new Date().getFullYear()
  return (
    <footer className="relative bg-ink border-t border-white/10 overflow-hidden">
      {/* 背景超大半透明品牌字 */}
      <span
        className="pointer-events-none select-none absolute -bottom-10 left-1/2 -translate-x-1/2 font-body font-bold text-cream/[0.03] text-[26vw] leading-none whitespace-nowrap tracking-tighter"
        aria-hidden
      >
        彈塗魚
      </span>

      <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-12">
        {/* 品牌 */}
        <div>
          <p className="font-body font-semibold text-cream text-3xl tracking-[-0.02em] leading-none">
            彈塗魚
          </p>
          <p className="font-display italic text-sage text-xl mt-2">tattoo 魚</p>
        </div>

        {/* 導覽 */}
        <div className="flex flex-col gap-3 font-body text-sm text-cream/70">
          <a href="/#about" className="hover:text-sage transition-colors w-fit">關於</a>
          <a href="/gallery" className="hover:text-sage transition-colors w-fit">作品集</a>
          <a href="/#booking" className="hover:text-sage transition-colors w-fit">預約須知</a>
          <a href="/#inquiry" className="hover:text-sage transition-colors w-fit">詢價</a>
        </div>

        {/* 聯絡 / 地址 */}
        <div className="font-body text-sm text-cream/70 space-y-3">
          <a
            href="https://line.me/R/ti/p/@749jttct"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-sage transition-colors"
          >
            ◎ LINE 官方帳號 @749jttct
          </a>
          <a
            href="https://www.instagram.com/bobibo_ink"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-sage transition-colors"
          >
            ◎ Instagram @bobibo_ink
          </a>
          <a
            href="http://xhslink.com/m/AADOBWCLBis"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-sage transition-colors"
          >
            ◎ 小紅書 彈塗魚tattoo
          </a>
          <p className="leading-relaxed">
            {announcement?.studio_city || '彰化縣員林市'}<br />
            {announcement?.studio_desc || '近員林火車站，居家工作室（採預約制）'}
          </p>
          {announcement?.is_visible === 1 && announcement.message && (
            <p className="text-warm-gray text-xs leading-relaxed border-l-2 border-sage/40 pl-3">
              {announcement.message}
            </p>
          )}
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <p className="max-w-6xl mx-auto px-6 py-6 font-body text-xs text-warm-gray text-center">
          © {year} 彈塗魚・tattoo 魚. All rights reserved.
        </p>
        <p className="max-w-6xl mx-auto px-6 pb-6 font-body text-xs text-warm-gray/50 text-center">
          Produced by{' '}
          <a
            href="https://sh-studio.huhu940203.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sage transition-colors"
          >
            @SH Studio
          </a>
        </p>
      </div>
    </footer>
  )
}
