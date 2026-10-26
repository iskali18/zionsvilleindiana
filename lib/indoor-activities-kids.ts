/** Indoor activities for the at-a-glance table on
 *  /articles/indoor-things-to-do-kids.
 *
 *  Single source of truth for the table and the article's ItemList schema. The
 *  article body carries the full write-up for each entry; `anchor` links the
 *  two, so it must match the heading slug in the markdown.
 */

/** "How to take part" chips, shown on the first row above the table. */
export const MODES = ['Drop-In', 'Classes'] as const

/** Activity and venue-type chips, shown on the second row in A to Z order. */
export const CATEGORIES = [
  'Amusement Park',
  'Art & Crafts',
  'Cooking',
  'Martial Arts',
  'Music, Dance & Theater',
  'Parent & Child Activities',
  'Play Areas',
  'Sports & Active Play',
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
  /** True when the place has free or low-cost options. */
  free: boolean
  /** Editorial rank, lower first. Numbered in tens so a new entry can slot
   *  between two without renumbering the rest. Matches the article order. */
  featured: number
}

export const INDOOR_ACTIVITIES: IndoorActivity[] = [
  // ─── Indoor playgrounds & play spaces ──────────────────────────────────────────
  {
    name: 'Build It Playground',
    anchor: 'build-it-playground',
    where: 'Carmel',
    ages: '1\u201310',
    what: 'Construction playground with real mini excavators, sand play, and building stations',
    types: ['Drop-In', 'Play Areas', 'STEM'],
    free: false,
    featured: 10,
  },
  {
    name: 'Carter\u2019s Play Place',
    anchor: 'carters-play-place',
    where: 'Westfield',
    ages: 'All ages',
    what: 'Inclusive indoor playground with a two-story climbing structure, trampoline, zipline, foam pit, and sensory activities',
    types: ['Drop-In', 'Play Areas', 'Sports & Active Play'],
    free: false,
    featured: 20,
  },
  {
    name: 'Dig Dig for Kids',
    anchor: 'dig-dig-for-kids',
    where: 'Fishers',
    ages: '2\u201310',
    what: 'Giant sandbox with toy construction vehicles and kinetic sand, where parents can join in',
    types: ['Drop-In', 'Play Areas', 'Parent & Child Activities'],
    free: false,
    featured: 30,
  },
  {
    name: 'Kids Empire',
    anchor: 'kids-empire',
    where: 'Plainfield',
    ages: '1\u201312',
    what: 'Multilevel play structures, slides, ball pits, and a toddler area',
    types: ['Drop-In', 'Play Areas', 'Sports & Active Play'],
    free: false,
    featured: 40,
  },
  {
    name: 'Monon Community Center',
    anchor: 'monon-community-center',
    where: 'Carmel',
    ages: 'All ages',
    what: 'Indoor playground with climbing structures, interactive STEM exhibits, soft-play area, and family pool with water slides',
    types: ['Drop-In', 'Classes', 'Play Areas', 'Sports & Active Play', 'STEM', 'Parent & Child Activities'],
    free: false,
    featured: 50,
  },
  {
    name: 'Prana Play',
    anchor: 'prana-play',
    where: 'Carmel',
    ages: '3\u201312',
    what: 'Sensory-friendly playground with climbing, slides, swings, and pretend play, plus scheduled art, music, and movement classes',
    types: ['Drop-In', 'Classes', 'Play Areas', 'Art & Crafts', 'Music, Dance & Theater', 'Sports & Active Play', 'Parent & Child Activities'],
    free: false,
    featured: 60,
  },
  {
    name: 'The Busy Bee Play Cafe',
    anchor: 'the-busy-bee-play-cafe',
    where: 'Indianapolis',
    ages: '1\u20138',
    what: 'Indoor playground with a pretend-play town and a caf\u00e9 for parents',
    types: ['Drop-In', 'Play Areas'],
    free: false,
    featured: 70,
  },
  {
    name: 'The Hideout',
    anchor: 'the-hideout',
    where: 'Brownsburg',
    ages: '0\u201310',
    what: 'Free play space with a climbing structure, toddler area, and game zone',
    types: ['Drop-In', 'Classes', 'Play Areas'],
    free: true,
    featured: 80,
  },
  {
    name: 'The Park at Traders Point',
    anchor: 'the-park-at-traders-point',
    where: 'Whitestown',
    ages: '1\u201310',
    what: 'Free five-level play structure, zip track, and toddler zone',
    types: ['Drop-In', 'Play Areas'],
    free: true,
    featured: 90,
  },
  {
    name: 'We Rock the Spectrum',
    anchor: 'we-rock-the-spectrum',
    where: 'Carmel',
    ages: '0 through young adults',
    what: 'Sensory gym with swings, a trampoline, zip slider, arts and crafts area, and calming room',
    types: ['Drop-In', 'Classes', 'Play Areas', 'Art & Crafts', 'Sports & Active Play'],
    free: false,
    featured: 100,
  },
  // ─── Museums & family attractions ──────────────────────────────────────────────
  {
    name: 'The Children\u2019s Museum of Indianapolis',
    anchor: 'the-childrens-museum-of-indianapolis',
    where: 'Indianapolis',
    ages: 'All ages',
    what: 'Dinosaur fossils, space exhibits, family art activities, and Playscape for ages 5 and under',
    types: ['Drop-In', 'Art & Crafts', 'STEM', 'Parent & Child Activities'],
    free: false,
    featured: 110,
  },
  {
    name: 'Carmel Clay History Museum',
    anchor: 'carmel-clay-history-museum',
    where: 'Carmel',
    ages: '1\u20138',
    what: '$1 play area with history-themed playhouses, plus free storytimes',
    types: ['Drop-In', 'Play Areas'],
    free: true,
    featured: 120,
  },
  {
    name: 'Malibu Jack\u2019s',
    anchor: 'malibu-jacks',
    where: 'Lafayette',
    ages: '3 through adult',
    what: 'Indoor amusement park with solo and parent-child go-karts, rides, mini golf, and a bounce-house playground',
    types: ['Drop-In', 'Amusement Park', 'Sports & Active Play'],
    free: false,
    featured: 130,
  },
  {
    name: 'Pinheads',
    anchor: 'pinheads-brownsburg--fishers',
    where: 'Brownsburg \u00b7 Fishers',
    ages: '3 through adult',
    what: 'Bowling with bumpers and ramps, duckpin lanes, and arcades',
    types: ['Drop-In', 'Sports & Active Play'],
    free: false,
    featured: 140,
  },
  {
    name: 'Hoosier Heights',
    anchor: 'hoosier-heights',
    where: 'Carmel',
    ages: '4 through adult',
    what: 'Indoor climbing with youth programs for ages 4\u201314; children 5 and under climb free',
    types: ['Drop-In', 'Sports & Active Play'],
    free: true,
    featured: 150,
  },
  // ─── Libraries ─────────────────────────────────────────────────────────────────
  {
    name: 'Hussey-Mayfield Memorial Public Library',
    anchor: 'hussey-mayfield-memorial-public-library',
    where: 'Zionsville \u00b7 Whitestown',
    ages: 'All ages',
    what: 'Storytimes, play spaces, arts and crafts, STEM kits, and the Zionsville Nature Center',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'STEM', 'Parent & Child Activities'],
    free: true,
    featured: 160,
  },
  {
    name: 'Brownsburg Public Library',
    anchor: 'brownsburg-public-library',
    where: 'Brownsburg',
    ages: 'All ages',
    what: 'Storytimes, crafts and take-home craft kits, LEGO Club, martial arts classes, and reading to therapy dogs',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'STEM', 'Parent & Child Activities', 'Martial Arts'],
    free: true,
    featured: 170,
  },
  {
    name: 'Carmel Clay Public Library',
    anchor: 'carmel-clay-public-library',
    where: 'Carmel',
    ages: 'All ages',
    what: 'Storytimes, a children\u2019s play area, art programs, and STEAM kits and lab',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'STEM', 'Parent & Child Activities'],
    free: true,
    featured: 180,
  },
  {
    name: 'Lebanon Public Library',
    anchor: 'lebanon-public-library',
    where: 'Lebanon',
    ages: 'All ages',
    what: 'Baby & Me lap-sit storytimes, a play area, and after-school STEM and art projects',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'STEM', 'Parent & Child Activities'],
    free: true,
    featured: 190,
  },
  {
    name: 'Westfield Washington Public Library',
    anchor: 'westfield-washington-public-library',
    where: 'Westfield',
    ages: 'All ages',
    what: 'Family games and crafts, storytimes, STEAM activities, and therapy-dog reading',
    types: ['Drop-In', 'Classes', 'STEM', 'Parent & Child Activities', 'Art & Crafts'],
    free: true,
    featured: 200,
  },
  // ─── Classes & programs ────────────────────────────────────────────────────────
  {
    name: 'The Bunny Hive',
    anchor: 'the-bunny-hive',
    where: 'Zionsville',
    ages: '0\u20135',
    what: 'Parent-child classes in music, art, ballet, sensory play, and storytime',
    types: ['Classes', 'Parent & Child Activities', 'Art & Crafts', 'Music, Dance & Theater'],
    free: false,
    featured: 210,
  },
  {
    name: 'Gymboree Play & Music',
    anchor: 'gymboree-play--music',
    where: 'Carmel',
    ages: '0\u20135',
    what: 'Parent-child play, music, and art classes, plus preschool programs and Open Gym',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'Music, Dance & Theater', 'Sports & Active Play', 'Parent & Child Activities'],
    free: false,
    featured: 220,
  },
  {
    name: 'My Gym Spring Mill',
    anchor: 'my-gym-spring-mill',
    where: 'Westfield',
    ages: '3 months\u201310 years',
    what: 'Gymnastics, art, dance, and ninja classes, including parent-child gym and art activities',
    types: ['Classes', 'Sports & Active Play', 'Parent & Child Activities', 'Art & Crafts', 'Music, Dance & Theater'],
    free: false,
    featured: 230,
  },
  {
    name: 'The Little Gym of Carmel',
    anchor: 'the-little-gym-of-carmel',
    where: 'Carmel',
    ages: '4 months\u201312 years',
    what: 'Parent-and-child, gymnastics, and dance classes',
    types: ['Classes', 'Sports & Active Play', 'Music, Dance & Theater', 'Parent & Child Activities'],
    free: false,
    featured: 240,
  },
  {
    name: 'Pearson Automotive Tennis Club',
    anchor: 'pearson-automotive-tennis-club',
    where: 'Zionsville',
    ages: '2 through adult',
    what: 'Beginner tennis for young children, including Mommy/Daddy & Me classes for ages 3\u20134',
    types: ['Classes', 'Sports & Active Play', 'Parent & Child Activities'],
    free: false,
    featured: 250,
  },
  {
    name: 'Elevate3 Basketball',
    anchor: 'elevate3-basketball',
    where: 'Indianapolis',
    ages: '5\u201318',
    what: 'Small-group basketball fundamentals for young beginners',
    types: ['Classes', 'Sports & Active Play'],
    free: false,
    featured: 260,
  },
  {
    name: 'Bach to Rock',
    anchor: 'bach-to-rock',
    where: 'Zionsville',
    ages: '1 through adult',
    what: 'Parent-child music classes for ages 1\u20133, private lessons, and bands',
    types: ['Classes', 'Music, Dance & Theater', 'Parent & Child Activities'],
    free: false,
    featured: 270,
  },
  {
    name: 'Musicologie',
    anchor: 'musicologie',
    where: 'Carmel',
    ages: '6 months through adult',
    what: 'Parent-and-child music classes and one-on-one lessons',
    types: ['Classes', 'Music, Dance & Theater', 'Parent & Child Activities'],
    free: false,
    featured: 280,
  },
  {
    name: 'School of Rock',
    anchor: 'school-of-rock',
    where: 'Zionsville',
    ages: '6 through adult',
    what: 'Group music lessons for beginners and band programs',
    types: ['Classes', 'Music, Dance & Theater'],
    free: false,
    featured: 290,
  },
  {
    name: 'Village Dance Studio',
    anchor: 'village-dance-studio',
    where: 'Whitestown',
    ages: '3 through adult',
    what: 'Preschool dance and tumbling, plus ballet, tap, jazz, and hip-hop',
    types: ['Classes', 'Music, Dance & Theater'],
    free: false,
    featured: 300,
  },
  {
    name: 'Metropolitan Youth Ballet',
    anchor: 'metropolitan-youth-ballet',
    where: 'Indianapolis',
    ages: '18 months through adult',
    what: 'Toddler & Me, preschool dance, and ballet training',
    types: ['Classes', 'Music, Dance & Theater', 'Parent & Child Activities'],
    free: false,
    featured: 310,
  },
  {
    name: 'Black Box Theatre Company',
    anchor: 'black-box-theatre-company',
    where: 'Lebanon',
    ages: '3\u201318',
    what: 'Youth productions and private lessons in acting, singing, and dance',
    types: ['Classes', 'Music, Dance & Theater'],
    free: false,
    featured: 320,
  },
  {
    name: 'Brightly Art Studio',
    anchor: 'brightly-art-studio',
    where: 'Brownsburg',
    ages: '18 months\u201316 years',
    what: 'Process art classes, preschool playgroups with parents, and a Drop-In Craft Caf\u00e9',
    types: ['Drop-In', 'Classes', 'Art & Crafts', 'Parent & Child Activities'],
    free: false,
    featured: 330,
  },
  {
    name: 'Palette Art Studio',
    anchor: 'palette-art-studio',
    where: 'Zionsville',
    ages: '6\u201310',
    what: 'Drop-in art sessions, classes, and camps',
    types: ['Drop-In', 'Classes', 'Art & Crafts'],
    free: false,
    featured: 340,
  },
  {
    name: 'Adamson\u2019s Karate Studio',
    anchor: 'adamsons-karate-studio',
    where: 'Zionsville',
    ages: '4 through adult',
    what: 'Karate for young children, plus family classes for parents and children 7 and older',
    types: ['Classes', 'Martial Arts', 'Sports & Active Play', 'Parent & Child Activities'],
    free: false,
    featured: 350,
  },
  {
    name: 'Bushido Jiu-Jitsu',
    anchor: 'bushido-jiu-jitsu',
    where: 'Zionsville',
    ages: '5 through adult',
    what: 'Brazilian Jiu-Jitsu taught through drills and games',
    types: ['Classes', 'Martial Arts', 'Sports & Active Play'],
    free: false,
    featured: 360,
  },
  {
    name: 'Master Yoo\u2019s Tae Kwon Do',
    anchor: 'master-yoos-tae-kwon-do',
    where: 'Carmel',
    ages: '4 through adult',
    what: 'Tae Kwon Do with a belt system and family classes',
    types: ['Classes', 'Martial Arts', 'Sports & Active Play', 'Parent & Child Activities'],
    free: false,
    featured: 370,
  },
  {
    name: 'Sprouts Cooking School',
    anchor: 'sprouts-cooking-school',
    where: 'Zionsville \u00b7 Carmel',
    ages: '4\u201314',
    what: 'Hands-on cooking classes, including sessions where parents and children cook together',
    types: ['Classes', 'Cooking', 'Parent & Child Activities'],
    free: false,
    featured: 380,
  },
  {
    name: 'Kids Explore Robotics',
    anchor: 'kids-explore-robotics',
    where: 'Carmel',
    ages: '4\u201318',
    what: 'Build and code robots from motors, sensors, and controllers',
    types: ['Classes', 'STEM'],
    free: false,
    featured: 390,
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
