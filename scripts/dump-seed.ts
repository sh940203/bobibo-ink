import { createClient } from '@libsql/client'
import { writeFileSync } from 'node:fs'
async function main() {
  const db = createClient({ url: 'file:local.db' })
  const q = async (s: string) => (await db.execute(s)).rows
  const data = {
    artworks: await q('SELECT * FROM artworks ORDER BY display_order ASC, created_at DESC'),
    about: (await q('SELECT * FROM about_content WHERE id=1'))[0] ?? null,
    booking_rules: await q('SELECT * FROM booking_rules ORDER BY display_order ASC'),
    announcement: (await q('SELECT * FROM announcements WHERE id=1'))[0] ?? null,
    studio_photos: await q('SELECT * FROM studio_photos ORDER BY display_order ASC'),
    pricing: await q('SELECT * FROM pricing'),
  }
  writeFileSync('lib/seed-data.json', JSON.stringify(data, null, 2))
  console.log('artworks:', data.artworks.length, 'rules:', data.booking_rules.length, 'pricing:', data.pricing.length)
}
main()
