import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Downtown Zionsville Indiana — Dining, Shopping & the Village',
  description:
    'Explore downtown Zionsville, Indiana — the Village district of brick-paved streets, local restaurants, boutique shops, and an unhurried pace on Main Street.',
  alternates: { canonical: 'https://zionsvilleindiana.com/downtown' },
}

const itineraries = [
  {
    title: 'Family: fresh air + a sweet finish',
    image: '/images/downtown/zionsville-lions-park-playground.jpg',
    alt: 'Family enjoying a walk near Lions Park in Zionsville',
    stops: [
      { name: "Greek's Pizzeria", note: 'Reliable downtown lunch spot' },
      { name: "Rosie's Place", note: 'Family-friendly breakfast or brunch', href: '/businesses/rosies-place' },
      { name: 'Zionsville Pizzeria', note: 'Another solid family lunch option' },
      { name: 'Lions Park', note: 'Playground and easy walking loop', href: '/parks/lions-park' },
      { name: 'Creekside Nature Park', note: 'Short nature walk', href: '/parks/creekside-nature-park' },
      { name: 'The Scoop', note: 'Ice cream to finish' },
    ],
  },
  {
    title: 'A slow morning wander',
    image: '/images/downtown/zionsville-main-street-shop.jpg',
    alt: 'Quiet morning along Main Street in downtown Zionsville',
    stops: [
      { name: 'Roasted in the Village', note: 'Best early — closes early afternoon', href: '/businesses/roasted-in-the-village' },
      { name: 'Our Place Coffee', note: 'Also a great early stop — closes early afternoon', href: '/businesses/our-place-coffee' },
      { name: 'Main Street shops', note: 'Browse at your own pace' },
      { name: "Rosie's Place", note: 'Brunch or early lunch', href: '/businesses/rosies-place' },
      { name: 'Truffles & Creams or Angelo\'s Italian Market', note: 'Pick up something for later' },
    ],
  },
  {
    title: 'An elevated evening',
    image: '/images/downtown/zionsville-main-street-restaurant.jpg',
    alt: 'Evening along brick-lined Main Street in Zionsville',
    stops: [
      { name: "Noah Grant's", note: 'Seafood & oyster bar — reservations recommended', href: '/businesses/noah-grants' },
      { name: 'Convivio', note: 'Artisan Italian — reservations recommended', href: '/businesses/convivio' },
      { name: 'Cobblestone', note: 'American fare on the brick street — reservations recommended', href: '/businesses/cobblestone' },
      { name: 'Main Street stroll', note: 'Brick streets after dark' },
      { name: 'The Scoop', note: 'Optional sweet finish' },
    ],
  },
]

export default function DowntownPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
          <Image
            src="/images/downtown/downtown-zionsville-indiana.jpg"
            alt="Main Street in downtown Zionsville, Indiana"
            fill
            className="object-cover object-[center_50%] opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Breadcrumb top-left */}
          <div className="absolute top-4 left-4 sm:left-6">
            <Breadcrumb items={[{ label: 'Downtown', href: '/downtown' }]} light />
          </div>

          {/* H1 + subtitle bottom-left */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
            <h1 className="font-display text-4xl sm:text-5xl text-white">Downtown Zionsville</h1>
            <p className="text-stone-300 mt-2">Brick streets, local shops, and an unhurried pace</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">

          {/* Section nav */}
          <div className="grid sm:grid-cols-2 gap-5 mb-16">
            <Link
              href="/downtown/dining"
              className="group relative rounded-lg overflow-hidden min-h-[180px] flex items-end bg-stone-800"
            >
              <div className="absolute inset-0">
                <Image src="/images/downtown/zionsville-downtown-dining.jpg" alt="Dining in downtown Zionsville" fill className="object-cover opacity-80 group-hover:opacity-95 transition-opacity" />
              </div>
              <div className="relative p-5">
                <h2 className="font-display text-2xl text-white">Dining</h2>
                <p className="text-stone-300 text-sm">Restaurants, cafés &amp; coffee shops</p>
              </div>
            </Link>
            <Link
              href="/downtown/shopping"
              className="group relative rounded-lg overflow-hidden min-h-[180px] flex items-end bg-stone-800"
            >
              <div className="absolute inset-0">
                <Image src="/images/downtown/zionsville-downtown-shopping.jpg" alt="Shopping in downtown Zionsville" fill className="object-cover opacity-80 group-hover:opacity-95 transition-opacity" />
              </div>
              <div className="relative p-5">
                <h2 className="font-display text-2xl text-white">Shopping</h2>
                <p className="text-stone-300 text-sm">Boutiques &amp; local shops on Main Street</p>
              </div>
            </Link>
          </div>

          {/* Itineraries */}
          <h2 className="font-display text-3xl text-stone-900 mb-2">Three easy ways to spend time in town</h2>
          <p className="text-stone-500 mb-10">Easy ideas you can enjoy at your own pace.</p>

          <div className="space-y-12">
            {itineraries.map((itin) => (
              <div key={itin.title} className="grid md:grid-cols-2 gap-8 items-start">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-stone-200">
                  <Image src={itin.image} alt={itin.alt} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-stone-900 mb-4">{itin.title}</h3>
                  <ol className="space-y-3">
                    {itin.stops.map((stop, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-brick-100 text-brick-700 flex items-center justify-center text-xs font-bold mt-0.5">
                          {i + 1}
                        </span>
                        <span>
                          {stop.href ? (
                            <Link href={stop.href} className="font-medium text-stone-800 hover:text-brick-600">
                              {stop.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-stone-800">{stop.name}</span>
                          )}
                          {' '}
                          <span className="text-stone-500">— {stop.note}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>

          {/* Parking */}
          <div id="parking" className="mt-16 pt-10 scroll-mt-6">
            <h2 className="font-display text-3xl text-stone-900 mb-6">Parking in Downtown Zionsville</h2>
            <div className="max-w-2xl space-y-4">
              <p className="text-stone-600 leading-relaxed">
                Street parking is available along Main Street and nearby streets, but fills quickly on busy weekends.
              </p>
              <p className="text-stone-600 leading-relaxed">
                The largest public parking lot is located at the northwest corner of Main Street and Sycamore Road, with access from both Main Street and First Street. A second lot is located at the southwest corner of Main Street and Pine Street.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Additional parking is available on nearby side streets and in public lots throughout the Village, including Lions Park, all within a short walk of downtown.
              </p>
            </div>
          </div>

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <div className="mt-16 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
            <Link href="/downtown/dining" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              Explore dining on Main Street →
            </Link>
            <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              See upcoming events →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
