/**
 * 強制覆蓋文字內容（about_content / booking_rules）為最新文案。
 * 不動圖片資料。執行：npm run db:reseed-content
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
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
})

const ABOUT = `因為常被朋友說長得像魚，所以工作室也乾脆取名叫彈塗魚。

是一位持續學習中的刺青工作者，目前以居家工作室形式接案，希望透過作品留下每個人珍惜的人、事、物。

目前以寵物肖像、動漫人物、線條文字及客製化小圖為主要創作方向。

如果你有想記住的人、事、物，或只是單純喜歡某個圖案，歡迎找我一起討論，把它變成專屬於你的作品。

比起複製別人的圖案，我更喜歡和你一起創作屬於你的故事。`

const RULES = [
  '不接未滿十八歲顧客',
  '目前暫時以女性顧客預約為主',
  '預約需支付訂金，金額依圖案大小而定',
  '完成預約後恕不退還訂金，如需改期請提前告知，可保留一次改期機會',
  '刺青前一天請勿飲酒',
  '刺青前一天務必睡眠充足',
  '刺青當天務必吃飽，避免空腹',
  '盡量穿著深色服裝或方便施作的衣物，以免沾染顏料',
  '付費方式：現金／匯款',
  '攜伴需提前告知，由於工作室空間不大，僅開放攜伴一位',
  '工作室備有沙發及插座可供使用',
  '遲到保留 15 分鐘，超過時間視同取消，訂金不予退還（若有緊急狀況請提前聯繫）',
  '欲更改預約時間，請於三天前告知',
  '刺青完成後將提供完整保養說明',
]

async function main() {
  console.log('▸ 更新 about_content...')
  await db.execute({
    sql: `INSERT INTO about_content (id, body_text, updated_at) VALUES (1, ?, datetime('now'))
          ON CONFLICT(id) DO UPDATE SET body_text = excluded.body_text, updated_at = datetime('now')`,
    args: [ABOUT],
  })

  console.log('▸ 重建 booking_rules...')
  await db.execute('DELETE FROM booking_rules')
  let order = 1
  for (const content of RULES) {
    await db.execute({
      sql: 'INSERT INTO booking_rules (content, display_order) VALUES (?, ?)',
      args: [content, order++],
    })
  }
  console.log(`✓ 完成，須知共 ${RULES.length} 條`)
}

main().catch((e) => {
  console.error('✗ 失敗：', e)
  process.exit(1)
})
