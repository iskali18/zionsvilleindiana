# Event frontmatter standard

Reference for `content/events/*.md`. Drafted from `types/index.ts` (`EventMeta`)
and `app/events/[slug]/page.tsx`.

---

## Canonical key order

Fields are grouped so a file reads top to bottom as: what it is → how it is
found → when → where → links → images → display → upkeep → questions.

Omit any key that does not apply. Do not reorder.

```yaml
# 1. Identity
title:
alternateName:

# 2. Search
description:
metaTitle:
metaDescription:

# 3. Type
eventType:
schemaType:

# 4. Dates
startDate:
endDate:
startDateTime:
endDateTime:
occurrences:
recurrence:
recurrenceLabel:
inSeasonMessage:
eventStatus:

# 5. Place
location:
address:
addressLocality:
postalCode:
area:

# 6. Links and tickets
externalUrl:
offer:

# 7. Map
mapEmbedUrl:
mapTitle:

# 8. Images
image:
imageAlt:
hero_position:
photoCredit:
photoCreditHeroOnly:

# 9. Display
featured:
tags:

# 10. Upkeep
lastUpdated:

# 11. Questions (last — it is the only multi-line block)
faqs:
```

`slug` is in the type but never in frontmatter. It comes from the filename.

---

## Required on every file

`title`, `description`, `eventType`, `startDate`, `location`, `address`,
`image`, `imageAlt`, `tags`, `metaTitle`, `metaDescription`.

Also `featured: true` on every event page. Events set to `false` do not appear
on the events hub.

---

## The four title and description fields

There are two titles and two descriptions, and they are not duplicates. Each
one lands somewhere different.

| Field | Where it ends up | Who reads it |
| --- | --- | --- |
| `title` | The H1 at the top of the page | A person already on the page |
| `metaTitle` | The `<title>` tag | The blue link in Google, and the browser tab |
| `description` | JSON-LD schema `description` | Google's event rich result |
| `metaDescription` | `<meta name="description">` | The snippet under the blue link |

How to write each one:

- **`title`** is short and plain, because the reader already knows what page
  they are on. No year. The date sits right above it.
- **`metaTitle`** carries the year, the town, and the words people type. The
  reader has not clicked yet and is choosing between ten results.
- **`description`** is one complete sentence that stands on its own. It is read
  by a machine with no page around it.
- **`metaDescription`** is the pitch. Date and place first, then two or three
  specifics worth clicking for.

There is no `seoTitle` on event pages. HTML has one title tag, and `metaTitle`
is it. Some files still carry a `seoTitle` key left over from the article
format; it is never read here and should be deleted.

---

## Field rules

### Identity

**`title`** — The bare event name. No year. The card already shows the date
above the title, and the year belongs in `metaTitle`. Quote it.

**`alternateName`** — Real spelling variants people search, plus alternate names
the organizer publishes. Never invented. Flow array on one line. Emitted into
the schema.

### Search

**`description`** — One plain sentence. This is schema-facing: it becomes the
Event `description` in JSON-LD. It is not the meta description and should not
repeat it word for word.

**`metaTitle`** — The real `<title>` tag. Keep it at or under 60 characters.

Format: `{Event name} {year} | {what someone wants to know}`

Include "Zionsville" unless the event name already contains it. Lead with the
words people actually type.

**`metaDescription`** — 140 to 155 characters. Open with the date and the place,
then name two or three specifics.

**`seoTitle`** — Not read on event pages. Delete it where it appears, and do not
add it to new files. `metaTitle` is the title tag. Articles currently use
`seoTitle` for the same job and are being migrated to `metaTitle` separately.

### Type

**`eventType`** — `annual`, `recurring`, or `oneoff`. `recurring` produces
`EventSeries` schema; the other two produce `Event`.

**`schemaType`** — Only ever `WebPage`, and only on season hub pages that list
several separate events. Omit everywhere else.

### Dates

**Quote every date.** Unquoted, YAML parses `2026-09-11` into a Date object
rather than a string, and the template does string math on these values.

**`startDate` / `endDate`** — `YYYY-MM-DD`. Keep both even when datetime fields
are present; `EventEndedBanner` and `formatEventDate` read them.

**`startDateTime` / `endDateTime`** — Full ISO with offset. Only when the
organizer publishes clock times. Use `-04:00` for daylight time (March to
November) and `-05:00` for standard time.

**`occurrences`** — Quoted `YYYY-MM-DD` strings for scattered or monthly dates.
Takes precedence over `recurrence`. The template rolls `startDate`,
`startDateTime`, and `endDateTime` forward to the next listed date on its own.

**`recurrence`** — Weekly patterns only. `dayOfWeek` accepts exactly one day.
For a run across several days, name the last day of the run.

**`recurrenceLabel`** — Free text that replaces the formatted date everywhere it
appears. Use it when the real pattern cannot be read off `startDate`.

