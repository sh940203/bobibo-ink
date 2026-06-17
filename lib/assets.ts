/**
 * 圖片資產的儲存與刪除：R2 已設定時用 R2，否則本機 public/uploads（方便本機開發）。
 * r2_key 慣例：
 *  - R2 物件：'artworks/xxxx.jpg'
 *  - 本機檔案：'local:artworks/xxxx.jpg'
 *  - 種子/外部圖片：'' （刪除時略過）
 */
import { nanoid } from 'nanoid'

// 偵測 R2 是否真的設定好（排除空值與 .env.example 的 your-xxx 佔位值）
const r2Configured = () => {
  const id = process.env.R2_ACCOUNT_ID || ''
  const key = process.env.R2_ACCESS_KEY_ID || ''
  const valid = (v: string) => v.length > 0 && !v.startsWith('your-')
  return valid(id) && valid(key)
}

export async function saveAsset(
  file: File,
  folder: string
): Promise<{ url: string; key: string }> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const objectKey = `${folder}/${nanoid()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  if (!r2Configured()) {
    throw new Error('R2 未設定，無法上傳檔案')
  }
  const { uploadToR2 } = await import('./r2')
  const url = await uploadToR2(buffer, objectKey, file.type)
  return { url, key: objectKey }
}

export async function deleteAsset(key: string | null | undefined): Promise<void> {
  if (!key) return
  try {
    if (r2Configured() && !key.startsWith('local:')) {
      const { deleteFromR2 } = await import('./r2')
      await deleteFromR2(key)
    }
  } catch (err) {
    console.warn('[assets] 刪除資產失敗（略過）：', (err as Error)?.message)
  }
}

export { nanoid }
