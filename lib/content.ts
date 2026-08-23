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
import type { EventMeta, ParkMeta, BusinessMeta, ArticleMeta } from '@/types'

const contentDir = path.join(process.cwd(), 'content')

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
function nextWeeklyOccurrence(
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
 * short month names, ellipsis when more remain. Past dates drop off on their own.
 *   4+ upcoming -> "Sat, Mar 28, Apr 25, May 23…"
 *   1-3 upcoming -> "Sat, Sep 26, Oct 24, 2026"
 * Returns null when every listed date has passed, so callers can fall back.
 */
export function formatOccurrenceList(
  occurrences: Array<string | Date>,
  today: Date = new Date(),
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

  const at = (d: string) => new Date(d + 'T00:00:00Z')
  const weekday = at(upcoming[0]).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
  const shown = upcoming
    .slice(0, max)
    .map((d) => at(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }))

  if (upcoming.length > max) return `${weekday}, ${shown.join(', ')}…`

  const year = at(upcoming[upcoming.length - 1]).getUTCFullYear()
  return `${weekday}, ${shown.join(', ')}, ${year}`
}

// ─── Events ──────────────────────────────────────────────────────────────────

export function getAllEventSlugs(): string[] {
  return getSlugs('events')
}

export function getAllEvents(): EventMeta[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  return getSlugs('events')
    .map((slug) => {
      const { data } = readFile('events', slug)
      return { slug, ...data } as EventMeta
    })
    // Resolve recurrence: replace startDate with next occurrence for recurring events.
    // Drop recurring events that have ended for the season.
    .map((e) => applyRecurrence(e, today))
    .filter((e): e is EventMeta => e !== null)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
}

export function getFeaturedEvents(limit = 3): EventMeta[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // getAllEvents() already resolves recurrence and sorts by resolved startDate
  const all = getAllEvents()

  // 1. Upcoming dated featured events (not perennials, on or after today)
  const upcoming = all
    .filter((e) => e.featured && !e.perennial && new Date(e.startDate + 'T00:00:00') >= today)
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

function daysUntilNext(mmdd: string): number {
  const [month, day] = mmdd.split('-').map(Number)
  const now = new Date()
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
