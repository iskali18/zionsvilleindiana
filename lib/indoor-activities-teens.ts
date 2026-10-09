/** Indoor activities for the at-a-glance table on
 *  /articles/indoor-things-to-do-tweens-teens.
 *
 *  Single source of truth for the table and the article's ItemList schema. The
 *  article body carries the full write-up for each entry; `anchor` links the
 *  two, so it must match the heading slug in the markdown.
 */

/** "How to take part" chips, shown on the first row above the table. */
export const MODES = ['Drop-In', 'Classes'] as const

/** Activity and venue-type chips, shown on the second row in A to Z order. */
export const CATEGORIES = [
  'Action & Adventure',
  'Art & Crafts',
  'Cooking',
  'Games & Puzzles',
  'Libraries',
  'Martial Arts',
  'Music & Theater',
  'Sports',
  'STEM',
] as const

/** Every chip, in display order. */
export const FILTERS = [...MODES, ...CATEGORIES] as const

export type Filter = (typeof FILTERS)[number]

export interface IndoorActivity {
  /** Label shown in the table. Shorter than the section heading. */
  name: string
  /** Heading slug in the article. Must match, or the jump link goes nowhere. */
  anchor: string
  /** Town as written for a reader. Two-location entries name both. */
  where: string
  /** Ages as written for a reader. */
  ages: string
  /** One line on what you do there. */
  what: string
  /** Categories this entry belongs to. Every entry has Drop-In or Classes. */
  types: Filter[]
  /** True when the activity itself is free. */
  free: boolean
  /** Editorial rank, lower first. Numbered in tens so a new entry can slot
   *  between two without renumbering the rest. Matches the article order. */
  featured: number
}

