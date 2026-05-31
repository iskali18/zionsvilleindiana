import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getFeaturedEvents } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Zionsville, Indiana — Events, Downtown & Community Guide',
  description:
    'Your guide to the Town of Zionsville, Indiana (Boone County, 46077). Find upcoming events, explore downtown dining and shopping, and discover what makes this Village community special.',
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
    a: 'The Zionsville Farmers Market runs every Saturday from May 16 through September 26, 2026, 8:00–11:30 AM at 340 S Main Street in the Village.',
  },
  {
    q: 'When is the Zionsville Fall Festival?',
    a: 'The Zionsville Fall Festival runs September 11–13, 2026 at Lions Park, 11053 Sycamore Street.',
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

export default function HomePage() {
  const events = getFeaturedEvents(6)
  const heroEvents = events.slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />
      <Header />

      <main>
        {/* ── Hero — 2-column ──────────────────────────────────────────── */}
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
            />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              {/* Left — H1 + intro + buttons */}
              <div>
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
                  , and what's happening in Zionsville —
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
                  <Link
                    href="/about"
                    className="border border-white/40 hover:border-white text-white px-5 py-2.5 rounded font-medium transition-colors text-sm"
                  >
                    New to Town?
                  </Link>
                </div>
              </div>

              {/* Right — upcoming event cards */}
              <div className="flex flex-col gap-3 mt-6 lg:mt-0">
                {heroEvents.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="group flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg px-4 py-3 transition-colors"
                  >
                    <div className="shrink-0 text-center w-10 flex flex-col justify-center">
                      {event.perennial ? (
                        <p className="text-brick-300 text-xs uppercase tracking-wide leading-none">
                          {event.perennialSeason}
                        </p>
                      ) : (
                        <>
                          <p className="text-brick-300 text-xs uppercase tracking-wide leading-none">
                            {new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                              month: 'short',
                              timeZone: 'UTC',
                            })}
                          </p>
                          <p className="text-white font-display text-xl leading-none mt-0.5">
                            {new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                              day: 'numeric',
                              timeZone: 'UTC',
                            })}
                          </p>
                          {!event.recurrenceLabel && (!event.endDate || event.endDate === event.startDate) && (
                            <p className="text-brick-300 text-[10px] uppercase tracking-wide leading-none mt-1">
                              {new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', {
                                weekday: 'short',
                                timeZone: 'UTC',
                              })}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm group-hover:text-brick-200 transition-colors truncate">
                        {event.title}
                      </p>
                      {event.perennial ? (
                        <p className="text-stone-300 text-xs truncate mt-0.5">{event.perennialLabel}</p>
                      ) : event.recurrenceLabel ? (
                        <p className="text-stone-300 text-xs truncate mt-0.5">{event.recurrenceLabel}</p>
                      ) : event.endDate && event.endDate !== event.startDate ? (
                        <p className="text-stone-300 text-xs truncate mt-0.5">
                          {`${new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${new Date(event.endDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`}
                        </p>
                      ) : null}
                      <p className="text-stone-300 text-xs truncate mt-0.5">{event.location}</p>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/events"
                  className="text-xs text-stone-300 hover:text-white transition-colors text-right"
                >
                  Full events calendar →
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

        {/* ── About Zionsville ─────────────────────────────────────────── */}
        <section className="bg-white border-b border-stone-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl text-stone-900 mb-4">
                Welcome to Zionsville, Indiana
              </h2>
              <p className="text-stone-600 leading-relaxed mb-4">
                Zionsville is a town in Boone County, Indiana, 
                about 20 miles northwest of Indianapolis. It is best 
                known for its historic Village district, where brick-paved 
                Main Street is lined with locally owned shops, restaurants, 
                and cafés.

              </p>
              <p className="text-stone-600 leading-relaxed mb-4">
                The community is served by highly rated Zionsville Community 
                Schools and includes parks, trails, and green spaces throughout 
                town. Zionsville&apos;s character comes through in its historic 
                architecture, walkable downtown, and community events — from the 
                weekly Farmers Market in summer to the annual Fall Festival 
                each September.
              </p>
              <p className="text-stone-600 leading-relaxed">
                This guide highlights local events, downtown dining and shopping, and 
                what&apos;s happening in Zionsville.
              </p>
              <div className="flex gap-4 mt-6">
                <Link
                  href="/about"
                  className="text-sm text-brick-600 hover:text-brick-700 font-medium"
                >
                  Quick facts & resources →
                </Link>
                <Link
                  href="/downtown"
                  className="text-sm text-brick-600 hover:text-brick-700 font-medium"
                >
                  Explore downtown →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Upcoming Events ──────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl text-stone-900">
                Upcoming Events
              </h2>
              <p className="text-stone-500 mt-1">
                What&apos;s happening in Zionsville
              </p>
            </div>
            <Link
              href="/events"
              className="text-sm text-brick-600 hover:text-brick-700 font-medium"
            >
              View all events →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="group bg-white rounded-lg overflow-hidden border border-stone-200 hover:border-brick-300 hover:shadow-md transition-all"
              >
                <div className="relative aspect-[16/9] bg-stone-100">
                  <Image
                    src={event.image}
                    alt={event.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                  <p className="text-xs text-brick-600 font-medium mb-1">
                    {event.perennial
                      ? event.perennialLabel
                      : event.recurrenceLabel ?? (
                          event.endDate && event.endDate !== event.startDate
                            ? `${new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${new Date(event.endDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`
                            : new Date(event.startDate + 'T00:00:00Z').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
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
          </div>
        </section>

        {/* ── Downtown Zionsville ───────────────────────────────────────── */}
        <section className="bg-stone-100 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-3xl mb-8">
              <h2 className="font-display text-3xl text-stone-900 mb-3">
                Downtown Zionsville
              </h2>
              <p className="text-stone-500 mb-8">
              Local dining, shopping, and cafés in the Village.  
              </p>
              <p className="text-stone-700 leading-relaxed mb-4">
                Brick-paved Main Street is the heart of downtown Zionsville’s
                Village district. Along this walkable stretch, historic storefronts
                house locally owned restaurants, cafés, boutiques, galleries, and
                small businesses.</p>
              <p className="text-stone-600 leading-relaxed">
                Plan a visit around a meal, shopping, coffee with a friend, or one of the seasonal events that fill Main Street throughout the year.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <Link
                href="/downtown/dining"
                className="group relative rounded-lg overflow-hidden aspect-[3/2] flex items-end bg-stone-800"
              >
                <div className="absolute inset-0">
                  <Image
                    src="/images/downtown/zionsville-downtown-dining.jpg"
                    alt="Dining in downtown Zionsville"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                </div>
                <div className="relative p-6">
                  <h3 className="font-display text-2xl text-white">Dining</h3>
                  <p className="text-stone-300 text-sm mt-1">
                    Restaurants, cafés, and casual meals in the Village
                  </p>
                </div>
              </Link>
              <Link
                href="/downtown/shopping"
                className="group relative rounded-lg overflow-hidden aspect-[3/2] flex items-end bg-stone-800"
              >
                <div className="absolute inset-0">
                  <Image
                    src="/images/downtown/zionsville-downtown-shopping.jpg"
                    alt="Shopping in downtown Zionsville"
                    fill
                    className="object-cover object-top opacity-80 group-hover:opacity-95 transition-opacity"
                  />
                </div>
                <div className="relative p-6">
                  <h3 className="font-display text-2xl text-white">
                    Shopping
                  </h3>
                  <p className="text-stone-300 text-sm mt-1">
                    Boutiques, gifts, home décor, and local shops
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

        {/* ── Things to Do ──────────────────────────────────────────────── */}
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="font-display text-3xl text-stone-900 mb-2">
              Things to Do in Zionsville
            </h2>
            <p className="text-stone-500 mb-8">
              Beyond Main Street — trails, parks, farms, and dining
              outside the Village.
            </p>
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <Link
                href="/things-to-do"
                className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-stone-200 block"
              >
                <Image
                  src="/images/things-to-do-hero.jpg"
                  alt="Things to do in Zionsville, Indiana"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div>
                <p className="text-stone-700 leading-relaxed mb-4">
                  A visit to Zionsville often starts in the historic Village
                  district downtown, with its brick-paved Main Street, locally
                  owned shops, and restaurants. But there is more to explore
                  across town, including the Big-4 Rail Trail, the Zionsville
                  Nature Center, Traders Point Creamery, Boone Village
                  dining, and farm experiences beyond the Village.
                </p>
                <p className="text-stone-700 leading-relaxed mb-6">
                  The Things to Do guide brings these together — downtown,
                  outdoor recreation, dining outside Main Street, and more.
                </p>
                <Link
                  href="/things-to-do"
                  className="text-sm text-brick-600 hover:text-brick-700 font-medium"
                >
                  See things to do in Zionsville →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="bg-white py-16">
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
