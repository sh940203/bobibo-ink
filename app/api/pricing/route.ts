import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM pricing')
  return NextResponse.json(r.rows)
}

// 批次更新：body = [{ style, size, price_range }, ...]
export async function PUT(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const rows = await req.json()
  if (!Array.isArray(rows)) return NextResponse.json({ error: '格式錯誤' }, { status: 400 })

  for (const row of rows) {
    await db.execute({
      sql: `INSERT INTO pricing (style, size, price_range) VALUES (?,?,?)
            ON CONFLICT(style, size) DO UPDATE SET price_range = excluded.price_range`,
      args: [row.style, row.size, row.price_range ?? ''],
    })
  }
  return NextResponse.json({ ok: true })
}
