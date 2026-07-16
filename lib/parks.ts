// Zionsville Parks data — sourced from the physical park sign.
// Amenity list matches the sign's legend exactly for consistency.

// ─── Amenity taxonomy ──────────────────────────────────────────────────────

export const AMENITIES = {
  // Park basics
  'restrooms': 'Restrooms',
  'water': 'Water',
  'ada-accessible': 'ADA Accessible',
  'picnic-tables': 'Picnic Tables',
  'picnic-shelters': 'Picnic Shelters',
  // Play & pets
  'playground': 'Playground',
  'splash-pad': 'Splash Pad',
  'dogs-on-leash': 'Dogs on Leash',
  'off-leash-dog-park': 'Off-Leash Dog Park (membership required)',
  // Activities
  'bikes-allowed': 'Bikes Allowed',
  'creek-access': 'Creek access',
  'fishing': 'Fishing',
  'sports-facilities': 'Sports Facilities',
  'golf': 'Golf',
  'disc-golf': 'Disc Golf',
  'skate-park': 'Skate Park',
} as const

export type AmenityId = keyof typeof AMENITIES

/** What "Sports Facilities" typically includes at Zionsville parks. */
export const SPORTS_FACILITIES_EXAMPLES = [
  'Athletic fields',
  'Basketball courts',
  'Pickleball courts',
  'Tennis courts',
] as const

// ─── Park data ─────────────────────────────────────────────────────────────

export interface Park {
  /** URL-safe slug */
  id: string
  /** Number on the physical park sign */
  number: number
  name: string
  amenities: AmenityId[]
  /** Optional internal article URL. If set, primary link is "Local guide". */
  internalUrl?: string
  /** Optional official Town of Zionsville page URL. Used when no internal guide exists. */
  townUrl?: string
  /** Optional URL for a park's separate dog park page (registration, rules, etc.). */
  dogParkUrl?: string
  /** Optional street address. If set, displayed under the park name and linked to Google Maps. */
  address?: string
  /** Optional 1-2 sentence description of what makes this park distinct. */
  description?: string
  /** Optional path to a landscape photo (e.g. "/images/parks/heritage-trail.webp"). */
  image?: string
}

