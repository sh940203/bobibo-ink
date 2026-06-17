import { createClient } from '@libsql/client'

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  // 本機 file: 資料庫不需要 token；遠端 Turso 才需要
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})
