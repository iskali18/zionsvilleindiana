/**
 * ZCS Sports Calendar — public API
 *
 * Import from this module rather than the internal files.
 *
 * Usage in a server component:
 *   import { getAthleticEvents } from '@/lib/zcs-sports'
 *   const { events, errors, fetchedAt } = await getAthleticEvents()
 */

import { scrapeAllSchools, type ScrapeResult } from './scraper'
import type { AthleticEvent, School, SportCategory } from './types'

// Re-export public types and constants so consumers only need one import.
export type {
  AthleticEvent,
  EventLevel,
  EventSubtype,
  Gender,
  HomeAway,
  School,
  SchoolConfig,
  SportCategory,
} from './types'
export { SCHOOL_CONFIGS } from './types'

// ─── Sorted result ─────────────────────────────────────────────────────────

function sortedByStart(events: AthleticEvent[]): AthleticEvent[] {
  return [...events].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

// ─── Public queries ────────────────────────────────────────────────────────

/**
 * Get all athletic events across ZCHS, ZMS, ZWMS.
 * Filtered to `category === 'athletic'` and sorted by start time ascending.
 *
 * Cached at the fetch layer for 15 minutes.
 */
export async function getAthleticEvents(): Promise<ScrapeResult> {
  const result = await scrapeAllSchools()
  return {
    events: sortedByStart(result.events.filter((e) => e.category === 'athletic')),
    errors: result.errors,
    fetchedAt: result.fetchedAt,
  }
}

/**
 * Get all public performance events across ZCHS, ZMS, ZWMS.
 * Reserved for future Page B (Performances tool).
 */
export async function getPerformanceEvents(): Promise<ScrapeResult> {
  const result = await scrapeAllSchools()
  return {
    events: sortedByStart(
      result.events.filter((e) => e.category === 'performance')
    ),
    errors: result.errors,
    fetchedAt: result.fetchedAt,
  }
}

/**
 * Get all events regardless of category. Useful for debugging or if you
 * need to build a page that filters at the UI layer.
 */
export async function getAllEvents(): Promise<ScrapeResult> {
  const result = await scrapeAllSchools()
  return {
    events: sortedByStart(result.events),
    errors: result.errors,
    fetchedAt: result.fetchedAt,
  }
}

// ─── Derived utility: distinct filter options ──────────────────────────────

/**
 * From a list of events, return the distinct sport names sorted alphabetically.
 * Useful for populating the sport filter dropdown.
 */
export function getSportOptions(events: AthleticEvent[]): string[] {
  return Array.from(new Set(events.map((e) => e.sport))).sort()
}

/**
 * From a list of events, return the distinct level codes present.
 * Useful for populating the level filter dropdown per school.
 */
export function getLevelOptions(
  events: AthleticEvent[]
): Array<AthleticEvent['levels'][number]> {
  const levels = new Set<AthleticEvent['levels'][number]>()
  for (const evt of events) {
    for (const lv of evt.levels) levels.add(lv)
  }
  return Array.from(levels).sort()
}

/**
 * From a list of events, return the count that would match a set of filters.
 * Used to compute the "N events match your filters" label.
 */
export function filterEvents(
  events: AthleticEvent[],
  filters: {
    schools?: School[]
    sports?: string[]
    levels?: AthleticEvent['levels'][number][]
    genders?: AthleticEvent['gender'][]
    homeAway?: AthleticEvent['homeAway'][]
    startDate?: string // ISO
    endDate?: string // ISO
    includeScrimmages?: boolean // default: true
  }
): AthleticEvent[] {
  const includeScrimmages = filters.includeScrimmages ?? true

  return events.filter((evt) => {
    if (filters.schools?.length && !filters.schools.includes(evt.school)) return false
    if (filters.sports?.length && !filters.sports.includes(evt.sport)) return false
    if (filters.levels?.length && !evt.levels.some((l) => filters.levels!.includes(l)))
      return false
    if (filters.genders?.length && !filters.genders.includes(evt.gender))
      return false
    if (filters.homeAway?.length && !filters.homeAway.includes(evt.homeAway))
      return false
    if (!includeScrimmages && evt.subtype === 'Scrimmage') return false
    if (filters.startDate && evt.startTime < filters.startDate) return false
    if (filters.endDate && evt.startTime > filters.endDate) return false
    return true
  })
}
