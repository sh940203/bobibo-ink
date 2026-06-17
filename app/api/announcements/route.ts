import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'nodejs'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM announcements WHERE id = 1')
  return NextResponse.json(r.rows[0] ?? { id: 1, is_visible: 1, message: '' })
}

export async function PUT(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const { message, is_visible } = await req.json()
  await db.execute({
    sql: `INSERT INTO announcements (id, message, is_visible, updated_at) VALUES (1, ?, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET message = excluded.message, is_visible = excluded.is_visible, updated_at = datetime('now')`,
    args: [message ?? '', is_visible ? 1 : 0],
  })
  return NextResponse.json({ ok: true })
}
