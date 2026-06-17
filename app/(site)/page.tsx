export const runtime = 'edge'

import Hero from '@/components/site/Hero'
import About from '@/components/site/About'
import Gallery from '@/components/site/Gallery'
import BookingRules from '@/components/site/BookingRules'
import InquiryForm from '@/components/site/InquiryForm'
import {
  getFeaturedArtworks,
  getHeroPhotos,
  getAbout,
  getStudioPhotos,
  getAnnouncement,
  getBookingRules,
  getPricing,
} from '@/lib/queries'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [featured, heroPhotos, about, photos, announcement, rules, pricing] = await Promise.all([
    getFeaturedArtworks(),
    getHeroPhotos(),
    getAbout(),
    getStudioPhotos(),
    getAnnouncement(),
    getBookingRules(),
    getPricing(),
  ])

  return (
    <>
      <Hero heroPhotos={heroPhotos} />
      <About about={about} photos={photos} announcement={announcement} />
      <Gallery featured={featured} />
      <BookingRules rules={rules} />
      <InquiryForm pricing={pricing} />
    </>
  )
}
