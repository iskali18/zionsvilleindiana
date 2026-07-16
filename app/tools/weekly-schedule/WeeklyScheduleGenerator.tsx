'use client'

import { useEffect, useState } from 'react'

// ─── Constants ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'weekly-schedule-v1'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// ─── Types ─────────────────────────────────────────────────────────────────

/** A single class or period within a schedule block. */
interface Entry {
  id: string
  daysOfWeek: number[] // 0=Sun … 6=Sat, defaults to [1,2,3,4,5]
  startTime: string // "HH:MM" 24-hour
  endTime: string // "HH:MM" 24-hour
  label: string // "Social Studies", "Lunch", "Recess", "Period 3 - Math"
  teacher: string // optional
  room: string // optional
}

/** A date range with its own list of entries. Parents can add multiple blocks
 *  to cover a school year, semester, trimester, or any other period. */
interface ScheduleBlock {
  id: string
  startDate: string // "YYYY-MM-DD"
  endDate: string // "YYYY-MM-DD"
  entries: Entry[]
}

/** A single date or date range to exclude from the printed calendar (breaks,
 *  holidays, family vacations, etc.). Renders as a merged cell. */
interface OffDay {
  id: string
  label: string // "Fall Break", "Family Vacation"
  startDate: string // required — "YYYY-MM-DD"
  endDate: string // optional — if empty, single-day off
}

/** An activity like a club, sport, lesson, or appointment. Same shape as
 *  ZCHS tool's Activity so we can reuse the caps/rendering logic. */
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

/** Top-level per-student state. Multiple students share tabs. */
interface Student {
  id: string
  studentName: string
  useZcsCalendar: boolean // when true, ZCS breaks/holidays pre-loaded
  schedules: ScheduleBlock[]
  offDays: OffDay[]
  activities: Activity[]
}

// ─── ID generation ─────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

// ─── Date helpers ──────────────────────────────────────────────────────────

