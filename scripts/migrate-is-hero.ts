/**
 * 新增 is_hero 欄位到 artworks 表。
 * 執行：npx tsx scripts/migrate-is-hero.ts
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
  try {
    await db.execute(`ALTER TABLE artworks ADD COLUMN is_hero INTEGER NOT NULL DEFAULT 0`)
    console.log('✓ 已新增 is_hero 欄位')
  } catch (e: any) {
    if (e?.message?.includes('duplicate column')) {
      console.log('— is_hero 欄位已存在，略過')
    } else {
      throw e
    }
  }
}

main().catch((err) => { console.error('✗', err); process.exit(1) })
