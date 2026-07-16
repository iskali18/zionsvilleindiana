'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  type CourseSlot,
  type DaySchedule,
  type LunchOption,
  type ScheduleRow,
  type SemesterSchedule,
  addDays,
  buildGreenSilverMap,
  emptyCourses,
  generateScheduleRange,
  makeDate,
  PERIOD_TIMES_SHORT,
  SEMESTERS,
  SCHOOL_YEAR_START,
  SCHOOL_YEAR_END,
  toDateKey,
} from '@/lib/zchs-schedule'

const STORAGE_KEY = 'zchs-schedule-v1'
const DATE_STORAGE_KEY = 'zchs-schedule-dates-v1'
const COLLAPSE_STORAGE_KEY = 'zchs-schedule-collapse-v1'

type Preset = 'this-week' | 'next-week' | 'custom'

const PRESET_LABELS: Record<Preset, string> = {
  'this-week': 'This week',
  'next-week': 'Next week',
  custom: 'Custom range',
}

/** Compute date range for a preset based on today's date. */
function computePresetDates(preset: Preset): { start: string; end: string } | null {
  const now = new Date()

  if (preset === 'this-week') {
    // Sun–Sat week containing today
    const day = now.getDay() // 0 = Sun ... 6 = Sat
    const sunday = addDays(now, -day)
    const saturday = addDays(sunday, 6)
    return { start: toDateKey(sunday), end: toDateKey(saturday) }
  }

  if (preset === 'next-week') {
    // Sun–Sat week starting the Sunday after this week's Saturday
    const day = now.getDay()
    const nextSunday = addDays(now, 7 - day)
    const nextSaturday = addDays(nextSunday, 6)
    return { start: toDateKey(nextSunday), end: toDateKey(nextSaturday) }
  }

  return null // 'custom' — caller uses manually entered dates
}

/** Check if a preset produces a range that overlaps the school year. */
function isPresetAvailable(preset: Preset): boolean {
  if (preset === 'custom') return true
  const dates = computePresetDates(preset)
  if (!dates) return false
  return dates.end >= SCHOOL_YEAR_START && dates.start <= SCHOOL_YEAR_END
}

/** Tooltip message shown on hover when a preset button is disabled. */
function getPresetTooltip(preset: Preset): string | undefined {
  if (preset === 'custom') return undefined
  const dates = computePresetDates(preset)
  if (!dates) return undefined
  if (dates.end < SCHOOL_YEAR_START) {
    if (preset === 'this-week') return 'Available starting Sunday, August 2, 2026'
    if (preset === 'next-week') return 'Available starting Sunday, July 26, 2026'
  }
  if (dates.start > SCHOOL_YEAR_END) {
    return 'The 2026–2027 school year has ended'
  }
  return undefined
}

