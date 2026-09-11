# Frontmatter standard

Site-wide reference for `content/` on ZionsvilleIndiana.com. Covers events,
articles, parks, and businesses.

Drafted from `types/index.ts`, `app/events/[slug]/page.tsx`,
`app/articles/[slug]/page.tsx`, and `components/ArticleLayout.tsx`.

Park and business templates have not been reviewed yet. Those two sections
describe the type definitions, not confirmed template behavior.

---

## Part 1 — Rules that apply everywhere

### The four title and description fields

There are two titles and two descriptions. They are not duplicates. Each one
lands somewhere different.

| Field | Where it ends up | Who reads it |
| --- | --- | --- |
| `title` / `name` | The H1 at the top of the page | A person already on the page |
| `metaTitle` | The `<title>` tag | The blue link in Google, and the browser tab |
| `metaDescription` | `<meta name="description">` | The snippet under the blue link |
| `description` | JSON-LD schema `description` | Google's rich result |

How to write each one:

- **`title`** is short and plain. The reader already knows what page they are
  on. No year on event titles — the date sits directly above.
- **`metaTitle`** carries the year, the town, and the words people type. The
  reader has not clicked yet and is choosing between ten results.
- **`metaDescription`** is the pitch. Date and place first, then two or three
  specifics worth clicking for.
- **`description`** is one complete sentence that stands on its own. A machine
  reads it with no page around it.

**There is no `seoTitle`.** HTML has one title tag and `metaTitle` is it.
`seoTitle` names a goal; `metaTitle` names the output. All four content types
use `metaTitle` as of September 2026.

### Length targets

| Field | Target | Hard limit |
| --- | --- | --- |
| `metaTitle` | 50–60 characters | 60 |
| `metaDescription` | 140–155 characters | 155 |
| `description` | one sentence | — |

Google truncates past those limits. Over-length loses the tail; well under
wastes the space.

Every `metaTitle` should contain "Zionsville" unless the page name already does.

**There is no title template.** `app/layout.tsx` used to append
" | Zionsville Indiana" to every page, which pushed most rendered titles past
60 characters and said "Zionsville" twice in one line. That was removed in
September 2026, so a `metaTitle` now renders exactly as written. Do not add the
template back without shortening 45 titles first.

### Checking them

`scripts/audit-meta.mjs` reads every file under `content/` and reports the ones
outside the targets.

```powershell
node scripts/audit-meta.mjs            # only files with problems
node scripts/audit-meta.mjs --all      # every file
node scripts/audit-meta.mjs --future   # skip events whose date has passed
```

Output is tab-separated, so it pastes into a spreadsheet. `--future` is usually
what you want — a past event's long title can wait until its season comes round.

The script also catches a missing `metaTitle` or `metaDescription`, which is how
the business pages' `seo_title` field was found in September 2026.

### Quoting

Quote every free-text value and every date. Leave these bare: booleans,
enum values (`eventType`, `schemaType`), image paths, and the items inside
`tags` and `alternateName` lists.

Quoting is required, not optional, in these cases:

- Any date or datetime, or YAML converts it to a Date object rather than a
  string. Templates do string math on these values.
- Any value containing `:`, `&`, `#`, `'`, or `"`.
- Any value starting with a digit.

### Blank values

**If a field has no value, delete the line.** Do not leave it blank.

Blank is not the same as absent. Fields that fall back to a default use `??`,
which treats `null` and `undefined` as missing but accepts an empty string as a
real answer:

| Field | Omitted | Left blank |
| --- | --- | --- |
| `hero_position` | falls back to `center 55%` | recenters the crop to 50% |
| `addressLocality` | falls back to `Zionsville` | empty locality in the schema |
| `postalCode` | falls back to `46077` | empty ZIP in the schema |
| `eventStatus` | falls back to `EventScheduled` | builds the URL `https://schema.org/` |

Empty arrays and empty objects have the same problem, because both are truthy:

