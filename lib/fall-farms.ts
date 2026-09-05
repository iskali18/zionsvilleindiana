/** Fall farm and orchard data for the 2026 season.
 *
 *  Single source of truth for the comparison component and anything else that
 *  needs this data. Filter assignments come from fall-farms-filter-data-2026.csv;
 *  keep the two in step when a destination's features change.
 *
 *  Destinations are ordered by county — Boone, Hamilton, Hancock, Hendricks,
 *  Marion, Morgan — matching the order of the sections in the article. */

export const FILTERS = [
  // Ordered by how many destinations offer the feature, most common first.
  'Hayride / Wagon Ride',
  'Pumpkin Picking',
  'Corn Maze',
  'Rides / Large Play Area',
  'Farm Animals',
  'Sensory / Accessibility Info',
  'Free / No General Admission',
  'Apple Picking',
] as const

export type Filter = (typeof FILTERS)[number]

/** Short chip labels. The keys above stay as the meaning; these are what the
 *  reader sees on the chip and on the temporary match badges. */
export const SHORT: Record<Filter, string> = {
  'Free / No General Admission': 'Free Entry',
  'Apple Picking': 'Apples',
  'Pumpkin Picking': 'Pumpkins',
  'Corn Maze': 'Corn Maze',
  'Hayride / Wagon Ride': 'Hayride',
  'Farm Animals': 'Animals',
  'Rides / Large Play Area': 'Play Areas & Rides',
  'Sensory / Accessibility Info': 'Accessibility',
}

/** The four features shown as permanent icons on every row. */
export const ICONS: Array<{ filter: Filter; icon: string; label: string }> = [
  // Same order as the filter chips above, so the legend and the chips agree.
  { filter: 'Pumpkin Picking', icon: '\u{1F383}', label: 'Pumpkins' },
  { filter: 'Corn Maze',       icon: '\u{1F33D}', label: 'Corn maze' },
  { filter: 'Apple Picking',   icon: '\u{1F34E}', label: 'Apples' },
  { filter: 'Farm Animals',    icon: '\u{1F410}', label: 'Animals' },
]

export const ICON_FILTERS = new Set<Filter>(ICONS.map((i) => i.filter))

export type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

/** How much of a schedule the destination has actually published.
 *  `partial` means the season window is known but the operating days are not.
 *  `not_posted` means no 2026 schedule has been published at all.
 *  Neither ever means "closed" — a date tool must not treat them that way. */
export type ScheduleStatus = 'confirmed' | 'partial' | 'not_posted'

/** One schedule for one part of a destination. Most have a single entry;
 *  places like Tuttle run apple picking and pumpkin picking on different
 *  windows and need several. */
export interface Schedule {
  label: string
  /** The feature this schedule governs, when it maps to one. Lets a date
   *  filter check the pumpkin schedule rather than "is any part of it open". */
  appliesTo?: Filter
  /** Season window. Omit when only specific dates are published. */
  start?: string
  end?: string
  /** Operating days within the window. Omit when not published. */
  days?: Weekday[]
  /** Specific dates, for one-off events. */
  dates?: string[]
  /** Opening hours for this schedule, when published. */
  hours?: string
  status: ScheduleStatus
  /** Whether a date tool should consider this schedule. A farm store being
   *  open is not a reason to list the destination as open for a fall visit. */
  planner: boolean
  note?: string
}

export interface Destination {
  name: string
  city: string
  /** Heading anchor for this destination's section in the article. */
  anchor: string
  highlights: string
  cost: string
  /** Filters this destination qualifies for. Source: fall-farms-filter-data-2026.csv */
  features: Filter[]
  /** Published 2026 schedules. See ScheduleStatus — absent days are unknown,
   *  never "closed". */
  schedules: Schedule[]
  /** Features that are not available yet but are expected this season. The
   *  icon renders grayed with this label; the filter still excludes them, so a
   *  reader who ticks the chip is never sent somewhere that is not open. */
  comingSoon?: Partial<Record<Filter, string>>
}

