// 前台資料讀取層。所有查詢集中於此，方便 Server Component 直接呼叫。
// 若未設定 Turso（或讀取失敗），改用打包的靜態種子資料 seed-data.json，
// 讓網站在尚未接上遠端資料庫前仍能完整呈現（唯讀）。
import { db } from './db'
import seed from './seed-data.json'
import type {
  Artwork,
  AboutContent,
  BookingRule,
  Announcement,
  StudioPhoto,
  Pricing,
} from './types'

const hasDb = !!process.env.TURSO_DATABASE_URL

const SEED = seed as unknown as {
  artworks: Artwork[]
  about: AboutContent | null
  booking_rules: BookingRule[]
  announcement: Announcement | null
  studio_photos: StudioPhoto[]
  pricing: Pricing[]
}

// 有 DB 就查 DB，否則 / 失敗時回退種子資料
async function read<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!hasDb) return fallback
  try {
    return await fn()
  } catch (err) {
    console.warn('[queries] DB 讀取失敗，改用種子資料：', (err as Error)?.message)
    return fallback
  }
}

export function getFeaturedArtworks() {
  return read(async () => {
    const r = await db.execute(
      'SELECT * FROM artworks WHERE is_featured = 1 ORDER BY display_order ASC LIMIT 4'
    )
    return r.rows as unknown as Artwork[]
  }, SEED.artworks.filter((a) => a.is_featured === 1).slice(0, 4))
}

export function getAllArtworks() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM artworks ORDER BY created_at DESC')
    return r.rows as unknown as Artwork[]
  }, SEED.artworks)
}

export function getAbout() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM about_content WHERE id = 1')
    return (r.rows[0] as unknown as AboutContent) ?? null
  }, SEED.about)
}

export function getBookingRules() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM booking_rules ORDER BY display_order ASC')
    return r.rows as unknown as BookingRule[]
  }, SEED.booking_rules)
}

export function getAnnouncement() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM announcements WHERE id = 1')
    return (r.rows[0] as unknown as Announcement) ?? null
  }, SEED.announcement)
}

export function getHeroPhotos() {
  return read(async () => {
    const r = await db.execute(
      'SELECT * FROM artworks WHERE is_hero = 1 ORDER BY display_order ASC LIMIT 6'
    )
    return r.rows as unknown as Artwork[]
  }, (SEED.artworks as any[]).filter((a) => a.is_hero === 1).slice(0, 6) as Artwork[])
}

export function getStudioPhotos() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM studio_photos ORDER BY display_order ASC')
    return r.rows as unknown as StudioPhoto[]
  }, SEED.studio_photos)
}

export function getPricing() {
  return read(async () => {
    const r = await db.execute('SELECT * FROM pricing')
    return r.rows as unknown as Pricing[]
  }, SEED.pricing)
}
