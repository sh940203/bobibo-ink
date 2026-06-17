'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import Image from 'next/image'
import type { Artwork } from '@/lib/types'

type WingPos = {
  x: number; y: number; r: number
  range: [number, number]
  defaultSrc: string; defaultAlt: string
}

const WING_POSITIONS: WingPos[] = [
  { x: -240, y: -140, r: -12, range: [0.04, 0.62], defaultSrc: '/images/personal/dog.jpg',    defaultAlt: '黃金獵犬' },
  { x: -300, y:   50, r:  -7, range: [0.10, 0.70], defaultSrc: '/images/personal/cat.jpg',    defaultAlt: '貓肖像' },
  { x: -215, y:  220, r: -15, range: [0.16, 0.78], defaultSrc: '/images/personal/animal.jpg', defaultAlt: '動物練習' },
  { x:  240, y: -140, r:  12, range: [0.07, 0.65], defaultSrc: '/images/personal/anime.jpg',  defaultAlt: '動漫人物' },
  { x:  300, y:   50, r:   7, range: [0.13, 0.73], defaultSrc: '/images/works/12.jpg',        defaultAlt: '蝴蝶與櫻花' },
  { x:  215, y:  220, r:  15, range: [0.19, 0.81], defaultSrc: '/images/works/8.jpg',         defaultAlt: '星與月' },
]

function WingPhoto({
  pos, src, alt, progress, factor,
}: {
  pos: WingPos; src: string; alt: string
  progress: MotionValue<number>; factor: number
}) {
  const x       = useTransform(progress, pos.range, [0, pos.x * factor])
  const y       = useTransform(progress, pos.range, [0, pos.y * factor])
  const rotate  = useTransform(progress, pos.range, [0, pos.r])
  const scale   = useTransform(progress, pos.range, [0.78, 1])
  const opacity = useTransform(progress, [pos.range[0], pos.range[0] + 0.08], [0, 1])

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        style={{ x, y, rotate, scale, opacity }}
        className="polaroid w-[19vw] max-w-[110px] sm:w-28 md:w-44"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image src={src} alt={alt} fill sizes="200px" className="object-cover grayscale" />
        </div>
      </motion.div>
    </div>
  )
}

export default function Hero({ heroPhotos = [] }: { heroPhotos?: Artwork[] }) {
  const pinRef = useRef<HTMLDivElement>(null)
  const [factor, setFactor] = useState(1)

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const polaroidHalf = Math.min(w * 0.19, 110) / 2
      const fit = (w / 2 - polaroidHalf - 12) / 300
      setFactor(Math.max(0.3, Math.min(1, fit)))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <section ref={pinRef} className="relative h-[260vh]" style={{ background: '#343434' }}>
      <div
        className="grain sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ background: '#343434' }}
      >
        <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 text-center z-[4] px-6">
          <p className="font-body font-semibold text-cream text-2xl md:text-3xl tracking-[-0.02em]">
            彈塗魚
          </p>
          <p className="font-display italic text-sage text-lg md:text-xl mt-1">tattoo 魚</p>
        </div>

        <div className="absolute inset-0 z-[2]">
          {WING_POSITIONS.map((pos, i) => {
            const photo = heroPhotos[i]
            return (
              <WingPhoto
                key={i}
                pos={pos}
                src={photo?.image_url ?? pos.defaultSrc}
                alt={photo?.title ?? pos.defaultAlt}
                progress={scrollYProgress}
                factor={factor}
              />
            )
          })}
        </div>

        <div className="relative z-[3] h-[32vh] sm:h-[44vh] md:h-[56vh] aspect-[1210/1330]">
          <Image
            src="/images/personal/portrait.jpg"
            alt="彈塗魚刺青師"
            fill
            priority
            sizes="(max-width: 768px) 60vw, 40vw"
            className="object-contain grayscale drop-shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          />
        </div>

        <p className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[4] font-body font-light text-cream/80 text-base md:text-lg text-center px-6">
          把它變成專屬於你的作品
        </p>

        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[4] flex flex-col items-center gap-2"
        >
          <span className="font-body text-[11px] tracking-[0.3em] text-cream/55">向下滑動展開作品</span>
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="text-cream/55 text-lg leading-none"
          >
            ↓
          </motion.span>
        </motion.div>
      </div>
    </section>
  )
}
