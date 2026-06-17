/**
 * 用 public/images 內的真實圖片填入 artworks 與 studio_photos。
 * 本機開發用（image_url 指向 /images/...）。執行：npm run db:seed-images
 * 之後正式環境改用 Admin 上傳到 R2。
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

type Cat = 'client' | 'practice' | 'design'

// [image_url, category, title, is_featured]
// 依實際檔案夾分類：作品集(實際客人)=client、人工皮練習=practice、認領圖=design
const ARTWORKS: [string, Cat, string | null, 0 | 1][] = [
  // client（作品集・實際客人）
  ['/images/works/12.jpg', 'client', '蝴蝶與櫻花', 1],
  ['/images/works/1.jpg', 'client', '羅馬數字', 1],
  ['/images/works/8.jpg', 'client', '星與月', 0],
  ['/images/works/2.jpg', 'client', '小符號排列', 0],
  ['/images/works/3.jpg', 'client', '羅馬數字', 0],
  ['/images/works/4.jpg', 'client', '軟糖熊', 0],
  ['/images/works/5.jpg', 'client', '蝴蝶', 0],
  ['/images/works/6.jpg', 'client', '雲與月', 0],
  ['/images/works/7.jpg', 'client', '星星', 0],
  ['/images/works/9.jpg', 'client', '幸運草與流星', 0],
  ['/images/works/10.jpg', 'client', '羅馬數字', 0],
  ['/images/works/11.jpg', 'client', '蝴蝶與花', 0],
  // practice（人工皮練習）
  ['/images/practice/1.jpg', 'practice', '狼與虎', 1],
  ['/images/practice/3.jpg', 'practice', '動漫人物', 0],
  ['/images/practice/4.jpg', 'practice', '動漫人物', 0],
  ['/images/practice/2.jpg', 'practice', '小圖練習', 0],
  // design（認領圖）
  ['/images/designs/1.png', 'design', '花與字', 1],
  ['/images/designs/2.png', 'design', '蓮花', 0],
  ['/images/designs/3.png', 'design', '酒杯', 0],
  ['/images/designs/4.png', 'design', '認領圖', 0],
  ['/images/designs/5.png', 'design', '認領圖', 0],
]

const STUDIO = ['/images/personal/portrait.jpg', '/images/personal/dog.jpg', '/images/personal/cat.jpg']

async function main() {
  console.log('▸ 重建 artworks 表（新分類 client/practice/design）...')
  await db.execute('DROP TABLE IF EXISTS artworks')
  await db.execute(`CREATE TABLE artworks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    category    TEXT NOT NULL CHECK(category IN ('client','practice','design')),
    image_url   TEXT NOT NULL,
    r2_key      TEXT NOT NULL,
    is_featured INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0,1)),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`)
  console.log('▸ 清空 studio_photos...')
  await db.execute('DELETE FROM studio_photos')

  console.log('▸ 插入 artworks...')
  let order = 0
  for (const [url, cat, title, feat] of ARTWORKS) {
    // r2_key 留空字串（本機圖片非 R2 物件，刪除時會略過 R2 刪除）
    await db.execute({
      sql: 'INSERT INTO artworks (title, category, image_url, r2_key, is_featured, display_order) VALUES (?,?,?,?,?,?)',
      args: [title, cat, url, '', feat, order++],
    })
  }

  console.log('▸ 插入 studio_photos...')
  let so = 0
  for (const url of STUDIO) {
    await db.execute({
      sql: 'INSERT INTO studio_photos (image_url, r2_key, display_order) VALUES (?,?,?)',
      args: [url, '', so++],
    })
  }

  const n = await db.execute('SELECT COUNT(*) AS c FROM artworks')
  console.log(`✓ 完成，artworks 共 ${(n.rows[0] as any).c} 筆`)
}

main().catch((e) => {
  console.error('✗ 失敗：', e)
  process.exit(1)
})
