import { cache } from 'react'
import {
  getFeaturedEvents,
  getCalendarLinkTargets,
  eventHref,
  indianaToday,
  nextWeeklyOccurrence,
  dateParts,
  MONTHS,
} from '@/lib/content'
import { getCalendarEventsBetween, indianaDate, matchEventToSlug, buildEventSchema } from '@/lib/calendar'
import type { EventMeta } from '@/types'

// ─── Date helpers ────────────────────────────────────────────────────────────
// All dates here are plain YYYY-MM-DD strings in Indiana time. Comparing them
// as strings works because the format sorts in date order.

export const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (n: number) => String(n).padStart(2, '0')

/** YYYY-MM-DD from a frontmatter date. YAML hands over an unquoted date as a
 *  Date at UTC midnight, so that case is read in UTC. */
export function toIso(value: string | Date): string {
  return value instanceof Date
    ? `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`
    : value.slice(0, 10)
}

/** Today's date in Indiana. */
export function todayIso(): string {
  const t = indianaToday()
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`
}

export function addDays(ymd: string, days: number): string {
  const { y, m, d } = dateParts(ymd)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** "Oct. 24" */
export function formatShortDate(ymd: string): string {
  const { m, d } = dateParts(ymd)
  return `${MONTHS[m - 1]} ${d}`
}

/** "Oct. 23–25", or "Oct. 30–Nov. 1" across a month. */
export function formatDateRange(start: string, end: string): string {
  const a = dateParts(start)
  const b = dateParts(end)
  if (start === end) return formatShortDate(start)
  if (a.m === b.m) return `${MONTHS[a.m - 1]} ${a.d}–${b.d}`
  return `${formatShortDate(start)}–${formatShortDate(end)}`
}

/** "Saturday, Oct. 24" */
export function formatDayHeading(ymd: string): string {
  return `${WEEKDAYS_LONG[dateParts(ymd).weekday]}, ${formatShortDate(ymd)}`
}

/** Every date from start to end, inclusive. */
function daysBetween(start: string, end: string): string[] {
  const days: string[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  return days
}

/** Splits "6:00 PM" into "6" and "PM", dropping ":00" on the hour. Calendar
 *  times may use a narrow no-break space before PM, which \s covers. */
function splitTime(time: string): { clock: string; meridiem: string } | null {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AP]M)$/i)
  if (!match) return null
  const clock = match[2] && match[2] !== '00' ? `${match[1]}:${match[2]}` : match[1]
  return { clock, meridiem: match[3].toUpperCase() }
}

/** Times as the articles write them: "6 PM", "7–10 PM" (AM or PM said once
 *  when both ends share it), "11:30 AM–1 PM" when they differ. */
export function timeRange(start?: string, end?: string): string | undefined {
  if (!start) return undefined
  const a = splitTime(start)
  if (!a) return end ? `${start}–${end}` : start
  if (!end) return `${a.clock} ${a.meridiem}`
  const b = splitTime(end)
  if (!b) return `${a.clock} ${a.meridiem}–${end}`
  return a.meridiem === b.meridiem
    ? `${a.clock}–${b.clock} ${b.meridiem}`
    : `${a.clock} ${a.meridiem}–${b.clock} ${b.meridiem}`
}

/** Clock time from an ISO timestamp as written ("2026-10-23T18:00:00-04:00"
 *  -> "6:00 PM"). The frontmatter times are already Indiana time. */
function clockTime(iso?: string): string | undefined {
  const match = iso?.match(/T(\d{2}):(\d{2})/)
  if (!match) return undefined
  const hours = Number(match[1])
  return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? 'AM' : 'PM'}`
}

/** "13:05" from a time like "1:05 PM", for sorting. Untimed entries sort first. */
function sortKey(time?: string): string {
  const match = time?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return '00:00'
  const hours = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0)
  return `${pad(hours)}:${match[2]}`
}

// ─── The weekend ─────────────────────────────────────────────────────────────

/** The weekend the page covers. Monday through Thursday, that's the coming
 *  Friday to Sunday. Friday through Sunday, it's the current weekend, starting
 *  from today so days that are over drop off. */
export function getWeekend(today = todayIso()) {
  const weekday = dateParts(today).weekday
  const offset = weekday === 0 ? -2 : weekday === 6 ? -1 : 5 - weekday
  const friday = addDays(today, offset)
  const sunday = addDays(friday, 2)
  return { friday, sunday, from: today > friday ? today : friday }
}

export interface WeekendItem {
  key: string
  title: string
  /** Internal path, outside URL, or none when there's nowhere to send people. */
  href?: string
  external: boolean
  time?: string
  sortTime: string
  location?: string
  description?: string
  image?: string
  imageAlt?: string
  /** schema.org Event for this listing, when there's enough to build one. */
  schema?: Record<string, unknown>
}

export interface WeekendDay {
  date: string
  items: WeekendItem[]
}

