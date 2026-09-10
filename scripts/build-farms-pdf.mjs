/** Build the printable fall farms guide from lib/fall-farms.ts.
 *
 *  Reads the same data the comparison table uses, so the PDF cannot drift from
 *  the site. Writes comparison.html; wkhtmltopdf turns that into the PDF and
 *  stamp-pdf.py adds the footer.
 *
 *  Run from the repo root:
 *    node scripts/build-farms-pdf.mjs
 *    wkhtmltopdf --quiet --enable-local-file-access --page-size Letter \
 *      --orientation Portrait --margin-top 10mm --margin-bottom 14mm \
 *      --margin-left 10mm --margin-right 10mm \
 *      scripts/comparison.html public/files/fall-farms-guide-2026.pdf
 *    python3 scripts/stamp-pdf.py
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const src = fs.readFileSync(path.join(ROOT, 'lib/fall-farms.ts'), 'utf8')
const OUT = path.join(ROOT, 'scripts/comparison.html')

/** The lib stores non-ASCII as \uXXXX escapes; decode them all. */
const un = (x) => x.replace(/\\u([0-9a-fA-F]{4})/g, (_, c) => String.fromCharCode(parseInt(c, 16)))

const body = src.slice(src.indexOf('export const DESTINATIONS'))

const ICONS = [...src.matchAll(/filter: '(.+?)',\s*icon: '(.+?)',\s*label: '(.+?)'/g)].map((m) => ({
  filter: m[1],
  icon: String.fromCodePoint(parseInt(m[2].replace(/\\u\{|\}/g, ''), 16)),
  label: m[3],
}))

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYNM = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' }
const DAYIX = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const fmt = (iso) => {
  const [, m, d] = iso.split('-')
  return `${MONTH[+m - 1]}. ${+d}`
}

/** 'Thu\u2013Sun' when the days run consecutively, otherwise a list. */
const runs = (days) => {
  const order = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].filter((d) => days.includes(d))
  if (order.length === 7) return 'Daily'
  const out = []
  let i = 0
  while (i < order.length) {
    let j = i
    while (j + 1 < order.length) j++
    out.push(i === j ? DAYNM[order[i]] : `${DAYNM[order[i]]}\u2013${DAYNM[order[j]]}`)
    i = j + 1
  }
  return out.join(', ')
}

/** 'Sat\u2013Mon' when three or more days run consecutively, wrapping through the
 *  weekend; a plain list otherwise. Two days always read as a list. */
const dayLabel = (days) => {
  const names = days.map((d) => DAYNM[DAYIX[d]])
  if (days.length < 3) return names.join(', ')
  for (const start of days) {
    const chain = []
    for (let k = 0; k < days.length; k++) chain.push((start + k) % 7)
    if (chain.every((d) => days.includes(d)) && new Set(chain).size === days.length)
      return `${DAYNM[DAYIX[chain[0]]]}\u2013${DAYNM[DAYIX[chain[chain.length - 1]]]}`
  }
  return names.join(', ')
}

/** True when the label already names the weekday, so '(Sat)' would repeat it. */
const namesDay = (label, day) => new RegExp(day, 'i').test(label) || /weekend|daily/i.test(label)

/** Consecutive dates collapse to a run, month stated once per group:
 *  'Oct. 12, 15\u201316, 22\u201323, 29\u201330'. Each group carries the days it covers \u2014
 *  one note for the whole list would claim days only some groups have. */
