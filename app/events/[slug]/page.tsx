import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ShareButton from '@/components/ui/ShareButton'
import EventEndedBanner, { hasEnded } from '@/components/EventEndedBanner'
import EventInSeasonBanner from '@/components/EventInSeasonBanner'
import FaqSection from '@/components/FaqSection'
import SeasonalGuidesStrip from '@/components/SeasonalGuidesStrip'
import {
  getAllEventSlugs,
  getEvent,
  indianaToday,
  dateParts,
  formatCardDate,
  MONTHS,
} from '@/lib/content'
import ChristmasEventTable from '@/components/ChristmasEventTable'

interface Props {
  params: Promise<{ slug: string }>
}

/** Event pages are built once, so anything that depends on today's date — the
 *  ended banner, the in-season banner, the seasonal guides strip — would be
 *  frozen at build time without this. An hour matches /events. */
export const revalidate = 3600

export async function generateStaticParams() {
  return getAllEventSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = await getEvent(slug)
    return {
      title: meta.metaTitle,
      description: meta.metaDescription,
      alternates: { canonical: `https://zionsvilleindiana.com/events/${slug}` },
      // A page's openGraph replaces the one in app/layout.tsx entirely, so the
      // site-wide fields (type, siteName, locale) are repeated here.
      openGraph: {
        type: 'website',
        url: `https://zionsvilleindiana.com/events/${slug}`,
        siteName: 'Zionsville Indiana',
        locale: 'en_US',
        title: meta.metaTitle,
        description: meta.metaDescription,
        // JPG copy of the hero photo, made by ./share.jpg/route.ts. Messenger
        // does not show WebP previews, and the size lets Facebook show the
        // image on the first share.
        images: [
          {
            url: `/events/${slug}/share.jpg`,
            width: 1200,
            height: 630,
            type: 'image/jpeg',
            alt: meta.imageAlt,
          },
        ],
      },
    }
  } catch {
    return {}
  }
}

/** Accepts a short schema.org enum name ("EventScheduled", "InStock") or a
 *  full URL. Returns a full https://schema.org/... URL either way. */
function schemaUrl(value: string): string {
  return value.startsWith('http') ? value : `https://schema.org/${value}`
}

/** For an event with an `occurrences` list, returns the first listed date
 *  (YYYY-MM-DD) on or after today, or null once they have all passed. */
function nextOccurrence(occurrences: Array<string | Date>): string | null {
  const toIso = (v: string | Date): string =>
    v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : v

  const midnight = indianaToday()

  return (
    occurrences
      .map(toIso)
      .sort()
      .find((d) => new Date(d + 'T23:59:59') >= midnight) ?? null
  )
}

/** getEvent() returns raw frontmatter, so an event with an `occurrences` list
 *  still carries the first date of the season in startDate/startDateTime. Roll
 *  those forward to the next upcoming date, keeping the time of day, so the
 *  schema never advertises a date that has already passed. Leaves endDate alone
 *  — that marks the end of the season and drives EventEndedBanner. */
function resolveOccurrenceDates(
  meta: Awaited<ReturnType<typeof getEvent>>['meta']
): Awaited<ReturnType<typeof getEvent>>['meta'] {
  if (!meta.occurrences?.length) return meta

  const next = nextOccurrence(meta.occurrences)
  if (!next) return meta

  // "2026-08-29T09:00:00-04:00" -> "2026-09-26T09:00:00-04:00"
  const withDate = (dt?: string) => (dt ? next + dt.slice(10) : dt)

  return {
    ...meta,
    startDate: next,
    startDateTime: withDate(meta.startDateTime),
    endDateTime: withDate(meta.endDateTime),
  }
}

