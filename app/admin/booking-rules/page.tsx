'use client'
import { useEffect, useState } from 'react'
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { api } from '@/lib/api-client'
import type { BookingRule } from '@/lib/types'

function Row({
  rule,
  onSave,
  onDelete,
}: {
  rule: BookingRule
  onSave: (id: number, content: string) => void
  onDelete: (id: number) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rule.id,
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-cream/40 px-1" aria-label="拖曳排序">
        ⠿
      </button>
      <input
        defaultValue={rule.content}
        onBlur={(e) => e.target.value !== rule.content && onSave(rule.id, e.target.value)}
        className="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-cream/30 py-1"
      />
      <button onClick={() => onDelete(rule.id)} className="text-xs text-red-400/80 hover:text-red-400 px-1">
        刪除
      </button>
    </div>
  )
}

export default function BookingRulesAdmin() {
  const [rules, setRules] = useState<BookingRule[]>([])
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const load = async () => {
    try {
      setRules(await api<BookingRule[]>('/api/booking-rules'))
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = rules.findIndex((r) => r.id === active.id)
    const newIndex = rules.findIndex((r) => r.id === over.id)
    const next = arrayMove(rules, oldIndex, newIndex)
    setRules(next)
    try {
      await api('/api/booking-rules/order', {
        method: 'PUT',
        body: JSON.stringify({ ids: next.map((r) => r.id) }),
      })
    } catch (err) {
      toast.error((err as Error).message)
      load()
    }
  }

  const saveContent = async (id: number, content: string) => {
    try {
      await api(`/api/booking-rules/${id}`, { method: 'PUT', body: JSON.stringify({ content }) })
      setRules((rs) => rs.map((r) => (r.id === id ? { ...r, content } : r)))
      toast.success('已更新')
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const del = async (id: number) => {
    if (!confirm('確定刪除這條須知？')) return
    try {
      await api(`/api/booking-rules/${id}`, { method: 'DELETE' })
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const add = async () => {
    if (!draft.trim()) return
    try {
      await api('/api/booking-rules', { method: 'POST', body: JSON.stringify({ content: draft.trim() }) })
      setDraft('')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">預約須知</h1>
      <p className="text-sm text-cream/50 mb-6">拖曳 ⠿ 調整順序，點文字可直接編輯（自動儲存）</p>

      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rules.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {rules.map((r) => (
                <Row key={r.id} rule={r} onSave={saveContent} onDelete={del} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* 新增 */}
      <div className="flex gap-2 mt-6">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="新增一條須知…"
          className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-cream/50"
        />
        <button onClick={add} className="bg-cream text-ink rounded-lg px-5 py-2.5 text-sm">
          新增
        </button>
      </div>
    </div>
  )
}