**`inSeasonMessage`** — Banner text shown only while today falls inside the
date range. Write it so it does not go stale partway through the run.

**`eventStatus`** — Omit. The template already defaults to `EventScheduled`.
Set it only for a cancelled or postponed event.

### Place

**`location`** — Venue name. Shown in the hero, in the info strip, and as the
schema `Place` name.

**`address`** — **Street line only.** No city, no state, no ZIP. The template
assembles the full `PostalAddress` and fills in Zionsville, IN, 46077.

**`addressLocality`** / **`postalCode`** — Only for venues outside Zionsville.
Setting them to `Zionsville` and `46077` restates the defaults.

**`area`** — Only `downtown`, and only for downtown venues. It drives the
parking blurbs.

### Links and tickets

**`externalUrl`** — The organizer's page. Shown as a "More info" row in the info
strip.

**`offer`** — Only when a ticket is purchasable right now at a stated price on a
stated URL. Omit the whole block until sales open. When sales are live, include
`availability: "InStock"` explicitly.

### Map

**`mapEmbedUrl`** / **`mapTitle`** — Google MyMaps embed. When set, the template
renders a "Parking & nearby restaurants" section below the body. `mapTitle` is
the iframe title and falls back to `{title} map`.

### Images

**`image`** — Root-relative path under `/images/events/`. WebP.

**`imageAlt`** — Required. Describes the hero photo.

**`hero_position`** — Omit when it would be `center 55%`. That is the default.

**`photoCredit`** — Omit the key when there is no credit. An empty string does
nothing.

**`photoCreditHeroOnly`** — Not read by the event template. Grep before adding
or removing it.

### Display

**`featured`** — Always `true`.

**`tags`** — Rendered as pills at the bottom of the page, auto-capitalized.
Three to six, lowercase, flow array.

Do not repeat `eventType` as a tag. `annual` and `recurring` are already in a
field of their own.

### Upkeep

**`lastUpdated`** — Quoted `YYYY-MM-DD`. The date the details were last checked
against a source. On `schemaType: WebPage` pages it is emitted as
`dateModified`.

Bump it on any content change, not just major ones. Check the current date
rather than assuming — a session can run past midnight.

Where a page also shows a visible “Updated” date in the body, that date and
the frontmatter value must agree.

### Questions

**`faqs`** — Six to ten q/a pairs. Emitted as `FAQPage` schema **and rendered
on the page** by `FaqSection`, below the body. Each answer should stand on its
own without the page around it. Front-load the date, price, and location
questions.

---

## Body markers

Two HTML comments in the markdown body switch on page features. Neither is
frontmatter, but both belong to the same file.

**`<!-- SEASONAL_STRIP -->`** — Renders the seasonal guides strip at that
point, usually just after Quick Facts. Once `endDate` has passed the links move
up into `EventEndedBanner` instead and this placement is skipped, so a page
never shows two seasonal callouts. See `docs/seasonal-guides.md`.

**`<!-- CHRISTMAS_EVENT_TABLE -->`** — Renders the filterable Christmas event
table. Specific to `christmas-in-zionsville`.

---

## Quoting

Quote every string value. One rule beats three exceptions.

Required, not optional, in these cases:

- Any date or datetime, or YAML converts it to a Date object.
- Any value containing `:`, `&`, `#`, `'`, or `"`.
- Any value starting with a digit.

---

## Blank values

**If a field has no value, delete the line.** Do not leave it blank.

Blank is not the same as absent. Several fields fall back to a default using
`??`, which treats `null` and `undefined` as missing but accepts an empty string
as a real answer:

| Field | Omitted | Left blank |
| --- | --- | --- |
| `hero_position` | falls back to `center 55%` | recenters the crop to 50% |
| `addressLocality` | falls back to `Zionsville` | empty locality in the schema |
| `postalCode` | falls back to `46077` | empty ZIP in the schema |
| `eventStatus` | falls back to `EventScheduled` | builds the URL `https://schema.org/` |

Empty arrays and empty objects have the same problem, because both are truthy:

- `alternateName: []` passes the guard and emits an empty array.
- `offer: {}` passes the guard and emits an Offer with no price and no URL.

The rest — `photoCredit`, `externalUrl`, `recurrenceLabel`, `lastUpdated`,
`mapEmbedUrl` — sit behind a plain truthiness check, so blank is harmless there.
The rule still applies to them. One rule with no exceptions is easier to follow
than four.

**The required fields are different.** `description`, `imageAlt`, `location`,
`address`, `image`, `metaTitle`, and `metaDescription` are typed as required
strings. An empty string satisfies TypeScript and the build passes, so these
need a real value rather than a deletion.

---

## Typography

Curly apostrophes and quotes ( ’ “ ” ) in all prose values. Straight ASCII in
JSON-LD only.

---

## Skeleton for a new event page

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
area: downtown
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
