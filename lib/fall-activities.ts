/** Fall activities for the at-a-glance table on
 *  /articles/fall-activities-zionsville.
 *
 *  Single source of truth for the table. The article body carries the full
 *  write-up for each activity; `anchor` links the two, so it must match the
 *  heading slug in the markdown.
 */

export interface FallActivity {
  /** Label shown in the table. Shorter than the section heading. */
  name: string
  /** Heading slug in the article. Must match, or the jump link goes nowhere. */
  anchor: string
  /** Dates as written for a reader: 'Oct. 2\u20133', 'Throughout fall'. */
  when: string
  /** ISO date used for sorting only. Null for anything without a fixed start,
   *  which then sorts last under the date view. */
  sortDate: string | null
  /** One line on what happens. */
  what: string
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
    what: 'Guided walking tour with reenacted local ghost stories',
    featured: 10,
  },
  {
    name: 'Fright Nights',
    anchor: 'experience-fright-nights',
    when: 'Oct. 23\u201324',
    sortDate: '2026-10-23',
    what: 'Haunted hayride to the Fright Barn at Maplelawn',
    featured: 20,
  },
  {
    name: 'Pumpkinfest',
    anchor: 'celebrate-fall-at-pumpkinfest',
    when: 'Oct. 3',
    sortDate: '2026-10-03',
    what: 'Pumpkins, children\u2019s activities and hayrides',
    featured: 30,
  },
  {
    name: 'Oktoberfest',
    anchor: 'raise-a-stein-at-oktoberfest',
    when: 'Oct. 3',
    sortDate: '2026-10-03',
    what: 'German food, a Biergarten and live polka, ages 21+',
    featured: 40,
  },
  {
    name: 'Pumpkins & Hayrides',
    anchor: 'enjoy-pumpkins-hayrides-at-lions-park',
    when: 'Oct. 25',
    sortDate: '2026-10-25',
    what: 'Pumpkins, hayrides and traditional fall activities',
    featured: 60,
  },
  {
    name: 'Zionsville Street Dance',
    anchor: 'dance-on-main-street',
    when: 'Sept. 26',
    sortDate: '2026-09-26',
    what: 'Live music on Main Street with two bands',
    featured: 50,
  },
  {
    name: 'Trick or Trees',
    anchor: 'take-the-kids-to-trick-or-trees',
    when: 'Oct. 24',
    sortDate: '2026-10-24',
    what: 'Trick-or-Treat Trail at Elm Street Green Park, ages 2\u201312',
    featured: 70,
  },
  {
    name: '80s Night',
    anchor: 'step-back-to-80s-night',
    when: 'Sept. 17',
    sortDate: '2026-09-17',
    what: 'Eighties music, fashion and pop culture downtown',
    featured: 80,
  },
  {
    name: 'Smashin\u2019 Pumpkins',
    anchor: 'smash-your-pumpkins-at-mulberry-fields',
    when: 'Nov. 7',
    sortDate: '2026-11-07',
    what: 'Pumpkin smashing, composting and the Epic Pumpkin Drop',
    featured: 90,
  },
  {
    name: 'Movies at Maplelawn',
    anchor: 'watch-a-movie-at-maplelawn-farmstead',
    when: 'Sept. 19 & 26',
    sortDate: '2026-09-19',
    what: 'Outdoor movies projected onto the barn',
    featured: 45,
  },
  {
    name: 'Gallery On & Off Main',
    anchor: 'explore-gallery-on-off-main',
    when: 'Oct. 24',
    sortDate: '2026-10-24',
    what: 'Artists and artisans throughout the Main Street district',
    featured: 110,
  },
  {
    name: 'Salem Fall Cookout',
    anchor: 'spend-a-fall-evening-at-salem-methodist-church',
    when: 'Oct. 2',
    sortDate: '2026-10-02',
    what: 'Hayrides, pumpkin painting, campfire and s\u2019mores',
    featured: 120,
  },
  {
    name: 'Fall Races',
    anchor: 'race-through-zionsville-this-fall',
    when: 'Oct. 3\u2013Nov. 26',
    sortDate: '2026-10-03',
    what: 'Hit the Bricks, Zionsville Half-Marathon and Gravy Chase',
    featured: 130,
  },
  {
    name: 'Zionsville Parks & Recreation',
    anchor: 'experience-fall-with-zionsville-parks-recreation',
    when: 'Sept. 17\u2013Nov. 21',
    sortDate: '2026-09-17',
    what: 'Birding, campfire concerts, night hikes, a luminary walk and owl walks',
    featured: 140,
  },
  {
    name: 'Zionsville Farmers Market',
    anchor: 'visit-the-zionsville-farmers-market',
    when: 'Saturday mornings through Sept. 26',
    sortDate: '2026-09-12',
    what: 'Local produce, food, vendors and music',
    featured: 150,
  },
  {
    name: 'SFZ Concert Series',
    anchor: 'enjoy-the-sfz-concert-series',
    when: 'Sept. 13, Oct. 11 & Nov. 1',
    sortDate: '2026-09-13',
    what: 'Sunday afternoon concerts at St. Francis In-The-Fields',
    featured: 160,
  },
  {
    name: 'ZCHS Performances & Sports',
    anchor: 'enjoy-fall-performances-sports-at-zchs',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Fall musical, concerts, football and other Eagles sports',
    featured: 170,
  },
  {
    name: 'Traders Point Creamery',
    anchor: 'visit-traders-point-creamery',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Farm walks, dairy cows, farm store and dining',
    featured: 180,
  },
  {
    name: 'Fall Walks & Trails',
    anchor: 'take-a-fall-walk-or-bike-ride',
    when: 'Throughout fall',
    sortDate: null,
    what: 'Parks, wooded trails and the Zionsville Rail Trail',
    featured: 190,
  },
  {
    name: 'Teeny Tiny Art Market',
    anchor: 'browse-the-teeny-tiny-art-market',
    when: 'Nov. 20\u2013Dec. 19',
    sortDate: '2026-11-20',
    what: 'Small-scale art at SullivanMunce Cultural Center',
    featured: 200,
  },
]

export type SortKey = 'featured' | 'date'

/** Sorted copy. Under 'date', anything without a `sortDate` goes last, in
 *  editorial order, rather than being dropped or floated to the top. */
export function sortActivities(key: SortKey): FallActivity[] {
  const list = [...FALL_ACTIVITIES]
  if (key === 'featured') return list.sort((a, b) => a.featured - b.featured)

  return list.sort((a, b) => {
    if (a.sortDate && b.sortDate) {
      if (a.sortDate !== b.sortDate) return a.sortDate.localeCompare(b.sortDate)
      return a.featured - b.featured
    }
    if (a.sortDate) return -1
    if (b.sortDate) return 1
    return a.featured - b.featured
  })
}
