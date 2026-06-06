import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'

export const metadata: Metadata = {
  title: 'Downtown Zionsville, Indiana — Dining, Shopping, Coffee & Events',
  description:
    'A guide to downtown Zionsville, Indiana: Main Street dining, local shopping, coffee, seasonal events, parking, and sample itineraries for time in the Village.',
  alternates: { canonical: 'https://zionsvilleindiana.com/downtown' },
}

// Helper: check whether an itinerary image exists in public/.
// Drop a file at the given path to make the floating image appear;
// otherwise the itinerary renders text-only.
function imageIfExists(relPath: string): string | null {
  try {
    return fs.existsSync(path.join(process.cwd(), 'public', relPath)) ? relPath : null
  } catch {
    return null
  }
}

// href can be an internal /businesses/{slug} page or an external URL.
type Stop = { name: string; href?: string; external?: boolean; note: string }
type Itinerary = {
  id: string
  title: string
  intro: string
  image: string
  imageAlt: string
  stops: Stop[]
}

const itineraries: Itinerary[] = [
  {
    id: 'things-to-do-in-zionsville-with-kids',
    title: 'Family time near the Village',
    intro:
      'This downtown plan pairs a casual meal with outdoor time close to Main Street. It keeps the day simple for families, with a short walk through the Village, playground time at Lions Park, and a manageable nature trail nearby.',
    image: '/images/downtown/zionsville-lions-park-playground.jpg',
    imageAlt: 'Downtown Zionsville, Indiana',
    stops: [
      { name: "Greek's Pizzeria", href: '/businesses/greeks-pizzeria', note: 'casual downtown lunch' },
      { name: 'Main Street', note: 'a short walk through the Village' },
      { name: 'Lions Park', href: 'https://www.zionsville-in.gov/710/Lions-Park', external: true, note: 'playground and open space close to downtown' },
      { name: 'Creekside Nature Park', href: 'https://www.zionsville-in.gov/703/Creekside-Nature-Park', external: true, note: 'from Lions Park, follow the path under the nearby bridge to a 0.6-mile wooded loop with glimpses of Eagle Creek' },
      { name: 'The Scoop', href: '/businesses/the-scoop', note: 'ice cream before heading home' },
    ],
  },
  {
    id: 'places-to-get-breakfast-in-zionsville',
    title: 'A leisurely morning downtown',
    intro:
      'A downtown morning can work best when you start with coffee or tea, browse as the shops open, and add brunch or baked goods before leaving the Village. This route is especially useful for a Saturday morning or a low-key weekday plan.',
    image: '/images/downtown/downtown-zionsville-rosies-place-sign.webp',
    imageAlt: 'Downtown Zionsville, Indiana',
    stops: [
      { name: 'Our Place Coffee', href: '/businesses/our-place-coffee', note: 'coffee to start the morning' },
      { name: 'Main Street shops', note: 'browse boutiques, gifts, books, jewelry, and home décor' },
      { name: "Rosie's Place", href: '/businesses/rosies-place', note: 'sit-down brunch with French toast, omelets, or lunch options' },
      { name: "The Baker's House", href: 'https://bakershousebread.com/', external: true, note: 'organic sourdough or pastries to take home; weekend visits are best by early afternoon' },
    ],
  },
  {
    id: 'zionsville-date-night-itinerary',
    title: 'An elevated evening',
    intro:
      'In the evening, downtown becomes more dinner-focused. This plan gives you time to browse a gallery before dinner, settle in for a sit-down meal, and end with a walk or dessert along Main Street.',
    image: '/images/downtown/zionsville-main-street-restaurant.jpg',
    imageAlt: 'Downtown Zionsville, Indiana',
    stops: [
      { name: 'Thomas Kinkade Zionsville Gallery', href: 'https://cvartandframe.com/', external: true, note: 'browse before dinner; check hours, since the gallery may close before nearby restaurants' },
      { name: 'Convivio', href: '/businesses/convivio', note: 'dinner downtown; reservations are worth considering' },
      { name: 'Cobblestone', href: '/businesses/cobblestone', note: 'another sit-down dinner option on Main Street' },
      { name: 'Main Street', note: 'an evening walk through the Village' },
      { name: 'The Scoop', href: '/businesses/the-scoop', note: 'casual, classic ice cream to end the night' },
    ],
  },
  {
    id: 'zionsville-bakeries-bagels-and-treats',
    title: 'Bakeries, bagels, and take-home treats',
    intro:
      "This route highlights downtown’s bakeries, bagels, chocolates, cookies, and coffee. Pick a few stops, or follow the list as a loose path for finding something fresh-baked, sweet, or easy to take home. It works best earlier in the day, since several bakeries and coffee shops keep daytime hours.",
    image: '/images/downtown/downtown-zionsville-truffles-and-creams.webp',  
    imageAlt: 'Downtown Zionsville, Indiana',
    stops: [
      { name: 'Gables Bagels', href: 'https://gablesbagels.com/', external: true, note: 'fresh bagels and breakfast items' },
      { name: "The Baker's House", href: 'https://bakershousebread.com/', external: true, note: 'sourdough and baked goods' },
      { name: "Rosie's Place", href: '/businesses/rosies-place', note: 'gooey butter cookies at the front counter' },
      { name: 'Truffles & Creams', href: '/businesses/truffles-and-creams', note: 'handmade chocolates to take home' },
      { name: 'Roasted in the Village', href: '/businesses/roasted-in-the-village', note: 'coffee nearby before heading out' },
    ],
  },
  {
    id: 'zionsville-wine-and-italian-market',
    title: 'A European-inspired afternoon downtown',
    intro:
      'This afternoon plan combines gift shopping, French patio dining, wine browsing, and Italian market items in the Village. Start at Gifted on Cedar Street for gifts, candles, or home accessories sourced from Europe and the United States. Then head to Auberge for lunch at the Brick Street Inn, browse Grapevine Cottage for wine or gifts, and stop by Angelo\u2019s Italian Market for fresh pasta, sauces, or Italian items to take home.',
    image: '/images/businesses/zionsville-gifted-1.jpg',
    imageAlt: 'Downtown Zionsville, Indiana',
    stops: [
      { name: 'Gifted', href: '/businesses/gifted', note: 'European and American gifts just off Main Street' },
      { name: 'Auberge', href: 'https://www.auberge-restaurant.com/', external: true, note: 'French lunch at the Brick Street Inn' },
      { name: 'Grapevine Cottage', href: 'https://grapevinecottage.com/', external: true, note: 'French and Italian wines, gifts, and accessories' },
      { name: "Angelo's Italian Market", href: '/businesses/angelos-italian-market', note: 'fresh pasta, sauces, and Italian pantry items' },
    ],
  },
]

