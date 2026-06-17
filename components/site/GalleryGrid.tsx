'use client'
import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Artwork, GalleryCategory } from '@/lib/types'
import { GALLERY_CATEGORY_LABELS, GALLERY_CATEGORIES } from '@/lib/types'

type Filter = 'all' | GalleryCategory

const TABS: { value: Filter; label: string }[] = [
  { value: 'all', label: '全部' },
  ...GALLERY_CATEGORIES.map((c) => ({ value: c as Filter, label: GALLERY_CATEGORY_LABELS[c] })),
]

export default function GalleryGrid({ artworks }: { artworks: Artwork[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [lightbox, setLightbox] = useState<Artwork | null>(null)

  const filtered = filter === 'all' ? artworks : artworks.filter((a) => a.category === filter)

  return (
    <section className="bg-ink min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display italic text-5xl md:text-6xl text-cream text-center mb-2">
          作品集
        </h1>
        <p className="font-display italic text-sage text-xl text-center mb-12">gallery</p>

        {/* 篩選 Tab */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={`ftab px-5 py-2 rounded-full border text-sm transition-colors ${
                filter === t.value
                  ? 'bg-cream border-cream text-ink'
                  : 'border-white/15 text-cream/70 hover:border-cream/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 整齊等比網格（nico 風格） */}
        {filtered.length === 0 ? (
          <p className="text-center font-body text-warm-gray py-20">
            此分類目前尚無作品。
          </p>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((art) => (
                <motion.button
                  key={art.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  onClick={() => setLightbox(art)}
                  className="port-item aspect-[4/5] block w-full bg-warm-gray/15"
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

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 text-cream text-3xl"
              aria-label="關閉"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            <motion.div
              className="relative max-w-3xl max-h-[85vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.image_url}
                alt={lightbox.title || GALLERY_CATEGORY_LABELS[lightbox.category]}
                width={1200}
                height={1600}
                className="max-h-[85vh] w-auto h-auto object-contain"
              />
              {lightbox.title && (
                <p className="text-center font-body text-cream/80 mt-3">
                  {GALLERY_CATEGORY_LABELS[lightbox.category]}・{lightbox.title}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
