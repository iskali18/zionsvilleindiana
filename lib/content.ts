import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHeadingId from 'remark-heading-id'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeStringify from 'rehype-stringify'
import type { EventMeta, ParkMeta, BusinessMeta, ArticleMeta, RelatedEvent } from '@/types'

const contentDir = path.join(process.cwd(), 'content')

// ─── Indiana time ────────────────────────────────────────────────────────────

/** The current date and time in Indianapolis. Vercel runs in UTC, where the
 *  date turns over at 8 p.m. Indiana time (7 p.m. in winter); reading the clock
 *  here keeps event dates on local time, so dev and prod agree. */
export function indianaNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Indiana/Indianapolis' }))
}

/** Midnight at the start of today, Indianapolis time. An event's card stays up
 *  through the end of its date here, not until 8 p.m. */
export function indianaToday(): Date {
  const now = indianaNow()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

// ─── Display dates ───────────────────────────────────────────────────────────
// Dates are built from their year, month and day numbers instead of being read
// through the server clock, so they show the same day on Vercel (UTC) as in dev.

/** Month abbreviations as the articles write them (AP style). */
export const MONTHS = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Year, month, day and weekday of a date. YAML turns an unquoted date into a
 *  Date at UTC midnight, so a Date is read in UTC. */
export function dateParts(value: string | Date) {
  const [y, m, d] =
    value instanceof Date
      ? [value.getUTCFullYear(), value.getUTCMonth() + 1, value.getUTCDate()]
      : value.slice(0, 10).split('-').map(Number)
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }
}

/** "Sat, Oct. 24, 2026", or "Sat, Oct. 24" without the year. */
export function formatCardDate(value: string | Date, withYear = true): string {
  const { y, m, d, weekday } = dateParts(value)
  return `${WEEKDAYS[weekday]}, ${MONTHS[m - 1]} ${d}${withYear ? `, ${y}` : ''}`
}

// ─── Generic helpers ─────────────────────────────────────────────────────────

function getContentDir(section: string) {
  return path.join(contentDir, section)
}

function getSlugs(section: string): string[] {
  return fs
    .readdirSync(getContentDir(section))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''))
}

async function parseMarkdown(content: string): Promise<string> {
  const result = await remark()
    .use(remarkHeadingId)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['noopener', 'noreferrer'],
      protocols: ['http', 'https'],
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content)
  return result.toString()
}

function readFile(section: string, slug: string) {
  const filePath = path.join(getContentDir(section), `${slug}.md`)
  const raw = fs.readFileSync(filePath, 'utf8')
  return matter(raw)
}

// ─── Recurrence helpers ──────────────────────────────────────────────────────

const dayNameToIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

/**
 * For an event with weekly recurrence, returns the next occurrence date
 * (YYYY-MM-DD) on or after today, within the season window.
 * Returns null if the season has ended or hasn't started yet within the window.
 */
export function nextWeeklyOccurrence(
  recurrence: { pattern: string; dayOfWeek: string; startSeason: string | Date; endSeason: string | Date },
  today: Date
): string | null {
  if (recurrence.pattern !== 'weekly') return null

  const targetDayIndex = dayNameToIndex[recurrence.dayOfWeek.toLowerCase()]
  if (targetDayIndex === undefined) return null

  // YAML may parse unquoted YYYY-MM-DD as Date objects. Coerce to YYYY-MM-DD string.
  const toIso = (v: string | Date): string =>
    v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : v

  const startSeason = new Date(toIso(recurrence.startSeason) + 'T00:00:00')
  const endSeason = new Date(toIso(recurrence.endSeason) + 'T23:59:59')

  // Anchor point: max of today and season start
  const anchor = today < startSeason ? startSeason : today
  const anchorDate = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate())

  // Days forward to the next target day-of-week (0 if today is the target day)
  const daysToAdd = (targetDayIndex - anchorDate.getDay() + 7) % 7
  const next = new Date(anchorDate)
  next.setDate(anchorDate.getDate() + daysToAdd)

  // Past end of season → no more occurrences
  if (next > endSeason) return null

  const yyyy = next.getFullYear()
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/**
 * For an event with an explicit `occurrences` list, returns the first listed
 * date (YYYY-MM-DD) on or after today. Returns null once every date has passed.
 * Handles monthly, scattered, and multi-weekday patterns that the weekly
 * `recurrence` field can't express.
 */
