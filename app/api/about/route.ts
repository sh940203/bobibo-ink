import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

export async function GET() {
  const denied = await guard()
  if (denied) return denied
  const r = await db.execute('SELECT * FROM about_content WHERE id = 1')
  return NextResponse.json(r.rows[0] ?? { id: 1, body_text: '' })
}

export async function PUT(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const { body_text } = await req.json()
  await db.execute({
    sql: `INSERT INTO about_content (id, body_text, updated_at) VALUES (1, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET body_text = excluded.body_text, updated_at = datetime('now')`,
    args: [body_text ?? ''],
  })
  return NextResponse.json({ ok: true })
}
