// Zionsville Community High School (ZCHS) 2026-2027 Green/Silver block schedule
// Update annually when ZCHS releases the next school year's calendar.

// ─── Types ──────────────────────────────────────────────────────────────────

export type LunchOption = 'A' | 'B' | 'C'
export type DayColor = 'G' | 'S'
export type BellScheduleType = 'regular' | 'wednesday'

export interface CourseSlot {
  name: string
  teacher?: string
  room?: string
  /** Only set on period 3 slots */
  lunch?: LunchOption
}

export interface SemesterSchedule {
  G: {
    p1: CourseSlot
    p2: CourseSlot
    p3: CourseSlot
    p4: CourseSlot
  }
  S: {
    p1: CourseSlot
    p2: CourseSlot
    p3: CourseSlot
    p4: CourseSlot
  }
}

export interface StudentCourses {
  studentName: string
  semester1: SemesterSchedule
  semester2: SemesterSchedule
}

export interface ScheduleRow {
  time: string
  period: string
  name: string
  teacher?: string
  room?: string
  isLunch?: boolean
}

export interface DaySchedule {
  dateKey: string
  weekday: string
  dateLabel: string
  /** True if the day is blocked and no class schedule is shown */
  isBlocked: boolean
  /** Non-class dates: label to display instead of a table */
  blockedLabel?: string
  /** When isBlocked, whether the header should show "No school" (false for testing days) */
  hasSpecialSchedule?: boolean
  /** Non-blocking notes (e.g. "Mid-Semester") — shown even if the schedule renders */
  note?: string
  /** Only present when isBlocked === false */
  semester?: 'Semester 1' | 'Semester 2'
  dayColor?: DayColor
  bellType?: BellScheduleType
  rows?: ScheduleRow[]
}

// ─── School year configuration ──────────────────────────────────────────────

const SEMESTER_1_START = '2026-08-04'
const SEMESTER_1_END = '2026-12-18'
const SEMESTER_2_START = '2027-01-05'
const SEMESTER_2_END = '2027-05-26'

/** Semester bounds re-exported for preset date logic */
export const SEMESTERS = {
  s1Start: SEMESTER_1_START,
  s1End: SEMESTER_1_END,
  s2Start: SEMESTER_2_START,
  s2End: SEMESTER_2_END,
} as const

/** Full range the tool will accept (semester 1 start through end of make-up window) */
export const SCHOOL_YEAR_START = '2026-08-04'
export const SCHOOL_YEAR_END = '2027-06-03'

/**
 * Special dates for the 2026-2027 school year.
 * - `blocksClasses: true` → no class schedule is shown; the label displays instead
 * - `blocksClasses: false` → schedule renders normally, but the label shows as a note
 * - `hasSpecialSchedule: true` → header shows blank status instead of "No school"
 *   (used for testing days like PSAT/SAT where students are still at school)
 */
interface SpecialDate {
  dateKey: string
  label: string
  blocksClasses: boolean
  hasSpecialSchedule?: boolean
}

