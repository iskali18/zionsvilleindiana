import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getFeaturedEvents, formatOccurrenceList, eventHref, formatCardDate } from '@/lib/content'
import SeasonalGuidesStrip from '@/components/SeasonalGuidesStrip'

export const metadata: Metadata = {
  title: 'Zionsville Indiana — Events, Downtown & Community Guide',
  description:
    'Your guide to the Town of Zionsville, Indiana (Boone County, 46077). Find upcoming events, explore downtown shopping and restaurants, and learn about parks, trails, and community life.',
  alternates: { canonical: 'https://zionsvilleindiana.com' },
}

export const revalidate = 86400

const faqs = [
  {
    q: 'What is Zionsville known for?',
    a: 'Zionsville is known for its historic brick-paved Main Street and the Village district, a walkable area of locally owned shops, restaurants, and cafés. It is also known for its highly rated school district and well-maintained neighborhoods.',
  },
  {
    q: 'What county is Zionsville, Indiana in?',
    a: 'Zionsville is located in Boone County, Indiana.',
  },
  {
    q: 'When is the Zionsville Farmers Market?',
    a: 'The 2026 Zionsville Farmers Market season ran every Saturday from May 16 through September 26, 8:00–11:30 AM, at 340 S Main Street in the Village. The 2027 dates will be added here once they are announced.',
  },
  {
    q: 'When is the Zionsville Fall Festival?',
    a: 'The 2026 Zionsville Fall Festival was held September 11–13 at Lions Park, 11053 Sycamore Street. The 2027 dates will be added here once they are announced.',
  },
  {
    q: 'What is the Village in Zionsville?',
    a: "The Village refers to Zionsville's historic downtown area and surrounding neighborhoods, including the brick-paved Main Street district and nearby residential streets.",
  },
  {
  q: 'Where is the best parking downtown?',
  a: 'The primary parking lot is at the intersection of Main Street and Sycamore Road, and is accessible via Main Street or First Street. Street parking along Main Street is available but fills quickly on busy weekends. Additional parking is available on nearby side streets and in public lots around the Village, including nearby Lions Park, all within a short walk of downtown shops and restaurants.',
  },
  {
    q: 'Is Zionsville a good place to live?',
    a: 'Zionsville consistently ranks among the top communities in Indiana. It offers highly rated schools in the Zionsville Community Schools district, a walkable Village district, abundant parks and trails, and easy access to Indianapolis.',
  },
]

const homepageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://zionsvilleindiana.com/#organization',
      name: 'Zionsville Indiana',
      alternateName: 'ZionsvilleIndiana.com',
      url: 'https://zionsvilleindiana.com',
      logo: 'https://zionsvilleindiana.com/images/logo.png',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://zionsvilleindiana.com/#website',
      url: 'https://zionsvilleindiana.com',
      name: 'Zionsville Indiana',
      alternateName: 'ZionsvilleIndiana.com',
      publisher: { '@id': 'https://zionsvilleindiana.com/#organization' },
    },
    {
      '@type': 'City',
      name: 'Zionsville',
      alternateName: 'Town of Zionsville',
      containedInPlace: { '@type': 'State', name: 'Indiana' },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Zionsville',
        addressRegion: 'IN',
        postalCode: '46077',
        addressCountry: 'US',
      },
      description:
        'Zionsville is a town in Boone County, Indiana, known for its historic brick streets, Village district, and community events.',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
}

const quickLinks = [
  { label: 'Zionsville Facts', href: '/about' },
  { label: 'Downtown', href: '/downtown' },
  { label: 'Things to Do', href: '/things-to-do' },
  { label: 'Farmers Market', href: '/events/farmers-market' },
  { label: 'Fall Festival', href: '/events/fall-festival' },
  { label: 'Christmas in the Village', href: '/events/christmas-in-the-village-parade-and-tree-lighting' },
]

const featuredGuides = [
  {
    title: '25 Best Christmas Lights & Events Near Zionsville and Indianapolis',
    description:
      'A guide to the 2026 Christmas season near Zionsville and Indianapolis, covering major light displays and holiday attractions, plus Christmas events at local farms.',
    href: '/articles/christmas-holiday-attractions-near-indianapolis',
    image: '/images/articles/christmas-events-indianapolis-newfields-winterlights.webp',
    imageAlt:
      'Visitors walking along a tree-lined path illuminated by thousands of white Christmas lights and hanging lighted ornaments during Winterlights at Newfields in Indianapolis.',
  },
  {
    title: 'Indoor Things to Do for Kids Near Zionsville This Winter',
    description:
      'A guide to indoor playgrounds, sensory play, sports, music, dance, art, and free library programs for kids ages 0\u20139 near Zionsville and NW Indianapolis.',
    href: '/articles/indoor-things-to-do-kids',
    image: '/images/articles/indoor-things-to-do-kids-hero.webp',
    imageAlt: 'Indoor activities for kids near Zionsville',
  },
  {
    title: 'Indoor Things to Do for Older Kids & Teens Near Zionsville',
    description:
      'A guide to indoor outings and activities for older kids, tweens, and teens near Zionsville and NW Indianapolis, covering drop-in spots, specialized classes, and free library spaces.',
    href: '/articles/indoor-things-to-do-tweens-teens',
    image: '/images/articles/indoor-activities-tweens-teens-zionsville-go-kart.webp',
    imageAlt: 'Two teens in go-karts',
  },
]

