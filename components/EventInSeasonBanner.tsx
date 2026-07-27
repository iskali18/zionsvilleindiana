interface EventInSeasonBannerProps {
  startDate: string
  endDate?: string
  message?: string
}

/**
 * Displays an "event is in season" banner when today's date falls between
 * startDate and endDate (inclusive), and only when a message is provided.
 * Returns null (no render) before the season starts, after it ends, or when
 * no message is set on the event.
 *
 * Pair with EventEndedBanner for automatic season transitions:
 *  - Before startDate: neither banner shows
 *  - Between startDate and endDate: this banner shows
 *  - After endDate: EventEndedBanner takes over
 */
export default function EventInSeasonBanner({
  startDate,
  endDate,
  message,
}: EventInSeasonBannerProps) {
  if (!message) return null

  const start = new Date(startDate + 'T00:00:00')
  const end = new Date((endDate || startDate) + 'T23:59:59')
  const today = new Date()

  // Only render during the active season
  if (today < start || today > end) return null

  return (
    <div className="my-6 p-5 bg-white border-l-4 border-village-600 rounded-r-lg">
      <p className="text-sm text-stone-900 leading-relaxed font-semibold">
        {message}
      </p>
    </div>
  )
}
