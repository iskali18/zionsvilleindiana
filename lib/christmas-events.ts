/** Christmas in Zionsville 2026 — the data behind the filterable table.
 *
 *  Single source of truth. The article's at-a-glance table is generated from
 *  this, so the two cannot drift.
 *
 *  Two shapes of event:
 *    - `dates`  discrete days. Each one is grouped into that day's row, so
 *               Selfies with Santa shows up alongside the other Dec. 5 events.
 *    - `start` + `end`  a continuous run. Gets its own row and is not repeated
 *               into the days it spans. */

export const TYPES = [
  'Family',
  'Shopping & Markets',
  'Concerts & Performances',
  'Church',
] as const

export type EventType = (typeof TYPES)[number]

/** Admission is deliberately three-valued. 'unknown' means the organiser has
 *  not published it — it must never be shown as free, and it is excluded from
 *  Free-only results rather than guessed at. */
export type Admission = 'free' | 'ticketed' | 'unknown'

export interface ChristmasEvent {
  name: string
  /** Heading anchor on the same page. */
  anchor: string
  /** Discrete dates (YYYY-MM-DD). Use this OR start/end, not both. */
  dates?: string[]
  /** Continuous run. Rendered as one row spanning the range. */
  start?: string
  end?: string
  types: EventType[]
  admission: Admission
  /** Clock time or note shown beside the name. Omit when unpublished. */
  time?: string
  /** Short label after the name, e.g. '21+'. */
  note?: string
  /** Who runs it. Shown in the detail line under the name. Omit when it is the
   *  same as `venue` — never the same name twice. */
  organizer?: string
  /** One short line on what it is. Drawn from the section below, so a reader
   *  scanning the table knows what an unfamiliar name means. */
  summary: string
  /** Where it happens, short enough for a table cell. */
  venue?: string
}

