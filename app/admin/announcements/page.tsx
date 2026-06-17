'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

export default function AnnouncementsAdmin() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ message: string; is_visible: number }>('/api/announcements')
      .then((d) => {
        setMessage(d.message || '')
        setVisible(!!d.is_visible)
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/announcements', {
        method: 'PUT',
        body: JSON.stringify({ message, is_visible: visible ? 1 : 0 }),
      })
      toast.success('已儲存')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">公告欄</h1>
      <p className="text-sm text-cream/50 mb-6">控制前台「關於」區塊的搬遷公告橫幅</p>
      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <>
          <label className="flex items-center gap-3 mb-5 cursor-pointer">
            <span
              onClick={() => setVisible((v) => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors ${visible ? 'bg-cream' : 'bg-white/15'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-all ${visible ? 'left-[22px]' : 'left-0.5'}`}
              />
            </span>
            <span className="text-sm text-cream/80">{visible ? '前台顯示中' : '前台隱藏'}</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
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
