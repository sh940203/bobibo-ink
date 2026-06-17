'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import Image from 'next/image'

/**
 * 滾動釘選（pinned）主視覺：
 * - 第一屏：人物置中、固定不動
 * - 向下滑：個人首頁的作品以人物為中心像翅膀向外展開（slow，stagger）
 * - 繼續往下滑：釋放釘選，進入下一區
 * - 向上滑：作品收回人物後方（因為動畫綁定 scroll 進度，天然可逆）
 */

// 每張翅膀作品：相對中心的展開終點（base，會再乘上 RWD factor）
// range：在 0~1 滾動進度中各自的展開區段（製造 stagger）
type Wing = {
  src: string
  alt: string
  x: number
  y: number
  r: number
  range: [number, number]
}

const WINGS: Wing[] = [
  // 左翼
  { src: '/images/personal/dog.jpg', alt: '黃金獵犬', x: -240, y: -140, r: -12, range: [0.04, 0.62] },
  { src: '/images/personal/cat.jpg', alt: '貓肖像', x: -300, y: 50, r: -7, range: [0.1, 0.7] },
  { src: '/images/personal/animal.jpg', alt: '動物練習', x: -215, y: 220, r: -15, range: [0.16, 0.78] },
  // 右翼
  { src: '/images/personal/anime.jpg', alt: '動漫人物', x: 240, y: -140, r: 12, range: [0.07, 0.65] },
  { src: '/images/works/12.jpg', alt: '蝴蝶與櫻花', x: 300, y: 50, r: 7, range: [0.13, 0.73] },
  { src: '/images/works/8.jpg', alt: '星與月', x: 215, y: 220, r: 15, range: [0.19, 0.81] },
]

function WingPhoto({
  wing,
  progress,
  factor,
}: {
  wing: Wing
  progress: MotionValue<number>
  factor: number
}) {
  const x = useTransform(progress, wing.range, [0, wing.x * factor])
  const y = useTransform(progress, wing.range, [0, wing.y * factor])
  const rotate = useTransform(progress, wing.range, [0, wing.r])
  const scale = useTransform(progress, wing.range, [0.78, 1])
  const opacity = useTransform(progress, [wing.range[0], wing.range[0] + 0.08], [0, 1])

  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <motion.div
        style={{ x, y, rotate, scale, opacity }}
        className="polaroid w-[19vw] max-w-[110px] sm:w-28 md:w-44"
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <Image src={wing.src} alt={wing.alt} fill sizes="200px" className="object-cover grayscale" />
        </div>
      </motion.div>
    </div>
  )
}

export default function Hero() {
  const pinRef = useRef<HTMLDivElement>(null)
  const [factor, setFactor] = useState(1)

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ['start start', 'end end'],
  })

  // RWD：依視窗寬度縮放展開距離，確保翅膀在手機也能完整顯示（不超出邊界）
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      // 以最大水平展開量(約 300px)+ 半張作品寬，反推可用的縮放，避免被裁切
      const polaroidHalf = Math.min(w * 0.19, 110) / 2
      const fit = (w / 2 - polaroidHalf - 12) / 300
      setFactor(Math.max(0.3, Math.min(1, fit)))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // 滑動提示淡出
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    // 高度 = 釘選滾動距離。260vh → 約可滑動 160vh 來完成展開與停留
    // 背景色 = 人物棚拍背景色，達到滿版融合效果
    <section ref={pinRef} className="relative h-[260vh]" style={{ background: '#343434' }}>
      <div
        className="grain sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ background: '#343434' }}
      >
        {/* 頂部品牌 */}
        <div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 text-center z-[4] px-6">
          <p className="font-body font-semibold text-cream text-2xl md:text-3xl tracking-[-0.02em]">
            彈塗魚
          </p>
          <p className="font-display italic text-sage text-lg md:text-xl mt-1">tattoo 魚</p>
        </div>

        {/* 翅膀作品層（人物後方） */}
        <div className="absolute inset-0 z-[2]">
          {WINGS.map((w) => (
            <WingPhoto key={w.src} wing={w} progress={scrollYProgress} factor={factor} />
          ))}
        </div>

        {/* 中心人物（固定不動，桌機手機皆完整可見） */}
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

        {/* 標語（人物下方） */}
        <p className="absolute bottom-28 left-1/2 -translate-x-1/2 z-[4] font-body font-light text-cream/80 text-base md:text-lg text-center px-6">
          把它變成專屬於你的作品
        </p>

        {/* 滑動提示 */}
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
