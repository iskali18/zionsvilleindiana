'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { zcsEvents } from '@/lib/zcs-calendar'

// ─── Constants ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'zcs-k8-schedule-v1'
const COLLAPSE_STORAGE_KEY = 'zcs-k8-schedule-collapse-v1'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ─── Date helpers ──────────────────────────────────────────────────────────

/** Parse "YYYY-MM-DD" as a local-timezone Date. */
function makeDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Convert a Date to "YYYY-MM-DD" using local timezone. */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Add N days to a date and return a new Date. */
function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

// ─── ZCS calendar derivation ───────────────────────────────────────────────
// Single source of truth is /lib/zcs-calendar.ts. We derive school-year bounds,
// semester bounds, and the blocked-day lookup from `zcsEvents` so nothing has
// to be updated in two places when a new school year is loaded.

/** { start, end } — first/last student day for the current school year. */
const SCHOOL_YEAR = (() => {
  const first = zcsEvents.find(
    (e) => e.title === 'First Student School Day' && e.isDistrictwide
  )
  const last = zcsEvents.find(
    (e) => e.title === 'Last Student Day' && e.isDistrictwide
  )
  return {
    start: first?.startDate ?? '',
    end: last?.startDate ?? '',
  }
})()

/**
 * Semester bounds. Semester 1 = first student day → day before Winter Break.
 * Semester 2 = day after Winter Break → last student day.
 * Falls back to school-year bounds if Winter Break isn't defined.
 */
const SEMESTERS = (() => {
  const winterBreak = zcsEvents.find(
    (e) => e.title === 'Winter Break — No School' && e.isDistrictwide
  )
  if (!winterBreak) {
    return {
      s1: { start: SCHOOL_YEAR.start, end: SCHOOL_YEAR.end },
      s2: { start: '', end: '' },
    }
  }
  const s1End = toDateKey(addDays(makeDate(winterBreak.startDate), -1))
  const s2Start = winterBreak.endDate
    ? toDateKey(addDays(makeDate(winterBreak.endDate), 1))
    : toDateKey(addDays(makeDate(winterBreak.startDate), 1))
  return {
    s1: { start: SCHOOL_YEAR.start, end: s1End },
    s2: { start: s2Start, end: SCHOOL_YEAR.end },
  }
})()

/**
 * Map every districtwide no-school date to its label ("Fall Break", "MLK
 * Holiday", etc.). Used to render merged blocked cells in the print output.
 * Multi-day events expand into every date in the range.
 */
const BLOCKED_DATES: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const event of zcsEvents) {
    if (!event.isDistrictwide) continue
    if (
      event.title === 'First Student School Day' ||
      event.title === 'Last Student Day'
    ) {
      continue // these are school days, not blocked
    }
    const label = event.title.replace(/ — No School$/, '')
    if (event.endDate) {
      let cur = makeDate(event.startDate)
      const end = makeDate(event.endDate)
      while (cur <= end) {
        map.set(toDateKey(cur), label)
        cur = addDays(cur, 1)
      }
    } else {
      map.set(event.startDate, label)
    }
  }
  return map
})()

// ─── Types ─────────────────────────────────────────────────────────────────

/** A single class or period within a schedule. */
interface Entry {
  id: string
  daysOfWeek: number[] // 0=Sun … 6=Sat, defaults to [1,2,3,4,5]
  startTime: string // "HH:MM" 24-hour
  endTime: string // "HH:MM" 24-hour
  label: string // e.g. "Social Studies", "Lunch", "Recess"
  teacher: string // optional
  room: string // optional
}

/** A schedule covering a date range with its own list of entries. */
interface ScheduleBlock {
  id: string
  name: string // "School year", "Semester 1", "Semester 2"
  startDate: string // "YYYY-MM-DD"
  endDate: string // "YYYY-MM-DD"
  entries: Entry[]
}

/** An activity like a club, sport, lesson, or appointment.
 *  Same shape as ZCHS tool's Activity to share the caps/rendering logic. */
interface Activity {
  id: string
  name: string
  startTime: string
  endTime: string
  daysOfWeek: number[]
  startDate: string
  endDate: string
  location: string
  schoolDaysOnly: boolean
}

/** Format of the student's schedule. School-year = one schedule that spans
 *  Aug–May. Semesters = two schedules (Semester 1 + Semester 2), like ZCHS. */
type ScheduleFormat = 'school-year' | 'semesters'

/** Top-level per-student state. */
interface Student {
  id: string
  studentName: string
  scheduleFormat: ScheduleFormat
  /** Which grade level / program the student is in. Drives the school-day
   *  boundaries used to bucket activities into before/inline/after school.
   *  Null when the parent hasn't picked one yet — fallback times apply. */
  scheduleLevel: ScheduleLevel | null
  schedules: ScheduleBlock[] // 1 block if school-year, 2 if semesters
  activities: Activity[]
}

// ─── Display formatting helpers ────────────────────────────────────────────

/** Format 24-hour "HH:MM" as 12-hour "H:MM AM/PM". */
function formatTime12h(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const period = h >= 12 ? 'PM' : 'AM'
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')} ${period}`
}

/** Format days-of-week as compact string. Consecutive runs of 3+ days
 *  render as ranges ("Mon–Fri"), otherwise as comma-separated ("Mon, Wed"). */
function formatDaysCompact(days: number[]): string {
  if (days.length === 0) return 'No days'
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const sorted = [...days].sort((a, b) => a - b)
  const isConsecutive = sorted.every(
    (d, i) => i === 0 || d === sorted[i - 1] + 1
  )
  if (isConsecutive && sorted.length >= 3) {
    return `${labels[sorted[0]]}–${labels[sorted[sorted.length - 1]]}`
  }
  return sorted.map((d) => labels[d]).join(', ')
}

// ─── Activity helpers ──────────────────────────────────────────────────────

/** Per-placement print caps — the print layout has room for a limited number
 *  of activities per bucket. Weekend has its own cap. */
const CAP_BEFORE = 2
const CAP_INLINE = 1
const CAP_AFTER = 4
const CAP_WEEKEND = 4

/** Where an activity gets placed on the schedule grid based on start time.
 *  Before school = before the first class starts.
 *  Inline = during the school day (rare — like a doctor's appointment).
 *  After = after the last class. */
type ActivityPlacement = 'before' | 'inline' | 'after'

/** Every schedule level the tool supports. Preschool programs are grouped
 *  under a collapsible section to avoid overwhelming K-8 families. */
type ScheduleLevel =
  | 'kindergarten'
  | 'grades-1-4'
  | 'middle-school'
  | 'preschool-universal'
  | 'preschool-developmental-am'
  | 'preschool-developmental-pm'
  | 'preschool-transitional-foundational'
  | 'preschool-phonology'

interface ScheduleLevelInfo {
  key: ScheduleLevel
  label: string
  /** Human-readable time range shown as a pill subtitle. */
  timeLabel: string
  /** "HH:MM" 24-hour start of the school day. */
  start: string
  /** "HH:MM" 24-hour end of the school day. */
  end: string
}

/** Kindergarten / Grades 1-4 / Middle School — visible by default. */
const MAIN_LEVELS: ScheduleLevelInfo[] = [
  { key: 'kindergarten', label: 'Kindergarten', timeLabel: '9:00 – 2:30', start: '09:00', end: '14:30' },
  { key: 'grades-1-4', label: 'Grades 1–4', timeLabel: '8:00 – 2:30', start: '08:00', end: '14:30' },
  { key: 'middle-school', label: 'Middle School', timeLabel: '8:45 – 3:45', start: '08:45', end: '15:45' },
]

/** ZCS Preschool programs — hidden under an expandable section. */
const PRESCHOOL_LEVELS: ScheduleLevelInfo[] = [
  { key: 'preschool-universal', label: 'Universal Preschool', timeLabel: '8:15 – 2:45', start: '08:15', end: '14:45' },
  { key: 'preschool-developmental-am', label: 'Developmental (AM)', timeLabel: '8:00 – 10:30', start: '08:00', end: '10:30' },
  { key: 'preschool-developmental-pm', label: 'Developmental (PM)', timeLabel: '12:00 – 2:30', start: '12:00', end: '14:30' },
  { key: 'preschool-transitional-foundational', label: 'Transitional & Foundational', timeLabel: '8:00 – 2:30', start: '08:00', end: '14:30' },
  { key: 'preschool-phonology', label: 'Phonology', timeLabel: '12:00 – 2:30', start: '12:00', end: '14:30' },
]

const ALL_LEVELS: ScheduleLevelInfo[] = [...MAIN_LEVELS, ...PRESCHOOL_LEVELS]

/** Reasonable generic default when no level has been picked. Activities
 *  still bucket into before/inline/after, but the boundaries may not match
 *  the parent's actual school. Encourages picking a level. */
const FALLBACK_TIMES = { start: '08:00', end: '15:00' } as const

/** Look up school-day boundaries for a level. */
function getSchoolTimes(
  level: ScheduleLevel | null
): { start: string; end: string } {
  if (!level) return FALLBACK_TIMES
  const info = ALL_LEVELS.find((l) => l.key === level)
  return info ? { start: info.start, end: info.end } : FALLBACK_TIMES
}

/** Format a list of day-of-week numbers as human-readable text.
 *  0=Sun, 6=Sat. Uses short day names. */
function formatDaysOfWeek(days: number[]): string {
  if (days.length === 0) return 'No days'
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const sorted = [...days].sort((a, b) => a - b)
  const isConsecutive = sorted.every(
    (d, i) => i === 0 || d === sorted[i - 1] + 1
  )
  if (isConsecutive && sorted.length >= 3) {
    return `${labels[sorted[0]]}–${labels[sorted[sorted.length - 1]]}`
  }
  return sorted.map((d) => labels[d]).join(', ')
}

/** Place an activity into a bucket based on its start time. */
function placeActivity(
  a: Activity,
  schoolTimes: { start: string; end: string }
): ActivityPlacement | null {
  if (!a.startTime) return null
  if (a.startTime < schoolTimes.start) return 'before'
  if (a.startTime >= schoolTimes.end) return 'after'
  return 'inline'
}

/** Would this activity DISPLAY on `dateKey`? Used for validation and grid
 *  rendering. */
function activityAppliesToDateRaw(a: Activity, dateKey: string): boolean {
  if (!a.name.trim()) return false
  if (!a.startTime) return false
  if (a.daysOfWeek.length === 0) return false
  if (a.startDate && dateKey < a.startDate) return false
  if (a.endDate && dateKey > a.endDate) return false
  const jsWeekday = makeDate(dateKey).getDay()
  if (!a.daysOfWeek.includes(jsWeekday)) return false
  // Respect schoolDaysOnly: hide on ZCS breaks + weekends
  if (a.schoolDaysOnly) {
    const isWeekend = jsWeekday === 0 || jsWeekday === 6
    if (isWeekend) return false
    if (BLOCKED_DATES.has(dateKey)) return false
  }
  return true
}

