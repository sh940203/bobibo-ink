import { createClient, type Client } from '@libsql/client/web'

// 延遲建立 client：避免在沒有 TURSO_DATABASE_URL 的環境（如建置階段）於
// import 時就丟錯。實際被使用時（Admin API）才初始化；前台走 seed fallback。
let _client: Client | null = null

function getClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) throw new Error('TURSO_DATABASE_URL 未設定')
    _client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    })
  }
  return _client
}

export const db = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getClient()
    const value = (client as any)[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