const dateList = (isos, label) => {
  const ds = isos.map((x) => new Date(x + 'T00:00:00'))
  const dayRuns = []
  for (let i = 0; i < ds.length; i++) {
    const start = i
    while (i + 1 < ds.length && ds[i + 1] - ds[i] === 86400000) i++
    const days = []
    for (let k = start; k <= i; k++) if (!days.includes(ds[k].getDay())) days.push(ds[k].getDay())
    dayRuns.push({ a: ds[start], b: ds[i], days })
  }
  const groups = []
  for (const r of dayRuns) {
    const last = groups[groups.length - 1]
    if (last && last.key === r.days.join()) last.runs.push(r)
    else groups.push({ key: r.days.join(), days: r.days, runs: [r] })
  }
  let lastMonth = null
  return groups
    .map((g) => {
      const dates = g.runs
        .map(({ a, b }) => {
          const am = MONTH[a.getMonth()]
          const bm = MONTH[b.getMonth()]
          const head = am === lastMonth ? `${a.getDate()}` : `${am}. ${a.getDate()}`
          lastMonth = bm
          if (+a === +b) return head
          return bm === am ? `${head}\u2013${b.getDate()}` : `${head}\u2013${bm}. ${b.getDate()}`
        })
        .join(', ')
      const names = g.days.map(
        (d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]
      )
      const note = names.some((n) => namesDay(label, n)) ? '' : ` (${dayLabel(g.days)})`
      return dates + note
    })
    .join(', ')
}

/* ---------- parse the lib ---------- */

