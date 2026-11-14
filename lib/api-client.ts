// 前端 admin 共用 fetch 包裝
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: {
      ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(opts.headers || {}),
    },
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || (res.status === 413 ? '檔案太大，請換較小的圖片' : `請求失敗（${res.status}）`))
  }
  return res.json().catch(() => ({} as T))
}

// Vercel 的 serverless function 請求大小上限約 4.5MB，超過會直接回 413（連我們的程式都沒執行到）。
// 手機原圖常常 4~10MB，所以上傳前先在瀏覽器端縮圖壓縮，確保低於上限。
const SAFE_BYTES = 3.8 * 1024 * 1024

async function shrinkImage(file: File): Promise<File> {
  if (file.size <= SAFE_BYTES) return file
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file // GIF 等不處理

  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null)
  if (!bitmap) return file

  const isPng = file.type === 'image/png'
  // 由大到小逐步嘗試；PNG 先保留透明背景，最後一招才轉成 JPEG
  const steps: { max: number; q: number; type: string }[] = [
    { max: 2600, q: 0.88, type: isPng ? 'image/png' : 'image/jpeg' },
    { max: 2000, q: 0.82, type: isPng ? 'image/png' : 'image/jpeg' },
    { max: 1600, q: 0.78, type: 'image/jpeg' },
    { max: 1200, q: 0.7, type: 'image/jpeg' },
  ]

  for (const { max, q, type } of steps) {
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) break
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#fff' // JPEG 沒有透明，墊白底
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, type, q))
    if (blob && blob.type === type && blob.size <= SAFE_BYTES) {
      bitmap.close?.()
      const ext = type === 'image/png' ? 'png' : 'jpg'
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type })
    }
  }
  bitmap.close?.()
  throw new Error('圖片太大，無法壓縮到上傳上限，請換一張較小的圖')
}

// 上傳檔案到 /api/upload，回傳 { url, key }
export async function uploadFile(file: File, folder: string): Promise<{ url: string; key: string }> {
  const small = await shrinkImage(file)
  const fd = new FormData()
  fd.append('file', small)
  fd.append('folder', folder)
  return api('/api/upload', { method: 'POST', body: fd })
}
