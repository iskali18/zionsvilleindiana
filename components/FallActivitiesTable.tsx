'use client'

import { useMemo, useState } from 'react'
import Toggle from '@/components/ui/Toggle'
import {
  FILTERS,
  filterActivities,
  sortActivities,
  type Filter,
} from '@/lib/fall-activities'

/** At-a-glance table for the fall activities guide.
 *
 *  Opens in editorial order, which leads with the most distinctive activities
 *  and matches the order of the article body below. The When header toggles to
 *  date order and back.
 *
 *  Deliberately not using the Toggle component here. Its square checkbox reads
 *  as a multi-select filter, which is what it means on the farms and Christmas
 *  tables; sorting is a different action and should not borrow that signal.
 */
export default function FallActivitiesTable() {
  const [byDate, setByDate] = useState(false)
  const [active, setActive] = useState<Filter[]>([])
  const [freeOnly, setFreeOnly] = useState(false)

  const toggle = (f: Filter) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  const rows = useMemo(
    () => filterActivities(sortActivities(byDate ? 'date' : 'featured'), active, freeOnly),
    [byDate, active, freeOnly]
  )

  return (
    <section id="at-a-glance" className="not-prose mt-12 mb-10 scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Fall Activities at a Glance
      </h2>
      <p className="mt-1.5 mb-4 text-stone-600">
        Filter by type or show only free activities. Tap{' '}
        <span className="whitespace-nowrap">When</span> to sort by date instead of
        what stands out.
      </p>

      {/* Filter chips. Deliberately the same checkbox Toggle used on the farms
          and Christmas tables — these narrow the list, unlike the When header,
          which reorders it. */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Toggle key={f} label={f} active={active.includes(f)} onClick={() => toggle(f)} accent="amber" />
        ))}
        <span className="ml-1 border-l border-stone-200 pl-3">
          <Toggle
            label="Free only"
            active={freeOnly}
            onClick={() => setFreeOnly((v) => !v)}
            accent="amber"
          />
        </span>
      </div>

      <p className="mb-4 text-sm text-stone-600" aria-live="polite">
        <span className="font-semibold text-stone-900">{rows.length}</span>{' '}
        {rows.length === 1 ? 'activity' : 'activities'}
        {(active.length > 0 || freeOnly) && (
          <>
            {' \u00b7 '}
            <button
              type="button"
              onClick={() => {
                setActive([])
                setFreeOnly(false)
              }}
              className="font-medium text-brick-600 hover:text-brick-700"
            >
              Clear filters
            </button>
          </>
        )}
      </p>

      {rows.length === 0 && (
        <p className="rounded-lg border border-stone-200 bg-white px-5 py-6 text-center text-stone-600">
          No activities match all of the selected filters.{' '}
          <button
            type="button"
            onClick={() => {
              setActive([])
              setFreeOnly(false)
            }}
            className="text-brick-600 underline underline-offset-2 hover:text-brick-700"
          >
            Clear filters
          </button>{' '}
          or remove one to see more.
        </p>
      )}

      {rows.length > 0 && (
      <div className="overflow-hidden rounded-lg border border-stone-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-stone-300 bg-stone-100 text-left">
              <th className="w-44 px-4 py-3 font-semibold text-stone-800 sm:w-56">Activity</th>
              <th
                className="w-48 px-4 py-3 font-semibold text-stone-800"
                aria-sort={byDate ? 'ascending' : 'none'}
              >
                <button
                  type="button"
                  onClick={() => setByDate((v) => !v)}
                  className="inline-flex items-center gap-1.5 font-semibold text-stone-800 hover:text-brick-600"
                  aria-label={
                    byDate
                      ? 'Sorted by date. Activate to return to featured order.'
                      : 'Sort by date'
                  }
                >
                  When
                  <span
                    aria-hidden="true"
                    className={byDate ? 'text-brick-600' : 'text-stone-400'}
                  >
                    {byDate ? '\u2193' : '\u21C5'}
                  </span>
                </button>
              </th>
              <th className="hidden px-4 py-3 font-semibold text-stone-800 sm:table-cell">
                What to Expect
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.anchor} className="border-b border-stone-200 last:border-0">
                <td className="px-4 py-3 align-top">
                  <a
                    href={`#${a.anchor}`}
                    className="font-medium text-brick-600 no-underline hover:underline"
                  >
                    {a.name}
                  </a>
                  {/* The What column is hidden on mobile, so it folds in here. */}
                  <p className="m-0 mt-0.5 text-xs text-stone-500 sm:hidden">{a.what}</p>
                </td>
                <td className="px-4 py-3 align-top text-stone-600">{a.when}</td>
                <td className="hidden px-4 py-3 align-top text-stone-600 sm:table-cell">
                  {a.what}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  )
}
