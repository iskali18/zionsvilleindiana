import type { Metadata } from 'next'
import { getAthleticEvents } from '@/lib/zcs-sports'
import ZcsSportsCalendar from './ZcsSportsCalendar'

export const metadata: Metadata = {
  title:
    'ZCS Sports Calendar: Zionsville High School & Middle School Athletic Schedules',
  description:
    'Find Zionsville High School, Zionsville Middle School, and Zionsville West Middle School athletic events by school, sport, level, and date.',
  alternates: {
    canonical: 'https://zionsvilleindiana.com/tools/zcs-sports-calendar',
  },
  openGraph: {
    title: 'ZCS Sports Calendar',
    description:
      'Find Zionsville High School, Zionsville Middle School, and Zionsville West Middle School athletic events by school, sport, level, and date.',
    url: 'https://zionsvilleindiana.com/tools/zcs-sports-calendar',
    type: 'website',
  },
}

// Route-level revalidation. Scraper also has 15-min per-URL cache; this
// keeps the assembled result fresh across concurrent visitors.
export const revalidate = 900

export default async function ZcsSportsCalendarPage() {
  const { events, errors, fetchedAt } = await getAthleticEvents()
  return (
    <ZcsSportsCalendar
      events={events}
      fetchedAt={fetchedAt}
      errors={errors}
    />
  )
}
