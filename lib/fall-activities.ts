/** Fall activities for the at-a-glance table on
 *  /articles/fall-activities-zionsville.
 *
 *  Single source of truth for the table. The article body carries the full
 *  write-up for each activity; `anchor` links the two, so it must match the
 *  heading slug in the markdown.
 */

/** Filter chips, in the order they appear above the table. */
export const FILTERS = [
  'Family',
  'Outdoors',
  'Arts, Music & Culture',
  'Downtown',
  'Halloween',
] as const

export type Filter = (typeof FILTERS)[number]

export interface FallActivity {
  /** Label shown in the table. Shorter than the section heading. */
  name: string
  /** Heading slug in the article. Must match, or the jump link goes nowhere. */
  anchor: string
  /** Dates as written for a reader: 'Oct. 2\u20133', 'Throughout fall'. */
  when: string
  /** ISO date used for sorting only. Null for anything without a fixed start,
   *  which then sorts last under the date view. It can differ from `when`: a
   *  series lists its whole season there but sorts by its next date. */
  sortDate: string | null
  /** ISO date of the LAST day this runs. Only needed when it differs from
   *  `sortDate` — a run of dates, or a series that sorts by its next date.
   *  Omit for a single-day activity; `sortDate` is then the last day too.
   *  Used to decide when an activity is over, not for sorting. */
  endDate?: string
  /** One line on what happens. */
  what: string
  /** Categories this activity belongs to. An activity can sit in several, and
   *  some sit in none — not everything needs a category. */
  types: Filter[]
  /** True when the activity itself is free to attend. Food, rides or optional
   *  extras may still cost. */
  free: boolean
  /** Editorial rank, lower first. Numbered in tens so a new activity can slot
   *  between two without renumbering the rest. */
  featured: number
}

