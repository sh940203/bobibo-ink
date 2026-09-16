'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import type { AboutContent, StudioPhoto, Announcement } from '@/lib/types'
import RevealText from './RevealText'

// 輪播：單張工作室照片，依 scrollYProgress 決定出現時機
function CarouselSlide({
  photo, idx, total, progress,
}: {
  photo: StudioPhoto; idx: number; total: number; progress: MotionValue<number>
}) {
  const PHASE_START = 0.5
  const PHASE_END   = 1.0
  const step  = (PHASE_END - PHASE_START) / total
  const start = PHASE_START + idx * step
  const end   = PHASE_START + (idx + 1) * step
  const isLast = idx === total - 1

  const opacity = useTransform(
    progress,
    isLast
      ? [start, start + 0.04, 1.0]
      : [start, start + 0.04, end - 0.04, end],
    isLast ? [0, 1, 1] : [0, 1, 1, 0],
  )
  const scale = useTransform(progress, [start, end], [0.96, 1])

  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 rounded-xl overflow-hidden">
      <Image src={photo.image_url} alt={`工作室 ${idx + 1}`} fill sizes="480px" className="object-cover" />
    </motion.div>
  )
}

// 右下角頁碼指示器
function SlideCounter({ total, progress }: { total: number; progress: MotionValue<number> }) {
  return (
    <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
      {Array.from({ length: total }).map((_, i) => {
        const PHASE_START = 0.5
        const step  = 0.5 / total
        const start = PHASE_START + i * step
        const end   = start + step
        const dotOpacity = useTransform(progress, [start, start + 0.03, end - 0.03, end], [0.3, 1, 1, 0.3])
        return (
          <motion.span
            key={i}
            style={{ opacity: dotOpacity }}
            className="block w-1.5 h-1.5 rounded-full bg-white"
          />
        )
      })}
    </div>
  )
}