/** Check whether saving this activity would push any date past a per-placement
 *  print cap. Used to block save entirely — Done button disables when this
 *  returns invalid, so parents can't create overflow in the first place. */
function checkActivityDailyLimit(
  proposed: Activity,
  otherActivities: Activity[],
  schoolTimes: { start: string; end: string }
): { valid: boolean; message?: string } {
  if (!proposed.name.trim() || !proposed.startTime) return { valid: true }
  if (proposed.daysOfWeek.length === 0) return { valid: true }
  if (!proposed.startDate || !proposed.endDate) return { valid: true }
  if (proposed.startDate > proposed.endDate) return { valid: true }

  const proposedPlacement = placeActivity(proposed, schoolTimes)
  if (!proposedPlacement) return { valid: true }

  let cur = makeDate(proposed.startDate)
  const end = makeDate(proposed.endDate)
  while (cur <= end) {
    const dateKey = toDateKey(cur)
    cur = addDays(cur, 1)

    if (!activityAppliesToDateRaw(proposed, dateKey)) continue

    const jsWeekday = makeDate(dateKey).getDay()
    const isWeekend = jsWeekday === 0 || jsWeekday === 6

    if (isWeekend) {
      let count = 1
      for (const other of otherActivities) {
        if (activityAppliesToDateRaw(other, dateKey)) count++
      }
      if (count > CAP_WEEKEND) {
        return {
          valid: false,
          message: `You've reached the limit of ${CAP_WEEKEND} activities per Saturday or Sunday. Adjust the days, time, or dates for this or another activity to make room.`,
        }
      }
    } else {
      let count = 1
      for (const other of otherActivities) {
        if (
          activityAppliesToDateRaw(other, dateKey) &&
          placeActivity(other, schoolTimes) === proposedPlacement
        ) {
          count++
        }
      }
      const cap =
        proposedPlacement === 'before'
          ? CAP_BEFORE
          : proposedPlacement === 'after'
            ? CAP_AFTER
            : CAP_INLINE
      if (count > cap) {
        let message = ''
        if (proposedPlacement === 'before') {
          message = `You've reached the limit of ${CAP_BEFORE} before-school activities per day. Adjust the days, time, or dates for this or another activity to make room.`
        } else if (proposedPlacement === 'after') {
          message = `You've reached the limit of ${CAP_AFTER} after-school activities per day. Adjust the days, time, or dates for this or another activity to make room.`
        } else {
          message = `Only ${CAP_INLINE} during-school activity can be added per day. Adjust the days, time, or dates for this or another activity to make room.`
        }
        return { valid: false, message }
      }
    }
  }
  return { valid: true }
}

/** All activities applying to a date, sorted by start time. */
function activitiesForDateKey(
  dateKey: string,
  activities: Activity[]
): Activity[] {
  return activities
    .filter((a) => activityAppliesToDateRaw(a, dateKey))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/** Split activities on a date into before-school, inline (during school day),
 *  and after-school buckets. Used to render the weekly grid rows. */
function activitiesByPlacement(
  dateKey: string,
  activities: Activity[],
  schoolTimes: { start: string; end: string }
): { before: Activity[]; inline: Activity[]; after: Activity[] } {
  const buckets: {
    before: Activity[]
    inline: Activity[]
    after: Activity[]
  } = { before: [], inline: [], after: [] }
  for (const a of activitiesForDateKey(dateKey, activities)) {
    const p = placeActivity(a, schoolTimes)
    if (p) buckets[p].push(a)
  }
  return buckets
}

/** Set of activity IDs that would be dropped from print on at least one
 *  date due to per-placement caps. */
function getActivitiesThatWontFit(
  activities: Activity[],
  schoolTimes: { start: string; end: string }
): Set<string> {
  const wontFit = new Set<string>()
  const allDates = new Set<string>()
  for (const a of activities) {
    if (
      !a.name.trim() ||
      !a.startTime ||
      a.daysOfWeek.length === 0 ||
      !a.startDate ||
      !a.endDate
    )
      continue
    let cur = makeDate(a.startDate)
    const end = makeDate(a.endDate)
    while (cur <= end) {
      allDates.add(toDateKey(cur))
      cur = addDays(cur, 1)
    }
  }

  for (const dateKey of allDates) {
    const jsWeekday = makeDate(dateKey).getDay()
    const isWeekend = jsWeekday === 0 || jsWeekday === 6

    const applying = activities
      .filter((a) => activityAppliesToDateRaw(a, dateKey))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    if (isWeekend) {
      const overflow = applying.slice(CAP_WEEKEND)
      for (const a of overflow) wontFit.add(a.id)
    } else {
      const buckets: Record<ActivityPlacement, Activity[]> = {
        before: [],
        inline: [],
        after: [],
      }
      for (const a of applying) {
        const p = placeActivity(a, schoolTimes)
        if (p) buckets[p].push(a)
      }
      const capFor = (p: ActivityPlacement): number =>
        p === 'before' ? CAP_BEFORE : p === 'after' ? CAP_AFTER : CAP_INLINE
      for (const p of ['before', 'inline', 'after'] as ActivityPlacement[]) {
        const overflow = buckets[p].slice(capFor(p))
        for (const a of overflow) wontFit.add(a.id)
      }
    }
  }

  return wontFit
}

// ─── Schedule generation ───────────────────────────────────────────────────

/** A single day within a generated week. */
interface GeneratedDay {
  dateKey: string // "YYYY-MM-DD"
  weekday: number // 1=Mon … 5=Fri
  isInRange: boolean // false when the day falls outside the print range
  isBlocked: boolean
  blockedLabel?: string
  block: ScheduleBlock | null // which schedule block covers this day
}

/** A time slot row shared across the week. Each day column may or may not
 *  have an entry at this time. */
interface TimeSlot {
  startTime: string // "HH:MM" 24-hour
  endTime: string
  /** 5-element array indexed by weekday - 1 (0=Mon, 4=Fri). null = no entry. */
  entriesByDay: (Entry | null)[]
}

/** One generated week, ready to render as a grid. */
interface GeneratedWeek {
  weekStart: string // Monday of this week
  days: GeneratedDay[] // 5 items, Mon–Fri
  timeSlots: TimeSlot[]
  /** Print range boundaries, echoed so WeekGrid can decide whether Sat/Sun
   *  are in-range without needing to plumb them through props. */
  printStart: string
  printEnd: string
}

/** Get the Monday date for any date's week. */
function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, …, 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

/** Find the schedule block whose date range contains the given date. */
function findBlockForDate(
  dateKey: string,
  schedules: ScheduleBlock[]
): ScheduleBlock | null {
  for (const b of schedules) {
    if (b.startDate && b.endDate && b.startDate <= dateKey && dateKey <= b.endDate) {
      return b
    }
  }
  return null
}

/** Build the weekly grids for the given print range. */
function generateSchedule(
  printStart: string,
  printEnd: string,
  schedules: ScheduleBlock[]
): GeneratedWeek[] {
  const weeks: GeneratedWeek[] = []
  const start = makeDate(printStart)
  const end = makeDate(printEnd)

  // Iterate week-by-week starting from the Monday of the start date
  let mondayCursor = getMondayOf(start)
  while (mondayCursor <= end) {
    const days: GeneratedDay[] = []
    for (let i = 0; i < 5; i++) {
      const dayDate = addDays(mondayCursor, i)
      const dateKey = toDateKey(dayDate)
      const inRange = dateKey >= printStart && dateKey <= printEnd
      if (!inRange) {
        // Push an out-of-range placeholder (rendered as empty)
        days.push({
          dateKey,
          weekday: i + 1,
          isInRange: false,
          isBlocked: false,
          block: null,
        })
        continue
      }
      const blockedLabel = BLOCKED_DATES.get(dateKey)
      const block = findBlockForDate(dateKey, schedules)
      days.push({
        dateKey,
        weekday: i + 1,
        isInRange: true,
        isBlocked: !!blockedLabel,
        blockedLabel,
        block,
      })
    }

    // Collect all entries that apply to any Mon–Fri day this week.
    // Group by (startTime, endTime) so multiple entries at the same time
    // across different days share one row.
    const slotMap = new Map<string, TimeSlot>()
    for (let i = 0; i < 5; i++) {
      const day = days[i]
      if (!day.block || day.isBlocked) continue
      const jsWeekday = day.weekday // 1=Mon … 5=Fri
      for (const entry of day.block.entries) {
        if (!entry.label.trim()) continue
        if (!entry.startTime || !entry.endTime) continue
        if (!entry.daysOfWeek.includes(jsWeekday)) continue
        const key = `${entry.startTime}-${entry.endTime}`
        if (!slotMap.has(key)) {
          slotMap.set(key, {
            startTime: entry.startTime,
            endTime: entry.endTime,
            entriesByDay: [null, null, null, null, null],
          })
        }
        slotMap.get(key)!.entriesByDay[i] = entry
      }
    }

    // Sort time slots chronologically
    const timeSlots = Array.from(slotMap.values()).sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    )

    weeks.push({
      weekStart: toDateKey(mondayCursor),
      days,
      timeSlots,
      printStart,
      printEnd,
    })

    mondayCursor = addDays(mondayCursor, 7)
  }

  return weeks
}

/** Build a template weekly schedule from a single block's entries.
 *  Used when the parent has no activities entered — the printout is a single
 *  repeatable week with Mon–Fri column headers instead of specific dates. */
function buildTemplateTimeSlots(block: ScheduleBlock): TimeSlot[] {
  const slotMap = new Map<string, TimeSlot>()
  for (const entry of block.entries) {
    if (!entry.label.trim()) continue
    if (!entry.startTime || !entry.endTime) continue
    const key = `${entry.startTime}-${entry.endTime}`
    if (!slotMap.has(key)) {
      slotMap.set(key, {
        startTime: entry.startTime,
        endTime: entry.endTime,
        entriesByDay: [null, null, null, null, null],
      })
    }
    for (const jsDay of entry.daysOfWeek) {
      if (jsDay >= 1 && jsDay <= 5) {
        slotMap.get(key)!.entriesByDay[jsDay - 1] = entry
      }
    }
  }
  return Array.from(slotMap.values()).sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )
}

/** Discriminated union representing either a repeatable template week
 *  (no activities) or a specific date range (with activities). */
type GeneratedOutput =
  | { type: 'template'; block: ScheduleBlock; timeSlots: TimeSlot[] }
  | { type: 'range'; weeks: GeneratedWeek[] }

