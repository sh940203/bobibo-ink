'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api-client'
import type { Pricing, Category, Size } from '@/lib/types'
import { CATEGORIES, CATEGORY_LABELS, SIZES } from '@/lib/types'

type Grid = Record<string, string> // key = `${style}-${size}`

export default function PricingAdmin() {
  const [grid, setGrid] = useState<Grid>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api<Pricing[]>('/api/pricing')
      .then((rows) => {
        const g: Grid = {}
        rows.forEach((r) => {
          g[`${r.style}-${r.size}`] = r.price_range
        })
        setGrid(g)
      })
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const setCell = (style: Category, size: Size, val: string) =>
    setGrid((g) => ({ ...g, [`${style}-${size}`]: val }))

  const save = async () => {
    setSaving(true)
    try {
      const rows = CATEGORIES.flatMap((style) =>
        SIZES.map((size) => ({ style, size, price_range: grid[`${style}-${size}`] || '' }))
      )
      await api('/api/pricing', { method: 'PUT', body: JSON.stringify(rows) })
      toast.success('已儲存')
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="font-body font-semibold text-2xl tracking-tight mb-1">估價設定</h1>
      <p className="text-sm text-cream/50 mb-6">費用範圍文字，例如 3,500 – 6,000 或「面議」</p>
      {loading ? (
        <p className="text-cream/50 text-sm">載入中…</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 text-cream/50 font-normal"></th>
                  {SIZES.map((s) => (
                    <th key={s} className="p-2 text-cream/70 font-medium text-center w-32">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((style) => (
                  <tr key={style}>
                    <td className="p-2 text-cream/80 whitespace-nowrap">{CATEGORY_LABELS[style]}</td>
                    {SIZES.map((size) => (
                      <td key={size} className="p-1.5">
                        <input
                          value={grid[`${style}-${size}`] || ''}
                          onChange={(e) => setCell(style, size, e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded px-2 py-1.5 text-xs text-center focus:outline-none focus:border-cream/50"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-6 bg-cream text-ink rounded-lg px-6 py-2.5 text-sm disabled:opacity-50"
          >
            {saving ? '儲存中…' : '全部儲存'}
          </button>
        </>
      )}
    </div>
  )
}
