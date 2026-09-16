import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'
import { deleteAsset } from '@/lib/assets'

export const runtime = 'edge'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied

  const body = await req.json()
  const { id: idStr } = await params
  const id = Number(idStr)

  if (body.is_featured) {
    const c = await db.execute({
      sql: 'SELECT COUNT(*) AS c FROM artworks WHERE is_featured = 1 AND id != ?',
      args: [id],
    })
    if (Number((c.rows[0] as any).c) >= 4) {
      return NextResponse.json({ error: '精選作品最多 4 張' }, { status: 400 })
    }
  }

  const fields: string[] = []
  const args: any[] = []
  if (body.title !== undefined) {
    fields.push('title = ?')
    args.push(body.title || null)
  }
  if (body.category !== undefined) {
    fields.push('category = ?')
    args.push(body.category)
  }
  if (body.is_featured !== undefined) {
    fields.push('is_featured = ?')
    args.push(body.is_featured ? 1 : 0)
  }
  if (body.is_hero !== undefined) {
    if (body.is_hero) {
      const c = await db.execute({
        sql: 'SELECT COUNT(*) AS c FROM artworks WHERE is_hero = 1 AND id != ?',
        args: [id],
      })
      if (Number((c.rows[0] as any).c) >= 6) {
        return NextResponse.json({ error: '首頁翅膀最多 6 張' }, { status: 400 })
      }
    }
    fields.push('is_hero = ?')
    args.push(body.is_hero ? 1 : 0)
  }
  if (body.tags !== undefined) {
    fields.push('tags = ?')
    args.push(body.tags?.length ? JSON.stringify(body.tags) : null)
  }
  if (fields.length === 0) return NextResponse.json({ ok: true })

  args.push(id)
  await db.execute({ sql: `UPDATE artworks SET ${fields.join(', ')} WHERE id = ?`, args })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied

  const { id: idStr } = await params
  const id = Number(idStr)
  const r = await db.execute({ sql: 'SELECT r2_key FROM artworks WHERE id = ?', args: [id] })
  const key = (r.rows[0] as any)?.r2_key as string | undefined
  await deleteAsset(key)
  await db.execute({ sql: 'DELETE FROM artworks WHERE id = ?', args: [id] })
  return NextResponse.json({ ok: true })
}