function formatFullDate(dateKey: string): string {
  if (!dateKey) return ''
  const d = makeDate(dateKey)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Multi-student support ──────────────────────────────────────────────────

interface Activity {
  id: string
  name: string
  startTime: string // "HH:MM" 24-hour, may be empty (user hasn't typed yet)
  endTime: string // "HH:MM" 24-hour, optional
  daysOfWeek: number[] // 0=Sun, 1=Mon, … 6=Sat (matches Date.getDay())
  startDate: string // "YYYY-MM-DD", falls back to school year start
  endDate: string // "YYYY-MM-DD", falls back to school year end
  location: string
  schoolDaysOnly: boolean // when true, hide on breaks/holidays/no-school days
}

interface Student {
  id: string
  studentName: string
  semester1: SemesterSchedule
  semester2: SemesterSchedule
  activities: Activity[]
}

function generateStudentId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function generateActivityId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `a-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function createEmptyStudent(): Student {
  return {
    id: generateStudentId(),
    ...emptyCourses(),
    activities: [],
  }
}

function createEmptyActivity(): Activity {
  return {
    id: generateActivityId(),
    name: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [], // Parent picks — no assumed days
    startDate: SCHOOL_YEAR_START,
    endDate: SCHOOL_YEAR_END,
    location: '',
    schoolDaysOnly: true,
  }
}

function getStudentDisplayName(student: Student | undefined, idx: number): string {
  if (!student) return `Student ${idx + 1}`
  return student.studentName.trim() || `Student ${idx + 1}`
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ScheduleGenerator() {
  const [students, setStudents] = useState<Student[]>(() => [createEmptyStudent()])
  const [activeStudentId, setActiveStudentId] = useState<string>(() => students[0]!.id)
  const [preset, setPreset] = useState<Preset>('this-week')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [generated, setGenerated] = useState<DaySchedule[] | null>(null)
  const [validationError, setValidationError] = useState<string>('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [confirmingDeleteStudent, setConfirmingDeleteStudent] = useState(false)
  // Semester collapse state — lets user hide filled-in semesters to reach
  // Generate / Print buttons faster
  const [collapsedS1, setCollapsedS1] = useState(true)
  const [collapsedS2, setCollapsedS2] = useState(true)
  // Activities section collapse — default true (starts closed to save space)
  const [collapsedActivities, setCollapsedActivities] = useState(true)
  // Undo snapshot for destructive actions (Clear semester, Copy, Clear saved data).
  // Each snapshot captures its own restore closure so different actions can
  // restore different pieces of state.
  const [undoSnapshot, setUndoSnapshot] = useState<{
    label: string
    restore: () => void
  } | null>(null)

  // Rebuild the Green/Silver map once. It's static for the year.
  const gsMap = useMemo(() => buildGreenSilverMap(), [])

  // Compute active student — fall back to first if the id doesn't match
  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) ?? students[0]!,
    [students, activeStudentId]
  )

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem(STORAGE_KEY)
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses)
        if (Array.isArray(parsed?.students) && parsed.students.length > 0) {
          // New multi-student format — backfill activities:[] for older schemas.
          const migrated: Student[] = parsed.students.map((s: Student) => ({
            ...s,
            activities: Array.isArray(s.activities) ? s.activities : [],
          }))
          setStudents(migrated)
          setActiveStudentId(parsed.activeStudentId || migrated[0].id)
        } else if (parsed?.studentName !== undefined || parsed?.semester1 !== undefined) {
          // Old single-student format — migrate to new shape
          const migrated: Student = {
            ...emptyCourses(),
            activities: [],
            ...parsed,
            id: generateStudentId(),
          }
          setStudents([migrated])
          setActiveStudentId(migrated.id)
        }
      }
      const savedDates = localStorage.getItem(DATE_STORAGE_KEY)
      if (savedDates) {
        const parsed = JSON.parse(savedDates)
        // Guard against legacy 'today' preset (removed)
        if (
          parsed.preset === 'this-week' ||
          parsed.preset === 'next-week' ||
          parsed.preset === 'custom'
        ) {
          setPreset(parsed.preset)
        }
        // Only restore start/end dates when using custom — presets recompute at load
        if (parsed.preset === 'custom') {
          if (parsed.startDate) setStartDate(parsed.startDate)
          if (parsed.endDate) setEndDate(parsed.endDate)
        }
      }
      const savedCollapse = localStorage.getItem(COLLAPSE_STORAGE_KEY)
      if (savedCollapse) {
        const parsed = JSON.parse(savedCollapse)
        if (typeof parsed?.s1 === 'boolean') setCollapsedS1(parsed.s1)
        if (typeof parsed?.s2 === 'boolean') setCollapsedS2(parsed.s2)
        if (typeof parsed?.activities === 'boolean')
          setCollapsedActivities(parsed.activities)
      }
    } catch {
      // Ignore malformed storage
    }
    setHasLoaded(true)
  }, [])

  // Recompute dates when preset changes (except 'custom').
  // If the chosen preset is currently unavailable, fall back to 'custom'.
  useEffect(() => {
    if (!hasLoaded) return
    if (preset === 'custom') return
    if (!isPresetAvailable(preset)) {
      setPreset('custom')
      return
    }
    const dates = computePresetDates(preset)
    if (dates) {
      setStartDate(dates.start)
      setEndDate(dates.end)
    }
  }, [preset, hasLoaded])

  // Auto-save on any change
  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ students, activeStudentId })
      )
    } catch {
      /* quota / privacy mode — silently ignore */
    }
  }, [students, activeStudentId, hasLoaded])

  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        DATE_STORAGE_KEY,
        JSON.stringify({ preset, startDate, endDate })
      )
    } catch {
      /* ignore */
    }
  }, [preset, startDate, endDate, hasLoaded])

  // Persist semester collapse state so users returning to the tool see the
  // same expanded/collapsed layout as when they left.
  useEffect(() => {
    if (!hasLoaded) return
    try {
      localStorage.setItem(
        COLLAPSE_STORAGE_KEY,
        JSON.stringify({
          s1: collapsedS1,
          s2: collapsedS2,
          activities: collapsedActivities,
        })
      )
    } catch {
      /* ignore */
    }
  }, [collapsedS1, collapsedS2, collapsedActivities, hasLoaded])

  // Auto-reset the Clear confirmation state after 5 seconds
  useEffect(() => {
    if (!confirmingClear) return
    const t = setTimeout(() => setConfirmingClear(false), 5000)
    return () => clearTimeout(t)
  }, [confirmingClear])

  // Auto-reset the Delete Student confirmation state after 5 seconds
  useEffect(() => {
    if (!confirmingDeleteStudent) return
    const t = setTimeout(() => setConfirmingDeleteStudent(false), 5000)
    return () => clearTimeout(t)
  }, [confirmingDeleteStudent])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const updateActiveStudent = (updater: (s: Student) => Student) => {
    setStudents((prev) => prev.map((s) => (s.id === activeStudentId ? updater(s) : s)))
  }

  const updateCourse = (
    semesterKey: 'semester1' | 'semester2',
    color: 'G' | 'S',
    period: 'p1' | 'p2' | 'p3' | 'p4',
    field: keyof CourseSlot,
    value: string
  ) => {
    updateActiveStudent((s) => ({
      ...s,
      [semesterKey]: {
        ...s[semesterKey],
        [color]: {
          ...s[semesterKey][color],
          [period]: {
            ...s[semesterKey][color][period],
            [field]: value,
          },
        },
      },
    }))
  }

  const handleAddActivity = () => {
    const fresh = createEmptyActivity()
    updateActiveStudent((s) => ({ ...s, activities: [...s.activities, fresh] }))
    // Return the id so caller can auto-expand the new row for editing
    return fresh.id
  }

  const handleUpdateActivity = (id: string, patch: Partial<Activity>) => {
    updateActiveStudent((s) => ({
      ...s,
      activities: s.activities.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    }))
  }

  const handleDeleteActivity = (id: string) => {
    const activity = activeStudent.activities.find((a) => a.id === id)
    if (!activity) return
    // If the activity is essentially blank (no name), treat delete as an undo
    // of the "Add activity" action — no confirm, no toast, just remove it.
    if (!activity.name.trim()) {
      updateActiveStudent((s) => ({
        ...s,
        activities: s.activities.filter((a) => a.id !== id),
      }))
      return
    }
    const label = activity.name.trim()
    if (!window.confirm(`Remove ${label}?`)) return
    // Snapshot for undo — same pattern as Clear Semester
    const snapshotStudent = JSON.parse(
      JSON.stringify(activeStudent)
    ) as Student
    setUndoSnapshot({
      label: `Removed ${label}`,
      restore: () => {
        setStudents((list) =>
          list.map((s) => (s.id === snapshotStudent.id ? snapshotStudent : s))
        )
      },
    })
    updateActiveStudent((s) => ({
      ...s,
      activities: s.activities.filter((a) => a.id !== id),
    }))
    setGenerated(null)
    setValidationError('')
  }

  const handleClearSemester = (semesterKey: 'semester1' | 'semester2') => {
    const label = semesterKey === 'semester1' ? 'Semester 1' : 'Semester 2'
    if (!window.confirm(`Clear all classes in ${label}?`)) return
    // Snapshot the whole student so we can restore either semester exactly
    const snapshotStudent = JSON.parse(
      JSON.stringify(activeStudent)
    ) as Student
    setUndoSnapshot({
      label: `Cleared ${label}`,
      restore: () => {
        setStudents((list) =>
          list.map((s) => (s.id === snapshotStudent.id ? snapshotStudent : s))
        )
      },
    })
    const blank = emptyCourses().semester1
    updateActiveStudent((s) => ({ ...s, [semesterKey]: blank }))
    setGenerated(null)
    setValidationError('')
  }

  const handleCopySemester1To2 = () => {
    if (
      !window.confirm(
        'Copy all Semester 1 classes to Semester 2? Any existing Semester 2 entries will be replaced.'
      )
    )
      return
    // Only snapshot if Semester 2 actually had data — copying into an
    // already-blank semester has nothing meaningful to restore.
    const s2HadData = !isSemesterScheduleEmpty(activeStudent.semester2)
    if (s2HadData) {
      const snapshotStudent = JSON.parse(
        JSON.stringify(activeStudent)
      ) as Student
      setUndoSnapshot({
        label: 'Copied Semester 1 to Semester 2',
        restore: () => {
          setStudents((list) =>
            list.map((s) =>
              s.id === snapshotStudent.id ? snapshotStudent : s
            )
          )
        },
      })
    }
    updateActiveStudent((s) => ({
      ...s,
      semester2: JSON.parse(JSON.stringify(s.semester1)) as SemesterSchedule,
    }))
    setGenerated(null)
    setValidationError('')
  }

  const handleUndo = () => {
    if (!undoSnapshot) return
    undoSnapshot.restore()
    setUndoSnapshot(null)
    setGenerated(null)
    setValidationError('')
  }

  const handleStudentNameChange = (name: string) => {
    updateActiveStudent((s) => ({ ...s, studentName: name }))
  }

  const handleSwitchStudent = (id: string) => {
    if (id === activeStudentId) return
    setActiveStudentId(id)
    setGenerated(null)
    setValidationError('')
    setConfirmingDeleteStudent(false)
  }

  const handleAddStudent = () => {
    const newStudent = createEmptyStudent()
    setStudents((prev) => [...prev, newStudent])
    setActiveStudentId(newStudent.id)
    setGenerated(null)
    setValidationError('')
    setConfirmingDeleteStudent(false)
  }

  const handleDeleteStudent = () => {
    if (students.length <= 1) return
    if (!confirmingDeleteStudent) {
      setConfirmingDeleteStudent(true)
      return
    }
    // Second click — snapshot then delete. Deep-clone the full state so
    // Restore can put the student back exactly as they were.
    const deletedStudent = students.find((s) => s.id === activeStudentId)
    const snapshot = {
      students: JSON.parse(JSON.stringify(students)) as Student[],
      activeStudentId,
    }
    const label = deletedStudent?.name?.trim()
      ? `Deleted ${deletedStudent.name.trim()}`
      : 'Deleted student'
    setUndoSnapshot({
      label,
      restore: () => {
        setStudents(snapshot.students)
        setActiveStudentId(snapshot.activeStudentId)
      },
    })

    const remaining = students.filter((s) => s.id !== activeStudentId)
    setStudents(remaining)
    setActiveStudentId(remaining[0].id)
    setGenerated(null)
    setValidationError('')
    setConfirmingDeleteStudent(false)
  }

  const handleGenerate = () => {
    setValidationError('')
    if (!startDate || !endDate) {
      setValidationError('Please choose both a start date and an end date.')
      setGenerated(null)
      return
    }
    if (startDate > endDate) {
      setValidationError('The start date must be on or before the end date.')
      setGenerated(null)
      return
    }
    if (endDate < SCHOOL_YEAR_START || startDate > SCHOOL_YEAR_END) {
      setValidationError(
        `The 2026–2027 school year runs August 4, 2026 through May 26, 2027. Try "Rest of semester" or pick dates within that range.`
      )
      setGenerated(null)
      return
    }
    // Clamp to school year bounds so we don't render dates outside coverage
    const clampedStart = startDate < SCHOOL_YEAR_START ? SCHOOL_YEAR_START : startDate
    const clampedEnd = endDate > SCHOOL_YEAR_END ? SCHOOL_YEAR_END : endDate

    setGenerated(generateScheduleRange(clampedStart, clampedEnd, activeStudent, gsMap))
  }

  const handlePrint = () => {
    window.print()
  }

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true)
      return
    }
    // Second click within 5s — snapshot everything then wipe.
    // Deep-cloning students so the closure holds an immutable point-in-time
    // copy that Restore can reinstate later.
    const snapshot = {
      students: JSON.parse(JSON.stringify(students)) as Student[],
      activeStudentId,
      preset,
      startDate,
      endDate,
      collapsedS1,
      collapsedS2,
      collapsedActivities,
    }
    setUndoSnapshot({
      label: 'Cleared all saved data',
      restore: () => {
        setStudents(snapshot.students)
        setActiveStudentId(snapshot.activeStudentId)
        setPreset(snapshot.preset)
        setStartDate(snapshot.startDate)
        setEndDate(snapshot.endDate)
        setCollapsedS1(snapshot.collapsedS1)
        setCollapsedS2(snapshot.collapsedS2)
        setCollapsedActivities(snapshot.collapsedActivities)
      },
    })

    const fresh = createEmptyStudent()
    setStudents([fresh])
    setActiveStudentId(fresh.id)
    setPreset('this-week')
    setStartDate('')
    setEndDate('')
    setGenerated(null)
    setValidationError('')
    setConfirmingClear(false)
    setConfirmingDeleteStudent(false)
    setCollapsedS1(false)
    setCollapsedS2(false)
    setCollapsedActivities(true)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(DATE_STORAGE_KEY)
      localStorage.removeItem(COLLAPSE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 print:py-0 print:px-0 print:max-w-none">
      {/* Restore toast — fixed at bottom of viewport. Dark background with a
          thick amber border and amber accent link so it stays clearly
          distinct from the site's dark footer (which has white text). */}
      {undoSnapshot && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 bg-stone-900 border-4 border-amber-300 text-white rounded-md shadow-2xl max-w-md w-[calc(100%-2rem)] print:hidden"
        >
          <span className="text-sm flex-1">{undoSnapshot.label}.</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-sm font-semibold text-amber-300 hover:text-amber-200 hover:underline shrink-0"
          >
            Restore cleared data
          </button>
          <button
            type="button"
            onClick={() => setUndoSnapshot(null)}
            className="text-sm text-stone-400 hover:text-white"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
      {/* Title and intro — visible on screen only */}
      <div className="print:hidden">
        <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mb-2">
          ZCHS Weekly Schedule Maker
        </h1>
        <p className="text-stone-700 mb-4 max-w-[720px]">
          Create a printable ZCHS weekly schedule with classes, Green/Silver
          days, breaks, and activities.
        </p>
        <ul className="text-stone-600 mb-8 max-w-[720px] text-sm list-disc pl-5 space-y-1">
          <li>Enter classes for both semesters and select the dates to print</li>
          <li>Green/Silver days and school breaks are pre-loaded from the ZCS calendar</li>
          <li>Teacher and room are optional</li>
          <li>Saved only in this browser. Nothing is sent to ZionsvilleIndiana.com.</li>
          <li>
            Dates are based on published ZCS and ZCHS calendars. Confirm with
            the{' '}
            <a
              href="https://www.zcs.k12.in.us/about-zcs/calendars"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brick-600 hover:text-brick-700 hover:underline"
            >
              official ZCS calendar
            </a>{' '}
            or the{' '}
            <a
              href="https://zhs.zcs.k12.in.us/about-us/2026-2027-greensilver-calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brick-600 hover:text-brick-700 hover:underline"
            >
              ZCHS Green/Silver Day calendar
            </a>
            .
          </li>
        </ul>

        {/* Student tabs */}
        <section className="mb-6 max-w-[720px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-stone-700 mr-1">Students:</span>
            {students.map((student, idx) => {
              const isActive = student.id === activeStudentId
              const name = getStudentDisplayName(student, idx)
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSwitchStudent(student.id)}
                  aria-pressed={isActive}
                  className={
                    isActive
                      ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium transition-colors'
                      : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
                  }
                >
                  {name}
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
                {confirmingDeleteStudent ? 'Click again to confirm' : 'Delete this student'}
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

        {/* Semester 1 */}
        <div className="mb-6 border border-stone-300 rounded-md p-4 bg-white max-w-[720px]">
          <SemesterForm
            title="Semester 1"
            subtitle="August 4, 2026 – December 18, 2026"
            value={activeStudent.semester1}
            onChange={(color, period, field, value) =>
              updateCourse('semester1', color, period, field, value)
            }
            onClear={() => handleClearSemester('semester1')}
            onCopyToOther={handleCopySemester1To2}
            otherSemesterLabel="Semester 2"
            collapsed={collapsedS1}
            onToggleCollapsed={() => setCollapsedS1((v) => !v)}
          />
        </div>

        {/* Semester 2 */}
        <div className="mb-6 border border-stone-300 rounded-md p-4 bg-white max-w-[720px]">
          <SemesterForm
            title="Semester 2"
            subtitle="January 5, 2027 – May 26, 2027"
            value={activeStudent.semester2}
            onChange={(color, period, field, value) =>
              updateCourse('semester2', color, period, field, value)
            }
            onClear={() => handleClearSemester('semester2')}
            collapsed={collapsedS2}
            onToggleCollapsed={() => setCollapsedS2((v) => !v)}
          />
        </div>

        {/* Activities — optional before/after-school commitments */}
        <div className="mb-6 border border-stone-300 rounded-md p-4 bg-white max-w-[720px]">
          <ActivitiesSection
            activities={activeStudent.activities}
            collapsed={collapsedActivities}
            onToggleCollapsed={() => setCollapsedActivities((v) => !v)}
            onAdd={handleAddActivity}
            onUpdate={handleUpdateActivity}
            onDelete={handleDeleteActivity}
          />
        </div>

        {/* Print — moved date range picker + action buttons */}
        <section className="mb-6 max-w-[720px]">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-4">
            Print
          </h2>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {(Object.keys(PRESET_LABELS) as Preset[]).map((p) => {
                const available = isPresetAvailable(p)
                const tooltip = getPresetTooltip(p)
                const isActive = preset === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => available && setPreset(p)}
                    disabled={!available}
                    aria-pressed={isActive}
                    title={tooltip}
                    className={
                      isActive
                        ? 'px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium transition-colors'
                        : !available
                          ? 'px-3 py-1.5 text-sm rounded-full border border-stone-200 bg-stone-100 text-stone-400 font-medium cursor-not-allowed'
                          : 'px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
                    }
                  >
                    {PRESET_LABELS[p]}
                  </button>
                )
              })}
            </div>

            {preset === 'custom' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <label className="block">
                  <span className="text-sm font-medium text-stone-700 block mb-1">
                    Start date
                  </span>
                  <input
                    type="date"
                    min={SCHOOL_YEAR_START}
                    max={SCHOOL_YEAR_END}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-stone-700 block mb-1">
                    End date
                  </span>
                  <input
                    type="date"
                    min={SCHOOL_YEAR_START}
                    max={SCHOOL_YEAR_END}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
                  />
                </label>
              </div>
            ) : (
              <p className="text-sm text-stone-600">
                {startDate && endDate
                  ? startDate === endDate
                    ? formatFullDate(startDate)
                    : `${formatFullDate(startDate)} through ${formatFullDate(endDate)}`
                  : 'Choose a preset to set the print dates.'}
              </p>
            )}
          </div>

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

          <p className="text-sm text-stone-500 print:hidden">
            Print is condensed. Screen preview shows all details.
          </p>
        </section>
      </div>

      {/* Generated schedule — renders on screen (after generate) and in print */}
      {generated && generated.length === 0 && (
        <div className="print:hidden p-4 bg-stone-50 border border-stone-200 rounded-md text-sm text-stone-700">
          No school days in the selected range. Try a different range.
        </div>
      )}

      {generated && generated.length > 0 && (
        <div className="print:block">
          {/* Screen-only preview heading. */}
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-4 print:hidden">
            {activeStudent.studentName.trim()
              ? `${activeStudent.studentName.trim()}'s Schedule`
              : 'Schedule'}
          </h2>

          {/* Over-limit banner — screen only. Lists activities that would be
              dropped from the printed calendar on at least one date. */}
          {(() => {
            const wontFitSet = getActivitiesThatWontFit(activeStudent.activities)
            const wontFitList = activeStudent.activities.filter((a) =>
              wontFitSet.has(a.id)
            )
            if (wontFitList.length === 0) return null
            const names = wontFitList
              .map((a) => a.name.trim() || 'Untitled activity')
              .map((n) => `"${n}"`)
              .join(', ')
            return (
              <div className="print:hidden mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                <span className="mr-1">⚠</span>
                {wontFitList.length === 1
                  ? '1 activity won\u2019t fit on the printed calendar on some dates:'
                  : `${wontFitList.length} activities won\u2019t fit on the printed calendar on some dates:`}{' '}
                {names}
              </div>
            )
          })()}

          {bucketByWeek(generated).map((week, i) => {
            return (
              <div
                key={week.weekStart}
                className={
                  i > 0 ? 'mt-8 print:break-before-page print:mt-0' : ''
                }
              >
                {/* Per-page header — prints on every page. Hidden on screen
                    (the on-screen preview heading covers that). */}
                <div className="hidden print:block">
                  <PrintHeader studentName={activeStudent.studentName} />
                </div>
                {/* Desktop + print: keep the existing weekly grid. */}
                <div className="hidden sm:block print:block">
                  <WeekGrid week={week} activities={activeStudent.activities} />
                </div>
                {/* Mobile: stacked day cards for on-screen viewing / screenshots. */}
                <div className="sm:hidden print:hidden">
                  <WeekStacked
                    week={week}
                    activities={activeStudent.activities}
                  />
                </div>
              </div>
            )
          })}
          <div className="mt-8 text-center print:hidden">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-sm text-village-600 hover:text-village-800 hover:underline transition-colors"
            >
              ↑ Jump to top
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-300 text-center text-xs text-stone-500 print:hidden">
            Made at zionsvilleindiana.com/tools/zchs-schedule
          </div>
        </div>
      )}

      {/* Print-only styling:
          - Landscape orientation for the 5-column week grid
          - Per-page header rendered inline via <PrintHeader> above each week
          - Footer holds the printed date + website so the header can stay minimal */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: landscape;
                margin: 0.5in 0.5in 0.6in 0.5in;
                @bottom-center {
                  content: "Printed ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} · Calendar created with ZionsvilleIndiana.com/tools/zchs-schedule";
                  font-family: sans-serif;
                  font-size: 9pt;
                  color: #78716c;
                }
              }
            }
          `,
        }}
      />
    </div>
  )
}

// ─── Semester form ──────────────────────────────────────────────────────────

interface SemesterFormProps {
  title: string
  subtitle: string
  value: SemesterSchedule
  onChange: (
    color: 'G' | 'S',
    period: 'p1' | 'p2' | 'p3' | 'p4',
    field: keyof CourseSlot,
    value: string
  ) => void
  onClear: () => void
  /** Only Semester 1 gets a "Copy to Semester 2" link */
  onCopyToOther?: () => void
  otherSemesterLabel?: string
  /** Collapse state — hides Green/Silver cards + action links */
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

function SemesterForm({
  title,
  subtitle,
  value,
  onChange,
  onClear,
  onCopyToOther,
  otherSemesterLabel,
  collapsed = false,
  onToggleCollapsed,
}: SemesterFormProps) {
  return (
    <section className="mb-8 max-w-[720px] print:hidden">
      <div className="mb-4 flex items-baseline gap-3 flex-wrap">
        <h2 className="font-display text-2xl font-semibold text-stone-900">
          {title}
        </h2>
        {onToggleCollapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            aria-expanded={!collapsed}
          >
            {collapsed ? 'Show' : 'Hide'}
          </button>
        )}
      </div>

      {!collapsed && (
        <>
          <div className="space-y-6">
            <DayColumn
              title="Green Day"
              dotColor="bg-village-600"
              periodPrefix="G"
              accentClass="border-village-600"
              headerClass="text-village-800 bg-village-50"
              slots={value.G}
              onChange={(period, field, v) => onChange('G', period, field, v)}
              accessiblePrefix={`${title} Green Day`}
            />
            <DayColumn
              title="Silver Day"
              dotColor="bg-stone-300"
              periodPrefix="S"
              accentClass="border-stone-400"
              headerClass="text-stone-800 bg-stone-100"
              slots={value.S}
              onChange={(period, field, v) => onChange('S', period, field, v)}
              accessiblePrefix={`${title} Silver Day`}
            />
          </div>

          {/* Action links live after the Silver Day card, not in the heading */}
          <div className="text-sm mt-4">
            {onCopyToOther && (
              <>
                <button
                  type="button"
                  onClick={onCopyToOther}
                  className="text-brick-600 hover:text-brick-700 hover:underline font-medium"
                >
                  Copy {title} to {otherSemesterLabel}
                </button>
                <span
                  className="text-stone-400 mx-2"
                  aria-hidden="true"
                >
                  ·
                </span>
              </>
            )}
            <button
              type="button"
              onClick={onClear}
              className="text-stone-600 hover:text-stone-900 hover:underline"
            >
              Clear {title}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

// ─── Activities section ────────────────────────────────────────────────────

interface ActivitiesSectionProps {
  activities: Activity[]
  collapsed: boolean
  onToggleCollapsed: () => void
  onAdd: () => string // returns the id of the new activity so we can auto-expand
  onUpdate: (id: string, patch: Partial<Activity>) => void
  onDelete: (id: string) => void
}

function ActivitiesSection({
  activities,
  collapsed,
  onToggleCollapsed,
  onAdd,
  onUpdate,
  onDelete,
}: ActivitiesSectionProps) {
  // Which activity's editor is currently expanded (only one at a time).
  const [editingId, setEditingId] = useState<string | null>(null)

  // Activities that get dropped from the printed calendar on at least one date.
  // Used to mark summary rows with an amber warning icon.
  const wontFitSet = useMemo(
    () => getActivitiesThatWontFit(activities),
    [activities]
  )

  const handleAdd = () => {
    const newId = onAdd()
    setEditingId(newId)
  }

  return (
    <section className="mb-8 max-w-[720px] print:hidden">
      <div className="mb-2 flex items-baseline gap-3 flex-wrap">
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
        <span className="text-sm text-stone-500">
          Optional. Add clubs, sports, private lessons, etc.
        </span>
      </div>

      <div className="text-sm text-stone-500 mb-4">
        <p>You can add the following number of activities per day:</p>
        <ul className="list-disc pl-5 mt-1">
          <li>Up to {CAP_BEFORE} before school</li>
          <li>{CAP_INLINE} per period during school</li>
          <li>Up to {CAP_AFTER} after school</li>
          <li>Up to {CAP_WEEKEND} on each Saturday or Sunday</li>
        </ul>
      </div>

      {!collapsed && (
        <div className="space-y-2">
          {activities.length === 0 && (
            <p className="text-sm text-stone-600 mb-2">
              No activities yet. Add one to include it on the printed schedule.
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
                onChange={(patch) => onUpdate(activity.id, patch)}
                onClose={() => setEditingId(null)}
                onDelete={() => {
                  onDelete(activity.id)
                  setEditingId(null)
                }}
              />
            ) : (
              <ActivitySummary
                key={activity.id}
                activity={activity}
                hasWarning={wontFitSet.has(activity.id)}
                onEdit={() => setEditingId(activity.id)}
                onDelete={() => onDelete(activity.id)}
              />
            )
          })}
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
          >
            + Add activity
          </button>
        </div>
      )}
    </section>
  )
}

/** Compact single-line row shown when the editor for this activity is closed. */
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
  const time = activity.startTime ? formatTime12h(activity.startTime) : 'No time set'
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

/** Expanded edit form for a single activity. */
function ActivityEditor({
  activity,
  otherActivities,
  onChange,
  onClose,
  onDelete,
}: {
  activity: Activity
  otherActivities: Activity[]
  onChange: (patch: Partial<Activity>) => void
  onClose: () => void
  onDelete: () => void
}) {
  // UI state: whether weekend pills are revealed. Auto-open if Sat/Sun are
  // already selected (e.g. reopening an existing weekend activity).
  const [includeWeekends, setIncludeWeekends] = useState(
    activity.daysOfWeek.includes(0) || activity.daysOfWeek.includes(6)
  )

  // Live-validate against the 3-activity-per-day limit. Recomputes when the
  // activity or peer activities change.
  const validation = useMemo(
    () => checkActivityDailyLimit(activity, otherActivities),
    [activity, otherActivities]
  )

  const inputClass =
    'w-full min-w-0 px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none'
  const labelClass =
    'text-xs uppercase tracking-widest font-medium text-stone-700 mb-1 block'

  const toggleDay = (dayNum: number) => {
    const next = activity.daysOfWeek.includes(dayNum)
      ? activity.daysOfWeek.filter((d) => d !== dayNum)
      : [...activity.daysOfWeek, dayNum]
    onChange({ daysOfWeek: next.sort((a, b) => a - b) })
  }

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
  const showWeekendConflictNote =
    hasWeekendSelected && activity.schoolDaysOnly

  return (
    <div className="p-4 border border-stone-300 rounded-md bg-stone-50">
      <div className="mb-3">
        <label className={labelClass}>Activity name</label>
        <input
          type="text"
          value={activity.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Art club, marching band, piano lesson"
          className={inputClass}
        />
      </div>

      <div className="mb-3">
        <label className={labelClass}>Days of week</label>
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

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start time</label>
          <input
            type="time"
            value={activity.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            End time <span className="normal-case text-stone-500">(optional)</span>
          </label>
          <input
            type="time"
            value={activity.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start date</label>
          <input
            type="date"
            value={activity.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>End date</label>
          <input
            type="date"
            value={activity.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>
          Location <span className="normal-case text-stone-500">(optional)</span>
        </label>
        <input
          type="text"
          value={activity.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="e.g. Aquatic Center, Jennings Field, tutoring center"
          className={inputClass}
        />
      </div>

      <div className="mb-3">
        <label className={labelClass}>
          When should this activity appear on the calendar?
        </label>
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
                  'e.g., private lessons, community programs, performances, competitions',
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
            Saturday/Sunday activities won't appear while "School days only"
            is selected. Switch to "School days and no-school days" to include
            weekend dates.
          </p>
        )}
      </div>

      {validation.message && (
        <p className="mb-3 px-3 py-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
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

interface DayColumnProps {
  title: string
  /** Tailwind bg-* class for a small colored dot rendered before the title */
  dotColor?: string
  /** Prefix for period numbers — "G" for Green, "S" for Silver → "G1", "S1", etc. */
  periodPrefix?: string
  accentClass: string
  headerClass: string
  slots: SemesterSchedule['G']
  onChange: (
    period: 'p1' | 'p2' | 'p3' | 'p4',
    field: keyof CourseSlot,
    value: string
  ) => void
  /** For screen readers — prefix like "Semester 1 Green Day" */
  accessiblePrefix: string
}

function DayColumn({
  title,
  dotColor,
  periodPrefix = '',
  accentClass,
  headerClass,
  slots,
  onChange,
  accessiblePrefix,
}: DayColumnProps) {
  const periods: Array<'p1' | 'p2' | 'p3' | 'p4'> = ['p1', 'p2', 'p3', 'p4']

  const inputClass =
    'w-full min-w-0 px-2.5 py-1.5 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none'

  // Grid template: Period | Class (widest) | Teacher (medium) | Room
  // Period 64px (fits centered "PERIOD" header and 1/2/3/4 numbers).
  // Class 3fr : Teacher 2fr gives Class ~44% and Teacher ~30% of card width.
  // Room 120px is comfortable for values like E123, W602, C124.
  const rowGrid =
    'grid-cols-[4rem_minmax(0,3fr)_minmax(0,2fr)_7.5rem]'

  return (
    <div className="border border-stone-200 bg-white rounded-md">
      <div
        className={`px-4 py-2 font-semibold rounded-t-md ${headerClass}`}
      >
        {dotColor && (
          <span
            className={`inline-block w-4 h-4 rounded-full ${dotColor} mr-2 align-middle`}
            aria-hidden="true"
          />
        )}
        {title}
      </div>

      <div className="px-4 py-3">
        {/* Desktop column headers */}
        <div
          className={`hidden sm:grid ${rowGrid} gap-2 mb-1.5 text-xs uppercase tracking-widest text-stone-700 font-semibold`}
        >
          <div className="text-center">Period</div>
          <div>Class</div>
          <div>Teacher</div>
          <div>Room</div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {periods.map((p, i) => {
            const periodNum = i + 1
            return (
              <div key={p}>
                {/* Desktop row — grid columns aligned with headers */}
                <div className={`hidden sm:grid ${rowGrid} gap-2 items-center`}>
                  <div
                    className="text-sm font-medium text-stone-700 text-center tabular-nums"
                    aria-hidden="true"
                  >
                    {periodPrefix}{periodNum}
                  </div>
                  <input
                    type="text"
                    aria-label={`${accessiblePrefix} Period ${periodNum} class`}
                    value={slots[p].name}
                    onChange={(e) => onChange(p, 'name', e.target.value)}
                    placeholder="Class"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    aria-label={`${accessiblePrefix} Period ${periodNum} teacher`}
                    value={slots[p].teacher || ''}
                    onChange={(e) => onChange(p, 'teacher', e.target.value)}
                    placeholder="Teacher"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    aria-label={`${accessiblePrefix} Period ${periodNum} room`}
                    value={slots[p].room || ''}
                    onChange={(e) => onChange(p, 'room', e.target.value)}
                    placeholder="Room"
                    className={inputClass}
                  />
                </div>

                {/* Mobile row — stack fields but keep period label attached */}
                <div className="sm:hidden">
                  <div className="text-sm font-medium text-stone-700 mb-1.5">
                    {periodPrefix}{periodNum}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      aria-label={`${accessiblePrefix} Period ${periodNum} class`}
                      value={slots[p].name}
                      onChange={(e) => onChange(p, 'name', e.target.value)}
                      placeholder="Class"
                      className={inputClass}
                    />
                    <div className="grid grid-cols-[1fr_5rem] gap-1.5">
                      <input
                        type="text"
                        aria-label={`${accessiblePrefix} Period ${periodNum} teacher`}
                        value={slots[p].teacher || ''}
                        onChange={(e) => onChange(p, 'teacher', e.target.value)}
                        placeholder="Teacher"
                        className={inputClass}
                      />
                      <input
                        type="text"
                        aria-label={`${accessiblePrefix} Period ${periodNum} room`}
                        value={slots[p].room || ''}
                        onChange={(e) => onChange(p, 'room', e.target.value)}
                        placeholder="Room"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Period 3 lunch sub-row — aligned under Class column */}
                {p === 'p3' && (
                  <div
                    className={`mt-2 sm:grid ${rowGrid} sm:gap-2 sm:items-center`}
                  >
                    <div aria-hidden="true" className="hidden sm:block" />
                    <label className="text-sm text-stone-700 inline-flex items-center gap-2 sm:col-span-3">
                      <span>Period 3 lunch</span>
                      <select
                        aria-label={`${accessiblePrefix} Period 3 lunch`}
                        value={slots.p3.lunch || ''}
                        onChange={(e) =>
                          onChange(
                            'p3',
                            'lunch',
                            e.target.value as LunchOption | ''
                          )
                        }
                        className="px-2 py-1 border border-stone-300 rounded-md text-sm focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
                      >
                        <option value="">Select…</option>
                        <option value="A">A Lunch</option>
                        <option value="B">B Lunch</option>
                        <option value="C">C Lunch</option>
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Print header ───────────────────────────────────────────────────────────

interface PrintHeaderProps {
  studentName: string
}

function PrintHeader({ studentName }: PrintHeaderProps) {
  return (
    <div className="mb-6 print:mb-3 pb-4 print:pb-2 border-b border-stone-300">
      <h2 className="font-display text-2xl print:!text-2xl font-bold text-stone-900">
        {studentName ? `${studentName}'s Schedule` : 'ZCHS Schedule'}
      </h2>
    </div>
  )
}

