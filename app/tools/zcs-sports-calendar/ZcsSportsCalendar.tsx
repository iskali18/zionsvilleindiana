'use client'

import { useMemo, useState } from 'react'
import type {
  AthleticEvent,
  EventLevel,
  Gender,
  HomeAway,
  School,
} from '@/lib/zcs-sports'
import {
  filterEvents,
  getLevelOptions,
  getSportOptions,
} from '@/lib/zcs-sports'

// ─── Constants ─────────────────────────────────────────────────────────────

const SCHOOL_FULL_NAMES: Record<School, string> = {
  ZCHS: 'Zionsville High School',
  ZMS: 'Zionsville Middle School',
  ZWMS: 'Zionsville West Middle School',
}

const LEVEL_LABELS: Record<string, string> = {
  V: 'Varsity',
  JV: 'JV',
  Fr: 'Freshman',
  C: 'C-team',
  MS: 'MS',
  '7th': '7th',
  '8th': '8th',
}

const GENDER_LABELS: Record<Gender | string, string> = {
  Boys: 'Boys',
  Girls: 'Girls',
  Coed: 'Co-ed',
  unknown: '',
}

const HOME_AWAY_LABELS: Record<HomeAway, string> = {
  H: 'Home',
  A: 'Away',
  N: 'Neutral',
}

type DatePreset = 'today' | 'next7' | 'next30' | 'all' | 'custom'

const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'next7', label: 'Next 7 days' },
  { value: 'next30', label: 'Next 30 days' },
  { value: 'all', label: 'Full season' },
  { value: 'custom', label: 'Custom' },
]

const DATE_PRESET_LABELS: Record<DatePreset, string> = {
  today: 'Today',
  next7: 'Next 7 days',
  next30: 'Next 30 days',
  all: 'Full season',
  custom: 'Custom range',
}

// Default filter state — used for initial render AND "Clear all"
const DEFAULTS = {
  schools: [] as School[],
  sport: '',
  genders: [] as Gender[],
  datePreset: 'next30' as DatePreset,
  startDate: '',
  endDate: '',
  levels: [] as EventLevel[],
  homeAway: [] as HomeAway[],
  includeScrimmages: false,
}

// ─── Main component ────────────────────────────────────────────────────────

interface Props {
  events: AthleticEvent[]
  fetchedAt: string
  errors: { school: School; message: string }[]
}

