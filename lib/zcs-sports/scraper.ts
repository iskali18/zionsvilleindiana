/**
 * ZCS Sports Calendar — HTML scraper
 *
 * Fetches Eventlink Events pages, iterates pagination, and produces
 * AthleticEvent[] via the parser module.
 *
 * Depends on cheerio. Run `npm install cheerio` if not already installed.
 *
 * Uses Next.js server-side fetch with 15-min revalidation. Only call from
 * server components or route handlers.
 */

import * as cheerio from 'cheerio'
import {
  categorizeEvent,
  parseCalendarName,
  parseDateTime,
  parseEventName,
} from './parser'
import type { AthleticEvent, School } from './types'
import { SCHOOL_CONFIGS } from './types'

// ─── Configuration ─────────────────────────────────────────────────────────

/** Max pages to walk per school. Safety cap in case pagination is broken. */
const MAX_PAGES_PER_SCHOOL = 20

/** Cache duration for individual page fetches (in seconds). */
const FETCH_REVALIDATE_SECONDS = 900 // 15 minutes

const USER_AGENT =
  'Mozilla/5.0 (compatible; ZionsvilleIndianaBot/1.0; +https://zionsvilleindiana.com)'

// ─── Page fetch ────────────────────────────────────────────────────────────

/**
 * Fetch a single Events page's HTML.
 * Uses Next.js fetch caching so multiple readers share one HTTP call.
 */
