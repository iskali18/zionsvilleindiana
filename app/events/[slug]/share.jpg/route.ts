import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getEvent, getEventPageSlugs } from '@/lib/content'

/** /events/{slug}/share.jpg — the image Facebook, Messenger and other apps show
 *  when someone shares an event link.
 *
 *  Event photos are WebP, which Messenger does not show in link previews. This
 *  makes a 1200×630 JPG copy of the event's hero photo (the `image:` field) when
 *  the site builds, so nothing extra has to be made or uploaded. The crop
 *  follows the event's `hero_position`, so the share image frames the photo the
 *  same way the page's hero does. The event page points its share tags here,
 *  with the size included so Facebook can show the image on the very first share.
 *
 *  Built once per deploy for every event that has its own page. Card-only events
 *  (those with `linkTo`) have no page, so they get no share image. */

export const dynamic = 'force-static'
export const dynamicParams = false

/** Share-preview size. The event page's share tags repeat these numbers. */
const WIDTH = 1200
const HEIGHT = 630

/** Used if an event's photo can't be read or converted, so a missing or broken
 *  file never breaks the build. Already a 1200×630 JPG. */
const FALLBACK = '/images/og-default.jpg'

/** Matches the hero's default when an event sets no `hero_position`. */
const DEFAULT_POSITION = 'center 55%'

export function generateStaticParams() {
  return getEventPageSlugs().map((slug) => ({ slug }))
}

/** Reads an image from /public by its site path ("/images/events/x.webp"). */
function readPublic(sitePath: string): Promise<Buffer> {
  return readFile(path.join(process.cwd(), 'public', sitePath))
}

/** Turns a CSS object-position value ("center 40%", "top", "left 30%") into
 *  0–1 fractions for x and y. Anything it can't read counts as centered. */
function parsePosition(value: string): { x: number; y: number } {
  const KEYWORDS: Record<string, number> = { left: 0, top: 0, center: 0.5, right: 1, bottom: 1 }
  const read = (part: string | undefined): number => {
    if (!part) return 0.5
    if (part in KEYWORDS) return KEYWORDS[part]
    const pct = /^(-?\d+(?:\.\d+)?)%$/.exec(part)
    return pct ? Math.min(1, Math.max(0, Number(pct[1]) / 100)) : 0.5
  }
  const parts = value.trim().toLowerCase().split(/\s+/)
  // A single keyword names one axis: "top" means centered left to right.
  if (parts.length === 1 && (parts[0] === 'top' || parts[0] === 'bottom')) {
    return { x: 0.5, y: read(parts[0]) }
  }
  return { x: read(parts[0]), y: read(parts[1]) }
}

/** The JPG, or null if the photo can't be read or converted. */
async function makeJpg(sitePath: string, position: string): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default
    // Straighten phone photos and give transparent areas a white background.
    const prepared = sharp(await readPublic(sitePath)).rotate().flatten({ background: '#ffffff' })
    const info = await prepared.clone().metadata()
    // Orientations 5–8 are turned sideways, so .rotate() swaps width and height.
    const sideways = (info.orientation ?? 1) >= 5
    const width = (sideways ? info.height : info.width) ?? 0
    const height = (sideways ? info.width : info.height) ?? 0
    if (!width || !height) return null

    // Scale so the photo covers 1200×630, then cut the frame out at the same
    // spot the hero shows.
    const scale = Math.max(WIDTH / width, HEIGHT / height)
    const scaledW = Math.round(width * scale)
    const scaledH = Math.round(height * scale)
    const { x, y } = parsePosition(position)

    return await prepared
      .resize(scaledW, scaledH)
      .extract({
        left: Math.round((scaledW - WIDTH) * x),
        top: Math.round((scaledH - HEIGHT) * y),
        width: WIDTH,
        height: HEIGHT,
      })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer()
  } catch {
    return null
  }
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { meta } = await getEvent(slug)

  const jpg =
    (meta.image && (await makeJpg(meta.image, meta.hero_position ?? DEFAULT_POSITION))) ||
    (await readPublic(FALLBACK))

  return new Response(new Uint8Array(jpg), {
    headers: { 'Content-Type': 'image/jpeg' },
  })
}
