import GalleryGrid from '@/components/site/GalleryGrid'
import { getAllArtworks } from '@/lib/queries'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata = {
  title: '作品集 — 彈塗魚・tattoo 魚',
}

export default async function GalleryPage() {
  const artworks = await getAllArtworks()
  return <GalleryGrid artworks={artworks} />
}
