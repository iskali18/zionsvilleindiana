'use client'

import { useMemo, useState } from 'react'
import Toggle from '@/components/ui/Toggle'
import {
  TYPES,
  EVENTS,
  buildRows,
  buildFilteredRows,
  formatDateList,
  type EventType,
} from '@/lib/christmas-events'

export default function ChristmasEventTable() {
  const [types, setTypes] = useState<EventType[]>([])
  const [freeOnly, setFreeOnly] = useState(false)

  const filtering = types.length > 0 || freeOnly

  const shown = useMemo(
    () =>
      EVENTS.filter(
        (e) =>
          // an event matches if it carries ANY selected type
          (types.length === 0 || types.some((t) => e.types.includes(t))) &&
          // 'unknown' admission never counts as free
          (!freeOnly || e.admission === 'free'),
      ),
    [types, freeOnly],
  )

  /* Chronology matters in the full schedule, so Santa appears on each of its
     dates. Once a filter is on, discovery matters more, so a recurring event
     collapses to one row instead of repeating seven times. */
  const rows = useMemo(
    () => (filtering ? buildFilteredRows(shown) : buildRows(shown)),
    [shown, filtering],
  )

  const toggleType = (t: EventType) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  /** Distinct events, not displayed occurrences — Selfies with Santa fills
   *  seven rows but is one event. */
  const count = shown.length

  return (
    <section id="schedule" className="not-prose mt-12 mb-10 scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Christmas in Zionsville 2026 at a Glance
      </h2>
      <p className="mt-1.5 mb-5 text-stone-600">
        Filter by event type or show only free events.
      </p>

      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Toggle
            key={t}
            label={t}
            active={types.includes(t)}
            onClick={() => toggleType(t)}
            accent="amber"
          />
        ))}
        {/* Admission is an attribute, not a type. On wide screens a rule
            separates it; on mobile the rule would be lost in the wrap, so it
            breaks to its own line with a label instead. */}
        <span className="basis-full sm:hidden" aria-hidden="true" />
        <span className="mx-1 hidden w-px self-stretch bg-stone-200 sm:block" aria-hidden="true" />
        <span className="self-center text-xs font-medium text-stone-500 sm:hidden">
          Admission
        </span>
        <Toggle
          label="Free only"
          active={freeOnly}
          onClick={() => setFreeOnly((v) => !v)}
          accent="amber"
        />
      </div>

      <p className="mt-4 mb-0 text-sm text-stone-600" aria-live="polite">
        <span className="font-semibold text-stone-900">{count}</span>{' '}
        {count === 1 ? 'event' : 'events'}
        {filtering && (
          <>
            {' \u00b7 '}
            <button
              type="button"
              onClick={() => {
                setTypes([])
                setFreeOnly(false)
              }}
              className="font-medium text-brick-600 hover:text-brick-700"
            >
              Clear filters
            </button>
          </>
        )}
      </p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-stone-200 bg-white px-5 py-6 text-center text-sm text-stone-500">
          No events match those filters.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100 text-left">
                <th className="w-32 px-4 py-3 font-semibold text-stone-800 sm:w-44">Date</th>
                <th className="px-4 py-3 font-semibold text-stone-800">Event</th>
                <th className="hidden px-4 py-3 font-semibold text-stone-800 sm:table-cell">
                  What to Expect
                </th>
              </tr>
            </thead>
            <tbody>
              {/* One <tr> per event, with the date cell spanning its group.
                  Stacking events inside a single cell made the columns drift
                  apart as soon as one of them wrapped. */}
              {rows.map((row) =>
                row.events.map((e, i) => (
                  <tr
                    key={row.key + e.name}
                    className={
                      i === row.events.length - 1
                        ? 'border-b border-stone-200 last:border-0'
                        : undefined
                    }
                  >
                    {i === 0 && (
                      <td
                        rowSpan={row.events.length}
                        className="px-4 py-3 align-top font-medium text-stone-900"
                      >
                        {row.label}
                      </td>
                    )}
                    <td className="px-4 py-3 align-top">
                      <a
                        href={`#${e.anchor}`}
                        className="font-medium text-brick-600 no-underline hover:underline"
                      >
                        {e.name}
                      </a>
                      {e.note && <span className="ml-1.5 text-xs text-stone-500">{e.note}</span>}

                      {/* A collapsed recurring event says so, otherwise the
                          row looks like the date grouping has broken. */}
                      {filtering && e.dates && e.dates.length > 1 && (
                        <p className="m-0 text-xs text-stone-500">
                          Recurring — {formatDateList(e.dates)}
                        </p>
                      )}
                      <p className="m-0 text-xs text-stone-500">
                        {[e.time, e.venue].filter(Boolean).join(' · ')}
                      </p>
                      {/* The third column is hidden on mobile, so its contents
                          fold in here instead. */}
                      <p className="m-0 text-xs text-stone-500 sm:hidden">{e.summary}</p>
                      {e.organizer && (
                        <p className="m-0 text-xs text-stone-400 sm:hidden">{e.organizer}</p>
                      )}
                    </td>
                    <td className="hidden px-4 py-3 align-top text-sm text-stone-600 sm:table-cell">
                      {e.summary}
                      {/* Organizer sits under the summary rather than in the
                          Event cell, which was carrying three things at once. */}
                      {e.organizer && (
                        <span className="mt-0.5 block text-xs text-stone-400">{e.organizer}</span>
                      )}
                    </td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
