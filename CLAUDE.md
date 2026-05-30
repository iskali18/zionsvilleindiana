# CLAUDE.md — ZionsvilleIndiana.com

Project rules and conventions. Read at the start of every Claude Code session.

---

## Project overview

**ZionsvilleIndiana.com** — a community guide to events, businesses, and life in Zionsville, Indiana. Solo-developed by Cy.

**Tech stack**
- Next.js 15 + TypeScript + Tailwind + Vercel
- Single branch: `main` → production
- Local path: `C:\Websites\zionsvilleindiana`
- Content: markdown + YAML frontmatter (gray-matter + remark + rehype)
- Google Calendar API server-side, hourly revalidate
- GA4: G-25FXRPT58S (account: zville.indiana@gmail.com)

**Fonts** (loaded in `app/layout.tsx` via `next/font/google`)
- **Display:** Lora (headings, `font-display`)
- **Body:** Plus Jakarta Sans, weight 500 default (`font-sans font-medium` on body)
- **Mono:** JetBrains Mono, weights 500/600 (`font-mono`, used in info strips)

**Color palette** (defined in `tailwind.config.ts`)
- `brick` (warm orange-red, primary accent — buttons, links)
- `village` (green, secondary accent)
- `stone` (neutrals — backgrounds, borders, text)

---

## Voice rules (apply to ALL page and content copy)

### Banned phrases — grep before sending
- "works well," "fits well," "good fit," "natural fit"
- "pairs with / pairs well," "naturally"
- "most popular," "most visited," "best-known," "most distinctive"
- "favorite"
- "round out," "come back to most"
- "family-friendly" (subjective ranking)
- "perfect"
- "stay awhile"
- "well-suited"

No subjective rankings. No marketing copy. No assumptions about who visits or why. State facts, not opinions about what's important.

### Word choice
- **"Many"** not "most" (when "most" is unsourced)
- **"High"** not "max" or superlatives
- No tildes — use "about"
- No unsourced history

### Event MD voice
Informational and concise, NOT bloggy. Allowed: second-person "you," factual statements, simple verbs (runs, opens, hosts, takes place, returns). Banned: marketing puff, filler (simply, just), anecdotal framing, exclamation points.

Use **"kids' area"** not "children's area."

---

## Critical rules

### Link rule (CRITICAL)
**NEVER write about a business/location without verifying via web_fetch first.**

- Verified facts: Zionsville Golf Course is 9-hole par 36 (zionsvillenational.com)
- RIVET Coffee Bar is **all caps**
- Big-4 Rail Trail uses a **hyphen**
- For spas: list 2–3 services only (massages, facials, body treatments); skip injectables, hair removal, nails, waxing

### URL rule (CRITICAL)
**NEVER put a URL in content unless the user provided it exactly or it was verified via web_fetch.**
- Don't construct Facebook URLs from handles
- Don't assume social media profiles exist
- If uncertain, use plain text or ask

### Layout rule (sitewide)
**NO horizontal text cards.** Cy hates them — busy, hard to scan. Use vertical/stacked rows or definition lists. Applies to event info strips, business info strips, anything info-tile.

### Page width rule
**Always `max-w-4xl mx-auto` on main wrapper.** Never inner width constraints.

---

## Process rules

1. **For multi-file edits, propose the plan in prose first and wait for confirmation** before writing files. Avoid rapid-iteration rewrites that re-edit the same page multiple times.

2. **Cy has years of experience with image editing/design and web work.** Skip common-sense caveats about basics (file formats, color spaces, image rights, accessibility 101, "test on mobile," etc.). Trust Cy's expertise; only flag advice if asked or if it's truly non-obvious.

3. **Concise responses.** Ranked lists: 1–2 sentences per item.

4. **If a file is needed, ask for it.** Don't guess at file contents or invent file structures.

5. **Always grep for banned phrases** before presenting final copy.

---

## File structure

```
app/
  page.tsx                          # homepage
  layout.tsx                        # root layout (only layout.tsx — DO NOT create more)
  globals.css                       # sitewide CSS (H2/H3 sizes, prose-village)
  about/page.tsx
  businesses/
    page.tsx                        # directory
    [slug]/page.tsx                 # individual business
  events/
    page.tsx                        # events index
    [slug]/page.tsx                 # individual event
  downtown/
    page.tsx
    dining/page.tsx
    shopping/page.tsx
  things-to-do/page.tsx             # standalone article (leave alone, indexed)
  parks/...
  disclaimer/page.tsx
  privacy/page.tsx
  sitemap.ts

content/
  businesses/                       # business MDs (15+)
  events/                           # event MDs
  parks/                            # park MDs
  articles/                         # article MDs (things-to-do.md here)

components/
  layout/Header.tsx
  layout/Footer.tsx
  ui/Breadcrumb.tsx
  ArticleLayout.tsx                 # used by article routes
  # (other shared components)

lib/
  content.ts                        # MD parsing, getAll/get helpers, rehype-external-links
  calendar.ts                       # Google Calendar API
  parking.ts                        # parking blurbs by area

public/
  images/
    businesses/                     # zionsville-{slug}-{1..4}.jpg
    events/                         # event hero images
    events/gallery/                 # event body gallery images
    downtown/                       # downtown page images
    parks/

types/
  index.ts                          # all TS types (EventMeta, BusinessMeta, etc.)
```

