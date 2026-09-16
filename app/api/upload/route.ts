import { NextResponse } from 'next/server'
import { guard } from '@/lib/admin-guard'
import { saveAsset } from '@/lib/assets'

export const runtime = 'edge'

const ALLOWED_FOLDERS = ['artworks', 'studio', 'about'] as const
const ALLOWED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE        = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  const denied = await guard()
  if (denied) return denied

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // 檔案類型白名單
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: '只允許上傳圖片（JPG / PNG / WebP / GIF）' }, { status: 400 })
  }

  // 檔案大小上限 10MB
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: '檔案過大，上限 10MB' }, { status: 400 })
  }

  // folder 白名單，防止路徑穿越
  const rawFolder = (formData.get('folder') as string) || 'artworks'
  const folder = ALLOWED_FOLDERS.includes(rawFolder as any) ? rawFolder : 'artworks'

  const { url, key } = await saveAsset(file, folder)
  return NextResponse.json({ url, key })
}