function buildEventSchema(rawMeta: Awaited<ReturnType<typeof getEvent>>['meta']) {
  const meta = resolveOccurrenceDates(rawMeta)

  // Season hubs (e.g. Christmas in Zionsville) list several separate events
  // rather than being a single event. Emitting one Event for the whole season
  // would be inaccurate and would compete with the individual event pages,
  // so those pages opt out via `schemaType: WebPage` in frontmatter.
  if (meta.schemaType === 'WebPage') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      ...(meta.alternateName && { alternateName: meta.alternateName }),
      description: meta.description,
      url: `https://zionsvilleindiana.com/events/${meta.slug}`,
      // dateModified is a CreativeWork property — valid on WebPage, not on Event.
      ...(meta.lastUpdated && { dateModified: meta.lastUpdated }),
      publisher: {
        '@type': 'Organization',
        name: 'Zionsville Indiana',
        url: 'https://zionsvilleindiana.com',
      },
    }
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': meta.eventType === 'recurring' ? 'EventSeries' : 'Event',
    name: meta.title,
    ...(meta.alternateName && { alternateName: meta.alternateName }),
    description: meta.description,
    // Prefer full datetime if frontmatter provides it; else date-only.
    startDate: meta.startDateTime ?? meta.startDate,
    ...((meta.endDateTime || meta.endDate) && {
      endDate: meta.endDateTime ?? meta.endDate,
    }),
    // Google assumes EventScheduled when omitted, but explicit is clearer
    // and lets frontmatter override for cancelled/postponed events.
    eventStatus: schemaUrl(meta.eventStatus ?? 'EventScheduled'),
    location: {
      '@type': 'Place',
      name: meta.location,
      address: {
        '@type': 'PostalAddress',
        streetAddress: meta.address,
        addressLocality: meta.addressLocality ?? 'Zionsville',
        addressRegion: 'IN',
        postalCode: meta.postalCode ?? '46077',
        addressCountry: 'US',
      },
    },
    image: `https://zionsvilleindiana.com${meta.image}`,
    url: `https://zionsvilleindiana.com/events/${meta.slug}`,
    organizer: {
      '@type': 'Organization',
      name: 'Zionsville Indiana',
      url: 'https://zionsvilleindiana.com',
    },
  }

  // Ticket offer — optional. Emit only when frontmatter provides an `offer`
  // block. Use a single Offer (not AggregateOffer) — the price and URL should
  // point to a ticket a user can actually purchase at that price.
  if (meta.offer) {
    schema.offers = {
      '@type': 'Offer',
      price: meta.offer.price,
      priceCurrency: meta.offer.priceCurrency,
      url: meta.offer.url,
      // Only emit availability when the frontmatter states it. Defaulting to
      // InStock would tell Google a ticket is purchasable on pages where the
      // field was simply left off.
      ...(meta.offer.availability && {
        availability: schemaUrl(meta.offer.availability),
      }),
    }
  }

  return schema
}

const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** Same month style as the event cards (formatCardDate in lib/content):
 *  "Sat, Oct. 10 – Tue, Oct. 13, 2026" for a range, "Saturday, Oct. 24, 2026"
 *  for a single day. */
function formatEventDate(meta: Awaited<ReturnType<typeof getEvent>>['meta']): string {
  if (meta.perennial && meta.perennialLabel) return meta.perennialLabel
  if (meta.recurrenceLabel) return meta.recurrenceLabel
  if (meta.endDate && meta.endDate !== meta.startDate) {
    return `${formatCardDate(meta.startDate, false)} – ${formatCardDate(meta.endDate)}`
  }
  const { y, m, d, weekday } = dateParts(meta.startDate)
  return `${WEEKDAYS_LONG[weekday]}, ${MONTHS[m - 1]} ${d}, ${y}`
}

/** Matches ArticleLayout's formatter so the freshness date reads the same on
 *  both page types. Parsed as local time — new Date('2026-09-16') is UTC
 *  midnight, which lands on the previous day west of Greenwich. */
function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso + 'T00:00:00') : iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

