/**
 * ZCS Sports Calendar — text parsers
 *
 * Pure functions that transform Eventlink strings into structured data.
 * No HTTP or DOM access; safe to test in isolation.
 */

import type {
  EventLevel,
  EventSubtype,
  Gender,
  HomeAway,
  SportCategory,
} from './types'
import {
  ADMIN_CALENDARS,
  ATHLETIC_SPORT_ROOTS,
  PERFORMANCE_CALENDARS,
} from './types'

// ─── Calendar name parser ──────────────────────────────────────────────────

/**
 * Parse a calendar name like:
 *   "Football (Boys V)"
 *   "Basketball (Girls MS)"
 *   "Track & Field (Co-Ed MS)"
 *   "Cross Country (Boys V & JV)"
 *   "Baseball 7th" (no parens variant, seen in ZMS)
 *   "Boys Basketball (7th Grade)" (ZWMS pattern)
 *   "Football (7th Grade)" (ZWMS pattern — no gender because MS football is boys-only)
 *
 * Returns:
 *   sport   — root sport ("Football", "Basketball", ...)
 *   gender  — Boys / Girls / Coed / unknown (with inference for single-gender sports)
 *   levels  — array of levels (V, JV, MS, 7th, ...) — one calendar can span multiple
 */
export function parseCalendarName(calendarName: string): {
  sport: string
  gender: Gender
  levels: EventLevel[]
} {
  const trimmed = calendarName.trim()

  // Pattern A: "SportName (details)"
  const parenMatch = trimmed.match(/^(.+?)\s*\((.+)\)\s*$/)
  if (parenMatch) {
    const rawSport = parenMatch[1]
    const details = parenMatch[2]
    const sport = extractSportRoot(rawSport)
    // Check details first, but fall back to rawSport if details returned "unknown".
    // (Can't use `||` since "unknown" is truthy — the fallback never runs.)
    let parsedGender = extractGender(details)
    if (parsedGender === 'unknown') parsedGender = extractGender(rawSport)
    return {
      sport,
      gender: inferGenderFromSport(sport, parsedGender),
      levels: extractLevels(details, rawSport),
    }
  }

  // Pattern B: "Baseball 7th" style (no parens, level in name)
  const bareMatch = trimmed.match(/^(.+?)\s+(7th|8th|MS|V|JV|Fr|C)$/i)
  if (bareMatch) {
    const sport = extractSportRoot(bareMatch[1])
    const parsedGender = extractGender(bareMatch[1])
    return {
      sport,
      gender: inferGenderFromSport(sport, parsedGender),
      levels: extractLevels(bareMatch[2], ''),
    }
  }

  // Pattern C: just the sport, no level or gender info
  const sport = extractSportRoot(trimmed)
  const parsedGender = extractGender(trimmed)
  return {
    sport,
    gender: inferGenderFromSport(sport, parsedGender),
    levels: ['unknown'],
  }
}

/**
 * Sports that are conventionally single-gender at the ZCS middle school level.
 * If the calendar name doesn't specify gender, fall back to these defaults.
 * (High school calendars always specify gender explicitly, so this is a no-op there.)
 */
const SINGLE_GENDER_SPORTS: Array<{ sport: string; gender: Gender }> = [
  { sport: 'Football', gender: 'Boys' },
  { sport: 'Wrestling', gender: 'Boys' },
  { sport: 'Baseball', gender: 'Boys' },
  { sport: 'Softball', gender: 'Girls' },
  { sport: 'Cheerleading', gender: 'Girls' },
  { sport: 'Cheer', gender: 'Girls' },
]

/**
 * If we couldn't extract a gender from the calendar name AND the sport is
 * conventionally single-gender at MS level, return the conventional gender.
 * Otherwise return the gender we already had (including "unknown").
 *
 * Unified sports (Unified Flag Football, Unified Track, etc.) are inherently
 * mixed-ability and can be co-ed at any grade — we don't guess for them.
 */