// ─── ID generation ─────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── Factory functions ─────────────────────────────────────────────────────

function createEmptyEntry(): Entry {
  return {
    id: generateId('e'),
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri
    startTime: '',
    endTime: '',
    label: '',
    teacher: '',
    room: '',
  }
}

function createSchoolYearBlock(): ScheduleBlock {
  return {
    id: generateId('sb'),
    name: 'School year',
    startDate: SCHOOL_YEAR.start,
    endDate: SCHOOL_YEAR.end,
    entries: [],
  }
}

function createSemesterBlocks(): ScheduleBlock[] {
  return [
    {
      id: generateId('sb'),
      name: 'Semester 1',
      startDate: SEMESTERS.s1.start,
      endDate: SEMESTERS.s1.end,
      entries: [],
    },
    {
      id: generateId('sb'),
      name: 'Semester 2',
      startDate: SEMESTERS.s2.start,
      endDate: SEMESTERS.s2.end,
      entries: [],
    },
  ]
}

function createEmptyActivity(): Activity {
  return {
    id: generateId('a'),
    name: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [],
    startDate: SCHOOL_YEAR.start,
    endDate: SCHOOL_YEAR.end,
    location: '',
    schoolDaysOnly: true,
  }
}

function createEmptyStudent(): Student {
  return {
    id: generateId('s'),
    studentName: '',
    scheduleFormat: 'school-year',
    scheduleLevel: null,
    schedules: [createSchoolYearBlock()],
    activities: [],
  }
}

