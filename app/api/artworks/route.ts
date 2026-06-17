import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'
import { GALLERY_CATEGORIES } from '@/lib/types'

export const runtime = 'edge'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM artworks ORDER BY display_order ASC, created_at DESC')
  return NextResponse.json(r.rows)
}

export async function POST(req: Request) {
  const denied = await guard()
  if (denied) return denied

  const { title, category, image_url, r2_key, is_featured } = await req.json()
  if (!category || !GALLERY_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: '分類無效' }, { status: 400 })
  }
  if (!image_url) return NextResponse.json({ error: '缺少圖片' }, { status: 400 })

  // 精選最多 4 張
  if (is_featured) {
    const c = await db.execute('SELECT COUNT(*) AS c FROM artworks WHERE is_featured = 1')
    if (Number((c.rows[0] as any).c) >= 4) {
      return NextResponse.json({ error: '精選作品最多 4 張' }, { status: 400 })
    }
  }

  const ord = await db.execute('SELECT COALESCE(MAX(display_order), -1) + 1 AS n FROM artworks')
  const next = Number((ord.rows[0] as any).n)

  await db.execute({
    sql: 'INSERT INTO artworks (title, category, image_url, r2_key, is_featured, display_order) VALUES (?,?,?,?,?,?)',
    args: [title || null, category, image_url, r2_key || '', is_featured ? 1 : 0, next],
  })
  return NextResponse.json({ ok: true })
}
