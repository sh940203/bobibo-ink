'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

interface Inquiry {
  id: number
  name: string
  contact: string
  style: string | null
  parts: string | null
  size: string | null
  description: string | null
  preferred_time: string | null
  is_read: number
  created_at: string
}

const STYLE_LABELS: Record<string, string> = {
  pet: '寵物肖像', anime: '動漫人物', linework: '線條文字', custom: '客製小圖', other: '其他',
}

export default function InquiriesAdmin() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try { setItems(await api<Inquiry[]>('/api/inquiries')) }
    catch (e) { toast.error((e as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const markRead = async (id: number) => {
    await api(`/api/inquiries/${id}`, { method: 'PATCH' })
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_read: 1 } : i))
  }

  const del = async (id: number) => {
    if (!confirm('確定刪除這筆詢問？')) return
    try {
      await api(`/api/inquiries/${id}`, { method: 'DELETE' })
      toast.success('已刪除')
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (e) { toast.error((e as Error).message) }
  }

  const unread = items.filter((i) => !i.is_read).length

  const fmt = (s: string) =>
    new Date(s + 'Z').toLocaleString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">詢問記錄</h1>
      <p className="text-sm text-cream/50 mb-8">
        共 {items.length} 筆　·　未讀 {unread} 筆
      </p>

      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : items.length === 0 ? (
        <p className="text-cream/50 text-sm">尚無詢問記錄</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const parts = item.parts ? JSON.parse(item.parts) as string[] : []
            const open = expanded === item.id
            return (
              <div
                key={item.id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  item.is_read ? 'border-white/10' : 'border-cream/30'
                }`}
              >
                {/* 摘要列 */}
                <button
                  onClick={() => {
                    setExpanded(open ? null : item.id)
                    if (!item.is_read) markRead(item.id)
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                >
                  {!item.is_read && (
                    <span className="shrink-0 w-2 h-2 rounded-full bg-cream" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-body font-medium text-cream">{item.name}</span>
                      <span className="font-body text-sm text-cream/60">{item.contact}</span>
                      {item.style && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-cream/70">
                          {STYLE_LABELS[item.style] ?? item.style}
                        </span>
                      )}
                    </div>
                    {item.size && (
                      <p className="font-body text-xs text-cream/50 mt-0.5">{item.size}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-body text-xs text-cream/40">{fmt(item.created_at)}</span>
                  <span className="shrink-0 text-cream/40 text-sm">{open ? '▲' : '▼'}</span>
                </button>

                {/* 展開詳情 */}
                {open && (
                  <div className="border-t border-white/10 px-5 py-4 space-y-3 bg-white/3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="聯絡方式">
                        <a
                          href={`https://ig.me/m/${item.contact.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cream underline underline-offset-2"
                        >
                          {item.contact}
                        </a>
                        <span className="ml-2 text-cream/40 text-xs">→ IG 私訊</span>
                      </Field>
                      {item.style && <Field label="刺青風格">{STYLE_LABELS[item.style] ?? item.style}</Field>}
                      {item.size && <Field label="尺寸">{item.size}</Field>}
                      {item.preferred_time && <Field label="希望時間">{item.preferred_time}</Field>}
                    </div>
                    {parts.length > 0 && (
                      <Field label="刺青部位">
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {parts.map((p) => (
                            <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-cream/80">{p}</span>
                          ))}
                        </div>
                      </Field>
                    )}
                    {item.description && (
                      <Field label="圖案描述">
                        <p className="text-cream/80 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                      </Field>
                    )}
                    <div className="flex gap-4 pt-1">
                      <a
                        href={`https://ig.me/m/${item.contact.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-cream bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
                      >
                        IG 私訊回覆 →
                      </a>
                      <button
                        onClick={() => del(item.id)}
                        className="text-sm text-red-400/80 hover:text-red-400"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-cream/40 mb-1">{label}</p>
      <div className="font-body text-sm text-cream/90">{children}</div>
    </div>
  )
}