- `alternateName: []` passes the guard and emits an empty array.
- `offer: {}` passes the guard and emits an Offer with no price and no URL.

Fields behind a plain truthiness check — `photoCredit`, `externalUrl`,
`recurrenceLabel`, `lastUpdated`, `mapEmbedUrl` — are unharmed by a blank. The
rule still applies. One rule with no exceptions is easier to follow than four.

**Required fields are different.** An empty string satisfies TypeScript, so the
build passes and the page ships with an empty alt or an empty schema
description. Those need a real value rather than a deletion.

### Dates

All dates are quoted `YYYY-MM-DD`. Datetimes are full ISO with a timezone
offset: `-04:00` for daylight time (March to November), `-05:00` for standard
time.

### `lastUpdated`

Bump it on any content change, not just major ones. Use the current date —
check it rather than assuming, since a session can run past midnight.

Where a page also shows a visible “Updated” date in the body — the fall farms
callout, for example — that date and the frontmatter value must agree. A
reader sees one and Google reads the other.

### Typography

Curly apostrophes and quotes ( ' " " ) in prose values. Straight ASCII inside
JSON-LD.

### Images

Root-relative paths. WebP. Every image field needs its matching alt field
filled with a description of the photo, not a repeat of the page title.

---

## Part 2 — Events

`content/events/*.md` → `EventMeta`

### Key order

Grouped so a file reads: what it is → how it is found → when → where → links →
images → display → upkeep → questions.

```yaml
# Identity
title:
alternateName:

# Search
description:
metaTitle:
metaDescription:

# Type
eventType:
schemaType:

# Dates
startDate:
endDate:
startDateTime:
endDateTime:
occurrences:
recurrence:
recurrenceLabel:
inSeasonMessage:
eventStatus:

# Place
location:
address:
addressLocality:
postalCode:

# Links and tickets
externalUrl:
offer:

# Map
mapEmbedUrl:
mapTitle:

# Images
image:
imageAlt:
hero_position:
photoCredit:
photoCreditHeroOnly:

# Display
featured:
tags:

# Upkeep
lastUpdated:

# Questions
faqs:
```

`slug` comes from the filename and never appears in frontmatter.

### Required

`title`, `description`, `eventType`, `startDate`, `location`, `address`,
`image`, `imageAlt`, `tags`, `metaTitle`, `metaDescription`.

Plus `featured: true` on every event page. Events set to `false` do not appear
on the events hub.

### Field rules

**`title`** — Bare event name. No year.

**`alternateName`** — Real spelling variants people search, plus alternate names
the organizer publishes. Never invented. Flow array. Emitted into the schema.

**`eventType`** — `annual`, `recurring`, or `oneoff`. `recurring` produces
`EventSeries` schema; the other two produce `Event`.

**`schemaType`** — Only ever `WebPage`, and only on season hub pages that list
several separate events. Omit everywhere else.

**`startDate` / `endDate`** — Keep both even when datetime fields are present.
`EventEndedBanner` and `formatEventDate` read them.

**`startDateTime` / `endDateTime`** — Only when the organizer publishes clock
times.

**Choosing between `occurrences` and `recurrence`.** Use `recurrence` only when
the event happens on **one weekday** each week, all season — a Saturday market,
a Wednesday concert. Everything else uses `occurrences`.

That includes any event running several days in a row. `dayOfWeek` accepts
exactly one value, so a Friday-to-Sunday run can only name one of its three
days, and the other two vanish from the schema. A three-weekend tour listed as
`dayOfWeek: sunday` will tell Google the next date is Sunday even when Friday
and Saturday of that same weekend are still ahead.

**`occurrences`** — Quoted `YYYY-MM-DD` dates, one per line, for every day the
event actually happens. Use it for scattered dates, monthly patterns, and any
multi-day run. Takes precedence over `recurrence`. Both the hub and the event
page roll `startDate`, `startDateTime`, and `endDateTime` forward to the next
listed date, and past dates drop off on their own, so the list can cover the
whole season from the start.

**`recurrence`** — Weekly patterns only, one weekday. `dayOfWeek` accepts
exactly one day; if the event needs more than one, it is not a `recurrence`
event.

**`recurrenceLabel`** — Free text that replaces the formatted date everywhere it
appears. Use it when the real pattern cannot be read off `startDate`.

**`inSeasonMessage`** — Banner shown only while today falls inside the date
range. Write it so it does not go stale partway through the run.

**`eventStatus`** — Omit. The template defaults to `EventScheduled`. Set it only
for a cancelled or postponed event.

**`location`** — Venue name. Shown in the hero, the info strip, and the schema
`Place` name.

**`address`** — **Street line only.** No city, no state, no ZIP. The template
assembles the full `PostalAddress` and fills in Zionsville, IN, 46077.

**`addressLocality`** / **`postalCode`** — Only for venues outside Zionsville.

**`area`** — Do not use on event pages. It is read only by the business
template, where it selects a stock parking blurb. Event pages carry
hand-written parking prose in the body instead, because parking changes per
event — lots close, fees apply on some days — and a stock blurb cannot say
that.

**`externalUrl`** — The organizer's page. Shown as a "More info" row.

**`offer`** — Only when a ticket is purchasable right now at a stated price on a
stated URL. Omit the whole block until sales open. When sales are live, include
`availability: "InStock"` explicitly.

**`mapEmbedUrl`** / **`mapTitle`** — Google MyMaps embed. When set, the template
renders a "Parking & nearby restaurants" section below the body. `mapTitle`
falls back to `{title} map`.

**`hero_position`** — Omit when it would be `center 55%`.

**`photoCredit`** — Omit the key when there is no credit.

**`tags`** — Filter facets. Three to six per event, lowercase, flow array,
drawn only from the list below. Not rendered on the page; the field exists so
tag filtering can be built on the events hub.

Adding a term to the list is a deliberate decision, not something that happens
while writing a page. A term earns a place when at least three events would
carry it.

| Facet | Terms |
| --- | --- |
| Who | `family`, `kids`, `adults` |
| Cost | `free`, `ticketed` |
| Season | `spring`, `summer`, `fall`, `winter`, `holiday` |
| Type | `festival`, `music`, `market`, `shopping`, `food`, `race`, `parade`, `tour`, `sports`, `cars`, `arts`, `history`, `movies`, `civic` |
| Setting | `outdoor`, `indoor` |

Never tag anything that another field already carries:

| Do not tag | Already in |
| --- | --- |
| `annual`, `recurring`, `weekly`, `seasonal` | `eventType` |
| `downtown`, `village` | the venue name and address |
| `october`, `fourth-of-july`, `christmas` | `startDate` |
| `5k`, `half-marathon` | `title` |

Also avoid terms that fit nearly every event. `community` was dropped for this
reason — a facet that never narrows the list is not a facet.

Merges applied when the vocabulary was locked:

| Keep | Absorbs |
| --- | --- |
| `music` | concert, bands |
| `race` | running, biking, 5k, half-marathon |
| `market` | artisan |
| `food` | breakfast |
| `history` | historic |
| `cars` | automotive |
| `sports` | football |
| `tour` | walking-tour |
| `arts` | art, fashion, design |
| `holiday` | christmas, halloween |
| `festival` | carnival |

**`lastUpdated`** — The date the details were last checked against a source. On
`schemaType: WebPage` pages it is emitted as `dateModified`.

**`faqs`** — Six to ten q/a pairs, emitted as `FAQPage` schema. Each answer
stands on its own without the page around it. Front-load date, price, and
location.

### Skeleton

```yaml
---
title: "Event Name"
alternateName: ["Variant One", "Variant Two"]
description: "One plain sentence describing the event."
metaTitle: "Event Name 2026 | Zionsville Hook"
metaDescription: "Event Name is Month D, 2026, at Venue in Zionsville. Two or three specifics that answer what someone wants to know."
eventType: annual
startDate: "2026-10-24"
endDate: "2026-10-24"
startDateTime: "2026-10-24T09:00:00-04:00"
endDateTime: "2026-10-24T12:00:00-04:00"
location: "Venue Name"
address: "123 Main Street"
externalUrl: "https://example.org/event"
image: /images/events/event-name.webp
imageAlt: "Description of the hero photo."
photoCredit: "© ZionsvilleIndiana.com"
featured: true
tags: [family, fall, outdoor]
lastUpdated: "2026-08-25"
faqs:
  - q: "When is Event Name 2026?"
    a: "…"
---
```

---

## Part 3 — Articles

`content/articles/*.md` → `ArticleMeta`

**This section describes the target state after the rename.** Today the type
uses `seoTitle` for the title tag and overloads `description` to serve as both
the meta description and the schema description.

### Key order

```yaml
# Identity
title:

# Search
metaTitle:
metaDescription:
description:

# Hub placement
category:
hubOrder:
draft:

# Hero
hero_image:
hero_credit:
hero_position:
hide_hero:

# Layout
print_hide_body:
ctas:

# Structured data
park:
itemListName:
itemList:

# Upkeep
lastUpdated:

# Questions
faqs:
```

### Required

`title`, `metaTitle`, `metaDescription`.

### Field rules

**`title`** — The H1. Also used for breadcrumbs and, currently, as the hero
image alt text.

**`description`** — Optional after the rename. When absent, `ArticleLayout`
falls back to `metaDescription` for the schema. Add real values one article at a
time.

**`category`** — One of `discovery`, `relocation`, `outdoors`, `food`, `family`.

**`hubOrder`** — Display order on `/articles`, numbered in tens so a new article
can be slotted between two existing ones. Articles without it sort last, most
recently updated first.

**`draft`** — When true, hides the article from the hub. The direct URL still
resolves for preview.

**`hero_image`** — Optional. When absent, or when `hide_hero` is true, the
template falls back to a plain breadcrumb and H1.

**`hero_position`** — Omit when it would be `center 55%`.

**`park`** — Park data for park-subject articles. Emits a `Park` schema
alongside the `Article` schema.

**`ctas`** — Link list rendered at the foot of the article.

**`lastUpdated`** — Rendered visibly as "Last updated: Month D, YYYY" and
emitted as `dateModified`.

---

**`itemList` / `itemListName`** — Emit ItemList structured data for a page that
is a list of things: a roundup of events, a comparison of destinations. Google
can show these as a carousel.

```yaml
itemListName: "Zionsville trick-or-treat and trunk-or-treat events 2026"
itemList:
  - name: "Trick or Trees"
    href: "/events/trick-or-trees"
    description: "Saturday, October 24, 9 a.m.–noon at Elm Street Green."
  - name: "Eagle Church Trunk or Treat"
    href: "#eagle-church-trunk-or-treat"
    description: "Saturday, October 24, 4–6 p.m. Pumpkin decorating and hayrides."
```

`href` takes a site path, an on-page anchor, or an absolute URL. Omit it for an
entry with nowhere to point. `ArticleLayout` resolves anchors and site paths to
absolute URLs in the emitted schema.

**Order the entries as they appear on the page.** The schema claims to describe
the page; a different order contradicts it.

**Where it can come from code instead.** The fall farms page builds its
`itemList` in `app/articles/[slug]/page.tsx` from `lib/fall-farms.ts`, so the
schema cannot drift from the comparison table. Prefer that when the page
already has a data source.

## Part 4 — Parks

`content/parks/*.md` → `ParkMeta`

Template not yet reviewed. Field order below follows the type definition.

### Key order

```yaml
name:
parkType:
signNumber:
description:
metaTitle:
metaDescription:
address:
lat:
lng:
difficulty:
trailLength:
surface:
amenities:
image:
imageAlt:
hero_position:
internalUrl:
townUrl:
dogParkUrl:
externalUrl:
nearbyBusinesses:
nearbyParks:
comingSoon:
```

### Required

`name`, `parkType`, `address`, `amenities`, `metaTitle`, `metaDescription`.

### Notes

**`address`** — Street only. City, state, and ZIP are added by the template.

**`amenities`** — IDs from the shared taxonomy in `lib/parks.ts`, not display
strings. The template resolves each ID to a label.

**`externalUrl`** — Legacy. Prefer `townUrl`.

---

## Part 5 — Businesses

`content/businesses/*.md` → `BusinessMeta`

Template not yet reviewed. Field order below follows the type definition.

### Key order

```yaml
name:
category:
description:
shortDescription:
metaTitle:
metaDescription:
address:
phone:
website:
googleMapsUrl:
image:
imageAlt:
galleryAlt:
area:
nearbyParks:
lastVerified:
faqs:
```

### Required

`name`, `category`, `description`, `address`, `lastVerified`, `metaTitle`,
`metaDescription`.

### Notes

**`googleMapsUrl`** — Links to the Business Profile so hours stay live rather
than hardcoded.

**`galleryAlt`** — Index-matched to `zionsville-{slug}-1.jpg`, `-2.jpg`, and so
on.

**`lastVerified`** — The date the listing was manually checked. Businesses use
this name; every other type uses `lastUpdated`.

---

## Part 6 — Known inconsistencies

Open items, roughly by size.

**`seo_title` — DONE, September 2026.** All four content types now use
`metaTitle`. The 24 business files were renamed, `BusinessMeta.seo_title` was
removed from `types/index.ts`, and `app/businesses/[slug]/page.tsx` no longer
falls back.

| Type | Title tag | Meta description |
| --- | --- | --- |
| Event | `metaTitle` | `metaDescription` |
| Park | `metaTitle` | `metaDescription` |
| Article | `metaTitle` | `metaDescription` |
| Business | `metaTitle` | `metaDescription` |

**Business title lengths.** 11 of the 24 run past 60 characters, all following
the same "Name | Description in Zionsville, Indiana" shape. Worth one pass with
a shorter pattern rather than fixing them individually.

**Article descriptions.** `ArticleMeta.description` feeds both the meta tag and
the schema. Splitting it into `metaDescription` plus an optional `description`
matches the other three types.

**Types claim fields no file has.** `BusinessMeta` declares `description` and
`metaTitle` as required, but no business file defines either. `gray-matter`
returns untyped data that is cast to the interface, so TypeScript never checks
this. Required in a type means intent, not a guarantee.

**Business titles run long.** Several exceed 60 characters — Fivethirty Home is
74, Angelo's is 67, Black Dog Books is 64. A content pass, separate from the
rename.

**`hero_image` vs `image`.** Articles use `hero_image` and `hero_credit`.
Events, parks, and businesses use `image` and `photoCredit`. Renaming touches
rendering, not just metadata, so it is a separate job from the title work.

**Articles have no alt field.** `ArticleLayout` passes `alt={meta.title}` for
the hero image, so the alt text is the article title rather than a description
of the photo. Adding `imageAlt` to `ArticleMeta` would match the other types.

**`area` is business-only.** The one consumer is
`app/businesses/[slug]/page.tsx:84`, which maps it to `parkingBlurbs`. Six event
files set it and nothing reads it there. Event pages write their own parking
prose because parking varies per event, so a stock blurb would be wrong.
Delete `area` from event files and drop `area?` from `EventMeta`.

**`lastVerified` vs `lastUpdated`.** Businesses use the first name, everything
else uses the second.

**Open Graph gaps on events.** The article template sets `openGraph.type` and
`openGraph.url`. The event template sets neither.

**`photoCreditHeroOnly` is live.** Read by `app/events/page.tsx` to control
whether the credit shows on the hub card. Keep it.

**`perennial` and friends.** Still read twice in the event template — in
`formatEventDate` and in the `externalUrl` condition. Not dead code.
