'use client'
import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Artwork, GalleryCategory } from '@/lib/types'
import { GALLERY_CATEGORY_LABELS, GALLERY_CATEGORIES } from '@/lib/types'

type CatFilter = 'all' | GalleryCategory

export default function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
  const [catFilter, setCatFilter] = useState<CatFilter>('all')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)

  // collect all unique tags across artworks
  const allTags = Array.from(
    new Set(
      artworks.flatMap((a) => {
        try { return a.tags ? (JSON.parse(a.tags) as string[]) : [] }
        catch { return [] }
      })
    )
  ).sort()

  const filtered = artworks.filter((a) => {
    const catOk = catFilter === 'all' || a.category === catFilter
    const tagOk = !tagFilter || (() => {
      try { return a.tags ? (JSON.parse(a.tags) as string[]).includes(tagFilter) : false }
      catch { return false }
    })()
    return catOk && tagOk
  })

  const openAt = (idx: number) => setLightboxIdx(idx)
  const close   = () => setLightboxIdx(null)
  const prev    = useCallback(() => setLightboxIdx((i) => i === null ? null : (i - 1 + filtered.length) % filtered.length), [filtered.length])
  const next    = useCallback(() => setLightboxIdx((i) => i === null ? null : (i + 1) % filtered.length), [filtered.length])

  useEffect(() => {
    if (lightboxIdx === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIdx, prev, next])

  const lightbox = lightboxIdx !== null ? filtered[lightboxIdx] : null

  return (
    <section className="bg-ink min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display italic text-5xl md:text-6xl text-cream text-center mb-2">作品集</h1>
        <p className="font-display italic text-sage text-xl text-center mb-10">gallery</p>

        {/* 分類 Tab */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {(['all', ...GALLERY_CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => { setCatFilter(c); setTagFilter(null) }}
              className={`ftab px-5 py-2 rounded-full border text-sm transition-colors ${
                catFilter === c && !tagFilter
                  ? 'bg-cream border-cream text-ink'
                  : 'border-white/15 text-cream/70 hover:border-cream/60'
              }`}
            >
              {c === 'all' ? '全部' : GALLERY_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {/* 自訂標籤 */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => { setTagFilter(tagFilter === tag ? null : tag); setCatFilter('all') }}
                className={`px-4 py-1.5 rounded-full border text-xs transition-colors ${
                  tagFilter === tag
                    ? 'bg-sage border-sage text-white'
                    : 'border-white/15 text-cream/50 hover:border-cream/40'
                }`}
              >
                # {tag}
              </button>
            ))}
          </div>
        )}

        {/* 作品格 */}
        {filtered.length === 0 ? (
          <p className="text-center font-body text-warm-gray py-20">此分類目前尚無作品。</p>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((art, idx) => (
                <motion.button
                  key={art.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => openAt(idx)}
                  className="port-item aspect-[4/5] block w-full bg-warm-gray/15 relative"
                >
                  <Image
                    src={art.image_url}
                    alt={art.title || GALLERY_CATEGORY_LABELS[art.category]}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    className="port-bg object-cover"
                  />
                  <div className="port-label absolute bottom-2.5 left-2.5">
                    <span className="tape-label">{GALLERY_CATEGORY_LABELS[art.category]}</span>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox — 沈靜式全屏體驗 */}
      <AnimatePresence>
        {lightbox && lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#0a0a0a] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
          >
            {/* 關閉 — 右上角極簡 */}
            <button
              className="absolute top-6 right-6 z-20 text-white/30 hover:text-white/80 transition-colors duration-300 text-sm tracking-widest font-body"
              onClick={close}
              aria-label="關閉"
            >
              ESC
            </button>

            {/* 頁碼 — 左上角 */}
            <div className="absolute top-6 left-6 z-20 font-body text-xs text-white/25 tracking-widest">
              {String(lightboxIdx + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
            </div>

            {/* 圖片 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={lightbox.id}
                className="relative flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={lightbox.image_url}
                  alt={lightbox.title || GALLERY_CATEGORY_LABELS[lightbox.category]}
                  width={1200}
                  height={1600}
                  className="max-h-[88vh] max-w-[88vw] md:max-w-[56vw] w-auto h-auto object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* 底部資訊 + 導覽 */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-8 pb-8 pt-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
              <div className="font-body">
                {lightbox.title && (
                  <p className="text-white/60 text-sm">{lightbox.title}</p>
                )}
                <p className="text-white/25 text-xs mt-0.5">{GALLERY_CATEGORY_LABELS[lightbox.category]}</p>
              </div>

              {/* 前後按鈕 */}
              <div className="flex gap-4 pointer-events-auto">
                <button
                  onClick={(e) => { e.stopPropagation(); prev() }}
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/90 transition-colors duration-300 border border-white/10 hover:border-white/30 rounded-full text-lg"
                  aria-label="上一張"
                >←</button>
                <button
                  onClick={(e) => { e.stopPropagation(); next() }}
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/90 transition-colors duration-300 border border-white/10 hover:border-white/30 rounded-full text-lg"
                  aria-label="下一張"
                >→</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
