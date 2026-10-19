export interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  startDate: string
  endDate?: string
  startTime?: string
  endTime?: string
  isAllDay: boolean
  htmlLink: string
  officialUrl?: string
  /** Set when multiple calendar instances are grouped into one */
  occurrenceCount?: number
  /** ISO date of the last occurrence when grouped */
  lastOccurrenceDate?: string
}

const API_KEY = process.env.GOOGLE_CALENDAR_API_KEY!
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!
const BASE = 'https://www.googleapis.com/calendar/v3'

const OFFICIAL_URLS: Record<string, string> = {
  'stories in the park': 'https://www.zionsvillelions.com/',
  'pizza party friday at mulberry fields': 'https://www.facebook.com/events/1655763592306236',
  'park and play at mulberry fields': 'https://www.facebook.com/events/1525297579066058',
  'wild and wacky water day at fire station 93': 'https://www.facebook.com/events/2222870561902849',
  'indy british motor day': 'https://www.townplanner.com/event/870949/',
  'family fun day for diabetes awareness': 'https://www.zionsvillelions.com/',
  'eagle church trunk or treat': 'https://www.eaglechurch.com/event/24457369-2026-10-24-trunk-or-treat-2026/',
  'zionsville presbyterian church trunk or treat':'https://www.zpc.org/event/24474648-2026-10-25-trunk-or-treat-2026/',
  'nightmare at elm street: a luminary walk':'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30147',
  'mr daniel & friends campfire concert': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30143',
  'night hike at carpenter nature preserve': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=29844',
  'fall birding at starkey park': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30141',
  'fall birding at carpenter nature preserve': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30141',
  'owl prowl at carpenter nature preserve': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30009',
  'fall campfire at carpenter nature preserve': 'https://zionsvillein.myrec.com/info/activities/program_details.aspx?ProgramID=30150',
  'zchs fall musical': 'https://zionsvillepac.ludus.com/index.php?sections=events',
}

/** Calendar titles are typed by hand, so an apostrophe may arrive curly or
 *  straight depending on where it was typed. The lookup below is an exact
 *  string match, so both spellings are folded to one here. Keys in
 *  OFFICIAL_URLS use a straight apostrophe. */
function titleKey(summary?: string): string {
  return (summary ?? '').trim().toLowerCase().replace(/[\u2018\u2019]/g, "'")
}

/** Fetches calendar entries between two ISO timestamps, one entry per
 *  occurrence (recurring events are expanded). Returns an empty list when the
 *  calendar can't be reached, so pages still render. */
async function fetchCalendarEvents(
  timeMin: string,
  timeMax: string,
  maxResults: number
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    key: API_KEY,
    timeMin,
    timeMax,
    maxResults: String(maxResults),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  // A network failure (no connection, DNS, proxy) makes fetch throw rather
  // than return a response, so it needs catching separately from an error
  // status. Both cases degrade to an empty list so the page still renders.
  let res: Response
  try {
    res = await fetch(
      `${BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`,
      { next: { revalidate: 3600 } }
    )
  } catch (err) {
    console.error('Google Calendar fetch failed:', err)
    return []
  }

  if (!res.ok) {
    console.error('Google Calendar API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()

  return (data.items ?? []).map((item: any): CalendarEvent => {
    const isAllDay = Boolean(item.start?.date)
    return {
      id: item.id,
      title: item.summary ?? 'Untitled Event',
      description: item.description ?? undefined,
      location: item.location ?? undefined,
      startDate: isAllDay ? item.start.date : item.start.dateTime,
      endDate: isAllDay ? item.end?.date : item.end?.dateTime,
      startTime: isAllDay
        ? undefined
        : new Date(item.start.dateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/Indiana/Indianapolis',
          }),
      endTime: isAllDay
        ? undefined
        : item.end?.dateTime
        ? new Date(item.end.dateTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/Indiana/Indianapolis',
          })
        : undefined,
      isAllDay,
      htmlLink: item.htmlLink ?? '#',
      officialUrl: OFFICIAL_URLS[titleKey(item.summary)] ?? undefined,
    }
  })
}

/** Every calendar entry between two ISO timestamps, with recurring events
 *  listed once per date (not grouped). Used by /events/this-weekend. */