export const EVENTS: ChristmasEvent[] = [
  {
    name: 'Teeny Tiny Art Market',
    anchor: 'teeny-tiny-art-market',
    start: '2026-11-20',
    end: '2026-12-19',
    types: ['Shopping & Markets'],
    admission: 'unknown',
    venue: 'SullivanMunce Cultural Center',
    summary: 'Original artwork measuring 6 by 6 inches or smaller',
  },
  {
    name: 'Holiday Parade & Tree Lighting',
    anchor: 'holiday-parade--tree-lighting',
    dates: ['2026-11-28'],
    types: ['Family'],
    admission: 'free',
    time: '5:00\u20136:30 p.m.',
    organizer: 'Zionsville Chamber of Commerce',
    venue: 'Main Street',
    summary: 'Main Street parade followed by the town tree lighting',
  },
  {
    name: 'Selfies with Santa',
    anchor: 'selfies-with-santa',
    dates: [
      '2026-11-29',
      '2026-12-05',
      '2026-12-06',
      '2026-12-12',
      '2026-12-13',
      '2026-12-19',
      '2026-12-20',
    ],
    types: ['Family'],
    admission: 'free',
    time: '11:00 a.m.\u20133:00 p.m.',
    organizer: 'Zionsville Chamber of Commerce',
    venue: 'Santa House, Cedar & Main',
    summary: 'Photos with Santa and Mrs. Claus at the Santa House',
  },
  {
    name: 'Zionsville Community High School Orchestra Holiday Concert',
    anchor: 'zchs-holiday-concerts',
    dates: ['2026-12-01'],
    types: ['Concerts & Performances'],
    admission: 'unknown',
    time: '7:00 p.m.',
    venue: 'STAR Bank Performing Arts Center',
    summary: 'Holiday music performed by the ZCHS orchestra',
  },
  {
    name: 'Zionsville Community High School Band Holiday Concert',
    anchor: 'zchs-holiday-concerts',
    dates: ['2026-12-03'],
    types: ['Concerts & Performances'],
    admission: 'unknown',
    time: '7:00 p.m.',
    venue: 'STAR Bank Performing Arts Center',
    summary: 'Holiday music performed by the ZCHS bands',
  },
  {
    name: 'Zionsville Showchoir Holiday Home Tour',
    anchor: 'zionsville-showchoir-holiday-home-tour',
    dates: ['2026-12-05'],
    types: ['Family', 'Concerts & Performances'],
    admission: 'ticketed',
    organizer: 'Zionsville Show Choirs',
    venue: 'Private homes',
    summary: 'Fundraiser home tour with show choir performances; 2026 details not yet posted',
  },
  {
    name: 'Tri Kappa Santa Breakfast',
    anchor: 'tri-kappa-santa-breakfast',
    dates: ['2026-12-05'],
    types: ['Family'],
    admission: 'ticketed',
    organizer: 'Zionsville Tri Kappa',
    venue: 'Main Street',
    summary: 'Family breakfast fundraiser; 2026 details not yet posted',
  },
  {
    name: 'Winterfest Open-Air Maker\u2019s Market',
    anchor: 'winterfest-open-air-makers-market',
    dates: ['2026-12-05'],
    types: ['Shopping & Markets', 'Family'],
    admission: 'free',
    time: '9:00 a.m.\u2013noon',
    organizer: 'Zionsville Parks & Recreation',
    venue: 'Main Street',
    summary: 'Local makers, food trucks, seasonal music and carolers on Main Street',
  },
  {
    name: 'David Ackerman Christmas Concert',
    anchor: 'david-ackerman-christmas-concert',
    dates: ['2026-12-06'],
    types: ['Concerts & Performances', 'Church'],
    admission: 'ticketed',
    time: '7:00\u20139:00 p.m.',
    venue: 'Zionsville Presbyterian Church',
    summary: 'Traditional and contemporary Christmas music benefiting the Zionsville Food Pantry',
  },
  {
    name: 'Zionsville Community High School Choral Holiday Concert',
    anchor: 'zchs-holiday-concerts',
    dates: ['2026-12-08'],
    types: ['Concerts & Performances'],
    admission: 'unknown',
    time: '7:00 p.m.',
    venue: 'STAR Bank Performing Arts Center',
    summary: 'Holiday music performed by the ZCHS choirs',
  },
  {
    name: 'Ladies Night',
    anchor: 'ladies-night',
    dates: ['2026-12-10'],
    types: ['Shopping & Markets'],
    admission: 'free',
    time: '5:00\u20139:00 p.m.',
    organizer: 'Zionsville Chamber of Commerce',
    venue: 'Village shops',
    summary: 'Evening shopping with Ladies Night specials at Village businesses',
  },
  {
    name: 'Central Indiana Dance Ensemble: The Nutcracker',
    anchor: 'two-nutcracker-productions',
    start: '2026-12-11',
    end: '2026-12-13',
    types: ['Concerts & Performances', 'Family'],
    admission: 'ticketed',
    venue: 'STAR Bank Performing Arts Center',
    summary: 'Full-length production of The Nutcracker by Central Indiana Dance Ensemble',
  },
  {
    name: 'Women\u2019s Christmas Tea',
    anchor: 'womens-christmas-tea',
    dates: ['2026-12-12'],
    types: ['Church'],
    admission: 'unknown',
    venue: 'Zionsville Fellowship Church',
    summary: 'Christmas brunch with hymns and personal stories for ages 12 and older',
  },
  {
    name: 'Back to Bethlehem',
    anchor: 'back-to-bethlehem',
    dates: ['2026-12-13'],
    types: ['Family', 'Church'],
    admission: 'ticketed',
    time: '5:30\u20138:30 p.m.',
    venue: 'Zionsville Presbyterian Church',
    summary: 'Walk-through retelling of the Christmas story followed by a holiday marketplace',
  },
  {
    name: 'Christmas Crawl',
    anchor: 'christmas-crawl',
    dates: ['2026-12-17'],
    types: ['Shopping & Markets'],
    admission: 'free',
    time: '5:00\u20139:00 p.m.',
    note: '21+',
    organizer: 'Zionsville Chamber of Commerce',
    venue: 'Main Street',
    summary: 'Shopping and dining for guests 21 and older, with an ugly sweater contest at 8 p.m.',
  },
  {
    name: 'Metropolitan Youth Ballet: The Nutcracker',
    anchor: 'two-nutcracker-productions',
    start: '2026-12-18',
    end: '2026-12-20',
    types: ['Concerts & Performances', 'Family'],
    admission: 'ticketed',
    venue: 'STAR Bank Performing Arts Center',
    summary: 'The Nutcracker presented by Metropolitan Youth Ballet in four performances',
  },
]

const MONTH = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']
const DAY = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']

/** Parsed as local time — `new Date('2026-12-05')` is UTC midnight, which lands
 *  on the previous day west of Greenwich. */