const getLinkText = (url: string) => {
  const clean = url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
  return `${clean} →`
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params
  let data: Awaited<ReturnType<typeof getEvent>>

  try {
    data = await getEvent(slug)
  } catch {
    notFound()
  }

  // Roll an occurrences-list event forward to its next date before anything
  // renders. Without this the page sees the season's first date, so the
  // in-season banner shows on every day of the range, not just event days.
  const { meta: rawMeta, contentHtml } = data

  // Card-only events have no page of their own. Send anyone who lands on
  // /events/{slug} to the hub section instead. Outside the try/catch above,
  // because permanentRedirect works by throwing.
  if (rawMeta.linkTo) permanentRedirect(rawMeta.linkTo)
  const meta = resolveOccurrenceDates(rawMeta)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventSchema(meta)) }}
      />
      {meta.faqs && meta.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: meta.faqs.map(({ q, a }) => ({
                '@type': 'Question',
                name: q,
                acceptedAnswer: { '@type': 'Answer', text: a },
              })),
            }),
          }}
        />
      )}
      <Header />
      <main>
        {/* ── Hero with overlaid H1 ─────────────────────────────────── */}
        <div className="relative h-72 sm:h-96 bg-stone-900 overflow-hidden">
          <Image
            src={meta.image}
            alt={meta.imageAlt}
            fill
            className="object-cover opacity-90"
            style={{ objectPosition: meta.hero_position ?? 'center 55%' }}
            priority
          />
          {/* Dark gradient for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Breadcrumb top-left */}
          <div className="absolute top-4 left-4 sm:left-6">
            <Breadcrumb
              items={[
                { label: 'Events', href: '/events' },
                { label: meta.title, href: `/events/${slug}` },
              ]}
              light
            />
          </div>

          {/* H1 + date + location bottom-left, photo credit bottom-right */}
          <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6">
            <p className="text-brick-300 font-medium text-sm mb-1">
              {formatEventDate(meta)}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-white font-bold leading-tight mb-1">
              {meta.title}
            </h1>
            {/* Location, a thin divider, then Share. The divider and Share stay
                together, so a long location wraps without stranding the divider.
                Share uses the canonical URL. */}
            <p className="text-stone-300 text-sm">
              {meta.location}
              <span className="inline-flex items-center gap-3 ml-3 align-bottom whitespace-nowrap print:hidden">
                <span aria-hidden="true" className="h-4 w-px bg-white/40" />
                <ShareButton
                  url={`https://zionsvilleindiana.com/events/${slug}`}
                  title={meta.title}
                  tone="light"
                />
              </span>
            </p>
            {meta.photoCredit && (
              <p
                className="absolute bottom-2 right-3 text-white/60 text-xs"
                style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {meta.photoCredit}
              </p>
            )}
          </div>

          {/* Photo credit bottom-right */}
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          {/* Event ended banner (renders only if end date has passed) */}
          <EventEndedBanner startDate={meta.startDate} endDate={meta.endDate} />

          {/* Event in-season banner (renders only when today falls within
              startDate–endDate AND an inSeasonMessage is set in frontmatter) */}
          <EventInSeasonBanner
            startDate={meta.startDate}
            endDate={meta.endDate}
            message={meta.inSeasonMessage}
          />

          {/* Details — mono info strip */}
          <dl className="font-mono text-sm leading-7 mb-10 bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 space-y-1">
            <div>
              <span className="inline-block w-28 sm:w-32 text-stone-500 font-medium">When</span>
              <span className="text-stone-900 font-semibold">{formatEventDate(meta)}</span>
            </div>
            <div>
              <span className="inline-block w-28 sm:w-32 text-stone-500 font-medium">Where</span>
              <span className="text-stone-900 font-semibold">{meta.location}</span>
            </div>
            {meta.externalUrl && !meta.perennial && (
              <div>
                <span className="inline-block w-28 sm:w-32 text-stone-500 font-medium">More info</span>
                <a
                  href={meta.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brick-600 hover:text-brick-700"
                >
                  {getLinkText(meta.externalUrl)}
                </a>
              </div>
            )}
          </dl>

          {/* Freshness date, in the same position and style as ArticleLayout. */}
          {meta.lastUpdated && (
            <p className="text-xs text-stone-500 mb-6 print:hidden">
              Updated {formatDate(meta.lastUpdated)}
            </p>
          )}

          {/* Body content. A page that embeds an interactive component puts a
              marker in its markdown; the body splits there and the component
              renders between the two halves. */}
          {(() => {
            const TABLE = '<!-- CHRISTMAS_EVENT_TABLE -->'
            if (slug === 'christmas-in-zionsville' && contentHtml.includes(TABLE)) {
              const [before, ...rest] = contentHtml.split(TABLE)
              return (
                <>
                  <div className="prose-village" dangerouslySetInnerHTML={{ __html: before }} />
                  <ChristmasEventTable />
                  <div
                    className="prose-village"
                    dangerouslySetInnerHTML={{ __html: rest.join(TABLE) }}
                  />
                </>
              )
            }

            /* A page opts into the seasonal strip by putting the marker in its
               markdown, usually just after Quick Facts. Once the event has
               ended the links move up into EventEndedBanner instead, so the
               page never shows two seasonal callouts. */
            const STRIP = '<!-- SEASONAL_STRIP -->'
            if (contentHtml.includes(STRIP)) {
              const [before, ...rest] = contentHtml.split(STRIP)
              return (
                <>
                  <div className="prose-village" dangerouslySetInnerHTML={{ __html: before }} />
                  {!hasEnded(meta.startDate, meta.endDate) && (
                    <SeasonalGuidesStrip kind="event" tone="plain" />
                  )}
                  <div
                    className="prose-village"
                    dangerouslySetInnerHTML={{ __html: rest.join(STRIP) }}
                  />
                </>
              )
            }

            return (
              <div className="prose-village" dangerouslySetInnerHTML={{ __html: contentHtml }} />
            )
          })()}

          {/* Map (optional, set via mapEmbedUrl in frontmatter) */}
          {meta.mapEmbedUrl && (
            <section className="mt-10">
              {/* Heading and line come from the event's own file. Pages that set
                  neither keep the original downtown text, so existing maps
                  look the same. */}
              <h2 className="font-display text-2xl text-stone-800 font-bold mb-2">
                {meta.mapHeading ?? 'Parking & nearby restaurants'}
              </h2>
              {(() => {
                const line =
                  meta.mapDescription ??
                  (meta.mapHeading
                    ? null
                    : 'Use the map below to find public lots, street parking areas, and nearby restaurants. Blue P icons mark public parking lots, while green P icons mark street parking areas. Tap any pin for details or directions in Google Maps.')
                return line ? <p className="text-sm text-stone-600 mb-4">{line}</p> : <div className="mb-4" />
              })()}
              <div className="aspect-video w-full overflow-hidden rounded-lg border border-stone-200 shadow-sm">
                <iframe
                  src={meta.mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  title={meta.mapTitle ?? `${meta.title} map`}
                />
              </div>
            </section>
          )}

          {/* FAQs — the visible counterpart to the FAQPage JSON-LD above.
              Renders nothing when frontmatter has no `faqs`. */}
          <FaqSection faqs={meta.faqs} />

          {/* ── CTA ──────────────────────────────────────────────────── */}
          <div className="mt-10 pt-6 border-t border-stone-200 flex flex-wrap gap-6">
            <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              All events →
            </Link>
            <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
              Explore downtown Zionsville →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
