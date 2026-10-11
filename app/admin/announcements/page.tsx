'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

export default function AnnouncementsAdmin() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(true)
  const [studioCity, setStudioCity] = useState('')
  const [studioDesc, setStudioDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<{ message: string; is_visible: number; studio_city: string | null; studio_desc: string | null }>('/api/announcements')
      .then((d) => {
        setMessage(d.message || '')
        setVisible(!!d.is_visible)
        setStudioCity(d.studio_city || '彰化縣員林市')
        setStudioDesc(d.studio_desc || '近員林火車站，居家工作室（採預約制）')
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/announcements', {
        method: 'PUT',
        body: JSON.stringify({ message, is_visible: visible ? 1 : 0, studio_city: studioCity, studio_desc: studioDesc }),
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
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">公告 ＆ 工作室位置</h1>
      <p className="text-sm text-cream/50 mb-8">管理前台「關於」區塊與頁腳顯示的工作室資訊</p>

      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <>
          {/* 工作室位置 */}
          <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="font-body font-medium text-base mb-4 text-cream">工作室位置</h2>
            <p className="text-xs text-cream/40 mb-4">顯示於首頁「關於」黑色區塊及頁腳，粗體為城市名稱</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-cream/70 mb-1.5">城市（粗體）</label>
                <input
                  type="text"
                  value={studioCity}
                  onChange={(e) => setStudioCity(e.target.value)}
                  placeholder="彰化縣員林市"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cream/50"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/70 mb-1.5">說明（細體）</label>
                <input
                  type="text"
                  value={studioDesc}
                  onChange={(e) => setStudioDesc(e.target.value)}
                  placeholder="近員林火車站，居家工作室（採預約制）"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cream/50"
                />
              </div>
            </div>
          </div>

          {/* 公告橫幅 */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="font-body font-medium text-base mb-4 text-cream">搬遷公告橫幅</h2>
            <p className="text-xs text-cream/40 mb-4">開啟後顯示於「關於」黑色區塊右側的黃色警示欄</p>
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
              rows={4}
              placeholder="例：居家工作室已遷至彰化縣員林市日泰街81號…"
              className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm leading-relaxed focus:outline-none focus:border-cream/50 resize-y"
            />
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="mt-6 bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存所有變更'}
          </button>
        </>
      )}
    </div>
  )
}
