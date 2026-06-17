import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'nodejs'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM booking_rules ORDER BY display_order ASC')
  return NextResponse.json(r.rows)
}

export async function POST(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: '內容不可空白' }, { status: 400 })
  const ord = await db.execute('SELECT COALESCE(MAX(display_order), 0) + 1 AS n FROM booking_rules')
  const next = Number((ord.rows[0] as any).n)
  await db.execute({
    sql: 'INSERT INTO booking_rules (content, display_order) VALUES (?, ?)',
    args: [content.trim(), next],
  })
  return NextResponse.json({ ok: true })
}
