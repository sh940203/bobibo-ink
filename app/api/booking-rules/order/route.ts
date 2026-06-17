import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { guard } from '@/lib/admin-guard'

export const runtime = 'nodejs'

// body = { ids: [orderedId, ...] }
export async function PUT(req: Request) {
  const denied = await guard()
  if (denied) return denied
  const { ids } = await req.json()
  if (!Array.isArray(ids)) return NextResponse.json({ error: '格式錯誤' }, { status: 400 })
  for (let i = 0; i < ids.length; i++) {
    await db.execute({
      sql: 'UPDATE booking_rules SET display_order = ? WHERE id = ?',
      args: [i + 1, ids[i]],
    })
  }
  return NextResponse.json({ ok: true })
}
