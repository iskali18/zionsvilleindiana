interface EventEndedBannerProps {
  startDate: string
  endDate?: string
}

/**
 * Displays an "event has ended" banner if the event's end date has passed.
 * Uses endDate if provided, otherwise falls back to startDate.
 * Returns null (no render) if the event is upcoming or in progress.
 */
export default function EventEndedBanner({ startDate, endDate }: EventEndedBannerProps) {
  const compareDate = endDate || startDate
  const eventDate = new Date(compareDate + 'T23:59:59')
  const today = new Date()

  // Event is still upcoming or in progress — don't render banner
  if (eventDate >= today) return null

  const year = new Date(compareDate + 'T00:00:00').getFullYear()

  return (
    <div className="my-6 p-5 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
      <p className="text-sm text-amber-900 leading-relaxed">
        <span className="font-semibold">This event has ended for {year}.</span>{' '}
        Details for the next event will be posted when available.
      </p>
    </div>
  )
}
