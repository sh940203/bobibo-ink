'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { useScroll } from 'framer-motion'
import type { AboutContent, StudioPhoto, Announcement } from '@/lib/types'
import RevealText from './RevealText'

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
  // 桌機：220vh 釘選範圍；逐字亮起綁定此進度（畫面固定、滑動才亮）
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })

  return (
    <>
      {/* 釘選介紹區（桌機 sticky；手機正常流動） */}
      <section
        id="about"
        ref={pinRef}
        className="bg-white text-ink md:h-[220vh]"
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
                  revealRange={[0.05, 0.85]}
                  className="font-body font-light leading-relaxed text-ink max-w-md"
                  paragraphClassName="mb-4 last:mb-0"
                />
              ) : (
                <p className="font-body font-light text-warm-gray max-w-md">
                  （品牌故事文字將由 Admin 後台編輯）
                </p>
              )}
              <a href="/#inquiry" className="btn-fill font-body mt-8 !border-ink !text-ink">
                預約詢價 →
              </a>
            </div>

            {/* 右欄照片堆疊 */}
            <div className="flex justify-center">
              <div className="photo-stack relative w-64 h-80 md:w-80 md:h-96">
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
                          <Image
                            src={photo.image_url}
                            alt={`工作室環境照 ${i + 1}`}
                            fill
                            sizes="320px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-warm-gray text-xs">
                            工作室照 {i + 1}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 工作室位置（一般流動，介紹結束後出現） */}
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