const SPECIAL_DATES: SpecialDate[] = [
  // Semester 1
  { dateKey: '2026-09-07', label: 'Labor Day — No School', blocksClasses: true },
  { dateKey: '2026-10-06', label: 'PSAT (Grades 9–11), PM Release; Grade 12 E-Day', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2026-10-08', label: 'Mid-Semester', blocksClasses: false },
  { dateKey: '2026-10-12', label: 'Fall Break — No School', blocksClasses: true },
  { dateKey: '2026-10-13', label: 'Fall Break — No School', blocksClasses: true },
  { dateKey: '2026-10-14', label: 'Fall Break — No School', blocksClasses: true },
  { dateKey: '2026-10-15', label: 'Fall Break — No School', blocksClasses: true },
  { dateKey: '2026-10-16', label: 'Fall Break — No School', blocksClasses: true },
  { dateKey: '2026-11-25', label: 'Thanksgiving Break — No School', blocksClasses: true },
  { dateKey: '2026-11-26', label: 'Thanksgiving Break — No School', blocksClasses: true },
  { dateKey: '2026-11-27', label: 'Thanksgiving Break — No School', blocksClasses: true },

  // Semester 1 finals (Dec 15–18, weekdays)
  { dateKey: '2026-12-15', label: 'Semester 1 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2026-12-16', label: 'Semester 1 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2026-12-17', label: 'Semester 1 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2026-12-18', label: 'Semester 1 Finals · End of Semester 1', blocksClasses: true, hasSpecialSchedule: true },

  // Winter Break (Dec 21 – Jan 4, weekdays)
  { dateKey: '2026-12-21', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-22', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-23', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-24', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-25', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-28', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-29', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-30', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2026-12-31', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2027-01-01', label: 'Winter Break — No School', blocksClasses: true },
  { dateKey: '2027-01-04', label: 'Winter Break — No School', blocksClasses: true },

  // Semester 2
  { dateKey: '2027-01-18', label: 'Dr. MLK Holiday — No School', blocksClasses: true },
  { dateKey: '2027-02-15', label: 'February Break — No School', blocksClasses: true },
  { dateKey: '2027-02-16', label: 'February Break — No School', blocksClasses: true },
  { dateKey: '2027-02-17', label: 'February Break — No School', blocksClasses: true },
  { dateKey: '2027-02-18', label: 'February Break — No School', blocksClasses: true },
  { dateKey: '2027-02-19', label: 'February Break — No School', blocksClasses: true },
  { dateKey: '2027-03-04', label: 'SAT (Grade 11), PM Release; Grades 9, 10, 12 E-Day', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2027-03-16', label: 'Mid-Semester', blocksClasses: false },
  { dateKey: '2027-03-26', label: 'Spring Break — No School', blocksClasses: true },
  { dateKey: '2027-03-29', label: 'Spring Break — No School', blocksClasses: true },
  { dateKey: '2027-03-30', label: 'Spring Break — No School', blocksClasses: true },
  { dateKey: '2027-03-31', label: 'Spring Break — No School', blocksClasses: true },
  { dateKey: '2027-04-01', label: 'Spring Break — No School', blocksClasses: true },
  { dateKey: '2027-04-02', label: 'Spring Break — No School', blocksClasses: true },

  // Semester 2 finals (May 21, 24, 25, 26 — weekdays only)
  { dateKey: '2027-05-21', label: 'Semester 2 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2027-05-24', label: 'Semester 2 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2027-05-25', label: 'Semester 2 Finals', blocksClasses: true, hasSpecialSchedule: true },
  { dateKey: '2027-05-26', label: 'Last Day of School', blocksClasses: true, hasSpecialSchedule: true },

  // Post-semester
  { dateKey: '2027-05-31', label: 'Memorial Day — No School', blocksClasses: true },
  { dateKey: '2027-06-02', label: 'ZCHS Commencement', blocksClasses: true, hasSpecialSchedule: true },
]

const SPECIAL_DATE_MAP = new Map<string, SpecialDate>(
  SPECIAL_DATES.map((d) => [d.dateKey, d])
)

// ─── Date helpers (local, timezone-safe) ────────────────────────────────────

/** Parse a YYYY-MM-DD key into a local Date (no timezone offset issues). */
export function makeDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Format a Date back into YYYY-MM-DD in local time. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/** Returns the special date object if this date is flagged, else undefined. */
export function getSpecialDate(dateKey: string): SpecialDate | undefined {
  return SPECIAL_DATE_MAP.get(dateKey)
}

// ─── Green/Silver map ───────────────────────────────────────────────────────

/**
 * Build a map from date key → 'G' | 'S' for the whole school year.
 * Alternates only on regular instructional days. Skips weekends and any
 * special date that blocks classes. Semester 2 restarts on Green.
 */
export function buildGreenSilverMap(): Map<string, DayColor> {
  const map = new Map<string, DayColor>()

  const assignSemester = (startKey: string, endKey: string) => {
    let cursor = makeDate(startKey)
    const end = makeDate(endKey)
    let current: DayColor = 'G'

    while (cursor <= end) {
      const key = toDateKey(cursor)
      const special = getSpecialDate(key)
      const skip = isWeekend(cursor) || (special?.blocksClasses ?? false)

      if (!skip) {
        map.set(key, current)
        current = current === 'G' ? 'S' : 'G'
      }
      cursor = addDays(cursor, 1)
    }
  }

  assignSemester(SEMESTER_1_START, SEMESTER_1_END)
  assignSemester(SEMESTER_2_START, SEMESTER_2_END)

  return map
}

// ─── Semester + bell schedule detection ─────────────────────────────────────

export function getSemesterForDate(dateKey: string): 'Semester 1' | 'Semester 2' | null {
  const d = makeDate(dateKey)
  const s1Start = makeDate(SEMESTER_1_START)
  const s1End = makeDate(SEMESTER_1_END)
  const s2Start = makeDate(SEMESTER_2_START)
  const s2End = makeDate(SEMESTER_2_END)

  if (d >= s1Start && d <= s1End) return 'Semester 1'
  if (d >= s2Start && d <= s2End) return 'Semester 2'
  return null
}

export function getBellScheduleType(date: Date): BellScheduleType {
  return date.getDay() === 3 ? 'wednesday' : 'regular'
}

// ─── Period 3 expansion (lunch handling) ────────────────────────────────────

const REGULAR_TIMES = {
  p1: '8:30 AM – 10:00 AM',
  p2: '10:10 AM – 11:40 AM',
  p3Full: '11:50 AM – 2:00 PM',
  p4: '2:10 PM – 3:40 PM',
}

const WEDNESDAY_TIMES = {
  p1: '9:10 AM – 10:30 AM',
  p2: '10:40 AM – 12:00 PM',
  p3Full: '12:10 PM – 2:10 PM',
  p4: '2:20 PM – 3:40 PM',
}

/** Short-format period times for compact grid rendering. */
export const PERIOD_TIMES_SHORT = {
  regular: {
    p1: '8:30–10:00',
    p2: '10:10–11:40',
    p3: '11:50–2:00',
    p4: '2:10–3:40',
  },
  wednesday: {
    p1: '9:10–10:30',
    p2: '10:40–12:00',
    p3: '12:10–2:10',
    p4: '2:20–3:40',
  },
} as const

/**
 * Split period 3 into class + lunch rows based on the selected lunch.
 * A: lunch first, then class.
 * B: class, lunch, class.
 * C: class, lunch (later), class.
 * If no lunch is selected, returns a single block with a note.
 */
export function expandPeriod3(
  course: CourseSlot,
  bellType: BellScheduleType
): ScheduleRow[] {
  const isWed = bellType === 'wednesday'
  const lunch = course.lunch

  if (!lunch) {
    return [
      {
        time: isWed ? WEDNESDAY_TIMES.p3Full : REGULAR_TIMES.p3Full,
        period: '3',
        name: course.name,
        teacher: course.teacher,
        room: course.room,
      },
    ]
  }

  const classRow = (time: string): ScheduleRow => ({
    time,
    period: '3',
    name: course.name,
    teacher: course.teacher,
    room: course.room,
  })

  const lunchRow = (time: string, letter: LunchOption): ScheduleRow => ({
    time,
    period: 'Lunch',
    name: `${letter} Lunch`,
    isLunch: true,
  })

  if (!isWed) {
    if (lunch === 'A') {
      return [lunchRow('11:45 AM – 12:20 PM', 'A'), classRow('12:20 PM – 2:00 PM')]
    }
    if (lunch === 'B') {
      return [
        classRow('11:50 AM – 12:20 PM'),
        lunchRow('12:20 PM – 12:55 PM', 'B'),
        classRow('12:55 PM – 2:00 PM'),
      ]
    }
    return [
      classRow('11:50 AM – 12:55 PM'),
      lunchRow('12:55 PM – 1:30 PM', 'C'),
      classRow('1:30 PM – 2:00 PM'),
    ]
  }

  // Wednesday
  if (lunch === 'A') {
    return [lunchRow('12:10 PM – 12:40 PM', 'A'), classRow('12:40 PM – 2:10 PM')]
  }
  if (lunch === 'B') {
    return [
      classRow('12:10 PM – 12:40 PM'),
      lunchRow('12:40 PM – 1:10 PM', 'B'),
      classRow('1:10 PM – 2:10 PM'),
    ]
  }
  return [
    classRow('12:10 PM – 1:10 PM'),
    lunchRow('1:10 PM – 1:40 PM', 'C'),
    classRow('1:40 PM – 2:10 PM'),
  ]
}

// ─── Full schedule generation ───────────────────────────────────────────────

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatWeekday(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()]
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Build the day's schedule (either a blocked-day summary or full class rows). */
export function generateScheduleForDate(
  dateKey: string,
  courses: StudentCourses,
  gsMap: Map<string, DayColor>
): DaySchedule {
  const date = makeDate(dateKey)
  const weekday = formatWeekday(date)
  const dateLabel = formatDateLabel(date)

  // Weekend
  if (isWeekend(date)) {
    return {
      dateKey,
      weekday,
      dateLabel,
      isBlocked: true,
      blockedLabel: 'Weekend — No School',
    }
  }

  const special = getSpecialDate(dateKey)
  if (special?.blocksClasses) {
    return {
      dateKey,
      weekday,
      dateLabel,
      isBlocked: true,
      blockedLabel: special.label,
      hasSpecialSchedule: special.hasSpecialSchedule,
    }
  }

  const semester = getSemesterForDate(dateKey)
  const dayColor = gsMap.get(dateKey)

  // Outside school year (shouldn't normally happen since we clamp inputs, but handle it)
  if (!semester || !dayColor) {
    return {
      dateKey,
      weekday,
      dateLabel,
      isBlocked: true,
      blockedLabel: 'Outside school year',
    }
  }

  const bellType = getBellScheduleType(date)
  const times = bellType === 'wednesday' ? WEDNESDAY_TIMES : REGULAR_TIMES

  const semesterKey = semester === 'Semester 1' ? 'semester1' : 'semester2'
  const day = courses[semesterKey][dayColor]

  const rows: ScheduleRow[] = [
    { time: times.p1, period: '1', name: day.p1.name, teacher: day.p1.teacher, room: day.p1.room },
    { time: times.p2, period: '2', name: day.p2.name, teacher: day.p2.teacher, room: day.p2.room },
    ...expandPeriod3(day.p3, bellType),
    { time: times.p4, period: '4', name: day.p4.name, teacher: day.p4.teacher, room: day.p4.room },
  ]

  return {
    dateKey,
    weekday,
    dateLabel,
    isBlocked: false,
    note: special && !special.blocksClasses ? special.label : undefined,
    semester,
    dayColor,
    bellType,
    rows,
  }
}

/** Iterate day-by-day between two date keys (inclusive) and build a schedule for each.
 *  Weekends are skipped entirely — they never get a card in the output. */
export function generateScheduleRange(
  startDateKey: string,
  endDateKey: string,
  courses: StudentCourses,
  gsMap: Map<string, DayColor>
): DaySchedule[] {
  const out: DaySchedule[] = []
  let cursor = makeDate(startDateKey)
  const end = makeDate(endDateKey)
  while (cursor <= end) {
    if (!isWeekend(cursor)) {
      out.push(generateScheduleForDate(toDateKey(cursor), courses, gsMap))
    }
    cursor = addDays(cursor, 1)
  }
  return out
}

// ─── Empty course template ──────────────────────────────────────────────────

export function emptyCourseSlot(): CourseSlot {
  return { name: '', teacher: '', room: '' }
}

export function emptySemester(): SemesterSchedule {
  return {
    G: { p1: emptyCourseSlot(), p2: emptyCourseSlot(), p3: emptyCourseSlot(), p4: emptyCourseSlot() },
    S: { p1: emptyCourseSlot(), p2: emptyCourseSlot(), p3: emptyCourseSlot(), p4: emptyCourseSlot() },
  }
}

export function emptyCourses(): StudentCourses {
  return {
    studentName: '',
    semester1: emptySemester(),
    semester2: emptySemester(),
  }
}
