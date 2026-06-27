// Zionsville Community Schools 2026-2027 calendar data
// Update annually when ZCS releases the next school year's calendar

export type Audience = 'elementary' | 'zms' | 'zwms' | 'zchs'

export interface ZcsEvent {
  /** ISO date string (YYYY-MM-DD) */
  startDate: string
  /** ISO date string (YYYY-MM-DD); only set for multi-day events */
  endDate?: string
  title: string
  /** Display label for time. Empty/undefined for all-day events. */
  time?: string
  /** Which schools this event applies to. Districtwide events include all audiences. */
  audiences: Audience[]
  /** Display label for audiences. Districtwide events display as "All ZCS". */
  audienceLabel: string
  /** Additional details. May be long; UI will collapse if needed. */
  comment?: string
  /** True for events that apply district-wide (breaks, no-school days, first/last day) */
  isDistrictwide: boolean
}

export const zcsEvents: ZcsEvent[] = [
  // Back-to-School / Picture Days week
  {
    startDate: '2026-07-27',
    title: 'Back-to-School/Picture Days',
    time: '8 AM – 4 PM',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'All grades; enter Door 1',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-27',
    title: 'Block Schedule & Senior Transition Program',
    time: 'Repeating informational sessions',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Contact school for details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-28',
    title: 'Freshman/New Student Kick-Off',
    time: '8:30 AM – 11:30 AM',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Students enter Door 3',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-28',
    title: 'Back-to-School/Picture Days',
    time: '12 PM – 7 PM',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'All grades; enter Door 1',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-28',
    title: 'Block Schedule & Senior Transition Program',
    time: 'Repeating informational sessions',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Contact school for details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-28',
    title: 'Back-to-School/Picture Days',
    time: '1 PM – 7 PM',
    audiences: ['zms', 'zwms'],
    audienceLabel: 'ZMS · ZWMS',
    comment: 'Grades 5–8',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-29',
    title: 'Late Back-to-School Registration',
    time: '9:00 AM – 3:00 PM',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Enter Door 1',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-29',
    title: 'Block Schedule & Senior Transition Program',
    time: 'Repeating informational sessions',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Contact school for details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-29',
    title: 'Back-to-School/Picture Days',
    time: '10:30 AM – 5:00 PM',
    audiences: ['zms'],
    audienceLabel: 'ZMS',
    comment: 'Grades 5–8',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-29',
    title: 'Back-to-School/Picture Days',
    time: '10:00 AM – 5:00 PM',
    audiences: ['zwms'],
    audienceLabel: 'ZWMS',
    comment: 'Grades 5–8',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-30',
    title: 'Open House/Meet the Teacher Nights (Pre-K, K)',
    time: '5:00 PM – 7:00 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'Pre-K through Kindergarten only',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-31',
    title: 'Open House/Meet the Teacher Nights (Grades 1–4)',
    time: '5:00 PM – 7:00 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'Grades 1–4',
    isDistrictwide: false,
  },
  {
    startDate: '2026-07-31',
    title: 'Locker Day (Optional)',
    time: '10:00 AM – 2:00 PM',
    audiences: ['zms'],
    audienceLabel: 'ZMS',
    comment: 'Grades 5–8',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-03',
    title: 'Locker Day (Optional)',
    time: '10:00 AM – 2:00 PM',
    audiences: ['zwms'],
    audienceLabel: 'ZWMS',
    comment: 'Grades 5–8',
    isDistrictwide: false,
  },

  // First day of school
  {
    startDate: '2026-08-04',
    title: 'First Student School Day',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },

  // Curriculum Nights
  {
    startDate: '2026-08-11',
    title: 'Grades 5 & 6 Curriculum Night',
    time: '6:00 PM – 7:30 PM',
    audiences: ['zms', 'zwms'],
    audienceLabel: 'ZMS · ZWMS',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-13',
    title: 'Open House & Parent/Caregiver Information Night',
    time: '6:00 PM – 8:00 PM',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'During Open House & Information Night, parents/caregivers can meet teachers to learn more about course requirements, grading expectations, and communication. Workshops will also be offered dedicated to parent/caregiver education. Topics such as social media/online safety, trends in drug/vaping use, navigating ZCHS counseling resources, and tips for parents on increasing student self-advocacy are being planned.',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-18',
    title: 'Grades 7 and 8 Curriculum Night',
    time: '6:00 PM – 7:30 PM',
    audiences: ['zms', 'zwms'],
    audienceLabel: 'ZMS · ZWMS',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: 'Pre-K Back-to-School/Curriculum Night',
    time: '5:00 PM – 5:30 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: 'Kindergarten Back-to-School/Curriculum Night',
    time: '5:30 PM – 6:00 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: '1st Grade Back-to-School/Curriculum Night',
    time: '6:00 PM – 6:30 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: '2nd Grade Back-to-School/Curriculum Night',
    time: '6:30 PM – 7:00 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: '3rd Grade Back-to-School/Curriculum Night',
    time: '7:00 PM – 7:30 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-20',
    title: '4th Grade Back-to-School/Curriculum Night',
    time: '7:30 PM – 8:00 PM',
    audiences: ['elementary'],
    audienceLabel: 'All Elementary Schools',
    comment: 'See your school\u2019s website for school-specific details',
    isDistrictwide: false,
  },
  {
    startDate: '2026-08-21',
    title: 'Picture Day',
    time: 'During school day',
    audiences: ['zwms'],
    audienceLabel: 'ZWMS',
    isDistrictwide: false,
  },

  // Districtwide breaks and no-school days
  {
    startDate: '2026-09-07',
    title: 'Labor Day — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    title: 'Fall Break — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2026-11-25',
    endDate: '2026-11-27',
    title: 'Thanksgiving Break — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2026-12-21',
    endDate: '2027-01-04',
    title: 'Winter Break — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2027-01-18',
    title: 'Dr. MLK Holiday — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2027-02-15',
    endDate: '2027-02-19',
    title: 'February Break — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2027-03-26',
    endDate: '2027-04-02',
    title: 'Spring Break — No School',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2027-05-26',
    title: 'Last Student Day',
    audiences: ['elementary', 'zms', 'zwms', 'zchs'],
    audienceLabel: 'All ZCS',
    isDistrictwide: true,
  },
  {
    startDate: '2027-06-02',
    title: 'Commencement',
    audiences: ['zchs'],
    audienceLabel: 'ZCHS',
    comment: 'Rain date June 3, 2027',
    isDistrictwide: false,
  },
]
