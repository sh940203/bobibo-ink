'use client'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api, uploadFile } from '@/lib/api-client'
import type { StudioPhoto } from '@/lib/types'

function PhotoCard({ photo, onDelete }: { photo: StudioPhoto; onDelete: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="relative aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-white/5 group"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.image_url} alt="工作室" className="w-full h-full object-cover" />
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 cursor-grab bg-ink/70 text-cream rounded px-2 py-1 text-xs"
      >
        ⠿ 拖曳
      </button>
      <button
        onClick={() => onDelete(photo.id)}
        className="absolute top-2 right-2 bg-ink/70 text-red-300 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100"
      >
        刪除
      </button>
    </div>
  )
}

export default function StudioPhotosAdmin() {
  const [photos, setPhotos] = useState<StudioPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const load = async () => {
    try {
      setPhotos(await api<StudioPhoto[]>('/api/studio-photos'))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const upload = async (file: File | null) => {
    if (!file) return
    if (photos.length >= 3) return toast.error('最多 3 張')
    setUploading(true)
    try {
      const { url, key } = await uploadFile(file, 'studio')
      await api('/api/studio-photos', { method: 'POST', body: JSON.stringify({ image_url: url, r2_key: key }) })
      toast.success('已新增')
      if (fileRef.current) fileRef.current.value = ''
      load()
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const del = async (id: number) => {
    if (!confirm('確定刪除這張照片？')) return
    try {
      await api(`/api/studio-photos/${id}`, { method: 'DELETE' })
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const next = arrayMove(
      photos,
      photos.findIndex((p) => p.id === active.id),
      photos.findIndex((p) => p.id === over.id)
    )
    setPhotos(next)
    try {
      await api('/api/studio-photos/order', { method: 'PUT', body: JSON.stringify({ ids: next.map((p) => p.id) }) })
    } catch (err) {
      toast.error((err as Error).message)
      load()
    }
  }

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">工作室環境照</h1>
      <p className="text-sm text-cream/50 mb-6">最多 3 張，對應前台「關於」的照片堆疊（拖曳調整堆疊順序）</p>

      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl">
              {photos.map((p) => (
                <PhotoCard key={p.id} photo={p} onDelete={del} />
              ))}
              {photos.length < 3 && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="aspect-[4/5] rounded-lg border border-dashed border-white/20 hover:border-cream/50 text-xs text-cream/50 disabled:opacity-50"
                >
                  {uploading ? '上傳中…' : '＋ 上傳照片'}
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0] || null)}
      />
    </div>
  )
}