export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 'Sat., Dec. 5' */
export function formatDay(iso: string): string {
  const d = parseDate(iso)
  return `${DAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`
}

/** 'Fri.\u2013Sun., Dec. 11\u201313' for a short run; 'Nov. 20 \u2013 Dec. 19' for a long one.
 *  The weekday prefix only makes sense within a single week — over a month it
 *  reads as "Fridays and Saturdays" rather than the first and last day. */
export function formatRange(startIso: string, endIso: string): string {
  const a = parseDate(startIso)
  const b = parseDate(endIso)
  const tail =
    a.getMonth() === b.getMonth()
      ? `${MONTH[a.getMonth()]} ${a.getDate()}\u2013${b.getDate()}`
      : `${MONTH[a.getMonth()]} ${a.getDate()} \u2013 ${MONTH[b.getMonth()]} ${b.getDate()}`
  const spansAWeekOrLess = (+b - +a) / 86400000 <= 6
  return spansAWeekOrLess ? `${DAY[a.getDay()]}\u2013${DAY[b.getDay()]}, ${tail}` : tail
}

export interface DateRow {
  /** Sort key — the first day this row covers. */
  key: string
  label: string
  events: ChristmasEvent[]
}

/** Group events into rows. Discrete dates collapse into one row per day; a
 *  continuous run keeps its own row and is not repeated into the days it
 *  spans. Rows sort by first day. */
export function buildRows(events: ChristmasEvent[] = EVENTS): DateRow[] {
  const byDay = new Map<string, ChristmasEvent[]>()
  const runs: DateRow[] = []

  for (const e of events) {
    if (e.dates?.length) {
      for (const d of e.dates) {
        if (!byDay.has(d)) byDay.set(d, [])
        byDay.get(d)!.push(e)
      }
    } else if (e.start && e.end) {
      runs.push({ key: e.start, label: formatRange(e.start, e.end), events: [e] })
    }
  }

  const dayRows: DateRow[] = [...byDay.entries()].map(([iso, evs]) => ({
    key: iso,
    label: formatDay(iso),
    events: evs,
  }))

  return [...dayRows, ...runs].sort((a, b) => a.key.localeCompare(b.key))
}

/** Compact label for a collapsed recurring event: 'Nov. 29; Dec. 5\u20136, 12\u201313, 19\u201320'.
 *  Consecutive days join with an en dash; the month is stated once per group. */
export function formatDateList(isos: string[]): string {
  const ds = isos.map(parseDate).sort((a, b) => +a - +b)
  const runs: [Date, Date][] = []
  for (let i = 0; i < ds.length; i++) {
    const a = ds[i]
    while (i + 1 < ds.length && +ds[i + 1] - +ds[i] === 86400000) i++
    runs.push([a, ds[i]])
  }
  let lastMonth = -1
  return runs
    .map(([a, b]) => {
      const head = a.getMonth() === lastMonth ? `${a.getDate()}` : `${MONTH[a.getMonth()]} ${a.getDate()}`
      lastMonth = b.getMonth()
      if (+a === +b) return head
      return a.getMonth() === b.getMonth()
        ? `${head}\u2013${b.getDate()}`
        : `${head} \u2013 ${MONTH[b.getMonth()]} ${b.getDate()}`
    })
    .join('; ')
}

/** Filtered view. A recurring event collapses to a single row so the results
 *  read as a list of options rather than the same event seven times. Runs
 *  (the two Nutcrackers) are already one row each and are left alone. */
export function buildFilteredRows(events: ChristmasEvent[]): DateRow[] {
  const rows: DateRow[] = []
  for (const e of events) {
    if (e.dates && e.dates.length > 1) {
      rows.push({
        key: [...e.dates].sort()[0],
        label: `${e.dates.length} dates`,
        events: [e],
      })
    } else if (e.dates?.length) {
      rows.push({ key: e.dates[0], label: formatDay(e.dates[0]), events: [e] })
    } else if (e.start && e.end) {
      rows.push({ key: e.start, label: formatRange(e.start, e.end), events: [e] })
    }
  }
  // merge single-date rows that fall on the same day
  const merged = new Map<string, DateRow>()
  const out: DateRow[] = []
  for (const r of rows) {
    if (r.label.endsWith('dates') || r.events[0].start) { out.push(r); continue }
    const hit = merged.get(r.key)
    if (hit) hit.events.push(...r.events)
    else { merged.set(r.key, r); out.push(r) }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key))
}
