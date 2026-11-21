/** Christmas attractions for the at-a-glance table on
 *  /articles/christmas-holiday-attractions-near-indianapolis.
 *
 *  Single source of truth for the table and the article's ItemList schema. The
 *  article body carries the full write-up for each attraction; `anchor` links
 *  the two, so it must match the heading id in the markdown.
 */

/** Filter chips, in display order. */
export const TYPES = [
  'Lights & Displays',
  'Drive-Through Lights',
  'Holiday Festivals',
  'Museum Events',
  'Live Performances',
  'Farms',
  'Train Rides',
  'Christmas Markets',
  'Santa Visits',
  'Letters to Santa',
] as const

export type AttractionType = (typeof TYPES)[number]

export interface HolidayAttraction {
  /** Label shown in the table. */
  name: string
  /** Heading id in the article. Must match, or the jump link goes nowhere. */
  anchor: string
  /** Town as written for a reader. */
  city: string
  /** One line on what visitors see or do. */
  highlights: string
  /** Filter chips this attraction belongs to. An attraction can sit in several. */
  types: AttractionType[]
  /** True only where the article says admission is free. Unknown pricing
   *  never counts as free. */
  free: boolean
}

/** A to Z by name, matching the article's original table. */
export const ATTRACTIONS: HolidayAttraction[] = [
  {
    name: "A Christmas Carol at Indiana Repertory Theatre",
    anchor: "a-christmas-carol",
    city: "Indianapolis",
    highlights: "Live theatrical production of Charles Dickens\u2019 classic Christmas story, featuring Ebenezer Scrooge and three visiting spirits",
    types: ["Live Performances"],
    free: false,
  },
  {
    name: "A Merry Prairie Holiday at Conner Prairie",
    anchor: "conner-prairie",
    city: "Fishers",
    highlights: "Holiday light displays, 3D projection show, tubing hill, sock skating rink, carousel, and Santa\u2019s Sleigh Barn",
    types: ["Lights & Displays", "Holiday Festivals", "Santa Visits"],
    free: false,
  },
  {
    name: "AES Indiana Yuletide Celebration",
    anchor: "yuletide-celebration",
    city: "Indianapolis",
    highlights: "Live holiday stage production featuring the Indianapolis Symphony Orchestra, singers, dancers, and cirque performers",
    types: ["Live Performances"],
    free: false,
  },
  {
    name: "Athenaeum Christkindlmarkt",
    anchor: "athenaeum-christkindlmarkt",
    city: "Indianapolis",
    highlights: "Free German-style Christmas market with handmade gifts, German food, live music, and children\u2019s crafts",
    types: ["Christmas Markets"],
    free: true,
  },
  {
    name: "Carmel Christkindlmarkt",
    anchor: "carmel-christkindlmarkt",
    city: "Carmel",
    highlights: "Free German-style holiday market with artisan vendors, food, entertainment, and Santa visits; skating costs extra",
    types: ["Christmas Markets", "Santa Visits"],
    free: true,
  },
  {
    name: "Celebration Crossing at the Indiana State Museum",
    anchor: "celebration-crossing",
    city: "Indianapolis",
    highlights: "Santa\u2019s house, L.S. Ayres window displays, Snowfall Express trackless train ride, holiday performances, and Santa breakfasts",
    types: ["Lights & Displays", "Museum Events", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Christmas at the Zoo",
    anchor: "christmas-at-the-zoo",
    city: "Indianapolis",
    highlights: "Holiday lights, Santa\u2019s Magic Cottage, and reindeer; two sensory-friendly evenings",
    types: ["Lights & Displays", "Santa Visits"],
    free: false,
  },
  {
    name: "Christmas Experience at Dull\u2019s Tree Farm",
    anchor: "dulls-tree-farm",
    city: "Thorntown",
    highlights: "Free admission to the Christmas tree farm with live reindeer, wagon rides, and seasonal activities; some activities cost extra",
    types: ["Holiday Festivals", "Farms"],
    free: true,
  },
  {
    name: "Christmas Nights of Lights at the Indiana State Fairgrounds",
    anchor: "christmas-nights-of-lights",
    city: "Indianapolis",
    highlights: "2-mile drive-through route with lights synchronized to music",
    types: ["Lights & Displays", "Drive-Through Lights"],
    free: false,
  },
  {
    name: "Christmas Shows at Beef & Boards Dinner Theatre",
    anchor: "beef-and-boards-christmas",
    city: "Indianapolis",
    highlights: "Holiday Inn and A Christmas Carol, with a buffet lunch or dinner before each show",
    types: ["Live Performances"],
    free: false,
  },
  {
    name: "Circle of Lights on Monument Circle",
    anchor: "circle-of-lights",
    city: "Indianapolis",
    highlights: "Free holiday light display; lighting ceremony with live performances on Fri, Nov. 27",
    types: ["Lights & Displays"],
    free: true,
  },
  {
    name: "Conservatory Crossing at Garfield Park Conservatory",
    anchor: "conservatory-crossing",
    city: "Indianapolis",
    highlights: "Poinsettias, twinkling lights, model trains, and a miniature holiday village; free admission Sat, Dec. 5, 10 a.m.\u20131 p.m., during Santa\u2019s visit",
    types: ["Lights & Displays"],
    free: true,
  },
  {
    name: "Festival of Trees at the Indiana Historical Society",
    anchor: "festival-of-trees",
    city: "Indianapolis",
    highlights: "More than 75 themed Christmas trees at the Indiana History Center; cookie decorating and evening Twilight Nights",
    types: ["Lights & Displays", "Museum Events"],
    free: false,
  },
  {
    name: "Glimmer Lights at Piney Acres",
    anchor: "piney-acres-glimmer-lights",
    city: "Fortville",
    highlights: "Train ride through Christmas lights at Piney Acres Farm; hot cocoa, cookie, and Santa\u2019s cabin",
    types: ["Lights & Displays", "Farms", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Holiday Stroll at Kelsay Farms",
    anchor: "kelsay-farms-holiday-stroll",
    city: "Whiteland",
    highlights: "Walk-through light displays, farm animals, and fire pits",
    types: ["Lights & Displays", "Farms"],
    free: false,
  },
  {
    name: "Holiday Train Rides on the Nickel Plate Express",
    anchor: "nickel-plate-express",
    city: "Noblesville",
    highlights: "Reindeer Express with Santa; holiday light railbike ride; 21-and-older rides",
    types: ["Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Jingle Rails at the Eiteljorg Museum",
    anchor: "jingle-rails",
    city: "Indianapolis",
    highlights: "Model trains on more than 1,200 feet of track past Indianapolis and western landmarks",
    types: ["Lights & Displays", "Museum Events"],
    free: false,
  },
  {
    name: "Mail a Letter to Santa",
    anchor: "letters-to-santa",
    city: "Multiple locations",
    highlights: "Free Santa mailboxes in Central Indiana communities, with personalized replies available",
    types: ["Letters to Santa"],
    free: true,
  },
  {
    name: "Mistletoe Music Festival at the Indianapolis Artsgarden",
    anchor: "mistletoe-music-festival",
    city: "Indianapolis",
    highlights: "Free holiday concerts featuring school choirs, jazz bands, orchestras, and other ensembles",
    types: ["Live Performances"],
    free: true,
  },
  {
    name: "Santa Express & Breakfast with Santa at Stuckey Farm",
    anchor: "stuckey-farm",
    city: "Sheridan",
    highlights: "Santa Express train ride with an original holiday story; Breakfast with Santa buffet",
    types: ["Farms", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Trees of Plainfield",
    anchor: "trees-of-plainfield",
    city: "Plainfield",
    highlights: "Free walking trail of decorated Christmas trees, with holiday activities, s\u2019mores, and photo opportunities",
    types: ["Lights & Displays"],
    free: true,
  },
  {
    name: "Ultimate Country Christmas at Lark Ranch",
    anchor: "lark-ranch",
    city: "Greenfield",
    highlights: "Christmas Train ride through a mile of lights; Santa visits, Santa\u2019s Workshop crafts, and farm animals",
    types: ["Lights & Displays", "Holiday Festivals", "Farms", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "WinterFaire at The Children\u2019s Museum of Indianapolis",
    anchor: "winterfaire",
    city: "Indianapolis",
    highlights: "Indoor winter carnival with games, 47-foot slide, and Santa visits; free admission Thu, Dec. 24 (advance tickets required)",
    types: ["Museum Events", "Santa Visits"],
    free: true,
  },
  {
    name: "Winterland Holiday Light Show and Santaland",
    anchor: "danville-winterland",
    city: "Danville",
    highlights: "Drive-through show with about 130 light displays; Santaland on weekends; fee per car",
    types: ["Lights & Displays", "Drive-Through Lights", "Santa Visits"],
    free: false,
  },
  {
    name: "Winterlights at Newfields",
    anchor: "winterlights",
    city: "Indianapolis",
    highlights: "Millions of lights along a garden walking path; decorated Lilly House; Wintermarket",
    types: ["Lights & Displays"],
    free: false,
  },
]

/** Attractions carrying ANY selected type (OR), and only free ones when the
 *  free toggle is on. Nothing selected means no type filter. */
export function filterAttractions(
  list: HolidayAttraction[],
  types: AttractionType[],
  freeOnly: boolean
): HolidayAttraction[] {
  return list.filter(
    (a) =>
      (types.length === 0 || types.some((t) => a.types.includes(t))) &&
      (!freeOnly || a.free)
  )
}

/** Columns the table can sort by, and which way. */
export type SortKey = 'name' | 'city'
export type SortDir = 'asc' | 'desc'

/** Sorted copy on the chosen column, A to Z ('asc') or Z to A ('desc'). Ties
 *  fall back to the name, A to Z. */
export function sortAttractions(key: SortKey, dir: SortDir = 'asc'): HolidayAttraction[] {
  const compare = (x: string, y: string) =>
    x.localeCompare(y, 'en', { numeric: true, sensitivity: 'base' })
  const sign = dir === 'asc' ? 1 : -1
  return [...ATTRACTIONS].sort(
    (a, b) => sign * compare(a[key], b[key]) || compare(a.name, b.name)
  )
}