export interface WeekendData {
  friday: string
  sunday: string
  from: string
  /** Running the whole weekend and beyond, such as a season-long attraction. */
  allWeekend: WeekendItem[]
  days: WeekendDay[]
  /** The next few featured events after the weekend. */
  comingUp: EventMeta[]
  /** Every item once, in page order (by day and time, then all-weekend items),
   *  for the meta description and schema. */
  all: WeekendItem[]
}

/** The dates a featured event happens on between `from` and `to`. */
function featuredDates(event: EventMeta, from: string, to: string): string[] {
  if (event.occurrences?.length) {
    return event.occurrences.map(toIso).filter((d) => d >= from && d <= to)
  }

  if (event.recurrence?.pattern === 'weekly') {
    const dates: string[] = []
    for (let anchor = from; anchor <= to; ) {
      const { y, m, d } = dateParts(anchor)
      const next = nextWeeklyOccurrence(event.recurrence, new Date(y, m - 1, d))
      if (!next || next > to) break
      dates.push(next)
      anchor = addDays(next, 1)
    }
    return dates
  }

  // Any other repeating pattern: only the next date is known, which
  // getAllEvents() has already put in startDate.
  if (event.recurrence) {
    const next = toIso(event.startDate)
    return next >= from && next <= to ? [next] : []
  }

  const start = toIso(event.startDate)
  const end = event.endDate ? toIso(event.endDate) : start
  const first = start > from ? start : from
  const last = end < to ? end : to
  return first <= last ? daysBetween(first, last) : []
}

const SITE = 'https://zionsvilleindiana.com'

/** schema.org Event for a featured event, built the same way as the Event
 *  schema on /events/[slug]. A repeating event is marked up for its first
 *  date this weekend, at its usual time of day. */
function featuredEventSchema(event: EventMeta, firstDate: string, repeats: boolean) {
  const onDate = (dt?: string) => (dt ? `${firstDate}${dt.slice(10)}` : undefined)
  const startDate = repeats ? onDate(event.startDateTime) ?? firstDate : event.startDateTime ?? toIso(event.startDate)
  const endDate = repeats
    ? onDate(event.endDateTime)
    : event.endDateTime ?? (event.endDate ? toIso(event.endDate) : undefined)
  const href = eventHref(event)

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate,
    ...(endDate && { endDate }),
    // Short enum name ("EventCancelled") or a full URL, as on /events/[slug].
    eventStatus: (event.eventStatus ?? 'EventScheduled').startsWith('http')
      ? event.eventStatus
      : `https://schema.org/${event.eventStatus ?? 'EventScheduled'}`,
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address,
        addressLocality: event.addressLocality ?? 'Zionsville',
        addressRegion: 'IN',
        postalCode: event.postalCode ?? '46077',
        addressCountry: 'US',
      },
    },
    ...(event.image && { image: `${SITE}${event.image}` }),
    url: href.startsWith('http') ? href : `${SITE}${href}`,
    organizer: {
      '@type': 'Organization',
      name: 'Zionsville Indiana',
      url: SITE,
    },
  }
}

function spansWholeWeekend(start: string, end: string, friday: string, sunday: string) {
  return start < friday && end > sunday
}

/** Drops repeats of the same item, such as a two-day event listed under both
 *  days, keeping the first. A weekly calendar entry has a separate key for each
 *  date, so it's matched on title and link as well. */
function uniqueByKey(items: WeekendItem[]): WeekendItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    const id = `${item.title}|${item.href ?? ''}`
    if (seen.has(item.key) || seen.has(id)) return false
    seen.add(item.key)
    seen.add(id)
    return true
  })
}

/** A title in slug form ("Zionsville Presbyterian Church Trunk or Treat" ->
 *  "zionsville-presbyterian-church-trunk-or-treat"), so a calendar entry can
 *  be matched to an event whose file name is shorter, like zpc-trunk-or-treat. */
function titleSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function stripHtml(text?: string): string | undefined {
  const plain = text?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain || undefined
}

/** Featured events and community calendar entries for the weekend, grouped by
 *  day. A calendar entry that matches a featured event is left out, so nothing
 *  is listed twice. Cached per request, so the page and its metadata share it. */