const dests = []
for (const m of body.matchAll(/    name: '(.+?)',([\s\S]*?)(?=\n  \},)/g)) {
  const blk = m[2]
  const get = (k) => {
    const r = new RegExp(`${k}: '(.*?)',`).exec(blk)
    return r ? un(r[1]) : ''
  }
  const feats = /features: \[(.*?)\]/s
    .exec(blk)[1]
    .split(',')
    .map((x) => x.trim().replace(/'/g, ''))
    .filter(Boolean)
  const soon = {}
  const cs = /comingSoon: \{(.*?)\}/s.exec(blk)
  if (cs) for (const s of cs[1].matchAll(/'(.+?)': '(.+?)'/g)) soon[s[1]] = s[2]

  const scheds = []
  for (const sc of blk.matchAll(/\{ label:[^{}]*?\}/gs)) {
    const t = sc[0]
    // Members-only preview days do not belong in a public handout.
    if (/planner: false/.test(t) && /Season Pass/.test(t)) continue
    const g = (k) => {
      const r = new RegExp(`${k}: '(.*?)'`).exec(t)
      return r ? un(r[1]) : null
    }
    scheds.push({
      label: g('label'),
      status: g('status'),
      hours: g('hours'),
      start: g('start'),
      end: g('end'),
      dates: t.includes('dates:')
        ? [...t.split('dates:')[1].matchAll(/'(2026-\d\d-\d\d)'/g)].map((x) => x[1])
        : null,
      days: [...t.matchAll(/'(sun|mon|tue|wed|thu|fri|sat)'/g)].map((x) => x[1]),
    })
  }

  dests.push({
    name: un(m[1]),
    city: get('city'),
    highlights: get('highlights'),
    cost: get('cost'),
    features: feats,
    soon,
    schedules: scheds,
  })
}

/* ---------- cells ---------- */

/** Earliest date a schedule covers, for ordering. Unposted schedules sort last. */
const firstDay = (s) => (s.dates?.length ? s.dates[0] : s.start) || '9999-12-31'

const scheduleCell = (d) =>
  [...d.schedules]
    .sort((a, b) => firstDay(a).localeCompare(firstDay(b)))
    .map((s) => {
      let when
      let dayNote = ''
      if (s.dates?.length) {
        const ds = s.dates.map((x) => new Date(x + 'T00:00:00'))
        const set = new Set(ds.map((x) => x.getDay()))
        // Only compress when the dates are every occurrence of their weekdays
        // between the first and last \u2014 otherwise a range implies missing days.
        let complete = true
        for (let t = +ds[0]; t <= +ds[ds.length - 1]; t += 86400000) {
          const day = new Date(t)
          const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(
            day.getDate()
          ).padStart(2, '0')}`
          if (set.has(day.getDay()) && !s.dates.includes(iso)) {
            complete = false
            break
          }
        }
        const WEEK = [1, 2, 3, 4, 5, 6, 0] // Mon-first, so a note never reads 'Sun, Mon, Sat'
        const inWeek = WEEK.filter((d2) => set.has(d2))
        const names = inWeek.map(
          (d2) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d2]
        )
        const labelled = names.some((n) => namesDay(s.label, n))
        // Compress from four dates up when the label names the day; otherwise
        // stay explicit \u2014 the dates carry the days.
        if (complete && (labelled ? s.dates.length >= 4 : set.size <= 2 && s.dates.length >= 6)) {
          when = `${fmt(s.dates[0])}\u2013${fmt(s.dates[s.dates.length - 1])}`
          if (!labelled) dayNote = ` (${dayLabel(inWeek)})`
        } else {
          when = dateList(s.dates, s.label)
        }
      } else if (s.start && s.end) {
        when = `${fmt(s.start)}\u2013${fmt(s.end)}`
      } else if (s.start) {
        when = `from ${fmt(s.start)}`
        if (!s.days.length) {
          const od = new Date(s.start + 'T00:00:00')
          dayNote = ` (${DAYNM[DAYIX[od.getDay()]]})`
        }
      } else {
        when = ''
      }

      if (!s.dates?.length && s.days.length) {
        const r = runs(s.days)
        if (!namesDay(s.label, r)) dayNote = ` (${r})`
      }

      // Name only what a reader needs before going. A missing end date is not
      // worth the line.
      let flag = ''
      if (s.status !== 'confirmed') {
        let gap = null
        if (!s.start && !s.dates?.length) gap = 'opening date'
        else if (!s.days.length && !s.dates?.length) gap = 'days'
        flag = gap ? ` <em>${gap[0].toUpperCase()}${gap.slice(1)} not yet posted</em>` : ''
      }
      const hrs = s.hours ? `<br><span class="hrs">${s.hours}</span>` : ''
      return `<div class="sch"><b>${s.label}</b> ${when}${dayNote}${flag}${hrs}</div>`
    })
    .join('')

const featureCell = (d) => {
  const on = ICONS.filter((i) => d.features.includes(i.filter)).map((i) => `${i.icon} ${i.label}`)
  const later = Object.entries(d.soon).map(([f, when]) => {
    const ic = ICONS.find((i) => i.filter === f)
    // The label may be a date ('Sept. 19') or a bare word ('soon').
    const w = /\d/.test(when)
      ? /^(from|late|early|mid)\b/i.test(when)
        ? when
        : `from ${when}`
      : 'dates not yet posted'
    return ic ? `<span class="soon">${ic.icon} ${ic.label} \u2014 ${w}</span>` : ''
  })
  const words = [
    'Hayride / Wagon Ride',
    'Rides / Large Play Area',
    'Sensory / Accessibility Info',
    'Free / No General Admission',
  ]
    .filter((f) => d.features.includes(f))
    .map((f) => f.split(' / ')[0].replace('Sensory', 'Accessibility').replace('Free', 'Free entry'))
  return [...on, ...later, ...words].join('<br>')
}

/** The web table has no dates column, so highlights carry event dates there.
 *  Here they repeat the column alongside \u2014 but only for events that actually
 *  appear in it. A date for anything else (Dull's fireworks) stays. */
const DATE_RE =
  /,? ?\b(Sept?|Oct|Nov)\.? ?\d+(\s*(\u2013|-|and|&)\s*(\d+|(Sept?|Oct|Nov)\.? ?\d+))?\b/i
const trimDates = (h, schedules) => {
  let out = h
  for (const sc of schedules) {
    const key = sc.label.split(/\s+/).slice(0, 2).join('\\s+')
    const re = new RegExp(`(${key}[^;,]*?)${DATE_RE.source}`, 'i')
    out = out.replace(re, '$1')
  }
  return out
    .replace(/\s*[;,]\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/* ---------- layout ---------- */

const COUNTY = {
  'Dull\u2019s Tree Farm': 'BOONE COUNTY',
  'Stuckey Farm Orchard & Cider Mill': 'HAMILTON COUNTY',
  'Tuttle Orchards': 'HANCOCK COUNTY',
  'Hogan Farms Pumpkin Patch & Corn Maze': 'HENDRICKS COUNTY',
  'Kelsay Farms': 'JOHNSON COUNTY',
  'Driving Wind Berry Farms': 'MARION COUNTY',
  'Anderson Orchard': 'MORGAN COUNTY',
  'Chandler’s Farm & Country Market': 'PUTNAM COUNTY',
  'Pleasant View Orchard': 'SHELBY COUNTY',
}

const COLS = `<colgroup><col style="width:25%"><col style="width:34%">
  <col style="width:23%"><col style="width:18%"></colgroup>`

const HEAD = `<table class="grp">${COLS}<tr><th>Destination</th><th>2026 Dates &amp; Hours</th>
  <th>Admission &amp; Costs</th><th>Features</th></tr></table>`

/** wkhtmltopdf will not repeat a table header and splits rows inside a single
 *  table. So each destination is its own table, and the page break is placed by
 *  hand with the column header repeated after it. Change this name if the
 *  content grows and the break lands somewhere else. */
const BREAK_BEFORE = new Set(['Piney Acres Farm', 'Anderson Orchard'])

let county = null
const rows = dests
  .map((d) => {
    if (COUNTY[d.name]) county = COUNTY[d.name]
    const startsPage = BREAK_BEFORE.has(d.name)
    // A page opening mid-county repeats the band so the grouping is not lost.
    const band = COUNTY[d.name]
      ? `<tr class="county"><td colspan="4">${county}</td></tr>`
      : startsPage
        ? `<tr class="county"><td colspan="4">${county} (continued)</td></tr>`
        : ''
    return `
  ${startsPage ? `<div class="pb"></div>${HEAD}` : ''}
  <table class="grp">${COLS}
    ${band}
    <tr>
      <td><b>${d.name}</b><br><span class="city">${d.city}</span><br><span class="hl">${trimDates(
        d.highlights,
        d.schedules
      )}</span></td>
      <td>${scheduleCell(d)}</td>
      <td>${d.cost}</td>
      <td class="feat">${featureCell(d)}</td>
    </tr>
  </table>`
  })
  .join('')

const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

fs.writeFileSync(
  OUT,
  `<!doctype html><meta charset="utf-8"><style>
body { font: 10pt/1.4 "Helvetica Neue", Arial, sans-serif; color:#1c1917; }
h1 { font-size: 17pt; margin:0 0 2px; }
.sub { color:#57534e; font-size:9.5pt; margin:0 0 10px; }
table { width:100%; border-collapse:collapse; table-layout:fixed; }
table.grp { page-break-inside:avoid; }
.pb { page-break-before:always; }
th { background:#f5f5f4; text-align:left; padding:6px 7px; font-size:9.5pt;
     border-bottom:1.5px solid #d6d3d1; }
td { padding:7px; vertical-align:top; border-bottom:1px solid #e7e5e4; }
tr.county td { background:#78350f; color:#fff; font-weight:bold; font-size:9pt;
  letter-spacing:.06em; padding:3px 6px; border:0; }
.city { color:#57534e; } .hl { color:#57534e; font-style:italic; }
.sch { margin-bottom:3px; } .hrs { color:#57534e; }
.soon { color:#78716c; }
em { color:#9a3412; font-style:normal; }
.foot { margin-top:10px; font-size:9pt; color:#57534e; }
.foot ul { margin:4px 0 0; padding-left:16px; }
.foot li { margin-bottom:2px; }
</style>
<h1>2026 Fall Farms &amp; Orchards Guide</h1>
<p class="sub">Near Zionsville and Indianapolis &middot; ZionsvilleIndiana.com &middot; Updated ${today}</p>
${HEAD}
${rows}
<div class="foot">Schedules reflect information published as of ${today}.
<ul>
<li><b>&ldquo;Not yet posted&rdquo;</b> means the destination had not published 2026 details. It does not mean closed.</li>
<li><b>A feature marked with a &ldquo;from&rdquo; date</b> becomes available on that date.</li>
<li>Confirm prices and hours with the destination before visiting.</li>
</ul>
</div>`
)

console.log(`comparison.html written \u2014 ${dests.length} destinations`)
