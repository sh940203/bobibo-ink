'use client'
import { useScrollReveal } from '@/hooks/useScrollReveal'

// 掛在前台 layout，啟用全站 .reveal 動畫。回傳 null，不渲染任何 DOM。
export default function ScrollReveal() {
  useScrollReveal()
  return null
}
