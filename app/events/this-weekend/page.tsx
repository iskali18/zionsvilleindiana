import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Breadcrumb from '@/components/ui/Breadcrumb'
import SeasonalGuidesStrip from '@/components/SeasonalGuidesStrip'
import { eventHref, formatCardDate, formatOccurrenceList, dateParts } from '@/lib/content'
import {
  getWeekendData,
  formatDateRange,
  formatDayHeading,
  joinNames,
  fitNames,
  type WeekendItem,
} from '@/lib/weekend'

const PAGE_URL = 'https://zionsvilleindiana.com/events/this-weekend'

/** The weekend changes every Monday and calendar entries change any time, so
 *  this page rebuilds hourly, like the calendar data it reads. */
export const revalidate = 3600

/** Longest description that shows in full in Google results. */
const DESCRIPTION_LIMIT = 160

export async function generateMetadata(): Promise<Metadata> {
  const { friday, sunday, all } = await getWeekendData()
  const range = formatDateRange(friday, sunday)
  const year = dateParts(sunday).y
  const title = `Zionsville Events This Weekend (${range})`

  // Name as many events as fit, then "and more" if any were left off.
  const lead = `Things to do in Zionsville the weekend of ${range}, ${year}: `
  const names = [...new Set(all.map((i) => i.title))]
  const description =
    fitNames(names, DESCRIPTION_LIMIT, (shown, more) =>
      more ? `${lead}${shown.join(', ')}${shown.length > 1 ? ',' : ''} and more.` : `${lead}${joinNames(shown)}.`
    ) ?? `Things to do in Zionsville the weekend of ${range}, ${year}, plus what\u2019s coming up next.`

  // Share image: the first listing with a photo, so the preview changes weekly.
  const first = all.find((i) => i.image)
  const image = first?.image ? { url: first.image, alt: first.imageAlt ?? '' } : null

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    // A page's openGraph replaces the one in app/layout.tsx entirely, so the
    // site-wide fields are repeated here. With no event photo this weekend,
    // the site's default share image is used.
    openGraph: {
      type: 'website',
      url: PAGE_URL,
      siteName: 'Zionsville Indiana',
      locale: 'en_US',
      title,
      description,
      images: [image ? { url: image.url, alt: image.alt } : { url: '/images/og-default.jpg', width: 1200, height: 630 }],
    },
  }
}

function ItemRow({ item }: { item: WeekendItem }) {
  const titleClass =
    'font-medium text-stone-900 hover:text-brick-600 transition-colors'
  return (
    <li className="flex gap-3 sm:gap-4 p-4">
      {item.image && (
        <div className="relative shrink-0 w-24 sm:w-32 aspect-[16/9] rounded overflow-hidden bg-stone-100">
          <Image
            src={item.image}
            alt={item.imageAlt ?? ''}
            fill
            sizes="(min-width: 640px) 128px, 96px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {item.href && item.external ? (
          <a href={item.href} target="_blank" rel="noopener noreferrer" className={titleClass}>
            {item.title}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : item.href ? (
          <Link href={item.href} className={titleClass}>
            {item.title}
          </Link>
        ) : (
          <span className="font-medium text-stone-900">{item.title}</span>
        )}
        {(item.time || item.location) && (
          <p className="text-xs text-stone-500 mt-0.5">
            {[item.time, item.location].filter(Boolean).join(' · ')}
          </p>
        )}
        {item.description && (
          <p className="text-sm text-stone-500 mt-1 line-clamp-2">{item.description}</p>
        )}
      </div>
    </li>
  )
}

function ItemList({ items }: { items: WeekendItem[] }) {
  return (
    <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white overflow-hidden">
      {items.map((item) => (
        <ItemRow key={item.key} item={item} />
      ))}
    </ul>
  )
}

export default async function ThisWeekendPage() {
  const { friday, sunday, allWeekend, days, comingUp, all } = await getWeekendData()
  const range = formatDateRange(friday, sunday)
  const year = dateParts(sunday).y
  const isEmpty = all.length === 0

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Zionsville Events This Weekend (${range}, ${year})`,
    itemListElement: all
      .filter((i) => i.href)
      .map((i, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: i.title,
        url: i.href!.startsWith('http') ? i.href : `https://zionsvilleindiana.com${i.href}`,
      })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {/* One Event per listing. Card-only events have no page of their own, so
          this is the only place they get Event schema. */}
      {all
        .filter((i) => i.schema)
        .map((i) => (
          <script
            key={`schema-${i.key}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(i.schema) }}
          />
        ))}
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[
            { label: 'Events', href: '/events' },
            { label: 'This Weekend', href: '/events/this-weekend' },
          ]}
        />

        <div className="mt-6 mb-4">
          <p className="text-brick-600 font-medium text-sm mb-1">
            {formatDayHeading(friday)} – {formatDayHeading(sunday)}, {year}
          </p>
          <h1 className="font-display text-4xl text-stone-900">Zionsville Events This Weekend</h1>
        </div>

        <div className="max-w-3xl mb-10">
          <p className="text-stone-600 leading-relaxed">
            Find things to do in Zionsville this weekend, {range}, {year}, with featured events and
            local activities. This list updates every hour. For later dates, see{' '}
            <Link href="/events" className="text-brick-600 hover:text-brick-700">
              all Zionsville events
            </Link>
            .
          </p>
        </div>

        {isEmpty && (
          <p className="mb-14 rounded-lg border border-stone-200 bg-white px-5 py-6 text-stone-600">
            No events are listed for the weekend of {range} yet. See what&rsquo;s coming up next below.
          </p>
        )}

        {allWeekend.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-2xl text-stone-800 mb-4">All Weekend</h2>
            <ItemList items={allWeekend} />
          </section>
        )}

        {days.map((day) => (
          <section key={day.date} className="mb-10">
            <h2 className="font-display text-2xl text-stone-800 mb-4">{formatDayHeading(day.date)}</h2>
            <ItemList items={day.items} />
          </section>
        ))}

        <SeasonalGuidesStrip />

        {comingUp.length > 0 && (
          <section className="mt-4 mb-10">
            <h2 className="font-display text-2xl text-stone-800 mb-4">Coming Up Next</h2>
            <ul className="divide-y divide-stone-100 border border-stone-200 rounded-lg bg-white overflow-hidden">
              {comingUp.map((event) => (
                <li key={event.slug} className="flex gap-3 sm:gap-4 p-4">
                  {event.image && (
                    <div className="relative shrink-0 w-24 sm:w-32 aspect-[16/9] rounded overflow-hidden bg-stone-100">
                      <Image
                        src={event.image}
                        alt={event.imageAlt ?? ''}
                        fill
                        sizes="(min-width: 640px) 128px, 96px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-brick-600 font-medium mb-0.5">
                      {(event.occurrences?.length ? formatOccurrenceList(event.occurrences) : null) ??
                        event.recurrenceLabel ??
                        (event.endDate && event.endDate !== event.startDate
                          ? `${formatCardDate(event.startDate, false)} – ${formatCardDate(event.endDate)}`
                          : formatCardDate(event.startDate))}
                    </p>
                    <Link
                      href={eventHref(event)}
                      className="font-medium text-stone-900 hover:text-brick-600 transition-colors"
                    >
                      {event.title}
                    </Link>
                    {event.location && <p className="text-xs text-stone-500 mt-0.5">{event.location}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap gap-6">
          <Link href="/events" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            All Zionsville events →
          </Link>
          <Link href="/downtown" className="text-sm text-brick-600 hover:text-brick-700 font-medium">
            Explore downtown Zionsville →
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