// ─── Week grid (5-column layout, one per week) ──────────────────────────────

interface WeekBucket {
  weekStart: string // Monday's date key
  days: (DaySchedule | null)[] // 5 slots: [Mon, Tue, Wed, Thu, Fri]
}

/** Return the Monday of the calendar week containing this date. */
function getMondayOfWeek(dateKey: string): string {
  const d = makeDate(dateKey)
  const day = d.getDay() // 0 = Sun ... 6 = Sat
  const daysToMonday = day === 0 ? -6 : 1 - day
  return toDateKey(addDays(d, daysToMonday))
}

/** Group generated days into weekly buckets with M-F slot positions. */
/** True when every period in both Green and Silver day of a semester is
 *  empty — no class name, teacher, room, or Period 3 lunch selection. */
function isSemesterScheduleEmpty(sem: SemesterSchedule): boolean {
  for (const day of ['G', 'S'] as const) {
    for (const p of ['p1', 'p2', 'p3', 'p4'] as const) {
      const slot = sem[day][p]
      if (slot.name || slot.teacher || slot.room) return false
      if (p === 'p3' && slot.lunch) return false
    }
  }
  return true
}

// ─── Activity helpers ──────────────────────────────────────────────────────

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Compact display of a set of weekday numbers.
 *   [1,2,3,4,5]      → "Mon–Fri"
 *   [1,3,5]          → "Mon, Wed, Fri"
 *   [6,0]            → "Sat, Sun"
 *   []               → "No days"
 */
