/**
 * 建立 Turso 資料庫 schema 並插入初始資料。
 * 執行：npm run db:setup
 * 需先在 .env.local 設定 TURSO_DATABASE_URL 與 TURSO_AUTH_TOKEN。
 */
import { createClient } from '@libsql/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// 簡易載入 .env.local
function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    // 沒有 .env.local 就略過，使用既有環境變數
  }
}
loadEnv()

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
})

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS artworks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT,
    category    TEXT NOT NULL CHECK(category IN ('client','practice','design')),
    image_url   TEXT NOT NULL,
    r2_key      TEXT NOT NULL,
    is_featured INTEGER NOT NULL DEFAULT 0 CHECK(is_featured IN (0,1)),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS about_content (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    body_text   TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS booking_rules (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    content       TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS announcements (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    is_visible  INTEGER NOT NULL DEFAULT 1 CHECK(is_visible IN (0,1)),
    message     TEXT NOT NULL DEFAULT '',
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS studio_photos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    image_url     TEXT NOT NULL,
    r2_key        TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS pricing (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    style       TEXT NOT NULL CHECK(style IN ('pet','anime','linework','custom')),
    size        TEXT NOT NULL CHECK(size IN ('S','M','L','XL')),
    price_range TEXT NOT NULL DEFAULT '',
    UNIQUE(style, size)
  )`,
]

const SEED = [
  `INSERT OR IGNORE INTO about_content (id, body_text) VALUES (
    1,
    '因為常被朋友說長得像魚，所以工作室也乾脆取名叫彈塗魚。

是一位持續學習中的刺青工作者，目前以居家工作室形式接案，希望透過作品留下每個人珍惜的人、事、物。

目前以寵物肖像、動漫人物、線條文字及客製化小圖為主要創作方向。

如果你有想記住的人、事、物，或只是單純喜歡某個圖案，歡迎找我一起討論，把它變成專屬於你的作品。

比起複製別人的圖案，我更喜歡和你一起創作屬於你的故事。'
  )`,
  `INSERT OR IGNORE INTO announcements (id, is_visible, message) VALUES (
    1,
    1,
    '工作室預計於今年十月搬遷至彰化縣員林市，詳細地址及工作室環境將於後續更新。'
  )`,
  `INSERT OR IGNORE INTO booking_rules (content, display_order) VALUES
    ('不接未滿十八歲顧客', 1),
    ('目前暫時以女性顧客預約為主', 2),
    ('預約需支付訂金，金額依圖案大小而定', 3),
    ('完成預約後恕不退還訂金，如需改期請提前告知，可保留一次改期機會', 4),
    ('刺青前一天請勿飲酒', 5),
    ('刺青前一天務必睡眠充足', 6),
    ('刺青當天務必吃飽，避免空腹', 7),
    ('盡量穿著深色服裝或方便施作的衣物，以免沾染顏料', 8),
    ('付費方式：現金／匯款', 9),
    ('攜伴需提前告知，由於工作室空間不大，僅開放攜伴一位', 10),
    ('工作室備有沙發及插座可供使用', 11),
    ('遲到保留 15 分鐘，超過時間視同取消，訂金不予退還（若有緊急狀況請提前聯繫）', 12),
    ('欲更改預約時間，請於三天前告知', 13),
    ('刺青完成後將提供完整保養說明', 14)`,
  `INSERT OR IGNORE INTO pricing (style, size, price_range) VALUES
    ('pet', 'S', '3,500 – 6,000'),
    ('pet', 'M', '6,000 – 12,000'),
    ('pet', 'L', '12,000 – 20,000'),
    ('pet', 'XL', '20,000+'),
    ('anime', 'S', '3,000 – 5,500'),
    ('anime', 'M', '5,500 – 11,000'),
    ('anime', 'L', '11,000 – 18,000'),
    ('anime', 'XL', '18,000+'),
    ('linework', 'S', '2,000 – 4,000'),
    ('linework', 'M', '4,000 – 8,000'),
    ('linework', 'L', '8,000 – 14,000'),
    ('linework', 'XL', '14,000+'),
    ('custom', 'S', '面議'),
    ('custom', 'M', '面議'),
    ('custom', 'L', '面議'),
    ('custom', 'XL', '面議')`,
]

async function main() {
  if (!process.env.TURSO_DATABASE_URL) {
    throw new Error('缺少 TURSO_DATABASE_URL，請先在 .env.local 設定')
  }
  console.log('▸ 建立 schema...')
  for (const stmt of SCHEMA) await db.execute(stmt)
  console.log('▸ 插入初始資料...')
  for (const stmt of SEED) await db.execute(stmt)
  console.log('✓ 資料庫初始化完成')
}

main().catch((err) => {
  console.error('✗ 失敗：', err)
  process.exit(1)
})
