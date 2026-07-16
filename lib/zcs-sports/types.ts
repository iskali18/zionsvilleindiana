/**
 * ZCS Sports Calendar — data model and constants
 *
 * These types describe events scraped from the three Zionsville schools'
 * Eventlink pages (ZCHS, ZMS, ZWMS).
 */

// ─── Enums / string unions ─────────────────────────────────────────────────

export type School = 'ZCHS' | 'ZMS' | 'ZWMS'

export type SportCategory = 'athletic' | 'performance' | 'admin' | 'other'

export type EventLevel =
  | 'V' // Varsity
  | 'JV' // Junior Varsity
  | 'Fr' // Freshman
  | 'C' // C-team
  | 'MS' // Middle school (combined)
  | '7th'
  | '8th'
  | 'unknown'

export type Gender = 'Boys' | 'Girls' | 'Coed' | 'unknown'

export type EventSubtype = 'Scrimmage' | 'Invitational' | 'Tournament' | null

/** Home / Away / Neutral site */
export type HomeAway = 'H' | 'A' | 'N'

// ─── Main event shape ──────────────────────────────────────────────────────

export interface AthleticEvent {
  /** Stable ID — Eventlink event UUID from the detail URL */
  id: string
  school: School
  category: SportCategory
  /** Sport root ("Football", "Basketball", "Track & Field") */
  sport: string
  gender: Gender
  /** One event can span multiple levels (e.g. "Cross Country V & JV") */
  levels: EventLevel[]
  /** Original calendar name from Eventlink, unmodified */
  calendarRaw: string
  /** Cleaned event name / opponent (H/A marker stripped) */
  eventName: string
  /** Original event text from the page (may include subtype on line 2) */
  eventRaw: string
  homeAway: HomeAway
  subtype: EventSubtype
  /** ISO 8601 UTC timestamp */
  startTime: string
  /** Timezone abbreviation from the source ("EDT", "EST") */
  timezone: string
  location: string
  /** Full URL to Eventlink event detail page (for tickets) */
  detailUrl: string
}

// ─── School configs ────────────────────────────────────────────────────────

export interface SchoolConfig {
  code: School
  displayName: string
  baseUrl: string
}

export const SCHOOL_CONFIGS: SchoolConfig[] = [
  {
    code: 'ZCHS',
    displayName: 'Zionsville High School',
    baseUrl: 'https://sites.eventlink.com/s/zionsville-high-school',
  },
  {
    code: 'ZMS',
    displayName: 'Zionsville Middle School',
    baseUrl: 'https://websites.eventlink.com/s/zionsville-middle-school',
  },
  {
    code: 'ZWMS',
    displayName: 'Zionsville West Middle School',
    baseUrl: 'https://websites.eventlink.com/s/zionsville-west-middle-school',
  },
]

// ─── Calendar-name classification ──────────────────────────────────────────

/**
 * Calendar names known to be public performances.
 * Used for future Page B (Performances Calendar tool).
 */
export const PERFORMANCE_CALENDARS: string[] = [
  'Music Events',
  'Marching Band',
  'Winter Guard',
  'Indoor Percussion',
  'Performing Arts',
  'MS Media & Performing Arts',
]

/**
 * Calendar names to always exclude — admin, meta, private, or unmapped.
 * Anything in here is tagged `admin` and won't appear on either page.
 */
export const ADMIN_CALENDARS: string[] = [
  'Administration',
  'Custodian Coverage',
  'Staff Meeting',
  'Testing',
  'Facility Events',
  'Rental/Outside Groups',
  'Rentals/Outside Groups',
  'Conferences',
  'Field Trips & Curricular Enrichment',
  'Field Trips',
  'PAC Rental',
  'Parent Organizations',
  'PTO',
  'Guidance',
  'InWell',
  'Athletics Meeting',
  'Club / IA',
  'Clubs',
  'MS Science',
  'Miscellaneous',
  'Awards',
  'Special Events',
  // Generic meta-calendars (catch-alls per school)
  'Athletics',
  'Zionsville Community High School',
  'Zionsville HS Eagle Rec',
  'Eagle Rec',
  'Zionsville Middle School',
  'ZMS Eagle Rec',
  'ZWMS Eagle Rec',
  'ZWMS ERE',
  'Zionsville West Middle School',
  // Anomalies observed in the wild
  'mine',
]

/**
 * Sport root names that identify a calendar as athletic when the calendar
 * name contains one of these words. Used only when the calendar is not
 * already classified by ADMIN_CALENDARS or PERFORMANCE_CALENDARS.
 */
export const ATHLETIC_SPORT_ROOTS: string[] = [
  'Football',
  'Basketball',
  'Baseball',
  'Softball',
  'Soccer',
  'Volleyball',
  'Wrestling',
  'Track',
  'Cross Country',
  'Golf',
  'Tennis',
  'Swimming',
  'Diving',
  'Lacrosse',
  'Cheer',
  'Cheerleading',
  'Unified',
]
