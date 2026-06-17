'use client'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { api, uploadFile } from '@/lib/api-client'
import type { Artwork, GalleryCategory } from '@/lib/types'
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS } from '@/lib/types'

export default function ArtworksAdmin() {
  const [items, setItems] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all')

  // 上傳表單
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [category, setCategory] = useState<GalleryCategory>('client')
  const [title, setTitle] = useState('')
  const [featured, setFeatured] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const featuredCount = items.filter((i) => i.is_featured).length

  const load = async () => {
    setLoading(true)
    try {
      setItems(await api<Artwork[]>('/api/artworks'))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const pickFile = (f: File | null) => {
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  const submit = async () => {
    if (!file) return toast.error('請選擇圖片')
    setUploading(true)
    try {
      const { url, key } = await uploadFile(file, 'artworks')
      await api('/api/artworks', {
        method: 'POST',
        body: JSON.stringify({ image_url: url, r2_key: key, category, title, is_featured: featured }),
      })
      toast.success('已新增作品')
      pickFile(null)
      setTitle('')
      setFeatured(false)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const patch = async (id: number, body: Partial<Artwork>) => {
    try {
      await api(`/api/artworks/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
      load()
    } catch (e) {
      toast.error((e as Error).message)
      load()
    }
  }

  const del = async (id: number) => {
    if (!confirm('確定刪除這張作品？此動作無法復原。')) return
    try {
      await api(`/api/artworks/${id}`, { method: 'DELETE' })
      toast.success('已刪除')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const shown = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">作品集管理</h1>
      <p className="text-sm text-cream/50 mb-8">
        精選作品 {featuredCount} / 4　·　共 {items.length} 件
      </p>

      {/* 上傳區 */}
      <div className="border border-white/10 rounded-xl p-5 mb-10">
        <p className="font-body text-sm text-cream/80 mb-4">＋ 上傳新作品</p>
        <div className="grid md:grid-cols-[160px_1fr] gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-[4/5] rounded-lg border border-dashed border-white/20 hover:border-cream/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/5"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="預覽" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-cream/40 text-center px-2">點擊選擇圖片<br/>JPG / PNG / WebP</span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {GALLERY_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full border text-sm ${
                    category === c ? 'bg-cream border-cream text-ink' : 'border-white/15 text-cream/70'
                  }`}
                >
                  {GALLERY_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="標題（選填）"
              className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cream/50"
            />
            <label className="flex items-center gap-2 text-sm text-cream/80">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                disabled={!featured && featuredCount >= 4}
                className="accent-cream"
              />
              設為首頁精選{!featured && featuredCount >= 4 && '（已達 4 張上限）'}
            </label>
            <div>
              <button
                onClick={submit}
                disabled={uploading}
                className="bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {uploading ? '上傳中…' : '上傳作品'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...GALLERY_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-xs border ${
              filter === c ? 'bg-cream border-cream text-ink' : 'border-white/15 text-cream/60'
            }`}
          >
            {c === 'all' ? '全部' : GALLERY_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((a) => (
            <div key={a.id} className="border border-white/10 rounded-lg overflow-hidden">
              <div className="aspect-[4/5] bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image_url} alt={a.title || ''} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex flex-col gap-2">
                <select
                  value={a.category}
                  onChange={(e) => patch(a.id, { category: e.target.value as GalleryCategory })}
                  className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs"
                >
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="text-ink">
                      {GALLERY_CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
                <input
                  defaultValue={a.title || ''}
                  onBlur={(e) => e.target.value !== (a.title || '') && patch(a.id, { title: e.target.value })}
                  placeholder="標題"
                  className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs"
                />
                <label className="flex items-center gap-2 text-xs text-cream/70">
                  <input
                    type="checkbox"
                    checked={!!a.is_featured}
                    onChange={(e) => patch(a.id, { is_featured: e.target.checked ? 1 : 0 })}
                    disabled={!a.is_featured && featuredCount >= 4}
                    className="accent-cream"
                  />
                  精選
                </label>
                <button onClick={() => del(a.id)} className="text-xs text-red-400/80 hover:text-red-400 text-left">
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
