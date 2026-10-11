// 共用型別定義

// 估價／詢價用的「創作風格」（pricing.style 與詢價表單共用）
export type Category = 'pet' | 'anime' | 'linework' | 'custom'
export type Size = 'S' | 'M' | 'L' | 'XL'

// 作品集分類（依實際檔案夾分類，與創作風格獨立）
export type GalleryCategory = 'client' | 'practice' | 'design'

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  client: '作品集',
  practice: '人工皮練習',
  design: '認領圖',
}

export const GALLERY_CATEGORIES: GalleryCategory[] = ['client', 'practice', 'design']

export interface Artwork {
  id: number
  title: string | null
  category: GalleryCategory
  image_url: string
  r2_key: string
  is_featured: number // 0 | 1
  is_hero: number    // 0 | 1（首頁翅膀展示，最多 6 張）
  tags: string | null  // JSON array of custom tag strings
  display_order: number
  created_at: string
}

export interface AboutContent {
  id: number
  body_text: string
  updated_at: string
}

export interface BookingRule {
  id: number
  content: string
  display_order: number
}

export interface Announcement {
  id: number
  is_visible: number // 0 | 1
  message: string
  studio_city: string | null
  studio_desc: string | null
  updated_at: string
}

export interface StudioPhoto {
  id: number
  image_url: string
  r2_key: string
  display_order: number
}

export interface Pricing {
  id: number
  style: Category
  size: Size
  price_range: string
}

// 中文標籤對照
export const CATEGORY_LABELS: Record<Category, string> = {
  pet: '寵物肖像',
  anime: '動漫人物',
  linework: '線條文字',
  custom: '客製小圖',
}

export const SIZE_LABELS: Record<Size, string> = {
  S: '手掌以下（約 5cm 內）',
  M: '手掌大小（約 5–10cm）',
  L: '手掌以上（約 10–15cm）',
  XL: '大面積（15cm 以上）',
}

export const CATEGORIES: Category[] = ['pet', 'anime', 'linework', 'custom']
export const SIZES: Size[] = ['S', 'M', 'L', 'XL']
