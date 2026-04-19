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
  'diabetes awareness day': 'https://www.zionsvillelions.com/',
}

export async function getUpcomingEvents(maxResults = 20): Promise<CalendarEvent[]> {
  const now = new Date().toISOString()
  // 6 months out
  const max = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString()

  // Fetch more than needed to account for deduplication of recurring events
  const fetchLimit = Math.min(maxResults * 4, 100)

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: now,
    timeMax: max,
    maxResults: String(fetchLimit),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  const res = await fetch(
    `${BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events?${params}`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) {
    console.error('Google Calendar API error:', res.status, await res.text())
    return []
  }

  const data = await res.json()

  const mapped: CalendarEvent[] = (data.items ?? []).map((item: any): CalendarEvent => {
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
      officialUrl: OFFICIAL_URLS[item.summary?.trim().toLowerCase() ?? ''] ?? undefined,
    }
  })

  // Deduplicate recurring events by title — keep first occurrence,
  // track last occurrence date and total count
  const seen = new Map<string, CalendarEvent>()
  const counts = new Map<string, number>()
  const lastDates = new Map<string, string>()

  for (const event of mapped) {
    const key = event.title.trim().toLowerCase()
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
    const key = event.title.trim().toLowerCase()
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
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    ...(event.description && { description: event.description }),
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Zionsville',
          addressRegion: 'IN',
          postalCode: '46077',
          addressCountry: 'US',
        },
      },
    }),
    url: event.htmlLink,
    organizer: {
      '@type': 'Organization',
      name: 'ZionsvilleIndiana.com',
      url: 'https://zionsvilleindiana.com',
    },
  }
}