function nextListedOccurrence(occurrences: Array<string | Date>, today: Date): string | null {
  // YAML may parse unquoted YYYY-MM-DD as Date objects. Coerce to YYYY-MM-DD string.
  const toIso = (v: string | Date): string =>
    v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : v

  const upcoming = occurrences
    .map(toIso)
    .sort()
    .filter((d) => new Date(d + 'T23:59:59') >= today)

  return upcoming[0] ?? null
}

/**
 * If event has an `occurrences` list or a `recurrence` field, returns the event
 * with `startDate` overwritten by the next upcoming date. Otherwise returns the
 * event unchanged. If every date has passed, returns null (caller filters out).
 * `occurrences` takes precedence over `recurrence`.
 */
function applyRecurrence(event: EventMeta, today: Date): EventMeta | null {
  if (event.occurrences?.length) {
    const nextDate = nextListedOccurrence(event.occurrences, today)
    if (!nextDate) return null

    return { ...event, startDate: nextDate }
  }

  if (!event.recurrence) return event

  const nextDate = nextWeeklyOccurrence(event.recurrence, today)
  if (!nextDate) return null

  return { ...event, startDate: nextDate }
}

/**
 * Card-friendly summary of an `occurrences` list: the next few upcoming dates,
 * months written as in formatCardDate, ellipsis when more remain. Past dates
 * drop off on their own.
 *   4+ upcoming -> "Sat, March 28, April 25, May 23…"
 *   1-3 upcoming -> "Sat, Sept. 26, Oct. 24, 2026"
 * Returns null when every listed date has passed, so callers can fall back.
 */
export function formatOccurrenceList(
  occurrences: Array<string | Date>,
  today: Date = indianaToday(),
  max = 3
): string | null {
  const toIso = (v: string | Date): string =>
    v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : v

  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const upcoming = occurrences
    .map(toIso)
    .sort()
    .filter((d) => new Date(d + 'T23:59:59') >= midnight)

  if (upcoming.length === 0) return null

  const weekday = WEEKDAYS[dateParts(upcoming[0]).weekday]
  const shown = upcoming.slice(0, max).map((d) => {
    const { m, d: day } = dateParts(d)
    return `${MONTHS[m - 1]} ${day}`
  })

  if (upcoming.length > max) return `${weekday}, ${shown.join(', ')}…`

  const year = dateParts(upcoming[upcoming.length - 1]).y
  return `${weekday}, ${shown.join(', ')}, ${year}`
}

// ─── Events ──────────────────────────────────────────────────────────────────

// ─── Series ──────────────────────────────────────────────────────────────────

/** How far ahead a series shows its events, and the default number of cards. */
const SERIES_WINDOW_DAYS = 14
const SERIES_DEFAULT_MAX_CARDS = 3

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Turns a series file into one card per item. Shows the items that start in
 * the next SERIES_WINDOW_DAYS days, up to `maxCards`. When none fall in that
 * window, shows only the next one, so the series never drops out between
 * dates. Items that have ended drop off; once all have, the series is gone.
 * Each card gets a slug from its own title, so calendar entries can match it.
 * With `windowed` false, returns every upcoming item (used for calendar links).
 */
function expandSeries(series: EventMeta, today: Date, windowed = true): EventMeta[] {
  const toIso = (v: string | Date): string =>
    v instanceof Date
      ? `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`
      : v

  const windowEnd = new Date(today)
  windowEnd.setDate(windowEnd.getDate() + SERIES_WINDOW_DAYS)

  const upcoming = (series.items ?? [])
    .map((item) => ({ ...item, date: toIso(item.date), endDate: item.endDate ? toIso(item.endDate) : undefined }))
    .filter((item) => new Date((item.endDate ?? item.date) + 'T23:59:59') >= today)
    .sort((a, b) => a.date.localeCompare(b.date))

  const inWindow = upcoming.filter((item) => new Date(item.date + 'T00:00:00') <= windowEnd)
  const shown = !windowed
    ? upcoming
    : inWindow.length
    ? inWindow.slice(0, series.maxCards ?? SERIES_DEFAULT_MAX_CARDS)
    : upcoming.slice(0, 1)

  const used = new Set<string>()
  return shown.map((item) => {
    let slug = slugify(item.title)
    for (let n = 2; used.has(slug); n++) slug = `${slugify(item.title)}-${n}`
    used.add(slug)

    return {
      ...series,
      slug,
      seriesSlug: series.slug,
      title: item.title,
      startDate: item.date,
      endDate: item.endDate,
      description: item.description ?? series.description,
      location: item.location ?? series.location,
      image: item.image ?? series.image,
      imageAlt: item.imageAlt ?? series.imageAlt,
      photoCredit: item.photoCredit ?? series.photoCredit,
      showOnHomepage: item.showOnHomepage ?? series.showOnHomepage,
      // Fall back to the series page, which exists, never the item's own slug.
      linkTo: item.linkTo ?? series.linkTo ?? `/events/${series.slug}`,
      items: undefined,
      occurrences: undefined,
      recurrenceLabel: undefined,
      recurrence: undefined,
    }
  })
}