function getStudentDisplayName(s: Student | undefined, idx: number): string {
  if (!s) return `Student ${idx + 1}`
  return s.studentName.trim() || `Student ${idx + 1}`
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function ZcsK8ScheduleGenerator() {
  const [students, setStudents] = useState<Student[]>(() => [createEmptyStudent()])
  const [activeStudentId, setActiveStudentId] = useState<string>(() => students[0]!.id)
  const [printStartDate, setPrintStartDate] = useState<string>('')
  const [printEndDate, setPrintEndDate] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')
  const [hasLoaded, setHasLoaded] = useState(false)
  /** Which class/period entry is currently in edit mode (only one at a time). */
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  /** Snapshot for the "Restore" toast after a destructive action. */
  const [undoSnapshot, setUndoSnapshot] = useState<
    { label: string; restore: () => void } | null
  >(null)
  /** Generated schedule preview — either a repeatable template or a range. */
  const [generated, setGenerated] = useState<GeneratedOutput | null>(null)
  /** For semester format: which block the user wants to print. */
  const [selectedBlockId, setSelectedBlockId] = useState<string>('')
  /** Two-click confirm state for Delete this student. */
  const [confirmingDeleteStudent, setConfirmingDeleteStudent] = useState(false)
  /** Two-click confirm state for Clear saved data. */
  const [confirmingClear, setConfirmingClear] = useState(false)
  /** Which activity's editor is currently expanded (only one at a time). */
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  /** Whether the Activities section is collapsed (starts closed). */
  const [activitiesCollapsed, setActivitiesCollapsed] = useState(true)
  /** IDs of schedule blocks that are collapsed. */
  const [collapsedBlockIds, setCollapsedBlockIds] = useState<Set<string>>(
    () => new Set()
  )
  /** Whether the Preschool programs section is expanded. Hidden by default
   *  since preschool families are the minority; auto-expands when the active
   *  student's scheduleLevel is a preschool option. */
  const [preschoolExpanded, setPreschoolExpanded] = useState(false)

  const toggleBlockCollapsed = (id: string) => {
    setCollapsedBlockIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── Persistence ────────────────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (
          parsed &&
          Array.isArray(parsed.students) &&
          parsed.students.length > 0
        ) {
          const restored: Student[] = parsed.students.map(
            (s: Partial<Student>) => {
              const level =
                typeof s.scheduleLevel === 'string' &&
                ALL_LEVELS.some((l) => l.key === s.scheduleLevel)
                  ? (s.scheduleLevel as ScheduleLevel)
                  : null
              return {
                id: s.id || generateId('s'),
                studentName: s.studentName || '',
                scheduleFormat:
                  s.scheduleFormat === 'semesters' ? 'semesters' : 'school-year',
                scheduleLevel: level,
                schedules:
                  Array.isArray(s.schedules) && s.schedules.length > 0
                    ? s.schedules
                    : s.scheduleFormat === 'semesters'
                      ? createSemesterBlocks()
                      : [createSchoolYearBlock()],
                activities: Array.isArray(s.activities) ? s.activities : [],
              }
            }
          )
          setStudents(restored)
          setActiveStudentId(
            parsed.activeStudentId &&
              restored.some((s) => s.id === parsed.activeStudentId)
              ? parsed.activeStudentId
              : restored[0]!.id
          )
          if (typeof parsed.printStartDate === 'string')
            setPrintStartDate(parsed.printStartDate)
          if (typeof parsed.printEndDate === 'string')
            setPrintEndDate(parsed.printEndDate)
        }
      }
      // Restore collapse state so users returning to the tool see the same
      // expanded/collapsed layout as when they left.
      const savedCollapse = localStorage.getItem(COLLAPSE_STORAGE_KEY)
      if (savedCollapse) {
        const parsed = JSON.parse(savedCollapse)
        if (typeof parsed?.activities === 'boolean') {
          setActivitiesCollapsed(parsed.activities)
        }
        if (Array.isArray(parsed?.blockIds)) {
          setCollapsedBlockIds(new Set(parsed.blockIds.filter((x: unknown) => typeof x === 'string')))
        }
      }
    } catch {
      /* ignore */
    }
    setHasLoaded(true)
  }, [])

  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          students,
          activeStudentId,
          printStartDate,
          printEndDate,
        })
      )
    } catch {
      /* ignore */
    }
  }, [students, activeStudentId, printStartDate, printEndDate, hasLoaded])

  // Persist collapse state separately (Set serialized as array).
  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        JSON.stringify({
          activities: activitiesCollapsed,
          blockIds: Array.from(collapsedBlockIds),
        })
      )
    } catch {
      /* ignore */
    }
  }, [activitiesCollapsed, collapsedBlockIds, hasLoaded])

  // ─── Derived state ──────────────────────────────────────────────────────

  const activeStudent =
    students.find((s) => s.id === activeStudentId) || students[0]!

  /** School-day boundaries for the active student — drives activity bucketing.
   *  Falls back to generic 8-3 when no level is picked yet. */
  const schoolTimes = getSchoolTimes(activeStudent.scheduleLevel)

  // ─── Student mutations ─────────────────────────────────────────────────

  const updateActiveStudent = (patch: (s: Student) => Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === activeStudentId ? patch(s) : s))
    )
  }

  const handleAddStudent = () => {
    const fresh = createEmptyStudent()
    setStudents((prev) => [...prev, fresh])
    setActiveStudentId(fresh.id)
  }

  // Auto-reset delete confirm after 5s of inactivity
  useEffect(() => {
    if (!confirmingDeleteStudent) return
    const t = setTimeout(() => setConfirmingDeleteStudent(false), 5000)
    return () => clearTimeout(t)
  }, [confirmingDeleteStudent])

  // Clear the generated schedule whenever the active student changes so the
  // preview doesn't show stale data from the previous student.
  useEffect(() => {
    setGenerated(null)
    setValidationError('')
  }, [activeStudentId])

  // When the active student's scheduleLevel is a preschool option, expand the
  // preschool section so they can see their pick. Runs on student switch and
  // when the level changes.
  useEffect(() => {
    if (activeStudent.scheduleLevel?.startsWith('preschool-')) {
      setPreschoolExpanded(true)
    }
  }, [activeStudentId, activeStudent.scheduleLevel])

  // Auto-reset clear confirm after 5s of inactivity
  useEffect(() => {
    if (!confirmingClear) return
    const t = setTimeout(() => setConfirmingClear(false), 5000)
    return () => clearTimeout(t)
  }, [confirmingClear])

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }
    // Second click — snapshot everything for Restore then wipe.
    const snapshot = {
      students: JSON.parse(JSON.stringify(students)) as Student[],
      activeStudentId,
      printStartDate,
      printEndDate,
      selectedBlockId,
      collapsedBlockIds: new Set(collapsedBlockIds),
      activitiesCollapsed,
    }
    setUndoSnapshot({
      label: 'Cleared all saved data',
      restore: () => {
        setStudents(snapshot.students)
        setActiveStudentId(snapshot.activeStudentId)
        setPrintStartDate(snapshot.printStartDate)
        setPrintEndDate(snapshot.printEndDate)
        setSelectedBlockId(snapshot.selectedBlockId)
        setCollapsedBlockIds(snapshot.collapsedBlockIds)
        setActivitiesCollapsed(snapshot.activitiesCollapsed)
      },
    })

    const fresh = createEmptyStudent()
    setStudents([fresh])
    setActiveStudentId(fresh.id)
    setPrintStartDate('')
    setPrintEndDate('')
    setSelectedBlockId('')
    setGenerated(null)
    setValidationError('')
    setConfirmingClear(false)
    setConfirmingDeleteStudent(false)
    setCollapsedBlockIds(new Set())
    setActivitiesCollapsed(true)
    setEditingEntryId(null)
    setEditingActivityId(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(COLLAPSE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  const handleDeleteStudent = () => {
    if (students.length <= 1) return
    if (!confirmingDeleteStudent) {
      setConfirmingDeleteStudent(true)
      return
    }
    // Second click — snapshot then delete. Deep-clone everything so Restore
    // can put the student back exactly as they were.
    const deletedStudent = students.find((s) => s.id === activeStudentId)
    const snapshot = {
      students: JSON.parse(JSON.stringify(students)) as Student[],
      activeStudentId,
    }
    const displayName = deletedStudent?.studentName?.trim()
    const label = displayName ? `Deleted ${displayName}` : 'Deleted student'
    setUndoSnapshot({
      label,
      restore: () => {
        setStudents(snapshot.students)
        setActiveStudentId(snapshot.activeStudentId)
      },
    })

    const remaining = students.filter((s) => s.id !== activeStudentId)
    setStudents(remaining)
    setActiveStudentId(remaining[0]!.id)
    setGenerated(null)
    setValidationError('')
    setConfirmingDeleteStudent(false)
  }

  const handleStudentNameChange = (name: string) => {
    updateActiveStudent((s) => ({ ...s, studentName: name }))
  }

  const handleScheduleLevelChange = (level: ScheduleLevel) => {
    updateActiveStudent((s) => ({ ...s, scheduleLevel: level }))
  }

  /** Switch between school-year and semesters formats. When switching, either
   *  merge existing entries into new blocks (best effort) or reset. Only
   *  snapshots for Restore when the switch actually loses information — i.e.
   *  Semesters → School Year, which merges two lists into one. */
  const handleFormatChange = (format: ScheduleFormat) => {
    if (activeStudent.scheduleFormat === format) return

    // Only snapshot when the switch merges data. Going School Year → Semesters
    // just moves entries to Semester 1 with an empty Semester 2 — no data loss.
    const shouldSnapshot =
      activeStudent.scheduleFormat === 'semesters' && format === 'school-year'
    if (shouldSnapshot) {
      const snapshot = {
        scheduleFormat: activeStudent.scheduleFormat,
        schedules: JSON.parse(JSON.stringify(activeStudent.schedules)) as ScheduleBlock[],
      }
      const snapshotStudentId = activeStudentId
      setUndoSnapshot({
        label: 'Combined classes into one schedule',
        restore: () => {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === snapshotStudentId
                ? {
                    ...s,
                    scheduleFormat: snapshot.scheduleFormat,
                    schedules: snapshot.schedules,
                  }
                : s
            )
          )
        },
      })
    }

    updateActiveStudent((s) => {
      // Collect all existing entries across current blocks
      const allEntries = s.schedules.flatMap((b) => b.entries)
      if (format === 'school-year') {
        const block = createSchoolYearBlock()
        block.entries = allEntries
        return { ...s, scheduleFormat: format, schedules: [block] }
      } else {
        const blocks = createSemesterBlocks()
        // Copy entries into Semester 1; parents can copy to S2 manually
        blocks[0].entries = allEntries
        return { ...s, scheduleFormat: format, schedules: blocks }
      }
    })
  }

  // ─── Schedule block mutations ──────────────────────────────────────────

  const handleAddEntry = (blockId: string) => {
    const newEntry = createEmptyEntry()
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId
          ? { ...b, entries: [...b.entries, newEntry] }
          : b
      ),
    }))
    setEditingEntryId(newEntry.id)
  }

  const handleUpdateEntry = (
    blockId: string,
    entryId: string,
    patch: Partial<Entry>
  ) => {
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId
          ? {
              ...b,
              entries: b.entries.map((e) =>
                e.id === entryId ? { ...e, ...patch } : e
              ),
            }
          : b
      ),
    }))
  }

  const handleDeleteEntry = (blockId: string, entryId: string) => {
    const block = activeStudent.schedules.find((b) => b.id === blockId)
    const entry = block?.entries.find((e) => e.id === entryId)
    if (!entry) return

    // Empty entry (no label) — silent delete, no confirm, no toast
    if (!entry.label.trim()) {
      updateActiveStudent((s) => ({
        ...s,
        schedules: s.schedules.map((b) =>
          b.id === blockId
            ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) }
            : b
        ),
      }))
      if (editingEntryId === entryId) setEditingEntryId(null)
      return
    }

    // Named entry — snapshot then delete, so Restore can bring it back exactly
    const snapshot = JSON.parse(JSON.stringify(entry)) as Entry
    const snapshotBlockId = blockId
    const snapshotStudentId = activeStudentId
    const snapshotLabel = entry.label.trim()

    setUndoSnapshot({
      label: `Removed ${snapshotLabel}`,
      restore: () => {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === snapshotStudentId
              ? {
                  ...s,
                  schedules: s.schedules.map((b) =>
                    b.id === snapshotBlockId
                      ? { ...b, entries: [...b.entries, snapshot] }
                      : b
                  ),
                }
              : s
          )
        )
      },
    })

    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId
          ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) }
          : b
      ),
    }))
    if (editingEntryId === entryId) setEditingEntryId(null)
  }

  /** Copy all entries from Semester 1 to Semester 2. Only meaningful when
   *  scheduleFormat === 'semesters'. */
  const handleCopyS1ToS2 = () => {
    updateActiveStudent((s) => {
      if (s.schedules.length !== 2) return s
      const s1 = s.schedules[0]
      const s2 = s.schedules[1]
      const copiedEntries = s1.entries.map((e) => ({
        ...e,
        id: generateId('e'),
      }))
      return {
        ...s,
        schedules: [s1, { ...s2, entries: copiedEntries }],
      }
    })
  }

  // ─── Activity mutations ─────────────────────────────────────────────────

  const handleAddActivity = () => {
    const newActivity = createEmptyActivity()
    updateActiveStudent((s) => ({
      ...s,
      activities: [...s.activities, newActivity],
    }))
    setEditingActivityId(newActivity.id)
  }

  const handleUpdateActivity = (id: string, patch: Partial<Activity>) => {
    updateActiveStudent((s) => ({
      ...s,
      activities: s.activities.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }))
  }

  const handleDeleteActivity = (id: string) => {
    const activity = activeStudent.activities.find((a) => a.id === id)
    if (!activity) return

    // Empty activity (no name) — silent delete, no confirm/toast
    if (!activity.name.trim()) {
      updateActiveStudent((s) => ({
        ...s,
        activities: s.activities.filter((a) => a.id !== id),
      }))
      if (editingActivityId === id) setEditingActivityId(null)
      return
    }

    // Named activity — snapshot + Restore toast
    const snapshot = JSON.parse(JSON.stringify(activity)) as Activity
    const snapshotStudentId = activeStudentId
    setUndoSnapshot({
      label: `Removed ${activity.name.trim()}`,
      restore: () => {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === snapshotStudentId
              ? { ...s, activities: [...s.activities, snapshot] }
              : s
          )
        )
      },
    })
    updateActiveStudent((s) => ({
      ...s,
      activities: s.activities.filter((a) => a.id !== id),
    }))
    if (editingActivityId === id) setEditingActivityId(null)
  }

  // ─── Generate ──────────────────────────────────────────────────────────

  const handleGenerate = () => {
    setValidationError('')
    const hasActivities = activeStudent.activities.length > 0

    if (!hasActivities) {
      // Template mode — no activities, no dates. Just one recurring week
      // from the selected schedule block.
      const block =
        activeStudent.schedules.find((b) => b.id === selectedBlockId) ??
        activeStudent.schedules[0]
      if (!block) {
        setValidationError('Add a class or period to your schedule first.')
        setGenerated(null)
        return
      }
      if (block.entries.length === 0) {
        setValidationError('Add a class or period to your schedule first.')
        setGenerated(null)
        return
      }
      const timeSlots = buildTemplateTimeSlots(block)
      setGenerated({ type: 'template', block, timeSlots })
      return
    }

    // Range mode — activities require a date range so activities can be
    // placed on specific dates.
    if (!printStartDate || !printEndDate) {
      setValidationError('Please choose both a start date and an end date.')
      setGenerated(null)
      return
    }
    if (printStartDate > printEndDate) {
      setValidationError('The start date must be on or before the end date.')
      setGenerated(null)
      return
    }
    const weeks = generateSchedule(
      printStartDate,
      printEndDate,
      activeStudent.schedules
    )
    setGenerated({ type: 'range', weeks })
  }

  const handlePrint = () => window.print()

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Landscape orientation for print, with @bottom-center footer holding
          the printed date + URL — same format as the ZCHS tool. */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: landscape;
                margin: 0.5in 0.5in 0.6in 0.5in;
                @bottom-center {
                  content: "Printed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · ZionsvilleIndiana.com/tools/zcs-k8-schedule";
                  font-family: sans-serif;
                  font-size: 9pt;
                  color: #78716c;
                }
              }
            }
          `,
        }}
      />

      {/* Title + intro — screen only */}
      <div className="print:hidden">
        <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mb-2">
          ZCS K-8 Weekly Schedule Maker
        </h1>
        <p className="text-stone-700 mb-2 max-w-[720px]">
          Create a one-page weekly schedule for classes, lunch, recess, and
          activities.
        </p>
        <ul className="text-stone-600 mb-6 max-w-[720px] text-sm list-disc pl-5 space-y-1">
          <li>
            Enter classes or periods for the school year or by semester, and
            select the dates to print
          </li>
          <li>School breaks and holidays are pre-loaded from the ZCS calendar</li>
          <li>Teacher and room are optional</li>
          <li>Saved only in this browser. Nothing is sent to ZionsvilleIndiana.com.</li>
          <li>
            Dates are based on published ZCS calendars. Confirm with the{' '}
            <a
              href="https://www.zcs.k12.in.us/about-zcs/calendars"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brick-600 hover:text-brick-700 hover:underline"
            >
              official ZCS calendar
            </a>
            .
          </li>
        </ul>
        <p className="text-sm text-stone-500 mb-8 max-w-[720px]">
          For ZCHS students, use the{' '}
          <a
            href="/tools/zchs-schedule"
            className="text-brick-600 hover:text-brick-700 hover:underline"
          >
            ZCHS Weekly Schedule Maker
          </a>
          .
        </p>

        {/* Student tabs */}
        <section className="mb-6 max-w-[720px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-stone-700 mr-1">
              Students:
            </span>
            {students.map((s, idx) => {
              const isActive = s.id === activeStudentId
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStudentId(s.id)}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium transition-colors'
                      : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
                  }
                >
                  {getStudentDisplayName(s, idx)}
                </button>
              )
            })}
            <button
              type="button"
              onClick={handleAddStudent}
              className="px-3 py-1.5 text-sm rounded-full border border-dashed border-stone-400 text-stone-600 font-medium hover:border-stone-500 hover:text-stone-800 transition-colors"
            >
              + Add student
            </button>
            {students.length > 1 && (
              <button
                type="button"
                onClick={handleDeleteStudent}
                className={
                  confirmingDeleteStudent
                    ? 'ml-auto px-3 py-1.5 text-sm rounded-full bg-brick-600 text-white font-medium transition-colors'
                    : 'ml-auto px-3 py-1.5 text-sm rounded-full border border-stone-300 text-stone-600 font-medium hover:border-brick-400 hover:text-brick-700 transition-colors'
                }
              >
                {confirmingDeleteStudent
                  ? 'Click again to confirm'
                  : 'Delete this student'}
              </button>
            )}
          </div>
        </section>

        {/* Student name */}
        <div className="mb-6">
          <label className="block">
            <span className="text-sm font-medium text-stone-700 block mb-2">
              Student name
            </span>
            <input
              type="text"
              value={activeStudent.studentName}
              onChange={(e) => handleStudentNameChange(e.target.value)}
              className="w-64 px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
              placeholder="e.g. Sam"
            />
          </label>
        </div>

        {/* Schedule format toggle */}
        <div className="mb-8 max-w-[720px]">
          <label className="text-sm font-medium text-stone-700 block mb-2">
            Schedule format
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'school-year' as const, label: 'School year' },
                { value: 'semesters' as const, label: 'Semesters' },
              ] as const
            ).map((opt) => {
              const selected = activeStudent.scheduleFormat === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleFormatChange(opt.value)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium'
                      : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                  }
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-stone-500">
            {activeStudent.scheduleFormat === 'school-year'
              ? 'One schedule for the whole school year.'
              : 'Separate schedules for Semester 1 and Semester 2. Useful when classes change mid-year.'}
          </p>
        </div>

        {/* School day start/end level picker — drives activity placement. */}
        <div className="mb-8 max-w-[720px]">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-1">
            When does the school day start and end?
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Used to sort activities into before-school, during-school, and
            after-school on the printed calendar.
          </p>
          <div className="flex flex-wrap gap-3">
            {MAIN_LEVELS.map((level) => {
              const selected = activeStudent.scheduleLevel === level.key
              return (
                <button
                  key={level.key}
                  type="button"
                  onClick={() => handleScheduleLevelChange(level.key)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'px-4 py-2 rounded-full border border-village-600 bg-village-600 text-white text-left transition-colors'
                      : 'px-4 py-2 rounded-full border border-stone-300 bg-white text-stone-700 text-left hover:border-stone-400 transition-colors'
                  }
                >
                  <div className="text-sm font-medium leading-tight">
                    {level.label}
                  </div>
                  <div
                    className={
                      selected
                        ? 'text-xs text-white/80 leading-tight'
                        : 'text-xs text-stone-500 leading-tight'
                    }
                  >
                    {level.timeLabel}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setPreschoolExpanded((v) => !v)}
              aria-expanded={preschoolExpanded}
              className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            >
              Preschool programs {preschoolExpanded ? '(hide)' : '(show)'}
            </button>
            {preschoolExpanded && (
              <div className="mt-3 flex flex-wrap gap-3">
                {PRESCHOOL_LEVELS.map((level) => {
                  const selected = activeStudent.scheduleLevel === level.key
                  return (
                    <button
                      key={level.key}
                      type="button"
                      onClick={() => handleScheduleLevelChange(level.key)}
                      aria-pressed={selected}
                      className={
                        selected
                          ? 'px-4 py-2 rounded-full border border-village-600 bg-village-600 text-white text-left transition-colors'
                          : 'px-4 py-2 rounded-full border border-stone-300 bg-white text-stone-700 text-left hover:border-stone-400 transition-colors'
                      }
                    >
                      <div className="text-sm font-medium leading-tight">
                        {level.label}
                      </div>
                      <div
                        className={
                          selected
                            ? 'text-xs text-white/80 leading-tight'
                            : 'text-xs text-stone-500 leading-tight'
                        }
                      >
                        {level.timeLabel}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Schedule blocks */}
        <div className="space-y-6 mb-8">
          {activeStudent.schedules.map((block, idx) => (
            <ScheduleBlockEditor
              key={block.id}
              block={block}
              collapsed={collapsedBlockIds.has(block.id)}
              onToggleCollapsed={() => toggleBlockCollapsed(block.id)}
              editingEntryId={editingEntryId}
              onSetEditingEntryId={setEditingEntryId}
              showCopyToS2={
                activeStudent.scheduleFormat === 'semesters' && idx === 0
              }
              onCopyToS2={handleCopyS1ToS2}
              onAddEntry={() => handleAddEntry(block.id)}
              onUpdateEntry={(entryId, patch) =>
                handleUpdateEntry(block.id, entryId, patch)
              }
              onDeleteEntry={(entryId) => handleDeleteEntry(block.id, entryId)}
            />
          ))}
        </div>

        {/* Activities section */}
        <ActivitiesSection
          activities={activeStudent.activities}
          collapsed={activitiesCollapsed}
          editingId={editingActivityId}
          schoolTimes={schoolTimes}
          onToggleCollapsed={() => setActivitiesCollapsed((v) => !v)}
          onAdd={handleAddActivity}
          onUpdate={handleUpdateActivity}
          onDelete={handleDeleteActivity}
          onSetEditingId={setEditingActivityId}
        />

        {/* Print controls. When there are no activities, we skip the date
            range entirely — the printout is a repeatable weekly template.
            For semester format, show a picker for which semester to print.
            When activities exist (activity system coming later), a date-range
            picker replaces the semester picker. */}
        <section className="mb-6 max-w-[720px]">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
            Print
          </h2>
          {(() => {
            const hasActivities = activeStudent.activities.length > 0

            if (!hasActivities) {
              const effectiveBlockId =
                activeStudent.schedules.find((b) => b.id === selectedBlockId)?.id ??
                activeStudent.schedules[0]?.id ??
                ''

              if (activeStudent.scheduleFormat === 'semesters') {
                return (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-stone-700 block mb-2">
                      Which semester do you want to print?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {activeStudent.schedules.map((b) => {
                        const selected = effectiveBlockId === b.id
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBlockId(b.id)}
                            aria-pressed={selected}
                            className={
                              selected
                                ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium'
                                : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                            }
                          >
                            {b.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return null
            }

            // Activities exist — date range picker
            return (
              <div className="mb-4 flex flex-wrap gap-3">
                <label className="block">
                  <span className="text-sm font-medium text-stone-700 block mb-1">
                    Start date
                  </span>
                  <input
                    type="date"
                    value={printStartDate}
                    onChange={(e) => setPrintStartDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700 block mb-1">
                    End date
                  </span>
                  <input
                    type="date"
                    value={printEndDate}
                    onChange={(e) => setPrintEndDate(e.target.value)}
                    className="px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
                  />
                </label>
              </div>
            )
          })()}

          {validationError && (
            <div className="mb-4 p-3 bg-brick-50 border border-brick-200 rounded-md text-sm text-brick-700">
              {validationError}
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-3">
            <button
              type="button"
              onClick={handleGenerate}
              className="px-5 py-2.5 bg-village-600 text-white font-medium rounded-md hover:bg-village-700 transition-colors"
            >
              Generate schedule
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!generated}
              className="px-5 py-2.5 bg-brick-600 text-white font-medium rounded-md hover:bg-brick-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              Print schedule
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={
                confirmingClear
                  ? 'px-5 py-2.5 bg-brick-600 text-white font-medium rounded-md hover:bg-brick-700 transition-colors'
                  : 'px-5 py-2.5 bg-white text-stone-700 font-medium rounded-md border border-stone-300 hover:bg-stone-50 transition-colors'
              }
            >
              {confirmingClear ? 'Click again to confirm' : 'Clear saved data'}
            </button>
          </div>

          <p className="text-sm text-stone-500">
            Screen view shows all details. Print may be condensed.
          </p>
        </section>
      </div>

      {/* Schedule preview — appears after Generate. print:block so it shows
          in the printout too. */}
      {generated && generated.type === 'template' && (
        <div className="print:block">
          <TemplatePrintHeader
            studentName={activeStudent.studentName}
            block={generated.block}
          />
          <TemplateWeekGrid timeSlots={generated.timeSlots} />
        </div>
      )}
      {generated && generated.type === 'range' && generated.weeks.length > 0 && (
        <div className="print:block">
          {generated.weeks.map((week, idx) => (
            <div
              key={week.weekStart}
              className="mb-8 print:mb-0 print:break-after-page last:print:break-after-auto"
            >
              {/* Show title once on screen, on every page for print */}
              <div className={idx === 0 ? '' : 'hidden print:block'}>
                <PrintHeader
                  studentName={activeStudent.studentName}
                  weekStart={week.weekStart}
                />
              </div>
              <WeekGrid week={week} activities={activeStudent.activities} schoolTimes={schoolTimes} />
            </div>
          ))}
        </div>
      )}
      {generated && generated.type === 'range' && generated.weeks.length === 0 && (
        <p className="text-sm text-stone-500 max-w-[720px]">
          No school days in the selected date range.
        </p>
      )}

      {/* Restore toast — fixed at the bottom of the viewport after a
          destructive action (currently only entry deletion). */}
      {undoSnapshot && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] print:hidden">
          <div className="bg-stone-900 border-4 border-amber-300 text-white rounded-md shadow-2xl px-4 py-3 flex items-center gap-4">
            <span className="text-sm flex-1">{undoSnapshot.label}</span>
            <button
              type="button"
              onClick={() => {
                undoSnapshot.restore()
                setUndoSnapshot(null)
              }}
              className="text-amber-300 text-sm font-medium underline hover:no-underline"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={() => setUndoSnapshot(null)}
              className="text-stone-400 hover:text-white text-lg leading-none"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Schedule block editor ─────────────────────────────────────────────────

function ScheduleBlockEditor({
  block,
  collapsed,
  onToggleCollapsed,
  editingEntryId,
  onSetEditingEntryId,
  showCopyToS2,
  onCopyToS2,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: {
  block: ScheduleBlock
  collapsed: boolean
  onToggleCollapsed: () => void
  editingEntryId: string | null
  onSetEditingEntryId: (id: string | null) => void
  showCopyToS2: boolean
  onCopyToS2: () => void
  onAddEntry: () => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
}) {
  // Format block date range as read-only subtitle: "Aug 4, 2026 – May 26, 2027"
  const dateRangeLabel = (() => {
    if (!block.startDate || !block.endDate) return ''
    const s = makeDate(block.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    const e = makeDate(block.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${s} – ${e}`
  })()

  return (
    <section className="border border-stone-300 rounded-md p-4 bg-white max-w-[720px]">
      <div className="mb-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            {block.name}
          </h2>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
          {showCopyToS2 && block.entries.length > 0 && !collapsed && (
            <button
              type="button"
              onClick={onCopyToS2}
              className="ml-auto text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            >
              Copy to Semester 2
            </button>
          )}
        </div>
        {dateRangeLabel && (
          <p className="text-sm text-stone-500 mt-1">{dateRangeLabel}</p>
        )}
      </div>

      {!collapsed && (
        <>
          {block.entries.length === 0 && (
            <p className="text-sm text-stone-500 mb-3">
              No classes or periods added yet.
            </p>
          )}

          <div className="space-y-2 mb-3">
            {block.entries.map((entry) => {
              const isEditing = editingEntryId === entry.id
              return isEditing ? (
                <EntryEditor
                  key={entry.id}
                  entry={entry}
                  onUpdate={(patch) => onUpdateEntry(entry.id, patch)}
                  onDelete={() => onDeleteEntry(entry.id)}
                  onDone={() => onSetEditingEntryId(null)}
                />
              ) : (
                <EntrySummary
                  key={entry.id}
                  entry={entry}
                  onEdit={() => onSetEditingEntryId(entry.id)}
                  onDelete={() => onDeleteEntry(entry.id)}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={onAddEntry}
            className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
          >
            + Add class or period
          </button>
        </>
      )}
    </section>
  )
}

// ─── Entry summary (compact display when not editing) ─────────────────────

function EntrySummary({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry
  onEdit: () => void
  onDelete: () => void
}) {
  const label = entry.label.trim() || 'Untitled'
  const days = formatDaysCompact(entry.daysOfWeek)
  const timeRange =
    entry.startTime && entry.endTime
      ? `${formatTime12h(entry.startTime)} – ${formatTime12h(entry.endTime)}`
      : entry.startTime
        ? formatTime12h(entry.startTime)
        : 'No time set'
  const details = [days, timeRange, entry.teacher.trim(), entry.room.trim()]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-stone-200 rounded-md bg-white">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-stone-900 truncate">
          {label}
        </div>
        <div className="text-xs text-stone-600 truncate">{details}</div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-brick-600 hover:text-brick-700 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-500 hover:text-stone-900"
          aria-label={`Remove ${label}`}
          title={`Remove ${label}`}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── Entry editor ──────────────────────────────────────────────────────────

function EntryEditor({
  entry,
  onUpdate,
  onDelete,
  onDone,
}: {
  entry: Entry
  onUpdate: (patch: Partial<Entry>) => void
  onDelete: () => void
  onDone: () => void
}) {
  const toggleDay = (jsDay: number) => {
    const next = entry.daysOfWeek.includes(jsDay)
      ? entry.daysOfWeek.filter((d) => d !== jsDay)
      : [...entry.daysOfWeek, jsDay].sort()
    onUpdate({ daysOfWeek: next })
  }

  return (
    <div className="border border-stone-200 rounded-md p-3 bg-stone-50">
      <div className="flex flex-wrap gap-3 items-end mb-3">
        <label className="block flex-1 min-w-[180px]">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Class or period
          </span>
          <input
            type="text"
            value={entry.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="e.g. Social Studies, Lunch, Recess"
            className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Start
          </span>
          <input
            type="time"
            value={entry.startTime}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
            className="px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            End
          </span>
          <input
            type="time"
            value={entry.endTime}
            onChange={(e) => onUpdate({ endTime: e.target.value })}
            className="px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3 items-end mb-3">
        <label className="block flex-1 min-w-[140px]">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Teacher (optional)
          </span>
          <input
            type="text"
            value={entry.teacher}
            onChange={(e) => onUpdate({ teacher: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Room (optional)
          </span>
          <input
            type="text"
            value={entry.room}
            onChange={(e) => onUpdate({ room: e.target.value })}
            className="w-32 px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
      </div>

      <div className="mb-3">
        <span className="text-xs font-medium text-stone-700 block mb-1">
          Days of week
        </span>
        <div className="flex flex-wrap gap-1">
          {([1, 2, 3, 4, 5] as const).map((jsDay) => {
            const selected = entry.daysOfWeek.includes(jsDay)
            return (
              <button
                key={jsDay}
                type="button"
                onClick={() => toggleDay(jsDay)}
                aria-pressed={selected}
                className={
                  selected
                    ? 'px-2.5 py-1 text-xs rounded-full border border-village-600 bg-village-600 text-white font-medium'
                    : 'px-2.5 py-1 text-xs rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                }
              >
                {WEEKDAYS[jsDay]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
        >
          Remove class
        </button>
        <button
          type="button"
          onClick={onDone}
          className="px-3 py-1.5 text-sm rounded-md bg-village-600 text-white font-medium hover:bg-village-700"
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ─── Print header ──────────────────────────────────────────────────────────

/** Header shown above each week — student name only. Dates are in the
 *  column headers, not the title bar. */
function PrintHeader({
  studentName,
}: {
  studentName: string
  weekStart: string // still passed for signature compatibility; unused
}) {
  const title = studentName.trim()
    ? `${studentName.trim()}'s Schedule`
    : 'Schedule'
  return (
    <div className="mb-3 pb-2 border-b border-stone-300 print:mb-2 print:pb-0 print:border-b-0">
      <h3 className="font-display text-3xl font-bold text-stone-900">
        {title}
      </h3>
    </div>
  )
}

// ─── Weekly grid ───────────────────────────────────────────────────────────

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

function getMonthShort(dateKey: string): string {
  return makeDate(dateKey)
    .toLocaleDateString('en-US', { month: 'short' })
    .toUpperCase()
}

function getDayNum(dateKey: string): string {
  return String(makeDate(dateKey).getDate())
}

/** Format a "HH:MM" time as compact "H:MM" — no AM/PM to save horizontal space. */
function formatTimeCompact(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (isNaN(h) || isNaN(m)) return time
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${displayH}:${String(m).padStart(2, '0')}`
}

function WeekGrid({
  week,
  activities,
  schoolTimes,
}: {
  week: GeneratedWeek
  activities: Activity[]
  schoolTimes: { start: string; end: string }
}) {
  // Bucket each day's activities. Out-of-range days get empty buckets.
  const emptyBuckets = { before: [], inline: [], after: [] } as {
    before: Activity[]
    inline: Activity[]
    after: Activity[]
  }
  const placementByDay = week.days.map((day) =>
    day.isInRange
      ? activitiesByPlacement(day.dateKey, activities, schoolTimes)
      : emptyBuckets
  )
  const hasBefore = placementByDay.some((p) => p.before.length > 0)
  const hasInline = placementByDay.some((p) => p.inline.length > 0)
  const hasAfter = placementByDay.some((p) => p.after.length > 0)

  // Weekend in-range check.
  const satKey = toDateKey(addDays(makeDate(week.weekStart), 5))
  const sunKey = toDateKey(addDays(makeDate(week.weekStart), 6))
  const satInRange = satKey >= week.printStart && satKey <= week.printEnd
  const sunInRange = sunKey >= week.printStart && sunKey <= week.printEnd
  const satActivities = satInRange ? activitiesForDateKey(satKey, activities) : []
  const sunActivities = sunInRange ? activitiesForDateKey(sunKey, activities) : []
  const hasWeekend = satInRange || sunInRange

  /** Discrete tier for class-row height in print. When there's more activity
   *  content taking up space above/below, class rows shrink to fit. */
  const maxRowLines = Math.max(
    ...placementByDay.map((p) => p.before.length),
    ...placementByDay.map((p) => p.inline.length),
    ...placementByDay.map((p) => p.after.length),
    satActivities.length,
    sunActivities.length,
    0
  )
  /** Discrete tier for class-row height in print. Combines two dimensions:
   *  activity density (how many activities in the busiest row) and class row
   *  count (Kindergarten has fewer rows than Middle School). More content
   *  either way → smaller rows so the whole schedule still fits on one page. */
  const classRowCount = week.timeSlots.length
  const noActivities = maxRowLines === 0
  const rowHeightClass = (() => {
    // Dense activities always win — content-driven.
    if (maxRowLines >= 3) return 'print:h-auto'
    // 2D matrix: class row count × activity density.
    if (classRowCount <= 4) return noActivities ? 'print:h-32' : 'print:h-16'
    if (classRowCount <= 6) return noActivities ? 'print:h-20' : 'print:h-14'
    if (classRowCount <= 8) return noActivities ? 'print:h-16' : 'print:h-12'
    if (classRowCount <= 10) return noActivities ? 'print:h-14' : 'print:h-10'
    return noActivities ? 'print:h-12' : 'print:h-10'
  })()

  /** Height for activity + weekend rows. Kept smaller than class rows so
   *  they don't visually dominate a short schedule (like 3-period
   *  Kindergarten). When activities are dense (3+), let them size to
   *  content — they need the space. */
  const activityRowHeightClass = (() => {
    if (maxRowLines >= 3) return ''
    if (classRowCount <= 4) return 'print:h-14'
    if (classRowCount <= 6) return 'print:h-12'
    return ''
  })()

  /** Group consecutive in-range blocked days that share the same break label
   *  so we can render a single horizontally-merged cell across the class
   *  rows for the whole break (e.g. Wed-Fri Thanksgiving = one cell). */
  type BlockedGroup = { startIdx: number; length: number; label: string }
  const blockedGroups: BlockedGroup[] = []
  {
    let i = 0
    while (i < 5) {
      const day = week.days[i]
      if (day.isInRange && day.isBlocked) {
        const label = day.blockedLabel ?? ''
        let end = i + 1
        while (end < 5) {
          const next = week.days[end]
          if (
            !next.isInRange ||
            !next.isBlocked ||
            (next.blockedLabel ?? '') !== label
          )
            break
          end++
        }
        blockedGroups.push({ startIdx: i, length: end - i, label })
        i = end
      } else {
        i++
      }
    }
  }
  const groupByDay: (BlockedGroup | null)[] = new Array(5).fill(null)
  for (const g of blockedGroups) {
    for (let d = g.startIdx; d < g.startIdx + g.length; d++) {
      groupByDay[d] = g
    }
  }

  // Skip the entire week if nothing in it is in range.
  const anyDayInRange = week.days.some((d) => d.isInRange)
  if (!anyDayInRange && !hasWeekend) return null

  // Row count for merging blocked days across time-slot rows.
  const rowCount = Math.max(1, week.timeSlots.length)

  return (
    <div>
      <table className="w-full text-sm print:text-xs border border-stone-300 border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '15%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
          <col style={{ width: '17%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className="p-2 print:p-1 text-center align-bottom text-stone-700 font-semibold border border-stone-300 bg-stone-50">
              Time
            </th>
            {WEEKDAY_HEADERS.map((weekday, i) => {
              const day = week.days[i]
              if (!day.isInRange) {
                return <th key={i} />
              }
              return (
                <th
                  key={i}
                  className="p-2 print:p-1 text-center align-bottom border border-stone-300 bg-stone-50"
                >
                  <div className="text-[10px] uppercase tracking-wide text-stone-500 leading-none">
                    {getMonthShort(day.dateKey)}
                  </div>
                  <div className="font-display text-3xl print:text-2xl font-semibold text-stone-900 leading-none mt-0.5 print:mt-0">
                    {getDayNum(day.dateKey)}
                  </div>
                  <div className="text-sm print:text-xs font-medium text-stone-900 mt-1 print:mt-0.5 leading-tight">
                    {weekday}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {/* Before-school row */}
          {hasBefore && (
            <tr className={`min-h-[3rem] ${activityRowHeightClass}`}>
              <td className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-center border border-stone-300 bg-stone-50">
                <div className="text-xs print:text-[10px] uppercase tracking-wide text-stone-600 font-medium">
                  Before school
                </div>
              </td>
              {week.days.map((day, slot) => {
                if (!day.isInRange) {
                  return (
                    <td
                      key={slot}
                      className="p-2 border-y border-stone-300"
                    />
                  )
                }
                const list = placementByDay[slot]?.before ?? []
                return (
                  <td
                    key={slot}
                    className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-left border border-stone-300"
                  >
                    {list.length > 0 && (
                      <ul className="space-y-0.5 print:space-y-0 text-left print:leading-tight">
                        {list.map((a, idx) => (
                          <li
                            key={a.id}
                            className={`text-[0.6875rem] print:text-[0.625rem] text-stone-800 leading-tight break-words print:line-clamp-1 ${
                              idx >= CAP_BEFORE ? 'print:hidden' : ''
                            }`}
                          >
                            <span className="tabular-nums font-semibold">
                              {formatTimeCompact(a.startTime)}
                            </span>{' '}
                            {a.name}
                            {a.location.trim() && (
                              <span className="text-stone-500 print:hidden">
                                {' · '}
                                {a.location.trim()}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                )
              })}
            </tr>
          )}

          {/* During-school row — activities that start during school hours
              but aren't tied to a specific class time. Renders after
              Before-school and before the first time-slot row so parents
              see all non-class events grouped at the top. */}
          {hasInline && (
            <tr className={`min-h-[3rem] ${activityRowHeightClass}`}>
              <td className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-center border border-stone-300 bg-stone-50">
                <div className="text-xs print:text-[10px] uppercase tracking-wide text-stone-600 font-medium">
                  During school
                </div>
              </td>
              {week.days.map((day, slot) => {
                if (!day.isInRange) {
                  return (
                    <td
                      key={slot}
                      className="p-2 border-y border-stone-300"
                    />
                  )
                }
                const list = placementByDay[slot]?.inline ?? []
                return (
                  <td
                    key={slot}
                    className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-left border border-stone-300"
                  >
                    {list.length > 0 && (
                      <ul className="space-y-0.5 print:space-y-0 text-left print:leading-tight">
                        {list.map((a, idx) => (
                          <li
                            key={a.id}
                            className={`text-[0.6875rem] print:text-[0.625rem] text-stone-800 leading-tight break-words print:line-clamp-1 ${
                              idx >= CAP_INLINE ? 'print:hidden' : ''
                            }`}
                          >
                            <span className="tabular-nums font-semibold">
                              {formatTimeCompact(a.startTime)}
                            </span>{' '}
                            {a.name}
                            {a.location.trim() && (
                              <span className="text-stone-500 print:hidden">
                                {' · '}
                                {a.location.trim()}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                )
              })}
            </tr>
          )}

          {week.timeSlots.length === 0 &&
            (() => {
              const inRangeDays = week.days.filter((d) => d.isInRange)
              const allBlocked =
                inRangeDays.length > 0 &&
                inRangeDays.every((d) => d.isBlocked)
              const label = allBlocked ? inRangeDays[0]?.blockedLabel : ''
              return (
                <tr>
                  {label ? (
                    <td
                      colSpan={6}
                      className="h-48 p-4 text-center align-middle text-stone-700 text-base font-medium border border-stone-300 bg-stone-50"
                    >
                      {label}
                    </td>
                  ) : (
                    <td
                      colSpan={6}
                      className="p-4 text-center text-stone-500 text-base border border-stone-300"
                    >
                      No classes scheduled this week.
                    </td>
                  )}
                </tr>
              )
            })()}
          {week.timeSlots.map((slot, rowIdx) => (
            <tr key={rowIdx} className={`h-12 ${rowHeightClass}`}>
              <td className="p-2 print:p-1.5 align-top print:align-middle text-center border border-stone-300">
                <div className="text-xs print:text-[10px] text-stone-700 leading-tight tabular-nums">
                  {formatTimeCompact(slot.startTime)}–{formatTimeCompact(slot.endTime)}
                </div>
              </td>
              {week.days.map((day, dayIdx) => {
                // Out-of-range day: blank cell per row (not merged) so
                // horizontal borders show between each time-slot row.
                if (!day.isInRange) {
                  return (
                    <td
                      key={dayIdx}
                      className="p-2 border-y border-stone-300"
                    />
                  )
                }
                // Blocked day: render one merged cell per group of
                // consecutive blocked days (colSpan across the group,
                // rowSpan across all class rows). Only render on the very
                // first row and only for the day at the start of the group.
                if (day.isBlocked) {
                  const group = groupByDay[dayIdx]
                  if (!group) return null
                  if (rowIdx !== 0 || dayIdx !== group.startIdx) return null
                  return (
                    <td
                      key={dayIdx}
                      colSpan={group.length}
                      rowSpan={rowCount}
                      className="p-3 print:p-2 align-middle text-center border border-stone-300 bg-stone-50"
                    >
                      {group.label && (
                        <div className="text-base font-medium text-stone-700">
                          {group.label}
                        </div>
                      )}
                    </td>
                  )
                }
                const entry = slot.entriesByDay[dayIdx]
                return (
                  <td
                    key={dayIdx}
                    className="p-2 print:p-1.5 align-top print:align-middle text-left border border-stone-300"
                  >
                    {entry && (
                      <>
                        <div className="font-medium text-stone-900 break-words leading-tight print:line-clamp-1">
                          {entry.label}
                        </div>
                        {(entry.teacher || entry.room) && (
                          <div className="text-xs text-stone-500 mt-0.5 break-words leading-tight print:hidden">
                            {entry.teacher}
                            {entry.teacher && entry.room ? ' · ' : ''}
                            {entry.room}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}

          {/* After-school row */}
          {hasAfter && (
            <tr className={`min-h-[3rem] ${activityRowHeightClass}`}>
              <td className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-center border border-stone-300 bg-stone-50">
                <div className="text-xs print:text-[10px] uppercase tracking-wide text-stone-600 font-medium">
                  After school
                </div>
              </td>
              {week.days.map((day, slot) => {
                if (!day.isInRange) {
                  return (
                    <td
                      key={slot}
                      className="p-2 border-y border-stone-300"
                    />
                  )
                }
                const list = placementByDay[slot]?.after ?? []
                return (
                  <td
                    key={slot}
                    className="p-2 print:py-1 print:px-1.5 align-top print:align-middle text-left border border-stone-300"
                  >
                    {list.length > 0 && (
                      <ul className="space-y-0.5 print:space-y-0 text-left print:leading-tight">
                        {list.map((a, idx) => (
                          <li
                            key={a.id}
                            className={`text-[0.6875rem] print:text-[0.625rem] text-stone-800 leading-tight break-words print:line-clamp-1 ${
                              idx >= CAP_AFTER ? 'print:hidden' : ''
                            }`}
                          >
                            <span className="tabular-nums font-semibold">
                              {formatTimeCompact(a.startTime)}
                            </span>{' '}
                            {a.name}
                            {a.location.trim() && (
                              <span className="text-stone-500 print:hidden">
                                {' · '}
                                {a.location.trim()}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                )
              })}
            </tr>
          )}
        </tbody>
      </table>

      {/* Weekend section — only shows Sat/Sun that are in range. */}
      {hasWeekend && (
        <table className="w-full text-sm print:text-xs border border-stone-300 border-collapse table-fixed mt-2 print:mt-0.5 print:break-inside-avoid">
          <colgroup>
            {satInRange && <col style={{ width: '15%' }} />}
            {satInRange && <col style={{ width: sunInRange ? '34%' : '85%' }} />}
            {sunInRange && <col style={{ width: satInRange ? '17%' : '15%' }} />}
            {sunInRange && <col style={{ width: satInRange ? '34%' : '85%' }} />}
          </colgroup>
          <tbody>
            <tr className={activityRowHeightClass}>
              {(
                [
                  { key: satKey, weekday: 'Sat', list: satActivities, inRange: satInRange },
                  { key: sunKey, weekday: 'Sun', list: sunActivities, inRange: sunInRange },
                ] as const
              )
                .filter((d) => d.inRange)
                .map(({ key, weekday, list }) => (
                  <Fragment key={weekday}>
                    <td className="p-1.5 print:p-1.5 align-middle text-center border border-stone-300 bg-stone-50">
                      <div className="text-sm font-semibold text-stone-900 whitespace-nowrap">
                        {weekday} · <span className="uppercase">{getMonthShort(key)}</span> {getDayNum(key)}
                      </div>
                    </td>
                    <td className="p-1.5 print:p-1.5 align-middle text-left border border-stone-300">
                      {list.length > 0 ? (
                        <ul className="space-y-0.5 print:space-y-0 print:leading-tight">
                          {list.map((a, idx) => (
                            <li
                              key={a.id}
                              className={`text-[0.6875rem] print:text-[0.625rem] text-stone-800 leading-tight break-words print:line-clamp-1 ${
                                idx >= CAP_WEEKEND ? 'print:hidden' : ''
                              }`}
                            >
                              <span className="tabular-nums font-semibold">
                                {formatTimeCompact(a.startTime)}
                              </span>{' '}
                              {a.name}
                              {a.location.trim() && (
                                <span className="text-stone-500 print:hidden">
                                  {' · '}
                                  {a.location.trim()}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[10px] text-stone-400 italic">
                          No activities
                        </div>
                      )}
                    </td>
                  </Fragment>
                ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── Template print header ────────────────────────────────────────────────

/** Header for template mode — student name only. */
function TemplatePrintHeader({
  studentName,
}: {
  studentName: string
  block: ScheduleBlock // still passed for signature compatibility; unused
}) {
  const title = studentName.trim()
    ? `${studentName.trim()}'s Weekly Schedule`
    : 'Weekly Schedule'
  return (
    <div className="mb-3 pb-2 border-b border-stone-300 print:mb-2 print:pb-0 print:border-b-0">
      <h3 className="font-display text-3xl font-bold text-stone-900">
        {title}
      </h3>
    </div>
  )
}

// ─── Template weekly grid (Mon-Fri columns, no dates) ─────────────────────

const WEEKDAY_HEADERS_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const

function TemplateWeekGrid({ timeSlots }: { timeSlots: TimeSlot[] }) {
  return (
    <table className="w-full text-sm print:text-xs border border-stone-300 border-collapse table-fixed">
      <colgroup>
        <col style={{ width: '15%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
        <col style={{ width: '17%' }} />
      </colgroup>
      <thead>
        <tr>
          <th className="p-2 text-center align-middle text-stone-700 font-semibold border border-stone-300 bg-stone-50">
            Time
          </th>
          {WEEKDAY_HEADERS_FULL.map((weekday) => (
            <th
              key={weekday}
              className="p-2 print:p-1 text-center align-middle border border-stone-300 bg-stone-50"
            >
              <div className="text-sm print:text-xs font-medium text-stone-900">
                {weekday}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {timeSlots.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className="p-4 text-center text-stone-500 text-sm border border-stone-300"
            >
              No classes scheduled.
            </td>
          </tr>
        )}
        {timeSlots.map((slot, rowIdx) => (
          <tr key={rowIdx} className="h-16 print:h-14">
            <td className="p-2 print:p-1.5 align-top print:align-middle text-center border border-stone-300">
              <div className="text-xs print:text-[10px] text-stone-700 leading-tight tabular-nums">
                {formatTimeCompact(slot.startTime)}–{formatTimeCompact(slot.endTime)}
              </div>
            </td>
            {slot.entriesByDay.map((entry, dayIdx) => (
              <td
                key={dayIdx}
                className="p-2 print:p-1.5 align-top print:align-middle text-left border border-stone-300"
              >
                {entry && (
                  <>
                    <div className="font-medium text-stone-900 break-words leading-tight print:line-clamp-1">
                      {entry.label}
                    </div>
                    {(entry.teacher || entry.room) && (
                      <div className="text-xs print:text-[10px] text-stone-500 mt-0.5 break-words leading-tight">
                        {entry.teacher}
                        {entry.teacher && entry.room ? ' · ' : ''}
                        {entry.room}
                      </div>
                    )}
                  </>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Activities section ────────────────────────────────────────────────────

function ActivitiesSection({
  activities,
  collapsed,
  editingId,
  schoolTimes,
  onToggleCollapsed,
  onAdd,
  onUpdate,
  onDelete,
  onSetEditingId,
}: {
  activities: Activity[]
  collapsed: boolean
  editingId: string | null
  schoolTimes: { start: string; end: string }
  onToggleCollapsed: () => void
  onAdd: () => void
  onUpdate: (id: string, patch: Partial<Activity>) => void
  onDelete: (id: string) => void
  onSetEditingId: (id: string | null) => void
}) {
  // Activities that would be dropped from print on at least one date.
  const wontFitSet = useMemo(
    () => getActivitiesThatWontFit(activities, schoolTimes),
    [activities, schoolTimes]
  )

  return (
    <section className="mb-8 border border-stone-300 rounded-md p-4 bg-white max-w-[720px] print:hidden">
      <div className="mb-3">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h2 className="font-display text-xl font-semibold text-stone-900">
            Activities
          </h2>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        </div>
        <p className="text-sm text-stone-500 mt-1">
          Optional. Add clubs, sports, private lessons, etc.
        </p>
      </div>

      {!collapsed && (
        <>
          <div className="text-sm text-stone-500 mb-4">
            <p>You can add the following number of activities per day:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Up to {CAP_BEFORE} before school</li>
              <li>{CAP_INLINE} during school</li>
              <li>Up to {CAP_AFTER} after school</li>
              <li>Up to {CAP_WEEKEND} on each Saturday or Sunday</li>
            </ul>
          </div>

          <div className="space-y-2">
            {activities.length === 0 && (
              <p className="text-sm text-stone-600 mb-2">
                No activities yet. Add one to include it on the printed
                schedule.
              </p>
            )}
            {(editingId
              ? activities
              : [...activities].sort((a, b) =>
                  a.name.toLowerCase().localeCompare(b.name.toLowerCase())
                )
            ).map((activity) => {
              const isEditing = editingId === activity.id
              return isEditing ? (
                <ActivityEditor
                  key={activity.id}
                  activity={activity}
                  otherActivities={activities.filter((a) => a.id !== activity.id)}
                  schoolTimes={schoolTimes}
                  onChange={(patch) => onUpdate(activity.id, patch)}
                  onClose={() => onSetEditingId(null)}
                  onDelete={() => onDelete(activity.id)}
                />
              ) : (
                <ActivitySummary
                  key={activity.id}
                  activity={activity}
                  hasWarning={wontFitSet.has(activity.id)}
                  onEdit={() => onSetEditingId(activity.id)}
                  onDelete={() => onDelete(activity.id)}
                />
              )
            })}

            <button
              type="button"
              onClick={onAdd}
              className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium mt-2"
            >
              + Add activity
            </button>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Activity summary (compact row when not editing) ───────────────────────

function ActivitySummary({
  activity,
  hasWarning,
  onEdit,
  onDelete,
}: {
  activity: Activity
  hasWarning: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const name = activity.name.trim() || 'Untitled activity'
  const days = formatDaysOfWeek(activity.daysOfWeek)
  const time = activity.startTime
    ? formatTime12h(activity.startTime)
    : 'No time set'
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-stone-200 rounded-md bg-white">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-stone-900 truncate">
          {name}
        </div>
        <div className="text-xs text-stone-600 truncate">
          {days} · {time}
          {activity.location.trim() && ` · ${activity.location.trim()}`}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {hasWarning && (
          <span
            className="text-amber-600 text-base leading-none"
            title="May not fit on the printed calendar on some dates"
            aria-label="Warning: may not fit on printed calendar"
          >
            ⚠
          </span>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="text-sm text-brick-600 hover:text-brick-700 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-500 hover:text-stone-900"
          aria-label={`Remove ${name}`}
          title={`Remove ${name}`}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

// ─── Activity editor ───────────────────────────────────────────────────────

function ActivityEditor({
  activity,
  otherActivities,
  schoolTimes,
  onChange,
  onClose,
  onDelete,
}: {
  activity: Activity
  otherActivities: Activity[]
  schoolTimes: { start: string; end: string }
  onChange: (patch: Partial<Activity>) => void
  onClose: () => void
  onDelete: () => void
}) {
  // Reveal Sat/Sun pills when either is already selected, or on demand.
  const [includeWeekends, setIncludeWeekends] = useState(
    activity.daysOfWeek.includes(0) || activity.daysOfWeek.includes(6)
  )

  // Live-validate against per-placement caps.
  const validation = useMemo(
    () => checkActivityDailyLimit(activity, otherActivities, schoolTimes),
    [activity, otherActivities, schoolTimes]
  )

  const weekdayPills: Array<{ num: number; label: string }> = [
    { num: 1, label: 'Mon' },
    { num: 2, label: 'Tue' },
    { num: 3, label: 'Wed' },
    { num: 4, label: 'Thu' },
    { num: 5, label: 'Fri' },
  ]
  const weekendPills: Array<{ num: number; label: string }> = [
    { num: 6, label: 'Sat' },
    { num: 0, label: 'Sun' },
  ]

  const hasWeekendSelected =
    activity.daysOfWeek.includes(0) || activity.daysOfWeek.includes(6)
  const showWeekendConflictNote = hasWeekendSelected && activity.schoolDaysOnly

  const toggleDay = (jsDay: number) => {
    const next = activity.daysOfWeek.includes(jsDay)
      ? activity.daysOfWeek.filter((d) => d !== jsDay)
      : [...activity.daysOfWeek, jsDay].sort((a, b) => a - b)
    onChange({ daysOfWeek: next })
  }

  const inputClass =
    'w-full min-w-0 px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none'
  const labelClass =
    'text-xs uppercase tracking-widest font-medium text-stone-700 mb-1 block'

  return (
    <div className="border border-village-200 rounded-md p-4 bg-village-50/40 space-y-3">
      {/* Activity name */}
      <label className="block">
        <span className={labelClass}>Activity name</span>
        <input
          type="text"
          value={activity.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Piano lesson, soccer practice, tutoring"
          className={inputClass}
        />
      </label>

      {/* Days of week */}
      <div>
        <span className={labelClass}>Days of week</span>
        <div className="flex flex-wrap gap-2">
          {weekdayPills.map((d) => {
            const selected = activity.daysOfWeek.includes(d.num)
            return (
              <button
                key={d.num}
                type="button"
                onClick={() => toggleDay(d.num)}
                aria-pressed={selected}
                className={
                  selected
                    ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium'
                    : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                }
              >
                {d.label}
              </button>
            )
          })}
          {includeWeekends &&
            weekendPills.map((d) => {
              const selected = activity.daysOfWeek.includes(d.num)
              return (
                <button
                  key={d.num}
                  type="button"
                  onClick={() => toggleDay(d.num)}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium'
                      : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                  }
                >
                  {d.label}
                </button>
              )
            })}
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !includeWeekends
            setIncludeWeekends(next)
            // When hiding, strip Sat/Sun from selected days
            if (!next) {
              onChange({
                daysOfWeek: activity.daysOfWeek.filter(
                  (d) => d !== 0 && d !== 6
                ),
              })
            }
          }}
          className="mt-2 text-xs text-brick-600 hover:text-brick-700 hover:underline font-medium"
        >
          {includeWeekends ? 'Hide weekends' : 'Show weekends'}
        </button>
      </div>

      {/* Times */}
      <div className="flex flex-wrap gap-3">
        <label className="block">
          <span className={labelClass}>Start time</span>
          <input
            type="time"
            value={activity.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className="px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className={labelClass}>End time (optional)</span>
          <input
            type="time"
            value={activity.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className="px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
      </div>

      {/* Date range */}
      <div className="flex flex-wrap gap-3">
        <label className="block">
          <span className={labelClass}>Start date</span>
          <input
            type="date"
            value={activity.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className={labelClass}>End date</span>
          <input
            type="date"
            value={activity.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
      </div>

      {/* Location */}
      <label className="block">
        <span className={labelClass}>Location (optional)</span>
        <input
          type="text"
          value={activity.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="e.g. Music studio, soccer field, tutoring center"
          className={inputClass}
        />
      </label>

      {/* When should this activity appear on the calendar? */}
      <div>
        <span className={labelClass}>
          When should this activity appear on the calendar?
        </span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              {
                value: true,
                label: 'School days only',
                example: 'e.g., school clubs',
              },
              {
                value: false,
                label: 'School days and no-school days',
                example:
                  'e.g., private lessons, practice sessions, community programs',
              },
            ] as const
          ).map((opt) => {
            const selected = activity.schoolDaysOnly === opt.value
            return (
              <div key={String(opt.value)}>
                <button
                  type="button"
                  onClick={() => onChange({ schoolDaysOnly: opt.value })}
                  aria-pressed={selected}
                  className={
                    selected
                      ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium'
                      : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400'
                  }
                >
                  {opt.label}
                </button>
                <p className="mt-1 ml-3 text-xs text-stone-500">
                  {opt.example}
                </p>
              </div>
            )
          })}
        </div>
        {showWeekendConflictNote && (
          <p className="mt-2 text-xs text-brick-700">
            Saturday/Sunday activities won't appear while "School days only" is
            selected. Switch to "School days and no-school days" to include
            weekend dates.
          </p>
        )}
      </div>

      {validation.message && (
        <p className="mb-1 px-3 py-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
          {validation.message}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
        >
          Remove activity
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={!validation.valid}
          className="px-3 py-1.5 text-sm rounded-md bg-village-600 text-white font-medium hover:bg-village-700 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:hover:bg-stone-300"
        >
          Done
        </button>
      </div>
    </div>
  )
}
