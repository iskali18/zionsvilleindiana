# Structured data reference — ZionsvilleIndiana.com

Written September 2026, as a starting point for IndyCentral.com.

---

## What emits where

| Schema | Emitted by | Source |
|---|---|---|
| `Article` | `ArticleLayout.tsx` | Article frontmatter |
| `BreadcrumbList` | `ArticleLayout.tsx` | Derived from `pathPrefix` + slug |
| `FAQPage` | `ArticleLayout.tsx` | `faqs:` frontmatter array |
| `ItemList` | `ArticleLayout.tsx` | `itemList` prop, or `meta.itemList` |
| `Park` | `ArticleLayout.tsx` | `park:` frontmatter block |
| `Event` / `EventSeries` | `buildEventSchema()` in `app/events/[slug]/page.tsx` | Event frontmatter |
| `WebPage` | `buildEventSchema()`, early return | `schemaType: WebPage` |
| `ItemList` of `LocalBusiness` subtypes | Roundup articles | Hand-written in the article |
| `Event` × milestones | `ZcsCalendar.tsx` | District-wide dates in `lib/zcs-calendar.ts` |

All emitted as separate `<script type="application/ld+json">` blocks. Nesting
one inside another is valid but the site does not do it — separate blocks are
easier to read and let a non-article page reuse the same shape.

---

## Article schema

`headline` uses `meta.title` — the H1 a reader sees — **not** `metaTitle`.
The SEO title carries keyword tails that appear nowhere on the page, and
schema should describe what is actually there.

`description` falls back to `metaDescription` when a separate `description`
is absent.

`dateModified` comes from `lastUpdated`.

---

## FAQPage

Built automatically from the `faqs:` array. Nothing to wire per article.

Because the schema is generated from frontmatter, **an FAQ answer that goes
stale ships a stale rich result.** When a fact changes in the body, check
whether an FAQ repeats it.

---

## ItemList — roundups

Added September 2026. Two ways to populate:

**Prop**, when the data already exists in a lib module:

```tsx
<ArticleLayout
  itemListName="Fall farms and orchards near Zionsville and Indianapolis"
  itemList={DESTINATIONS.map((d) => ({
    name: d.name,
    href: `#${d.anchor}`,
    description: d.highlights,
  }))}
/>
```

**Frontmatter**, when the roundup is only markdown:

```yaml
itemListName: "Coffee shops in Zionsville"
itemList:
  - name: RIVET
    href: "#rivet"
    description: "Espresso bar on 106th Street"
```

The prop wins over frontmatter. Rule: if the list exists somewhere already,
pass the prop — never keep a second copy that can drift.

`href` accepts an on-page anchor, a site path, or an absolute URL. The layout
resolves the first two against the article's own URL.

**When to use it:** the page is a list of discrete things. A roundup of
fourteen farms, or of named restaurants. **Not** a single-subject article, and
not a page whose sections are a mix of events, activities and general advice.

Do not add it everywhere it would validate. Schema that describes the page
helps; schema added by reflex dilutes.

---

## Event schema

Optional frontmatter fields, all safe to omit:

| Field | When to set |
|---|---|
| `startDateTime` / `endDateTime` | Only when published clock times exist. ISO with offset — `-04:00` during DST, `-05:00` for EST |
| `eventStatus` | Only for cancelled or postponed. Template defaults to `EventScheduled` |
| `alternateName` | Genuine variants people search, or names the organizer itself uses. Never invented |
| `offer` | Only when a ticket is purchasable at a specific price on a specific URL |
| `addressLocality` / `postalCode` | Out-of-town venues. Defaults to Zionsville / 46077 |
| `schemaType: WebPage` | Season hubs that list several separate events |

### Rules learned the hard way

**`dateModified` is not valid on `Event`.** It is a CreativeWork property.
A visible "Last updated" line on the page is fine; the schema field is not.

**No `AggregateOffer` price ranges.** A single `Offer` matching a real
purchasable ticket, or nothing.

**Omit the whole `offer` block until sales open.** Do not use `PreOrder` and
do not just drop the availability line. `buildEventSchema` emits availability
only when frontmatter states it.

**Season hubs use `schemaType: WebPage`.** A four-week hub claiming to be one
Event competes with the individual event pages for the same rich result. The
Christmas hub hit this — it claimed Nov 27 to Dec 24 while the parade page
claimed one evening inside that window.

**`recurrence` is for one weekday per week.** A Friday-to-Sunday run needs
`occurrences` — an explicit date list. Setting `dayOfWeek` to the last day of
a run advertises the wrong next date.

---

## LocalBusiness subtypes in roundups

Do not over-split. A bagel shop is not a `Bakery`. An açaí place where you
can eat on site is a `Restaurant`. `CafeOrCoffeeShop` is for actual coffee
shops.

---

## Formatting

**JSON-LD uses straight ASCII quotes** — JSON syntax requires it. Article
bodies, headings and frontmatter use curly apostrophes and quotes. The two
rules coexist; do not "fix" one to match the other.

---

## Visible counterparts

Google's guidelines say structured data should describe content a visitor can
see. Two places where that matters:

**`FAQPage`** — Both `ArticleLayout` and the events slug page render `faqs`
through `FaqSection` as well as emitting the schema. Event pages emitted the
schema without rendering anything until September 2026; that gap is closed.

**`ItemList`** — The entries must match what is on the page, in the same order.
Building the list from the same data the page renders is the safest way to keep
that true; the fall farms page does this from `lib/fall-farms.ts`.

---

## Backlog

- `eventSchedule` on recurring events — the schema never states the repeat
  pattern (weekly on Saturdays, 8:00–11:30 AM). Needs a frontmatter field.
- `subEvents` on the Christmas hub — one Event block per sub-event, once
  organizers publish venues and times. Only sub-events with a name, date
  **and** specific location qualify. The parade is excluded; it has its own
  page.
- `ItemList` on `/articles/coffee-shops`, `/articles/downtown-zionsville-restaurants`,
  `/articles/shopping-in-downtown-zionsville`. Wait for Search Console data on
  the fall farms page before adding more.
- `WebApplication` + `FAQPage` on the schedule tools.
- Schema backlog from earlier audits: LocalBusiness subtypes,
  `containedInPlace`, `geo`, `eventAttendanceMode`, `ParkingFacility`.

---

## What transfers to IndyCentral

The event model transfers almost wholesale — same fields, same rules about
offers, datetimes and hubs. A regional events site will lean on it harder
than Zionsville does.

Two things need rethinking rather than copying:

**Geographic defaults.** `addressLocality` and `postalCode` default to
Zionsville. A metro-wide site has no sensible default, so those become
required rather than optional.

**The scope rule inverts.** Zionsville pages cover Zionsville only, on
purpose. IndyCentral is the page that mixes towns — so the discipline moves
from *excluding* neighbouring towns to *labelling* which town each thing is
in, the way the farms guide groups by county and states a drive time.
