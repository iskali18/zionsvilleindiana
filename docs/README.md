# Documentation

Reference for how the site's systems work and what to do each year. Written for
future-you, who will have forgotten.

---

## Start here

| Doc | Read it when |
| --- | --- |
| [frontmatter.md](frontmatter.md) | Creating or editing any content file |
| [event-frontmatter.md](event-frontmatter.md) | Working on an event page specifically |
| [schema-reference.md](schema-reference.md) | Adding structured data, or wondering what already emits |
| [seasonal-guides.md](seasonal-guides.md) | Changing the seasonal links strip, or it is a new season |
| [fall-farms.md](fall-farms.md) | Updating the farms guide or rebuilding its PDF |

---

## What each one covers

### `frontmatter.md`

Site-wide reference for everything in `content/` — events, articles, parks and
businesses. Canonical key order for each type, which fields are required, what
each one does, and the rules that apply everywhere: the four title and
description fields and where each lands, length targets, quoting, dates,
typography, `lastUpdated`.

**Overlaps with `event-frontmatter.md`.** This one covers all four content
types at moderate depth; that one covers events alone in more depth.

### `event-frontmatter.md`

Events in detail. Every field with its rules, the schema each one feeds, a
skeleton to copy for a new event page, and the two body markers that switch on
page features — `<!-- SEASONAL_STRIP -->` and `<!-- CHRISTMAS_EVENT_TABLE -->`.

### `schema-reference.md`

What structured data the site emits, from where, and from what source. Rules
settled through trial and error: `dateModified` is not valid on `Event`, season
hubs use `schemaType: WebPage` so they do not compete with individual event
pages, no `AggregateOffer`, omit the offer block until sales open. Also the
schema backlog.

### `seasonal-guides.md`

The band of seasonal guide links that appears on the events page, event pages
and the school calendar. How the date windows work, the four placements, the
label system, how to add a guide or a page kind, and the annual cycle.

**The short version:** edit `lib/seasonal-guides.ts` and nothing else.

### `fall-farms.md`

The fall farms guide, its comparison table and its printable PDF, all reading
from `lib/fall-farms.ts`. Schedule statuses, the parity rules between the
article and the lib, the PDF build commands, two quirks in the build script
that will bite you, and the annual cycle.

---

## Conventions across all of these

**One source of truth.** Where a page has a data file — `lib/fall-farms.ts`,
`lib/seasonal-guides.ts`, `lib/christmas-events.ts` — that file is authoritative
and the page reads from it. Nothing about a destination or a guide should live
in two places.

**Honest status over convenient defaults.** `not_posted` means the organizer
has not published something. It never means closed, and no tool should treat it
that way.

**Time-relative claims need a month anchor.** "As of early September" rather
than "currently." Someone reading in October should be able to tell how stale
it is.

**`lastUpdated` gets bumped on any content change**, and where a page shows a
visible "Updated" date in the body, the two must agree.

---

## Not yet documented

- The Christmas event table and `lib/christmas-events.ts`
- The ZCS calendar and schedule tools
- The downtown and parks templates