**Important file rules:**
- **ONLY** `app/layout.tsx` should have `<html><body>` tags. Never create sub-route layouts with these. (Hydration errors result from duplicate `<html>` tags.)
- `content/articles/things-to-do.md` exists but is served by `app/things-to-do/page.tsx` (its own route, NOT `/articles/[slug]`). Leave the URL alone — it's indexed.

---

## Frontmatter conventions

### Business MD
```yaml
name: "Business Name"
slug: business-slug
category: dining | coffee | shopping | boutique | services | entertainment | lodging
area: "downtown"                    # drives auto-rendered parking section
shortDescription: "Brief one-line summary."
seo_title: "Business Name | Category in Zionsville, IN"
metaDescription: "..." (under 160 chars)
address: "Street, Zionsville, IN 46077"
phone: "(317) 555-5555"
website: "https://..."
googleMapsUrl: "https://maps.app.goo.gl/..."   # renders "Hours → View on Google Maps" in info strip
lastVerified: "YYYY-MM-DD"          # in frontmatter only, NOT rendered on page
galleryAlt:                          # one per gallery image, index-matched
  - "Descriptive alt for photo 1"
  - "Descriptive alt for photo 2"
faqs:                                # schema-only, NOT visible on page
  - q: "Question?"
    a: "Answer."
```

### Event MD
```yaml
title: "Event Name"
seoTitle: "Event Name 2026 — Zionsville, Indiana"
description: "Brief summary."
eventType: dated | recurring | annual | oneoff
startDate: "2026-MM-DD"
endDate: "2026-MM-DD"
recurrence:                          # for weekly events only
  pattern: weekly
  dayOfWeek: thursday
  startSeason: "2026-MM-DD"
  endSeason: "2026-MM-DD"
location: "Venue Name"
address: "Street, Zionsville, IN 46077"
image: /images/events/{slug}.jpg
imageAlt: "..."
photoCredit: "© ZionsvilleIndiana.com"   # or other
photoCreditHeroOnly: true
featured: true                       # appears on /events
externalUrl: "https://..."           # renders "More info" in info strip
metaTitle: "..."
metaDescription: "..." (under 160 chars)
faqs:                                # schema-only
  - q: "..."
    a: "..."
mapEmbedUrl: "https://..."           # optional Google MyMap embed
mapTitle: "..."                      # accessibility title
```

---

## Site-name signal (CRITICAL — protect this)

Google reads site name from schema `name` fields. ALL of these must say **"Zionsville Indiana"**, NOT "ZionsvilleIndiana.com":

- `app/layout.tsx` — WebSite schema `name`
- `app/page.tsx` — Organization AND WebSite schema `name`
- `app/events/[slug]/page.tsx` — organizer Organization `name`
- `components/ArticleLayout.tsx` — publisher Organization `name`
- `lib/calendar.ts` — Organization `name`
- `components/layout/Footer.tsx` — visible brand text

`alternateName: 'ZionsvilleIndiana.com'` is intentional in WebSite/Organization schemas — don't remove.

**Leave alone (correctly use the domain):**
- All `https://zionsvilleindiana.com` URLs
- Footer copyright © line
- Photo credits in content MDs
- Legal page (disclaimer/privacy) body text
- `hello@zionsvilleindiana.com` email

---

## Image conventions

**Aspect ratios and sizes:**
- Event/business hero: 3:2, ~1200×800, WebP, ≤200KB
- Business gallery thumbnails: 4:3, ~900×675 (displays at ~440px in 2-up grid), WebP ~75%, ≤200KB
- Contained body images (downtown, event body): 3:2, full column width, rounded-lg, shadow-sm

**Filename conventions:**
- Business gallery: `/public/images/businesses/zionsville-{slug}-{1..4}.jpg`
- Event body gallery: `/public/images/events/gallery/zionsville-{event-slug}-{n}.{jpg|webp}`
- Event hero: `/public/images/events/{slug}.jpg`
- Downtown body: `/public/images/downtown/downtown-zionsville-{descriptor}.jpg`

