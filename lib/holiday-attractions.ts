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
  'Farms',
  'Train Rides',
  'Christmas Markets',
  'Nearby Towns',
  'Santa Visits',
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
    name: "A Merry Prairie Holiday at Conner Prairie",
    anchor: "conner-prairie",
    city: "Fishers",
    highlights: "3D projection show, tubing hill, sock skating rink, and carousel; Santa\u2019s Sleigh Barn",
    types: ["Lights & Displays", "Holiday Festivals", "Santa Visits"],
    free: false,
  },
  {
    name: "Athenaeum Christkindlmarkt",
    anchor: "athenaeum-christkindlmarkt",
    city: "Indianapolis",
    highlights: "German-style market in a downtown biergarten with Gl\u00fchwein, live music, and children\u2019s crafts",
    types: ["Christmas Markets"],
    free: true,
  },
  {
    name: "Breakfast with Santa at Driving Wind Farm",
    anchor: "driving-wind-breakfast-with-santa",
    city: "Indianapolis",
    highlights: "Scheduled sessions with a waffle breakfast, hot cocoa, Santa, and a gift bag for each child",
    types: ["Farms", "Santa Visits"],
    free: false,
  },
  {
    name: "Carmel Christkindlmarkt",
    anchor: "carmel-christkindlmarkt",
    city: "Carmel",
    highlights: "German-style market with food, crafts, and St. Nikolaus; ice rink (fee) and free light displays nearby",
    types: ["Christmas Markets"],
    free: true,
  },
  {
    name: "Celebration Crossing at the Indiana State Museum",
    anchor: "celebration-crossing",
    city: "Indianapolis",
    highlights: "Santa\u2019s house, L.S. Ayres window displays, Snowfall Express ride, Holiday Sounds performances, and Santa breakfasts",
    types: ["Lights & Displays", "Museum Events", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Christmas at Beasley\u2019s Orchard",
    anchor: "beasleys-orchard",
    city: "Danville",
    highlights: "Santa photos by appointment in a decorated historic barn",
    types: ["Farms", "Santa Visits"],
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
    highlights: "Choose-and-cut trees, live reindeer, wagon rides, and a live Nativity; some activities cost extra",
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
    name: "Christmas on the Farm at Traders Point Creamery",
    anchor: "traders-point-christmas-on-the-farm",
    city: "Zionsville",
    highlights: "One-day farm event with animals, wagon rides, Santa activities, and campfires with s\u2019mores",
    types: ["Holiday Festivals", "Farms", "Santa Visits"],
    free: false,
  },
  {
    name: "Christmas Under the Stars",
    anchor: "brownsburg-christmas-under-the-stars",
    city: "Brownsburg",
    highlights: "Lighted parade, tree lighting, Winter Market, and Santa photos",
    types: ["Holiday Festivals", "Christmas Markets", "Nearby Towns", "Santa Visits"],
    free: true,
  },
  {
    name: "Circle of Lights on Monument Circle",
    anchor: "circle-of-lights",
    city: "Indianapolis",
    highlights: "The Soldiers and Sailors Monument decorated with garland, lights, toy soldiers, and peppermint sticks",
    types: ["Lights & Displays"],
    free: true,
  },
  {
    name: "Festival of Trees at the Indiana Historical Society",
    anchor: "festival-of-trees",
    city: "Indianapolis",
    highlights: "More than 75 themed Christmas trees; cookie decorating; evening Twilight Nights",
    types: ["Lights & Displays", "Museum Events"],
    free: false,
  },
  {
    name: "Glimmer Lights at Piney Acres",
    anchor: "piney-acres-glimmer-lights",
    city: "Fortville",
    highlights: "Trackless train ride through lights with hot cocoa and a cookie; Santa\u2019s cabin",
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
    name: "Santa Express & Breakfast with Santa at Stuckey Farm",
    anchor: "stuckey-farm",
    city: "Sheridan",
    highlights: "Santa Express train ride with an original holiday story; Breakfast with Santa buffet",
    types: ["Farms", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "Santa\u2019s Workshop at Main Street Park",
    anchor: "whitestown-santas-workshop",
    city: "Whitestown",
    highlights: "Saturday photos with Santa, the Grinch, or the Coca-Cola Bear",
    types: ["Nearby Towns", "Santa Visits"],
    free: true,
  },
  {
    name: "Trees of Plainfield",
    anchor: "trees-of-plainfield",
    city: "Plainfield",
    highlights: "Walking trail of decorated trees with s\u2019mores, Mrs. Claus, and the Grinch",
    types: ["Nearby Towns"],
    free: true,
  },
  {
    name: "Ultimate Country Christmas at Lark Ranch",
    anchor: "lark-ranch",
    city: "Greenfield",
    highlights: "Christmas Train ride through a mile of lights; Santa\u2019s Workshop crafts; farm animals",
    types: ["Lights & Displays", "Holiday Festivals", "Farms", "Train Rides", "Santa Visits"],
    free: false,
  },
  {
    name: "WinterFaire at The Children\u2019s Museum of Indianapolis",
    anchor: "winterfaire",
    city: "Indianapolis",
    highlights: "Indoor winter carnival with a 47-foot slide; Santa visits included with museum admission",
    types: ["Museum Events", "Santa Visits"],
    free: false,
  },
  {
    name: "Winterland Holiday Light Show",
    anchor: "danville-winterland",
    city: "Danville",
    highlights: "Drive-through show with about 130 light displays; Santaland on weekends; fee per car",
    types: ["Lights & Displays", "Drive-Through Lights", "Nearby Towns", "Santa Visits"],
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
