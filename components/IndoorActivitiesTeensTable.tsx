'use client'

import { useMemo, useState } from 'react'
import Toggle from '@/components/ui/Toggle'
import {
  MODES,
  CATEGORIES,
  filterActivities,
  sortActivities,
  type Filter,
  type SortKey,
  type SortDir,
} from '@/lib/indoor-activities-teens'

/** At-a-glance table for the indoor activities guide.
 *
 *  Chips sit in two labeled rows. The first row (Drop-In, Classes and the free
 *  toggle) shortens the list; the "Activities" row is OR within
 *  itself. See filterActivities in
 *  lib/indoor-activities-teens.ts. Opens A to Z by name. Each of
 *  the Activity, Where and Ages headers sorts by its column; clicking the
 *  active header again flips between A to Z and Z to A.
 */

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Activity',
  where: 'Where',
  ages: 'Ages',
}

/** Sort arrows as icons, not text characters. Search engines read text
 *  arrows (↓ ⇅) as part of the header ("Activity↓"), but skip icons. */
function SortIcon({ state }: { state: 'asc' | 'desc' | 'none' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      {state === 'asc' && <path d="M8 3v10M4 9l4 4 4-4" />}
      {state === 'desc' && <path d="M8 13V3M4 7l4-4 4 4" />}
      {state === 'none' && <path d="M5 13.5v-11M2.5 5 5 2.5 7.5 5M11 2.5v11M8.5 11 11 13.5 13.5 11" />}
    </svg>
  )
}
export default function IndoorActivitiesTeensTable() {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [active, setActive] = useState<Filter[]>([])
  const [freeOnly, setFreeOnly] = useState(false)

  const toggle = (f: Filter) =>
    setActive((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))

  const rows = useMemo(
    () => filterActivities(sortActivities(sortKey, sortDir), active, freeOnly),
    [sortKey, sortDir, active, freeOnly]
  )

  /** First click sorts by the column A to Z; clicking it again flips to Z to A. */
  const sortBy = (col: SortKey) => {
    if (col === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const ariaSort = (col: SortKey) =>
    sortKey !== col ? 'none' : sortDir === 'asc' ? 'ascending' : 'descending'

  /** Header button that sorts the table by its column. */
  const SortHeader = ({ col }: { col: SortKey }) => {
    const isActive = sortKey === col
    return (
      <button
        type="button"
        onClick={() => sortBy(col)}
        className="inline-flex items-center gap-1.5 font-semibold text-stone-800 hover:text-brick-600"
        aria-label={
          isActive
            ? `Sorted by ${SORT_LABELS[col]}, ${sortDir === 'asc' ? 'A to Z' : 'Z to A'}. Activate to reverse.`
            : `Sort by ${SORT_LABELS[col]}`
        }
      >
        {SORT_LABELS[col]}
        <span aria-hidden="true" className={isActive ? 'text-brick-600' : 'text-stone-400'}>
          <SortIcon state={isActive ? sortDir : 'none'} />
        </span>
      </button>
    )
  }

  const clear = () => {
    setActive([])
    setFreeOnly(false)
  }

  return (
    <section id="at-a-glance" className="not-prose mt-12 mb-10 scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Indoor Activities at a Glance
      </h2>
      <p className="mt-1.5 mb-4 text-stone-600">
        Use the filters below to narrow the list.
      </p>

      <div className="mb-5 space-y-3">
        <div>
          <p className="mb-1.5 text-sm text-stone-500">
            <strong className="font-medium text-stone-700">Drop-In</strong> places don&rsquo;t
            require signing up for a class.{' '}
            <strong className="font-medium text-stone-700">Classes</strong> are ongoing programs
            that need enrollment.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {MODES.map((f) => (
              <Toggle key={f} label={f} active={active.includes(f)} onClick={() => toggle(f)} accent="amber" />
            ))}
            <Toggle
              label="Free activities available"
              active={freeOnly}
              onClick={() => setFreeOnly((v) => !v)}
              accent="amber"
            />
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-stone-700">
            Activities{' '}
            <span className="font-normal text-stone-500">{'\u00b7'} Choose one or more</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((f) => (
              <Toggle key={f} label={f} active={active.includes(f)} onClick={() => toggle(f)} accent="amber" />
            ))}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-stone-600" aria-live="polite">
        <span className="font-semibold text-stone-900">{rows.length}</span>{' '}
        {rows.length === 1 ? 'activity' : 'activities'}
        {(active.length > 0 || freeOnly) && (
          <>
            {' \u00b7 '}
            <button
              type="button"
              onClick={clear}
              className="font-medium text-brick-600 hover:text-brick-700"
            >
              Clear filters
            </button>
          </>
        )}
      </p>

      {rows.length === 0 && (
        <p className="rounded-lg border border-stone-200 bg-white px-5 py-6 text-center text-stone-600">
          No activities match these filters.{' '}
          <button
            type="button"
            onClick={clear}
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
            {/* Read by screen readers and search engines, hidden on screen. Without
                it, Google titles the table with the nearest word it finds. */}
            <caption className="sr-only">
              Indoor activities for older kids and teens near Zionsville and NW Indy
            </caption>
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100 text-left">
                <th
                  className="w-44 px-4 py-3 font-semibold text-stone-800 sm:w-56"
                  aria-sort={ariaSort('name')}
                >
                  <SortHeader col="name" />
                </th>
                <th
                  className="w-32 px-4 py-3 font-semibold text-stone-800"
                  aria-sort={ariaSort('where')}
                >
                  <SortHeader col="where" />
                </th>
                <th
                  className="hidden w-40 px-4 py-3 font-semibold text-stone-800 md:table-cell"
                  aria-sort={ariaSort('ages')}
                >
                  <SortHeader col="ages" />
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
                    {/* Ages and What are hidden on small screens, so they fold in here. */}
                    <p className="m-0 mt-0.5 text-xs text-stone-500 md:hidden">Ages: {a.ages}</p>
                    <p className="m-0 mt-0.5 text-xs text-stone-500 sm:hidden">{a.what}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">{a.where}</td>
                  <td className="hidden px-4 py-3 align-top text-stone-600 md:table-cell">{a.ages}</td>
                  <td className="hidden px-4 py-3 align-top text-stone-600 sm:table-cell">{a.what}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
