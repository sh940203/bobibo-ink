import { NextResponse } from 'next/server'
import { guard } from '@/lib/admin-guard'
import { saveAsset } from '@/lib/assets'

export const runtime = 'edge'

export async function POST(req: Request) {
  const denied = await guard()
  if (denied) return denied

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const folder = (formData.get('folder') as string) || 'artworks'
  const { url, key } = await saveAsset(file, folder)
  return NextResponse.json({ url, key })
}
