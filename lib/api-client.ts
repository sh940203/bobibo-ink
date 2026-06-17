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
    throw new Error(e.error || `請求失敗（${res.status}）`)
  }
  return res.json().catch(() => ({} as T))
}

// 上傳檔案到 /api/upload，回傳 { url, key }
export async function uploadFile(file: File, folder: string): Promise<{ url: string; key: string }> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('folder', folder)
  return api('/api/upload', { method: 'POST', body: fd })
}