export default function HomePage() {
  const events = getFeaturedEvents(6, { homepage: true })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Header />

      <main>
        {/* ── Hero — single column ─────────────────────────────────────── */}
        <section
          className="relative bg-stone-900 text-white overflow-hidden"
          style={{ minHeight: '380px' }}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/zionsville-indiana-main-street.webp"
              alt="Main Street in Zionsville, Indiana"
              fill
              className="object-cover object-[center_75%] opacity-45"
              priority
              quality={60}
            />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-brick-300 text-sm font-medium uppercase tracking-widest mb-3">
                Historic Charm, Modern Living
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-5">
                Your Guide to Zionsville, Indiana
              </h1>
              <p className="text-stone-300 text-base max-w-md mb-8 leading-relaxed">
                Explore{' '}
                <Link
                  href="/events"
                  className="underline hover:no-underline"
                >
                events
                </Link>
                ,{' '}
                <Link
                  href="/downtown"
                  className="underline hover:no-underline"
                >
                downtown
                </Link>
                ,{' '}
                <Link
                  href="/things-to-do"
                  className="underline hover:no-underline"
                >
                things to do
                </Link>
                , and what&apos;s happening in Zionsville —
                updated regularly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/events"
                  className="bg-brick-500 hover:bg-brick-600 text-white px-5 py-2.5 rounded font-medium transition-colors text-sm"
                >
                  Upcoming Events
                </Link>
                <Link
                  href="/downtown"
                  className="border border-white/40 hover:border-white text-white px-5 py-2.5 rounded font-medium transition-colors text-sm"
                >
                  Explore Downtown
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick links ──────────────────────────────────────────────── */}
        <section className="bg-white border-b border-stone-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-400 uppercase tracking-wider shrink-0 mr-1">
              Popular:
            </span>
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 text-sm text-stone-600 hover:text-brick-600 border border-stone-200 hover:border-brick-300 px-3 py-1 rounded-full transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        {/* ── Upcoming Events ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-8">
            <Link
              href="/events"
              className="group inline-flex items-center gap-2 text-stone-900 hover:text-brick-600 transition-colors"
            >
              <h2 className="font-display text-3xl">Upcoming Events</h2>
              <span className="text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
            <p className="text-stone-500 mt-1">
              What&apos;s happening in Zionsville
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.slug}
                href={eventHref(event)}
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-stone-100">
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    quality={65}
                  />
                  {/* On the photo, not above the date, so this card's title
                      lines up with the other cards in the row. */}
                  {event.weekendFeatured && (
                    <span className="absolute top-2 left-2 bg-white/90 text-stone-800 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded shadow-sm pointer-events-none">
                      Featured
                    </span>
                  )}
                  {event.photoCredit && (
                    <p
                      className="absolute bottom-2 right-3 text-white/60 text-xs pointer-events-none"
                      style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                    >
                      {event.photoCredit}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-brick-600 font-medium mb-1 line-clamp-2">
                    {event.perennial
                      ? event.perennialLabel
                      : (event.occurrences?.length
                          ? formatOccurrenceList(event.occurrences)
                          : null) ??
                        event.recurrenceLabel ?? (
                          event.endDate && event.endDate !== event.startDate
                            ? `${formatCardDate(event.startDate, false)} – ${formatCardDate(event.endDate)}`
                            : formatCardDate(event.startDate)
                        )
                    }
                  </p>
                  <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <Link
                href="/events"
                className="text-md text-brick-600 hover:text-brick-700 font-medium"
              >
            View all events →
            </Link>
            <Link
                href="/events/this-weekend"
                className="text-md text-brick-600 hover:text-brick-700 font-medium"
              >
            This weekend →
            </Link>
          </div>

          {/* Seasonal guides as secondary navigation, inside the events
              section so the whole area reads as one block. Renders
              nothing out of season. */}
          <SeasonalGuidesStrip tone="bare" className="mt-6" />
        </section>

        {/* ── Downtown Zionsville ───────────────────────────────────────── */}
        <section className="bg-stone-100 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-8">
              <Link
                href="/downtown"
                className="group inline-flex items-center gap-2 text-stone-900 hover:text-brick-600 transition-colors mb-3"
              >
                <h2 className="font-display text-3xl">Downtown Zionsville</h2>
                <span className="text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
              <p className="text-stone-500 mb-8">
              Restaurants, shops, and outdoor drinks in the Village district.  
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Link
                href="/articles/downtown-zionsville-restaurants"
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-stone-100">
                  <Image
                    src="/images/downtown/zionsville-downtown-dining.jpg"
                    alt="Restaurants in downtown Zionsville"
                    fill
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    quality={65}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                    Restaurants
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    Restaurants, cafés, and casual meals in the Village
                  </p>
                </div>
              </Link>
              <Link
                href="/articles/shopping-in-downtown-zionsville"
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-stone-100">
                  <Image
                    src="/images/downtown/zionsville-downtown-shopping-winter.webp"
                    alt="Shopping in downtown Zionsville"
                    fill
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    quality={65}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                    Shopping
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    Boutiques, gifts, home décor, and local shops
                  </p>
                </div>
              </Link>
              <Link
                href="/articles/dora"
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-stone-100">
                  <Image
                    src="/images/zionsville-dora.webp"
                    alt="DORA in downtown Zionsville"
                    fill
                    sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    quality={65}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                    Outdoor Drinks Downtown
                  </h3>
                  <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                    Carry approved drinks in the designated outdoor refreshment area (DORA)
                  </p>
                </div>
              </Link>
            </div>
            <Link
              href="/downtown"
              className="text-sm text-brick-600 hover:text-brick-700 font-medium"
            >
              Downtown guide & itineraries →
            </Link>
          </div>
        </section>

        {/* ── Featured Guides ──────────────────────────────────────────── */}
        <section className="bg-stone-50 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8">
              <Link
                href="/articles"
                className="group inline-flex items-center gap-2 text-stone-900 hover:text-brick-600 transition-colors"
              >
                <h2 className="font-display text-3xl">Featured Guides</h2>
                <span className="text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
              </Link>
              <p className="text-stone-500 mt-1">
                Christmas lights, holiday events, and indoor activities for kids and teens near Zionsville and Indianapolis.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[16/9] bg-stone-100">
                    <Image
                      src={guide.image}
                      alt={guide.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 352px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      quality={65}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                      {guide.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Article ─────────────────────────────────────────── */}
        <section className="bg-white py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <p className="text-xs uppercase tracking-widest text-brick-600 font-medium mb-3">
              Featured Article
            </p>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <figure className="m-0">
                <Link
                  href="/events/christmas-in-zionsville"
                  className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-stone-200 block"
                >
                  <Image
                    src="/images/events/brick-street-hotel-christmas-lights.webp"
                    alt="Exterior of the Brick Street Inn at night in Zionsville, Indiana, decorated with holiday string lights, Christmas wreaths, and snow-covered outdoor patio seating."
                    fill
                    sizes="(min-width: 1024px) 536px, 100vw"
                    className="object-cover object-[center_70%] group-hover:scale-105 transition-transform duration-300"
                    quality={65}
                  />
                </Link>
                <figcaption className="text-xs text-stone-500 italic mt-2">
                  The Brick Street Inn decorated for the holidays in downtown Zionsville.{' '}
                  <span className="not-italic">© ZionsvilleIndiana.com</span>
                </figcaption>
              </figure>
              <div>
                <Link
                  href="/events/christmas-in-zionsville"
                  className="group inline-block"
                >
                  <h2 className="font-display text-3xl text-stone-900 group-hover:text-brick-600 transition-colors leading-tight mb-4">
                    Christmas in Zionsville 2026
                  </h2>
                </Link>
                <p className="text-stone-700 leading-relaxed mb-6">
                  Zionsville’s Christmas calendar features the Holiday Parade and Tree Lighting,
                  Santa visits, holiday markets, live concerts, two productions of{' '}
                  <em>The Nutcracker</em>, and Christmas celebrations at local churches, with
                  events scheduled from late November through Christmas Eve.
                </p>
                <Link
                  href="/events/christmas-in-zionsville"
                  className="inline-block bg-brick-500 hover:bg-brick-600 text-white px-5 py-2.5 rounded font-medium transition-colors text-sm"
                >
                  Read the guide →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl text-stone-900 mb-8">
              Common questions about Zionsville
            </h2>
            <dl className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div
                  key={q}
                  className="bg-stone-50 rounded-lg p-5 border border-stone-200"
                >
                  <dt className="font-display text-base font-semibold text-stone-900 mb-2">
                    {q}
                  </dt>
                  <dd className="text-stone-600 text-sm leading-relaxed">
                    {a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
