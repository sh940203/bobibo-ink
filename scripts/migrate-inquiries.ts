/**
 * 建立 inquiries 表（客戶詢問表單記錄）
 * 執行：npx tsx scripts/migrate-inquiries.ts
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {}
}
loadEnv()

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

async function main() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      contact       TEXT NOT NULL,
      style         TEXT,
      parts         TEXT,
      size          TEXT,
      description   TEXT,
      preferred_time TEXT,
      is_read       INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  console.log('✓ inquiries 表建立完成')
}

main().catch((err) => { console.error('✗', err); process.exit(1) })
