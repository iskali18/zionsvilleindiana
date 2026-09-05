'use client'

import { useMemo, useRef, useState } from 'react'
import Toggle from '@/components/ui/Toggle'
import {
  FILTERS,
  SHORT,
  ICONS,
  ICON_FILTERS,
  DESTINATIONS,
  type Filter,
  type Destination,
} from '@/lib/fall-farms'

const PDF = '/files/fall-farms-guide-2026.pdf'

export default function FallFarmComparison() {
  const [active, setActive] = useState<Filter[]>([])
  const [date, setDate] = useState('')
  const dateRef = useRef<HTMLInputElement>(null)

  const WEEKDAY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

  /** Parsed as local time. `new Date('2026-10-17')` is UTC midnight, which
   *  lands on the previous day west of Greenwich. */
  const parse = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  /** 'open' when a confirmed schedule covers the date, 'unknown' when the
   *  destination has any unposted schedule, otherwise 'closed'. Unknown is
   *  never treated as open, and never silently dropped. */
  const stateOn = (d: Destination, iso: string) => {
    const wd = WEEKDAY[parse(iso).getDay()]
    for (const sc of d.schedules) {
      if (sc.status !== 'confirmed' || !sc.planner) continue
      if (sc.dates?.includes(iso)) return 'open'
      if (sc.start && iso >= sc.start && (!sc.end || iso <= sc.end) && sc.days?.includes(wd))
        return 'open'
    }
    /** An unposted schedule only makes the date unanswerable if it could
     *  actually cover it. A schedule with known days that exclude this weekday,
     *  or a window that has not started, tells us nothing is missing. */
    const couldCover = (sc: Destination['schedules'][number]) => {
      if (sc.days && !sc.days.includes(wd)) return false
      if (sc.start && iso < sc.start) return false
      if (sc.end && iso > sc.end) return false
      return true
    }
    return d.schedules.some((sc) => sc.planner && sc.status !== 'confirmed' && couldCover(sc))
      ? 'unknown'
      : 'closed'
  }

  const openPicker = () => {
    const el = dateRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.focus()
  }

  const dateLabel = date
    ? parse(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'Any date'


  const toggle = (f: Filter) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  // A destination matches only when it has EVERY selected filter.
  const shown = useMemo(
    () =>
      DESTINATIONS.filter(
        (d) =>
          active.every((f) => d.features.includes(f)) && (!date || stateOn(d, date) === 'open')
      ),
    [active, date]
  )

  /** Destinations the date filter cannot answer for. Listed rather than hidden,
   *  so an unposted schedule never reads as "closed". */
  const unknown = useMemo(
    () =>
      !date
        ? []
        : DESTINATIONS.filter(
            (d) => active.every((f) => d.features.includes(f)) && stateOn(d, date) === 'unknown'
          ),
    [active, date]
  )

  // Badges explain a match the four permanent icons don't already show.
  const badgeFilters = active.filter((f) => !ICON_FILTERS.has(f))

  const iconsFor = (d: Destination) =>
    ICONS.filter((i) => d.features.includes(i.filter))

  /** Features not open yet but expected this season. Rendered grayed with the
   *  destination's own label, and deliberately left out of the filter results. */
  const soonFor = (d: Destination) =>
    ICONS.filter((i) => d.comingSoon?.[i.filter]).map((i) => ({
      ...i,
      when: d.comingSoon![i.filter]!,
    }))

  /** Shared icon key. Rendered under the Highlights heading on desktop and
   *  inline above the cards on mobile. A grayed icon carries its own date
   *  label in the row, so the key does not explain it. */
  const IconKey = () => (
    <>
      {ICONS.map((i, n) => (
        <span key={i.filter}>
          {n > 0 && ' \u00b7 '}
          {i.icon} {i.label}
        </span>
      ))}
    </>
  )

  /** Icon row: available features first, then any flagged as coming soon. */
  const IconRow = ({ d }: { d: Destination }) => (
    <>
      <span className="mt-1 block text-base">
        <span aria-hidden="true">{iconsFor(d).map((i) => i.icon).join(' ')}</span>
        {soonFor(d).map((i) => (
          <span key={i.filter} className="ml-1 whitespace-nowrap">
            <span aria-hidden="true" style={{ filter: 'grayscale(1)', opacity: 0.45 }}>
              {i.icon}
            </span>
            <span className="ml-0.5 align-middle text-xs text-stone-500">{i.when}</span>
          </span>
        ))}
      </span>
      <span className="sr-only">
        {[
          ...iconsFor(d).map((i) => i.label),
          ...soonFor(d).map((i) => `${i.label} ${i.when}`),
        ].join(', ')}
      </span>
    </>
  )

  return (
    <section id="compare" className="not-prose mt-12 mb-10 scroll-mt-20">
      {/* Heading through legend is one continuous control area — no box or
          rule. The H2 lives here rather than in the markdown. */}
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Compare Fall Farms &amp; Orchards
      </h2>
      <p className="mt-1.5 mb-0 text-stone-600">
        Use the filters to narrow the list by admission, activities, and accessibility.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Toggle
            key={f}
            label={SHORT[f]}
            active={active.includes(f)}
            onClick={() => toggle(f)}
            accent="amber"
          />
        ))}

        {/* Date control. Deliberately not a Toggle — it picks a value rather
            than switching something on, so it takes a rectangular field shape
            and a calendar mark instead of a check circle. */}
        <span
          className={
            date
              ? 'inline-flex items-center gap-1.5 rounded border border-amber-700 bg-amber-50 px-2.5 py-1.5 text-sm font-medium text-amber-900'
              : 'inline-flex items-center gap-1.5 rounded border border-stone-300 bg-white px-2.5 py-1.5 text-sm font-medium text-stone-600 hover:border-stone-400 hover:text-stone-900 transition-colors'
          }
        >
          <button
            type="button"
            onClick={openPicker}
            className="inline-flex items-center gap-1.5"
            aria-label={date ? `Showing ${dateLabel}. Change date` : 'Choose a date'}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1.75" y="3.25" width="12.5" height="11" rx="1.5" />
              <path d="M1.75 6.5h12.5M5 1.75v2.5M11 1.75v2.5" />
            </svg>
            {date ? dateLabel : 'Choose a date'}
          </button>
          {date && (
            <button
              type="button"
              onClick={() => setDate('')}
              aria-label="Clear date"
              className="-mr-0.5 ml-0.5 leading-none text-amber-800 hover:text-amber-950"
            >
              ×
            </button>
          )}
        </span>
        <input
          ref={dateRef}
          type="date"
          value={date}
          min="2026-09-12"
          max="2026-11-01"
          onChange={(e) => setDate(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Count, clear and PDF share one line; the icon key sits just below. */}
      <p className="mt-4 mb-0 text-sm text-stone-600" aria-live="polite">
        <span className="font-semibold text-stone-900">{shown.length}</span>{' '}
        {shown.length === 1 ? 'destination' : 'destinations'}
        {date && ` open ${dateLabel}`}
        {active.length > 0 &&
          ` match${date ? 'ing' : ''} all ${active.length} ${active.length === 1 ? 'filter' : 'filters'}`}
        {(active.length > 0 || date) && (
          <>
            {' \u00b7 '}
            <button
              type="button"
              onClick={() => {
                setActive([])
                setDate('')
              }}
              className="font-medium text-brick-600 hover:text-brick-700"
            >
              Clear filters
            </button>
          </>
        )}
        {' \u00b7 '}
        <a href={PDF} download className="text-brick-600 no-underline hover:underline">
          <span aria-hidden="true">↓</span> Download printable comparison (PDF)
        </a>
      </p>

      {unknown.length > 0 && (
        <p className="mt-1.5 mb-0 text-xs text-stone-500">
          Schedule not posted for {dateLabel}: {unknown.map((d) => d.name).join(', ')}
        </p>
      )}

      {/* Mobile keeps the legend inline; desktop moves it into the table head. */}
      <p className="mt-1.5 mb-0 text-xs text-stone-500 md:hidden">
        <IconKey />
      </p>

      {/* ── No matches ──────────────────────────────────────────── */}
      {shown.length === 0 && (
        <p className="mt-6 rounded-lg border border-stone-200 bg-white px-5 py-6 text-center text-stone-600">
          No destinations match all of the selected filters.{' '}
          <button
            type="button"
            onClick={() => setActive([])}
            className="text-brick-600 hover:text-brick-700 underline underline-offset-2"
          >
            Clear filters
          </button>{' '}
          or remove one to see more.
        </p>
      )}

      {/* ── Desktop table ───────────────────────────────────────── */}
      {shown.length > 0 && (
        <div className="mt-6 hidden overflow-hidden rounded-lg border border-stone-200 md:block">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100 text-left">
                <th className="px-4 py-3 font-semibold text-stone-800">Destination</th>
                <th className="px-4 py-3 font-semibold text-stone-800">City</th>
                <th className="px-4 py-3 font-semibold text-stone-800">Highlights</th>
                <th className="px-4 py-3 font-semibold text-stone-800">Admission &amp; Costs</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200 bg-stone-50/60">
                <td className="px-4 py-2" />
                <td className="px-4 py-2" />
                <td className="px-4 py-2 text-xs text-stone-500">
                  <IconKey />
                </td>
                <td className="px-4 py-2" />
              </tr>
              {shown.map((d) => (
                <tr key={d.name} className="border-b border-stone-200 last:border-0 odd:bg-white even:bg-stone-50">
                  <td className="px-4 py-3 align-top font-semibold text-stone-900">
                    <a href={`#${d.anchor}`} className="text-brick-600 no-underline hover:underline">
                      {d.name}
                    </a>
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">{d.city}</td>
                  <td className="px-4 py-3 align-top text-stone-700">
                    {d.highlights}
                    <IconRow d={d} />
                    {badgeFilters.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1">
                        {badgeFilters.map((f) => (
                          <span key={f} className="rounded bg-brick-50 px-2 py-0.5 text-xs font-medium text-brick-700 ring-1 ring-brick-200">
                            {SHORT[f]}
                          </span>
                        ))}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-stone-700">{d.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile cards ────────────────────────────────────────── */}
      {shown.length > 0 && (
        <div className="mt-6 space-y-3 md:hidden">
          {shown.map((d) => (
            <div key={d.name} className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="font-display text-base font-semibold m-0">
                <a href={`#${d.anchor}`} className="text-brick-600 no-underline hover:underline">
                  {d.name}
                </a>
              </p>
              <p className="text-xs text-stone-500 mt-0.5 mb-2">{d.city}</p>
              <p className="text-sm text-stone-700 m-0">{d.highlights}</p>
              <IconRow d={d} />
              {badgeFilters.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-1 m-0">
                  {badgeFilters.map((f) => (
                    <span key={f} className="rounded bg-brick-50 px-2 py-0.5 text-xs font-medium text-brick-700 ring-1 ring-brick-200">
                      {SHORT[f]}
                    </span>
                  ))}
                </p>
              )}
              <p className="mt-2 border-t border-stone-200 pt-2 text-sm text-stone-700 m-0">
                <span className="font-medium text-stone-900">Admission &amp; costs: </span>
                {d.cost}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
