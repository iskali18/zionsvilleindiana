/** Audit metaTitle and metaDescription across content.
 *
 *  node scripts/audit-meta.mjs           only files with problems
 *  node scripts/audit-meta.mjs --all     every file
 *  node scripts/audit-meta.mjs --future  skip events whose date has passed
 *
 *  Targets: title 40-60 chars, description 110-160.
 *  Google truncates a title around 60 and a description around 160; much
 *  shorter than that wastes the space.
 *
 *  The root layout used to append " | Zionsville Indiana" to every title. That
 *  template is gone, so a title now renders exactly as written and containing
 *  "Zionsville" is correct rather than a duplication.
 */
import fs from 'fs'
import path from 'path'

const args = new Set(process.argv.slice(2))
const showAll = args.has('--all')
const futureOnly = args.has('--future')

const TITLE_MIN = 40
const TITLE_MAX = 60
const DESC_MIN = 110
const DESC_MAX = 160

const today = new Date().toISOString().slice(0, 10)
const rows = []

for (const section of ['events', 'articles', 'parks', 'businesses']) {
  const dir = path.join('content', section)
  if (!fs.existsSync(dir)) continue

  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8')
    const fm = /^---\n([\s\S]*?)\n---/.exec(raw)
    if (!fm) continue

    const get = (key) => {
      const m = new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm').exec(fm[1])
      return m ? m[1] : ''
    }

    // An event with `occurrences` runs until the last listed date.
    const occ = [...fm[1].matchAll(/^\s+- "?(\d{4}-\d{2}-\d{2})"?/gm)].map((m) => m[1])
    const end = occ.length ? occ.sort().at(-1) : get('endDate') || get('startDate')

    rows.push({
      file: `${section}/${file}`,
      title: get('metaTitle'),
      desc: get('metaDescription'),
      past: Boolean(end) && end < today,
    })
  }
}

function problems(r) {
  const out = []
  if (!r.title) out.push('NO metaTitle')
  else if (r.title.length > TITLE_MAX) out.push(`title ${r.title.length} (long)`)
  else if (r.title.length < TITLE_MIN) out.push(`title ${r.title.length} (short)`)

  if (!r.desc) out.push('NO metaDescription')
  else if (r.desc.length > DESC_MAX) out.push(`desc ${r.desc.length} (long)`)
  else if (r.desc.length < DESC_MIN) out.push(`desc ${r.desc.length} (short)`)

  return out
}

const listed = rows
  .filter((r) => !(futureOnly && r.past))
  .map((r) => ({ ...r, issues: problems(r) }))
  .filter((r) => showAll || r.issues.length)
  .sort((a, b) => b.title.length - a.title.length)

console.log('file\ttitle\tdesc\tissues')
for (const r of listed) {
  const flag = r.past ? ' [past]' : ''
  console.log(`${r.file}\t${r.title.length}\t${r.desc.length}\t${r.issues.join(', ')}${flag}`)
}

const clean = rows.length - rows.filter((r) => problems(r).length).length
console.log(`\n${rows.length} files checked, ${clean} clean`)
if (!showAll) console.log('Run with --all to see every file, --future to skip past events.')
