'use client'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { api, uploadFile } from '@/lib/api-client'
import type { Artwork, GalleryCategory } from '@/lib/types'
import { GALLERY_CATEGORIES, GALLERY_CATEGORY_LABELS } from '@/lib/types'

interface BatchItem { file: File; preview: string; done: boolean; error: boolean }

function TagInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('')
  const commit = () => {
    const tag = input.trim().replace(/^#/, '')
    if (tag && !value.includes(tag)) onChange([...value, tag])
    setInput('')
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-white/10 text-cream/80">
            #{t}
            <button onClick={() => onChange(value.filter((x) => x !== t))} className="text-cream/40 hover:text-cream ml-0.5">✕</button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() } }}
        onBlur={commit}
        placeholder="輸入標籤，按 Enter 新增（例：花草）"
        className="bg-white/5 border border-white/15 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-cream/50"
      />
    </div>
  )
}

export default function ArtworksAdmin() {
  const [items, setItems] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | GalleryCategory>('all')

  // 上傳表單（單張）
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [category, setCategory] = useState<GalleryCategory>('client')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [featured, setFeatured] = useState(false)
  const [isHero, setIsHero] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // 批次上傳
  const [batch, setBatch] = useState<BatchItem[]>([])
  const [batchCategory, setBatchCategory] = useState<GalleryCategory>('client')
  const [batchTags, setBatchTags] = useState<string[]>([])
  const [batchUploading, setBatchUploading] = useState(false)
  const batchRef = useRef<HTMLInputElement>(null)

  const featuredCount = items.filter((i) => i.is_featured).length
  const heroCount     = items.filter((i) => i.is_hero).length

  const load = async () => {
    setLoading(true)
    try { setItems(await api<Artwork[]>('/api/artworks')) }
    catch (e) { toast.error((e as Error).message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

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
        body: JSON.stringify({ image_url: url, r2_key: key, category, title, tags, is_featured: featured, is_hero: isHero }),
      })
      toast.success('已新增作品')
      pickFile(null)
      setTitle('')
      setTags([])
      setFeatured(false)
      setIsHero(false)
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e) { toast.error((e as Error).message) }
    finally { setUploading(false) }
  }

  const addBatchFiles = (fileList: FileList | null) => {
    if (!fileList) return
    const next: BatchItem[] = Array.from(fileList).map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      done: false,
      error: false,
    }))
    setBatch((prev) => [...prev, ...next])
  }

  const submitBatch = async () => {
    if (batch.length === 0) return
    setBatchUploading(true)
    for (let i = 0; i < batch.length; i++) {
      if (batch[i].done) continue
      try {
        const { url, key } = await uploadFile(batch[i].file, 'artworks')
        await api('/api/artworks', {
          method: 'POST',
          body: JSON.stringify({ image_url: url, r2_key: key, category: batchCategory, tags: batchTags, is_featured: false, is_hero: false }),
        })
        setBatch((prev) => prev.map((b, idx) => idx === i ? { ...b, done: true } : b))
      } catch {
        setBatch((prev) => prev.map((b, idx) => idx === i ? { ...b, error: true } : b))
      }
    }
    setBatchUploading(false)
    toast.success('批次上傳完成')
    setBatch([])
    setBatchTags([])
    load()
  }

  const patch = async (id: number, body: Partial<Omit<Artwork, 'tags'>> & { tags?: string[] }) => {
    try { await api(`/api/artworks/${id}`, { method: 'PATCH', body: JSON.stringify(body) }); load() }
    catch (e) { toast.error((e as Error).message); load() }
  }

  const del = async (id: number) => {
    if (!confirm('確定刪除這張作品？此動作無法復原。')) return
    try { await api(`/api/artworks/${id}`, { method: 'DELETE' }); toast.success('已刪除'); load() }
    catch (e) { toast.error((e as Error).message) }
  }

  const shown = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">作品集管理</h1>
      <p className="text-sm text-cream/50 mb-8">
        精選作品 {featuredCount} / 4　·　首頁翅膀 {heroCount} / 6　·　共 {items.length} 件
      </p>

      {/* ── 單張上傳 ── */}
      <div className="border border-white/10 rounded-xl p-5 mb-6">
        <p className="font-body text-sm text-cream/80 mb-4">＋ 上傳新作品</p>
        <div className="grid md:grid-cols-[160px_1fr] gap-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-[4/5] rounded-lg border border-dashed border-white/20 hover:border-cream/50 cursor-pointer overflow-hidden flex items-center justify-center bg-white/5"
          >
            {preview
              ? <img src={preview} alt="預覽" className="w-full h-full object-cover" />
              : <span className="text-xs text-cream/40 text-center px-2">點擊選擇圖片<br/>JPG / PNG / WebP</span>
            }
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] || null)} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {GALLERY_CATEGORIES.map((c) => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-4 py-1.5 rounded-full border text-sm ${category === c ? 'bg-cream border-cream text-ink' : 'border-white/15 text-cream/70'}`}>
                  {GALLERY_CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="標題（選填）"
              className="bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cream/50" />
            <div>
              <p className="text-xs text-cream/50 mb-1.5">自訂標籤</p>
              <TagInput value={tags} onChange={setTags} />
            </div>
            <label className="flex items-center gap-2 text-sm text-cream/80">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} disabled={!featured && featuredCount >= 4} className="accent-cream" />
              設為首頁精選{!featured && featuredCount >= 4 && '（已達 4 張上限）'}
            </label>
            <label className="flex items-center gap-2 text-sm text-cream/80">
              <input type="checkbox" checked={isHero} onChange={(e) => setIsHero(e.target.checked)} disabled={!isHero && heroCount >= 6} className="accent-cream" />
              設為首頁翅膀{!isHero && heroCount >= 6 && '（已達 6 張上限）'}
            </label>
            <button onClick={submit} disabled={uploading}
              className="bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50 w-fit">
              {uploading ? '上傳中…' : '上傳作品'}
            </button>
          </div>
        </div>
      </div>

      {/* ── 批次上傳 ── */}
      <div className="border border-white/10 rounded-xl p-5 mb-10">
        <p className="font-body text-sm text-cream/80 mb-4">＋ 批次上傳（一次選多張）</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {GALLERY_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setBatchCategory(c)}
              className={`px-4 py-1.5 rounded-full border text-sm ${batchCategory === c ? 'bg-cream border-cream text-ink' : 'border-white/15 text-cream/70'}`}>
              {GALLERY_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
        <div className="mb-3">
          <p className="text-xs text-cream/50 mb-1.5">套用標籤（所有批次圖片共用）</p>
          <TagInput value={batchTags} onChange={setBatchTags} />
        </div>
        <div
          onClick={() => batchRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); addBatchFiles(e.dataTransfer.files) }}
          className="border border-dashed border-white/20 hover:border-cream/50 rounded-lg px-6 py-8 text-center cursor-pointer mb-4 transition-colors"
        >
          <input ref={batchRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addBatchFiles(e.target.files); e.target.value = '' }} />
          <p className="text-sm text-cream/50">點擊或拖曳選擇多張圖片</p>
        </div>
        {batch.length > 0 && (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 mb-4">
              {batch.map((b, i) => (
                <div key={i} className={`relative aspect-square rounded overflow-hidden border ${b.error ? 'border-red-500' : b.done ? 'border-green-500/50' : 'border-white/10'}`}>
                  <img src={b.preview} alt="" className="w-full h-full object-cover" />
                  {b.done && <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center text-white text-lg">✓</div>}
                  {b.error && <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center text-white text-lg">✕</div>}
                  {!b.done && !b.error && (
                    <button onClick={() => setBatch((prev) => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center">✕</button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={submitBatch} disabled={batchUploading}
                className="bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50">
                {batchUploading ? '上傳中…' : `上傳全部 ${batch.filter(b => !b.done).length} 張`}
              </button>
              <button onClick={() => setBatch([])} className="text-xs text-cream/40 hover:text-cream/70">清空</button>
            </div>
          </>
        )}
      </div>

      {/* 篩選 */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...GALLERY_CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-xs border ${filter === c ? 'bg-cream border-cream text-ink' : 'border-white/15 text-cream/60'}`}>
            {c === 'all' ? '全部' : GALLERY_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((a) => {
            const artTags: string[] = (() => { try { return a.tags ? JSON.parse(a.tags) : [] } catch { return [] } })()
            return (
              <div key={a.id} className="border border-white/10 rounded-lg overflow-hidden">
                <div className="aspect-[4/5] bg-white/5">
                  <img src={a.image_url} alt={a.title || ''} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 flex flex-col gap-2">
                  <select value={a.category} onChange={(e) => patch(a.id, { category: e.target.value as GalleryCategory })}
                    className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs">
                    {GALLERY_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-ink">{GALLERY_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                  <input defaultValue={a.title || ''} onBlur={(e) => e.target.value !== (a.title || '') && patch(a.id, { title: e.target.value })}
                    placeholder="標題" className="bg-white/5 border border-white/15 rounded px-2 py-1 text-xs" />
                  <div>
                    <p className="text-[10px] text-cream/40 mb-1">標籤</p>
                    <TagInput value={artTags} onChange={(v) => patch(a.id, { tags: v })} />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-cream/70">
                    <input type="checkbox" checked={!!a.is_featured}
                      onChange={(e) => patch(a.id, { is_featured: e.target.checked ? 1 : 0 })}
                      disabled={!a.is_featured && featuredCount >= 4} className="accent-cream" />
                    精選
                  </label>
                  <label className="flex items-center gap-2 text-xs text-cream/70">
                    <input type="checkbox" checked={!!a.is_hero}
                      onChange={(e) => patch(a.id, { is_hero: e.target.checked ? 1 : 0 })}
                      disabled={!a.is_hero && heroCount >= 6} className="accent-cream" />
                    首頁翅膀
                  </label>
                  <button onClick={() => del(a.id)} className="text-xs text-red-400/80 hover:text-red-400 text-left">刪除</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
