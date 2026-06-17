import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM studio_photos ORDER BY display_order ASC')
  return NextResponse.json(r.rows)
}

export async function POST(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const { image_url, r2_key } = await req.json()
  if (!image_url) return NextResponse.json({ error: '缺少圖片' }, { status: 400 })

  // 最多 3 張
  const c = await db.execute('SELECT COUNT(*) AS c FROM studio_photos')
  if (Number((c.rows[0] as any).c) >= 3) {
    return NextResponse.json({ error: '工作室環境照最多 3 張' }, { status: 400 })
  }

  const ord = await db.execute('SELECT COALESCE(MAX(display_order), -1) + 1 AS n FROM studio_photos')
  const next = Number((ord.rows[0] as any).n)
  await db.execute({
    sql: 'INSERT INTO studio_photos (image_url, r2_key, display_order) VALUES (?, ?, ?)',
    args: [image_url, r2_key || '', next],
  })
  return NextResponse.json({ ok: true })
}