**Gallery system (business pages):**
- Pure filename-driven, no frontmatter required for files themselves
- Template uses `fs.existsSync` — drop files in, they appear
- Mobile + desktop: 2 across (always)
- Placement: after body text, before parking section
- Alt text from `galleryAlt` frontmatter array (index-matched); falls back to generic if absent

---

## Tailwind / component conventions

### Info strip (events + businesses) — vertical definition rows
- Font: `font-mono` (JetBrains Mono), `leading-7`
- Label: weight 500, stone-500, uppercase NOT used (sentence case)
- Value: weight 600, stone-900
- In subtle box: `bg-stone-50 border border-stone-200 rounded-lg px-5 py-4 space-y-1`
- 3 rows (events: When/Where/More info) or 3 rows (businesses: Phone/Website/Hours)
- **DO NOT** render a "Listing verified" row on businesses (removed; data stays in frontmatter)

### Body links
- `rehype-external-links` configured in `lib/content.ts` — automatically adds `target="_blank"` and `rel="noopener noreferrer"` to all external links in MD body content
- No need to add manually to markdown links

### FAQ rendering
- `faqs` frontmatter → emits FAQ schema (JSON-LD), invisible
- Do NOT render visible FAQ sections (Cy's preference)

### Hero overlay pattern (event pages)
- Image with dark gradient overlay
- Breadcrumb top-left (light variant)
- Date label + H1 + location bottom-left
- Photo credit bottom-right with text-shadow

---

## Common pitfalls to avoid

1. **Self-closing `<iframe />`** in markdown. iframes MUST have explicit `<iframe>...</iframe>` close tag — self-closing breaks rendering by consuming all following content.

2. **JSX syntax in MD body.** Don't use `className`, `{/* JSX comments */}`, or self-closing void tags. Use HTML: `class`, `<!-- comments -->`, explicit close tags.

3. **Stale `.next` cache.** After font, layout, or Tailwind config changes:
   ```
   Remove-Item -Recurse -Force .next
   npm run dev
   ```
   Hard refresh browser (Ctrl+Shift+R).

4. **Tailwind classes referencing undefined colors** (e.g., importing JavaHatch config by mistake) generates no CSS, makes the entire page render unstyled.

5. **Multiple layout.tsx files** with `<html><body>` cause hydration mismatches. Only `app/layout.tsx` should wrap those tags.

6. **PowerShell, not bash.** Use `Remove-Item -Recurse -Force .next` not `rm -rf .next`.

---

## Active backlogs (high-level)

### Event MDs to build
GhostWalk (Oct 2–3), 80s Night (Sep 17), Gallery on Main (Oct 24), Teeny Tiny Art Market (Nov 20–Dec 19), Christmas in the Village umbrella (Nov 27–Dec 24).

### Articles infrastructure (not yet built)
Build `app/articles/page.tsx` (hub) + `app/articles/[slug]/page.tsx` (template using ArticleLayout) + add "Articles" to header nav. Type and content functions already exist.

### Coffee shops roundup (first article, after infrastructure)
Cover shops Cy has personally visited. Independent-forward, chains briefly noted. Zionsville-anchored (downtown + Michigan Rd/Whitestown), then lighter "nearby" (Carmel/Brownsburg/Lebanon). Link each to its business page where one exists.

### Other roundups planned
Best Brunch, Best Pizza, Where to Take Kids, Kids Sports & Activities.

### Major article priorities
Living in Zionsville, ZCS Schools, Indianapolis Day Trips, Newcomer's First Year, Big 4 Rail Trail (field research summer 2026).

### Interactive map (long-term)
Illustrated bird's-eye map of downtown, Nano Banana stylized over Bing aerial. Numbered pin overlay approach (8–15 anchor businesses) on a `/map` page. Multi-session project — prerequisite: upsized image + business MDs for pinned spots.

### Polish pass (next layout session)
- Vertical rhythm — reduce excessive `py-16` to `py-10/12`
- Consistent image treatment sitewide (3:2, rounded-lg, shadow-sm)
- Alt-text pass on all images (verify businesses via web_fetch before naming)

### Sponsorship strategy (Days 90–180+)
Target tiers: realtors, home builders (Tier 1), mortgage brokers + HVAC + Indy nonprofits + private schools (Tier 2). Year 1 realistic: $2–3K/mo from 3–5 sponsors. Editorial/sponsored separation is inviolable. Build `/partners` and `/disclosure` pages as outreach approaches.

---

## When in doubt

- **Ask for the file** rather than guessing
- **Propose the plan** for multi-file changes before editing
- **Verify external facts** via web_fetch before writing
- **Grep for banned phrases** before sending content
- **Skip the basics** — Cy knows them