export const INDOOR_ACTIVITIES: IndoorActivity[] = [
  // ─── Drop-in & one-time ────────────────────────────────────────────────────
  {
    name: 'Slick City Action Park',
    anchor: 'slick-city-action-park',
    where: 'Brownsburg',
    ages: '9 through adult',
    what: 'Indoor dry slides, launch-style attractions, basketball and dodgeball',
    types: ['Drop-In', 'Action & Adventure'],
    free: false,
    featured: 10,
  },
  {
    name: 'Hoosier Heights',
    anchor: 'hoosier-heights',
    where: 'Carmel',
    ages: '6 through adult',
    what: 'Bouldering, auto-belay and top-rope climbing for beginners and up',
    types: ['Drop-In', 'Action & Adventure'],
    free: false,
    featured: 20,
  },
  {
    name: 'Laser Flash',
    anchor: 'laser-flash',
    where: 'Carmel',
    ages: '7 through adult',
    what: 'Two-level laser-tag arena and arcade',
    types: ['Drop-In', 'Action & Adventure', 'Games & Puzzles'],
    free: false,
    featured: 30,
  },
  {
    name: 'Fastimes Indoor Karting',
    anchor: 'fastimes-indoor-karting',
    where: 'Indianapolis',
    ages: '8 through adult',
    what: 'Two-level indoor go-kart track',
    types: ['Drop-In', 'Action & Adventure'],
    free: false,
    featured: 40,
  },
  {
    name: 'Press Play Gaming Lounge',
    anchor: 'press-play-gaming-lounge',
    where: 'Brownsburg',
    ages: '6 through adult',
    what: 'Virtual reality, Foam Wars, arcade games and Xbox gaming',
    types: ['Drop-In', 'Action & Adventure', 'Games & Puzzles'],
    free: false,
    featured: 50,
  },
  {
    name: 'The Escape Room USA',
    anchor: 'the-escape-room-usa',
    where: 'Westfield \u00b7 Indianapolis',
    ages: '10 through adult',
    what: 'Themed rooms where groups crack codes and solve puzzles against the clock',
    types: ['Drop-In', 'Games & Puzzles'],
    free: false,
    featured: 60,
  },
  {
    name: 'Pinheads & Royal Pin Woodland',
    anchor: 'pinheads-brownsburg--royal-pin-woodland-indianapolis',
    where: 'Brownsburg \u00b7 Indianapolis',
    ages: '3 through adult',
    what: 'Bowling, arcades and on-site dining',
    types: ['Drop-In', 'Games & Puzzles'],
    free: false,
    featured: 70,
  },
  {
    name: 'IMAX at the Indiana State Museum',
    anchor: 'imax-theater-at-the-indiana-state-museum',
    where: 'Indianapolis',
    ages: 'Varies by movie',
    what: 'Indiana\u2019s largest movie screen, with new releases and documentaries',
    types: ['Drop-In'],
    free: false,
    featured: 80,
  },
  {
    name: 'Indianapolis Motor Speedway Museum',
    anchor: 'indianapolis-motor-speedway-museum',
    where: 'Indianapolis',
    ages: '6 through adult',
    what: 'Interactive racing simulators, a pit stop challenge and Indy 500 exhibits',
    types: ['Drop-In', 'STEM'],
    free: false,
    featured: 85,
  },
  {
    name: 'Smitten Kitten & Nine Lives Cat Cafe',
    anchor: 'smitten-kitten-fishers--nine-lives-cat-cafe-indianapolis',
    where: 'Fishers \u00b7 Indianapolis',
    ages: 'All ages',
    what: 'Timed sessions in cat lounges with adoptable cats',
    types: ['Drop-In'],
    free: false,
    featured: 90,
  },
  {
    name: '3rd Shot Pickleball',
    anchor: '3rd-shot-pickleball',
    where: 'Indianapolis',
    ages: '6 through adult',
    what: 'Indoor pickleball courts, open play, lessons and leagues',
    types: ['Drop-In', 'Sports'],
    free: false,
    featured: 100,
  },
  {
    name: 'D-BAT',
    anchor: 'd-bat',
    where: 'Indianapolis',
    ages: '6 through adult',
    what: 'Pitching-machine cages, reservable batting lanes and lessons',
    types: ['Drop-In', 'Sports'],
    free: false,
    featured: 110,
  },
  {
    name: 'Pottery By You',
    anchor: 'pottery-by-you',
    where: 'Indianapolis',
    ages: '8 through adult',
    what: 'Walk-in pottery painting, fused glass, wood signs and candle making',
    types: ['Drop-In', 'Art & Crafts'],
    free: false,
    featured: 120,
  },

  // ─── Free ──────────────────────────────────────────────────────────────────
  {
    name: 'Hussey-Mayfield Memorial Public Library',
    anchor: 'hussey-mayfield-memorial-public-library',
    where: 'Zionsville \u00b7 Whitestown',
    ages: '9–18',
    what: 'Art, gaming and LEGO programs, plus makerspaces and museum passes',
    types: ['Drop-In', 'Libraries', 'Art & Crafts', 'STEM', 'Games & Puzzles'],
    free: true,
    featured: 130,
  },
  {
    name: 'Carmel Clay Public Library',
    anchor: 'carmel-clay-public-library',
    where: 'Carmel',
    ages: '11\u201318',
    what: 'Teen gaming, art workshops and a Digital Media Lab',
    types: ['Drop-In', 'Libraries', 'Art & Crafts', 'STEM', 'Games & Puzzles'],
    free: true,
    featured: 140,
  },
  {
    name: 'Westfield Washington Public Library',
    anchor: 'westfield-washington-public-library',
    where: 'Westfield',
    ages: '12–18',
    what: 'Teen games and art, tech and creative gear to borrow, and a makerspace',
    types: ['Drop-In', 'Libraries', 'Art & Crafts', 'STEM', 'Games & Puzzles'],
    free: true,
    featured: 150,
  },
  {
    name: 'Lebanon Public Library',
    anchor: 'lebanon-public-library',
    where: 'Lebanon',
    ages: '11\u201318',
    what: 'Teen Space with video and board games, plus programs like fiber arts and LEGO',
    types: ['Drop-In', 'Libraries', 'Art & Crafts', 'STEM', 'Games & Puzzles'],
    free: true,
    featured: 160,
  },
  {
    name: 'Brownsburg Public Library',
    anchor: 'brownsburg-public-library',
    where: 'Brownsburg',
    ages: '11\u201319',
    what: 'Nintendo Switch game nights and Anime Club with crafts and snacks',
    types: ['Drop-In', 'Libraries', 'Art & Crafts', 'Games & Puzzles'],
    free: true,
    featured: 165,
  },
  {
    name: 'SullivanMunce Cultural Center',
    anchor: 'sullivanmunce-cultural-center',
    where: 'Zionsville',
    ages: '6 through adult',
    what: 'Free museum and gallery, plus art classes and workshops',
    types: ['Drop-In', 'Art & Crafts'],
    free: true,
    featured: 170,
  },

  // ─── Classes & ongoing programs ────────────────────────────────────────────
  {
    name: 'Kids Explore Robotics',
    anchor: 'kids-explore-robotics',
    where: 'Carmel',
    ages: '4\u201318',
    what: 'Weekly robotics and coding classes grouped by age and skill level',
    types: ['Classes', 'STEM'],
    free: false,
    featured: 180,
  },
  {
    name: 'School of Rock',
    anchor: 'school-of-rock',
    where: 'Zionsville',
    ages: '4 through adult',
    what: 'Lessons and band rehearsals that build to live performances',
    types: ['Classes', 'Music & Theater'],
    free: false,
    featured: 190,
  },
  {
    name: 'Bach to Rock',
    anchor: 'bach-to-rock',
    where: 'Zionsville',
    ages: '1 through adult',
    what: 'Lessons, bands, Glee Club and music production',
    types: ['Classes', 'Music & Theater'],
    free: false,
    featured: 200,
  },
  {
    name: 'Musicologie',
    anchor: 'musicologie',
    where: 'Carmel',
    ages: '6 months through adult',
    what: 'Private lessons, student bands and open mics',
    types: ['Classes', 'Music & Theater'],
    free: false,
    featured: 210,
  },
  {
    name: 'The Cat \u2014 The Drama Department',
    anchor: 'the-cat--the-drama-department',
    where: 'Carmel',
    ages: '8\u201318',
    what: 'Youth theater productions, classes and workshops',
    types: ['Classes', 'Music & Theater'],
    free: false,
    featured: 220,
  },
  {
    name: 'The Wandering Peacock',
    anchor: 'the-wandering-peacock',
    where: 'Westfield',
    ages: '8 through adult',
    what: 'Wheel-throwing and hand-building pottery classes',
    types: ['Classes', 'Art & Crafts'],
    free: false,
    featured: 240,
  },
  {
    name: 'Sprouts Cooking School',
    anchor: 'sprouts-cooking-school',
    where: 'Zionsville',
    ages: '4\u201314',
    what: 'Hands-on cooking classes, including Tween Chef for ages 10\u201314',
    types: ['Classes', 'Cooking'],
    free: false,
    featured: 250,
  },
  {
    name: 'Indy Badminton Club',
    anchor: 'indy-badminton-club',
    where: 'Carmel',
    ages: '6 through adult',
    what: 'Open play, court rentals and classes for kids and teens',
    types: ['Drop-In', 'Classes', 'Sports'],
    free: false,
    featured: 260,
  },
  {
    name: 'Elevate3 Basketball',
    anchor: 'elevate3-basketball',
    where: 'Northwest Indianapolis',
    ages: '5\u201318',
    what: 'Skill-based basketball training and private sessions',
    types: ['Classes', 'Sports'],
    free: false,
    featured: 270,
  },
  {
    name: 'Pearson Tennis Club',
    anchor: 'pearson-tennis-club',
    where: 'Zionsville',
    ages: '2 through adult',
    what: 'Eight indoor courts, private lessons and clinics for kids and teens',
    types: ['Classes', 'Sports'],
    free: false,
    featured: 280,
  },
  {
    name: 'Adamson\u2019s Karate Studio',
    anchor: 'adamsons-karate-studio',
    where: 'Zionsville',
    ages: '4 through adult',
    what: 'Traditional karate, self-defense and grappling',
    types: ['Classes', 'Martial Arts'],
    free: false,
    featured: 290,
  },
  {
    name: 'Bushido Jiu-Jitsu',
    anchor: 'bushido-jiu-jitsu',
    where: 'Zionsville',
    ages: '5 through adult',
    what: 'Brazilian Jiu-Jitsu with wrestling and judo fundamentals',
    types: ['Classes', 'Martial Arts'],
    free: false,
    featured: 300,
  },
  {
    name: 'Master Yoo\u2019s Tae Kwon Do',
    anchor: 'master-yoos-tae-kwon-do',
    where: 'Carmel',
    ages: '3 through adult',
    what: 'Tae Kwon Do, self-defense and fitness',
    types: ['Classes', 'Martial Arts'],
    free: false,
    featured: 310,
  },
]