function inferGenderFromSport(sport: string, current: Gender): Gender {
  if (current !== 'unknown') return current
  if (/unified/i.test(sport)) return 'unknown'
  const match = SINGLE_GENDER_SPORTS.find((entry) =>
    sport.toLowerCase().includes(entry.sport.toLowerCase())
  )
  return match ? match.gender : 'unknown'
}

/** "Boys Basketball" → "Basketball"; "Track and Field" → "Track & Field" */
function extractSportRoot(text: string): string {
  let s = text.trim()
  // Normalize "and" → "&" for consistency
  s = s.replace(/\s+and\s+/gi, ' & ')
  // Strip leading "Boys " / "Girls " / "Co-ed "
  s = s.replace(/^(Boys|Girls|Co-?ed)\s+/i, '')
  // Strip trailing grade markers if any snuck in
  s = s.replace(/\s+(7th|8th|MS)$/i, '')
  return s.trim()
}

function extractGender(text: string): Gender {
  const lower = text.toLowerCase()
  if (/\bco-?ed\b/.test(lower)) return 'Coed'
  if (/\bboys\b/.test(lower)) return 'Boys'
  if (/\bgirls\b/.test(lower)) return 'Girls'
  return 'unknown'
}

function extractLevels(details: string, fallback: string): EventLevel[] {
  const levels: EventLevel[] = []
  const combined = `${details} ${fallback}`.toLowerCase()

  // Grade-specific (middle school)
  if (/\b7th(?:\s*grade)?\b/.test(combined)) levels.push('7th')
  if (/\b8th(?:\s*grade)?\b/.test(combined)) levels.push('8th')

  // MS combined (only if no grade already picked up)
  if (levels.length === 0 && /\bms\b/.test(combined)) levels.push('MS')

  // High school levels
  if (/\b(?:v|varsity)\b/.test(combined)) levels.push('V')
  if (/\bjv\b/.test(combined)) levels.push('JV')
  if (/\b(?:fr|freshman)\b/.test(combined)) levels.push('Fr')
  // C-team: match "C-team" verbatim OR "Boys/Girls C" (as seen in "Volleyball (Boys C)")
  if (/\bc[- ]?team\b/.test(combined) || /\b(?:boys|girls)\s+c\b/i.test(combined)) {
    levels.push('C')
  }

  return levels.length ? levels : ['unknown']
}

// ─── Event name / opponent parser ──────────────────────────────────────────

/**
 * Parse an event name field like:
 *   "Bloomington High School North (H)"
 *   "Carmel (A)\nScrimmage"
 *   "Harrison Invitational (A)\nInvitational"
 *   "Intersquad Scrimmage (H)"          — subtype word inline in name
 *   "State Fall Preview" (neutral, no marker)
 *   "Canceled:\nNew Augusta PA-North (A)" — canceled marker on line 1, event on line 2
 *
 * Returns cleaned name, home/away marker, and optional subtype.
 * Subtype detection: line 2 wins if it names a subtype; otherwise check line 1.
 */
export function parseEventName(eventRaw: string): {
  eventName: string
  homeAway: HomeAway
  subtype: EventSubtype
} {
  const lines = eventRaw
    .split(/\r?\n+/)
    .map((s) => s.trim())
    .filter(Boolean)

  let primary = lines[0] ?? ''
  let subtypeLine = lines[1] ?? null
  let canceledPrefix = ''

  // Canceled edge case: line 1 is just "Canceled:" and the real event
  // (with its H/A marker) lives on line 2. Shift lines and prefix the name.
  if (/^cancell?ed:?$/i.test(primary) && lines[1]) {
    canceledPrefix = 'Canceled: '
    primary = lines[1]
    subtypeLine = lines[2] ?? null
  }

  // Look for trailing (H) / (A) / (N) marker
  const markerMatch = primary.match(/\(([HAN])\)\s*$/i)
  const homeAway: HomeAway = markerMatch
    ? (markerMatch[1].toUpperCase() as HomeAway)
    : 'N'

  const cleanedPrimary = primary.replace(/\s*\([HAN]\)\s*$/i, '').trim()
  const eventName = canceledPrefix + cleanedPrimary

  // Subtype: try line 2 first, fall back to inline detection in line 1.
  // Line 1 fallback catches events like "Intersquad Scrimmage (H)" where
  // the type word is baked into the event name rather than on its own line.
  let subtype = parseSubtype(subtypeLine)
  if (!subtype) subtype = parseSubtype(cleanedPrimary)

  return { eventName, homeAway, subtype }
}