export const DESTINATIONS: Destination[] = [
  {
    name: 'Dull\u2019s Tree Farm',
    anchor: 'dulls-tree-farm',
    city: 'Thorntown',
    highlights: 'Tire mountain, ropes course, giant slides; fireworks Oct. 24',
    cost: '$21.95 gate; pumpkins and select activities extra',
    features: ['Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area'],
    schedules: [
      { label: 'Fall Saturdays', dates: ['2026-09-26', '2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'], hours: '10:00 AM\u20137:00 PM', status: 'confirmed', planner: true },
      { label: 'Fall Sundays', dates: ['2026-09-27', '2026-10-04', '2026-10-11', '2026-10-18', '2026-10-25', '2026-11-01'], hours: '1:00\u20137:00 PM', status: 'confirmed', planner: true },
      { label: 'Weekdays', dates: ['2026-10-12', '2026-10-15', '2026-10-16', '2026-10-22', '2026-10-23', '2026-10-29', '2026-10-30'], hours: '1:00\u20137:00 PM', status: 'confirmed', planner: true },
      { label: 'Season Pass Holder Preview Day', dates: ['2026-09-20'], hours: '4:00\u20137:00 PM', status: 'confirmed', planner: false, note: 'Season pass holders only.' },
    ],
  },
  {
    name: 'Stuckey Farm Orchard & Cider Mill',
    anchor: 'stuckey-farm-orchard-cider-mill',
    city: 'Sheridan',
    highlights: 'Adventure Acres with a 60-ft tube slide; cider mill and café; weekend pig races',
    cost: 'Sat.\u2013Sun. $16.25 online / $18.95 gate; Thu.\u2013Fri. $12.50 / $14.75',
    features: ['Apple Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    comingSoon: { 'Pumpkin Picking': 'soon' },
    schedules: [
      { label: 'Fall season', start: '2026-08-20', end: '2026-10-25', days: ['thu', 'fri', 'sat', 'sun'], hours: 'Thu.\u2013Sat. 10 a.m.\u20137 p.m.; Sun. 1\u20137 p.m.', status: 'confirmed', planner: true },
      { label: 'Sunflower Festival', dates: ['2026-09-05', '2026-09-06', '2026-09-07', '2026-09-12', '2026-09-13'], status: 'confirmed', planner: true },
      { label: 'Pumpkin patch', appliesTo: 'Pumpkin Picking', days: ['thu', 'fri', 'sat', 'sun'], end: '2026-10-25', status: 'not_posted', planner: true, note: 'Included with admission later in the season; opening date not yet posted.' },
    ],
  },
  {
    name: 'Spencer Farm',
    anchor: 'spencer-farm',
    city: 'Noblesville',
    highlights: 'Dig-your-own mums, leashed pets welcome; winery with a tasting room in an 1883 farmhouse',
    cost: 'No entry or parking fee; 2026 pumpkin price not yet posted',
    features: ['Free / No General Admission', 'Hayride / Wagon Ride'],
    comingSoon: { 'Pumpkin Picking': 'from Sept. 19' },
    schedules: [
      { label: 'Farm and market', start: '2026-09-01', end: '2026-11-01', days: ['sun', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: 'Tue.\u2013Sat. 9 a.m.\u20136 p.m.; Sun. noon\u20136 p.m.', status: 'confirmed', planner: true, note: 'Year-round working farm; no separate fall hours. Closed Mondays.' },
      { label: 'Pumpkin patch', appliesTo: 'Pumpkin Picking', start: '2026-09-19', end: '2026-11-01', days: ['sun', 'tue', 'wed', 'thu', 'fri', 'sat'], status: 'confirmed', planner: true, note: 'Opens Sept. 19; open during normal farm hours after that.' },
      { label: 'Sunflower field', days: ['sun', 'tue', 'wed', 'thu', 'fri', 'sat'], status: 'not_posted', planner: true, note: 'Expected late September or early October; no date announced. Farm closed Mondays.' },
    ],
  },
  {
    name: 'Conner Prairie\u2019s Headless Horseman Festival',
    anchor: 'conner-prairies-headless-horseman-festival',
    city: 'Fishers',
    highlights: 'Headless Horseman hayride, dry tubing hill, shows; barrel train (48 in. max height)',
    cost: '$26 festival + $10 hayride',
    features: ['Hayride / Wagon Ride', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    schedules: [{ label: 'Headless Horseman Festival', start: '2026-10-01', end: '2026-10-25', days: ['thu', 'fri', 'sat', 'sun'], hours: '5\u201310 p.m.', status: 'confirmed', planner: true }],
  },
  {
    name: 'Russell Farms Pumpkin Patch',
    anchor: 'russell-farms-pumpkin-patch',
    city: 'Noblesville',
    highlights: '2 corn mazes + 2 low-wall mazes, 18-hole mini golf; 44-in. minimum on 3 rides',
    cost: '$17; $10 veterans, military and 70+; pumpkins about $5\u2013$12',
    features: ['Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area'],
    schedules: [
      { label: 'Weekends', dates: ['2026-09-26', '2026-09-27', '2026-10-03', '2026-10-04', '2026-10-10', '2026-10-11', '2026-10-17', '2026-10-18', '2026-10-24', '2026-10-25', '2026-10-31'], hours: '10:00 AM\u20136:00 PM', status: 'confirmed', planner: true },
      { label: 'October weekdays', dates: ['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-21', '2026-10-22', '2026-10-23'], hours: '1:00\u20135:00 PM', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Tuttle Orchards',
    anchor: 'tuttle-orchards',
    city: 'Greenfield',
    highlights: 'Free entry, closed Sundays; wheelchair-accessible hayride, farm-to-table café',
    cost: 'Free entry; FarmYard $10 age 2+; carving pumpkins $10, pie $5, mini $2',
    features: ['Free / No General Admission', 'Apple Picking', 'Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    schedules: [
      { label: 'U-pick apples', appliesTo: 'Apple Picking', start: '2026-08-28', end: '2026-10-31', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: '9:00 AM\u20136:00 PM through Sept. 30; 9:00 AM\u20137:00 PM in October', status: 'confirmed', planner: true, note: 'Closed Sundays.' },
      { label: 'U-pick pumpkins', appliesTo: 'Pumpkin Picking', start: '2026-09-18', end: '2026-10-31', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: '9:00 AM\u20136:00 PM through Sept. 30; 9:00 AM\u20137:00 PM in October', status: 'confirmed', planner: true, note: 'Closed Sundays.' },
      { label: 'U-cut flower garden', start: '2026-08-28', days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'], status: 'partial', planner: true, note: 'Runs until frost; no end date posted.' },
      { label: 'Caramel Apple Festival', dates: ['2026-09-12', '2026-09-19'], hours: '10:00 AM\u20135:00 PM', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Lark Ranch',
    anchor: 'lark-ranch',
    city: 'Greenfield',
    highlights: 'Mile-long train ride, carnival rides included with admission, Highland cows',
    cost: '$17 or $22 by date; ages 3+ ticketed; pumpkins by the pound extra',
    features: ['Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    schedules: [
      { label: 'Saturdays', dates: ['2026-09-19', '2026-09-26', '2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'], hours: '11:00 AM\u20138:00 PM', status: 'confirmed', planner: true, note: 'Oct. 24 is Colt\u2019s Fall Fest.' },
      { label: 'Sundays', dates: ['2026-09-20', '2026-09-27', '2026-10-04', '2026-10-11', '2026-10-18', '2026-10-25', '2026-11-01'], hours: '11:00 AM\u20136:00 PM', status: 'confirmed', planner: true },
      { label: 'October Fridays', dates: ['2026-10-09', '2026-10-16', '2026-10-23', '2026-10-30'], hours: '12:00\u20138:00 PM', status: 'confirmed', planner: true },
      { label: 'Columbus Day', dates: ['2026-10-12'], hours: '11:00 AM\u20136:00 PM', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Piney Acres Farm',
    anchor: 'piney-acres-farm',
    city: 'Fortville',
    highlights: 'Train, 150-ft slide (42 in. min height); sensory-friendly Ausome Fall Fest Sept. 12',
    cost: 'Adults $10\u2013$18; kids 3\u201313 $20; tots $5; pumpkins extra',
    features: ['Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    schedules: [
      { label: 'Ausome Fall Fest', dates: ['2026-09-12'], hours: 'noon\u20133 p.m.', status: 'confirmed', planner: true },
      { label: 'Fall season', start: '2026-09-19', end: '2026-10-25', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: 'Mon.\u2013Fri. 1\u20137 p.m.; Sat. 10 a.m.\u20137 p.m.; Sun. noon\u20137 p.m.', status: 'confirmed', planner: true, note: 'Open daily.' },
    ],
  },
  {
    name: 'Hogan Farms Pumpkin Patch & Corn Maze',
    anchor: 'hogan-farms-pumpkin-patch-corn-maze',
    city: 'Brownsburg',
    highlights: 'Pay-as-you-go pricing, Kid Zone, leashed pets allowed',
    cost: 'No general admission; 2026 activity and pumpkin prices not yet posted',
    features: ['Free / No General Admission', 'Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride'],
    schedules: [
      { label: 'Farmers Market', start: '2026-10-03', end: '2026-11-01', days: ['sat', 'sun'], status: 'confirmed', planner: true, note: 'Every weekend in October, per the farm\u2019s vendor flyer.' },
      { label: 'Fall season', start: '2026-09-26', end: '2026-10-31', days: ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'], hours: 'Tue.\u2013Thu. 2\u20136 p.m.; Fri.\u2013Sat. 10 a.m.\u20138 p.m.; Sun. 10 a.m.\u20136 p.m.', status: 'confirmed', planner: true, note: 'Days and hours confirmed by the farm; closed Mondays. End date taken from the October-weekends market flyer, not stated by the farm. 2026 activity prices not posted.' },
    ],
  },
  {
    name: 'Nehemiah Ranch Fall Harvest Days',
    anchor: 'nehemiah-ranch-fall-harvest-days',
    city: 'Avon',
    highlights: 'Free three-night event with a fire pit, s\u2019mores and a child\u2019s pumpkin',
    cost: 'Free; $5 donation suggested; child\u2019s pumpkin included',
    features: ['Free / No General Admission', 'Pumpkin Picking', 'Hayride / Wagon Ride'],
    schedules: [{ label: 'Fall Saturdays', dates: ['2026-10-03', '2026-10-10', '2026-10-17'], hours: '6\u20139 p.m.', status: 'confirmed', planner: true }],
  },
  {
    name: 'Beasley\u2019s Orchard',
    anchor: 'beasleys-orchard',
    city: 'Danville',
    highlights: '7 themed festival weekends, apple cannons, Straw Mountain',
    cost: '$12 weekdays; $14\u2013$16 weekends by date; $5 parking Heartland weekends',
    features: ['Apple Picking', 'Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Rides / Large Play Area', 'Sensory / Accessibility Info'],
    schedules: [
      { label: 'Fall season', start: '2026-09-19', end: '2026-11-01', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: 'Mon.\u2013Fri. 1\u20136 p.m.; Sat. 9 a.m.\u20136 p.m.; Sun. noon\u20136 p.m.', status: 'confirmed', planner: true, note: 'Attractions open daily; admission sales end at 5 p.m.' },
      { label: 'Heartland Apple Festival', dates: ['2026-10-03', '2026-10-04', '2026-10-10', '2026-10-11'], hours: '9 a.m.\u20136 p.m.', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Driving Wind Berry Farms',
    anchor: 'driving-wind-berry-farms',
    city: 'Indianapolis',
    highlights: 'Year-round café and espresso bar; urban farm minutes from downtown',
    cost: '2026 Pumpkin Palooza pricing not yet posted',
    features: ['Pumpkin Picking', 'Farm Animals'],
    schedules: [
      { label: 'Caf\u00e9', start: '2026-09-01', end: '2026-11-01', days: ['wed', 'thu', 'fri', 'sat'], hours: '8 a.m.\u20133 p.m.', status: 'confirmed', planner: false, note: 'Caf\u00e9 hours only, announced Aug. 26. The farm has not posted its own hours, so this does not decide whether a fall visit is possible.' },
      { label: 'Pumpkin Palooza', dates: ['2026-10-03', '2026-10-10'], hours: '8 a.m.\u20133 p.m.', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Waterman\u2019s Family Farm',
    anchor: 'watermans-family-farm',
    city: 'Indianapolis',
    highlights: 'Pumpkin-eating dinosaur, rides and games included',
    cost: 'From $12.95; weekends $17.95; pumpkins from $5',
    features: ['Pumpkin Picking', 'Corn Maze', 'Hayride / Wagon Ride', 'Farm Animals', 'Rides / Large Play Area'],
    schedules: [
      { label: 'Opening weekend', dates: ['2026-09-26', '2026-09-27'], hours: '11:00 AM\u20135:00 PM', status: 'confirmed', planner: true },
      { label: 'October weekdays', dates: ['2026-10-07', '2026-10-08', '2026-10-09', '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-21', '2026-10-22', '2026-10-23'], hours: '10:00 AM\u20137:00 PM', status: 'confirmed', planner: true, note: 'Closed most Mondays and Tuesdays; open Oct. 12\u201313.' },
      { label: 'October Saturdays', dates: ['2026-10-03', '2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'], hours: '10:00 AM\u20138:00 PM', status: 'confirmed', planner: true },
      { label: 'October Sundays', dates: ['2026-10-04', '2026-10-11', '2026-10-18', '2026-10-25'], hours: '10:00 AM\u20137:00 PM', status: 'confirmed', planner: true },
      { label: 'Closing week', dates: ['2026-10-28', '2026-10-29', '2026-10-30', '2026-11-01'], hours: '11:00 AM\u20135:00 PM', status: 'confirmed', planner: true },
    ],
  },
  {
    name: 'Anderson Orchard',
    anchor: 'anderson-orchard',
    city: 'Mooresville',
    highlights: 'Open 7 days a week; free Apple Festival & Craft Fair with 80+ vendors, Sept. 26–27',
    cost: 'Apple Festival free; 2026 pumpkin price not yet posted',
    features: ['Free / No General Admission', 'Apple Picking'],
    comingSoon: { 'Pumpkin Picking': 'from Sept. 26' },
    schedules: [
      { label: 'Orchard season', start: '2026-07-01', end: '2026-11-15', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], hours: 'Sept.\u2013Oct. 8 a.m.\u20138 p.m. or dark', status: 'confirmed', planner: true, note: 'Apples early July into mid-November.' },
      { label: 'Apple Festival & Craft Fair', dates: ['2026-09-26', '2026-09-27'], hours: 'Crafters 10 a.m.\u20136 p.m.', status: 'confirmed', planner: true },
      { label: 'Kid Craft Fair', dates: ['2026-09-12'], hours: '1\u20134 p.m.', status: 'confirmed', planner: true },
      { label: 'Pumpkin patch', appliesTo: 'Pumpkin Picking', start: '2026-09-26', end: '2026-11-01', days: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'], status: 'confirmed', planner: true, note: 'Listed as an open attraction for the Sept. 26\u201327 Apple Festival; may open earlier if the crop is ready.' },
    ],
  },
]
