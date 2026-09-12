'use client'

import { useMemo, useState } from 'react'
import { sortActivities } from '@/lib/fall-activities'

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
  const rows = useMemo(() => sortActivities(byDate ? 'date' : 'featured'), [byDate])

  return (
    <section id="at-a-glance" className="not-prose mt-12 mb-10 scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-stone-900 m-0">
        Fall Activities at a Glance
      </h2>
      <p className="mt-1.5 mb-5 text-stone-600">
        Sorted by what stands out. Tap <span className="whitespace-nowrap">When</span> to see
        them in date order instead.
      </p>

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
    </section>
  )
}