export const PARKS: Park[] = [
  {
    id: 'heritage-trail-park',
    number: 1,
    name: 'Heritage Trail Park',
    townUrl: 'https://www.zionsville-in.gov/705/Heritage-Trail-Park',
    dogParkUrl: 'https://www.zionsville-in.gov/586/Heritage-Trail-Dog-Park',
    address: '4050 S 875 E',
    description: '11-acre park at the north end of the Big-4 Rail Trail with a 3.5-acre off-leash dog park, playground for young children, picnic shelter, basketball and pickleball courts, community garden plots, and a bocce court.',
    amenities: [
      'restrooms',
      'water',
      'ada-accessible',
      'picnic-shelters',
      'bikes-allowed',
      'off-leash-dog-park',
      'playground',
      'sports-facilities',
    ],
  },
  {
    id: 'carter-station-park',
    number: 2,
    name: 'Carter Station Park',
    townUrl: 'https://www.zionsville-in.gov/702/Carter-Station-Park',
    address: '4643 Pebblepointe Pass',
    description: 'Trail access point along the Big-4 Rail Trail, named for Robert Carter, who donated the land in 1999.',
    amenities: ['bikes-allowed', 'dogs-on-leash', 'fishing'],
  },
  {
    id: 'turkey-foot-nature-park',
    number: 3,
    name: 'Turkey Foot Nature Park',
    townUrl: 'https://www.zionsville-in.gov/715/Turkey-Foot-Park',
    address: '4795 Turkey Foot Rd',
    description: 'Wooded 23-acre nature park with a footbridge over Eagle Creek, hiking trails, and pathway connection to Red Bud Lane.',
    amenities: ['creek-access', 'bikes-allowed', 'dogs-on-leash', 'fishing'],
  },
  {
    id: 'mulberry-fields',
    number: 4,
    name: 'Mulberry Fields',
    address: '9645 Whitestown Rd',
    description: '38-acre park accessible from the Big-4 Rail Trail, with three picnic shelters, over 2.5 miles of paved paths, a skate park, splash pad, multi-use athletic fields, pickleball courts, and Maplelawn Farmstead.',
    internalUrl: '/articles/mulberry-fields',
    amenities: [
      'restrooms',
      'water',
      'ada-accessible',
      'picnic-shelters',
      'bikes-allowed',
      'dogs-on-leash',
      'playground',
      'sports-facilities',
      'skate-park',
      'splash-pad',
    ],
  },
  {
    id: 'zionsville-golf-course',
    number: 5,
    name: 'Zionsville Golf Course',
    townUrl: 'https://www.zionsville-in.gov/298/Zionsville-Golf-Course',
    address: '10799 E 550 S',
    description: 'Public 9-hole, par 36 course with tree-lined fairways, meandering streams, and no sand traps. Five sets of tees including junior tees. Managed by Zionsville National LLC.',
    amenities: ['restrooms', 'golf', 'water'],
  },
  {
    id: 'american-legion-trail-crossing',
    number: 6,
    name: 'American Legion Trail Crossing',
    townUrl: 'https://www.zionsville-in.gov/700/American-Legion-Trail-Crossing',
    address: '721 Ford Rd',
    description: '2-acre trail access point on the Big-4 Rail Trail with a sculpture honoring those who have served in the U.S. Armed Forces.',
    amenities: ['water', 'ada-accessible', 'bikes-allowed', 'dogs-on-leash'],
  },
  {
    id: 'zion-nature-sanctuary',
    number: 7,
    name: 'Zion Nature Sanctuary',
    townUrl: 'https://www.zionsville-in.gov/718/Zion-Nature-Sanctuary',
    address: '695 W Poplar St',
    description: '10-acre nature area west of Eagle Elementary School. Donated by Zionsville Community Schools in 2001.',
    amenities: ['picnic-shelters', 'dogs-on-leash'],
  },
  {
    id: 'elm-street-green',
    number: 8,
    name: 'Elm Street Green',
    townUrl: 'https://www.zionsville-in.gov/704/Elm-Street-Green',
    address: '165 N Elm St',
    description: '15.5-acre park adjacent to Eagle Creek with a sun shelter, picnic shelter with charcoal grill, adventure play space, StoryWalk, 0.8 miles of trails, garden plots, and a kayak/canoe launch.',
    amenities: [
      'ada-accessible',
      'picnic-shelters',
      'creek-access',
      'bikes-allowed',
      'dogs-on-leash',
    ],
  },
  {
    id: 'town-hall-plaza',
    number: 9,
    name: 'Town Hall Plaza',
    townUrl: 'https://www.zionsville-in.gov/701/Big-4-Rail-Trail',
    address: '1100 W Oak St',
    description: 'Trail access and parking at Zionsville Town Hall for the Big-4 Rail Trail.',
    amenities: [
      'restrooms',
      'water',
      'ada-accessible',
      'picnic-tables',
      'bikes-allowed',
      'dogs-on-leash',
    ],
  },
  {
    id: 'lincoln-park',
    number: 10,
    name: 'Lincoln Park',
    townUrl: 'https://zionsville-in.gov/707/Lincoln-Park',
    address: '41 S 2nd St',
    description: 'Half-acre park in the Village where Abraham Lincoln stopped in 1861 on his way to Washington, D.C. for his inauguration. The gazebo at the north end is used for summer concerts, weddings, and events.',
    amenities: ['water', 'picnic-tables', 'picnic-shelters', 'dogs-on-leash'],
  },
  {
    id: 'lions-park',
    number: 11,
    name: 'Lions Park',
    townUrl: 'https://zionsville-in.gov/710/Lions-Park',
    address: '115 S Elm St',
    description: '18-acre recreational facility owned and operated by the Zionsville Lions Club since 1940. Home of Zionsville Little League. Includes baseball and softball diamonds, lighted basketball and tennis courts, pickleball courts, sand volleyball, an enclosed shelter house, and two playgrounds.',
    amenities: [
      'restrooms',
      'water',
      'ada-accessible',
      'picnic-shelters',
      'bikes-allowed',
      'dogs-on-leash',
      'playground',
      'sports-facilities',
      'creek-access',
    ],
  },
  {
    id: 'creekside-nature-park',
    number: 12,
    name: 'Creekside Nature Park',
    townUrl: 'https://www.zionsville-in.gov/703/Creekside-Nature-Park',
    address: '11001 E Sycamore St',
    description: '18-acre park bordering Eagle Creek with a 0.6-mile handicap-accessible pathway. Located across Sycamore Street from Lions Park.',
    amenities: [
      'ada-accessible',
      'picnic-tables',
      'bikes-allowed',
      'creek-access',
      'fishing',
      'dogs-on-leash',
    ],
  },
  {
    id: 'big-4-nancy-burton-trailhead',
    number: 13,
    name: 'Big-4 Nancy Burton Trailhead',
    address: '870 Starkey Rd',
    description: 'Trail access point on the Big-4 Rail Trail off Starkey Road.',
    internalUrl: '/articles/big-4-rail-trail',
    amenities: ['ada-accessible', 'bikes-allowed', 'dogs-on-leash', 'restrooms'],
  },
  {
    id: 'creekside-corporate-park',
    number: 14,
    name: 'Creekside Corporate Park',
    townUrl: 'https://www.zionsville-in.gov/534/Creekside-Corporate-Park',
    address: 'W 106th St',
    description: 'Conservation office park with over one mile of trails through ravines and woodlands, connecting to Main Street downtown.',
    amenities: [
      'ada-accessible',
      'bikes-allowed',
      'dogs-on-leash',
      'picnic-tables',
      'sports-facilities',
    ],
  },
  {
    id: 'starkey-park',
    number: 15,
    name: 'Starkey Park',
    townUrl: 'https://www.zionsville-in.gov/714/Starkey-Nature-Park',
    address: '667 Sugarbush Dr',
    description: '72-acre wooded nature park along Eagle Creek with more than three miles of natural surface hiking trails. Named for Lucile Starkey, who bequeathed the land to the Town in 1974.',
    amenities: ['picnic-tables', 'fishing', 'dogs-on-leash', 'creek-access'],
  },
  {
    id: 'overley-worman-park',
    number: 16,
    name: 'Overley-Worman Park',
    townUrl: 'https://www.zionsville-in.gov/712/Overley-Worman-Park',
    address: '6040 Godello Cir',
    description: '45-acre park along Eagle Creek across from Starkey Park. Includes mountain biking trails, an 18-hole disc golf course, playgrounds, fishing piers, a boardwalk, and picnic shelters. Connected to the Big-4 Rail Trail via a pedestrian bridge.',
    amenities: [
      'ada-accessible',
      'picnic-shelters',
      'water',
      'picnic-tables',
      'bikes-allowed',
      'disc-golf',
      'fishing',
      'dogs-on-leash',
    ],
  },
  {
    id: 'big-4-zionsville-rd-trailhead',
    number: 17,
    name: 'Big-4 Zionsville Rd Trailhead',
    address: '10230 Zionsville Rd',
    description: 'Southern trailhead of the Big-4 Rail Trail with restrooms, parking, a mural by Blice Edwards, and a kinetic sculpture ("Wingz") by Mark McGarvey.',
    internalUrl: '/articles/big-4-rail-trail',
    amenities: [
      'ada-accessible',
      'bikes-allowed',
      'dogs-on-leash',
      'restrooms',
      'water',
    ],
  },
]

