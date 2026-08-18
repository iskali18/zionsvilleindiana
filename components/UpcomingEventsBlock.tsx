import Link from 'next/link'
import { getUpcomingEvents } from '@/lib/calendar'

/**
 * Compact 3-event block for hub pages (Things to Do, etc).
 * Reuses the same server-side utility as /events, so no duplicate API calls.
 * Events come back sorted by nearest date, so slicing the first 3 naturally
 * surfaces today/this-weekend events when they exist and falls back to the
 * next upcoming events otherwise.
 * Renders nothing if there are no upcoming events.
 */
export default async function UpcomingEventsBlock() {
  const events = await getUpcomingEvents(5)
  const displayEvents = events.slice(0, 3)

  if (displayEvents.length === 0) return null

  return (
    <section className="my-10">
      <h2
        id="whats-happening-in-zionsville"
        className="font-display text-3xl text-stone-900 mb-2"
      >
        What&rsquo;s Happening in Zionsville
      </h2>
      <p className="text-stone-500 text-sm mb-5">
        Upcoming events from the community calendar.
      </p>

      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        {displayEvents.map((event) => {
          const eventDate = new Date(
            event.isAllDay ? event.startDate + 'T00:00:00' : event.startDate
          )
          const dateStr = eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'America/Indiana/Indianapolis',
          })
          return (
            <div
              key={event.id}
              className="border border-stone-200 rounded-lg p-4 bg-white hover:border-stone-300 transition-colors"
            >
              <p className="text-xs text-brick-600 font-medium mb-1">
                {dateStr}
                {!event.isAllDay && event.startTime && ` · ${event.startTime}`}
              </p>
              <p className="font-medium text-stone-900 leading-snug line-clamp-2">
                {event.title}
              </p>
              {event.location && (
                <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                  {event.location}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <Link
        href="/events"
        className="text-sm text-brick-600 hover:text-brick-700 font-medium"
      >
        View all upcoming events →
      </Link>
    </section>
  )
}
