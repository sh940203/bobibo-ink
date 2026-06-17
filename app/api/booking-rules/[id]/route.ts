import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied
  const { content } = await req.json()
  const { id } = await params
  await db.execute({
    sql: 'UPDATE booking_rules SET content = ? WHERE id = ?',
    args: [content ?? '', Number(id)],
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied
  const { id } = await params
  await db.execute({ sql: 'DELETE FROM booking_rules WHERE id = ?', args: [Number(id)] })
  return NextResponse.json({ ok: true })
}
