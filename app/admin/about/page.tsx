'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

export default function AboutAdmin() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ body_text: string }>('/api/about')
      .then((d) => setText(d.body_text || ''))
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/about', { method: 'PUT', body: JSON.stringify({ body_text: text }) })
      toast.success('已儲存')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">關於我</h1>
      <p className="text-sm text-cream/50 mb-6">品牌故事文字（空行分段，前台會自動分段顯示）</p>
      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-cream/50 resize-y"
          />
          <button
            onClick={save}
            disabled={saving}
            className="mt-4 bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存'}
          </button>
        </>
      )}
    </div>
  )
}
