import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'
import { deleteAsset } from '@/lib/assets'

export const runtime = 'nodejs'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await guard()
  if (denied) return denied
  const id = Number(params.id)
  const r = await db.execute({ sql: 'SELECT r2_key FROM studio_photos WHERE id = ?', args: [id] })
  await deleteAsset((r.rows[0] as any)?.r2_key)
  await db.execute({ sql: 'DELETE FROM studio_photos WHERE id = ?', args: [id] })
  return NextResponse.json({ ok: true })
}