const faqs = [
  {
    q: 'What is downtown Zionsville?',
    a: 'Downtown Zionsville is the Village district — a historic area centered on brick-paved Main Street, known for locally owned restaurants, boutiques, cafés, and small businesses.',
  },
  {
    q: 'What is the difference between downtown Zionsville and the Village?',
    a: 'They refer to the same central area. The Village is the historic residential and commercial district centered on the brick-paved section of Main Street, which is also referred to as downtown Zionsville.',
  },
  {
    q: 'Where is the main shopping and dining district in Zionsville?',
    a: 'Most locally owned boutiques, specialty shops, and restaurants are located on Main Street and its immediate side streets, forming a walkable commercial corridor in the Village.',
  },
  {
    q: 'What are some places to eat on Main Street in Zionsville?',
    a: 'Downtown Zionsville has a range of locally owned restaurants and cafés, including Rosie\u2019s Place for breakfast and brunch, Greek\u2019s Pizzeria and Zionsville Pizzeria for casual meals, Cobblestone and Convivio for sit-down dining, Auberge for French cuisine with patio seating, and Gables Bagels for breakfast and lunch. For coffee, Our Place Coffee and Roasted in the Village are both near Main Street.',
  },
  {
    q: 'Where is downtown Zionsville?',
    a: 'Downtown Zionsville is located along Main Street in Boone County, Indiana, about 20 miles northwest of Indianapolis. The Village district covers Main Street and several nearby blocks.',
  },
  {
    q: 'Is downtown Zionsville walkable?',
    a: 'Yes. The Village is compact and walkable, with the brick-lined Main Street and side streets lined with shops, restaurants, and cafés. Public parking is available within a short walk of Main Street.',
  },
  {
    q: 'What is there to do in downtown Zionsville?',
    a: 'Downtown Zionsville is a walking destination for dining, coffee, shopping at locally owned boutiques, gift shops, and galleries, and attending seasonal events like the Farmers Market, Brick Street Market, Christmas in the Village, and the Fall Festival.',
  },
  {
    q: 'When are downtown Zionsville shops open?',
    a: 'Downtown business hours vary by restaurant, shop, and season. Many shops such as boutiques and cafés keep daytime hours, while many restaurants are open to serve dinner. Check individual business websites or social pages before heading downtown.',
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

// Render a stop's name as an internal Link, external anchor, or plain text.
function StopName({ stop }: { stop: Stop }) {
  if (!stop.href) {
    return <span className="font-medium text-stone-800">{stop.name}</span>
  }
  if (stop.external) {
    return (
      <a
        href={stop.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-stone-800 hover:text-brick-600"
      >
        {stop.name}
      </a>
    )
  }
  return (
    <Link href={stop.href} className="font-medium text-stone-800 hover:text-brick-600">
      {stop.name}
    </Link>
  )
}

// Reusable contained image. Full column width, fixed 3:2, rounded with subtle
// shadow. Renders only if the file exists in public/.
function ContainedImage({ src, alt }: { src: string; alt: string }) {
  const img = imageIfExists(src)
  if (!img) return null
  return (
    <figure className="relative aspect-[3/2] rounded-lg overflow-hidden bg-stone-200 shadow-sm">
      <Image src={img} alt={alt} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" />
    </figure>
  )
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
            src="/images/downtown/zionsville-indiana-main-street.webp"
            alt="Main Street in downtown Zionsville, Indiana"
            fill
            className="object-cover object-[center_55%] opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 sm:left-6">
            <Breadcrumb items={[{ label: 'Downtown', href: '/downtown' }]} light />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
            <h1 className="font-display text-4xl sm:text-5xl text-white">Downtown Zionsville</h1>
            <p className="text-stone-300 mt-2">Local restaurants, shops, cafés, and events in the Village</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

          {/* Intro */}
          <section className="mb-12">
            <h2 className="font-display text-3xl text-stone-900 mb-4">Explore Downtown Zionsville</h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Downtown Zionsville is built around the brick-paved Main Street that runs through the heart of the Village district. This walkable stretch is home to locally owned restaurants, cafés, boutiques, galleries, and small businesses.
            </p>
            <p className="text-stone-700 leading-relaxed">
              A downtown visit can be a quick stop or a full afternoon. Come for a meal, browse the shops, meet a friend for coffee, or plan around one of the seasonal events that bring people to Main Street throughout the year.
            </p>
          </section>

          {/* What you'll find */}
          <section className="mb-12">
            <h2 className="font-display text-2xl text-stone-900 mb-4">What you'll find downtown</h2>
            <ul className="space-y-2 text-stone-700 mb-6">
              <li className="flex gap-2"><span className="text-brick-600">•</span> Local restaurants, cafés, bakeries, and dessert shops</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Boutiques, gift shops, galleries, and home décor businesses</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> The brick-lined Main Street, historic buildings, and walkable side streets</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Seasonal events, markets, and parades throughout the year</li>
              <li className="flex gap-2"><span className="text-brick-600">•</span> Nearby outdoor areas including Lions Park and Creekside Nature Park</li>
            </ul>
            <ContainedImage src="/images/downtown/downtown-zionsville-sidewalk.webp" alt="Downtown Zionsville, Indiana" />
          </section>

          {/* Looking beyond Main Street */}
          <section className="mb-16">
            <h2 className="font-display text-2xl text-stone-900 mb-4">Looking beyond Main Street?</h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Downtown is the best starting point for a Zionsville visit, but there is more to explore around town — including the Big-4 Rail Trail, Zionsville Nature Center, SullivanMunce Cultural Center, Traders Point Creamery, Boone Village, and other dining areas outside the Village.
            </p>
            <Link href="/things-to-do" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              See things to do around Zionsville →
            </Link>
          </section>

          {/* Itineraries */}
          <div className="mb-10">
            <h2 className="font-display text-3xl text-stone-900 mb-2">Five ways to spend time downtown</h2>
            <p className="text-stone-500">
              Downtown Zionsville can fill a quick outing, a meal-centered plan, or
              a fuller afternoon with coffee, shopping, dining, and events. These
              sample itineraries give you a few ways to spend time in the Village.
            </p>
          </div>

          <div className="space-y-8">
            {itineraries.map((itin, idx) => {
              const img = imageIfExists(itin.image)
              return (
                <section
                  key={itin.id}
                  id={itin.id}
                  className="scroll-mt-6 bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Fixed 3:2 image on top — renders only if the file exists in public/.
                      First image loads with priority (near fold); rest lazy-load for
                      cellular-friendly data use. */}
                  {img && (
                    <div className="relative aspect-[3/2] bg-stone-200">
                      <Image
                        src={img}
                        alt={itin.imageAlt}
                        fill
                        priority={idx === 0}
                        className="object-cover"
                        sizes="(max-width: 896px) 100vw, 896px"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="font-display text-2xl text-stone-900 mb-2">{itin.title}</h3>
                    <p className="text-stone-700 leading-relaxed mb-4">{itin.intro}</p>

                    <ol className="space-y-3">
                      {itin.stops.map((stop, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-brick-100 text-brick-700 flex items-center justify-center text-xs font-bold mt-0.5">
                            {i + 1}
                          </span>
                          <span>
                            <StopName stop={stop} />
                            {' '}
                            <span className="text-stone-500">— {stop.note}</span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>
              )
            })}
          </div>

          {/* Section nav cards — 2-up, clearly clickable */}
          <section className="mt-16">
            <h2 className="font-display text-3xl text-stone-900 mb-3">Dining and shopping guides</h2>
            <p className="text-stone-700 leading-relaxed mb-6">
              Use these guides to plan where to eat, shop, and spend time in the Village. The dining guide covers restaurants, cafés, coffee, and dessert, while the shopping guide highlights books, jewelry, home décor, and other local shops. These guides are growing, and more businesses will be added over time.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <Link
                href="/downtown/dining"
                className="group block bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-brick-300 transition-all"
              >
                <div className="relative aspect-[3/2] bg-stone-200">
                  <Image src="/images/downtown/zionsville-downtown-dining.jpg" alt="Dining on Main Street in downtown Zionsville" fill className="object-cover" sizes="(max-width: 640px) 100vw, 436px" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-stone-900 group-hover:text-brick-600 transition-colors mb-2">Dining</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-3">
                    Browse downtown restaurants, cafés, coffee shops, and dessert spots, with details on each business and where to find them in the Village.
                  </p>
                  <span className="text-sm text-brick-600 group-hover:text-brick-700 font-medium">
                    Explore dining <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
              <Link
                href="/downtown/shopping"
                className="group block bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:border-brick-300 transition-all"
              >
                <div className="relative aspect-[3/2] bg-stone-200">
                  <Image src="/images/downtown/zionsville-downtown-shopping.jpg" alt="Downtown Zionsville shops on Main Street" fill className="object-cover object-top" sizes="(max-width: 640px) 100vw, 436px" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-stone-900 group-hover:text-brick-600 transition-colors mb-2">Shopping</h3>
                  <p className="text-stone-600 text-sm leading-relaxed mb-3">
                    Find locally owned shops along Main Street, including books, jewelry, home décor, and gifts, with details on each store in the Village.
                  </p>
                  <span className="text-sm text-brick-600 group-hover:text-brick-700 font-medium">
                    Browse shopping <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            </div>
          </section>

          {/* Events */}
          <section className="mt-16">
            <h2 className="font-display text-3xl text-stone-900 mb-4">Plan around downtown events</h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Downtown Zionsville is a regular setting for community events throughout the year. Main Street and the surrounding Village district host or connect to farmers markets, shopping events, parades, holiday activities, and seasonal celebrations.
            </p>
            <p className="text-stone-700 leading-relaxed mb-4">
              Some of Zionsville's familiar events take place downtown or include the Village as part of the experience, including the{' '}
              <Link href="/events/farmers-market" className="text-brick-600 hover:text-brick-700 font-medium">Zionsville Farmers Market</Link>
              , Brick Street Market, and{' '}
              <Link href="/events/christmas-in-the-village" className="text-brick-600 hover:text-brick-700 font-medium">Christmas in the Village</Link>
              . The{' '}
              <Link href="/events/fall-festival" className="text-brick-600 hover:text-brick-700 font-medium">Fall Festival</Link>
              {' '}takes place at Lions Park, close enough that many visitors also spend time downtown before or after festival activities.
            </p>
            <p className="text-stone-700 leading-relaxed mb-6">
              Before choosing a date, check the events calendar. A quiet Saturday and a major event day can feel very different downtown, especially for parking, restaurant reservations, and crowd levels.
            </p>
            <ContainedImage src="/images/downtown/downtown-zionsville-brick-street-market.webp" alt="Downtown Zionsville, Indiana" />
            <Link href="/events" className="inline-block mt-6 text-sm text-brick-600 hover:text-brick-700 font-medium">
              See upcoming Zionsville events →
            </Link>
          </section>

          {/* Parking */}
          <div id="parking" className="mt-16 pt-10 scroll-mt-6">
            <h2 className="font-display text-3xl text-stone-900 mb-6">Parking in Downtown Zionsville</h2>
            <div className="space-y-4">
              <p className="text-stone-600 leading-relaxed">
                Street parking is available along Main Street and nearby side streets, but it can fill quickly during busy weekends and major events. Public lots around the Village give visitors additional parking within walking distance of downtown shops and restaurants.
              </p>
              <p className="text-stone-600 leading-relaxed">
                The largest public parking lot is located at the northwest corner of Main Street and Sycamore Road, with access from both Main Street and First Street. A second lot is located at the southwest corner of Main Street and Pine Street.
              </p>
              <p className="text-stone-600 leading-relaxed">
                Additional parking is available on nearby side streets and in public lots throughout the Village, including Lions Park, within a short walk of downtown.
              </p>
            </div>

            <div className="mt-8">
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



          {/* ── Keep exploring ───────────────────────────────────── */}
          <section className="mt-16 pt-6 border-t border-stone-200">
            <h2 className="font-display text-2xl text-stone-900 mb-3">
              Keep exploring
            </h2>
            <p className="text-stone-700 leading-relaxed mb-4">
              Stay close to town with parks, trails, restaurants, and family activities — or look a little farther out for summer farms, water days, museums, and state parks.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/things-to-do"
                className="text-sm text-brick-600 hover:text-brick-700 font-medium"
              >
                Explore more around Zionsville →
              </Link>
              <Link
                href="/articles/summer-day-trips-from-zionsville"
                className="text-sm text-brick-600 hover:text-brick-700 font-medium"
              >
                Find summer day trips from Zionsville →
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
