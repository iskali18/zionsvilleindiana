# Fall farms guide

The article at `/articles/pumpkin-patches-corn-mazes-near-indianapolis`, the
comparison table on it, and the printable PDF all read from one data file. This
covers how they fit together and what to do each year.

---

## The one file that matters

`lib/fall-farms.ts` is the single source of truth. The comparison table reads
it, and the PDF is generated from it. Nothing about a destination should live
in two places.

The article prose is separate — it holds the detail a reader wants once they
have narrowed their choice. The lib holds what they compare on.

---

## What the lib holds

One entry per destination, ordered by county, matching the order of the
sections in the article:

```ts
{
  name: 'Kelsay Farms',
  anchor: 'kelsay-farms',
  city: 'Whiteland',
  highlights: '7-acre corn maze, flashlight maze nights, Moo Choo train, farm animals',
  cost: '$14 for age 2+; $12/person for groups of 20+; under 2 free',
  features: ['Pumpkin Picking', 'Corn Maze', 'Farm Animals', ...],
  comingSoon: { 'Pumpkin Picking': 'from Sept. 25' },
  schedules: [ ... ],
}
```

**`anchor`** must match the `{#slug}` on the article heading, or the table's
links go nowhere.

**`highlights`** must match the article's `- **Highlights:**` line word for
word.

**`features`** drives the filter chips and the row icons.

**`comingSoon`** grays an icon and labels it with a date, for a feature that
has not started yet.

---

## Schedules and the date filter

Each destination has one or more schedules. The date picker uses them to answer
"is this place open on the day I pick."

**`status`** is the honest part:

| Status | Means |
| --- | --- |
| `confirmed` | The destination has published this schedule |
| `partial` | Season window known, operating days not |
| `not_posted` | No 2026 schedule published at all |

None of these ever means *closed*. A destination with `not_posted` simply never
appears in a date-filtered result, which is correct — nothing can confirm it is
open.

**`planner: true`** means this schedule drives the date filter. Set it `false`
for schedules that describe a sub-feature rather than whether the place is open
— a U-pick window, a one-off event — so they do not override the main season
with unknowns.

---

## Parity: the article and the lib must agree

Three things are checked by eye and should be checked after any edit:

- Every `### [Name]` heading matches a lib `name`
- Every `{#anchor}` matches a lib `anchor`
- Every `- **Highlights:**` line matches a lib `highlights`

If they drift, the comparison table links break or the table says something the
section contradicts.

---

## Regenerating the PDF

From the repo root:

```powershell
node scripts/build-farms-pdf.mjs
wkhtmltopdf --quiet --enable-local-file-access --page-size Letter --orientation Portrait --margin-top 10mm --margin-bottom 14mm --margin-left 10mm --margin-right 10mm scripts/comparison.html public/files/fall-farms-guide-2026.pdf
python3 scripts/stamp-pdf.py
```

Those three lines are also in the comment block at the top of the build script.

**One-time setup:** `pip install pypdf reportlab`, plus wkhtmltopdf.

**`scripts/comparison.html` is a build artifact** and is gitignored.

**Rebuild when the lib changes. Do not rebuild for article prose changes** —
the PDF carries only what is in the lib.

---

## Two quirks in the build script

**Page breaks are placed by hand.** wkhtmltopdf will not repeat a table header
across pages, so each destination is its own table and the breaks are forced:

```js
const BREAK_BEFORE = new Set(['Piney Acres Farm', 'Anderson Orchard'])
```

If content grows and a page ends up without a column header, add the
destination that starts that page to this set.

**Counties are a manual map.** `COUNTY` near the bottom of the script maps the
first destination in each county to its band label. **Adding a destination in a
new county means adding it here**, or it files under the previous county's
band.

---

## The footer

`scripts/stamp-pdf.py` draws the page footer after wkhtmltopdf has run.
wkhtmltopdf's own footer switches need a patched Qt that the standard build
does not have.

---

## What to do every year

**Late summer, before the season starts**

- Update every schedule in `lib/fall-farms.ts` to the new year's dates
- Set `status` honestly — most destinations post late, so `not_posted` is
  normal in August
- Add `comingSoon` labels for features that have not opened yet
- Update `cost` cells; prices change more often than dates
- Bump `lastUpdated` in the article frontmatter **and** the visible "Updated"
  line in the callout — the two must agree
- Regenerate the PDF

**Through the season**

- As destinations post their schedules, change `not_posted` to `confirmed` and
  fill in the dates
- Remove `comingSoon` labels once a feature opens, or leave them — read in
  October, "from Sept. 25" is a start date, not a claim it is still closed
- Rebuild the PDF after any lib change

**Adding a destination**

1. Article section, in county order, with heading, anchor and Highlights
2. Lib entry, same position, with matching name, anchor and Highlights
3. If it is a new county, add it to `COUNTY` in the build script
4. Check the cross-references: the apple-picking list, the free-options list,
   the corn-maze count, the accessibility list, and the FAQs that name
   destinations
5. Rebuild the PDF and check the page count and headers

**Step 4 is the one that gets missed.** Adding three destinations in September
2026 required six separate cross-reference fixes.

---

## Files

| File | What it does |
| --- | --- |
| `lib/fall-farms.ts` | All destination data |
| `components/FallFarmComparison.tsx` | The filterable table |
| `content/articles/pumpkin-patches-corn-mazes-near-indianapolis.md` | The article |
| `scripts/build-farms-pdf.mjs` | Reads the lib, writes HTML |
| `scripts/stamp-pdf.py` | Adds the PDF footer |
| `public/files/fall-farms-guide-2026.pdf` | The generated PDF |

---

## Rules that took a while to settle

**The Pumpkin filter means "pumpkins available to take home"**, not U-pick.
Farms that sell pre-picked pumpkins have it on. Two destinations have no U-pick
at all and still carry it.

**Variety counts stay out of Highlights.** A farm listing 50 apple varieties
across its growing year has far fewer ripe in October, so the number oversells.
It belongs in the section prose with the "across its growing year" caveat.

**A farm's own numbers beat a directory's.** Listing sites and tourism boards
carry stale figures. When they disagree with the destination's site, the
destination wins.

**No dated promos or discount codes.** They go stale within days.

**Time-relative claims need a month anchor.** "As of early September" rather
than "currently" or "as of this writing."
