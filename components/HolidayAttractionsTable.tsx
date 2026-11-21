'use client'

import { useMemo, useState } from 'react'
import Toggle from '@/components/ui/Toggle'
import {
  TYPES,
  filterAttractions,
  sortAttractions,
  type AttractionType,
  type SortKey,
  type SortDir,
} from '@/lib/holiday-attractions'

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Destination',
  city: 'City',
}

/** Sort arrows as icons, not text characters, so search engines don't read
 *  them as part of the header. Same icons as the indoor activities tables. */
function SortIcon({ state }: { state: 'asc' | 'desc' | 'none' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
      {state === 'asc' && <path d="M8 3v10M4 9l4 4 4-4" />}
      {state === 'desc' && <path d="M8 13V3M4 7l4-4 4 4" />}
      {state === 'none' && <path d="M5 13.5v-11M2.5 5 5 2.5 7.5 5M11 2.5v11M8.5 11 11 13.5 13.5 11" />}
    </svg>
  )
}

/** At-a-glance table for the Christmas attractions round-up. Same chips and
 *  free toggle as ChristmasEventTable. Type chips are OR: Farms + Train Rides
 *  shows both. Opens A to Z by destination; the Destination and City headers
 *  sort by their column, and clicking the active header again flips between
 *  A to Z and Z to A. The section keeps the `christmas-events-at-a-glance` id so the
 *  article's "Back to the list" links still land here. */
export default function HolidayAttractionsTable() {
  const [types, setTypes] = useState<AttractionType[]>([])
  const [freeOnly, setFreeOnly] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const filtering = types.length > 0 || freeOnly

  const rows = useMemo(
    () => filterAttractions(sortAttractions(sortKey, sortDir), types, freeOnly),
    [types, freeOnly, sortKey, sortDir]
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

  const toggleType = (t: AttractionType) =>
    setTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))

  const clear = () => {
    setTypes([])
    setFreeOnly(false)
  }

  return (
    <section id="christmas-events-at-a-glance" className="not-prose mt-12 mb-10 scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Christmas Events at a Glance
      </h2>
      <p className="mt-1.5 mb-5 text-stone-600">
        Filter by type or show attractions with free admission.
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
        <Toggle
          label="Free admission available"
          active={freeOnly}
          onClick={() => setFreeOnly((v) => !v)}
          accent="amber"
        />
      </div>

      <p className="mt-4 mb-0 text-sm text-stone-600" aria-live="polite">
        <span className="font-semibold text-stone-900">{rows.length}</span>{' '}
        {rows.length === 1 ? 'attraction' : 'attractions'}
        {filtering && (
          <>
            {' · '}
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

      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-stone-200 bg-white px-5 py-6 text-center text-sm text-stone-500">
          No attractions match those filters.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-stone-200">
          <table className="w-full border-collapse text-sm">
            {/* Read by screen readers and search engines, hidden on screen. */}
            <caption className="sr-only">
              Christmas lights and holiday attractions near Zionsville and Indianapolis
            </caption>
            <thead>
              <tr className="border-b-2 border-stone-300 bg-stone-100 text-left">
                <th
                  className="px-4 py-3 font-semibold text-stone-800 sm:w-72"
                  aria-sort={ariaSort('name')}
                >
                  <SortHeader col="name" />
                </th>
                <th
                  className="w-28 px-4 py-3 font-semibold text-stone-800"
                  aria-sort={ariaSort('city')}
                >
                  <SortHeader col="city" />
                </th>
                <th className="hidden px-4 py-3 font-semibold text-stone-800 sm:table-cell">
                  Highlights
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
                    {/* Highlights is hidden on small screens, so it folds in here. */}
                    <p className="m-0 mt-0.5 text-xs text-stone-500 sm:hidden">{a.highlights}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-stone-600">{a.city}</td>
                  <td className="hidden px-4 py-3 align-top text-stone-600 sm:table-cell">
                    {a.highlights}
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