export const FALL_ACTIVITIES: FallActivity[] = [
  {
    name: 'GhostWalk',
    anchor: 'experience-zionsvilles-ghostwalk',
    when: 'Oct. 2\u20133',
    sortDate: '2026-10-02',
    endDate: '2026-10-03',
    what: 'Guided walking tour with local ghost stories and costumed actors',
    types: ['Outdoors', 'Downtown', 'Halloween'],
    free: false,
    featured: 10,
  },
  {
    name: 'Fright Nights',
    anchor: 'experience-fright-nights',
    when: 'Oct. 23\u201324',
    sortDate: '2026-10-23',
    endDate: '2026-10-24',
    what: 'Haunted hayride, Fright Barn, family-friendly Spooky Story Barn and other nighttime activities',
    types: ['Outdoors', 'Halloween'],
    free: false,
    featured: 20,
  },
  {
    name: 'Nightmare at Elm Street: A Luminary Walk',
    anchor: 'explore-nightmare-at-elm-street-a-luminary-walk',
    when: 'Oct. 29',
    sortDate: '2026-10-29',
    what: 'Evening walk lined with lights, playful skeletons and a Pumpkin Pathway',
    types: ['Family', 'Outdoors', 'Halloween'],
    free: true,
    featured: 25,
  },
  {
    name: 'Pumpkinfest',
    anchor: 'celebrate-fall-at-pumpkinfest',
    when: 'Oct. 3',
    sortDate: '2026-10-03',
    what: 'Hayrides to the pumpkin patch with children\u2019s activities and a petting zoo',
    types: ['Family', 'Outdoors'],
    free: true,
    featured: 30,
  },
  {
    name: 'Oktoberfest',
    anchor: 'raise-a-stein-at-oktoberfest',
    when: 'Oct. 3',
    sortDate: '2026-10-03',
    what: 'German food, live polka music and a 21+ Biergarten',
    types: ['Arts, Music & Culture'],
    free: true,
    featured: 40,
  },
  {
    name: 'Pumpkins & Hayrides',
    anchor: 'enjoy-pumpkins--hayrides-at-lions-park',
    when: 'Oct. 25',
    sortDate: '2026-10-25',
    what: 'An afternoon of pumpkins, hayrides and fall activities at Lions Park',
    types: ['Family', 'Outdoors'],
    free: true,
    featured: 50,
  },
  {
    name: 'Trick or Trees',
    anchor: 'take-the-kids-to-trick-or-trees',
    when: 'Oct. 24',
    sortDate: '2026-10-24',
    what: 'Trick-or-treating along a family-friendly trail through Elm Street Green for ages 2\u201312',
    types: ['Family', 'Outdoors', 'Halloween'],
    free: false,
    featured: 70,
  },
  {
    name: 'Smashin\u2019 Pumpkins',
    anchor: 'smash-your-pumpkins-at-mulberry-fields',
    when: 'Nov. 7',
    sortDate: '2026-11-07',
    what: 'Pumpkin smashing, composting tips and the Epic Pumpkin Drop',
    types: ['Family', 'Outdoors'],
    free: true,
    featured: 90,
  },
  {
    name: 'Gallery On & Off Main',
    anchor: 'explore-gallery-on--off-main',
    when: 'Oct. 24',
    sortDate: '2026-10-24',
    what: 'Local artists showcased in shops and galleries along Main Street',
    types: ['Arts, Music & Culture', 'Downtown'],
    free: true,
    featured: 110,
  },
  {
    name: 'Salem Methodist Church Fall Cookout',
    anchor: 'spend-a-fall-evening-at-salem-methodist-church',
    when: 'Oct. 2',
    sortDate: '2026-10-02',
    what: 'Food, hayrides, pumpkin painting and an evening campfire',
    types: ['Family', 'Outdoors'],
    free: true,
    featured: 120,
  },
  {
    name: 'Fall Races',
    anchor: 'race-through-zionsville-this-fall',
    when: 'Oct. 3\u2013Nov. 26',
    sortDate: '2026-10-03',
    endDate: '2026-11-26',
    what: 'Three community running and walking events from October through Thanksgiving morning',
    types: ['Family', 'Outdoors', 'Downtown'],
    free: false,
    featured: 130,
  },
  {
    name: 'Campfire Concert: Mr Daniel and Friends',
    anchor: 'campfire-concert-series',
    when: 'Oct. 8',
    sortDate: '2026-10-08',
    what: 'Free outdoor concert with campfires and sunset views at Carpenter Nature Preserve',
    types: ['Family', 'Outdoors', 'Arts, Music & Culture'],
    free: true,
    featured: 141,
  },
  {
    name: 'Fall Birding at Starkey Nature Park',
    anchor: 'fall-birding-starkey',
    when: 'Oct. 10',
    sortDate: '2026-10-10',
    what: 'Naturalist-led morning bird walk for ages 12 and up',
    types: ['Outdoors'],
    free: false,
    featured: 142,
  },
  {
    name: 'Night Hike',
    anchor: 'night-hike',
    when: 'Oct. 16',
    sortDate: '2026-10-16',
    what: 'Guided after-dark hike at Carpenter Nature Preserve for ages 5 and up',
    types: ['Family', 'Outdoors'],
    free: false,
    featured: 143,
  },
  {
    name: 'Fall Birding at Carpenter Nature Preserve',
    anchor: 'fall-birding-carpenter',
    when: 'Nov. 7',
    sortDate: '2026-11-07',
    what: 'Naturalist-led bird walk for ages 12 and up',
    types: ['Outdoors'],
    free: false,
    featured: 144,
  },
  {
    name: 'Owl Prowl',
    anchor: 'owl-prowl',
    when: 'Nov. 13',
    sortDate: '2026-11-13',
    what: 'Learn about local owls, then look and listen for them with a naturalist at Carpenter Nature Preserve',
    types: ['Family', 'Outdoors'],
    free: false,
    featured: 145,
  },
  {
    name: 'Fall Campfire',
    anchor: 'fall-campfire',
    when: 'Nov. 21',
    sortDate: '2026-11-21',
    what: 'Sunset animal walk and marshmallow roasting at Carpenter Nature Preserve',
    types: ['Family', 'Outdoors'],
    free: false,
    featured: 146,
  },
  {
    name: 'SFZ Concert Series',
    anchor: 'enjoy-the-sfz-concert-series',
    when: 'Oct. 11 & Nov. 1',
    sortDate: '2026-10-11',
    endDate: '2026-11-01',
    what: 'Sunday afternoon concerts at St. Francis In-The-Fields',
    types: ['Arts, Music & Culture'],
    free: true,
    featured: 160,
  },
  {
    name: 'ZCHS Performances & Sports',
    anchor: 'enjoy-fall-performances--sports-at-zchs',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Fall musical, band and choir concerts, and Eagles home games',
    types: ['Family', 'Arts, Music & Culture'],
    free: false,
    featured: 170,
  },
  {
    name: 'Traders Point Creamery',
    anchor: 'visit-traders-point-creamery',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Walk the pastures and explore a working dairy farm',
    types: ['Family', 'Outdoors'],
    free: false,
    featured: 180,
  },
  {
    name: 'Fall Walks & Trails',
    anchor: 'take-a-fall-walk-or-bike-ride',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Wooded park trails and the paved Zionsville Rail Trail in fall color',
    types: ['Family', 'Outdoors'],
    free: true,
    featured: 190,
  },
  {
    name: 'Teeny Tiny Art Market',
    anchor: 'browse-the-teeny-tiny-art-market',
    when: 'Nov. 20\u2013Dec. 19',
    sortDate: '2026-11-20',
    endDate: '2026-12-19',
    what: 'Miniature works by local and regional artists on display and for sale at SullivanMunce Cultural Center',
    types: ['Arts, Music & Culture', 'Downtown'],
    free: true,
    featured: 200,
  },
]