/** Entries matching the selected chips. Two rows:
 *  - "Narrow by" row: Drop-In and Classes shorten the list to that kind (both
 *    together show both), and the free toggle shortens it to places with free
 *    activities.
 *  - "Activities" row: categories are OR. STEM + Art & Crafts shows both.
 *  The rows narrow each other: Drop-In + STEM shows only drop-in STEM places,
 *  and Free + STEM shows only STEM places with free activities.
 *  Nothing selected in a row means that row doesn't filter. */
export function filterActivities(
  list: IndoorActivity[],
  active: Filter[],
  freeOnly: boolean
): IndoorActivity[] {
  const modes = active.filter((f) => (MODES as readonly string[]).includes(f))
  const cats = active.filter((f) => (CATEGORIES as readonly string[]).includes(f))
  return list.filter(
    (a) =>
      (modes.length === 0 || modes.some((m) => a.types.includes(m))) &&
      (!freeOnly || a.free) &&
      (cats.length === 0 || cats.some((c) => a.types.includes(c)))
  )
}

/** Columns the table can sort by, and which way. */
export type SortKey = 'name' | 'where' | 'ages'
export type SortDir = 'asc' | 'desc'

/** Sorted copy on the chosen column, A to Z ('asc') or Z to A ('desc'). Plain
 *  alphabetical order with numbers read as numbers, so '4\u201318' comes before
 *  '12\u201318'; entries that start with a word ('All ages', 'Varies by movie')
 *  land after the numbers in A to Z, and before them in Z to A. Ties always
 *  fall back to the name, A to Z. */
export function sortActivities(key: SortKey, dir: SortDir = 'asc'): IndoorActivity[] {
  const compare = (x: string, y: string) =>
    x.localeCompare(y, 'en', { numeric: true, sensitivity: 'base' })
  const sign = dir === 'asc' ? 1 : -1
  return [...INDOOR_ACTIVITIES].sort(
    (a, b) => sign * compare(a[key], b[key]) || compare(a.name, b.name)
  )
}
