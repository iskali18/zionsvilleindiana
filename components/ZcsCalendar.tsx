'use client'

import { useState, useMemo } from 'react'
import { zcsEvents, type Audience, type ZcsEvent } from '@/lib/zcs-calendar'

const AUDIENCES: { key: Audience; label: string }[] = [
  { key: 'elementary', label: 'All Elementary Schools' },
  { key: 'zms', label: 'ZMS' },
  { key: 'zwms', label: 'ZWMS' },
  { key: 'zchs', label: 'ZCHS' },
]

const ALL_AUDIENCES: Audience[] = ['elementary', 'zms', 'zwms', 'zchs']

const LONG_COMMENT_THRESHOLD = 140

function formatCompactDate(iso: string): { weekday: string; monthDay: string } {
  const d = new Date(iso + 'T00:00:00')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const monthDay = d
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    .toUpperCase()
  return { weekday, monthDay }
}

function formatCompactDateRange(start: string, end: string): { weekday: string; monthDay: string } {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const startWeekday = s.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const endWeekday = e.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
  const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  const endStr =
    s.getMonth() === e.getMonth()
      ? e.toLocaleDateString('en-US', { day: 'numeric' }).toUpperCase()
      : e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  return {
    weekday: `${startWeekday}–${endWeekday}`,
    monthDay: `${startStr}–${endStr}`,
  }
}

function getMonthYearKey(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

interface EventRowProps {
  event: ZcsEvent
}

function EventRow({ event }: EventRowProps) {
  const [showFull, setShowFull] = useState(false)
  const hasLongComment = event.comment && event.comment.length > LONG_COMMENT_THRESHOLD
  const displayComment = hasLongComment && !showFull
    ? event.comment!.slice(0, LONG_COMMENT_THRESHOLD) + '…'
    : event.comment

  const tagLabels = event.isDistrictwide
    ? [event.audienceLabel]
    : event.audienceLabel.split(' · ')

  return (
    <div className="grid grid-cols-[9rem_1fr] gap-x-4 py-3 border-b border-stone-100 last:border-b-0">
      {/* Tag column — fixed width so event text aligns across all rows */}
      <div className="flex flex-wrap gap-1 items-start">
        {tagLabels.map((label, idx) => (
          <span
            key={idx}
            className={
              event.isDistrictwide
                ? 'inline-block text-xs font-medium px-2 py-0.5 rounded bg-brick-100 text-brick-800 whitespace-nowrap'
                : 'inline-block text-xs font-medium px-2 py-0.5 rounded bg-village-100 text-village-800 whitespace-nowrap'
            }
          >
            {label}
          </span>
        ))}
      </div>

      {/* Content column */}
      <div className="min-w-0">
        <p className="text-stone-900 font-medium leading-snug">{event.title}</p>
        {event.time && (
          <p className="text-sm text-stone-600 mt-0.5">{event.time}</p>
        )}
        {event.comment && (
          <div className="text-sm text-stone-600 mt-0.5">
            <p>{displayComment}</p>
            {hasLongComment && (
              <button
                type="button"
                onClick={() => setShowFull(!showFull)}
                className="text-brick-600 hover:text-brick-700 font-medium mt-1"
              >
                {showFull ? 'Show less' : 'Details'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface DateBlockProps {
  date: string
  events: ZcsEvent[]
}

function DateBlock({ date, events }: DateBlockProps) {
  const isMultiDay = events.length === 1 && events[0].endDate
  const dateLabel = isMultiDay
    ? formatCompactDateRange(events[0].startDate, events[0].endDate!)
    : formatCompactDate(date)

  return (
    <div className="mb-6 sm:grid sm:grid-cols-[8rem_1fr] sm:gap-x-6">
      {/* Date label */}
      <div className="sm:sticky sm:top-20 sm:self-start mb-2 sm:mb-0">
        <div className="hidden sm:block">
          <div className="text-xs font-semibold tracking-widest text-stone-500">
            {dateLabel.weekday}
          </div>
          <div className="text-lg font-semibold text-stone-900 leading-tight whitespace-nowrap">
            {dateLabel.monthDay}
          </div>
        </div>
        {/* Mobile: compact sticky date bar */}
        <div className="sm:hidden bg-stone-50 border-y border-stone-200 px-2 py-1.5 text-xs font-semibold tracking-widest text-stone-700 sticky top-16 z-10">
          {dateLabel.weekday} · {dateLabel.monthDay}
        </div>
      </div>

      {/* Events for this date */}
      <div>
        {events.map((event, idx) => (
          <EventRow key={`${date}-${idx}`} event={event} />
        ))}
      </div>
    </div>
  )
}

interface ToggleProps {
  label: string
  active: boolean
  onClick: () => void
}

function Toggle({ label, active, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onClick}
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

export default function ZcsCalendar() {
  const [activeAudiences, setActiveAudiences] = useState<Set<Audience>>(
    new Set(ALL_AUDIENCES)
  )

  const toggleAudience = (audience: Audience) => {
    setActiveAudiences((prev) => {
      const next = new Set(prev)
      if (next.has(audience)) {
        next.delete(audience)
      } else {
        next.add(audience)
      }
      return next
    })
  }

  const showAll = () => {
    if (isAllActive) {
      setActiveAudiences(new Set())
    } else {
      setActiveAudiences(new Set(ALL_AUDIENCES))
    }
  }

  const isAllActive = activeAudiences.size === ALL_AUDIENCES.length

  const filteredEvents = useMemo(() => {
    return zcsEvents.filter((event) => {
      if (event.isDistrictwide) return true
      return event.audiences.some((a) => activeAudiences.has(a))
    })
  }, [activeAudiences])

  const monthGroups = useMemo(() => {
    const groups = new Map<string, ZcsEvent[]>()
    for (const event of filteredEvents) {
      const key = getMonthYearKey(event.startDate)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(event)
    }
    return Array.from(groups.entries())
  }, [filteredEvents])

  const groupByDate = (events: ZcsEvent[]) => {
    const groups = new Map<string, ZcsEvent[]>()
    for (const event of events) {
      const key = event.startDate
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(event)
    }
    return Array.from(groups.entries())
  }

  return (
    <div className="mt-10">
      {/* Filter controls */}
      <div className="mb-8 pb-6 border-b border-stone-200">
        <p className="text-sm text-stone-600 mb-3">
          Filter by school. District-wide dates always appear.
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <Toggle
            label="All schools"
            active={isAllActive}
            onClick={showAll}
          />
          {AUDIENCES.map((aud) => (
            <Toggle
              key={aud.key}
              label={aud.label}
              active={activeAudiences.has(aud.key)}
              onClick={() => toggleAudience(aud.key)}
            />
          ))}
        </div>
      </div>

      {filteredEvents.length === 0 && (
        <p className="text-stone-600 italic">
          No events match the selected filters. Click &ldquo;Show all&rdquo; to reset.
        </p>
      )}

      {monthGroups.map(([month, events]) => (
        <section key={month} className="mb-6">
          {groupByDate(events).map(([date, dateEvents]) => (
            <DateBlock key={date} date={date} events={dateEvents} />
          ))}
        </section>
      ))}
    </div>
  )
}
