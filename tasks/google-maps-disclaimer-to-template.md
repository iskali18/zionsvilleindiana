# Task: Move Google Maps hours disclaimer to template

## Goal
Stop the repeated "Check current hours on its Google Maps listing before visiting" sentence from appearing in every business MD. Move it to the businesses/[slug]/page.tsx template so it renders automatically, then strip the boilerplate from each MD.

## Why
- The same line appears verbatim in 14+ business MDs and creates "boilerplate fatigue" for users browsing multiple businesses.
- Architecturally, it's a standing disclaimer that applies to every business with a googleMapsUrl, not content about the business itself.
- One source of truth = easier maintenance long-term.

## Step 1: Update the template

Edit `app/businesses/[slug]/page.tsx`. After the `contentHtml` div (around line 165–170, where the markdown body renders) and BEFORE the bottom gallery block, add a small visually-distinct disclaimer that renders only if `meta.googleMapsUrl` is present.

Suggested implementation:

```tsx
{meta.googleMapsUrl && (
  <p className="text-sm text-stone-500 italic mb-8 pt-2">
    Hours can change — check the{' '}
    <a
      href={meta.googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-brick-600 hover:text-brick-700 underline"
    >
      Google Maps listing
    </a>
    {' '}for the latest.
  </p>
)}
```

Styling: small (text-sm), muted gray (text-stone-500), italic, with subtle visual breathing room (mb-8 pt-2). The link uses the brick accent and underline so it's obvious it's clickable. This visually separates it from the prose body.

Position: AFTER the body prose, BEFORE the bottom gallery photos block (the `galleryImages.length > 1` block).

## Step 2: Strip the boilerplate from all business MDs

In `content/businesses/`, remove the "Check current hours on its Google Maps listing before visiting" sentence (and its variations) from every MD's "Planning your visit" section.

Search-and-replace patterns to look for (case-insensitive, may have minor variations):
- "Check the current hours on its Google Maps listing before visiting."
- "Check current hours on its Google Maps listing before visiting."
- "Check the current hours on its [Google Maps listing](...) before visiting."
- "Hours can change seasonally or around holidays — check the current hours on its [Google Maps listing](...) before planning a visit."

What to keep: the rest of the "Planning your visit" section (address, neighborhood context, related details). If after stripping the Google Maps line the section is just one short sentence, consider merging it back into the prior paragraph or removing the H2 entirely.

What to remove: just the Google Maps hours sentence. Other Google Maps links in the body (e.g. "see the Map link") are fine.

## Files to update (15 business MDs as of session end)

Dining:
- auberge.md
- bakers-house.md
- bubs-burgers.md
- friendly-tavern.md
- gables-bagels.md
- my-sugar-pie.md
- our-place-coffee.md (if it has the line)
- rosies-place.md
- rush-on-main.md

Shopping:
- brick-street-bridal.md
- curious-squirrel-bookshop.md
- duo-boutique.md
- frances-parke.md
- gifted.md
- vintage-charm.md

Plus any other business MDs in content/businesses/ that have the line.

## After editing

1. Spot-check 2-3 business pages in dev (`npm run dev`) to confirm:
   - The new disclaimer line appears after the body, before any bottom gallery photos
   - The line is visually distinct (italic, muted, small)
   - The link works and opens in a new tab
   - The body prose reads naturally without the removed sentence

2. If any MD's "Planning your visit" section is now just a one-liner (e.g. only the address), consider whether to:
   - Keep the H2 with the one line
   - Merge the address into the previous paragraph
   - Remove the H2 entirely

Use judgment per-MD; no universal rule.

## Edge cases

- **MDs without googleMapsUrl** (if any) — the disclaimer won't render, which is correct behavior.
- **MDs that link to Google Maps elsewhere in the body** (e.g. Rosie's Place has `[Google Maps listing](...)` inline) — leave those alone, they serve a different purpose.

## After this task

Update CLAUDE.md to remove the instruction to add the "Check Google Maps for hours" line in new MDs. Add a note that the disclaimer is now template-rendered automatically when `googleMapsUrl` is set in frontmatter.
