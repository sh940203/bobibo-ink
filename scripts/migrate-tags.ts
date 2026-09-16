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

const db = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN! })

async function main() {
  await db.execute(`ALTER TABLE artworks ADD COLUMN tags TEXT DEFAULT NULL`)
  console.log('✓ artworks.tags 欄位新增完成')
}
main().catch((e) => { console.error(e); process.exit(1) })
