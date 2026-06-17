import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'nodejs'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const denied = await guard()
  if (denied) return denied
  const { content } = await req.json()
  await db.execute({
    sql: 'UPDATE booking_rules SET content = ? WHERE id = ?',
    args: [content ?? '', Number(params.id)],
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guard()
  if (denied) return denied
  await db.execute({ sql: 'DELETE FROM booking_rules WHERE id = ?', args: [Number(params.id)] })
  return NextResponse.json({ ok: true })
}
