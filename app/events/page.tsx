import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import {
  getFeaturedEvents,
  formatOccurrenceList,
  eventHref,
  getCalendarLinkTargets,
  dateParts,
  formatCardDate,
  MONTHS,
  WEEKDAYS,
} from '@/lib/content'
import { getUpcomingEvents, buildEventSchema, indianaDate, matchEventToSlug } from '@/lib/calendar'
import { formatShortDate, formatDateRange, todayIso, toIso, fitNames, timeRange } from '@/lib/weekend'
import SeasonalGuidesStrip from '@/components/SeasonalGuidesStrip'

const FALLBACK_DESCRIPTION =
  'Find upcoming events in Zionsville, Indiana for 2026 — the Farmers Market, Fall Festival, Brick Street Market, community gatherings, and more.'

/** Longest description that shows in full in Google results. */
const DESCRIPTION_LIMIT = 160

/** Names the next few featured events with their dates, so the Google snippet
 *  shows what's actually coming up. Rebuilt with the page once a day. Falls
 *  back to the fixed description when no dated events are listed. */
function upcomingDescription(): string {
  const today = todayIso()
  const events = getFeaturedEvents(30)
    .filter((e) => !e.perennial)
    .map((e) => {
      const start = toIso(e.startDate)
      // A repeating event shows its next date. Its endDate is the end of the
      // season, which would read as one long run ("Oct. 24–Nov. 21").
      const repeats = Boolean(e.occurrences?.length || e.recurrence)
      const end = e.endDate && !repeats ? toIso(e.endDate) : start
      const ongoing = start < today
      const when = ongoing
        ? `through ${formatShortDate(end)}`
        : end !== start
        ? formatDateRange(start, end)
        : formatShortDate(start)
      return { label: `${e.title} (${when})`, ongoing }
    })
  // Events that haven't started yet come first, so a season-long event that's
  // already running doesn't push the next few dated events out of the snippet.
  const labels = [
    ...events.filter((e) => !e.ongoing),
    ...events.filter((e) => e.ongoing),
  ].map((e) => e.label)

  // Up to three events, skipping any whose name would push the text past the
  // limit. "And more" always fits, since the calendar lists more besides.
  return (
    fitNames(
      labels,
      DESCRIPTION_LIMIT,
      (shown) =>
        `Upcoming Zionsville events: ${shown.join(', ')}${shown.length > 1 ? ',' : ''} and more, plus the community calendar.`,
      3
    ) ?? FALLBACK_DESCRIPTION
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Zionsville Indiana Events 2026 Calendar',
    description: upcomingDescription(),
    alternates: { canonical: 'https://zionsvilleindiana.com/events' },
  }
}

export const revalidate = 86400

// Three-letter months for the calendar date badge, which shows them in capitals.
const BADGE_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default async function EventsPage() {
  const featuredEvents = getFeaturedEvents(30)
  const calendarEvents = await getUpcomingEvents(24)
  // Includes series items whose cards aren't showing yet, so their calendar
  // entries still link.
  const linkTargets = getCalendarLinkTargets()
  const allSlugs = linkTargets.map((t) => t.slug)
  const hrefBySlug = new Map(linkTargets.map((t) => [t.slug, t.href]))
  // buildEventSchema returns null for an event with no location.
  const calendarSchemas = calendarEvents.map(buildEventSchema).filter(Boolean)

  // The strip sits after the first desktop row, so people see the events they
  // came for before the guides.
  const firstRow = featuredEvents.slice(0, 3)
  const restRow = featuredEvents.slice(3)

  const featuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Zionsville Indiana Events 2026',
    itemListElement: featuredEvents.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://zionsvilleindiana.com${eventHref(e)}`,
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
            Browse featured events below, or scroll down for the community calendar.
            After your event, explore{' '}
            <Link href="/downtown" className="text-brick-600 hover:text-brick-700">
              downtown Zionsville
            </Link>{' '}
            for restaurants and shopping in the Village.
          </p>
          <Link
            href="/events/this-weekend"
            className="inline-block mt-3 text-sm font-medium text-brick-600 hover:text-brick-700"
          >
            See what&rsquo;s happening this weekend →
          </Link>
        </div>

        {/* Featured events */}
        <section className="mb-14">
          <h2 className="font-display text-2xl text-stone-800 mb-5">Featured Events</h2>
          {featuredEvents.length === 0 ? (
            <p className="text-stone-400 text-sm">No featured events found. Check back soon.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {firstRow.map((event) => (
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
                    <p className="text-xs text-brick-600 font-medium mb-1 line-clamp-2">
                      {(event.occurrences?.length
                        ? formatOccurrenceList(event.occurrences)
                        : null) ??
                        event.recurrenceLabel ?? (
                        event.endDate && event.endDate !== event.startDate
                          ? `${formatCardDate(event.startDate, false)} – ${formatCardDate(event.endDate)}`
                          : formatCardDate(event.startDate)
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

          <SeasonalGuidesStrip />

          {restRow.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restRow.map((event) => (
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
                    <p className="text-xs text-brick-600 font-medium mb-1 line-clamp-2">
                      {(event.occurrences?.length
                        ? formatOccurrenceList(event.occurrences)
                        : null) ??
                        event.recurrenceLabel ?? (
                        event.endDate && event.endDate !== event.startDate
                          ? `${formatCardDate(event.startDate, false)} – ${formatCardDate(event.endDate)}`
                          : formatCardDate(event.startDate)
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
                const matchedSlug = matchEventToSlug(event.title, allSlugs)
                const day = dateParts(
                  event.isAllDay ? event.startDate.slice(0, 10) : indianaDate(event.startDate)
                )
                const lastDay = event.lastOccurrenceDate
                  ? dateParts(indianaDate(event.lastOccurrenceDate))
                  : null
                const externalHref = event.officialUrl ?? event.htmlLink
                return (
                  <div key={event.id} className="flex gap-4 p-4 hover:bg-stone-50 transition-colors">
                    {/* Date badge */}
                    <div className="shrink-0 w-14 text-center">
                      <p className="text-xs text-stone-400 uppercase tracking-wide">
                        {BADGE_MONTHS[day.m - 1]}
                      </p>
                      <p className="font-display text-2xl text-stone-900 leading-none">
                        {day.d}
                      </p>
                      {/* Weekday — the thing people actually plan around. */}
                      <p className="text-xs text-stone-500 leading-none mt-0.5">
                        {WEEKDAYS[day.weekday]}
                      </p>
                      {lastDay && (
                        <p className="text-xs text-stone-400 leading-none mt-0.5">
                          – {MONTHS[lastDay.m - 1]} {lastDay.d}
                        </p>
                      )}
                    </div>

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      {matchedSlug ? (
                        <Link
                          href={hrefBySlug.get(matchedSlug) ?? `/events/${matchedSlug}`}
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
                            {timeRange(event.startTime, event.endTime)}
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