export default function About({
  about,
  photos,
  announcement,
}: {
  about: AboutContent | null
  photos: StudioPhoto[]
  announcement: Announcement | null
}) {
  const rotations = ['-3deg', '4deg', '-1.5deg']
  const pinRef = useRef<HTMLDivElement>(null)
  const [mobileSlide, setMobileSlide] = useState(0)
  const mobileTotal = photos.length

  // 整個釘選區的捲動進度（0→1 = 0→380vh）
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })

  // 第一階段（0→0.5）文字亮起；第二階段（0.5→1.0）照片輪播
  const stackOpacity    = useTransform(scrollYProgress, [0.38, 0.50], [1, 0])
  const carouselOpacity = useTransform(scrollYProgress, [0.46, 0.54], [0, 1])

  const hasPhotos = photos.length > 0

  return (
    <>
      {/* 釘選介紹區 */}
      <section
        id="about"
        ref={pinRef}
        className="bg-white text-ink md:h-[380vh]"
      >
        <div className="md:sticky md:top-0 md:h-screen flex items-center py-24 md:py-0 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 md:gap-16 items-center w-full">

            {/* 左欄文字 */}
            <div>
              <p className="font-body text-xs tracking-[0.3em] uppercase text-warm-gray mb-6">
                ✦ Philosophy
              </p>
              <h2 className="font-display italic text-4xl md:text-5xl leading-tight mb-8">
                為你刻下
                <br />
                獨一無二的痕跡
              </h2>
              {about?.body_text ? (
                <RevealText
                  text={about.body_text}
                  progress={scrollYProgress}
                  revealRange={[0.03, 0.42]}
                  className="font-body font-light leading-relaxed text-ink max-w-md"
                  paragraphClassName="mb-4 last:mb-0"
                />
              ) : (
                <p className="font-body font-light text-warm-gray max-w-md">
                  （品牌故事文字將由 Admin 後台編輯）
                </p>
              )}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-8">
                <a
                  href="https://line.me/R/ti/p/@749jttct"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-fill font-body !border-ink !text-ink"
                >
                  ◎ LINE 官方帳號
                </a>
                <a
                  href="https://www.instagram.com/bobibo_ink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-fill font-body !border-ink !text-ink"
                >
                  ◎ Instagram @bobibo_ink
                </a>
                <a
                  href="http://xhslink.com/m/AADOBWCLBis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-fill font-body !border-ink !text-ink"
                >
                  ◎ 小紅書 彈塗魚tattoo
                </a>
              </div>
            </div>

            {/* 右欄 */}
            <div className="flex flex-col items-center gap-4">

              {/* ── 手機：點擊輪播 ── */}
              {hasPhotos && mobileTotal > 0 && (
                <div className="md:hidden relative w-64 h-80 polaroid overflow-hidden rounded-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={mobileSlide}
                      className="absolute inset-0"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Image
                        src={photos[mobileSlide].image_url}
                        alt={`工作室 ${mobileSlide + 1}`}
                        fill
                        sizes="256px"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  {/* 左右箭頭 */}
                  <button
                    onClick={() => setMobileSlide((s) => (s - 1 + mobileTotal) % mobileTotal)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-lg"
                  >‹</button>
                  <button
                    onClick={() => setMobileSlide((s) => (s + 1) % mobileTotal)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center text-lg"
                  >›</button>
                  {/* 點指示器 */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setMobileSlide(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mobileSlide ? 'bg-white' : 'bg-white/40'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── 桌機：捲動堆疊 → 輪播 ── */}
              <div className="hidden md:flex justify-center">
                <div className="relative w-80 h-96">
                  {/* 堆疊（文字階段逐漸淡出） */}
                  <motion.div style={{ opacity: stackOpacity }} className="absolute inset-0 photo-stack">
                    {[0, 1, 2].map((i) => {
                      const photo = photos[i]
                      return (
                        <div
                          key={i}
                          className={`photo photo-${i + 1} absolute inset-0 polaroid`}
                          style={{ transform: `rotate(${rotations[i]})`, zIndex: 3 - i }}
                        >
                          <div className="relative w-full h-full bg-warm-gray/20">
                            {photo ? (
                              <Image src={photo.image_url} alt={`工作室環境照 ${i + 1}`} fill sizes="320px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-warm-gray text-xs">工作室照 {i + 1}</div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </motion.div>
                  {/* 捲動輪播（照片階段淡入） */}
                  {hasPhotos && (
                    <motion.div style={{ opacity: carouselOpacity }} className="absolute inset-0 polaroid">
                      <div className="relative w-full h-full bg-warm-gray/20 rounded-xl overflow-hidden">
                        {photos.map((photo, i) => (
                          <CarouselSlide key={photo.id} photo={photo} idx={i} total={photos.length} progress={scrollYProgress} />
                        ))}
                        {photos.length > 1 && <SlideCounter total={photos.length} progress={scrollYProgress} />}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 工作室位置（一般流動） */}
      <section className="bg-white text-ink px-6 pb-24 md:pb-32">
        <div className="reveal max-w-6xl mx-auto">
          <div className="border border-ink/10 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-[auto_1fr]">
              <div className="flex items-start gap-4 px-7 py-6 bg-ink text-cream">
                <span className="text-sage text-xl leading-none mt-1">◎</span>
                <div>
                  <p className="font-body text-[11px] tracking-[0.25em] uppercase text-cream/55 mb-1">
                    Current Studio
                  </p>
                  <p className="font-body font-medium text-lg leading-snug">台中市龍井區</p>
                  <p className="font-body font-light text-sm text-cream/70 mt-0.5">
                    近東海商圈・居家工作室（採預約制）
                  </p>
                </div>
              </div>
              {announcement?.is_visible === 1 && announcement.message && (
                <div className="flex items-start gap-3 px-7 py-6 bg-paper">
                  <span className="text-warm-gray text-base leading-none mt-1">⚠</span>
                  <div>
                    <p className="font-body text-[11px] tracking-[0.25em] uppercase text-warm-gray mb-1">
                      Relocation
                    </p>
                    <p className="font-body font-light text-sm text-ink/75 leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
