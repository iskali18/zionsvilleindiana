import type { Metadata } from 'next'
import ScheduleGenerator from './ScheduleGenerator'

export const metadata: Metadata = {
  title: 'ZCHS Schedule Maker | Zionsville',
  description:
    'Make and print a personalized ZCHS Green/Silver block schedule for your student. Covers the 2026-2027 school year.',
  alternates: {
    canonical: 'https://zionsvilleindiana.com/tools/zchs-schedule',
  },
  openGraph: {
    title: 'ZCHS Schedule Maker',
    description:
      'Make and print a personalized ZCHS Green/Silver block schedule for your student. Covers the 2026-2027 school year.',
    url: 'https://zionsvilleindiana.com/tools/zchs-schedule',
    type: 'website',
  },
}

export default function ZchsSchedulePage() {
  return <ScheduleGenerator />
}