function parseSubtype(text: string | null): EventSubtype {
  if (!text) return null
  const lower = text.toLowerCase()
  if (lower.includes('scrimmage')) return 'Scrimmage'
  if (lower.includes('invitational')) return 'Invitational'
  if (lower.includes('tournament')) return 'Tournament'
  if (lower.includes('double header') || lower.includes('doubleheader')) return 'Double Header'
  return null
}

// ─── Date / time parser ────────────────────────────────────────────────────

/**
 * Parse a date/time field like:
 *   "Wed, Aug. 12 2026\n4:30 PM EDT"
 *   "Fri, Sep. 5 2026 7:00 PM EDT"
 *
 * Returns an ISO UTC timestamp and the source timezone abbreviation.
 * If parsing fails, returns empty strings — caller should log and skip.
 */
export function parseDateTime(dateTimeRaw: string): {
  startTime: string
  timezone: string
} {
  const combined = dateTimeRaw.replace(/\s+/g, ' ').trim()

  // Full match: "[Weekday,] MonthName[.] Day Year Hour:Minute AM/PM TZ"
  const match = combined.match(
    /(?:\w+,?\s+)?(\w+)\.?\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)\s+(EST|EDT|CST|CDT|MST|MDT|PST|PDT)/i
  )

  if (!match) return { startTime: '', timezone: '' }

  const [, monthName, dayStr, yearStr, hourStr, minStr, ampm, tzRaw] = match

  const month = monthNameToNumber(monthName)
  const day = parseInt(dayStr, 10)
  const year = parseInt(yearStr, 10)
  const min = parseInt(minStr, 10)
  const tz = tzRaw.toUpperCase()

  let hour = parseInt(hourStr, 10)
  if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12
  if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0

  // Convert the local (Eastern) time to UTC by adding the offset.
  const tzOffsetHours = getTimezoneOffset(tz)
  const utcMs = Date.UTC(year, month - 1, day, hour + tzOffsetHours, min)

  return {
    startTime: new Date(utcMs).toISOString(),
    timezone: tz,
  }
}

function monthNameToNumber(month: string): number {
  const months: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  }
  return months[month.slice(0, 3).toLowerCase()] ?? 1
}

/** Hours to add to local wall time to get UTC. */
function getTimezoneOffset(tz: string): number {
  const offsets: Record<string, number> = {
    EST: 5, EDT: 4,
    CST: 6, CDT: 5,
    MST: 7, MDT: 6,
    PST: 8, PDT: 7,
  }
  return offsets[tz.toUpperCase()] ?? 5
}

// ─── Event category classifier ─────────────────────────────────────────────

/**
 * Classify a calendar into one of four buckets:
 *   athletic     — a sport calendar (matched against ATHLETIC_SPORT_ROOTS)
 *   performance  — public music / drama / performing arts
 *   admin        — anything private, meta, or internal
 *   other        — didn't match any pattern (log & investigate)
 *
 * Precedence: admin > performance > athletic > other.
 * (Admin list wins even if the string mentions a sport.)
 */
export function categorizeEvent(calendarName: string): SportCategory {
  const name = calendarName.trim()

  if (ADMIN_CALENDARS.includes(name)) return 'admin'
  if (PERFORMANCE_CALENDARS.includes(name)) return 'performance'

  const lower = name.toLowerCase()
  const isAthletic = ATHLETIC_SPORT_ROOTS.some((sport) =>
    lower.includes(sport.toLowerCase())
  )
  if (isAthletic) return 'athletic'

  return 'other'
}
