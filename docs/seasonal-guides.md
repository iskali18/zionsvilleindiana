# Seasonal guides strip

A band of links to seasonal guides that appears on several pages and turns
itself on and off by date. Nothing needs switching off when a season ends.

---

## The one file you edit

`lib/seasonal-guides.ts` holds everything seasonal: the guides, their date
windows, and the wording of the labels. The page files contain no season words
and no dates.

---

## How it works

Each guide has a `from` and `to` date. That pair is its window.

```ts
{
  href: '/articles/fall-activities-zionsville',
  title: 'Things to Do in Zionsville in the Fall',
  blurb: 'Festivals, walks, races and seasonal events around town.',
  season: 'fall',
  from: '2026-09-01',
  to: '2026-11-02',
  priority: 20,
}
```

On any given day the strip shows the guides whose windows include that day,
sorted by `priority` (lower first) and capped at `MAX_GUIDES`, which is 3.

When no window is open, the strip renders nothing at all — no empty box, no
orphan heading.

**`season`** decides the wording of the lead-in text. **`priority`** decides
which three show when more than three windows overlap.

---

## Where the strip appears

| Page | Kind | Tone | Placement |
| --- | --- | --- | --- |
| Homepage | `listing` | bare | Inside Upcoming Events, after “View all events” |
| `/events` | `listing` | amber | After the first row of featured events |
| Event pages | `event` | plain | At the `<!-- SEASONAL_STRIP -->` marker |
| Ended event pages | — | amber | Inside `EventEndedBanner`, at the top |
| School calendar | `schoolBreak` | amber | Between the milestone dates and the filters |

**Tone** is the container treatment:

| Tone | Looks like | Use when |
| --- | --- | --- |
| `amber` | Pale amber fill, amber border | It needs to stand out against white cards |
| `plain` | White fill, grey border | The page has its own amber block it would compete with |
| `bare` | No box, thin top rule | It should read as secondary navigation, not a callout |

`bare` also lays out differently — the label sits above the links rather than
beside them, and the links are separated by middots.

---

## Labels

`SEASON_LABELS` near the bottom of the lib holds the wording, by season and
page kind:

| Season | `listing` | `event` | `schoolBreak` |
| --- | --- | --- | --- |
| fall | Planning the season? | Explore fall in Zionsville | Making plans for fall break? |
| holiday | Planning the season? | Explore Christmas in Zionsville | Making plans for winter break? |
| spring | Planning the season? | Explore spring in Zionsville | Making plans for spring break? |
| summer | Planning the season? | Explore summer in Zionsville | Making plans for summer? |

When guides from two seasons overlap, the first one by priority decides the
label.

---

## Adding the strip to an event page

Put this in the markdown where you want it, usually just after the Quick Facts
block:

```html
<!-- SEASONAL_STRIP -->
```

That is the whole change. No code edit.

**Ended events need no marker.** Once `endDate` has passed, the links move up
into `EventEndedBanner` automatically and the marker placement is skipped, so
a page never shows two seasonal callouts.

---

## Adding a new guide

Add an entry to `SEASONAL_GUIDES` with its window:

```ts
{
  href: '/articles/christmas-zionsville',
  title: 'Christmas in Zionsville',
  blurb: 'Tree lighting, the Christmas parade and holiday shopping.',
  season: 'holiday',
  from: '2026-10-15',
  to: '2026-12-26',
  priority: 40,
},
```

It starts showing on `from` and stops on `to`. Every page carrying the strip
picks it up.

If the season is new, add its row to `SEASON_LABELS` as well. TypeScript will
flag it if you forget.

---

## Adding a new page kind

Two steps:

1. Add the value to `StripKind`
2. Add a line for it in every season's block of `SEASON_LABELS`

TypeScript will flag any season you miss.

---

## What to do every year

**Late summer, before the fall guides should start**

- Bump the `from` and `to` years on every guide in `SEASONAL_GUIDES`
- Check the windows still make sense against the calendar — the fall guides
  currently run September 1 to November 2

**Mid-October**

- Uncomment or add the Christmas guide so it starts on October 15 and overlaps
  the last two weeks of fall

**When an annual event's dates are announced**

- Update `startDate` and `endDate` in that event's frontmatter. The ended
  banner turns off by itself, and the links inside it go with it
- If you want the strip on that page while the event is upcoming, add the
  `<!-- SEASONAL_STRIP -->` marker

**That is the whole cycle.** Nothing else needs turning off, and no page file
needs touching.

---

## Files

| File | What it does |
| --- | --- |
| `lib/seasonal-guides.ts` | Guides, windows, seasons, labels |
| `components/SeasonalGuidesStrip.tsx` | Renders the strip |
| `components/EventEndedBanner.tsx` | Carries the links once an event has ended |
| `app/events/page.tsx` | Listing placement |
| `app/events/[slug]/page.tsx` | Marker handling and the ended check |
| `app/articles/[slug]/page.tsx` | School calendar placement |
| `app/page.tsx` | Homepage placement |

---

## Known gaps

**Article placement.** The strip renders through `ArticleLayout` children,
which puts it at the bottom of the page. Given the site's bounce rate, top
placement would be better. Fixing it means either a `beforeContent` prop on
`ArticleLayout` or using its existing `injectAt` marker pattern.

**Spring and summer windows.** No guides exist for those seasons yet, so the
strip is absent from roughly November 3 to whenever the next window opens.
Pages that rely on it show nothing during that gap.