export type SortKey = 'featured' | 'date'

/** Activities matching every selected filter, and the free-only attribute when
 *  it is on. AND logic: ticking Family and Halloween shows only activities that
 *  are both. */
export function filterActivities(
  list: FallActivity[],
  active: Filter[],
  freeOnly: boolean
): FallActivity[] {
  return list.filter(
    (a) => active.every((f) => a.types.includes(f)) && (!freeOnly || a.free)
  )
}

/** Sorted copy. Under 'date', anything without a `sortDate` goes last, in
 *  editorial order, rather than being dropped or floated to the top. */
/** True once the activity's last day has passed. `endDate` wins where it is
 *  set, otherwise `sortDate` is the last day. Anything with neither — the
 *  open-ended 'Throughout fall' entries — never counts as ended.
 *
 *  `todayIso` is passed in rather than read here so the caller controls it;
 *  the table reads it after mount to keep server and client markup identical. */
export function hasEnded(a: FallActivity, todayIso: string): boolean {
  const last = a.endDate ?? a.sortDate
  return last !== null && last !== undefined && last < todayIso
}

/** Sorted for display. When `todayIso` is given, anything already over drops
 *  below everything still to come, in both the featured and date views. */
export function sortActivities(key: SortKey, todayIso?: string): FallActivity[] {
  const list = [...FALL_ACTIVITIES]
  const ended = (a: FallActivity) => (todayIso ? (hasEnded(a, todayIso) ? 1 : 0) : 0)
  const byOrder = (a: FallActivity, b: FallActivity) => {

    if (key === 'featured') return a.featured - b.featured
    if (a.sortDate && b.sortDate) {
      if (a.sortDate !== b.sortDate) return a.sortDate.localeCompare(b.sortDate)
      return a.featured - b.featured
    }
    if (a.sortDate) return -1
    if (b.sortDate) return 1
    return a.featured - b.featured
  }

  return list.sort((a, b) => ended(a) - ended(b) || byOrder(a, b))
}
