// 前台資料讀取層。所有查詢集中於此，方便 Server Component 直接呼叫。
import { db } from './db'
import type {
  Artwork,
  AboutContent,
  BookingRule,
  Announcement,
  StudioPhoto,
  Pricing,
} from './types'

// 若資料庫尚未設定（placeholder 連線），讓前台仍能渲染骨架而不整頁崩潰。
async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[queries] DB 讀取失敗，使用 fallback：', (err as Error)?.message)
    return fallback
  }
}

export function getFeaturedArtworks() {
  return safe(async () => {
    const r = await db.execute(
      'SELECT * FROM artworks WHERE is_featured = 1 ORDER BY display_order ASC LIMIT 4'
    )
    return r.rows as unknown as Artwork[]
  }, [])
}

export function getAllArtworks() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM artworks ORDER BY created_at DESC')
    return r.rows as unknown as Artwork[]
  }, [])
}

export function getAbout() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM about_content WHERE id = 1')
    return (r.rows[0] as unknown as AboutContent) ?? null
  }, null)
}

export function getBookingRules() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM booking_rules ORDER BY display_order ASC')
    return r.rows as unknown as BookingRule[]
  }, [])
}

export function getAnnouncement() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM announcements WHERE id = 1')
    return (r.rows[0] as unknown as Announcement) ?? null
  }, null)
}

export function getStudioPhotos() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM studio_photos ORDER BY display_order ASC LIMIT 3')
    return r.rows as unknown as StudioPhoto[]
  }, [])
}

export function getPricing() {
  return safe(async () => {
    const r = await db.execute('SELECT * FROM pricing')
    return r.rows as unknown as Pricing[]
  }, [])
}