export const getWeekendData = cache(async (): Promise<WeekendData> => {
  const { friday, sunday, from } = getWeekend()
  const byDay = new Map<string, WeekendItem[]>(daysBetween(from, sunday).map((d) => [d, []]))
  const allWeekend: WeekendItem[] = []

  // ── Featured events ──
  const featured = getFeaturedEvents(500).filter((e) => !e.perennial)
  const listedSlugs: string[] = []
  // Each listed event under both its file name and its title, for matching
  // calendar entries against it.
  const listedKeys: string[] = []

  for (const event of featured) {
    const dates = featuredDates(event, from, sunday)
    if (dates.length === 0) continue
    listedSlugs.push(event.slug)
    listedKeys.push(event.slug, titleSlug(event.title))

    const start = event.startDateTime ? clockTime(event.startDateTime) : undefined
    const end = event.endDateTime ? clockTime(event.endDateTime) : undefined
    const item: WeekendItem = {
      key: `event-${event.slug}`,
      title: event.title,
      href: eventHref(event),
      external: false,
      time: timeRange(start, end),
      sortTime: event.startDateTime?.slice(11, 16) ?? '00:00',
      location: event.location,
      description: event.description,
      image: event.image,
      imageAlt: event.imageAlt,
      schema: featuredEventSchema(
        event,
        dates[0],
        Boolean(event.occurrences?.length || event.recurrence)
      ),
    }

    const isSingleRun = !event.occurrences?.length && !event.recurrence
    const runEnd = event.endDate ? toIso(event.endDate) : toIso(event.startDate)
    if (isSingleRun && spansWholeWeekend(toIso(event.startDate), runEnd, friday, sunday)) {
      allWeekend.push(item)
    } else {
      dates.forEach((d) => byDay.get(d)?.push(item))
    }
  }

  // ── Community calendar ──
  // Fetch a day either side of the weekend in UTC, then sort entries onto
  // their Indiana dates, so no time zone math is needed for the request.
  const calendar = await getCalendarEventsBetween(
    `${addDays(from, -1)}T00:00:00Z`,
    `${addDays(sunday, 2)}T00:00:00Z`
  )
  // Where a calendar entry links when it matches one of our events, by file
  // name or by the event's title.
  const hrefByKey = new Map(getCalendarLinkTargets().map((t) => [t.slug, t.href]))
  for (const event of featured) {
    const key = titleSlug(event.title)
    if (!hrefByKey.has(key)) hrefByKey.set(key, eventHref(event))
  }
  const allKeys = [...hrefByKey.keys()]

  for (const entry of calendar) {
    // Already listed as a featured event this weekend.
    if (matchEventToSlug(entry.title, listedKeys)) continue

    const startDay = entry.isAllDay ? entry.startDate.slice(0, 10) : indianaDate(entry.startDate)
    // An all-day entry's end date is the day after it ends. A timed entry
    // counts as multi-day only when it runs a full day or more, so an 11:30 PM
    // show that ends at 1 AM stays on its start date.
    const ONE_DAY = 24 * 60 * 60 * 1000
    let endDay = startDay
    if (entry.isAllDay && entry.endDate) {
      endDay = addDays(entry.endDate.slice(0, 10), -1)
    } else if (
      !entry.isAllDay &&
      entry.endDate &&
      new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime() >= ONE_DAY
    ) {
      endDay = indianaDate(entry.endDate)
    }
    if (endDay < startDay) endDay = startDay

    const first = startDay > from ? startDay : from
    const last = endDay < sunday ? endDay : sunday
    if (first > last) continue

    const matched = matchEventToSlug(entry.title, allKeys)
    const href = matched ? hrefByKey.get(matched) ?? `/events/${matched}` : entry.officialUrl
    const time = entry.isAllDay ? undefined : timeRange(entry.startTime, entry.endTime)

    const item: WeekendItem = {
      key: `calendar-${entry.id}`,
      title: entry.title,
      href,
      external: !matched && Boolean(entry.officialUrl),
      time,
      sortTime: sortKey(entry.startTime),
      location: entry.location,
      description: stripHtml(entry.description),
      schema: buildEventSchema(entry) ?? undefined,
    }

    if (spansWholeWeekend(startDay, endDay, friday, sunday)) {
      allWeekend.push(item)
    } else {
      daysBetween(first, last).forEach((d) => byDay.get(d)?.push(item))
    }
  }

  const bySortTime = (a: WeekendItem, b: WeekendItem) =>
    a.sortTime.localeCompare(b.sortTime) || a.title.localeCompare(b.title)

  const days = [...byDay.entries()]
    .map(([date, items]) => ({ date, items: items.sort(bySortTime) }))
    .filter((day) => day.items.length > 0)

  const comingUp = featured
    .filter((e) => toIso(e.startDate) > sunday && !listedSlugs.includes(e.slug))
    .slice(0, 4)

  return {
    friday,
    sunday,
    from,
    allWeekend,
    days,
    comingUp,
    all: uniqueByKey([...days.flatMap((d) => d.items), ...allWeekend]),
  }
})

/** Joins names with the Oxford comma: "A", "A and B", "A, B, and C". */
export function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ')
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

/** Fits as many names as possible (up to `max`) into a sentence of at most
 *  `limit` characters, keeping their order and skipping any that would run
 *  over. `build` gets the chosen names and whether any were left out. */
export function fitNames(
  names: string[],
  limit: number,
  build: (shown: string[], more: boolean) => string,
  max = Infinity
): string | null {
  const shown: string[] = []
  for (const name of names) {
    if (shown.length >= max) break
    const trial = [...shown, name]
    if (build(trial, trial.length < names.length).length <= limit) shown.push(name)
  }
  return shown.length ? build(shown, shown.length < names.length) : null
}