/** Convert a Date to "YYYY-MM-DD" using local timezone (not UTC). */
function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse "YYYY-MM-DD" as a local-timezone Date. */
function makeDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Human-readable formatter for date pickers, headings, etc. */
function formatFullDate(dateKey: string): string {
  if (!dateKey) return ''
  return makeDate(dateKey).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Factory functions ─────────────────────────────────────────────────────

function createEmptyEntry(): Entry {
  return {
    id: generateId('e'),
    daysOfWeek: [1, 2, 3, 4, 5], // Mon–Fri default
    startTime: '',
    endTime: '',
    label: '',
    teacher: '',
    room: '',
  }
}

function createEmptyScheduleBlock(): ScheduleBlock {
  return {
    id: generateId('sb'),
    startDate: '',
    endDate: '',
    entries: [],
  }
}

function createEmptyOffDay(): OffDay {
  return {
    id: generateId('od'),
    label: '',
    startDate: '',
    endDate: '',
  }
}

function createEmptyActivity(): Activity {
  return {
    id: generateId('a'),
    name: '',
    startTime: '',
    endTime: '',
    daysOfWeek: [],
    startDate: '',
    endDate: '',
    location: '',
    schoolDaysOnly: true,
  }
}

function createEmptyStudent(): Student {
  return {
    id: generateId('s'),
    studentName: '',
    useZcsCalendar: true,
    schedules: [],
    offDays: [],
    activities: [],
  }
}

function getStudentDisplayName(s: Student | undefined, idx: number): string {
  if (!s) return `Student ${idx + 1}`
  return s.studentName.trim() || `Student ${idx + 1}`
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function WeeklyScheduleGenerator() {
  const [students, setStudents] = useState<Student[]>(() => [createEmptyStudent()])
  const [activeStudentId, setActiveStudentId] = useState<string>(() => students[0]!.id)
  const [printStartDate, setPrintStartDate] = useState<string>('')
  const [printEndDate, setPrintEndDate] = useState<string>('')
  const [validationError, setValidationError] = useState<string>('')
  const [hasLoaded, setHasLoaded] = useState(false)

  // ─── Persistence ────────────────────────────────────────────────────────

  // Load from localStorage on mount.
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
          // Backfill defaults for any older schema
          const restored: Student[] = parsed.students.map((s: Partial<Student>) => ({
            id: s.id || generateId('s'),
            studentName: s.studentName || '',
            useZcsCalendar:
              typeof s.useZcsCalendar === 'boolean' ? s.useZcsCalendar : true,
            schedules: Array.isArray(s.schedules) ? s.schedules : [],
            offDays: Array.isArray(s.offDays) ? s.offDays : [],
            activities: Array.isArray(s.activities) ? s.activities : [],
          }))
          setStudents(restored)
          setActiveStudentId(
            parsed.activeStudentId && restored.some((s) => s.id === parsed.activeStudentId)
              ? parsed.activeStudentId
              : restored[0]!.id
          )
          if (typeof parsed.printStartDate === 'string')
            setPrintStartDate(parsed.printStartDate)
          if (typeof parsed.printEndDate === 'string')
            setPrintEndDate(parsed.printEndDate)
        }
      }
    } catch {
      /* ignore */
    }
    setHasLoaded(true)
  }, [])

  // Persist on any change (after initial load).
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

  // ─── Derived state ──────────────────────────────────────────────────────

  const activeStudent =
    students.find((s) => s.id === activeStudentId) || students[0]!

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

  const handleStudentNameChange = (name: string) => {
    updateActiveStudent((s) => ({ ...s, studentName: name }))
  }

  const handleToggleCalendar = (useZcs: boolean) => {
    updateActiveStudent((s) => ({ ...s, useZcsCalendar: useZcs }))
  }

  // ─── Schedule block mutations ──────────────────────────────────────────

  const handleAddScheduleBlock = () => {
    updateActiveStudent((s) => ({
      ...s,
      schedules: [...s.schedules, createEmptyScheduleBlock()],
    }))
  }

  const handleUpdateScheduleBlock = (
    blockId: string,
    patch: Partial<ScheduleBlock>
  ) => {
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId ? { ...b, ...patch } : b
      ),
    }))
  }

  const handleDeleteScheduleBlock = (blockId: string) => {
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.filter((b) => b.id !== blockId),
    }))
  }

  const handleAddEntry = (blockId: string) => {
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId ? { ...b, entries: [...b.entries, createEmptyEntry()] } : b
      ),
    }))
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
    updateActiveStudent((s) => ({
      ...s,
      schedules: s.schedules.map((b) =>
        b.id === blockId
          ? { ...b, entries: b.entries.filter((e) => e.id !== entryId) }
          : b
      ),
    }))
  }

  // ─── Off-day mutations ──────────────────────────────────────────────────

  const handleAddOffDay = () => {
    updateActiveStudent((s) => ({
      ...s,
      offDays: [...s.offDays, createEmptyOffDay()],
    }))
  }

  const handleUpdateOffDay = (offDayId: string, patch: Partial<OffDay>) => {
    updateActiveStudent((s) => ({
      ...s,
      offDays: s.offDays.map((o) =>
        o.id === offDayId ? { ...o, ...patch } : o
      ),
    }))
  }

  const handleDeleteOffDay = (offDayId: string) => {
    updateActiveStudent((s) => ({
      ...s,
      offDays: s.offDays.filter((o) => o.id !== offDayId),
    }))
  }

  // ─── Generate / print ──────────────────────────────────────────────────

  const handleGenerate = () => {
    setValidationError('')
    if (!printStartDate || !printEndDate) {
      setValidationError('Please choose both a start date and an end date.')
      return
    }
    if (printStartDate > printEndDate) {
      setValidationError('The start date must be on or before the end date.')
      return
    }
    // Check every date in the range is covered by at least one schedule block
    const uncovered = findUncoveredRange(
      printStartDate,
      printEndDate,
      activeStudent.schedules
    )
    if (uncovered) {
      setValidationError(
        `You don't have a schedule for these dates. Add a schedule for ${formatFullDate(
          uncovered.start
        )} – ${formatFullDate(uncovered.end)} first.`
      )
      return
    }
    // TODO: Actually generate the calendar
    setValidationError('')
    window.print()
  }

  const handlePrint = () => {
    window.print()
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Title + intro */}
      <div className="print:hidden">
        <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mb-2">
          Weekly School Schedule Maker
        </h1>
        <p className="text-stone-700 mb-2 max-w-[720px]">
          Create a one-page weekly schedule for classes, lunch, recess, and
          activities.
        </p>
        <p className="text-stone-600 mb-6 max-w-[720px] text-sm">
          For elementary, middle school, private school, or homeschool
          schedules that repeat each week.
        </p>
        <p className="text-sm text-stone-500 mb-8 max-w-[720px]">
          For ZCHS students on Green/Silver days, use the{' '}
          <a
            href="/tools/zchs-schedule"
            className="text-brick-600 hover:text-brick-700 hover:underline"
          >
            ZCHS Weekly Schedule Maker
          </a>
          .
        </p>

        {/* Student tabs */}
        <div className="mb-6 border-b border-stone-300 flex flex-wrap gap-1">
          {students.map((s, idx) => {
            const isActive = s.id === activeStudentId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStudentId(s.id)}
                className={
                  isActive
                    ? 'px-4 py-2 text-sm font-medium border-b-2 border-village-600 text-village-700'
                    : 'px-4 py-2 text-sm font-medium border-b-2 border-transparent text-stone-500 hover:text-stone-700'
                }
              >
                {getStudentDisplayName(s, idx)}
              </button>
            )
          })}
          <button
            type="button"
            onClick={handleAddStudent}
            className="px-4 py-2 text-sm font-medium text-brick-600 hover:text-brick-700"
          >
            + Add student
          </button>
        </div>

        {/* Student name */}
        <div className="mb-6 max-w-[720px]">
          <label className="block">
            <span className="text-sm font-medium text-stone-700 block mb-2">
              Student name
            </span>
            <input
              type="text"
              value={activeStudent.studentName}
              onChange={(e) => handleStudentNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
              placeholder="e.g. Sam"
            />
          </label>
        </div>

        {/* Calendar toggle */}
        <div className="mb-8 max-w-[720px]">
          <label className="text-sm font-medium text-stone-700 block mb-2">
            School calendar
          </label>
          <div className="flex flex-wrap gap-2">
            {(
              [
                {
                  value: true,
                  label: 'Use ZCS breaks and holidays',
                  example: 'For ZCS students and private schools that follow ZCS',
                },
                {
                  value: false,
                  label: 'Set my own breaks and holidays',
                  example: 'For homeschool, or private schools with a different calendar',
                },
              ] as const
            ).map((opt) => {
              const selected = activeStudent.useZcsCalendar === opt.value
              return (
                <div key={String(opt.value)}>
                  <button
                    type="button"
                    onClick={() => handleToggleCalendar(opt.value)}
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
        </div>

        {/* ─── Schedules section ─────────────────────────────────────── */}
        <section className="mb-8 max-w-[720px]">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Schedules
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Add one or more schedules. Each covers a date range.
              </p>
            </div>
            {activeStudent.schedules.length > 0 && (
              <button
                type="button"
                onClick={handleAddScheduleBlock}
                className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
              >
                + Add another schedule
              </button>
            )}
          </div>

          {activeStudent.schedules.length === 0 && (
            <div className="border border-dashed border-stone-300 rounded-md p-6 text-center">
              <p className="text-sm text-stone-600 mb-3">
                No schedule yet. Add one to get started.
              </p>
              <button
                type="button"
                onClick={handleAddScheduleBlock}
                className="px-4 py-2 text-sm rounded-md bg-village-600 text-white font-medium hover:bg-village-700"
              >
                + Add schedule
              </button>
            </div>
          )}

          <div className="space-y-4">
            {activeStudent.schedules.map((block, idx) => (
              <ScheduleBlockEditor
                key={block.id}
                block={block}
                index={idx}
                onUpdate={(patch) => handleUpdateScheduleBlock(block.id, patch)}
                onDelete={() => handleDeleteScheduleBlock(block.id)}
                onAddEntry={() => handleAddEntry(block.id)}
                onUpdateEntry={(entryId, patch) =>
                  handleUpdateEntry(block.id, entryId, patch)
                }
                onDeleteEntry={(entryId) => handleDeleteEntry(block.id, entryId)}
              />
            ))}
          </div>

          {activeStudent.schedules.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddScheduleBlock}
                className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
              >
                + Add another schedule
              </button>
            </div>
          )}
        </section>

        {/* ─── Off-days section ─────────────────────────────────────── */}
        <section className="mb-8 max-w-[720px]">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-stone-900">
                Off days
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                Days with no school — breaks, holidays, family vacations.
                {activeStudent.useZcsCalendar &&
                  ' ZCS breaks and holidays are already included. Add anything extra here.'}
              </p>
            </div>
            {activeStudent.offDays.length > 0 && (
              <button
                type="button"
                onClick={handleAddOffDay}
                className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
              >
                + Add off day
              </button>
            )}
          </div>

          {activeStudent.offDays.length === 0 && (
            <button
              type="button"
              onClick={handleAddOffDay}
              className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
            >
              + Add off day
            </button>
          )}

          <div className="space-y-2">
            {activeStudent.offDays.map((offDay) => (
              <OffDayEditor
                key={offDay.id}
                offDay={offDay}
                onUpdate={(patch) => handleUpdateOffDay(offDay.id, patch)}
                onDelete={() => handleDeleteOffDay(offDay.id)}
              />
            ))}
          </div>
        </section>

        {/* ─── Activities section — placeholder for now ────────────────── */}
        <section className="mb-8 max-w-[720px]">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-2">
            Activities
          </h2>
          <p className="text-sm text-stone-500 mb-4">
            Optional. Add clubs, sports, lessons, rehearsals, etc.
          </p>
          <p className="text-sm text-stone-400 italic">
            (Coming soon — will match the ZCHS activity editor.)
          </p>
        </section>

        {/* ─── Print date range ────────────────────────────────────────── */}
        <section className="mb-6 max-w-[720px]">
          <h2 className="font-display text-xl font-semibold text-stone-900 mb-3">
            Print dates
          </h2>
          <div className="flex flex-wrap gap-3">
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
        </section>

        {/* ─── Validation error ───────────────────────────────────────── */}
        {validationError && (
          <div className="mb-4 p-3 bg-brick-50 border border-brick-200 rounded-md text-sm text-brick-700 max-w-[720px]">
            {validationError}
          </div>
        )}

        {/* ─── Action buttons ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-6 max-w-[720px]">
          <button
            type="button"
            onClick={handleGenerate}
            className="px-4 py-2 text-sm rounded-md bg-village-600 text-white font-medium hover:bg-village-700"
          >
            Generate schedule
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-sm rounded-md border border-stone-300 bg-white text-stone-700 font-medium hover:border-stone-400"
          >
            Print schedule
          </button>
        </div>

        <p className="text-sm text-stone-500 mb-8 max-w-[720px]">
          Print is condensed. Screen preview shows all details.
        </p>

        <p className="text-xs text-stone-500 max-w-[720px]">
          Saved only in this browser. Nothing is sent to ZionsvilleIndiana.com.
        </p>
      </div>
    </div>
  )
}

// ─── Schedule block editor ─────────────────────────────────────────────────

function ScheduleBlockEditor({
  block,
  index,
  onUpdate,
  onDelete,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
}: {
  block: ScheduleBlock
  index: number
  onUpdate: (patch: Partial<ScheduleBlock>) => void
  onDelete: () => void
  onAddEntry: () => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
}) {
  return (
    <div className="border border-stone-300 rounded-md p-4 bg-white">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-medium text-stone-900">Schedule {index + 1}</h3>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-500 hover:text-stone-900 hover:underline"
        >
          Remove schedule
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <label className="block">
          <span className="text-sm font-medium text-stone-700 block mb-1">
            Start date
          </span>
          <input
            type="date"
            value={block.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
            className="px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-stone-700 block mb-1">
            End date
          </span>
          <input
            type="date"
            value={block.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
            className="px-3 py-2 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
      </div>

      {block.entries.length === 0 && (
        <p className="text-sm text-stone-500 mb-3">
          No classes or periods added yet.
        </p>
      )}

      <div className="space-y-2 mb-3">
        {block.entries.map((entry) => (
          <EntryEditor
            key={entry.id}
            entry={entry}
            onUpdate={(patch) => onUpdateEntry(entry.id, patch)}
            onDelete={() => onDeleteEntry(entry.id)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={onAddEntry}
        className="text-sm text-brick-600 hover:text-brick-700 hover:underline font-medium"
      >
        + Add class or period
      </button>
    </div>
  )
}

// ─── Entry editor ──────────────────────────────────────────────────────────

function EntryEditor({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: Entry
  onUpdate: (patch: Partial<Entry>) => void
  onDelete: () => void
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

      <div className="mb-2">
        <span className="text-xs font-medium text-stone-700 block mb-1">
          Days of week
        </span>
        <div className="flex flex-wrap gap-1">
          {([1, 2, 3, 4, 5, 6, 0] as const).map((jsDay) => {
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

      <div className="text-right">
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-stone-500 hover:text-stone-900 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Off-day editor ────────────────────────────────────────────────────────

function OffDayEditor({
  offDay,
  onUpdate,
  onDelete,
}: {
  offDay: OffDay
  onUpdate: (patch: Partial<OffDay>) => void
  onDelete: () => void
}) {
  return (
    <div className="border border-stone-200 rounded-md p-3 bg-white">
      <div className="flex flex-wrap gap-3 items-end">
        <label className="block flex-1 min-w-[160px]">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Label
          </span>
          <input
            type="text"
            value={offDay.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="e.g. Family Vacation"
            className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            Start date
          </span>
          <input
            type="date"
            value={offDay.startDate}
            onChange={(e) => onUpdate({ startDate: e.target.value })}
            className="px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-stone-700 block mb-1">
            End date (optional)
          </span>
          <input
            type="date"
            value={offDay.endDate}
            onChange={(e) => onUpdate({ endDate: e.target.value })}
            className="px-2 py-1.5 text-sm border border-stone-300 rounded-md focus:border-village-600 focus:ring-1 focus:ring-village-600 outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm text-stone-500 hover:text-stone-900 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  )
}

// ─── Coverage check ────────────────────────────────────────────────────────

/** Find the earliest sub-range within [start, end] not covered by any schedule
 *  block. Returns null if the entire range is covered. */
function findUncoveredRange(
  start: string,
  end: string,
  schedules: ScheduleBlock[]
): { start: string; end: string } | null {
  if (schedules.length === 0) return { start, end }
  const validBlocks = schedules
    .filter((b) => b.startDate && b.endDate && b.startDate <= b.endDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))

  if (validBlocks.length === 0) return { start, end }

  let cur = makeDate(start)
  const finalDate = makeDate(end)
  while (cur <= finalDate) {
    const curKey = toDateKey(cur)
    const covering = validBlocks.find(
      (b) => b.startDate <= curKey && curKey <= b.endDate
    )
    if (!covering) {
      // Find how far this uncovered stretch runs
      let stretchEnd = new Date(cur)
      while (stretchEnd <= finalDate) {
        const stretchKey = toDateKey(stretchEnd)
        const covered = validBlocks.some(
          (b) => b.startDate <= stretchKey && stretchKey <= b.endDate
        )
        if (covered) break
        const next = new Date(stretchEnd)
        next.setDate(next.getDate() + 1)
        stretchEnd = next
      }
      // stretchEnd is now one past the last uncovered date
      const lastUncovered = new Date(stretchEnd)
      lastUncovered.setDate(lastUncovered.getDate() - 1)
      return { start: curKey, end: toDateKey(lastUncovered) }
    }
    // Jump to end of this covering block + 1
    cur = makeDate(covering.endDate)
    cur.setDate(cur.getDate() + 1)
  }
  return null
}
