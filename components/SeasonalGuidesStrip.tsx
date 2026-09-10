import Link from 'next/link'
import { activeGuides, labelFor, type StripKind } from '@/lib/seasonal-guides'

interface Props {
  /** What kind of page this is. Picks the lead-in text for whichever season is
   *  live, so no page hardcodes a season word. */
  kind?: StripKind
  /** Container treatment. 'amber' stands out against white cards; 'plain'
   *  keeps the strip quiet next to a page's own amber block, so the two do not
   *  read as competing boxes; 'bare' drops the box entirely and reads as
   *  secondary navigation rather than a callout. */
  tone?: 'amber' | 'plain' | 'bare'
  /** Overrides the season label outright. Rarely needed. */
  label?: string
  /** Extra classes on the wrapper, for pages that need different spacing. */
  className?: string
}

/** Links to whichever seasonal guides are in season today.
 *
 *  Renders nothing when no guide is active, so it needs no seasonal
 *  maintenance on the pages that use it — the windows in lib/seasonal-guides.ts
 *  decide what shows and when.
 */
const TONES = {
  amber: 'bg-amber-50/70 border border-amber-100 rounded-lg px-6 py-4',
  plain: 'bg-white border border-stone-200 rounded-lg px-6 py-4',
  bare: 'border-t border-stone-200 pt-4',
}

export default function SeasonalGuidesStrip({
  kind = 'listing',
  tone = 'amber',
  label,
  className = 'my-6',
}: Props) {
  // Indianapolis time so the strip turns over locally rather than in UTC.
  const guides = activeGuides(
    new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Indiana/Indianapolis' }))
  )

  if (guides.length === 0) return null

  const heading = label ?? labelFor(guides, kind)

  const links = guides.map((g) => (
    <Link
      key={g.href}
      href={g.href}
      className="font-medium text-brick-600 hover:text-brick-700 whitespace-nowrap"
    >
      {g.title} →
    </Link>
  ))

  /* 'bare' stacks the label above the links and separates them with middots,
     so the block reads as secondary navigation rather than a callout. The
     boxed tones keep the label and links on one line. */
  if (tone === 'bare') {
    return (
      <div className={`${className} ${TONES.bare} not-prose print:hidden`}>
        <p className="m-0 text-sm font-semibold text-stone-800">{heading}</p>
        <p className="m-0 mt-1 text-sm">
          {links.map((link, i) => (
            <span key={guides[i].href}>
              {i > 0 && <span className="mx-2 text-stone-300">·</span>}
              {link}
            </span>
          ))}
        </p>
      </div>
    )
  }

  return (
    <div className={`${className} ${TONES[tone]} not-prose print:hidden`}>
      <div className="flex flex-col gap-x-6 gap-y-2.5 sm:flex-row sm:items-baseline">
        <p className="m-0 shrink-0 text-sm font-semibold text-stone-800">{heading}</p>
        <p className="m-0 flex flex-wrap gap-x-6 gap-y-2.5 text-sm">{links}</p>
      </div>
    </div>
  )
}