async function fetchEventsPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: FETCH_REVALIDATE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`)
  }

  return response.text()
}

// ─── Row extraction ────────────────────────────────────────────────────────

/**
 * Extract raw cell text preserving intentional line breaks.
 * Eventlink uses <br> to split event name / subtype, and date / time.
 */
function cellText(el: cheerio.Cheerio<cheerio.Element>): string {
  // Replace <br> with newlines before extracting text so multi-line cells
  // preserve their structure for the downstream parsers.
  const html = el.html() ?? ''
  const normalized = html.replace(/<br\s*\/?>/gi, '\n')
  return cheerio.load(normalized).root().text().trim()
}

/**
 * Parse one row of the events table into an AthleticEvent.
 * Returns null if the row doesn't have enough cells or the datetime
 * couldn't be parsed.
 */
function parseEventRow(
  $: cheerio.CheerioAPI,
  row: cheerio.Element,
  school: School
): AthleticEvent | null {
  const cells = $(row).find('td')
  if (cells.length < 5) return null

  const calendarRaw = cellText($(cells[0]))
  const eventRaw = cellText($(cells[1]))
  const dateTimeRaw = cellText($(cells[2]))
  const location = cellText($(cells[3]))
  const detailHref = $(cells[4]).find('a').first().attr('href') ?? ''

  if (!calendarRaw || !eventRaw || !dateTimeRaw) return null

  const { sport, gender, levels } = parseCalendarName(calendarRaw)
  const { eventName, homeAway, subtype } = parseEventName(eventRaw)
  const { startTime, timezone } = parseDateTime(dateTimeRaw)
  const category = categorizeEvent(calendarRaw)

  if (!startTime) return null // couldn't parse date/time; drop the row

  // Extract event UUID from detail URL: /Event/{uuid}
  const uuidMatch = detailHref.match(/\/Event\/([a-z0-9-]+)/i)
  const config = SCHOOL_CONFIGS.find((c) => c.code === school)!

  const id = uuidMatch
    ? uuidMatch[1]
    : `${school}-${startTime}-${sport}-${eventName}`.replace(/\s+/g, '-')

  const detailUrl = detailHref.startsWith('http')
    ? detailHref
    : new URL(detailHref, config.baseUrl).href

  return {
    id,
    school,
    category,
    sport,
    gender,
    levels,
    calendarRaw,
    eventName,
    eventRaw,
    homeAway,
    subtype,
    startTime,
    timezone,
    location,
    detailUrl,
  }
}

// ─── Page parse ────────────────────────────────────────────────────────────

/**
 * Parse an entire Events HTML page.
 * Returns the row events plus whether a next page exists.
 */
function parseEventsPage(
  html: string,
  school: School
): { events: AthleticEvent[]; hasNextPage: boolean } {
  const $ = cheerio.load(html)

  // Find the events table: it has header row containing "Calendar" and "Event".
  let eventsTable: cheerio.Element | null = null
  $('table').each((_, table) => {
    const headerText = $(table).find('thead, th').first().parent().text().toLowerCase()
    const fullHeaderText = $(table).find('th').map((_, th) => $(th).text().toLowerCase()).get().join(' ')
    if (fullHeaderText.includes('calendar') && fullHeaderText.includes('event')) {
      eventsTable = table
      return false // break each()
    }
  })

  if (!eventsTable) {
    return { events: [], hasNextPage: false }
  }

  const rows = $(eventsTable).find('tbody tr').toArray()
  const events: AthleticEvent[] = []

  for (const row of rows) {
    try {
      const evt = parseEventRow($, row, school)
      if (evt) events.push(evt)
    } catch (err) {
      // Swallow individual row failures — don't let one bad row kill a page.
      console.error(`[zcs-sports] Row parse failed for ${school}:`, err)
    }
  }

  // Look for a "Next »" link anywhere on the page
  let hasNextPage = false
  $('a').each((_, link) => {
    const linkText = $(link).text().trim().toLowerCase()
    if (linkText === 'next »' || linkText === 'next>' || linkText === 'next >') {
      hasNextPage = true
      return false
    }
  })

  return { events, hasNextPage }
}

// ─── Per-school scrape ─────────────────────────────────────────────────────

/**
 * Scrape all events for one school by walking paginated Events pages.
 * Stops when a page has no next-link or when we hit the safety cap.
 * If a single page fails, logs and returns what was collected so far.
 *
 * Events are deduplicated by ID before returning — Eventlink's pagination
 * occasionally returns the same event on two consecutive pages.
 */
export async function scrapeSchool(school: School): Promise<AthleticEvent[]> {
  const config = SCHOOL_CONFIGS.find((c) => c.code === school)
  if (!config) throw new Error(`Unknown school code: ${school}`)

  const all: AthleticEvent[] = []
  let pageNum = 1

  while (pageNum <= MAX_PAGES_PER_SCHOOL) {
    const url =
      pageNum === 1
        ? `${config.baseUrl}/Events`
        : `${config.baseUrl}/Events?pageNumber=${pageNum}`

    let html: string
    try {
      html = await fetchEventsPage(url)
    } catch (err) {
      console.error(`[zcs-sports] Fetch failed for ${school} page ${pageNum}:`, err)
      break
    }

    const { events, hasNextPage } = parseEventsPage(html, school)
    all.push(...events)

    if (!hasNextPage || events.length === 0) break
    pageNum++
  }

  // Deduplicate by event ID. Eventlink pagination sometimes repeats events
  // across page boundaries; without this, React will throw duplicate-key errors.
  const seen = new Set<string>()
  const deduped: AthleticEvent[] = []
  for (const event of all) {
    if (seen.has(event.id)) continue
    seen.add(event.id)
    deduped.push(event)
  }
  return deduped
}

// ─── All-school scrape ─────────────────────────────────────────────────────

export interface ScrapeResult {
  events: AthleticEvent[]
  errors: { school: School; message: string }[]
  fetchedAt: string
}

/**
 * Scrape all 3 schools in parallel.
 * A failure at one school doesn't affect the others — errors are collected
 * and returned alongside the successful results.
 */
export async function scrapeAllSchools(): Promise<ScrapeResult> {
  const results = await Promise.allSettled(
    SCHOOL_CONFIGS.map((c) => scrapeSchool(c.code))
  )

  const events: AthleticEvent[] = []
  const errors: { school: School; message: string }[] = []

  results.forEach((result, i) => {
    const school = SCHOOL_CONFIGS[i].code
    if (result.status === 'fulfilled') {
      events.push(...result.value)
    } else {
      const message =
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      errors.push({ school, message })
      console.error(`[zcs-sports] Scrape failed for ${school}:`, message)
    }
  })

  return { events, errors, fetchedAt: new Date().toISOString() }
}
