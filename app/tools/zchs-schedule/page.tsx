import type { Metadata } from 'next'
import ScheduleGenerator from './ScheduleGenerator'

export const metadata: Metadata = {
  title: 'Printable ZCHS Schedule Maker 2026-2027: Custom Green/Silver Days',
  description:
    "Make and print a personalized ZCHS block schedule. The 2026-2027 Green/Silver calendar is built in — just enter your student's classes.",
  alternates: {
    canonical: 'https://zionsvilleindiana.com/tools/zchs-schedule',
  },
  openGraph: {
    title: 'ZCHS Schedule Maker 2026-2027',
    description:
      "Make and print a personalized ZCHS block schedule. The 2026-2027 Green/Silver calendar is built in — just enter your student's classes.",
    url: 'https://zionsvilleindiana.com/tools/zchs-schedule',
    type: 'website',
  },
}

export default function ZchsSchedulePage() {
  return <ScheduleGenerator />
}
