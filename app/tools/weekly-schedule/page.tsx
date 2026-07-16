import { Metadata } from 'next'
import WeeklyScheduleGenerator from './WeeklyScheduleGenerator'

export const metadata: Metadata = {
  title: 'Weekly School Schedule Maker | Zionsville Indiana',
  description:
    'Create a one-page weekly schedule for classes, lunch, recess, and activities. For elementary, middle school, private school, or homeschool schedules that repeat each week.',
}

export default function WeeklySchedulePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-0 print:px-0 print:max-w-none">
      <WeeklyScheduleGenerator />
    </main>
  )
}
