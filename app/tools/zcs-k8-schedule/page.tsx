import { Metadata } from 'next'
import ZcsK8ScheduleGenerator from './ZcsK8ScheduleGenerator'

export const metadata: Metadata = {
  title: 'ZCS K-8 Weekly Schedule Maker | Zionsville Indiana',
  description:
    'Create a one-page weekly schedule for classes, lunch, recess, and activities. For ZCS elementary and middle school students.',
}

export default function ZcsK8SchedulePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 print:py-0 print:px-0 print:max-w-none">
      <ZcsK8ScheduleGenerator />
    </main>
  )
}
