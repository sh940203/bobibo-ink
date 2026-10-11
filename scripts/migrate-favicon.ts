import { db } from '../lib/db'

async function main() {
  await db.execute(`ALTER TABLE announcements ADD COLUMN favicon_url TEXT DEFAULT NULL`)
  console.log('✓ favicon_url 欄位新增完成')
}
main().catch((e) => { console.error(e); process.exit(1) })
