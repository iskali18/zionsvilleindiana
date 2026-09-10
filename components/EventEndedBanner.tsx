import { activeGuides, labelFor } from '@/lib/seasonal-guides'
import Link from 'next/link'

interface EventEndedBannerProps {
  startDate: string
  endDate?: string
}

/** True once the event's end date has passed. Exported so the page can decide
 *  where the seasonal strip belongs without repeating the comparison. */
export function hasEnded(startDate: string, endDate?: string): boolean {
  const compareDate = endDate || startDate
  return new Date(compareDate + 'T23:59:59') < new Date()
}

/**
 * Displays an "event has ended" banner if the event's end date has passed.
 * Uses endDate if provided, otherwise falls back to startDate.
 * Returns null (no render) if the event is upcoming or in progress.
 *
 * When seasonal guides are live, their links ride along inside the banner
 * rather than in a second callout further down. One block reads as one
 * thought: this is over, here is what is on now.
 */
export default function EventEndedBanner({ startDate, endDate }: EventEndedBannerProps) {
  if (!hasEnded(startDate, endDate)) return null

  const compareDate = endDate || startDate
  const year = new Date(compareDate + 'T00:00:00').getFullYear()

  // Indianapolis time so the links turn over locally rather than in UTC.
  const guides = activeGuides(
    new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Indiana/Indianapolis' }))
  )

  return (
    <div className="my-6 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
      <p className="text-sm text-amber-900 leading-relaxed">
        <span className="font-semibold">This event has ended for {year}.</span>{' '}
        Details for the next event will be posted when available.
      </p>

      {guides.length > 0 && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <p className="m-0 mb-2 text-sm font-semibold text-amber-900">
            {labelFor(guides, 'event')}
          </p>
          <p className="m-0 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {guides.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="font-medium text-brick-600 hover:text-brick-700 whitespace-nowrap"
              >
                {g.title} →
              </Link>
            ))}
          </p>
        </div>
      )}
    </div>
  )
}
