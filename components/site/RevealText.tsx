'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

// 隨滾動「逐字亮起」的文字段落（閱讀效果）。
// 可吃外部 progress（給釘選 pin 區用），或自行偵測捲動。

function Char({
  char,
  progress,
  range,
}: {
  char: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  return <motion.span style={{ opacity }}>{char}</motion.span>
}

export default function RevealText({
  text,
  className,
  paragraphClassName,
  progress,
  revealRange = [0, 0.85],
}: {
  text: string
  className?: string
  paragraphClassName?: string
  progress?: MotionValue<number>
  revealRange?: [number, number]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const internal = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  const prog = progress ?? internal.scrollYProgress

  const paragraphs = text.split(/\n+/).filter((p) => p.trim())
  const total = paragraphs.reduce((n, p) => n + p.length, 0) || 1

  const [rStart, rEnd] = revealRange
  const span = rEnd - rStart
  let runningIndex = 0

  return (
    <div ref={ref} className={className}>
      {paragraphs.map((para, pi) => {
        const chars = [...para]
        return (
          <p key={pi} className={paragraphClassName}>
            {chars.map((c, ci) => {
              const start = rStart + (runningIndex / total) * span
              const end = start + (1 / total) * span + 0.04
              runningIndex++
              return <Char key={ci} char={c} progress={prog} range={[start, Math.min(end, 1)]} />
            })}
          </p>
        )
      })}
    </div>
  )
}
