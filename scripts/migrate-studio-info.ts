import { db } from '../lib/db'

async function main() {
  await db.execute(`ALTER TABLE announcements ADD COLUMN studio_city TEXT DEFAULT '彰化縣員林市'`)
  await db.execute(`ALTER TABLE announcements ADD COLUMN studio_desc TEXT DEFAULT '近員林火車站，居家工作室（採預約制）'`)
  // 把預設值寫進現有那一筆
  await db.execute({
    sql: `UPDATE announcements SET studio_city = '彰化縣員林市', studio_desc = '近員林火車站，居家工作室（採預約制）' WHERE id = 1`,
    args: [],
  })
  console.log('✓ studio_city / studio_desc 欄位新增完成')
}

main().catch((e) => { console.error(e); process.exit(1) })