// ─── Helper functions ──────────────────────────────────────────────────────

export function getAmenityLabel(id: AmenityId): string {
  return AMENITIES[id]
}

export function getParkById(id: string): Park | undefined {
  return PARKS.find((p) => p.id === id)
}

export function getParksByAmenity(amenityId: AmenityId): Park[] {
  return PARKS.filter((p) => p.amenities.includes(amenityId))
}

export function getParksByAmenities(amenityIds: AmenityId[], mode: 'all' | 'any' = 'all'): Park[] {
  if (amenityIds.length === 0) return PARKS
  return PARKS.filter((p) => {
    if (mode === 'all') return amenityIds.every((a) => p.amenities.includes(a))
    return amenityIds.some((a) => p.amenities.includes(a))
  })
}

/**
 * Returns the URL for the park's primary link.
 * Priority: internal article > town page URL > general town parks page.
 */
export function getParkLinkUrl(park: Park): string {
  if (park.internalUrl) return park.internalUrl
  if (park.townUrl) return park.townUrl
  return 'https://www.zionsville-in.gov/parks'
}

/**
 * Returns the label for the park's primary link.
 * "Local guide" for internal, "Official town page" otherwise.
 */
export function getParkLinkLabel(park: Park): 'Local guide' | 'Official town page' {
  return park.internalUrl ? 'Local guide' : 'Official town page'
}

/** True if the park's primary link is external (town website). */
export function isExternalParkLink(park: Park): boolean {
  return !park.internalUrl
}

/**
 * Returns a Google Maps search URL for the park's address if set,
 * otherwise a search for the park name + Zionsville, IN.
 */
export function getGoogleMapsUrl(park: Park): string {
  const query = park.address
    ? `${park.address}, Zionsville IN`
    : `${park.name}, Zionsville IN`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