export default function ZcsSportsCalendar({ events, fetchedAt, errors }: Props) {
  const [schools, setSchools] = useState<School[]>(DEFAULTS.schools)
  const [sport, setSport] = useState<string>(DEFAULTS.sport)
  const [genders, setGenders] = useState<Gender[]>(DEFAULTS.genders)
  const [datePreset, setDatePreset] = useState<DatePreset>(DEFAULTS.datePreset)
  const [startDate, setStartDate] = useState(DEFAULTS.startDate)
  const [endDate, setEndDate] = useState(DEFAULTS.endDate)
  const [levels, setLevels] = useState<EventLevel[]>(DEFAULTS.levels)
  const [homeAway, setHomeAway] = useState<HomeAway[]>(DEFAULTS.homeAway)
  const [includeScrimmages, setIncludeScrimmages] = useState<boolean>(
    DEFAULTS.includeScrimmages
  )
  const [showAdvanced, setShowAdvanced] = useState(false)

  const sportOptions = useMemo(() => getSportOptions(events), [events])
  const levelOptions = useMemo(
    () => getLevelOptions(events).filter((l) => l !== 'unknown'),
    [events]
  )

  const dateRange = useMemo(
    () => computeDateRange(datePreset, startDate, endDate),
    [datePreset, startDate, endDate]
  )

  const filtered = useMemo(() => {
    let result = filterEvents(events, {
      schools: schools.length ? schools : undefined,
      sports: sport ? [sport] : undefined,
      genders: genders.length ? genders : undefined,
      levels: levels.length ? levels : undefined,
      homeAway: homeAway.length ? homeAway : undefined,
      includeScrimmages,
    })
    if (dateRange.start)
      result = result.filter((e) => easternDate(e.startTime) >= dateRange.start!)
    if (dateRange.end)
      result = result.filter((e) => easternDate(e.startTime) <= dateRange.end!)
    return result
  }, [
    events,
    schools,
    sport,
    genders,
    levels,
    homeAway,
    includeScrimmages,
    dateRange,
  ])

  const grouped = useMemo(() => groupByEasternDate(filtered), [filtered])

  const advancedActive =
    levels.length > 0 ||
    homeAway.length > 0 ||
    includeScrimmages !== DEFAULTS.includeScrimmages

  const showAdvancedSection = showAdvanced || advancedActive

  const anyFilterActive =
    schools.length > 0 ||
    sport !== '' ||
    genders.length > 0 ||
    datePreset !== DEFAULTS.datePreset ||
    startDate !== '' ||
    endDate !== '' ||
    advancedActive

  const clearAll = () => {
    setSchools(DEFAULTS.schools)
    setSport(DEFAULTS.sport)
    setGenders(DEFAULTS.genders)
    setDatePreset(DEFAULTS.datePreset)
    setStartDate(DEFAULTS.startDate)
    setEndDate(DEFAULTS.endDate)
    setLevels(DEFAULTS.levels)
    setHomeAway(DEFAULTS.homeAway)
    setIncludeScrimmages(DEFAULTS.includeScrimmages)
  }

  const summary = buildSummary({
    schools,
    sport,
    genders,
    datePreset,
    startDate,
    endDate,
  })
  const freshness = formatFreshness(fetchedAt)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-bold mb-4">
        ZCS Sports Calendar
      </h1>

      <p className="text-stone-700 mb-8">
        Find athletic events for ZCHS, ZMS, and ZWMS by school, sport, level,
        and date.
      </p>

      {/* Filter card */}
      <section className="mb-10 p-6 bg-stone-50 border border-stone-200 rounded-lg">
        <h2 className="font-display text-lg font-semibold text-stone-900 leading-tight mb-5">
          Filter events
        </h2>

        <div className="space-y-5">
          <FilterCategory label="School">
            <ExclusivePillGroup
              options={(['ZCHS', 'ZMS', 'ZWMS'] as School[]).map((v) => ({
                value: v,
                label: v,
                tooltip: SCHOOL_FULL_NAMES[v],
              }))}
              selected={schools}
              onChange={setSchools}
            />
          </FilterCategory>

          <FilterCategory label="Sport">
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-stone-300 rounded bg-white text-stone-700 font-medium"
            >
              <option value="">All sports</option>
              {sportOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FilterCategory>

          <FilterCategory label="Gender">
            <ExclusivePillGroup
              options={(['Girls', 'Boys', 'Coed'] as Gender[]).map((g) => ({
                value: g,
                label: GENDER_LABELS[g] ?? g,
              }))}
              selected={genders}
              onChange={setGenders}
            />
          </FilterCategory>

          <FilterCategory label="Date range">
            <div className="flex flex-wrap gap-2">
              {DATE_PRESET_OPTIONS.map((opt) => (
                <PillToggle
                  key={opt.value}
                  label={opt.label}
                  active={datePreset === opt.value}
                  onClick={() => setDatePreset(opt.value)}
                />
              ))}
            </div>
            {datePreset === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-stone-300 rounded bg-white text-stone-700 font-medium"
                  aria-label="Start date"
                />
                <span className="text-sm text-stone-600">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-stone-300 rounded bg-white text-stone-700 font-medium"
                  aria-label="End date"
                />
              </div>
            )}
          </FilterCategory>

          {/* Advanced filters — hidden by default */}
          {showAdvancedSection && (
            <>
              <FilterCategory label="Level">
                <ExclusivePillGroup
                  options={levelOptions.map((l) => ({
                    value: l,
                    label: LEVEL_LABELS[l] ?? l,
                  }))}
                  selected={levels}
                  onChange={setLevels}
                />
              </FilterCategory>

              <FilterCategory label="Location">
                <ExclusivePillGroup
                  options={(['H', 'A', 'N'] as HomeAway[]).map((v) => ({
                    value: v,
                    label: HOME_AWAY_LABELS[v],
                    tooltip:
                      v === 'N'
                        ? 'Neutral site (invitationals, tournaments)'
                        : undefined,
                  }))}
                  selected={homeAway}
                  onChange={setHomeAway}
                />
              </FilterCategory>

              <div>
                <PillToggle
                  label="Include scrimmages"
                  active={includeScrimmages}
                  onClick={() => setIncludeScrimmages(!includeScrimmages)}
                />
              </div>
            </>
          )}

          <div className="pt-1 text-sm">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvancedSection)}
              className="text-brick-600 hover:text-brick-700 hover:underline font-medium"
            >
              {showAdvancedSection ? 'Hide filters' : 'More filters'}
            </button>
            {anyFilterActive && (
              <>
                <span className="text-stone-400 mx-2" aria-hidden="true">
                  ·
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-stone-600 hover:text-stone-900 hover:underline"
                >
                  Reset filters
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Result summary — different when at defaults vs when a filter is active */}
      {anyFilterActive ? (
        <p className="text-stone-700 mb-1">
          <span className="font-semibold">Showing:</span> {summary}
        </p>
      ) : (
        <p className="text-stone-700 mb-1">
          Showing events for the next 30 days.
        </p>
      )}
      <p className="text-sm text-stone-500 mb-2">
        {filtered.length} {filtered.length === 1 ? 'event' : 'events'} · Updated{' '}
        {freshness}
      </p>
      <p className="text-sm text-stone-600 mb-6">
        Times can change. Confirm with the school before game day.
      </p>

      {/* Partial-fetch errors */}
      {errors.length > 0 && (
        <div className="p-4 mb-6 text-sm bg-amber-50 border border-amber-200 rounded">
          Data could not be loaded for:{' '}
          {errors.map((e) => SCHOOL_FULL_NAMES[e.school]).join(', ')}. Try
          refreshing the page.
        </div>
      )}

      {/* Event list */}
      {Object.keys(grouped).length === 0 ? (
        <p className="text-stone-600 mb-6">
          No events match your filters. Try{' '}
          <button
            type="button"
            onClick={clearAll}
            className="text-brick-600 hover:text-brick-700 hover:underline"
          >
            clearing all
          </button>{' '}
          to see every event.
        </p>
      ) : (
        Object.entries(grouped).map(([dateKey, dayEvents]) => (
          <DateBlock key={dateKey} dateKey={dateKey} events={dayEvents} />
        ))
      )}
    </div>
  )
}

