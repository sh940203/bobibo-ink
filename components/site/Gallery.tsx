'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import type { Artwork } from '@/lib/types'
import { GALLERY_CATEGORY_LABELS } from '@/lib/types'

function FeaturedItem({
  art,
  index,
  progress,
}: {
  art: Artwork
  index: number
  progress: MotionValue<number>
}) {
  // 逐張放大：依序錯開進度（畫面釘選時，滑動逐格微微放大）
  const start = 0.05 + index * 0.18
  const scale = useTransform(progress, [start, start + 0.4], [0.88, 1])
  const opacity = useTransform(progress, [start, start + 0.28], [0.3, 1])
  // 每格底光
  const glow = useTransform(progress, [start, start + 0.4], [0, 0.5])

  return (
    <motion.a href="/gallery" style={{ scale, opacity }} className="relative port-item aspect-[4/5] block">
      <motion.span
        aria-hidden
        style={{ opacity: glow }}
        className="pointer-events-none absolute -inset-3 rounded-xl"
      >
        <span
          className="absolute inset-0 rounded-xl"
          style={{ background: 'radial-gradient(closest-side, rgba(242,240,235,0.35), transparent)' }}
        />
      </motion.span>
      <span className="relative block w-full h-full bg-warm-gray/20 overflow-hidden">
        <Image
          src={art.image_url}
          alt={art.title || GALLERY_CATEGORY_LABELS[art.category]}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="port-bg object-cover"
        />
        <span className="port-label absolute bottom-3 left-3 z-10">
          <span className="tape-label">{GALLERY_CATEGORY_LABELS[art.category]}</span>
        </span>
      </span>
    </motion.a>
  )
}

// 首頁精選：桌機釘選，滑動時逐張放大、底色發光。
export default function Gallery({ featured }: { featured: Artwork[] }) {
  const items = featured.slice(0, 4)
  const placeholders = items.length === 0 ? [0, 1, 2, 3] : []
  const pinRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })
  const glow = useTransform(scrollYProgress, [0, 0.7], [0, 0.45])

  return (
    <section id="gallery" ref={pinRef} className="relative bg-ink md:h-[200vh]">
      <div className="md:sticky md:top-0 md:h-screen overflow-hidden flex items-center py-24 md:py-0 px-6">
        {/* 透光底色 */}
        <motion.div style={{ opacity: glow }} className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(242,240,235,0.14), transparent)' }}
          />
        </motion.div>

        <div className="relative z-[1] max-w-6xl mx-auto w-full">
          <p className="font-body text-xs tracking-[0.3em] uppercase text-warm-gray mb-4 text-center">
            ✦ Selected Works
          </p>
          <h2 className="font-display italic text-4xl md:text-5xl text-cream text-center mb-14">精選作品</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {items.map((art, i) => (
              <FeaturedItem key={art.id} art={art} index={i} progress={scrollYProgress} />
            ))}
            {placeholders.map((i) => (
              <div
                key={i}
                className="port-item aspect-[4/5] bg-warm-gray/15 flex items-center justify-center border border-white/5"
              >
                <span className="font-body text-xs text-warm-gray">精選 {i + 1}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/gallery" className="btn-fill font-body">
              查看全部作品 →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