export async function getCalendarEventsBetween(
  timeMin: string,
  timeMax: string
): Promise<CalendarEvent[]> {
  return fetchCalendarEvents(timeMin, timeMax, 250)
}

export async function getUpcomingEvents(maxResults = 20): Promise<CalendarEvent[]> {
  const now = new Date().toISOString()
  // 1 year out — needs to extend past late-year events like Christmas in the Village
  const max = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString()

  // Fetch generously to account for deduplication of recurring events
  // (weekly events like Farmers Market expand to ~20 instances over a year)
  const fetchLimit = Math.min(maxResults * 10, 250)

  const mapped = await fetchCalendarEvents(now, max, fetchLimit)

  // Deduplicate recurring events by title — keep first occurrence,
  // track last occurrence date and total count
  const seen = new Map<string, CalendarEvent>()
  const counts = new Map<string, number>()
  const lastDates = new Map<string, string>()

  for (const event of mapped) {
    const key = titleKey(event.title)
    if (!seen.has(key)) {
      seen.set(key, event)
      counts.set(key, 1)
      lastDates.set(key, event.startDate)
    } else {
      counts.set(key, (counts.get(key) ?? 1) + 1)
      lastDates.set(key, event.startDate)
    }
  }

  const deduped = Array.from(seen.values()).map((event) => {
    const key = titleKey(event.title)
    const count = counts.get(key) ?? 1
    const lastDate = lastDates.get(key)
    return {
      ...event,
      occurrenceCount: count > 1 ? count : undefined,
      lastOccurrenceDate: count > 1 ? lastDate : undefined,
    }
  })

  return deduped.slice(0, maxResults)
}

/** The date a calendar entry falls on in Indiana, as YYYY-MM-DD. An all-day
 *  entry's plain date is already that; a timestamp is converted to Indiana
 *  time, so an 11:30 PM event stays on its own day. */
export function indianaDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Indiana/Indianapolis',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(value))
  const part = (type: string) => parts.find((p) => p.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

// Match a Google Calendar event title to an internal event slug.
// Uses tokenized matching: punctuation-tolerant, stop-word-free,
// and bidirectional so it works whether the calendar title is shorter
// or longer than the slug.
const STOP_WORDS = new Set(['at', 'the', 'in', 'of', 'a', 'an', 'and', 'on', 'for', 'to'])

function tokenize(input: string): Set<string> {
  return new Set(
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w && !STOP_WORDS.has(w))
  )
}

export function matchEventToSlug(eventTitle: string, slugs: string[]): string | undefined {
  const titleWords = tokenize(eventTitle)
  if (titleWords.size === 0) return undefined

  return slugs.find((slug) => {
    const slugWords = tokenize(slug.replace(/-/g, ' '))
    if (slugWords.size === 0) return false
    const slugInTitle = [...slugWords].every((w) => titleWords.has(w))
    const titleInSlug = [...titleWords].every((w) => slugWords.has(w))
    return slugInTitle || titleInSlug
  })
}

export function formatEventDate(isoDate: string, isAllDay: boolean): string {
  const date = new Date(isAllDay ? isoDate + 'T00:00:00' : isoDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'America/Indiana/Indianapolis',
  })
}

export function buildEventSchema(event: CalendarEvent) {
  // Google requires `location` on an Event, so one without it is invalid
  // rather than merely incomplete. Emit nothing and log, so a missing calendar
  // field turns up in the build output instead of in Search Console weeks on.
  if (!event.location) {
    console.warn(`Calendar event has no location, skipping schema: ${event.title}`)
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    ...(event.description && { description: event.description }),
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        // Google accepts a whole address on one line, and the calendar gives
        // one free-text string. Parsing it out into locality, region and
        // postcode would mean guessing, and the previous hardcoded Zionsville
        // values were wrong for any event in Lebanon or Indianapolis.
        '@type': 'PostalAddress',
        name: event.location,
      },
    },
    url: event.htmlLink,
    organizer: {
      '@type': 'Organization',
      name: 'Zionsville Indiana',
      url: 'https://zionsvilleindiana.com',
    },
  }
}