/** Where an event's card should link: its own page, or the hub section named
 *  in `linkTo` for card-only events. */
export function eventHref(event: Pick<EventMeta, 'slug' | 'linkTo'>): string {
  return event.linkTo ?? `/events/${event.slug}`
}

// ─── Follow-up events ────────────────────────────────────────────────────────
// A `relatedEvent` is a short follow-up shown on the main event's page, such as
// touring the People's Choice winner after Home-A-Rama. Everything it adds
// turns off by itself the day after its last date.

/** "2026-10-22" from a frontmatter date, quoted or not. */
function ymd(value: string | Date): string {
  const { y, m, d } = dateParts(value)
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

/** The follow-up while it is upcoming or on, through the end of its last day
 *  in Indiana. Null when there is none, or once it has ended. */
export function activeRelatedEvent(
  event: Pick<EventMeta, 'relatedEvent'>,
  today = indianaToday()
): RelatedEvent | null {
  const related = event.relatedEvent
  if (!related) return null
  const last = ymd(related.endDate ?? related.startDate)
  return new Date(last + 'T23:59:59') >= today ? related : null
}

/** The id of the follow-up's notice on the page, which its card links to. */
export function relatedEventAnchor(related: RelatedEvent): string {
  // Drop apostrophes first: "People’s" -> "peoples", as heading anchors read.
  return slugify((related.heading ?? related.title).replace(/['’]/g, ''))
}

/** Indiana's UTC offset on a date, "-04:00" in daylight time and "-05:00" in
 *  standard time, so schema times are right on either side of a time change. */
function indianaOffset(day: string): string {
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Indiana/Indianapolis',
    timeZoneName: 'shortOffset',
  })
    .formatToParts(new Date(`${day}T17:00:00Z`))
    .find((part) => part.type === 'timeZoneName')?.value
  const match = name?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
  return match ? `${match[1]}${match[2].padStart(2, '0')}:${match[3] ?? '00'}` : '-05:00'
}

/** "2026-10-22T12:00:00-04:00", or just the date when no time is given. */
function dateTime(day: string, time?: string): string {
  return time ? `${day}T${time}:00${indianaOffset(day)}` : day
}

/** Each day of the follow-up with that day's start and end, for schema. */
export function relatedEventDays(related: RelatedEvent): Array<{ start: string; end?: string }> {
  const first = ymd(related.startDate)
  const last = ymd(related.endDate ?? related.startDate)
  const days: Array<{ start: string; end?: string }> = []
  const cursor = new Date(first + 'T12:00:00Z')
  // Capped at 31 days, so a typo in a year can't run away.
  for (let i = 0; i < 31; i++) {
    const day = cursor.toISOString().slice(0, 10)
    if (day > last) break
    days.push({
      start: dateTime(day, related.startTime),
      end: related.endTime ? dateTime(day, related.endTime) : undefined,
    })
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

/** The follow-up as a card for the events page, homepage and This Weekend,
 *  linking to its notice on the main event's page. Null once it has ended. */
function relatedEventCard(event: EventMeta, today: Date): EventMeta | null {
  const related = activeRelatedEvent(event, today)
  if (!related) return null
  const first = ymd(related.startDate)
  const last = ymd(related.endDate ?? related.startDate)

  return {
    slug: slugify(related.title),
    title: related.title,
    description: related.summary ?? related.description,
    // Cards don't show these, but every event carries them.
    metaTitle: related.metaTitle ?? related.title,
    metaDescription: related.metaDescription ?? related.summary ?? related.description,
    eventType: 'oneoff',
    startDate: first,
    ...(last !== first && { endDate: last }),
    ...(related.startTime && { startDateTime: dateTime(first, related.startTime) }),
    ...(related.endTime && { endDateTime: dateTime(last, related.endTime) }),
    location: related.location,
    address: related.address,
    ...(related.addressLocality && { addressLocality: related.addressLocality }),
    ...(related.postalCode && { postalCode: related.postalCode }),
    image: related.image ?? event.image,
    imageAlt: related.imageAlt ?? event.imageAlt,
    tags: event.tags,
    featured: event.featured,
    showOnHomepage: event.showOnHomepage,
    linkTo: `/events/${event.slug}#${relatedEventAnchor(related)}`,
  }
}

/** Every event and every upcoming series item, with where it links. The
 *  Google Calendar list on the events page matches its entries against these,
 *  so an item links even before its card is showing. */
export function getCalendarLinkTargets(): Array<{ slug: string; href: string }> {
  const today = indianaToday()

  const events = getAllEvents().filter((e) => !e.seriesSlug)
  const seriesItems = getSlugs('events')
    .map((slug) => ({ slug, ...readFile('events', slug).data }) as EventMeta)
    .filter((e) => e.items?.length)
    .flatMap((e) => expandSeries(e, today, false))

  return [...events, ...seriesItems].map((e) => ({ slug: e.slug, href: eventHref(e) }))
}

export function getAllEventSlugs(): string[] {
  return getSlugs('events')
}

/** Event files that have a page of their own. Leaves out card-only and series
 *  files (those with `linkTo`), whose /events/{slug} address only redirects. */
export function getEventPageSlugs(): string[] {
  return getSlugs('events').filter((slug) => !readFile('events', slug).data.linkTo)
}

export function getAllEvents(): EventMeta[] {
  const today = indianaToday()

  return getSlugs('events')
    .map((slug) => {
      const { data } = readFile('events', slug)
      return { slug, ...data } as EventMeta
    })
    // Series files become one card per upcoming item.
    .flatMap((e) => (e.items?.length ? expandSeries(e, today) : [e]))
    // A follow-up event gets its own card next to the main event.
    .flatMap((e) => {
      const card = relatedEventCard(e, today)
      return card ? [e, card] : [e]
    })
    // Resolve recurrence: replace startDate with next occurrence for recurring events.
    // Drop recurring events that have ended for the season.
    .map((e) => applyRecurrence(e, today))
    .filter((e): e is EventMeta => e !== null)
    .sort((a, b) => {
      const byDate = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      if (byDate !== 0) return byDate
      return timeOfDay(a).localeCompare(timeOfDay(b))
    })
}

/** Clock time from `startDateTime`, for ordering two events on the same day.
 *
 *  Only the time is used, never the whole value — applyRecurrence() rewrites
 *  `startDate` to the next occurrence but leaves `startDateTime` on the first
 *  date of the season, so comparing the full datetime would sort by a date the
 *  event is no longer on.
 *
 *  Events with no time sort last within their day. */
function timeOfDay(event: EventMeta): string {
  return event.startDateTime?.slice(11, 16) ?? '99:99'
}

/** Pass `{ homepage: true }` from the homepage: it drops events with
 *  `showOnHomepage: false` and lists at most one card per series, so a series
 *  can't fill the few slots there. The events page passes nothing. */
export function getFeaturedEvents(limit = 3, options: { homepage?: boolean } = {}): EventMeta[] {
  const today = indianaToday()

  // getAllEvents() already resolves recurrence and sorts by resolved startDate
  const all = getAllEvents().filter((e) => !options.homepage || e.showOnHomepage !== false)

  // 1. Featured events that have not finished yet (not perennials).
  //    Compare against endDate, not startDate — a multi-day event is still
  //    happening on its second day and should stay listed until it is over.
  const upcoming = all
    .filter(
      (e) =>
        e.featured &&
        !e.perennial &&
        new Date((e.endDate ?? e.startDate) + 'T23:59:59') >= today
    )
    .filter(seriesCap(options.homepage ? 1 : undefined))
    .slice(0, limit)

  if (upcoming.length >= limit) return upcoming

  // 2. Sort perennials by next upcoming occurrence of their perennialSortDate
  const datedSlugs = upcoming.map((e) => e.slug)

  const sortedPerennials = all
    .filter((e) => e.perennial && !datedSlugs.includes(e.perennialFor ?? ''))
    .sort((a, b) => {
      return daysUntilNext(a.perennialSortDate ?? '01-01') - daysUntilNext(b.perennialSortDate ?? '01-01')
    })

  const fillSlots = limit - upcoming.length
  return [...upcoming, ...sortedPerennials.slice(0, fillSlots)]
}

/** Filter that keeps at most `max` cards per series, in list order. */
function seriesCap(max?: number) {
  const seen = new Map<string, number>()
  return (e: EventMeta): boolean => {
    if (!max || !e.seriesSlug) return true
    const count = seen.get(e.seriesSlug) ?? 0
    seen.set(e.seriesSlug, count + 1)
    return count < max
  }
}

function daysUntilNext(mmdd: string): number {
  const [month, day] = mmdd.split('-').map(Number)
  const now = indianaNow()
  const thisYear = new Date(now.getFullYear(), month - 1, day)
  if (thisYear >= now) return thisYear.getTime() - now.getTime()
  // Already passed this year — use next year
  const nextYear = new Date(now.getFullYear() + 1, month - 1, day)
  return nextYear.getTime() - now.getTime()
}

export async function getEvent(
  slug: string
): Promise<{ meta: EventMeta; contentHtml: string }> {
  const { data, content } = readFile('events', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as EventMeta, contentHtml }
}

// ─── Parks ───────────────────────────────────────────────────────────────────

export function getAllParkSlugs(): string[] {
  return getSlugs('parks')
}

export function getAllParks(): ParkMeta[] {
  return getSlugs('parks').map((slug) => {
    const { data } = readFile('parks', slug)
    return { slug, ...data } as ParkMeta
  })
}

export async function getPark(
  slug: string
): Promise<{ meta: ParkMeta; contentHtml: string }> {
  const { data, content } = readFile('parks', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as ParkMeta, contentHtml }
}

// ─── Businesses ──────────────────────────────────────────────────────────────

export function getAllBusinessSlugs(): string[] {
  return getSlugs('businesses')
}

export function getAllBusinesses(): BusinessMeta[] {
  return getSlugs('businesses').map((slug) => {
    const { data } = readFile('businesses', slug)
    return { slug, ...data } as BusinessMeta
  })
}

export async function getBusiness(
  slug: string
): Promise<{ meta: BusinessMeta; contentHtml: string }> {
  const { data, content } = readFile('businesses', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as BusinessMeta, contentHtml }
}

export function getBusinessesByCategory(
  category: BusinessMeta['category']
): BusinessMeta[] {
  return getAllBusinesses().filter((b) => b.category === category)
}

// ─── Articles ────────────────────────────────────────────────────────────────

export function getAllArticleSlugs(): string[] {
  return getSlugs('articles')
}

/**
 * Articles are ordered manually via the `hubOrder` frontmatter field, not by date.
 * `lastUpdated` changes on copy edits, so it isn't a meaningful hub order.
 * Number hubOrder in tens (10, 20, 30…) so a new article can be slotted between
 * two existing ones without renumbering. Articles without hubOrder sort last,
 * most recently updated first.
 */
export function getAllArticles(): ArticleMeta[] {
  return getSlugs('articles')
    .map((slug) => {
      const { data } = readFile('articles', slug)
      return { slug, ...data } as ArticleMeta
    })
    .sort((a, b) => {
      const orderA = a.hubOrder ?? Number.MAX_SAFE_INTEGER
      const orderB = b.hubOrder ?? Number.MAX_SAFE_INTEGER
      if (orderA !== orderB) return orderA - orderB
      return (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? '')
    })
}

export async function getArticle(
  slug: string
): Promise<{ meta: ArticleMeta; contentHtml: string }> {
  const { data, content } = readFile('articles', slug)
  const contentHtml = await parseMarkdown(content)
  return { meta: { slug, ...data } as ArticleMeta, contentHtml }
}
