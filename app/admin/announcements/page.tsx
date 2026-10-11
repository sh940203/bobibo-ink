'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'

export default function AnnouncementsAdmin() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(true)
  const [studioCity, setStudioCity] = useState('')
  const [studioDesc, setStudioDesc] = useState('')
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api<{ message: string; is_visible: number; studio_city: string | null; studio_desc: string | null; favicon_url: string | null }>('/api/announcements')
      .then((d) => {
        setMessage(d.message || '')
        setVisible(!!d.is_visible)
        setStudioCity(d.studio_city || '彰化縣員林市')
        setStudioDesc(d.studio_desc || '近員林火車站，居家工作室（採預約制）')
        setFaviconUrl(d.favicon_url || null)
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const uploadFavicon = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'favicon')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('上傳失敗')
      const { url } = await res.json()
      setFaviconUrl(url)
      toast.success('圖示已上傳，請儲存套用')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      await api('/api/announcements', {
        method: 'PUT',
        body: JSON.stringify({
          message,
          is_visible: visible ? 1 : 0,
          studio_city: studioCity,
          studio_desc: studioDesc,
          favicon_url: faviconUrl,
        }),
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
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">公告 ＆ 網站設定</h1>
      <p className="text-sm text-cream/50 mb-8">管理網站圖示、工作室位置與前台公告橫幅</p>

      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <>
          {/* 網站小圖示 favicon */}
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="font-body font-medium text-base mb-1 text-cream">網站圖示（Favicon）</h2>
            <p className="text-xs text-cream/40 mb-5">顯示於瀏覽器分頁與書籤列。建議正方形圖片，JPG / PNG / WebP 皆可。</p>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 relative">
                {faviconUrl ? (
                  <Image src={faviconUrl} alt="目前圖示" fill className="object-cover" unoptimized />
                ) : (
                  <Image src="/favicon-default.jpg" alt="預設圖示" fill className="object-cover" unoptimized />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="bg-cream text-ink rounded-lg px-4 py-2 text-sm disabled:opacity-50"
                >
                  {uploading ? '上傳中…' : '更換圖示'}
                </button>
                {faviconUrl && (
                  <button
                    onClick={() => setFaviconUrl(null)}
                    className="text-xs text-cream/40 hover:text-cream/70 text-left"
                  >
                    恢復預設
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) uploadFavicon(f)
                e.target.value = ''
              }}
            />
          </div>

          {/* 工作室位置 */}
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="font-body font-medium text-base mb-1 text-cream">工作室位置</h2>
            <p className="text-xs text-cream/40 mb-5">顯示於首頁「關於」黑色區塊及頁腳</p>
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
          <div className="mb-6 p-6 bg-white/5 rounded-xl border border-white/10">
            <h2 className="font-body font-medium text-base mb-1 text-cream">搬遷公告橫幅</h2>
            <p className="text-xs text-cream/40 mb-5">開啟後顯示於「關於」黑色區塊右側的警示欄</p>
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
            className="bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? '儲存中…' : '儲存所有變更'}
          </button>
        </>
      )}
    </div>
  )
}
