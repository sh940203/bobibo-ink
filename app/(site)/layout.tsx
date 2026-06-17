export const runtime = 'edge'

import Nav from '@/components/site/Nav'
import Footer from '@/components/site/Footer'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { getAnnouncement } from '@/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const announcement = await getAnnouncement()
  return (
    <>
      <ScrollReveal />
      <Nav />
      <main>{children}</main>
      <Footer announcement={announcement} />
    </>
  )
}
