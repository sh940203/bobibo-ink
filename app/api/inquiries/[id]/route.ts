import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'edge'

// 標記已讀 / 刪除
export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied
  const { id } = await params
  await db.execute({ sql: 'UPDATE inquiries SET is_read = 1 WHERE id = ?', args: [Number(id)] })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard()
  if (denied) return denied
  const { id } = await params
  await db.execute({ sql: 'DELETE FROM inquiries WHERE id = ?', args: [Number(id)] })
  return NextResponse.json({ ok: true })
}
