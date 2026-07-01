import { zcsEvents, type ZcsEvent } from '@/lib/zcs-calendar'
import { Fragment } from 'react'

// Milestones map — matches district-wide events in zcs-calendar.ts
const MILESTONE_META: Record<string, { slug: string; heading: string }> = {
  'First Student School Day': { slug: 'first-day', heading: 'First Day of School' },
  'Labor Day — No School': { slug: 'labor-day', heading: 'Labor Day' },
  'Fall Break — No School': { slug: 'fall-break', heading: 'Fall Break' },
  'Thanksgiving Break — No School': { slug: 'thanksgiving-break', heading: 'Thanksgiving Break' },
  'Winter Break — No School': { slug: 'winter-break', heading: 'Winter Break' },
  'Dr. MLK Holiday — No School': { slug: 'mlk-day', heading: 'Dr. MLK Holiday' },
  'February Break — No School': { slug: 'february-break', heading: 'February Break' },
  'Spring Break — No School': { slug: 'spring-break', heading: 'Spring Break' },
  'Last Student Day': { slug: 'last-day', heading: 'Last Day of School' },
}

const MILESTONE_ORDER = [
  'First Student School Day',
  'Labor Day — No School',
  'Fall Break — No School',
  'Thanksgiving Break — No School',
  'Winter Break — No School',
  'Dr. MLK Holiday — No School',
  'February Break — No School',
  'Spring Break — No School',
  'Last Student Day',
]

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')

  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  const startStr = s.toLocaleDateString('en-US', opts)
  const endStr = e.toLocaleDateString('en-US', opts)
  return `${startStr} – ${endStr}`
}

export default function ZcsMilestones() {
  const milestones = MILESTONE_ORDER
    .map((title) =>
      zcsEvents.find((e) => e.title === title && e.isDistrictwide)
    )
    .filter((e): e is ZcsEvent => e !== undefined)

  return (
    <div className="mb-8 pl-8 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2 print:hidden">
      {milestones.map((event) => {
        const meta = MILESTONE_META[event.title]
        const dateStr = event.endDate
          ? formatDateRange(event.startDate, event.endDate)
          : formatDate(event.startDate)

        return (
          <Fragment key={meta.slug}>
            <h2
              id={meta.slug}
              className="scroll-mt-20 text-base font-semibold m-0 text-village-600"
              style={{ fontFamily: 'inherit' }}
            >
              {meta.heading}
            </h2>
            <p
              className="m-0 text-village-700"
              style={{ fontFamily: 'inherit' }}
            >
              {dateStr}
            </p>
          </Fragment>
        )
      })}
    </div>
  )
}