function formatDaysOfWeek(days: number[]): string {
  if (days.length === 0) return 'No days'
  const sorted = [...days].sort((a, b) => a - b)
  // Only collapse to a range if 3+ consecutive weekdays (Mon–Fri feels right;
  // "Tue, Wed" as "Tue–Wed" reads clunky).
  if (sorted.length >= 3) {
    let contiguous = true
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        contiguous = false
        break
      }
    }
    if (contiguous) {
      return `${WEEKDAY_SHORT[sorted[0]]}–${WEEKDAY_SHORT[sorted[sorted.length - 1]]}`
    }
  }
  return sorted.map((d) => WEEKDAY_SHORT[d]).join(', ')
}

/** "07:15" → "7:15 AM"; "15:45" → "3:45 PM"; "" → "" */
function formatTime12h(time24: string): string {
  if (!time24) return ''
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** "07:15" → "7:15"; "15:45" → "3:45"; "" → "" (compact, no AM/PM) */
function formatTimeCompact(time24: string): string {
  if (!time24) return ''
  const [hStr, mStr] = time24.split(':')
  const h = parseInt(hStr, 10)
  const m = parseInt(mStr, 10)
  if (Number.isNaN(h) || Number.isNaN(m)) return ''
  const h12 = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')}`
}

/** Should this activity render on this specific school day? */
function activityAppliesToDay(a: Activity, day: DaySchedule): boolean {
  if (!a.name.trim()) return false
  if (a.startDate && day.dateKey < a.startDate) return false
  if (a.endDate && day.dateKey > a.endDate) return false
  const jsWeekday = makeDate(day.dateKey).getDay() // 0=Sun … 6=Sat
  if (!a.daysOfWeek.includes(jsWeekday)) return false
  if (a.schoolDaysOnly && day.isBlocked) return false
  return true
}

/** All activities that apply to this day, sorted by start time (ascending). */
function activitiesForDay(
  day: DaySchedule,
  activities: Activity[]
): Activity[] {
  return activities
    .filter((a) => activityAppliesToDay(a, day))
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * Determine which activities would be dropped from the printed calendar on
 * at least one date due to per-placement caps. Returns a Set of activity IDs.
 *
 * The rule: for each date, sort applicable activities by start time. The ones
 * that fit within the cap for their placement bucket display; the rest are
 * dropped. Any activity that gets dropped on ANY date is included in the
 * returned set.
 */
function getActivitiesThatWontFit(activities: Activity[]): Set<string> {
  const wontFit = new Set<string>()

  // Collect every date across every activity's range so we only iterate
  // dates that could possibly have violations.
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

    // Activities that apply to this date, sorted by start time
    const applying = activities
      .filter((a) => activityAppliesToDateRaw(a, dateKey))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    if (isWeekend) {
      // Weekend: single bucket capped at CAP_WEEKEND
      const overflow = applying.slice(CAP_WEEKEND)
      for (const a of overflow) wontFit.add(a.id)
    } else {
      // Weekday: bucket by placement, cap each independently
      const buckets: Record<ActivityPlacement, Activity[]> = {
        before: [],
        p1: [],
        p2: [],
        p3: [],
        p4: [],
        after: [],
      }
      for (const a of applying) {
        const p = placeActivity(a)
        if (p) buckets[p].push(a)
      }
      const capFor = (p: ActivityPlacement): number =>
        p === 'before' ? CAP_BEFORE : p === 'after' ? CAP_AFTER : CAP_INLINE
      for (const p of Object.keys(buckets) as ActivityPlacement[]) {
        const overflow = buckets[p].slice(capFor(p))
        for (const a of overflow) wontFit.add(a.id)
      }
    }
  }

  return wontFit
}

/**
 * Filter + sort activities that apply to a raw dateKey (used for Saturday
 * and Sunday, which don't have a full DaySchedule). Weekend days are never
 * school days, so schoolDaysOnly=true means the activity is skipped.
 */
function activitiesForDateKey(
  dateKey: string,
  activities: Activity[]
): Activity[] {
  const jsWeekday = makeDate(dateKey).getDay()
  const isWeekend = jsWeekday === 0 || jsWeekday === 6
  return activities
    .filter((a) => {
      if (!a.name.trim()) return false
      if (a.startDate && dateKey < a.startDate) return false
      if (a.endDate && dateKey > a.endDate) return false
      if (!a.daysOfWeek.includes(jsWeekday)) return false
      if (a.schoolDaysOnly && isWeekend) return false
      return true
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * Structural predicate: would this activity DISPLAY on `dateKey`? Used for
 * the 3-per-day validation. We can't check schoolDaysOnly + blocked-day
 * status without generating a full DaySchedule, so this over-reports
 * slightly on breaks — which errs safely on the side of blocking too much
 * rather than too little.
 */
function activityAppliesToDateRaw(a: Activity, dateKey: string): boolean {
  if (!a.name.trim()) return false
  if (!a.startTime) return false
  if (a.daysOfWeek.length === 0) return false
  if (a.startDate && dateKey < a.startDate) return false
  if (a.endDate && dateKey > a.endDate) return false
  const jsWeekday = makeDate(dateKey).getDay()
  if (!a.daysOfWeek.includes(jsWeekday)) return false
  return true
}

/**
 * Check whether adding/updating `proposed` would push any single date past a
 * per-placement print cap. Weekdays check the placement of `proposed` (before /
 * inline period / after) against its own bucket cap; weekend days check the
 * combined weekend cap of 5.
 */
function checkActivityDailyLimit(
  proposed: Activity,
  otherActivities: Activity[]
): { valid: boolean; message?: string } {
  // If this activity wouldn't display anywhere, nothing to validate.
  if (!proposed.name.trim() || !proposed.startTime) return { valid: true }
  if (proposed.daysOfWeek.length === 0) return { valid: true }
  if (!proposed.startDate || !proposed.endDate) return { valid: true }
  if (proposed.startDate > proposed.endDate) return { valid: true }

  const proposedPlacement = placeActivity(proposed)
  if (!proposedPlacement) return { valid: true }

  const start = makeDate(proposed.startDate)
  const end = makeDate(proposed.endDate)
  let cur = start
  while (cur <= end) {
    const dateKey = toDateKey(cur)
    if (activityAppliesToDateRaw(proposed, dateKey)) {
      const jsWeekday = makeDate(dateKey).getDay()
      const isWeekend = jsWeekday === 0 || jsWeekday === 6

      if (isWeekend) {
        // Weekend: all activities share one bucket capped at CAP_WEEKEND
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
        // Weekday: check only the matching placement bucket
        let count = 1
        for (const other of otherActivities) {
          if (
            activityAppliesToDateRaw(other, dateKey) &&
            placeActivity(other) === proposedPlacement
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
            message = `Only ${CAP_INLINE} activity can be added per period. Adjust the days, time, or dates for this or another activity to make room.`
          }
          return { valid: false, message }
        }
      }
    }
    cur = addDays(cur, 1)
  }
  return { valid: true }
}

/**
 * Decide where an activity goes on the calendar based on its start time:
 *   before  — before 8:30 AM (rendered above Period 1)
 *   p1..p4  — during 8:30–15:40, inline in the matching period cell
 *   after   — 15:40 (3:40 PM) or later (rendered below Period 4)
 *   null    — no time set; skipped from the calendar
 *
 * String comparison works because startTime is a fixed-width "HH:MM" string.
 */
type ActivityPlacement = 'before' | 'p1' | 'p2' | 'p3' | 'p4' | 'after'

function placeActivity(a: Activity): ActivityPlacement | null {
  const t = a.startTime
  if (!t) return null
  if (t < '08:30') return 'before'
  if (t < '10:10') return 'p1'
  if (t < '11:50') return 'p2'
  if (t < '14:10') return 'p3'
  if (t < '15:40') return 'p4'
  return 'after'
}

/** Per-placement print caps — the print layout has a hard budget for each row.
 *  Fixed limits + single-line content = predictable row heights. */
const CAP_BEFORE = 2
const CAP_INLINE = 1
const CAP_AFTER = 4
const CAP_WEEKEND = 4

/** Split a day's applicable activities into the six placement buckets.
 *  Returns ALL applicable activities — the screen preview shows everything.
 *  The print cap is enforced via CSS (print:hidden on items past the cap
 *  index) so screen and print can diverge intentionally. */
function activitiesByPlacement(
  day: DaySchedule,
  activities: Activity[]
): Record<ActivityPlacement, Activity[]> {
  const buckets: Record<ActivityPlacement, Activity[]> = {
    before: [],
    p1: [],
    p2: [],
    p3: [],
    p4: [],
    after: [],
  }
  for (const a of activitiesForDay(day, activities)) {
    const place = placeActivity(a)
    if (place) buckets[place].push(a)
  }
  return buckets
}

function bucketByWeek(days: DaySchedule[]): WeekBucket[] {
  const buckets = new Map<string, WeekBucket>()

  for (const day of days) {
    const mondayKey = getMondayOfWeek(day.dateKey)
    if (!buckets.has(mondayKey)) {
      buckets.set(mondayKey, {
        weekStart: mondayKey,
        days: [null, null, null, null, null],
      })
    }
    const bucket = buckets.get(mondayKey)!
    const dayOfWeek = makeDate(day.dateKey).getDay() // 1 = Mon ... 5 = Fri
    const slot = dayOfWeek - 1
    if (slot >= 0 && slot <= 4) {
      bucket.days[slot] = day
    }
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  )
}

function formatShortDate(dateKey: string): string {
  const d = makeDate(dateKey)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getMonthShort(dateKey: string): string {
  return makeDate(dateKey).toLocaleDateString('en-US', { month: 'short' })
}

function getDayNum(dateKey: string): number {
  return makeDate(dateKey).getDate()
}

/** "12:20 PM – 12:55 PM" → "12:20–12:55" */
function shortenTimeRange(time: string): string {
  return time.replace(/\s*(AM|PM)/g, '').replace(/\s*–\s*/, '–')
}

/** Strip "— No School" suffix, and hide labels that mean nothing to parents. */
function shortenBlockedLabel(label: string): string {
  const cleaned = label.replace(/\s+—\s+No School\s*$/, '').trim()
  // Teacher Workdays fall adjacent to breaks anyway — parents don't care about the label
  if (cleaned === 'Teacher Workday') return ''
  return cleaned
}

/** Look up class/teacher/room for a given period on a given day. */
function getPeriodInfo(
  day: DaySchedule,
  periodNum: '1' | '2' | '3' | '4'
): {
  className: string
  teacher?: string
  room?: string
  lunchLabel?: string
  lunchTime?: string
} | null {
  if (!day.rows) return null
  const classRow = day.rows.find((r) => r.period === periodNum)
  if (!classRow) return null
  const result = {
    className: classRow.name,
    teacher: classRow.teacher,
    room: classRow.room,
    lunchLabel: undefined as string | undefined,
    lunchTime: undefined as string | undefined,
  }
  if (periodNum === '3') {
    const lunchRow = day.rows.find((r) => r.period === 'Lunch')
    if (lunchRow) {
      result.lunchLabel = lunchRow.name // e.g. "B Lunch"
      result.lunchTime = shortenTimeRange(lunchRow.time)
    }
  }
  return result
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

interface WeekGridProps {
  week: WeekBucket
  activities: Activity[]
}

function WeekGrid({ week, activities }: WeekGridProps) {
  // Split each day's applicable activities into six placement buckets:
  //   before      → above Period 1 (times before 8:30 AM)
  //   p1..p4      → inline inside the matching period cell (during school day)
  //   after       → below Period 4 (times 3:40 PM or later)
  // Activities with no start time are skipped.
  const placementByDay = week.days.map((day) =>
    day ? activitiesByPlacement(day, activities) : null
  )
  const hasBefore = placementByDay.some((p) => p && p.before.length > 0)
  const hasAfter = placementByDay.some((p) => p && p.after.length > 0)

  /** Group consecutive blocked days (excluding special-schedule days) that
   *  share the same break label so we can render one horizontally-merged cell
   *  across the period rows for the whole break (e.g. Wed-Fri Thanksgiving). */
  type BlockedGroup = { startIdx: number; length: number; label: string }
  const blockedGroups: BlockedGroup[] = []
  {
    let i = 0
    while (i < 5) {
      const day = week.days[i]
      if (day && day.isBlocked && !day.hasSpecialSchedule) {
        const label = shortenBlockedLabel(day.blockedLabel ?? '')
        let end = i + 1
        while (end < 5) {
          const next = week.days[end]
          if (
            !next ||
            !next.isBlocked ||
            next.hasSpecialSchedule ||
            shortenBlockedLabel(next.blockedLabel ?? '') !== label
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

  // Weekend activities — displayed in a small 2-column section below the
  // main week grid when any exist. Sat and Sun keys are derived from Monday.
  const satKey = toDateKey(addDays(makeDate(week.weekStart), 5))
  const sunKey = toDateKey(addDays(makeDate(week.weekStart), 6))
  const satActivities = activitiesForDateKey(satKey, activities)
  const sunActivities = activitiesForDateKey(sunKey, activities)
  const hasWeekend = satActivities.length > 0 || sunActivities.length > 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm print:text-xs border border-stone-300 border-collapse table-fixed print:break-inside-avoid">
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
            <th className="p-2 text-center align-bottom text-stone-700 font-semibold border border-stone-300 bg-stone-50">
              Period
            </th>
            {WEEKDAY_HEADERS.map((weekday, i) => {
              const day = week.days[i]
              return (
                <th
                  key={i}
                  className="p-2 print:p-1.5 text-center align-bottom border border-stone-300 bg-stone-50"
                >
                  {day && (
                    <>
                      <div className="text-[10px] uppercase tracking-wide text-stone-500 leading-none">
                        {getMonthShort(day.dateKey)}
                      </div>
                      <div className="font-display text-3xl print:text-2xl font-semibold text-stone-900 leading-none mt-0.5 print:mt-0">
                        {getDayNum(day.dateKey)}
                      </div>
                      <div className="text-sm print:text-xs font-medium text-stone-900 mt-1 print:mt-0.5 leading-tight">
                        {weekday}
                        {!day.isBlocked && (
                          <>
                            <span className="mx-1 text-stone-400">·</span>
                            <span
                              className={`text-[10px] uppercase tracking-wide ${
                                day.dayColor === 'G'
                                  ? 'text-village-700'
                                  : 'text-stone-600'
                              }`}
                            >
                              {day.dayColor === 'G' ? 'Green' : 'Silver'}
                            </span>
                          </>
                        )}
                        {day.isBlocked && !day.hasSpecialSchedule && (
                          <>
                            <span className="mx-1 text-stone-400">·</span>
                            <span className="text-[10px] uppercase tracking-wide text-stone-600">
                              No school
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {/* Before-school row — only shown when any day has a before-school
              activity so we don't waste vertical space. */}
          {hasBefore && (
            <tr className="min-h-[3rem] print:min-h-8">
              <td className="p-2 align-top text-center border border-stone-300 bg-stone-50">
                <div className="text-xs uppercase tracking-wide text-stone-600 font-medium">
                  Before school
                </div>
              </td>
              {week.days.map((day, slot) => {
                const list = placementByDay[slot]?.before ?? []
                if (!day) {
                  return (
                    <td
                      key={slot}
                      className="p-2 align-top border border-stone-300 bg-stone-50/50"
                    />
                  )
                }
                return (
                  <td
                    key={slot}
                    className="p-2 print:p-1.5 align-top text-left border border-stone-300"
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
          {(['1', '2', '3', '4'] as const).map((periodNum, periodIdx) => {
            const timeKey = `p${periodNum}` as 'p1' | 'p2' | 'p3' | 'p4'
            return (
              <tr key={periodNum} className="h-24 print:h-14">
                <td className="p-2 print:p-1.5 align-top text-center border border-stone-300">
                  <div className="font-display text-3xl print:text-xl font-normal text-stone-500 leading-none">
                    {periodNum}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-2 print:mt-0 whitespace-nowrap leading-tight">
                    {PERIOD_TIMES_SHORT.regular[timeKey]}
                  </div>
                  <div className="text-[10px] text-stone-500 italic whitespace-nowrap leading-tight">
                    Wed {PERIOD_TIMES_SHORT.wednesday[timeKey]}
                  </div>
                </td>
                {week.days.map((day, slot) => {
                  // Out-of-range slot (e.g. weeks that start mid-week)
                  if (!day) {
                    return (
                      <td
                        key={slot}
                        className="p-2 align-top border border-stone-300 bg-stone-50/50"
                      ></td>
                    )
                  }

                  // Blocked (no-school) day: merge into a horizontal group
                  // if consecutive blocked days share the same break label,
                  // then rowSpan across all 4 period rows.
                  if (day.isBlocked && !day.hasSpecialSchedule) {
                    const group = groupByDay[slot]
                    if (!group) return null
                    if (periodIdx !== 0 || slot !== group.startIdx) return null
                    return (
                      <td
                        key={slot}
                        colSpan={group.length}
                        rowSpan={4}
                        className="p-3 print:p-2 align-middle text-center border border-stone-300 bg-stone-50"
                      >
                        {group.label && (
                          <div className="text-xs font-medium text-stone-700">
                            {group.label}
                          </div>
                        )}
                      </td>
                    )
                  }

                  // Special-schedule blocked day: single-cell merged vertically
                  // across the 4 period rows (no horizontal grouping).
                  if (day.isBlocked && day.hasSpecialSchedule) {
                    if (periodIdx !== 0) return null
                    const label = shortenBlockedLabel(day.blockedLabel ?? '')
                    return (
                      <td
                        key={slot}
                        rowSpan={4}
                        className="p-3 print:p-2 align-middle text-center border border-stone-300 bg-stone-50"
                      >
                        {label && (
                          <div className="text-xs font-medium text-stone-700">
                            {label}
                          </div>
                        )}
                      </td>
                    )
                  }

                  // Regular class day cell
                  const info = getPeriodInfo(day, periodNum)
                  if (!info || !info.className) {
                    return (
                      <td
                        key={slot}
                        className="p-2 print:p-1.5 align-top text-left border border-stone-300"
                      >
                        <span className="text-stone-400">—</span>
                      </td>
                    )
                  }
                  const inlineActivities =
                    placementByDay[slot]?.[`p${periodNum}` as ActivityPlacement] ?? []
                  return (
                    <td
                      key={slot}
                      className="p-2 print:p-1.5 align-top text-left border border-stone-300"
                    >
                      <div
                        className={`font-medium text-stone-900 break-words leading-tight ${
                          periodNum !== '3' || inlineActivities.length === 0
                            ? 'print:line-clamp-2'
                            : 'print:line-clamp-1'
                        }`}
                      >
                        {info.className}
                      </div>
                      {info.room && (
                        <div className="text-xs text-stone-500 mt-0.5 print:mt-0 break-words leading-tight print:line-clamp-1">
                          <span className="print:hidden">
                            {info.teacher}
                            {info.teacher && info.room ? ' · ' : ''}
                          </span>
                          {info.room}
                        </div>
                      )}
                      {!info.room && info.teacher && (
                        <div className="text-xs text-stone-500 mt-0.5 print:mt-0 break-words leading-tight print:line-clamp-1 print:hidden">
                          {info.teacher}
                        </div>
                      )}
                      {info.lunchLabel && (
                        <div className="text-xs text-stone-500 italic mt-0.5 print:mt-0 break-words leading-tight print:line-clamp-1">
                          {info.lunchLabel}
                          {info.lunchTime && ` · ${info.lunchTime}`}
                        </div>
                      )}
                      {inlineActivities.length > 0 && (
                        <ul className="mt-1 print:mt-0.5 pt-1 print:pt-0.5 border-t border-stone-200 space-y-0.5 print:space-y-0 print:leading-tight">
                          {inlineActivities.map((a, idx) => (
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
            )
          })}
          {/* After-school row — after Period 4. Only rendered if any day has
              an after-school or custom-time activity. */}
          {hasAfter && (
            <tr className="min-h-[3rem] print:min-h-8">
              <td className="p-2 align-top text-center border border-stone-300 bg-stone-50">
                <div className="text-xs uppercase tracking-wide text-stone-600 font-medium">
                  After school
                </div>
              </td>
              {week.days.map((day, slot) => {
                const list = placementByDay[slot]?.after ?? []
                if (!day) {
                  return (
                    <td
                      key={slot}
                      className="p-2 align-top border border-stone-300 bg-stone-50/50"
                    />
                  )
                }
                return (
                  <td
                    key={slot}
                    className="p-2 print:p-1.5 align-top text-left border border-stone-300"
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

      {/* Compact weekend section — single row, 4 cells:
          [Sat date | Sat activities | Sun date | Sun activities]
          Only rendered when the week has any Sat/Sun activities.
          break-inside: avoid so it can't split across pages. */}
      {hasWeekend && (
        <table className="w-full text-sm print:text-xs border border-stone-300 border-collapse table-fixed mt-2 print:break-inside-avoid">
          <colgroup>
            <col style={{ width: '15%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '17%' }} />
            <col style={{ width: '34%' }} />
          </colgroup>
          <tbody>
            <tr>
              {(
                [
                  { key: satKey, weekday: 'Sat', list: satActivities },
                  { key: sunKey, weekday: 'Sun', list: sunActivities },
                ] as const
              ).map(({ key, weekday, list }) => (
                <Fragment key={weekday}>
                  <td className="p-1.5 print:p-1 align-middle text-center border border-stone-300 bg-stone-50">
                    <div className="text-sm print:text-sm font-semibold text-stone-900 uppercase tracking-wide whitespace-nowrap">
                      {weekday} {getMonthShort(key)} {getDayNum(key)}
                    </div>
                  </td>
                  <td className="p-1.5 print:p-1 align-middle text-left border border-stone-300">
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

// ─── Mobile stacked view ───────────────────────────────────────────────────
// Renders one card per school day, with periods listed vertically. Used only
// on small screens (sm:hidden). Print always uses the WeekGrid above.

function WeekStacked({ week, activities }: WeekGridProps) {
  // Anchor "Week of …" to the first day that actually appears in this week
  // (handles ranges that start mid-week without saying "Week of null").
  const firstDay = week.days.find((d) => d !== null) as DaySchedule | undefined
  const weekAnchorKey = firstDay?.dateKey ?? week.weekStart
  const weekAnchorDisplay = formatWeekOfDate(weekAnchorKey)

  // Weekend cards — same idea as the desktop weekend section: shown only when
  // the week has any Sat/Sun activities.
  const satKey = toDateKey(addDays(makeDate(week.weekStart), 5))
  const sunKey = toDateKey(addDays(makeDate(week.weekStart), 6))
  const satActivities = activitiesForDateKey(satKey, activities)
  const sunActivities = activitiesForDateKey(sunKey, activities)

  return (
    <div>
      <div className="mb-3 text-xs uppercase tracking-widest font-medium text-stone-500">
        Week of {weekAnchorDisplay}
      </div>
      <div className="space-y-3">
        {week.days.map((day, idx) => {
          if (!day) return null
          const weekday = WEEKDAY_HEADERS[idx]
          const isWed = idx === 2
          return (
            <DayStacked
              key={day.dateKey}
              day={day}
              weekday={weekday}
              isWednesday={isWed}
              activities={activitiesForDay(day, activities)}
            />
          )
        })}
        {satActivities.length > 0 && (
          <WeekendDayStacked
            dateKey={satKey}
            weekday="Saturday"
            activities={satActivities}
          />
        )}
        {sunActivities.length > 0 && (
          <WeekendDayStacked
            dateKey={sunKey}
            weekday="Sunday"
            activities={sunActivities}
          />
        )}
      </div>
    </div>
  )
}

/** Compact weekend day card for the mobile stacked view. No periods — just
 *  the date/weekday header and the activity list. */
function WeekendDayStacked({
  dateKey,
  weekday,
  activities,
}: {
  dateKey: string
  weekday: string
  activities: Activity[]
}) {
  const monthDay = formatMonthDayLong(dateKey)
  return (
    <div className="border border-stone-300 bg-white px-3 py-2.5 rounded-md">
      <div className="text-base font-medium text-stone-900">
        {weekday}, {monthDay}
      </div>
      <ul className="mt-2 space-y-0.5 text-sm text-stone-700">
        {activities.map((a) => (
          <li key={a.id} className="break-words">
            <span className="tabular-nums font-medium">
              {formatTimeCompact(a.startTime)}
            </span>{' '}
            {a.name}
            {a.location.trim() && (
              <span className="text-stone-500">
                {' · '}
                {a.location.trim()}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function DayStacked({
  day,
  weekday,
  isWednesday,
  activities,
}: {
  day: DaySchedule
  weekday: string
  isWednesday: boolean
  activities: Activity[]
}) {
  const monthDay = formatMonthDayLong(day.dateKey)

  // Blocked (no-school or special-schedule) day
  if (day.isBlocked) {
    const label = shortenBlockedLabel(day.blockedLabel ?? '')
    const fallback = day.hasSpecialSchedule ? 'Special schedule' : 'No school'
    return (
      <div className="border border-stone-300 bg-stone-50 px-3 py-2 rounded-md">
        <div className="text-base font-medium text-stone-900">
          {weekday}, {monthDay}
        </div>
        <div className="text-sm text-stone-600 mt-0.5">
          {label || fallback}
        </div>
      </div>
    )
  }

  const isGreen = day.dayColor === 'G'
  const dayLabel = isGreen ? 'Green Day' : 'Silver Day'
  const dotColor = isGreen ? 'bg-village-600' : 'bg-stone-300'
  const timesKey = isWednesday ? 'wednesday' : 'regular'

  // Split activities using the same placement logic as the desktop grid so
  // "before school" activities appear above periods, in-school activities
  // appear next to their matching period, and "after school" activities
  // appear below.
  const buckets = activitiesByPlacement(day, activities)
  const beforeActivities = buckets.before
  const afterActivities = buckets.after

  return (
    <div className="border border-stone-300 bg-white px-3 py-2.5 rounded-md">
      <div className="text-base font-medium text-stone-900">
        {weekday}, {monthDay}
      </div>
      <div className="text-sm text-stone-600 mb-2 inline-flex items-center gap-1.5">
        <span
          className={`inline-block w-3 h-3 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
        <span>
          {dayLabel}
          {isWednesday ? ' · Late Start' : ''}
        </span>
      </div>
      {beforeActivities.length > 0 && (
        <ul className="mb-2 space-y-0.5 text-sm text-stone-700">
          {beforeActivities.map((a) => (
            <li key={a.id} className="break-words">
              <span className="tabular-nums font-medium">
                {formatTimeCompact(a.startTime)}
              </span>{' '}
              {a.name}
              {a.location.trim() && (
                <span className="text-stone-500">
                  {' · '}
                  {a.location.trim()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <ul className="space-y-1 text-sm text-stone-800">
        {(['1', '2', '3', '4'] as const).map((periodNum) => {
          const timeKey = `p${periodNum}` as 'p1' | 'p2' | 'p3' | 'p4'
          const time = PERIOD_TIMES_SHORT[timesKey][timeKey]
          const info = getPeriodInfo(day, periodNum)
          const inlineActivities =
            buckets[`p${periodNum}` as ActivityPlacement] ?? []
          return (
            <Fragment key={periodNum}>
              <li className="break-words">
                <span className="tabular-nums font-medium">{periodNum}</span>
                <Sep />
                <span className="tabular-nums text-stone-600">{time}</span>
                {info?.className ? (
                  <>
                    <Sep />
                    <span>{info.className}</span>
                    {info.teacher && (
                      <>
                        <Sep />
                        <span>{info.teacher}</span>
                      </>
                    )}
                    {info.room && (
                      <>
                        <Sep />
                        <span>{info.room}</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Sep />
                    <span className="text-stone-400">—</span>
                  </>
                )}
              </li>
              {periodNum === '3' && info?.lunchLabel && (
                <li className="text-stone-600">
                  <span>{info.lunchLabel}</span>
                  {info.lunchTime && (
                    <>
                      <Sep />
                      <span className="tabular-nums">{info.lunchTime}</span>
                    </>
                  )}
                </li>
              )}
              {inlineActivities.map((a) => (
                <li
                  key={a.id}
                  className="text-stone-700 text-sm pl-6 break-words"
                >
                  <span className="tabular-nums font-medium">
                    {formatTimeCompact(a.startTime)}
                  </span>{' '}
                  {a.name}
                  {a.location.trim() && (
                    <span className="text-stone-500">
                      {' · '}
                      {a.location.trim()}
                    </span>
                  )}
                </li>
              ))}
            </Fragment>
          )
        })}
      </ul>
      {afterActivities.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm text-stone-700">
          {afterActivities.map((a) => (
            <li key={a.id} className="break-words">
              <span className="tabular-nums font-medium">
                {formatTimeCompact(a.startTime)}
              </span>{' '}
              {a.name}
              {a.location.trim() && (
                <span className="text-stone-500">
                  {' · '}
                  {a.location.trim()}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Small middot separator between fields in the stacked day list. */
function Sep() {
  return <span className="mx-1.5 text-stone-400">·</span>
}

/** "2026-08-04" → "August 4, 2026" */
function formatWeekOfDate(dateKey: string): string {
  return makeDate(dateKey).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** "2026-08-04" → "August 4" */
function formatMonthDayLong(dateKey: string): string {
  return makeDate(dateKey).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}
