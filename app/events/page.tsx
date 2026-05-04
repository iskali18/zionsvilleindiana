import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import { getFeaturedEvents, getAllEvents } from '@/lib/content'
import { getUpcomingEvents, buildEventSchema } from '@/lib/calendar'

export const metadata: Metadata = {
  title: 'Zionsville Indiana Events 2026 — Community Calendar',
  description:
    'Find upcoming events in Zionsville, Indiana for 2026 — the Farmers Market, Fall Festival, Brick Street Market, community gatherings, and more.',
  alternates: { canonical: 'https://zionsvilleindiana.com/events' },
}

export const revalidate = 86400

export default async function EventsPage() {
  const featuredEvents = getFeaturedEvents(6)
  const allEvents = getAllEvents()
  const calendarEvents = await getUpcomingEvents(24)
  const allSlugs = allEvents.map((e) => e.slug)
  const calendarSchemas = calendarEvents.map(buildEventSchema)

  const featuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Zionsville Indiana Events 2026',
    itemListElement: featuredEvents.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zionsvilleindiana.com/events/${e.slug}`,
      name: e.title,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredSchema) }}
      />
      {calendarSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: 'Events', href: '/events' }]} />

        <div className="mt-6 mb-4">
          <h1 className="font-display text-4xl text-stone-900">Zionsville Events 2026</h1>
        </div>

        {/* Intro — targets "zionsville indiana events" */}
        <div className="max-w-3xl mb-10">
          <p className="text-stone-600 leading-relaxed">
            Zionsville hosts a full calendar of community events throughout the year — from the
            weekly Farmers Market on Main Street to the annual Fall Festival at Lions Park.
            Browse featured events below, or scroll down for the full community calendar.
            After your event, explore{' '}
            <Link href="/downtown" className="text-brick-600 hover:text-brick-700">
              downtown Zionsville
            </Link>{' '}
            for dining and shopping in the Village.
          </p>
        </div>

        {/* Featured events */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-stone-800 mb-5">Featured Events</h2>
          {featuredEvents.length === 0 ? (
            <p className="text-stone-400 text-sm">No featured events found. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
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
                    {event.photoCredit && !event.photoCreditHeroOnly && (
                      <p
                        className="absolute bottom-1.5 right-2 text-white/70 text-[10px] leading-none"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                      >
                        {event.photoCredit}
                      </p>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-brick-600 font-medium mb-1">
                      {event.recurrenceLabel ?? (
                        event.endDate && event.endDate !== event.startDate
                          ? `${new Date(event.startDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} – ${new Date(event.endDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}`
                          : new Date(event.startDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                      )}
                    </p>
                    <h3 className="font-display text-lg text-stone-900 group-hover:text-brick-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1 line-clamp-2">{event.description}</p>
                    <p className="text-xs text-stone-400 mt-2">{event.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming community events from Google Calendar */}
        <section>
          <h2 className="font-display text-2xl text-stone-800 mb-2">Upcoming Community Events</h2>
          <p className="text-stone-500 text-sm mb-6">
            Events added to the Zionsville community calendar.
          </p>

          {calendarEvents.length === 0 ? (
            <p className="text-stone-400 text-sm">No upcoming events found. Check back soon.</p>
          ) : (
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white overflow-hidden">
              {calendarEvents.map((event) => {
                const matchedSlug = allSlugs.find((slug) =>
                  event.title.toLowerCase().includes(slug.replace(/-/g, ' '))
                )
                const displayDate = new Date(
                  event.isAllDay ? event.startDate + 'T00:00:00' : event.startDate
                )
                const externalHref = event.officialUrl ?? event.htmlLink
                return (
                  <div key={event.id} className="flex gap-4 p-4 hover:bg-stone-50 transition-colors">
                    {/* Date badge */}
                    <div className="shrink-0 w-14 text-center">
                      <p className="text-xs text-stone-400 uppercase tracking-wide">
                        {displayDate.toLocaleDateString('en-US', {
                          month: 'short',
                          timeZone: 'America/Indiana/Indianapolis',
                        })}
                      </p>
                      <p className="font-display text-2xl text-stone-900 leading-none">
                        {displayDate.toLocaleDateString('en-US', {
                          day: 'numeric',
                          timeZone: 'America/Indiana/Indianapolis',
                        })}
                      </p>
                      {event.lastOccurrenceDate && (
                        <p className="text-xs text-stone-400 leading-none mt-0.5">
                          – {new Date(event.lastOccurrenceDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'America/Indiana/Indianapolis',
                          })}
                        </p>
                      )}
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      {matchedSlug ? (
                        <Link
                          href={`/events/${matchedSlug}`}
                          className="font-medium text-stone-900 hover:text-brick-600 transition-colors line-clamp-1"
                        >
                          {event.title}
                        </Link>
                      ) : event.officialUrl ? (
                        <a
                          href={event.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-stone-900 hover:text-brick-600 transition-colors line-clamp-1"
                        >
                          {event.title}
                        </a>
                      ) : (
                        <span className="font-medium text-stone-900 line-clamp-1">
                          {event.title}
                        </span>
                      )}
                      <div className="flex flex-wrap gap-x-3 mt-0.5">
                        {!event.isAllDay && event.startTime && (
                          <p className="text-xs text-stone-500">
                            {event.startTime}
                            {event.endTime && ` – ${event.endTime}`}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-stone-400 truncate">{event.location}</p>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                          {event.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                    </div>

                    {/* External link — only when officialUrl is available */}
                    {event.officialUrl && (
                      <a
                        href={event.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs text-stone-400 hover:text-brick-600 transition-colors self-center"
                        aria-label={`More info about ${event.title}`}
                      >
                        ↗
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── CTA ──────────────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown Zionsville →
          </Link>
          <Link href="/about" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            About the town →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
