/** Seasonal guide links for the events page band.
 *
 *  Each guide carries its own window, so the band changes on its own as dates
 *  pass — no edit needed when a season turns. Guides drop off one at a time
 *  because their windows end on different days.
 *
 *  `priority` breaks ties when more guides are live than the band shows.
 *  Lower sorts first. */

export interface SeasonalGuide {
  href: string
  title: string
  blurb: string
  /** Inclusive ISO dates. The guide shows only between them. */
  from: string
  to: string
  priority: number
}

/** How many guides the band renders at once. Three fits the grid; more than
 *  that crowds the row and pushes the events down. */
export const MAX_GUIDES = 3

export const SEASONAL_GUIDES: SeasonalGuide[] = [
  {
    href: '/articles/fall-activities-zionsville',
    title: 'Things to Do in Zionsville in the Fall',
    blurb: 'Festivals, walks, races and seasonal events around town.',
    from: '2026-09-01',
    to: '2026-11-02',
    priority: 20,
  },
  {
    href: '/articles/pumpkin-patches-corn-mazes-near-indianapolis',
    title: 'Pumpkin Patches & Corn Mazes',
    blurb: 'Compare 14 farms and orchards by cost, activities and what is open when.',
    from: '2026-09-01',
    to: '2026-11-02',
    priority: 30,
  },

  // Add as each guide goes live. Windows may overlap; priority decides which
  // three show.
  //
  {
    href: '/articles/halloween-zionsville',
    title: 'Trick-or-Treat & Trunk-or-Treat Events',
    blurb: 'Dates, times, ages and costs for the 2026 events around Zionsville.',
    from: '2026-09-07',
    to: '2026-11-01',
    priority: 40,
  },
  // {
  //   href: '/articles/christmas-zionsville',
  //   title: 'Christmas in Zionsville',
  //   blurb: 'Tree lighting, the Christmas parade and holiday shopping in the Village.',
  //   from: '2026-10-15', to: '2026-12-26', priority: 40,
  // },
]

/** Guides live on the given date, best first, capped at MAX_GUIDES.
 *  Pass a date so the caller controls the timezone. */
export function activeGuides(today: Date, limit = MAX_GUIDES): SeasonalGuide[] {
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  return SEASONAL_GUIDES.filter((g) => iso >= g.from && iso <= g.to)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit)
}
