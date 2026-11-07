/** Seasonal guide links for the events page band.
 *
 *  Each guide carries its own window, so the band changes on its own as dates
 *  pass — no edit needed when a season turns. Guides drop off one at a time
 *  because their windows end on different days.
 *
 *  When more guides are live than the band shows, the band rotates daily:
 *  each day shows the next set in priority order, so every page agrees on
 *  the same guides that day. A guide with `pinned: true` skips the rotation
 *  and shows every day it is live. `priority` sets the rotation order and the
 *  display order. Lower sorts first. */

export type Season = 'fall' | 'holiday' | 'winter' | 'spring' | 'summer'

/** Where the strip is being shown. Each page passes its kind; the label comes
 *  from the season currently in play, so the wording follows the guides. */
export type StripKind = 'listing' | 'event' | 'schoolBreak'

export interface SeasonalGuide {
  href: string
  title: string
  blurb: string
  /** Which season this guide belongs to. Drives the strip's lead-in text, so
   *  no page has to hardcode a season word. */
  season: Season
  /** Inclusive ISO dates. The guide shows only between them. */
  from: string
  to: string
  priority: number
  /** Show this guide every day it is live instead of rotating it with the
   *  others. Use for the one guide that matters most in its season. */
  pinned?: boolean
}

/** How many guides the band renders at once. Three fits the grid; more than
 *  that crowds the row and pushes the events down. */
export const MAX_GUIDES = 3

export const SEASONAL_GUIDES: SeasonalGuide[] = [
  {
    href: '/articles/fall-activities-zionsville',
    title: 'Things to Do in Zionsville in the Fall',
    season: 'fall',
    blurb: 'Festivals, walks, races and seasonal events around town.',
    from: '2026-09-01',
    to: '2026-11-26',
    priority: 20,
  },
  {
    href: '/articles/pumpkin-patches-corn-mazes-near-indianapolis',
    title: 'Pumpkin Patches & Corn Mazes',
    season: 'fall',
    blurb: 'Compare 17 farms and orchards by cost, activities and what is open when.',
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
    season: 'fall',
    blurb: 'Dates, times, ages and costs for the 2026 events around Zionsville.',
    from: '2026-09-07',
    to: '2026-11-01',
    priority: 40,
  },
  {
    href: '/events/christmas-in-zionsville',
    title: 'Christmas in Zionsville',
    season: 'holiday',
    pinned: true,
    blurb: 'Parade, tree lighting, Santa visits and holiday events around town.',
    from: '2026-11-05',
    to: '2026-12-24',
    priority: 10,
  },
  {
    href: '/articles/indoor-things-to-do-kids',
    title: 'Indoor Things to Do for Young Kids This Winter',
    season: 'winter',
    blurb: '39 play spaces, museums, libraries and classes near Zionsville.',
    from: '2026-11-05',
    to: '2027-03-15',
    priority: 20,
  },
  {
    href: '/articles/indoor-things-to-do-tweens-teens',
    title: 'Indoor Things to Do for Older Kids & Teens This Winter',
    season: 'winter',
    blurb: '37 indoor places for older kids and teens, from climbing to karting.',
    from: '2026-11-05',
    to: '2027-03-15',
    priority: 30,
  },
]

/** Guides live on the given date, capped at MAX_GUIDES.
 *
 *  Pinned guides always show. The remaining slots rotate once a day through
 *  the other live guides, in priority order, so every guide gets its turn.
 *  The day decides the set, which keeps the events page, the homepage and
 *  every other page in step. The result is returned in display order:
 *  pinned first, then by priority.
 *
 *  Pass a date so the caller controls the timezone. */
export function activeGuides(today: Date, limit = MAX_GUIDES): SeasonalGuide[] {
  const iso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  const live = SEASONAL_GUIDES.filter((g) => iso >= g.from && iso <= g.to).sort(
    (a, b) => a.priority - b.priority
  )
  const pinned = live.filter((g) => g.pinned).slice(0, limit)
  const others = live.filter((g) => !g.pinned)
  const slots = limit - pinned.length

  let rotating = others
  if (others.length > slots) {
    // Whole days since 1970, counted from the local calendar date, so the set
    // turns over at midnight in the caller's timezone.
    const day = Math.floor(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) / 86_400_000)
    const start = day % others.length
    rotating = Array.from({ length: slots }, (_, i) => others[(start + i) % others.length])
  }

  return [...pinned, ...rotating.sort((a, b) => a.priority - b.priority)]
}

/** Lead-in text for the strip, by season and page kind.
 *
 *  Adding a season means adding its labels here — the same file where its
 *  guides live, so nothing seasonal is scattered across page files. */
export const SEASON_LABELS: Record<Season, Record<StripKind, string>> = {
  fall: {
    listing: 'Planning the season?',
    event: 'Explore fall in Zionsville',
    schoolBreak: 'Looking for things to do this fall?',
  },
  holiday: {
    listing: 'Planning the season?',
    event: 'Explore Christmas in Zionsville',
    schoolBreak: 'Making plans for winter break?',
  },
  winter: {
    listing: 'Planning the season?',
    event: 'Explore winter in Zionsville',
    schoolBreak: 'Making plans for winter break?',
  },
  spring: {
    listing: 'Planning the season?',
    event: 'Explore spring in Zionsville',
    schoolBreak: 'Looking for things to do this spring?',
  },
  summer: {
    listing: 'Planning the season?',
    event: 'Explore summer in Zionsville',
    schoolBreak: 'Making plans for summer?',
  },
}

/** The label for a set of live guides. When guides from two seasons overlap,
 *  the first one wins — they are already sorted by priority, so the season
 *  that matters most leads. */
export function labelFor(guides: SeasonalGuide[], kind: StripKind): string {
  const season = guides[0]?.season ?? 'fall'
  return SEASON_LABELS[season][kind]
}
