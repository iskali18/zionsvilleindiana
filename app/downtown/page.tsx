import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Downtown Zionsville Indiana — Things to Do, Dining & Shopping',
  description:
    'Explore downtown Zionsville: dining on the brick-paved Village streets, local boutiques, family itineraries, parking info, and what to do on a visit to Main Street.',
  alternates: { canonical: 'https://zionsvilleindiana.com/downtown' },
}

const itineraries = [
  {
    title: 'Family time near the Village',
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
    title: 'A leisurely morning downtown',
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

const faqs = [
  {
    q: 'What is downtown Zionsville?',
    a: 'Downtown Zionsville is the Village district — a historic area centered on brick-paved Main Street, known for locally owned restaurants, boutiques, cafés, and small businesses. It is the most visited part of town.',
  },
  {
    q: 'Where is downtown Zionsville?',
    a: 'Downtown Zionsville is located along Main Street in Boone County, Indiana, about 20 miles northwest of Indianapolis. The Village district covers Main Street and several nearby blocks.',
  },
  {
    q: 'Is downtown Zionsville walkable?',
    a: 'Yes. The Village is compact and walkable, with brick streets and side streets lined with shops, restaurants, and cafés. Public parking is available within a short walk of Main Street.',
  },
  {
    q: 'What is there to do in downtown Zionsville?',
    a: 'Downtown Zionsville is a walking destination for dining, coffee, shopping at locally owned boutiques, gift shops, galleries, and attending seasonal events like the Farmers Market, Brick Street Market, Christmas in the Village, and the Fall Festival.',
  },
  {
    q: 'When are downtown Zionsville shops open?',
    a: 'Most downtown Zionsville shops are open Tuesday through Saturday during the day, with some open on Sundays. Restaurants and cafés have their own hours, and many are open evenings. Check individual business pages or websites for current hours.',
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function DowntownPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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

          {/* Intro */}
          <section className="max-w-3xl mb-12">
            <h2 className="font-display text-3xl text-stone-900 mb-4">Explore Downtown Zionsville</h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Downtown Zionsville is centered around the Village, a historic district known for its brick-paved Main Street, locally owned restaurants, boutiques, cafés, galleries, and small businesses. It is the part of Zionsville most visitors picture first — walkable streets, older storefronts, shaded sidewalks, and a slower pace than nearby suburban shopping centers.
            </p>
            <p className="text-stone-700 leading-relaxed">
              The Village is compact enough to explore on foot but has enough variety to fill a morning, an afternoon, a dinner out, or a full event day. Visitors come for a meal, browse the shops, meet friends for coffee, attend a seasonal event, or walk between Main Street, Lions Park, and the nearby side streets.
            </p>
          </section>

          {/* What you'll find */}
          <section className="max-w-3xl mb-16">
            <h2 className="font-display text-2xl text-stone-900 mb-4">What you'll find downtown</h2>
            <ul className="space-y-2 text-stone-700">
              <li className="flex gap-2"><span className="text-brick-600">•</span> Local restaurants, cafés, bakeries, and dessert shops</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Boutiques, gift shops, galleries, and home décor businesses</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Brick streets, historic buildings, and walkable side streets</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Community events, markets, parades, and seasonal celebrations</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Nearby outdoor areas including Lions Park and Creekside Nature Park</li>
            </ul>
          </section>

          {/* Section nav cards */}
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
          <h2 className="font-display text-3xl text-stone-900 mb-2">Three ways to spend time downtown</h2>
          <p className="text-stone-500 mb-10 max-w-3xl">
            Downtown Zionsville can be a short visit or the center of a slower day. These itineraries combine food, shopping, outdoor time, and a walk through the Village.
          </p>

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

          {/* Events */}
          <section className="mt-16 max-w-3xl">
            <h2 className="font-display text-3xl text-stone-900 mb-4">Plan around downtown events</h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Downtown Zionsville is also the center of community gatherings throughout the year. Main Street and the Village host farmers markets, shopping events, parades, holiday activities, and seasonal celebrations.
            </p>
            <p className="text-stone-700 leading-relaxed mb-4">
              Some of Zionsville's best-known events take place downtown or connect directly to the Village, including the{' '}
              <Link href="/events/farmers-market" className="text-brick-600 hover:text-brick-700 font-medium">Zionsville Farmers Market</Link>
              , Brick Street Market,{' '}
              <Link href="/events/christmas-in-the-village" className="text-brick-600 hover:text-brick-700 font-medium">Christmas in the Village</Link>
              , and the{' '}
              <Link href="/events/fall-festival" className="text-brick-600 hover:text-brick-700 font-medium">Fall Festival</Link>.
            </p>
            <p className="text-stone-700 leading-relaxed mb-4">
              Before planning a visit, check the events calendar to see what is happening that weekend.
            </p>
            <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              See upcoming Zionsville events →
            </Link>
          </section>

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

            {/* Parking map */}
            <div className="mt-8 max-w-4xl">
              <div className="aspect-[4/3] sm:aspect-[16/10] rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                <iframe
                  src="https://www.google.com/maps/d/u/3/embed?mid=1z0IVCRW4QJExI1aa_wvOZ1LwYXDkzNA&ehbc=2E312F"
                  title="Map of public parking in downtown Zionsville, Indiana"
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Parking lots and street parking near downtown Zionsville. Pinch or scroll to zoom.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <section className="mt-16 max-w-3xl">
            <h2 className="font-display text-3xl text-stone-900 mb-6">Frequently asked questions</h2>
            <dl className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="bg-stone-50 rounded-lg p-5 border border-stone-200"
                >
                  <dt className="font-display text-base font-semibold text-stone-900 mb-2">
                    {q}
                  </dt>
                  <dd className="text-sm text-stone-700 leading-relaxed">{a}</dd>
                </div>
              ))}
            </dl>
          </section>

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