// ─── Filter sub-components ─────────────────────────────────────────────────

function FilterCategory({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-widest font-medium text-brick-600 mb-2 leading-tight">
        {label}
      </h3>
      {children}
    </div>
  )
}

/**
 * Pill group with an "All" pseudo-pill for exclusive-or-multi-select behavior:
 *   - "All" active ⇔ no specifics selected (empty array).
 *   - Clicking "All" clears specifics.
 *   - Clicking a specific toggles it; if that leaves specifics empty, "All"
 *     is implicitly reactivated.
 *   - Multiple specifics can be selected at once.
 */
function ExclusivePillGroup<T extends string>({
  allLabel = 'All',
  options,
  selected,
  onChange,
}: {
  allLabel?: string
  options: { value: T; label: string; tooltip?: string }[]
  selected: T[]
  onChange: (next: T[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <PillToggle
        label={allLabel}
        active={selected.length === 0}
        onClick={() => onChange([])}
      />
      {options.map((opt) => (
        <PillToggle
          key={opt.value}
          label={opt.label}
          active={selected.includes(opt.value)}
          onClick={() => {
            if (selected.includes(opt.value)) {
              onChange(selected.filter((v) => v !== opt.value))
            } else {
              onChange([...selected, opt.value])
            }
          }}
          tooltip={opt.tooltip}
        />
      ))}
    </div>
  )
}

/**
 * Single pill toggle matching the ZcsCalendar Toggle exactly: green fill +
 * white checkmark when active, white with empty circle when inactive.
 */
function PillToggle({
  label,
  active,
  onClick,
  tooltip,
}: {
  label: string
  active: boolean
  onClick: () => void
  tooltip?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
      title={tooltip}
      className={
        active
          ? 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-village-600 bg-village-600 text-white font-medium transition-colors'
          : 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border border-stone-300 bg-white text-stone-600 font-medium hover:border-stone-400 hover:text-stone-900 transition-colors'
      }
    >
      <span
        className={
          active
            ? 'inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-village-600 text-[10px] font-bold'
            : 'inline-flex items-center justify-center w-4 h-4 rounded-full border border-stone-300 text-transparent text-[10px]'
        }
        aria-hidden="true"
      >
        ✓
      </span>
      {label}
    </button>
  )
}

// ─── Date block and event row ──────────────────────────────────────────────

function DateBlock({
  dateKey,
  events,
}: {
  dateKey: string
  events: AthleticEvent[]
}) {
  const { weekday, monthDay } = formatDateParts(dateKey)

  return (
    <div className="mb-4 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-6">
      <div className="sm:sticky sm:top-20 sm:self-start mb-1 sm:mb-0">
        <div className="hidden sm:block">
          <div className="text-xs font-semibold tracking-widest text-stone-500">
            {weekday}
          </div>
          <div className="text-lg font-semibold text-stone-900 leading-tight whitespace-nowrap">
            {monthDay}
          </div>
        </div>
        <div className="sm:hidden bg-stone-50 border-y border-stone-200 px-2 py-1.5 text-xs font-semibold tracking-widest text-stone-700 sticky top-16 z-10">
          {weekday} · {monthDay}
        </div>
      </div>
      <div>
        {events.map((evt) => (
          <EventRow key={evt.id} event={evt} />
        ))}
      </div>
    </div>
  )
}

function EventRow({ event }: { event: AthleticEvent }) {
  const time = formatEventTime(event.startTime)
  const badgeClass =
    event.homeAway === 'H'
      ? 'bg-village-100 text-village-800'
      : event.homeAway === 'A'
        ? 'bg-stone-200 text-stone-700'
        : 'bg-stone-100 text-stone-600'
  const opponentPrefix =
    event.homeAway === 'H' ? 'vs' : event.homeAway === 'A' ? '@' : 'vs'
  const teamLabel = formatTeamLabel(event)

  return (
    <div className="grid grid-cols-[5rem_1fr] gap-x-4 py-2 border-b border-stone-100 last:border-b-0">
      <div className="text-sm font-medium text-stone-800 tabular-nums pt-0.5 whitespace-nowrap">
        {time}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${badgeClass}`}
          >
            {HOME_AWAY_LABELS[event.homeAway].toUpperCase()}
          </span>
          <span className="text-xs uppercase tracking-wide text-stone-500 font-medium">
            {event.school}
          </span>
        </div>
        <p className="text-stone-900 font-medium leading-snug mb-0.5">
          {teamLabel} {opponentPrefix} {event.eventName}
        </p>
        <p className="text-sm text-stone-600">
          {event.location || 'Location TBD'}
          {event.subtype && ` · ${event.subtype}`}
          {' · '}
          <a
            href={event.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brick-600 hover:text-brick-700 hover:underline"
          >
            View details ↗
          </a>
        </p>
      </div>
    </div>
  )
}

// ─── Summary builder ───────────────────────────────────────────────────────

function buildSummary({
  schools,
  sport,
  genders,
  datePreset,
  startDate,
  endDate,
}: {
  schools: School[]
  sport: string
  genders: Gender[]
  datePreset: DatePreset
  startDate: string
  endDate: string
}): string {
  const parts: string[] = []

  // Schools — only include when specifics selected
  const schoolsPart = formatSchoolsPart(schools)
  if (schoolsPart) parts.push(schoolsPart)

  // Sport / Gender — only include when non-default
  const sportGenderPart = formatSportGenderPart(sport, genders)
  if (sportGenderPart) parts.push(sportGenderPart)

  // Date preset — always include so user can see the time window
  parts.push(formatDatePart(datePreset, startDate, endDate))

  return parts.join(' · ')
}

function formatSchoolsPart(schools: School[]): string | null {
  if (schools.length === 0) return null
  if (schools.length === 1) return schools[0]
  return schools.join(' & ')
}

function formatSportGenderPart(sport: string, genders: Gender[]): string | null {
  const hasSport = sport !== ''
  const count = genders.length
  const labels = genders.map((g) => GENDER_LABELS[g] ?? g)

  if (count === 0 && !hasSport) return null
  if (count === 0) return sport
  if (count === 1) return hasSport ? `${labels[0]} ${sport}` : labels[0]
  const joined = labels.join(' + ')
  return hasSport ? `${sport} (${joined})` : joined
}

function formatDatePart(
  preset: DatePreset,
  start: string,
  end: string
): string {
  if (preset !== 'custom') return DATE_PRESET_LABELS[preset]
  if (start && end) return `${shortDate(start)} to ${shortDate(end)}`
  if (start) return `From ${shortDate(start)}`
  if (end) return `Through ${shortDate(end)}`
  return 'Custom range'
}

function shortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

// ─── Formatting helpers ────────────────────────────────────────────────────

function formatTeamLabel(event: AthleticEvent): string {
  const parts: string[] = []
  if (event.gender === 'Coed') parts.push('Co-ed')
  else if (event.gender !== 'unknown') parts.push(event.gender)
  parts.push(event.sport)
  const lvl = event.levels.filter((l) => l !== 'unknown').join('/')
  if (lvl) parts.push(lvl)
  return parts.join(' ')
}

function easternDate(iso: string): string {
  const d = new Date(iso)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Indiana/Indianapolis',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const day = parts.find((p) => p.type === 'day')?.value
  return `${y}-${m}-${day}`
}

function todayEastern(): string {
  return easternDate(new Date().toISOString())
}

function addDaysEastern(iso: string, n: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function computeDateRange(
  preset: DatePreset,
  customStart: string,
  customEnd: string
): { start: string | null; end: string | null } {
  const today = todayEastern()
  switch (preset) {
    case 'today':
      return { start: today, end: today }
    case 'next7':
      return { start: today, end: addDaysEastern(today, 7) }
    case 'next30':
      return { start: today, end: addDaysEastern(today, 30) }
    case 'all':
      return { start: today, end: null }
    case 'custom':
      return {
        start: customStart || null,
        end: customEnd || null,
      }
  }
}

function formatEventTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Indiana/Indianapolis',
    hour12: true,
  })
}

function formatDateParts(dateKey: string): {
  weekday: string
  monthDay: string
} {
  const d = new Date(`${dateKey}T12:00:00Z`)
  const weekday = d
    .toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
    .toUpperCase()
  const monthDay = d
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    })
    .toUpperCase()
  return { weekday, monthDay }
}

function groupByEasternDate(events: AthleticEvent[]): Record<string, AthleticEvent[]> {
  const groups: Record<string, AthleticEvent[]> = {}
  for (const event of events) {
    const key = easternDate(event.startTime)
    if (!groups[key]) groups[key] = []
    groups[key].push(event)
  }
  return groups
}

function formatFreshness(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  if (minutes === 0) return 'moments ago'
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  const hours = Math.floor(minutes / 60)
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
}
