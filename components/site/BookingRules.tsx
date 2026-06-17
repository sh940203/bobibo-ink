'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import type { BookingRule } from '@/lib/types'

// 這些關鍵字會加螢光筆效果
const HIGHLIGHTS = [
  '女性', '恕不退還訂金', '訂金不予退還', '訂金',
  '一次', '現金', '匯款', '攜伴一位', '15 分鐘', '三天前',
]

function highlight(text: string) {
  const pattern = new RegExp(`(${HIGHLIGHTS.map(k => k.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})`, 'g')
  const parts = text.split(pattern)
  return parts.map((part, i) =>
    HIGHLIGHTS.includes(part)
      ? <mark key={i} className="rule-mark">{part}</mark>
      : part
  )
}

function RuleRow({
  rule,
  index,
  total,
  progress,
}: {
  rule: BookingRule
  index: number
  total: number
  progress: MotionValue<number>
}) {
  // 逐格亮起：整列（序號＋文字）一起由暗轉亮
  const span = 0.8
  const start = (index / total) * span
  const end = start + (1 / total) * span + 0.05
  const opacity = useTransform(progress, [start, Math.min(end, 1)], [0.2, 1])

  return (
    <motion.li style={{ opacity }} className="flex gap-5 py-5 border-t border-white/10 first:border-t-0">
      <span className="font-display italic text-sage text-lg w-10 shrink-0">
        {String(index + 1).padStart(2, '0')}.
      </span>
      <p className="font-body font-light text-cream leading-relaxed rule-text">{highlight(rule.content)}</p>
    </motion.li>
  )
}

export default function BookingRules({ rules }: { rules: BookingRule[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.6'],
  })

  return (
    <section id="booking" className="bg-ink py-24 md:py-32 px-6 border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <p className="reveal font-body text-xs tracking-[0.3em] uppercase text-warm-gray mb-4">
          ✦ Before You Book
        </p>
        <h2 className="reveal reveal-delay-1 font-display italic text-4xl md:text-5xl text-cream mb-14">
          預約須知
        </h2>

        <style>{`
          .rule-mark {
            background: none;
            color: #FFE000;
            font-weight: 500;
            text-shadow: 0 0 16px rgba(255, 224, 0, 0.45);
          }
          .rule-text::selection,
          .rule-text *::selection {
            background: rgba(255, 210, 100, 0.35);
            color: #fff;
            text-shadow: 0 0 12px rgba(255, 200, 60, 0.9), 0 0 24px rgba(255, 180, 0, 0.5);
          }
        `}</style>
        <ol ref={ref}>
          {rules.length === 0 && (
            <li className="py-5 font-body text-warm-gray">（條款將由 Admin 後台編輯）</li>
          )}
          {rules.map((rule, i) => (
            <RuleRow key={rule.id} rule={rule} index={i} total={rules.length} progress={scrollYProgress} />
          ))}
        </ol>
      </div>
    </section>
  )
}
